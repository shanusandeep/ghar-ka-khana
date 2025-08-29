import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Plus, Check, ChevronsUpDown, Calendar, Clock, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { customersApi } from '@/services/api'
import { Customer } from '@/config/supabase'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface CustomerDeliveryFormProps {
  customerName: string
  setCustomerName: (name: string) => void
  customerPhone: string
  setCustomerPhone: (phone: string) => void
  existingCustomer: Customer | null
  setExistingCustomer: (customer: Customer | null) => void
  deliveryDate: string
  setDeliveryDate: (date: string) => void
  deliveryTime: string
  setDeliveryTime: (time: string) => void
  specialInstructions: string
  setSpecialInstructions: (instructions: string) => void
}

const CustomerDeliveryForm = ({
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  existingCustomer,
  setExistingCustomer,
  deliveryDate,
  setDeliveryDate,
  deliveryTime,
  setDeliveryTime,
  specialInstructions,
  setSpecialInstructions
}: CustomerDeliveryFormProps) => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isCustomerSelectorOpen, setIsCustomerSelectorOpen] = useState(false)
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false)
  const [showDeliveryTime, setShowDeliveryTime] = useState(false)
  const [showSpecialInstructions, setShowSpecialInstructions] = useState(false)
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
      // Show top 15 customers when no search query
      setFilteredCustomers(customers.slice(0, 15))
    } else {
      // Filter customers by name or phone
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
      ).slice(0, 15) // Limit to 15 results
      setFilteredCustomers(filtered)
    }
  }, [searchQuery, customers])

  // Show delivery time if there's an existing value
  useEffect(() => {
    if (deliveryTime && deliveryTime.trim() !== '') {
      setShowDeliveryTime(true)
    }
  }, [deliveryTime])

  // Show special instructions if there are existing instructions
  useEffect(() => {
    if (specialInstructions && specialInstructions.trim() !== '') {
      setShowSpecialInstructions(true)
    }
  }, [specialInstructions])

  const loadTopCustomers = async () => {
    try {
      const data = await customersApi.getAll()
      setCustomers(data || [])
      setFilteredCustomers((data || []).slice(0, 15))
    } catch (error) {
      console.error('Error loading customers:', error)
    }
  }

  const createNewCustomer = async () => {
    if (!newCustomerData.name || !newCustomerData.phone) {
      toast({
        title: "Error",
        description: "Name and phone are required",
        variant: "destructive"
      })
      return
    }

    try {
      const newCustomer = await customersApi.create(newCustomerData)
      setCustomers(prev => [newCustomer, ...prev])
      setExistingCustomer(newCustomer)
      setCustomerName(newCustomer.name)
      setCustomerPhone(newCustomer.phone)
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

  const clearCustomerSelection = () => {
    setExistingCustomer(null)
    setCustomerName('')
    setCustomerPhone('')
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Customer & Delivery Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer and Delivery in a responsive grid - optimized for Family Hub and Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Customer Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Customer</Label>
            </div>
            
            <div className="flex gap-2">
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
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search customers..." 
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>No customer found.</CommandEmpty>
                      <CommandGroup>
                        {filteredCustomers.map((customer) => (
                          <CommandItem
                            key={customer.id}
                            value={customer.name}
                            onSelect={() => {
                              setExistingCustomer(customer)
                              setCustomerName(customer.name)
                              setCustomerPhone(customer.phone)
                              setIsCustomerSelectorOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                existingCustomer?.id === customer.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{customer.name}</span>
                              <span className="text-xs text-gray-500">{customer.phone}</span>
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
              <div className="text-center py-2 text-gray-500 text-xs">
                {customers.length === 0 ? (
                  <div>
                    <p>No customers found in database.</p>
                    <p className="mt-1">Use the "Add" button to create your first customer.</p>
                  </div>
                ) : (
                  <p>Please select a customer from the list above or add a new customer</p>
                )}
              </div>
            )}
          </div>

          {/* Delivery Section - Collapsible */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Delivery</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowDeliveryTime(!showDeliveryTime)}
                className="text-blue-600 hover:text-blue-700 p-0 h-auto text-xs"
              >
                {showDeliveryTime ? 'Hide Options' : 'Show Options'}
              </Button>
            </div>
            
            {/* Default Today Display */}
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Today</p>
                  <p className="text-sm text-blue-700">{deliveryDate ? format(new Date(deliveryDate), 'PPP') : 'Not set'}</p>
                </div>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-700 hover:text-blue-900"
                  >
                    Change Date
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="single"
                    selected={deliveryDate ? new Date(deliveryDate) : undefined}
                    onSelect={(date) => setDeliveryDate(date ? format(date, 'yyyy-MM-dd') : '')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Collapsible Delivery Options */}
            {showDeliveryTime && (
              <div className="space-y-3 pt-3 border-t border-blue-200">
                {/* Delivery Time */}
                <div className="space-y-2">
                  <Label className="text-sm">Delivery Time</Label>
                  <Input
                    type="time"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="w-full"
                    placeholder="Select time"
                  />
                </div>

                {/* Special Instructions */}
                <div className="space-y-2">
                  <Label className="text-sm">Special Instructions</Label>
                  <Textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Any special instructions for this order..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CustomerDeliveryForm
