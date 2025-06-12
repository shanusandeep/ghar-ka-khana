
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MenuItem } from '@/config/supabase'
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

interface MenuItemSelectorProps {
  menuItems: MenuItem[]
  orderItems: OrderItem[]
  setOrderItems: (items: OrderItem[]) => void
}

const MenuItemSelector = ({ menuItems, orderItems, setOrderItems }: MenuItemSelectorProps) => {
  const { toast } = useToast()

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

  return (
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
  )
}

export default MenuItemSelector
