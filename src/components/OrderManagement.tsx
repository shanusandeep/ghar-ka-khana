import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Plus, Phone, MapPin, Clock, Edit, Trash2, Eye, Package } from 'lucide-react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { ordersApi } from '@/services/api'
import { Order, OrderItem } from '@/config/supabase'
import { useToast } from '@/hooks/use-toast'
import CreateOrderForm from './CreateOrderForm'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Filter as FilterIcon } from 'lucide-react'
import { format, parseISO, isSameDay } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'

// Extended Order type that includes order_items from the API response
interface OrderWithItems extends Order {
  order_items?: OrderItem[]
}

interface OrderDetailsViewProps {
  order: OrderWithItems
}

const OrderDetailsView = ({ order }: OrderDetailsViewProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-yellow-100 text-yellow-800'
      case 'delivered': return 'bg-blue-100 text-blue-800'
      case 'paid': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    // Handle both timestamp and date-only strings consistently
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric',
      timeZone: 'UTC'
    })
  }

  return (
    <div className="space-y-4">
      {/* Consolidated Order Header with Customer Info */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="space-y-1 flex-1">
            <h3 className="text-lg font-bold">{order.customer_name}</h3>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <a 
                href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-green-600 hover:text-green-700 hover:underline transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Phone className="w-4 h-4" />
                <span>{order.customer_phone}</span>
              </a>
            </div>
            {order.delivery_address && (
              <div className="flex items-start space-x-1 text-sm text-gray-600">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{order.delivery_address}</span>
              </div>
            )}
            <div className="sm:hidden mt-2">
              <Badge className={`${getStatusColor(order.status)} w-fit`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <div className="hidden sm:block">
              <Badge className={`${getStatusColor(order.status)} w-fit`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
            <div className="text-sm text-gray-600 text-left sm:text-right space-y-1">
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                <span>Created {formatDate(order.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                <span>Delivery {formatDate(order.delivery_date)}</span>
                {order.delivery_time && (
                  <>
                    <Clock className="w-4 h-4 ml-1" />
                    <span>{order.delivery_time}</span>
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
          {order.order_items && order.order_items.length > 0 ? (
            <div className="space-y-3">
              {order.order_items.map((item, index) => (
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
      {order.special_instructions && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Special Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{order.special_instructions}</p>
          </CardContent>
        </Card>
      )}

      {/* Order Total */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold">Total Amount</span>
            <span className="text-xl font-bold text-green-600">
              ${order.total_amount || 0}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const OrderManagement = () => {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<OrderWithItems | null>(null)
  const [viewingOrder, setViewingOrder] = useState<OrderWithItems | null>(null)
  const [deletingOrder, setDeletingOrder] = useState<OrderWithItems | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { toast } = useToast()
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<Date | null>(new Date())

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const data = await ordersApi.getAll()
      setOrders(data)
    } catch (error) {
      console.error('Error loading orders:', error)
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
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
    // Handle both timestamp and date-only strings consistently
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric',
      timeZone: 'UTC'
    })
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await ordersApi.update(orderId, { status: newStatus as any })
      await loadOrders()
      toast({
        title: "Success",
        description: "Order status updated successfully"
      })
    } catch (error) {
      console.error('Error updating order:', error)
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      })
    }
  }

  const deleteOrder = async () => {
    if (!deletingOrder) return

    setDeleteLoading(true)
    try {
      await ordersApi.delete(deletingOrder.id)
      await loadOrders()
      setDeletingOrder(null)
      toast({
        title: "Success",
        description: "Order deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting order:', error)
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive"
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  // Filtered orders
  const filteredOrders = orders.filter(order => {
    let statusMatch = statusFilter === 'all' || order.status === statusFilter
    let dateMatch = true
    if (dateFilter) {
      const orderDate = parseISO(order.delivery_date)
      dateMatch = isSameDay(orderDate, dateFilter)
    }
    return statusMatch && dateMatch
  })

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading orders...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div></div>
        <div className="flex items-center gap-2">
          <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
            <PopoverTrigger asChild>
              <Button size="icon" variant="outline">
                <FilterIcon className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Date</label>
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    className="rounded-md border"
                  />
                  {dateFilter && (
                    <Button size="sm" variant="ghost" className="mt-2" onClick={() => setDateFilter(null)}>
                      Clear Date
                    </Button>
                  )}
                </div>
                <Button size="sm" variant="outline" className="w-full" onClick={() => { setStatusFilter('all'); setDateFilter(null); }}>Clear Filters</Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button onClick={() => setIsNewOrderOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> New Order
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  No orders found. Create your first order to get started.
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <Card 
              key={order.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer group hover:scale-[1.02] duration-200"
              onClick={() => setViewingOrder(order)}
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
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1 text-sm">
                      <Phone className="w-3 h-3" />
                      <span className="font-medium truncate">{order.customer_name}</span>
                    </div>
                    <a 
                      href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-600 hover:text-green-700 hover:underline truncate block transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {order.customer_phone}
                    </a>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <CalendarIcon className="w-3 h-3" />
                    <span>{formatDate(order.delivery_date)}</span>
                    {order.delivery_time && (
                      <>
                        <Clock className="w-3 h-3 ml-2" />
                        <span>{order.delivery_time}</span>
                      </>
                    )}
                  </div>
                  {order.delivery_address && (
                    <div className="flex items-start space-x-1 text-gray-600">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span className="truncate text-xs">{order.delivery_address}</span>
                    </div>
                  )}
                  
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
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                  <Select 
                    onValueChange={(value) => updateOrderStatus(order.id, value)}
                    defaultValue={order.status}
                  >
                    <SelectTrigger className="h-8 text-xs flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); setEditingOrder(order); }} 
                    className="text-xs h-8 flex-1"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); setDeletingOrder(order); }}
                    className="text-xs h-8 flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* New Order Sheet */}
      <Sheet open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>New Order</SheetTitle>
            <SheetDescription>Create a new customer order</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <CreateOrderForm
              onOrderCreated={() => {
                loadOrders();
                setIsNewOrderOpen(false);
              }}
              onClose={() => setIsNewOrderOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Order Sheet */}
      <Sheet open={editingOrder !== null} onOpenChange={(open) => !open && setEditingOrder(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Order #{editingOrder?.order_number}</SheetTitle>
            <SheetDescription>Update order details and items</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {editingOrder && (
              <CreateOrderForm 
                existingOrder={editingOrder}
                onOrderCreated={() => {
                  loadOrders()
                  setEditingOrder(null)
                }} 
                onClose={() => setEditingOrder(null)} 
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* View Order Sheet */}
      <Sheet open={viewingOrder !== null} onOpenChange={(open) => !open && setViewingOrder(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Order #{viewingOrder?.order_number}</SheetTitle>
            <SheetDescription>View order details and items</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {viewingOrder && <OrderDetailsView order={viewingOrder} />}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Order Confirmation Dialog */}
      <Dialog open={deletingOrder !== null} onOpenChange={(open) => !open && setDeletingOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete Order #{deletingOrder?.order_number}?
              <br />
              <span className="font-medium text-gray-900">Customer: {deletingOrder?.customer_name}</span>
              <br />
              This action cannot be undone and will permanently remove the order and all its items.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setDeletingOrder(null)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteOrder}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default OrderManagement
