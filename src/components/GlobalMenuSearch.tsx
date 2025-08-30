import React, { useState, useEffect, useRef } from 'react'
import { Search, X, Package, Clock, MapPin, ChefHat } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { menuItemsApi, menuCategoriesApi } from '@/services/api'

interface MenuItem {
  id: string
  name: string
  description?: string
  price_per_plate?: number
  price_half_tray?: number
  price_full_tray?: number
  pieces_per_plate?: number
  price_per_piece?: number
  min_piece_order?: number
  ingredients?: string[] | string
  category_id: string
  image_url?: string
  is_available: boolean
  display_order: number
  preparation_time?: number
  menu_categories?: { name: string }
}

interface MenuCategory {
  id: string
  name: string
  description?: string
  display_order: number
  is_active: boolean
}

interface GlobalMenuSearchProps {
  isOpen: boolean
  onClose: () => void
}

export function GlobalMenuSearch({ isOpen, onClose }: GlobalMenuSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  // Load menu items and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [itemsResponse, categoriesResponse] = await Promise.all([
          menuItemsApi.getAll(),
          menuCategoriesApi.getAll()
        ])
        
        // Fix: menuItemsApi.getAll() returns data directly, not wrapped in .data
        setMenuItems(itemsResponse || [])
        setCategories(categoriesResponse || [])
      } catch (error) {
        console.error('Error loading menu data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  // Handle mobile viewport for keyboard
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when dialog is open on mobile
      document.body.style.overflow = 'hidden'
      
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen])

  // Filter items based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems([])
      return
    }

    const query = searchQuery.toLowerCase().trim()
    
    const filtered = menuItems.filter(item => {
      if (!item.is_available) return false
      
      const nameMatch = item.name.toLowerCase().includes(query)
      const descriptionMatch = item.description?.toLowerCase().includes(query) || false
      const ingredientsMatch = Array.isArray(item.ingredients) 
        ? item.ingredients.some(ingredient => ingredient.toLowerCase().includes(query))
        : (typeof item.ingredients === 'string' ? item.ingredients.toLowerCase().includes(query) : false)
      
      return nameMatch || descriptionMatch || ingredientsMatch
    })

    // Sort by relevance (name matches first, then description, then ingredients)
    filtered.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().includes(query)
      const bNameMatch = b.name.toLowerCase().includes(query)
      
      if (aNameMatch && !bNameMatch) return -1
      if (!aNameMatch && bNameMatch) return 1
      
      return a.name.localeCompare(b.name)
    })

    setFilteredItems(filtered)
  }, [searchQuery, menuItems])

  // Focus search input when dialog opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Clear search when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setFilteredItems([])
    }
  }, [isOpen])

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  const getCategoryName = (item: MenuItem) => {
    // First try to get from joined data
    if (item.menu_categories?.name) {
      return item.menu_categories.name
    }
    // Fallback to lookup by category_id
    const category = categories.find(c => c.id === item.category_id)
    return category?.name || 'Unknown Category'
  }

  const getCategoryRoute = (item: MenuItem) => {
    const categoryName = getCategoryName(item)
    
    // Map category names to routes
    switch (categoryName) {
      case 'Starter Items':
        return '/starter-items'
      case 'Main Course':
        return '/main-course'
      case 'Rice':
        return '/rice'
      case 'Breads':
        return '/breads'
      case 'Dessert':
        return '/dessert'
      default:
        return '/'
    }
  }

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setFilteredItems([])
  }

  // Try to resolve a specific image for a known item name when no image_url is present
  const getItemImage = (categoryName: string, itemName: string) => {
    const normalizeName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "").trim();

    // Map of known items to local images (served from public/)
    const itemImageMap: { [key: string]: { [key: string]: string } } = {
      "starter items": {
        [normalizeName("Chhole Bhature")]: "/food_pics/starter/chhole-bhature.png",
        [normalizeName("Chole Bhature")]: "/food_pics/starter/chhole-bhature.png",
        [normalizeName("Chana Bhature")]: "/food_pics/starter/chhole-bhature.png",
        [normalizeName("Chana Bhatura")]: "/food_pics/starter/chhole-bhature.png",
        // Gobi Manchurian variants
        [normalizeName("Gobi Manchurian")]: "/food_pics/starter/gobi-manchurian.png",
        [normalizeName("Gobhi Manchurian")]: "/food_pics/starter/gobi-manchurian.png",
        [normalizeName("Cauliflower Manchurian")]: "/food_pics/starter/gobi-manchurian.png",
        // Veg Noodles variants (and common misspellings)
        [normalizeName("Veg Noodles")]: "/food_pics/starter/veg-noodles.png",
        [normalizeName("Vegetable Noodles")]: "/food_pics/starter/veg-noodles.png",
        [normalizeName("Veg Hakka Noodles")]: "/food_pics/starter/veg-noodles.png",
        [normalizeName("Veg Noodels")]: "/food_pics/starter/veg-noodles.png",
        // Kaati/Kathi rolls
        [normalizeName("Veg Kaati Roll")]: "/food_pics/starter/veg-kaati-roll.png",
        [normalizeName("Veg Kathi Roll")]: "/food_pics/starter/veg-kaati-roll.png",
        [normalizeName("Egg Kaati Roll")]: "/food_pics/starter/egg-kaati-roll.png",
        [normalizeName("Egg Kathi Roll")]: "/food_pics/starter/egg-kaati-roll.png",
        [normalizeName("Chicken Kaati Roll")]: "/food_pics/starter/chicken-kaati-roll.png",
        [normalizeName("Chicken Kathi Roll")]: "/food_pics/starter/chicken-kaati-roll.png",
        // Pakodas
        [normalizeName("Moong Dal Pakoda")]: "/food_pics/starter/moong-dal-pakoda.png",
        [normalizeName("Mung Dal Pakoda")]: "/food_pics/starter/moong-dal-pakoda.png",
        [normalizeName("Moong Daal Pakoda")]: "/food_pics/starter/moong-dal-pakoda.png",
        [normalizeName("Palak Onion Pakoda")]: "/food_pics/starter/palak-onion-pakoda.png",
        [normalizeName("Spinach Onion Pakoda")]: "/food_pics/starter/palak-onion-pakoda.png",
        // Soya Chaap variants
        [normalizeName("Soya Chaap")]: "/food_pics/starter/malai-soya-chaap.png",
        [normalizeName("Soya Chaap Malai")]: "/food_pics/starter/malai-soya-chaap.png",
        [normalizeName("Malai Soya Chaap")]: "/food_pics/starter/malai-soya-chaap.png",
        [normalizeName("Soya Chaap Malai Tikka")]: "/food_pics/starter/malai-soya-chaap.png",
        [normalizeName("Soya Chaap Tikka")]: "/food_pics/starter/malai-soya-chaap.png",
        [normalizeName("Soya Chaaap")]: "/food_pics/starter/malai-soya-chaap.png",
        // Veg Sliders variants
        [normalizeName("Veg Sliders")]: "/food_pics/starter/veg-sliders.png",
        [normalizeName("Vegetable Sliders")]: "/food_pics/starter/veg-sliders.png",
        [normalizeName("Veg Slider")]: "/food_pics/starter/veg-sliders.png",
        // Dahi Vada variants
        [normalizeName("Dahi Vada")]: "/food_pics/starter/dahi-vada.png",
        [normalizeName("Dahi Wada")]: "/food_pics/starter/dahi-vada.png",
        [normalizeName("Dahi Bhalla")]: "/food_pics/starter/dahi-vada.png",
        [normalizeName("Dahi Vade")]: "/food_pics/starter/dahi-vada.png",
        // Moong Dal Kachori variants
        [normalizeName("Moong Dal Kachori")]: "/food_pics/starter/moong-dal-kachori.png",
        [normalizeName("Mung Dal Kachori")]: "/food_pics/starter/moong-dal-kachori.png",
        [normalizeName("Moong Daal Kachori")]: "/food_pics/starter/moong-dal-kachori.png",
        [normalizeName("Dal Kachori")]: "/food_pics/starter/moong-dal-kachori.png"
      },
      "breads": {
        [normalizeName("Aloo Paratha")]: "/food_pics/breads/aloo-paratha.png",
        [normalizeName("Aloo Paratha Plate")]: "/food_pics/breads/aloo-paratha.png",
        [normalizeName("Poori")]: "/food_pics/breads/poori.png",
        [normalizeName("Puri")]: "/food_pics/breads/poori.png",
        [normalizeName("Gobhi Paratha")]: "/food_pics/breads/gobhi-paratha.png",
        [normalizeName("Gobi Paratha")]: "/food_pics/breads/gobhi-paratha.png",
        [normalizeName("Roti")]: "/food_pics/breads/roti.png",
        [normalizeName("Chapati")]: "/food_pics/breads/roti.png",
        [normalizeName("Paneer Paratha")]: "/food_pics/breads/paneer-paratha.png",
        [normalizeName("Onion Paratha")]: "/food_pics/breads/onion-paratha.png",
        [normalizeName("Thepla")]: "/food_pics/breads/thepla.png",
        [normalizeName("Methi Thepla")]: "/food_pics/breads/thepla.png",
        [normalizeName("Plain Paratha")]: "/food_pics/breads/plain-paratha.png",
        [normalizeName("Bhatura")]: "/food_pics/breads/bhatura.png",
        [normalizeName("Bhature")]: "/food_pics/breads/bhatura.png",
        [normalizeName("Baati")]: "/food_pics/breads/Baati.png",
        // Sattu Paratha variants
        [normalizeName("Sattu Paratha")]: "/food_pics/breads/sattu-paratha.png",
        [normalizeName("Sattu Ka Paratha")]: "/food_pics/breads/sattu-paratha.png",
        [normalizeName("Satu Paratha")]: "/food_pics/breads/sattu-paratha.png"
      },
      "dessert": {
        [normalizeName("Moong Dal Halwa")]: "/food_pics/desert/moong-dal-halwa.png",
        [normalizeName("Mung Dal Halwa")]: "/food_pics/desert/moong-dal-halwa.png",
        [normalizeName("Moong Daal Halwa")]: "/food_pics/desert/moong-dal-halwa.png",
        // Rasmalai variants
        [normalizeName("Rasmalai")]: "/food_pics/desert/rasmalai.png",
        [normalizeName("Ras Malai")]: "/food_pics/desert/rasmalai.png"
      },
      "rice": {
        [normalizeName("Tava Pulav")]: "/food_pics/rice/tava-pulav.png",
        [normalizeName("Tawa Pulav")]: "/food_pics/rice/tava-pulav.png",
        [normalizeName("Tawa Pulao")]: "/food_pics/rice/tava-pulav.png",
        [normalizeName("Veg Fried Rice")]: "/food_pics/rice/veg-fried-rice.png",
        [normalizeName("Vegetable Fried Rice")]: "/food_pics/rice/veg-fried-rice.png",
        [normalizeName("Chicken Fried Rice")]: "/food_pics/rice/chicken-fried-rice.png",
        [normalizeName("Kathal Biryani")]: "/food_pics/rice/kathal-biryani.png",
        [normalizeName("Jackfruit Biryani")]: "/food_pics/rice/kathal-biryani.png",
        [normalizeName("Navratan Pulav")]: "/food_pics/rice/navratan-pulav.png",
        [normalizeName("Navratna Pulav")]: "/food_pics/rice/navratan-pulav.png",
        [normalizeName("Navratan Pulao")]: "/food_pics/rice/navratan-pulav.png",
        [normalizeName("Egg Fried Rice")]: "/food_pics/rice/egg-fried-rice.png",
        [normalizeName("Anda Fried Rice")]: "/food_pics/rice/egg-fried-rice.png",
        // Chicken Biryani variants
        [normalizeName("Chicken Biryani")]: "/food_pics/rice/chicken-biryani.png",
        [normalizeName("Chicken Biriyani")]: "/food_pics/rice/chicken-biryani.png",
        [normalizeName("Chicken Dum Biryani")]: "/food_pics/rice/chicken-biryani.png"
      },
      "main course": {
        [normalizeName("Chhole Bhature")]: "/food_pics/main_course/chhole-bhature.jpg",
        [normalizeName("Chole Bhature")]: "/food_pics/main_course/chhole-bhature.jpg",
        [normalizeName("Chana Bhature")]: "/food_pics/main_course/chhole-bhature.jpg",
        [normalizeName("Chana Bhatura")]: "/food_pics/main_course/chhole-bhature.jpg",
        [normalizeName("Bharva Karela")]: "/food_pics/main_course/bharva-karela.png",
        [normalizeName("Bharwan Karela")]: "/food_pics/main_course/bharva-karela.png",
        [normalizeName("Stuffed Karela")]: "/food_pics/main_course/bharva-karela.png",
        [normalizeName("Dal Fry")]: "/food_pics/main_course/dal-fry.png",
        [normalizeName("Dal Tadka")]: "/food_pics/main_course/dal-fry.png",
        [normalizeName("Dal Makhni")]: "/food_pics/main_course/dal-makhni.png",
        [normalizeName("Dal Makhani")]: "/food_pics/main_course/dal-makhni.png",
        [normalizeName("Mix Veg")]: "/food_pics/main_course/mix-veg.png",
        [normalizeName("Mixed Veg")]: "/food_pics/main_course/mix-veg.png",
        [normalizeName("Mixed Vegetable")]: "/food_pics/main_course/mix-veg.png",
        [normalizeName("Malai Kofta")]: "/food_pics/main_course/malai-kofta.png",
        [normalizeName("Paneer Bhurji")]: "/food_pics/main_course/paneer-bhurji.png",
        // New additions
        [normalizeName("Egg Bhurji")]: "/food_pics/main_course/egg-bhurji.png",
        [normalizeName("Anda Bhurji")]: "/food_pics/main_course/egg-bhurji.png",
        [normalizeName("Matar Paneer")]: "/food_pics/main_course/matar-paneer.png",
        [normalizeName("Mattar Paneer")]: "/food_pics/main_course/matar-paneer.png",
        [normalizeName("Mutter Paneer")]: "/food_pics/main_course/matar-paneer.png",
        [normalizeName("Peas Paneer")]: "/food_pics/main_course/matar-paneer.png",
        // Baingan/Baigan Bharta
        [normalizeName("Baigan Bharta")]: "/food_pics/main_course/baigan-bharta.png",
        [normalizeName("Baingan Bharta")]: "/food_pics/main_course/baigan-bharta.png",
        [normalizeName("Eggplant Bharta")]: "/food_pics/main_course/baigan-bharta.png",
        // Egg Curry
        [normalizeName("Egg Curry")]: "/food_pics/main_course/egg-curry.png",
        [normalizeName("Anda Curry")]: "/food_pics/main_course/egg-curry.png",
        // Baigan/Baingan Kalonji
        [normalizeName("Baigan Kalonji")]: "/food_pics/main_course/baigan-kalonji.png",
        [normalizeName("Baingan Kalonji")]: "/food_pics/main_course/baigan-kalonji.png",
        [normalizeName("Eggplant Kalonji")]: "/food_pics/main_course/baigan-kalonji.png",
        // Palak Paneer variants
        [normalizeName("Palak Paneer")]: "/food_pics/main_course/palak-paneer.png",
        [normalizeName("Saag Paneer")]: "/food_pics/main_course/palak-paneer.png",
        [normalizeName("Spinach Paneer")]: "/food_pics/main_course/palak-paneer.png",
        // Achari Chicken
        [normalizeName("Achari Chicken")]: "/food_pics/main_course/achari-chicken.png",
        // Bhindi Fry
        [normalizeName("Bhindi Fry")]: "/food_pics/main_course/bhindi-fry.png",
        [normalizeName("Okra Fry")]: "/food_pics/main_course/bhindi-fry.png",
        // Kadhai/Kadai/Karahi Chicken variants
        [normalizeName("Kadhai Chicken")]: "/food_pics/main_course/kadhai-chicken.png",
        [normalizeName("Kadai Chicken")]: "/food_pics/main_course/kadhai-chicken.png",
        [normalizeName("Karahi Chicken")]: "/food_pics/main_course/kadhai-chicken.png",
        [normalizeName("Chicken Kadhai")]: "/food_pics/main_course/kadhai-chicken.png",
        // Aloo Gobi/Gobhi Masala variants
        [normalizeName("Aloo Gobi Masala")]: "/food_pics/main_course/aloo-gobhi-masala.png",
        [normalizeName("Aloo Gobhi Masala")]: "/food_pics/main_course/aloo-gobhi-masala.png",
        [normalizeName("Aloo Gobi")]: "/food_pics/main_course/aloo-gobhi-masala.png",
        [normalizeName("Aloo Gobhi")]: "/food_pics/main_course/aloo-gobhi-masala.png",
        // Paneer Butter Masala variants
        [normalizeName("Paneer Butter Masala")]: "/food_pics/main_course/paneer-butter-masala.png",
        [normalizeName("Paneer Makhani")]: "/food_pics/main_course/paneer-butter-masala.png",
        [normalizeName("Butter Paneer")]: "/food_pics/main_course/paneer-butter-masala.png",
        // Rajma variants
        [normalizeName("Rajma")]: "/food_pics/main_course/Rajma.png",
        [normalizeName("Rajmah")]: "/food_pics/main_course/Rajma.png",
        [normalizeName("Kidney Beans")]: "/food_pics/main_course/Rajma.png",
        [normalizeName("Red Kidney Beans")]: "/food_pics/main_course/Rajma.png"
      }
    };

    const normalizedCategory = categoryName.toLowerCase();
    const normalizedItemName = normalizeName(itemName);
    
    return itemImageMap[normalizedCategory]?.[normalizedItemName] || null;
  };

  const getDefaultImage = (categoryName: string) => {
    const defaultImages: { [key: string]: string } = {
      "Starter Items": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      "Main Course": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      "Breads": "https://images.unsplash.com/photo-1574653853027-5a3d8c4e8a8e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      "Rice": "https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      "Dessert": "https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    };
    return defaultImages[categoryName] || defaultImages["Main Course"];
  }

  const getItemImageSrc = (item: MenuItem) => {
    const categoryName = getCategoryName(item);
    
    // First try the database image_url
    if (item.image_url) {
      return item.image_url;
    }
    
    // Then try to find a specific local image for this item
    const localImage = getItemImage(categoryName, item.name);
    if (localImage) {
      return localImage;
    }
    
    // Finally fallback to category default
    return getDefaultImage(categoryName);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden sm:max-h-[80vh] max-h-[80vh] w-[calc(100vw-2rem)] sm:w-auto mx-auto mt-4 sm:mt-0">
        <DialogHeader className="pb-0">
          <DialogTitle className="sr-only">Search Menu Items</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative bg-white z-10 pb-2 border-b border-gray-200 p-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search for dishes, ingredients, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-12 text-base border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
              autoComplete="off"
              autoFocus={isOpen}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Search Results */}
          <div className="overflow-y-auto max-h-96 sm:max-h-96 max-h-[calc(80vh-200px)]">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading menu items...</p>
              </div>
            ) : searchQuery.trim() && filteredItems.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-lg font-medium text-gray-600">No menu items found</p>
                <p className="text-sm text-gray-500">
                  Try searching with different keywords like dish names, ingredients, or descriptions
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Total items: {menuItems.length} | Available: {menuItems.filter(item => item.is_available).length}
                </p>
              </div>
            ) : searchQuery.trim() ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Found <span className="font-semibold">{filteredItems.length}</span> menu items for "{searchQuery}"
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSearch}
                    className="flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear
                  </Button>
                </div>

                <div className="space-y-3">
                  {filteredItems.map((item) => (
                    <Card 
                      key={item.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500 group"
                      onClick={() => handleItemClick(item)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-4">
                          {/* Item Image */}
                          <div className="flex-shrink-0">
                            <img
                              src={getItemImageSrc(item)}
                              alt={item.name}
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg transition-transform hover:scale-105"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = getDefaultImage(getCategoryName(item));
                              }}
                            />
                          </div>
                          
                          {/* Item Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate mb-1">
                              {highlightText(item.name, searchQuery)}
                            </h3>
                            
                            <Badge variant="outline" className="text-xs mb-1">
                              {getCategoryName(item)}
                            </Badge>
                            
                            {item.description && (
                              <p className="text-sm text-gray-600 line-clamp-1">
                                {highlightText(item.description, searchQuery)}
                              </p>
                            )}
                            
                            <p className="text-xs text-blue-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to view details
                            </p>
                          </div>
                          
                          {/* Price Section */}
                          <div className="flex-shrink-0 text-right">
                            <div className="space-y-1">
                              {item.price_per_piece && (
                                <p className="text-sm font-semibold text-green-600">
                                  ${item.price_per_piece.toFixed(2)}/pc
                                </p>
                              )}
                              {item.price_per_plate && (
                                <p className="text-sm font-semibold text-green-600">
                                  ${item.price_per_plate.toFixed(2)}
                                </p>
                              )}
                              {item.price_half_tray && (
                                <p className="text-xs text-gray-600">
                                  Half Tray: ${item.price_half_tray.toFixed(2)}
                                </p>
                              )}
                              {item.price_full_tray && (
                                <p className="text-xs text-gray-600">
                                  Full Tray: ${item.price_full_tray.toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-gray-200"
                    onClick={() => setSearchQuery('chicken')}
                  >
                    chicken
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-gray-200"
                    onClick={() => setSearchQuery('spicy')}
                  >
                    spicy
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-gray-200"
                    onClick={() => setSearchQuery('vegetarian')}
                  >
                    vegetarian
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-gray-200"
                    onClick={() => setSearchQuery('rice')}
                  >
                    rice
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
      
      {/* Item Details Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              {selectedItem?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              {/* Item Image */}
              <div className="flex justify-center">
                <img
                  src={getItemImageSrc(selectedItem)}
                  alt={selectedItem.name}
                  className="w-48 h-48 object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getDefaultImage(getCategoryName(selectedItem));
                  }}
                />
              </div>
              
              {/* Item Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {getCategoryName(selectedItem)}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Item #{selectedItem.id.slice(0, 8)}
                  </span>
                </div>
                
                {selectedItem.description && (
                  <p className="text-gray-600">
                    {selectedItem.description}
                  </p>
                )}
                
                {selectedItem.ingredients && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Ingredients</h4>
                    <p className="text-sm text-gray-600">
                      {Array.isArray(selectedItem.ingredients) 
                        ? selectedItem.ingredients.join(', ') 
                        : selectedItem.ingredients}
                    </p>
                  </div>
                )}
                
                {/* Pricing */}
                <div className="border-t pt-3">
                  <h4 className="font-medium text-gray-900 mb-2">Pricing</h4>
                  <div className="space-y-2">
                    {selectedItem.price_per_piece && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Per Piece</span>
                        <span className="font-semibold text-green-600">
                          ${selectedItem.price_per_piece.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {selectedItem.price_per_plate && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Per Plate</span>
                        <span className="font-semibold text-green-600">
                          ${selectedItem.price_per_plate.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {selectedItem.price_half_tray && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Half Tray</span>
                        <span className="font-semibold text-green-600">
                          ${selectedItem.price_half_tray.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {selectedItem.price_full_tray && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Full Tray</span>
                        <span className="font-semibold text-green-600">
                          ${selectedItem.price_full_tray.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 pt-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      const route = getCategoryRoute(selectedItem)
                      navigate(route)
                      setSelectedItem(null)
                      onClose()
                    }}
                  >
                    View in Category
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => setSelectedItem(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
