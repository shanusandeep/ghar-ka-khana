
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
  size_type: 'plate' | 'half_tray' | 'full_tray' | 'piece'
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

  const addOrderItem = (menuItem: MenuItem, sizeType: 'plate' | 'half_tray' | 'full_tray' | 'piece') => {
    let price: number | undefined
    let quantity = 1

    if (sizeType === 'piece') {
      price = menuItem.price_per_piece
      quantity = menuItem.min_piece_order || 1
    } else {
      price = sizeType === 'plate' ? menuItem.price_per_plate : 
              sizeType === 'half_tray' ? menuItem.price_half_tray : 
              menuItem.price_full_tray
    }

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
      quantity: quantity,
      unit_price: price,
      total_price: price * quantity,
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
    
    // Prioritize piece-based pricing for items that have it
    if (item.price_per_piece) {
      const minOrder = item.min_piece_order || 1
      sizes.push({ 
        type: 'piece', 
        label: `${minOrder} Piece${minOrder > 1 ? 's' : ''}`, 
        price: item.price_per_piece,
        minOrder 
      })
    }
    
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
    <div className="space-y-3">
      <div className="border-b border-gray-200 pb-2">
        <h3 className="text-base font-semibold text-gray-900">Add Menu Items</h3>
      </div>
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
                                  addOrderItem(item, size.type as 'plate' | 'half_tray' | 'full_tray' | 'piece')
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

        {/* Recent Orders */}
        {topOrderItems.length > 0 && (
          <div>
            <h5 className="font-medium mb-3">Recent Orders</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topOrderItems.slice(0, 4).map((recentItem, index) => {
                const menuItem = menuItems.find(item => item.name === recentItem.item_name)
                if (!menuItem) return null
                
                return (
                  <div key={index} className="flex flex-col p-3 border rounded-lg text-sm bg-green-50 hover:bg-green-100 transition-colors">
                    <div className="flex-1 mb-2">
                      <span className="font-medium text-gray-900">{recentItem.item_name}</span>
                      <div className="text-xs text-gray-500 mt-1">Recently ordered</div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {getAvailableSizes(menuItem).slice(0, 2).map((size) => (
                        <Button
                          key={size.type}
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => addOrderItem(menuItem, size.type as 'plate' | 'half_tray' | 'full_tray')}
                          className="text-xs h-7 px-2"
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
      </div>
  )
}

export default MenuItemSelector
