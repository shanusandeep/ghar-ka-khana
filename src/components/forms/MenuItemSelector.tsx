
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { MenuItem } from '@/config/supabase'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'

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
  topOrderItems?: { item_name: string; total_revenue: number; size_type: string }[]
}

const MenuItemSelector = ({ menuItems, orderItems, setOrderItems, topOrderItems = [] }: MenuItemSelectorProps) => {
  const { toast } = useToast()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

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
    
    toast({
      title: "Success",
      description: "Item added to order"
    })
  }

  const getAvailableSizes = (item: MenuItem) => {
    const sizes = []
    if (item.price_per_plate) sizes.push({ type: 'plate', label: 'Plate', price: item.price_per_plate })
    if (item.price_half_tray) sizes.push({ type: 'half_tray', label: 'Half Tray', price: item.price_half_tray })
    if (item.price_full_tray) sizes.push({ type: 'full_tray', label: 'Full Tray', price: item.price_full_tray })
    return sizes
  }

  const filteredItems = menuItems.filter(item => 
    item.is_available && 
    item.name.toLowerCase().includes(searchValue.toLowerCase())
  )

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Add Menu Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Searchable Dropdown */}
        <div>
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={searchOpen}
                className="w-full justify-between"
              >
                Search menu items...
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput 
                  placeholder="Search menu items..." 
                  value={searchValue}
                  onValueChange={setSearchValue}
                />
                <CommandList className="max-h-80">
                  <CommandEmpty>No menu items found.</CommandEmpty>
                  <CommandGroup>
                    {filteredItems.map((item) => (
                      <CommandItem
                        key={item.id}
                        className="flex flex-col items-start p-3 space-y-2"
                      >
                        <div className="w-full">
                          <div className="font-medium">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-gray-500">{item.description}</div>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {getAvailableSizes(item).map((size) => (
                              <Button
                                key={size.type}
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  addOrderItem(item, size.type as 'plate' | 'half_tray' | 'full_tray')
                                  setSearchOpen(false)
                                }}
                                className="text-xs"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                {size.label} ${size.price}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Last 3 Items Ordered */}
        {topOrderItems.length > 0 && (
          <div>
            <h5 className="font-medium mb-2">Last 3 Items Ordered</h5>
            <div className="grid gap-2">
              {topOrderItems.slice(0, 3).map((recentItem, index) => {
                const menuItem = menuItems.find(item => item.name === recentItem.item_name)
                if (!menuItem) return null
                
                return (
                  <div key={index} className="flex items-center justify-between p-2 border rounded text-sm bg-green-50">
                    <div className="flex-1">
                      <span className="font-medium">{recentItem.item_name}</span>
                      <div className="text-xs text-gray-500">Recently ordered</div>
                    </div>
                    <div className="flex gap-1">
                      {getAvailableSizes(menuItem).map((size) => (
                        <Button
                          key={size.type}
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => addOrderItem(menuItem, size.type as 'plate' | 'half_tray' | 'full_tray')}
                          className="text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          ${size.price}
                        </Button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default MenuItemSelector
