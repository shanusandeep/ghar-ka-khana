
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Plus, Edit, Trash2, Package, ChevronDown, ChevronUp, Search, X } from 'lucide-react'
import { menuCategoriesApi, menuItemsApi } from '@/services/api'
import { MenuCategory, MenuItem } from '@/config/supabase'
import { useToast } from '@/hooks/use-toast'
import AddCategoryForm from './AddCategoryForm'
import MenuItemForm from './MenuItemForm'
import ConfirmationDialog from './ConfirmationDialog'

const MenuManagement = () => {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isNewItemOpen, setIsNewItemOpen] = useState(false)
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const loadData = async () => {
    try {
      const [categoriesData, itemsData] = await Promise.all([
        menuCategoriesApi.getAll(),
        menuItemsApi.getAll()
      ])
      setCategories(categoriesData)
      setItems(itemsData)
    } catch (error) {
      console.error('Error loading menu data:', error)
      toast({
        title: "Error",
        description: "Failed to load menu data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleItemAvailability = async (itemId: string, isAvailable: boolean) => {
    try {
      await menuItemsApi.update(itemId, { is_available: isAvailable })
      await loadData()
      toast({
        title: "Success",
        description: `Item ${isAvailable ? 'enabled' : 'disabled'} successfully`
      })
    } catch (error) {
      console.error('Error updating item:', error)
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive"
      })
    }
  }

  const deleteMenuItem = async () => {
    if (!deletingItem) return

    setDeleteLoading(true)
    try {
      await menuItemsApi.delete(deletingItem.id)
      await loadData()
      setDeletingItem(null)
      toast({
        title: "Success",
        description: "Menu item deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting menu item:', error)
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive"
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleCategoryAdded = () => {
    loadData()
    setIsNewCategoryOpen(false)
  }

  const handleItemSaved = () => {
    loadData()
    setIsNewItemOpen(false)
    setEditingItem(null)
  }

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const filterItems = (categoryItems: MenuItem[]) => {
    if (!searchQuery.trim()) return categoryItems
    
    const query = searchQuery.toLowerCase()
    return categoryItems.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.ingredients?.some(ingredient => ingredient.toLowerCase().includes(query))
    )
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading menu data...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Menu Management</h2>
          <p className="text-gray-600 text-sm sm:text-base">Manage menu categories and items</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Sheet open={isNewCategoryOpen} onOpenChange={setIsNewCategoryOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                <span>Category</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add New Category</SheetTitle>
                <SheetDescription>Create a new menu category</SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <AddCategoryForm 
                  onCategoryAdded={handleCategoryAdded}
                  onClose={() => setIsNewCategoryOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
          
          <Sheet open={isNewItemOpen} onOpenChange={setIsNewItemOpen}>
            <SheetTrigger asChild>
              <Button className="flex items-center space-x-2 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                <span>Menu Item</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add New Menu Item</SheetTitle>
                <SheetDescription>Create a new menu item</SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <MenuItemForm 
                  onItemSaved={handleItemSaved}
                  onClose={() => setIsNewItemOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Tabs defaultValue="items" className="space-y-6">
        <TabsList>
          <TabsTrigger value="items">Menu Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search menu items by name, description, or ingredients... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {searchQuery && (
              <div className="text-sm text-gray-500 mt-2">
                Searching for: <span className="font-medium">"{searchQuery}"</span>
                {(() => {
                  const totalResults = categories.reduce((total, category) => {
                    const categoryItems = items.filter(item => item.category_id === category.id)
                    const filteredItems = filterItems(categoryItems)
                    return total + filteredItems.length
                  }, 0)
                  return (
                    <span className="ml-2">
                      ({totalResults} result{totalResults !== 1 ? 's' : ''} found)
                    </span>
                  )
                })()}
              </div>
            )}
          </div>

          {categories.map((category) => {
            const categoryItems = items.filter(item => item.category_id === category.id)
            const filteredItems = filterItems(categoryItems)
            const isExpanded = expandedCategories.has(category.id)
            
            // Hide categories with no matching items when searching
            if (searchQuery && filteredItems.length === 0) {
              return null
            }
            
            return (
              <Card key={category.id} className="overflow-hidden">
                {/* Collapsible Category Header */}
                <CardHeader className="pb-0">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full text-left group hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                  >
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Package className="w-5 h-5" />
                        <span>{category.name}</span>
                        <Badge variant="secondary">
                          {searchQuery ? `${filteredItems.length}/${categoryItems.length}` : `${categoryItems.length}`} items
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
                        )}
                      </div>
                    </CardTitle>
                  </button>
                </CardHeader>

                {/* Expandable Content */}
                {(isExpanded || searchQuery) && (
                  <CardContent className="pt-4">
                    {filteredItems.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        {searchQuery ? 'No items match your search criteria' : 'No items in this category'}
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredItems.map((item) => (
                          <Card key={item.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              {/* Item Image */}
                              {item.image_url && (
                                <div className="mb-3">
                                  <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-full h-32 object-cover rounded-lg"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                              
                              {/* Item Info */}
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm line-clamp-2">
                                  {searchQuery ? highlightText(item.name, searchQuery) : item.name}
                                </h4>
                                
                                {item.description && (
                                  <p className="text-xs text-gray-600 line-clamp-2">
                                    {searchQuery ? highlightText(item.description, searchQuery) : item.description}
                                  </p>
                                )}
                                
                                {/* Pricing */}
                                <div className="text-xs space-y-1">
                                  {item.price_per_plate && (
                                    <div>Plate: <span className="font-medium">${item.price_per_plate}</span></div>
                                  )}
                                  {item.price_half_tray && (
                                    <div>Half Tray: <span className="font-medium">${item.price_half_tray}</span></div>
                                  )}
                                  {item.price_full_tray && (
                                    <div>Full Tray: <span className="font-medium">${item.price_full_tray}</span></div>
                                  )}
                                </div>
                                
                                {/* Availability Toggle */}
                                <div className="flex items-center justify-between pt-2 border-t">
                                  <div className="flex items-center space-x-2">
                                    <Label htmlFor={`available-${item.id}`} className="text-xs">
                                      Available
                                    </Label>
                                    <Switch
                                      id={`available-${item.id}`}
                                      checked={item.is_available}
                                      onCheckedChange={(checked) => toggleItemAvailability(item.id, checked)}
                                      className="scale-75"
                                    />
                                  </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex space-x-1 pt-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setEditingItem(item)}
                                    className="flex-1 text-xs h-8"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setDeletingItem(item)}
                                    className="flex-1 text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="flex-1">
                      <CardTitle>{category.name}</CardTitle>
                      {category.description && (
                        <CardDescription>{category.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-600 gap-2 sm:gap-0">
                    <span>Display Order: {category.display_order}</span>
                    <Badge variant={category.is_active ? "default" : "secondary"}>
                      {category.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Item Sheet */}
      <Sheet open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Menu Item</SheetTitle>
            <SheetDescription>Update menu item details</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {editingItem && (
              <MenuItemForm 
                item={editingItem}
                onItemSaved={handleItemSaved}
                onClose={() => setEditingItem(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={!!deletingItem}
        onOpenChange={() => setDeletingItem(null)}
        title="Delete Menu Item"
        description={
          <div>
            Are you sure you want to delete <strong>{deletingItem?.name}</strong>?
            <br />
            This action cannot be undone and will permanently remove the menu item.
          </div>
        }
        confirmText="Delete Item"
        onConfirm={deleteMenuItem}
        destructive={true}
        loading={deleteLoading}
      />
    </div>
  )
}

export default MenuManagement
