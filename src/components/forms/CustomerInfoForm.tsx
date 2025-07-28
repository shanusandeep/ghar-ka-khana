import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Plus, Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
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
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isCustomerSelectorOpen, setIsCustomerSelectorOpen] = useState(false)
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false)
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    phone: '',
    email: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    loadTopCustomers()
  }, [])

  useEffect(() => {
    // Filter customers based on search query
    if (searchQuery.trim() === '') {
      // Show top 5 customers when no search query
      setFilteredCustomers(customers.slice(0, 5))
    } else {
      // Filter customers by name or phone
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
      ).slice(0, 10) // Limit to 10 results
      setFilteredCustomers(filtered)
    }
  }, [searchQuery, customers])

  const loadTopCustomers = async () => {
    try {
      const data = await customersApi.getAll()
      // Sort by most recent orders or alphabetically
      const sortedCustomers = data.sort((a, b) => a.name.localeCompare(b.name))
      setCustomers(sortedCustomers)
      setFilteredCustomers(sortedCustomers.slice(0, 5)) // Show top 5 by default
    } catch (error) {
      console.error('Error loading customers:', error)
    }
  }

  const selectCustomer = (customer: Customer) => {
    setExistingCustomer(customer)
    setCustomerName(customer.name)
    setCustomerPhone(customer.phone)
    setIsCustomerSelectorOpen(false)
  }

  const clearCustomerSelection = () => {
    setExistingCustomer(null)
    setCustomerName('')
    setCustomerPhone('')
  }

  const createNewCustomer = async () => {
    if (!newCustomerData.name.trim() || !newCustomerData.phone.trim()) {
      toast({
        title: "Error",
        description: "Name and phone are required",
        variant: "destructive"
      })
      return
    }

    try {
      const newCustomer = await customersApi.create({
        name: newCustomerData.name.trim(),
        phone: newCustomerData.phone.trim(),
        email: newCustomerData.email.trim() || undefined
      })

      selectCustomer(newCustomer)
      setNewCustomerData({ name: '', phone: '', email: '' })
      setIsNewCustomerOpen(false)
      loadTopCustomers() // Refresh the customer list
      
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
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Customer Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label>Customer</Label>
          <div className="flex items-center space-x-2 mt-1">
            <Popover open={isCustomerSelectorOpen} onOpenChange={setIsCustomerSelectorOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isCustomerSelectorOpen}
                  className="flex-1 justify-between"
                >
                  {existingCustomer ? existingCustomer.name : "Select customer..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-full">
                <Command>
                  <CommandInput 
                    placeholder="Search customers..." 
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandEmpty>No customer found.</CommandEmpty>
                  <CommandGroup>
                    <CommandList>
                      {filteredCustomers.map((customer) => (
                        <CommandItem
                          key={customer.id}
                          value={customer.id}
                          onSelect={() => selectCustomer(customer)}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              existingCustomer?.id === customer.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.phone}</div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandList>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

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
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsNewCustomerOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={createNewCustomer}>
                    Create Customer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {existingCustomer && (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-green-100 text-green-800">Customer Selected</Badge>
              <div>
                <p className="font-medium text-green-900">{existingCustomer.name}</p>
                <p className="text-sm text-green-700">{existingCustomer.phone}</p>
              </div>
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={clearCustomerSelection}
              className="text-green-700 hover:text-green-900"
            >
              Change
            </Button>
          </div>
        )}

        {!existingCustomer && (
          <div className="text-center py-4 text-gray-500 text-sm">
            Please select a customer from the list above or add a new customer
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default CustomerInfoForm
