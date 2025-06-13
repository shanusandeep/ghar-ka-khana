import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Phone, Mail, MapPin, Search, ArrowLeft, Eye, Calendar, Clock, Package, ShoppingBag } from 'lucide-react'
import { customersApi, ordersApi } from '@/services/api'
import { Customer, Order, OrderItem } from '@/config/supabase'
import { useToast } from '@/hooks/use-toast'

// Extended Order type that includes order_items
interface OrderWithItems extends Order {
  order_items?: OrderItem[]
}

const CustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerOrders, setCustomerOrders] = useState<OrderWithItems[]>([])
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [customerOrderCounts, setCustomerOrderCounts] = useState<Record<string, number>>({})
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
      // Load order counts for all customers
      await loadCustomerOrderCounts(data)
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

  const loadCustomerOrderCounts = async (customers: Customer[]) => {
    try {
      // Get all orders to count by customer
      const allOrders = await ordersApi.getAll()
      const counts: Record<string, number> = {}
      
      // Initialize counts for all customers
      customers.forEach(customer => {
        counts[customer.id] = 0
      })
      
      // Count orders for each customer
      allOrders.forEach(order => {
        if (order.customer_id && counts.hasOwnProperty(order.customer_id)) {
          counts[order.customer_id]++
        }
      })
      
      setCustomerOrderCounts(counts)
    } catch (error) {
      console.error('Error loading customer order counts:', error)
    }
  }

  const loadCustomerOrders = async (customerId: string) => {
    setOrdersLoading(true)
    try {
      const orders = await ordersApi.getByCustomerId(customerId)
      setCustomerOrders(orders)
    } catch (error) {
      console.error('Error loading customer orders:', error)
      toast({
        title: "Error",
        description: "Failed to load customer orders",
        variant: "destructive"
      })
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleCustomerClick = async (customer: Customer) => {
    setSelectedCustomer(customer)
    await loadCustomerOrders(customer.id)
  }

  const handleBackToCustomers = () => {
    setSelectedCustomer(null)
    setCustomerOrders([])
    setSelectedOrder(null)
  }

  const handleOrderClick = (order: OrderWithItems) => {
    setSelectedOrder(order)
  }

  const handleBackToOrders = () => {
    setSelectedOrder(null)
  }

  const handleCustomerSaved = () => {
    loadCustomers()
    setIsAddCustomerOpen(false)
    setEditingCustomer(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-yellow-100 text-yellow-800'
      case 'delivered': return 'bg-blue-100 text-blue-800'
      case 'paid': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    })
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

  // Order Details View
  if (selectedOrder) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBackToOrders}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
          <div>
            <h2 className="text-xl font-bold">Order #{selectedOrder.order_number}</h2>
            <p className="text-gray-600">Order details for {selectedCustomer?.name}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Order Header */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="space-y-1 flex-1">
                <h3 className="text-lg font-bold">{selectedOrder.customer_name}</h3>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{selectedOrder.customer_phone}</span>
                </div>
                {selectedOrder.delivery_address && (
                  <div className="flex items-start space-x-1 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{selectedOrder.delivery_address}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-start sm:items-end gap-2">
                <Badge className={`${getStatusColor(selectedOrder.status)} w-fit`}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </Badge>
                <div className="text-sm text-gray-600 text-left sm:text-right space-y-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatDate(selectedOrder.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Delivery {formatDate(selectedOrder.delivery_date)}</span>
                    {selectedOrder.delivery_time && (
                      <>
                        <Clock className="w-4 h-4 ml-1" />
                        <span>{selectedOrder.delivery_time}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base">
                <Package className="w-4 h-4" />
                <span>Order Items</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                <div className="space-y-3">
                  {selectedOrder.order_items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.item_name}</h4>
                        <p className="text-sm text-gray-600">
                          Size: {item.size_type.replace('_', ' ').charAt(0).toUpperCase() + item.size_type.replace('_', ' ').slice(1)}
                        </p>
                        {item.special_instructions && (
                          <p className="text-sm text-gray-600 mt-1">
                            Instructions: {item.special_instructions}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Qty: {item.quantity}</p>
                        <p className="text-sm text-gray-600">${item.unit_price} each</p>
                        <p className="font-semibold text-green-600">${item.total_price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No items found for this order.</p>
              )}
            </CardContent>
          </Card>

          {/* Special Instructions */}
          {selectedOrder.special_instructions && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Special Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{selectedOrder.special_instructions}</p>
              </CardContent>
            </Card>
          )}

          {/* Order Total */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold">Total Amount</span>
                <span className="text-xl font-bold text-green-600">
                  ${selectedOrder.total_amount || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Customer Orders View
  if (selectedCustomer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBackToCustomers}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Customers
          </Button>
          <div>
            <h2 className="text-xl font-bold">{selectedCustomer.name}'s Orders</h2>
            <p className="text-gray-600">View all orders for this customer</p>
          </div>
        </div>

        {ordersLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">Loading orders...</div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {customerOrders.length === 0 ? (
              <div className="col-span-full">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center text-gray-500">
                      No orders found for this customer.
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              customerOrders.map((order) => (
                <Card 
                  key={order.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer group hover:scale-[1.02] duration-200"
                  onClick={() => handleOrderClick(order)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base flex items-center gap-2">
                          #{order.order_number}
                          <Eye className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </CardTitle>
                        <Badge className={`${getStatusColor(order.status)} text-xs`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(order.delivery_date)}</span>
                        {order.delivery_time && (
                          <>
                            <Clock className="w-3 h-3 ml-2" />
                            <span>{order.delivery_time}</span>
                          </>
                        )}
                      </div>
                      
                      {/* Order Items Preview */}
                      {order.order_items && order.order_items.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {order.order_items.slice(0, 2).map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-xs bg-gray-50 p-1 rounded">
                              <span className="truncate">{item.quantity}x {item.item_name}</span>
                              <span className="text-gray-600">${item.total_price}</span>
                            </div>
                          ))}
                          {order.order_items.length > 2 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{order.order_items.length - 2} more items
                            </div>
                          )}
                        </div>
                      )}

                      {order.total_amount && (
                        <div className="text-sm font-semibold text-green-600 mt-2">
                          ${order.total_amount}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    )
  }

  // Main Customers List View
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Customer Management</h2>
          <p className="text-gray-600 text-sm sm:text-base">Manage your customer database</p>
        </div>
        <Sheet open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
          <SheetTrigger asChild>
            <Button className="flex items-center space-x-2 w-full sm:w-auto">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  {searchTerm ? 'No customers found matching your search.' : 'No customers found. Add your first customer to get started.'}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <Card 
              key={customer.id} 
              className="hover:shadow-md transition-shadow cursor-pointer hover:scale-[1.02] duration-200"
              onClick={() => handleCustomerClick(customer)}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base truncate">{customer.name}</CardTitle>
                    <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingCustomer(customer)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteCustomerId(customer.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{customer.phone}</span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-start space-x-1 text-gray-600">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span className="text-xs line-clamp-2">{customer.address}</span>
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-2">
                    Since {new Date(customer.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center space-x-1 text-xs font-medium text-blue-600 mt-1">
                    <ShoppingBag className="w-3 h-3" />
                    <span>{customerOrderCounts[customer.id] || 0} orders</span>
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
                    await customersApi.delete(deleteCustomerId)
                    toast({
                      title: "Success",
                      description: "Customer deleted successfully"
                    })
                    setDeleteCustomerId(null)
                    loadCustomers()
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
        await customersApi.update(customer.id, customerData)
        toast({
          title: "Success",
          description: "Customer updated successfully"
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
