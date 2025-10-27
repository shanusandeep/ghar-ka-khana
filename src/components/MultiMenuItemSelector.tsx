import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Search, Utensils, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { menuItemsApi, MenuItem } from '@/services/api'

interface MultiMenuItemSelectorProps {
  value?: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  maxItems?: number
}

const MultiMenuItemSelector = ({ 
  value = [], 
  onValueChange, 
  placeholder = "Select menu items...",
  maxItems = 5
}: MultiMenuItemSelectorProps) => {
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

  const selectedItems = menuItems.filter(item => value.includes(item.id))

  const handleToggleItem = (itemId: string) => {
    if (value.includes(itemId)) {
      onValueChange(value.filter(id => id !== itemId))
    } else if (value.length < maxItems) {
      onValueChange([...value, itemId])
    }
  }

  const handleRemoveItem = (itemId: string) => {
    onValueChange(value.filter(id => id !== itemId))
  }

  const getItemImage = (item: MenuItem) => {
    if (item.image_url) return item.image_url
    
    // Fallback to category-based image mapping
    const categoryName = item.menu_categories?.name?.toLowerCase() || ''
    const itemName = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "").trim()
    
    const itemImageMap: { [key: string]: { [key: string]: string } } = {
      "main course": {
        "dalfry": "/food_pics/main_course/dal-fry.png",
        "dalmakhni": "/food_pics/main_course/dal-makhni.png",
        "matarpaneer": "/food_pics/main_course/matar-paneer.png",
        "paneerbhurji": "/food_pics/main_course/paneer-bhurji.png",
        "malaikofta": "/food_pics/main_course/malai-kofta.png",
        "mixveg": "/food_pics/main_course/mix-veg.png",
        "baiganbharta": "/food_pics/main_course/baigan-bharta.png",
        "eggbhurji": "/food_pics/main_course/egg-bhurji.png",
        "eggcurry": "/food_pics/main_course/egg-curry.png",
        "kadhi": "/food_pics/main_course/kadhi.png",
        "kaalachana": "/food_pics/main_course/kaala-chana.png",
        "aloomatar": "/food_pics/main_course/aloo-matar.png",
        "palakpaneer": "/food_pics/main_course/palak-paneer.png",
        "paneerbuttermasala": "/food_pics/main_course/paneer-butter-masala.png",
        "rajma": "/food_pics/main_course/Rajma.png",
        "bhindifry": "/food_pics/main_course/bhindi-fry.png",
        "kadhaichicken": "/food_pics/main_course/kadhai-chicken.png",
        "acharichicken": "/food_pics/main_course/achari-chicken.png",
        "aloogobhimasala": "/food_pics/main_course/aloo-gobhi-masala.png",
        "bharvakarela": "/food_pics/main_course/bharva-karela.png",
        "baigankalonji": "/food_pics/main_course/baigan-kalonji.png",
        "chickenchilli": "/food_pics/main_course/chicken-chilli.png",
        "vegnoodles": "/food_pics/main_course/veg-noodles.png",
        "butterchicken": "/food_pics/main_course/butter-chicken.png",
        "muttonroganjosh": "/food_pics/main_course/mutton-roganjosh.png"
      },
      "starter items": {
        "chholebhature": "/food_pics/starter/chhole-bhature.png",
        "gobimanchurian": "/food_pics/starter/gobi-manchurian.png",
        "vegnoodles": "/food_pics/starter/veg-noodles.png",
        "vegkaatiroll": "/food_pics/starter/veg-kaati-roll.png",
        "eggkaatiroll": "/food_pics/starter/egg-kaati-roll.png",
        "chickenkaatiroll": "/food_pics/starter/chicken-kaati-roll.png",
        "moongdalpakoda": "/food_pics/starter/moong-dal-pakoda.png",
        "moongdalkachori": "/food_pics/starter/moong-dal-kachori.png",
        "dahivada": "/food_pics/starter/dahi-vada.png",
        "cajunpotatoes": "/food_pics/starter/cajun-potatoes.png",
        "malaisoyachaap": "/food_pics/starter/malai-soya-chaap.png",
        "palakonionpakoda": "/food_pics/starter/palak-onion-pakoda.png",
        "pinwheelrolls": "/food_pics/starter/pinwheel-rolls.png",
        "vegcutlet": "/food_pics/starter/veg-cutlet.png",
        "vegpuff": "/food_pics/starter/veg-puff.png",
        "vegsliders": "/food_pics/starter/veg-sliders.png",
        "vadapav": "/food_pics/starter/vada-pav.png",
        "aloochat": "/food_pics/starter/aloo-chat.png",
        "babycornchilli": "/food_pics/starter/babycorn-chilli.png",
        "fishfry": "/food_pics/starter/fish-fry.png"
      },
      "breads": {
        "roti": "/food_pics/breads/roti.png",
        "naan": "/food_pics/breads/naan.png",
        "alooparatha": "/food_pics/breads/aloo-paratha.png",
        "paneerparatha": "/food_pics/breads/paneer-paratha.png",
        "gobhiparatha": "/food_pics/breads/gobhi-paratha.png",
        "onionparatha": "/food_pics/breads/onion-paratha.png",
        "sattuparatha": "/food_pics/breads/sattu-paratha.png",
        "thepla": "/food_pics/breads/thepla.png",
        "poori": "/food_pics/breads/poori.png",
        "bhatura": "/food_pics/breads/bhatura.png",
        "baati": "/food_pics/breads/Baati.png"
      },
      "rice": {
        "chickenbiryani": "/food_pics/rice/chicken-biryani.png",
        "vegbiryani": "/food_pics/rice/veg-biryani.png",
        "kathalbiryani": "/food_pics/rice/kathal-biryani.png",
        "chickenfriedrice": "/food_pics/rice/chicken-fried-rice.png",
        "eggfriedrice": "/food_pics/rice/egg-fried-rice.png",
        "vegfriedrice": "/food_pics/rice/veg-fried-rice.png",
        "navratanpulav": "/food_pics/rice/navratan-pulav.png",
        "tavapulav": "/food_pics/rice/tava-pulav.png"
      },
      "dessert": {
        "rasmalai": "/food_pics/desert/rasmalai.png",
        "gajarkahalwa": "/food_pics/desert/gajar-ka-halwa.png",
        "kalakand": "/food_pics/desert/kalakand.png",
        "moongdalhalwa": "/food_pics/desert/moong-dal-halwa.png",
        "fruitcustard": "/food_pics/desert/fruit-custard.png",
        "baklava": "/food_pics/desert/baklava.png",
        "paan": "/food_pics/desert/paan.png"
      }
    }
    
    return itemImageMap[categoryName]?.[itemName] || "/placeholder.svg"
  }

  return (
    <div className="space-y-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <div className="flex items-center space-x-2">
              <Utensils className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">
                {selectedItems.length === 0 
                  ? placeholder 
                  : `${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''} selected`
                }
              </span>
            </div>
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
                      onSelect={() => handleToggleItem(item.id)}
                      disabled={!value.includes(item.id) && value.length >= maxItems}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value.includes(item.id) ? "opacity-100" : "opacity-0"
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

      {/* Selected Items Display */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <Badge key={item.id} variant="secondary" className="flex items-center space-x-1">
              <img
                src={getItemImage(item)}
                alt={item.name}
                className="w-4 h-4 object-cover rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg"
                }}
              />
              <span className="text-xs">{item.name}</span>
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

export default MultiMenuItemSelector
