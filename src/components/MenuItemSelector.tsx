import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Search, Utensils } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { menuItemsApi, MenuItem } from '@/services/api'

interface MenuItemSelectorProps {
  value?: string
  onValueChange: (value: string | undefined) => void
  placeholder?: string
}

const MenuItemSelector = ({ value, onValueChange, placeholder = "Select a menu item..." }: MenuItemSelectorProps) => {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadMenuItems()
  }, [])

  const loadMenuItems = async () => {
    try {
      setLoading(true)
      const items = await menuItemsApi.getAll()
      setMenuItems(items)
    } catch (error) {
      console.error('Error loading menu items:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.menu_categories?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedItem = menuItems.find(item => item.id === value)

  const getItemImage = (item: MenuItem) => {
    if (item.image_url) return item.image_url
    
    // Fallback to category-based image mapping
    const categoryName = item.menu_categories?.name?.toLowerCase() || ''
    const itemName = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "").trim()
    
    // Use the same image mapping logic from other components
    const itemImageMap: { [key: string]: { [key: string]: string } } = {
      "main course": {
        "dal fry": "/food_pics/main_course/dal-fry.png",
        "dal makhni": "/food_pics/main_course/dal-makhni.png",
        "matar paneer": "/food_pics/main_course/matar-paneer.png",
        "paneer bhurji": "/food_pics/main_course/paneer-bhurji.png",
        "malai kofta": "/food_pics/main_course/malai-kofta.png",
        "mix veg": "/food_pics/main_course/mix-veg.png",
        "baigan bharta": "/food_pics/main_course/baigan-bharta.png",
        "egg bhurji": "/food_pics/main_course/egg-bhurji.png",
        "egg curry": "/food_pics/main_course/egg-curry.png",
        "kadhi": "/food_pics/main_course/kadhi.png",
        "kaala chana": "/food_pics/main_course/kaala-chana.png",
        "aloo matar": "/food_pics/main_course/aloo-matar.png",
        "palak paneer": "/food_pics/main_course/palak-paneer.png",
        "paneer butter masala": "/food_pics/main_course/paneer-butter-masala.png",
        "rajma": "/food_pics/main_course/Rajma.png",
        "bhindi fry": "/food_pics/main_course/bhindi-fry.png",
        "kadhai chicken": "/food_pics/main_course/kadhai-chicken.png",
        "achari chicken": "/food_pics/main_course/achari-chicken.png",
        "aloo gobhi masala": "/food_pics/main_course/aloo-gobhi-masala.png",
        "bharva karela": "/food_pics/main_course/bharva-karela.png",
        "baigan kalonji": "/food_pics/main_course/baigan-kalonji.png",
        "butter chicken": "/food_pics/main_course/butter-chicken.png",
        "mutton roganjosh": "/food_pics/main_course/mutton-roganjosh.png"
      },
      "starter items": {
        "chhole bhature": "/food_pics/starter/chhole-bhature.png",
        "gobi manchurian": "/food_pics/starter/gobi-manchurian.png",
        "veg noodles": "/food_pics/starter/veg-noodles.png",
        "veg kaati roll": "/food_pics/starter/veg-kaati-roll.png",
        "egg kaati roll": "/food_pics/starter/egg-kaati-roll.png",
        "chicken kaati roll": "/food_pics/starter/chicken-kaati-roll.png",
        "moong dal pakoda": "/food_pics/starter/moong-dal-pakoda.png",
        "aloo chat": "/food_pics/starter/aloo-chat.png",
        "babycorn chilli": "/food_pics/starter/babycorn-chilli.png",
        "fish fry": "/food_pics/starter/fish-fry.png"
      },
      "breads": {
        "roti": "/food_pics/breads/roti.png",
        "naan": "/food_pics/breads/naan.png",
        "aloo paratha": "/food_pics/breads/aloo-paratha.png",
        "paneer paratha": "/food_pics/breads/paneer-paratha.png",
        "gobhi paratha": "/food_pics/breads/gobhi-paratha.png",
        "onion paratha": "/food_pics/breads/onion-paratha.png",
        "sattu paratha": "/food_pics/breads/sattu-paratha.png",
        "thepla": "/food_pics/breads/thepla.png",
        "poori": "/food_pics/breads/poori.png",
        "bhatura": "/food_pics/breads/bhatura.png",
        "baati": "/food_pics/breads/Baati.png"
      },
      "rice": {
        "chicken biryani": "/food_pics/rice/chicken-biryani.png",
        "veg biryani": "/food_pics/rice/veg-biryani.png",
        "kathal biryani": "/food_pics/rice/kathal-biryani.png",
        "chicken fried rice": "/food_pics/rice/chicken-fried-rice.png",
        "egg fried rice": "/food_pics/rice/egg-fried-rice.png",
        "veg fried rice": "/food_pics/rice/veg-fried-rice.png",
        "navratan pulav": "/food_pics/rice/navratan-pulav.png",
        "tava pulav": "/food_pics/rice/tava-pulav.png"
      },
      "dessert": {
        "rasmalai": "/food_pics/desert/rasmalai.png",
        "gajar ka halwa": "/food_pics/desert/gajar-ka-halwa.png",
        "kalakand": "/food_pics/desert/kalakand.png",
        "moong dal halwa": "/food_pics/desert/moong-dal-halwa.png",
        "fruit custard": "/food_pics/desert/fruit-custard.png",
        "baklava": "/food_pics/desert/baklava.png",
        "paan": "/food_pics/desert/paan.png"
      }
    }
    
    return itemImageMap[categoryName]?.[itemName] || "/placeholder.svg"
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedItem ? (
            <div className="flex items-center space-x-2">
              <img
                src={getItemImage(selectedItem)}
                alt={selectedItem.name}
                className="w-6 h-6 object-cover rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg"
                }}
              />
              <span className="truncate">{selectedItem.name}</span>
              <span className="text-xs text-gray-500">
                ({selectedItem.menu_categories?.name})
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Utensils className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">{placeholder}</span>
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search menu items..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? "Loading..." : "No menu items found."}
            </CommandEmpty>
            
            {/* Option to clear selection */}
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onValueChange(undefined)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    !value ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex items-center space-x-2">
                  <Utensils className="w-4 h-4 text-gray-400" />
                  <span>General Review (No specific item)</span>
                </div>
              </CommandItem>
            </CommandGroup>

            {/* Group items by category */}
            {Object.entries(
              filteredItems.reduce((acc, item) => {
                const category = item.menu_categories?.name || 'Other'
                if (!acc[category]) acc[category] = []
                acc[category].push(item)
                return acc
              }, {} as Record<string, MenuItem[]>)
            ).map(([category, items]) => (
              <CommandGroup key={category} heading={category}>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => {
                      onValueChange(item.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === item.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex items-center space-x-2">
                      <img
                        src={getItemImage(item)}
                        alt={item.name}
                        className="w-6 h-6 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg"
                        }}
                      />
                      <span>{item.name}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default MenuItemSelector
