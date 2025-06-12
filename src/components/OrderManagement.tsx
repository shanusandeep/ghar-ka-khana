import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Phone, Calendar, MapPin, Clock, Edit, Trash2 } from 'lucide-react'
import { ordersApi } from '@/services/api'
import { Order } from '@/config/supabase'
import { useToast } from '@/hooks/use-toast'
import CreateOrderForm from './CreateOrderForm'

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { toast } = useToast()

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
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'preparing': return 'bg-orange-100 text-orange-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Order Management</h2>
          <p className="text-gray-600 text-sm sm:text-base">Manage and track all customer orders</p>
        </div>
        <Sheet open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
          <SheetTrigger asChild>
            <Button className="flex items-center space-x-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              <span>New Order</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Create New Order</SheetTitle>
              <SheetDescription>Add a new order from WhatsApp or phone call</SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <CreateOrderForm 
                onOrderCreated={loadOrders} 
                onClose={() => setIsNewOrderOpen(false)} 
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-4">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                No orders found. Create your first order to get started.
              </div>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-lg">Order #{order.order_number}</CardTitle>
                    <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                      <span className="flex items-center space-x-1">
                        <Phone className="w-4 h-4" />
                        <span>{order.customer_name}</span>
                      </span>
                      <span className="text-sm">{order.customer_phone}</span>
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Delivery: {new Date(order.delivery_date).toLocaleDateString()}</span>
                    </div>
                    {order.delivery_time && (
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{order.delivery_time}</span>
                      </div>
                    )}
                  </div>
                  {order.delivery_address && (
                    <div className="flex items-start space-x-2 text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="break-words">{order.delivery_address}</span>
                    </div>
                  )}
                  {order.total_amount && (
                    <div className="text-lg font-semibold text-green-600">
                      Total: ${order.total_amount}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <Select onValueChange={(value) => updateOrderStatus(order.id, value)}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingOrder(order)} className="flex-1 sm:flex-none">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setDeletingOrder(order)}
                      className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Order Sheet */}
      <Sheet open={editingOrder !== null} onOpenChange={(open) => !open && setEditingOrder(null)}>
        <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
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
