
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
  deliveryAddress: string
  setDeliveryAddress: (address: string) => void
  existingCustomer: Customer | null
  setExistingCustomer: (customer: Customer | null) => void
}

const CustomerInfoForm = ({
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  deliveryAddress,
  setDeliveryAddress,
  existingCustomer,
  setExistingCustomer
}: CustomerInfoFormProps) => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false)
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    if (customerPhone.length >= 10) {
      checkExistingCustomer()
    }
  }, [customerPhone])

  const loadCustomers = async () => {
    try {
      const data = await customersApi.getAll()
      setCustomers(data)
    } catch (error) {
      console.error('Error loading customers:', error)
    }
  }

  const checkExistingCustomer = async () => {
    try {
      const customer = await customersApi.findByPhone(customerPhone)
      if (customer) {
        setExistingCustomer(customer)
        setCustomerName(customer.name)
        setDeliveryAddress(customer.address || '')
      } else {
        setExistingCustomer(null)
      }
    } catch (error) {
      console.error('Error checking customer:', error)
    }
  }

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId)
    if (customer) {
      setExistingCustomer(customer)
      setCustomerName(customer.name)
      setCustomerPhone(customer.phone)
      setDeliveryAddress(customer.address || '')
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
        email: newCustomerData.email || undefined,
        address: newCustomerData.address || undefined
      })

      setExistingCustomer(customer)
      setCustomerName(customer.name)
      setCustomerPhone(customer.phone)
      setDeliveryAddress(customer.address || '')
      
      await loadCustomers()
      setIsNewCustomerOpen(false)
      setNewCustomerData({ name: '', phone: '', email: '', address: '' })
      
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customer-select">Select Customer</Label>
            <div className="flex space-x-2">
              <Select onValueChange={handleCustomerSelect}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select existing customer" />
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
                  <Button type="button" variant="outline" size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Customer</DialogTitle>
                    <DialogDescription>Add a new customer to the database</DialogDescription>
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
                      <Label htmlFor="new-customer-email">Email</Label>
                      <Input
                        id="new-customer-email"
                        type="email"
                        value={newCustomerData.email}
                        onChange={(e) => setNewCustomerData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-customer-address">Address</Label>
                      <Textarea
                        id="new-customer-address"
                        value={newCustomerData.address}
                        onChange={(e) => setNewCustomerData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter address"
                        rows={2}
                      />
                    </div>
                    <Button onClick={handleCreateNewCustomer} className="w-full">
                      Create Customer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div>
            <Label htmlFor="customer-phone">Phone Number *</Label>
            <Input
              id="customer-phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Enter phone number"
              required
            />
            {existingCustomer && (
              <Badge className="mt-1 bg-green-100 text-green-800">
                Existing Customer
              </Badge>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="customer-name">Customer Name *</Label>
          <Input
            id="customer-name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name"
            required
          />
        </div>
        <div>
          <Label htmlFor="delivery-address">Delivery Address</Label>
          <Textarea
            id="delivery-address"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="Enter delivery address"
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default CustomerInfoForm
