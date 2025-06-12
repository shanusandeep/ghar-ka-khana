
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MenuItem } from '@/config/supabase'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'

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
  const [selectedItemId, setSelectedItemId] = useState('')
  const [selectedSizeType, setSelectedSizeType] = useState<'plate' | 'half_tray' | 'full_tray'>('plate')

  const addOrderItem = () => {
    if (!selectedItemId) {
      toast({
        title: "Error",
        description: "Please select a menu item",
        variant: "destructive"
      })
      return
    }

    const menuItem = menuItems.find(item => item.id === selectedItemId)
    if (!menuItem) {
      toast({
        title: "Error",
        description: "Menu item not found",
        variant: "destructive"
      })
      return
    }

    const price = selectedSizeType === 'plate' ? menuItem.price_per_plate : 
                  selectedSizeType === 'half_tray' ? menuItem.price_half_tray : 
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
      size_type: selectedSizeType,
      quantity: 1,
      unit_price: price,
      total_price: price,
      special_instructions: ''
    }

    setOrderItems([...orderItems, newItem])
    setSelectedItemId('')
    setSelectedSizeType('plate')
    
    toast({
      title: "Success",
      description: "Item added to order"
    })
  }

  const getAvailableSizes = (item: MenuItem) => {
    const sizes = []
    if (item.price_per_plate) sizes.push({ value: 'plate', label: `Plate ($${item.price_per_plate})`, price: item.price_per_plate })
    if (item.price_half_tray) sizes.push({ value: 'half_tray', label: `Half Tray ($${item.price_half_tray})`, price: item.price_half_tray })
    if (item.price_full_tray) sizes.push({ value: 'full_tray', label: `Full Tray ($${item.price_full_tray})`, price: item.price_full_tray })
    return sizes
  }

  const selectedMenuItem = menuItems.find(item => item.id === selectedItemId)
  const availableSizes = selectedMenuItem ? getAvailableSizes(selectedMenuItem) : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Menu Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger>
                <SelectValue placeholder="Select menu item" />
              </SelectTrigger>
              <SelectContent>
                {menuItems.filter(item => item.is_available).map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select 
              value={selectedSizeType} 
              onValueChange={(value: 'plate' | 'half_tray' | 'full_tray') => setSelectedSizeType(value)}
              disabled={!selectedItemId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {availableSizes.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={addOrderItem}
            disabled={!selectedItemId || availableSizes.length === 0}
            className="w-full"
          >
            Add Item
          </Button>
        </div>

        {selectedMenuItem && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold">{selectedMenuItem.name}</h4>
            {selectedMenuItem.description && (
              <p className="text-sm text-gray-600 mt-1">{selectedMenuItem.description}</p>
            )}
            {selectedMenuItem.ingredients && selectedMenuItem.ingredients.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                <strong>Ingredients:</strong> {selectedMenuItem.ingredients.join(', ')}
              </p>
            )}
          </div>
        )}

        <div className="border-t pt-4">
          <h5 className="font-medium mb-2">Available Menu Items</h5>
          <div className="grid gap-2 max-h-40 overflow-y-auto">
            {menuItems.filter(item => item.is_available).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 border rounded text-sm">
                <div>
                  <span className="font-medium">{item.name}</span>
                  {item.description && (
                    <p className="text-gray-500 text-xs">{item.description}</p>
                  )}
                </div>
                <div className="flex space-x-1">
                  {item.price_per_plate && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedItemId(item.id)
                        setSelectedSizeType('plate')
                      }}
                    >
                      ${item.price_per_plate}
                    </Button>
                  )}
                  {item.price_half_tray && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedItemId(item.id)
                        setSelectedSizeType('half_tray')
                      }}
                    >
                      ${item.price_half_tray}
                    </Button>
                  )}
                  {item.price_full_tray && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedItemId(item.id)
                        setSelectedSizeType('full_tray')
                      }}
                    >
                      ${item.price_full_tray}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default MenuItemSelector
