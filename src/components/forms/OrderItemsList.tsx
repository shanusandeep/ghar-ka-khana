
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Minus } from 'lucide-react'

interface OrderItem {
  menu_item_id: string
  item_name: string
  size_type: 'plate' | 'half_tray' | 'full_tray'
  quantity: number
  unit_price: number
  total_price: number
  special_instructions?: string
}

interface OrderItemsListProps {
  orderItems: OrderItem[]
  setOrderItems: (items: OrderItem[]) => void
}

const OrderItemsList = ({ orderItems, setOrderItems }: OrderItemsListProps) => {
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

  if (orderItems.length === 0) {
    return null
  }

  return (
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
  )
}

export default OrderItemsList
