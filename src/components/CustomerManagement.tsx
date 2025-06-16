import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, Phone, Mail, User, Search, MapPin, DollarSign, Filter, X } from 'lucide-react'
import { customersApi, ordersApi } from '@/services/api'
import { Customer } from '@/config/supabase'
import { useToast } from '@/hooks/use-toast'
import CustomerOrderHistory from './CustomerOrderHistory'
import ConfirmationDialog from './ConfirmationDialog'

interface CustomerWithTotals extends Customer {
  total_order_value?: number
  order_count?: number
}

const CustomerManagement = () => {
  const [customers, setCustomers] = useState<CustomerWithTotals[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('total_order_value')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [minOrderValue, setMinOrderValue] = useState('')
  const [minOrderCount, setMinOrderCount] = useState('')
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<CustomerWithTotals | null>(null)
  const [deletingCustomer, setDeletingCustomer] = useState<CustomerWithTotals | null>(null)
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
      const data = await customersApi.getAllWithOrderTotals()
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

  const clearFilters = () => {
    setSearchTerm('')
    setSortBy('total_order_value')
    setSortOrder('desc')
    setMinOrderValue('')
    setMinOrderCount('')
  }

  const handleSortOrderChange = (value: string) => {
    setSortOrder(value as 'asc' | 'desc')
  }

  const getFilteredAndSortedCustomers = () => {
    let filtered = customers.filter(customer => {
      // Search filter
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))

      // Order value filter
      const matchesOrderValue = !minOrderValue || (customer.total_order_value || 0) >= Number(minOrderValue)

      // Order count filter
      const matchesOrderCount = !minOrderCount || (customer.order_count || 0) >= Number(minOrderCount)

      return matchesSearch && matchesOrderValue && matchesOrderCount
    })

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'created_at':
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
          break
        case 'total_order_value':
          aValue = a.total_order_value || 0
          bValue = b.total_order_value || 0
          break
        case 'order_count':
          aValue = a.order_count || 0
          bValue = b.order_count || 0
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }

  const filteredCustomers = getFilteredAndSortedCustomers()
  const hasActiveFilters = minOrderValue || minOrderCount || searchTerm || sortBy !== 'total_order_value' || sortOrder !== 'desc'

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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Customer Management</h2>
          <p className="text-gray-600 text-sm sm:text-base">Manage customer information and order history</p>
        </div>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters & Sort</h4>
                  {hasActiveFilters && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Sort By */}
                  <div className="space-y-2">
                    <Label>Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="created_at">Date Added</SelectItem>
                        <SelectItem value="total_order_value">Total Spent</SelectItem>
                        <SelectItem value="order_count">Order Count</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Order */}
                  <div className="space-y-2">
                    <Label>Order</Label>
                    <Select value={sortOrder} onValueChange={handleSortOrderChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Min Order Value Filter */}
                <div className="space-y-2">
                  <Label>Min Total Spent (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                  />
                </div>

                {/* Min Order Count Filter */}
                <div className="space-y-2">
                  <Label>Min Order Count</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={minOrderCount}
                    onChange={(e) => setMinOrderCount(e.target.value)}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button onClick={() => setIsNewCustomerOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Add Customer</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Customer Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredCustomers.length}</div>
            <div className="text-sm text-gray-600">
              {filteredCustomers.length === customers.length ? 'Total Customers' : `Filtered Customers (${customers.length} total)`}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              ₹{filteredCustomers.reduce((sum, customer) => sum + (customer.total_order_value || 0), 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Revenue (Filtered)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              ₹{filteredCustomers.length > 0 ? (filteredCustomers.reduce((sum, customer) => sum + (customer.total_order_value || 0), 0) / filteredCustomers.length).toFixed(2) : '0.00'}
            </div>
            <div className="text-sm text-gray-600">Avg. Customer Value</div>
          </CardContent>
        </Card>
      </div>

      {/* Customers List */}
      <div className="grid gap-4">
        {filteredCustomers.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                {searchTerm || minOrderValue || minOrderCount ? 'No customers found matching your filters.' : 'No customers found. Add your first customer to get started.'}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredCustomers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-5 h-5 text-gray-400" />
                      <h3 className="text-lg font-semibold">{customer.name}</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <a 
                          href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 hover:underline transition-colors break-all"
                        >
                          {customer.phone}
                        </a>
                      </div>
                      
                      {customer.email && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <a 
                            href={`mailto:${customer.email}`}
                            className="text-blue-600 hover:text-blue-700 hover:underline transition-colors break-all"
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

                      {/* Order Statistics */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm pt-2 border-t border-gray-100">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span className="font-medium text-green-600">
                            ₹{customer.total_order_value?.toFixed(2) || '0.00'}
                          </span>
                          <span className="text-gray-500">total spent</span>
                        </div>
                        <div className="text-gray-500">
                          {customer.order_count || 0} orders
                        </div>
                      </div>
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
