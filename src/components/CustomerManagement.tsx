import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Plus, Edit, Trash2, Phone, Mail, User, Search, MapPin } from 'lucide-react'
import { customersApi, ordersApi } from '@/services/api'
import { Customer } from '@/config/supabase'
import { useToast } from '@/hooks/use-toast'
import CustomerOrderHistory from './CustomerOrderHistory'
import ConfirmationDialog from './ConfirmationDialog'

const CustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  })

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    if (editingCustomer) {
      setFormData({
        name: editingCustomer.name || '',
        phone: editingCustomer.phone || '',
        email: editingCustomer.email || '',
        address: editingCustomer.address || ''
      })
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: ''
      })
    }
  }, [editingCustomer])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.phone) {
      toast({
        title: "Error",
        description: "Name and phone are required",
        variant: "destructive"
      })
      return
    }

    try {
      if (editingCustomer) {
        await customersApi.update(editingCustomer.id, formData)
        toast({
          title: "Success",
          description: "Customer updated successfully"
        })
      } else {
        await customersApi.create(formData)
        toast({
          title: "Success",
          description: "Customer created successfully"
        })
      }
      
      await loadCustomers()
      setIsNewCustomerOpen(false)
      setEditingCustomer(null)
      setFormData({ name: '', phone: '', email: '', address: '' })
    } catch (error) {
      console.error('Error saving customer:', error)
      toast({
        title: "Error",
        description: `Failed to ${editingCustomer ? 'update' : 'create'} customer`,
        variant: "destructive"
      })
    }
  }

  const deleteCustomer = async () => {
    if (!deletingCustomer) return

    setDeleteLoading(true)
    try {
      await customersApi.delete(deletingCustomer.id)
      await loadCustomers()
      setDeletingCustomer(null)
      toast({
        title: "Success",
        description: "Customer deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive"
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Customer Management</h2>
          <p className="text-gray-600 text-sm sm:text-base">Manage customer information and order history</p>
        </div>
        <Button onClick={() => setIsNewCustomerOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, phone, or email..."
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
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-5 h-5 text-gray-400" />
                      <h3 className="text-lg font-semibold">{customer.name}</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a 
                          href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 hover:underline transition-colors"
                        >
                          {customer.phone}
                        </a>
                      </div>
                      
                      {customer.email && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <a 
                            href={`mailto:${customer.email}`}
                            className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                          >
                            {customer.email}
                          </a>
                        </div>
                      )}
                      
                      {customer.address && (
                        <div className="flex items-start space-x-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{customer.address}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-3">
                      Customer since {new Date(customer.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <CustomerOrderHistory customer={customer} />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingCustomer(customer)}
                      className="flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDeletingCustomer(customer)}
                      className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Customer Sheet */}
      <Sheet open={isNewCustomerOpen || !!editingCustomer} onOpenChange={(open) => {
        if (!open) {
          setIsNewCustomerOpen(false)
          setEditingCustomer(null)
        }
      }}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</SheetTitle>
            <SheetDescription>
              {editingCustomer ? 'Update customer information' : 'Enter customer details to add them to your database'}
            </SheetDescription>
          </SheetHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Customer name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Phone number"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email address"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Customer address"
              />
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button type="submit" className="flex-1">
                {editingCustomer ? 'Update Customer' : 'Add Customer'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsNewCustomerOpen(false)
                  setEditingCustomer(null)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Customer Confirmation */}
      <ConfirmationDialog
        open={!!deletingCustomer}
        onOpenChange={() => setDeletingCustomer(null)}
        title="Delete Customer"
        description={
          <div>
            Are you sure you want to delete <strong>{deletingCustomer?.name}</strong>?
            <br />
            <span className="text-sm text-gray-600">
              This action cannot be undone. All customer data will be permanently removed.
            </span>
          </div>
        }
        confirmText="Delete Customer"
        onConfirm={deleteCustomer}
        destructive={true}
        loading={deleteLoading}
      />
    </div>
  )
}

export default CustomerManagement
