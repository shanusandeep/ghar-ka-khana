
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { History, CalendarIcon, Eye } from 'lucide-react'
import { ordersApi } from '@/services/api'
import { Order, OrderItem, Customer } from '@/config/supabase'
import { useToast } from '@/hooks/use-toast'

interface OrderWithItems extends Order {
  order_items?: OrderItem[]
}

interface CustomerOrderHistoryProps {
  customer: Customer
}

const CustomerOrderHistory = ({ customer }: CustomerOrderHistoryProps) => {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [viewingOrder, setViewingOrder] = useState<OrderWithItems | null>(null)
  const { toast } = useToast()

  const loadCustomerOrders = async () => {
    if (!customer.id) return
    
    setLoading(true)
    try {
      const data = await ordersApi.getByCustomerId(customer.id)
      setOrders(data)
    } catch (error) {
      console.error('Error loading customer orders:', error)
      toast({
        title: "Error",
        description: "Failed to load customer order history",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && customer.id) {
      loadCustomerOrders()
    }
  }, [isOpen, customer.id])

  const formatDate = (dateString: string) => {
    if (dateString.includes('T') || dateString.includes(' ')) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      })
    } else {
      const [year, month, day] = dateString.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      })
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

  const totalOrders = orders.length
  const totalSpent = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
  const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <History className="w-4 h-4 mr-2" />
            Order History
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Order History - {customer.name}</SheetTitle>
            <SheetDescription>
              Complete order history for this customer
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            {/* Customer Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalOrders}</div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">${totalSpent.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Total Spent</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">${averageOrderValue.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Avg. Order</div>
                </CardContent>
              </Card>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recent Orders</h3>
              {loading ? (
                <div className="text-center py-8">Loading order history...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No orders found for this customer
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <Card key={order.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold">#{order.order_number}</span>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <CalendarIcon className="w-4 h-4" />
                                <span>Delivery: {formatDate(order.delivery_date)}</span>
                              </div>
                              <div>Items: {order.order_items?.length || 0}</div>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <div className="text-lg font-semibold text-green-600">
                              ${order.total_amount?.toFixed(2) || '0.00'}
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setViewingOrder(order)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Order Details Sheet */}
      <Sheet open={!!viewingOrder} onOpenChange={() => setViewingOrder(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Order #{viewingOrder?.order_number}</SheetTitle>
            <SheetDescription>Order details and items</SheetDescription>
          </SheetHeader>
          
          {viewingOrder && (
            <div className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Order Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Order Date:</span>
                    <span>{formatDate(viewingOrder.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Date:</span>
                    <span>{formatDate(viewingOrder.delivery_date)}</span>
                  </div>
                  {viewingOrder.delivery_time && (
                    <div className="flex justify-between">
                      <span>Delivery Time:</span>
                      <span>{viewingOrder.delivery_time}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge className={getStatusColor(viewingOrder.status)}>
                      {viewingOrder.status.charAt(0).toUpperCase() + viewingOrder.status.slice(1)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {viewingOrder.order_items && viewingOrder.order_items.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {viewingOrder.order_items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium">{item.item_name}</div>
                            <div className="text-sm text-gray-600">
                              {item.size_type.replace('_', ' ')} × {item.quantity}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${item.total_price.toFixed(2)}</div>
                            <div className="text-sm text-gray-600">@${item.unit_price}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Order Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {viewingOrder.subtotal_amount && (
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${viewingOrder.subtotal_amount.toFixed(2)}</span>
                      </div>
                    )}
                    {viewingOrder.discount_amount && viewingOrder.discount_amount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Discount:</span>
                        <span>-${viewingOrder.discount_amount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>${viewingOrder.total_amount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

export default CustomerOrderHistory
