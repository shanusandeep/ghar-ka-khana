
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Phone, Mail, MapPin, Search } from 'lucide-react'
import { customersApi } from '@/services/api'
import { Customer } from '@/config/supabase'
import { useToast } from '@/hooks/use-toast'

const CustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredCustomers(filtered)
  }, [customers, searchTerm])

  const loadCustomers = async () => {
    try {
      const data = await customersApi.getAll()
      setCustomers(data)
    } catch (error) {
      console.error('Error loading customers:', error)
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCustomerSaved = () => {
    loadCustomers()
    setIsAddCustomerOpen(false)
    setEditingCustomer(null)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading customers...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Customer Management</h2>
          <p className="text-gray-600">Manage your customer database</p>
        </div>
        <Sheet open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
          <SheetTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add New Customer</SheetTitle>
              <SheetDescription>Create a new customer profile</SheetDescription>
            </SheetHeader>
            <CustomerForm onCustomerSaved={handleCustomerSaved} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search customers by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <div className="grid gap-4">
        {filteredCustomers.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                {searchTerm ? 'No customers found matching your search.' : 'No customers found. Add your first customer to get started.'}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredCustomers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{customer.name}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{customer.phone}</span>
                      </div>
                      {customer.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span>{customer.email}</span>
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{customer.address}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      Customer since {new Date(customer.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingCustomer(customer)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteCustomerId(customer.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Customer Sheet */}
      <Sheet open={!!editingCustomer} onOpenChange={() => setEditingCustomer(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Customer</SheetTitle>
            <SheetDescription>Update customer information</SheetDescription>
          </SheetHeader>
          {editingCustomer && (
            <CustomerForm 
              customer={editingCustomer} 
              onCustomerSaved={handleCustomerSaved} 
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Customer Dialog */}
      <Dialog open={!!deleteCustomerId} onOpenChange={() => setDeleteCustomerId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this customer? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-4 mt-4">
            <Button
              variant="destructive"
              onClick={async () => {
                if (deleteCustomerId) {
                  try {
                    // Note: We need to add delete method to customersApi
                    toast({
                      title: "Info",
                      description: "Delete functionality will be implemented soon"
                    })
                    setDeleteCustomerId(null)
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to delete customer",
                      variant: "destructive"
                    })
                  }
                }
              }}
            >
              Delete
            </Button>
            <Button variant="outline" onClick={() => setDeleteCustomerId(null)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface CustomerFormProps {
  customer?: Customer
  onCustomerSaved: () => void
}

const CustomerForm = ({ customer, onCustomerSaved }: CustomerFormProps) => {
  const [name, setName] = useState(customer?.name || '')
  const [phone, setPhone] = useState(customer?.phone || '')
  const [email, setEmail] = useState(customer?.email || '')
  const [address, setAddress] = useState(customer?.address || '')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const isEditing = !!customer

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !phone.trim()) {
      toast({
        title: "Error",
        description: "Name and phone are required",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const customerData = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined
      }

      if (isEditing) {
        // Note: We need to add update method to customersApi
        toast({
          title: "Info",
          description: "Update functionality will be implemented soon"
        })
      } else {
        await customersApi.create(customerData)
        toast({
          title: "Success",
          description: "Customer created successfully"
        })
      }
      
      onCustomerSaved()
    } catch (error) {
      console.error('Error saving customer:', error)
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} customer`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="customer-name">Name *</Label>
          <Input
            id="customer-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter customer name"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="customer-phone">Phone *</Label>
          <Input
            id="customer-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="customer-email">Email</Label>
          <Input
            id="customer-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
          />
        </div>
        
        <div>
          <Label htmlFor="customer-address">Address</Label>
          <Textarea
            id="customer-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter customer address"
            rows={3}
          />
        </div>
        
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Saving...' : (isEditing ? 'Update Customer' : 'Create Customer')}
        </Button>
      </form>
    </div>
  )
}

export default CustomerManagement
