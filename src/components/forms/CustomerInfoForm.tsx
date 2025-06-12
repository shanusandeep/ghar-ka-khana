import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { customersApi } from '@/services/api'
import { Customer } from '@/config/supabase'
import { useToast } from '@/hooks/use-toast'

interface CustomerInfoFormProps {
  customerName: string
  setCustomerName: (name: string) => void
  customerPhone: string
  setCustomerPhone: (phone: string) => void
  existingCustomer: Customer | null
  setExistingCustomer: (customer: Customer | null) => void
}

const CustomerInfoForm = ({
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  existingCustomer,
  setExistingCustomer
}: CustomerInfoFormProps) => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false)
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    phone: '',
    email: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      const data = await customersApi.getAll()
      setCustomers(data)
    } catch (error) {
      console.error('Error loading customers:', error)
    }
  }

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId)
    if (customer) {
      setExistingCustomer(customer)
      setCustomerName(customer.name)
      setCustomerPhone(customer.phone)
    }
  }

  const handleCreateNewCustomer = async () => {
    try {
      if (!newCustomerData.name || !newCustomerData.phone) {
        toast({
          title: "Error",
          description: "Name and phone are required",
          variant: "destructive"
        })
        return
      }

      const customer = await customersApi.create({
        name: newCustomerData.name,
        phone: newCustomerData.phone,
        email: newCustomerData.email || undefined
      })

      setExistingCustomer(customer)
      setCustomerName(customer.name)
      setCustomerPhone(customer.phone)
      
      await loadCustomers()
      setIsNewCustomerOpen(false)
      setNewCustomerData({ name: '', phone: '', email: '' })
      
      toast({
        title: "Success",
        description: "Customer created successfully"
      })
    } catch (error) {
      console.error('Error creating customer:', error)
      toast({
        title: "Error",
        description: "Failed to create customer",
        variant: "destructive"
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="customer-select">Select Customer</Label>
          <div className="flex space-x-2">
            <Select onValueChange={handleCustomerSelect}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Choose existing customer or add new" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="px-3">
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Customer</DialogTitle>
                  <DialogDescription>Add a new customer to the database for future orders</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="new-customer-name">Name *</Label>
                    <Input
                      id="new-customer-name"
                      value={newCustomerData.name}
                      onChange={(e) => setNewCustomerData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-customer-phone">Phone *</Label>
                    <Input
                      id="new-customer-phone"
                      value={newCustomerData.phone}
                      onChange={(e) => setNewCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-customer-email">Email (Optional)</Label>
                    <Input
                      id="new-customer-email"
                      type="email"
                      value={newCustomerData.email}
                      onChange={(e) => setNewCustomerData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                    />
                  </div>
                  <Button onClick={handleCreateNewCustomer} className="w-full">
                    Create Customer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {existingCustomer && (
            <Badge className="mt-2 bg-green-100 text-green-800">
              Selected: {existingCustomer.name} - {existingCustomer.phone}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default CustomerInfoForm
