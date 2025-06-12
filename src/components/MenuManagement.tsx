
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Plus, Edit, Trash2, Package } from 'lucide-react'
import { menuCategoriesApi, menuItemsApi } from '@/services/api'
import { MenuCategory, MenuItem } from '@/config/supabase'
import { useToast } from '@/hooks/use-toast'

const MenuManagement = () => {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isNewItemOpen, setIsNewItemOpen] = useState(false)
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Menu Management</h2>
          <p className="text-gray-600">Manage menu categories and items</p>
        </div>
        <div className="flex space-x-2">
          <Sheet open={isNewCategoryOpen} onOpenChange={setIsNewCategoryOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
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
                <p className="text-center text-gray-500">Category form coming soon...</p>
              </div>
            </SheetContent>
          </Sheet>
          
          <Sheet open={isNewItemOpen} onOpenChange={setIsNewItemOpen}>
            <SheetTrigger asChild>
              <Button className="flex items-center space-x-2">
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
                <p className="text-center text-gray-500">Menu item form coming soon...</p>
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
          {categories.map((category) => {
            const categoryItems = items.filter(item => item.category_id === category.id)
            
            return (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="w-5 h-5" />
                    <span>{category.name}</span>
                    <Badge variant="secondary">{categoryItems.length} items</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryItems.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No items in this category</p>
                  ) : (
                    <div className="grid gap-4">
                      {categoryItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.name}</h4>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            )}
                            <div className="flex space-x-4 mt-2 text-sm">
                              {item.price_per_plate && (
                                <span>Plate: ${item.price_per_plate}</span>
                              )}
                              {item.price_half_tray && (
                                <span>Half Tray: ${item.price_half_tray}</span>
                              )}
                              {item.price_full_tray && (
                                <span>Full Tray: ${item.price_full_tray}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`available-${item.id}`} className="text-sm">
                                Available
                              </Label>
                              <Switch
                                id={`available-${item.id}`}
                                checked={item.is_available}
                                onCheckedChange={(checked) => toggleItemAvailability(item.id, checked)}
                              />
                            </div>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
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
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
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
    </div>
  )
}

export default MenuManagement
