import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

  const searchCustomers = async (query: string) => {
    setSearchQuery(query)
    
    // Always ensure we have all customers loaded for search
    if (customers.length === 0) {
      try {
        const data = await customersApi.getAll()
        const sortedCustomers = data.sort((a, b) => a.name.localeCompare(b.name))
        setCustomers(sortedCustomers)
      } catch (error) {
        console.error('Error loading customers for search:', error)
      }
    }
  }

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId)
    if (customer) {
      setExistingCustomer(customer)
      setCustomerName(customer.name)
      setCustomerPhone(customer.phone)
      setIsCustomerSelectorOpen(false)
      setSearchQuery('')
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
      
      await loadTopCustomers()
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
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Customer Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label htmlFor="customer-select">Select Customer</Label>
          <div className="flex space-x-2">
            <Popover open={isCustomerSelectorOpen} onOpenChange={setIsCustomerSelectorOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isCustomerSelectorOpen}
                  className="flex-1 justify-between"
                >
                  {existingCustomer
                    ? `${existingCustomer.name} - ${existingCustomer.phone}`
                    : "Choose existing customer"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search customers by name or phone..."
                    onValueChange={searchCustomers}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {searchQuery ? "No customers found." : "Start typing to search customers..."}
                    </CommandEmpty>
                    <CommandGroup heading={searchQuery ? `Found ${filteredCustomers.length} customers` : "Recent customers (top 5)"}>
                      {filteredCustomers.map((customer) => (
                        <CommandItem
                          key={customer.id}
                          value={`${customer.name} ${customer.phone}`}
                          onSelect={() => handleCustomerSelect(customer.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              existingCustomer?.id === customer.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{customer.name}</span>
                            <span className="text-sm text-gray-500">{customer.phone}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
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
                  <Button onClick={handleCreateNewCustomer} className="w-full">
                    Create Customer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {existingCustomer && (
            <div className="mt-2 flex items-center justify-between">
              <Badge className="bg-green-100 text-green-800">
                Selected: {existingCustomer.name} - {existingCustomer.phone}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setExistingCustomer(null)
                  setCustomerName('')
                  setCustomerPhone('')
                  setSearchQuery('')
                }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default CustomerInfoForm
