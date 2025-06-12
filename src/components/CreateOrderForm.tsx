
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Minus, Search } from 'lucide-react'
import { ordersApi, menuItemsApi, customersApi } from '@/services/api'
import { MenuItem, Customer } from '@/config/supabase'
import { useToast } from '@/hooks/use-toast'

interface OrderItem {
  menu_item_id: string
  item_name: string
  size_type: 'plate' | 'half_tray' | 'full_tray'
  quantity: number
  unit_price: number
  total_price: number
  special_instructions?: string
}

interface CreateOrderFormProps {
  onOrderCreated: () => void
  onClose: () => void
}

const CreateOrderForm = ({ onOrderCreated, onClose }: CreateOrderFormProps) => {
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [deliveryTime, setDeliveryTime] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadMenuItems()
  }, [])

  useEffect(() => {
    if (customerPhone.length >= 10) {
      checkExistingCustomer()
    }
  }, [customerPhone])

  const loadMenuItems = async () => {
    try {
      const data = await menuItemsApi.getAll()
      setMenuItems(data)
    } catch (error) {
      console.error('Error loading menu items:', error)
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

  const addOrderItem = (menuItem: MenuItem, sizeType: 'plate' | 'half_tray' | 'full_tray') => {
    const price = sizeType === 'plate' ? menuItem.price_per_plate : 
                  sizeType === 'half_tray' ? menuItem.price_half_tray : 
                  menuItem.price_full_tray

    if (!price) {
      toast({
        title: "Error",
        description: "Price not available for this size",
        variant: "destructive"
      })
      return
    }

    const newItem: OrderItem = {
      menu_item_id: menuItem.id,
      item_name: menuItem.name,
      size_type: sizeType,
      quantity: 1,
      unit_price: price,
      total_price: price,
      special_instructions: ''
    }

    setOrderItems([...orderItems, newItem])
  }

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return
    
    const updated = [...orderItems]
    updated[index].quantity = quantity
    updated[index].total_price = updated[index].unit_price * quantity
    setOrderItems(updated)
  }

  const removeItem = (index: number) => {
    const updated = orderItems.filter((_, i) => i !== index)
    setOrderItems(updated)
  }

  const getTotalAmount = () => {
    return orderItems.reduce((sum, item) => sum + item.total_price, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!customerName || !customerPhone || !deliveryDate || orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and add at least one item",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Create or get customer
      let customerId = existingCustomer?.id
      if (!existingCustomer) {
        const newCustomer = await customersApi.create({
          name: customerName,
          phone: customerPhone,
          address: deliveryAddress || undefined
        })
        customerId = newCustomer.id
      }

      // Create order
      const order = {
        customer_id: customerId,
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_date: deliveryDate,
        delivery_time: deliveryTime || undefined,
        delivery_address: deliveryAddress || undefined,
        special_instructions: specialInstructions || undefined,
        total_amount: getTotalAmount(),
        status: 'pending' as const
      }

      await ordersApi.create(order, orderItems)
      
      toast({
        title: "Success",
        description: "Order created successfully"
      })
      
      onOrderCreated()
      onClose()
    } catch (error) {
      console.error('Error creating order:', error)
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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

        {/* Delivery Information */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="delivery-date">Delivery Date *</Label>
                <Input
                  id="delivery-date"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="delivery-time">Delivery Time</Label>
                <Input
                  id="delivery-time"
                  type="time"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="special-instructions">Special Instructions</Label>
              <Textarea
                id="special-instructions"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requests or instructions"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card>
          <CardHeader>
            <CardTitle>Add Menu Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 max-h-40 overflow-y-auto">
              {menuItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    {item.price_per_plate && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => addOrderItem(item, 'plate')}
                      >
                        Plate (${item.price_per_plate})
                      </Button>
                    )}
                    {item.price_half_tray && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => addOrderItem(item, 'half_tray')}
                      >
                        Half Tray (${item.price_half_tray})
                      </Button>
                    )}
                    {item.price_full_tray && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => addOrderItem(item, 'full_tray')}
                      >
                        Full Tray (${item.price_full_tray})
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        {orderItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <span className="font-medium">{item.item_name}</span>
                    <Badge className="ml-2">{item.size_type.replace('_', ' ')}</Badge>
                    <p className="text-sm text-gray-500">${item.unit_price} each</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(index, item.quantity - 1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(index, item.quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <span className="w-20 text-right">${item.total_price.toFixed(2)}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => removeItem(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span>${getTotalAmount().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button type="submit" disabled={loading || orderItems.length === 0}>
            {loading ? 'Creating...' : 'Create Order'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateOrderForm
