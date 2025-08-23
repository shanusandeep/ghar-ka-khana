
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { menuItemsApi, menuCategoriesApi } from '@/services/api'
import { MenuCategory, MenuItem } from '@/config/supabase'
import { useToast } from '@/hooks/use-toast'

interface MenuItemFormProps {
  item?: MenuItem
  onItemSaved: () => void
  onClose: () => void
}

const MenuItemForm = ({ item, onItemSaved, onClose }: MenuItemFormProps) => {
  const [name, setName] = useState(item?.name || '')
  const [description, setDescription] = useState(item?.description || '')
  const [categoryId, setCategoryId] = useState(item?.category_id || '')
  const [pricePlate, setPricePlate] = useState(item?.price_per_plate?.toString() || '')
  const [priceHalfTray, setPriceHalfTray] = useState(item?.price_half_tray?.toString() || '')
  const [priceFullTray, setPriceFullTray] = useState(item?.price_full_tray?.toString() || '')
  const [pricePerPiece, setPricePerPiece] = useState(item?.price_per_piece?.toString() || '')
  const [piecesPerPlate, setPiecesPerPlate] = useState(item?.pieces_per_plate?.toString() || '')
  const [minPieceOrder, setMinPieceOrder] = useState(item?.min_piece_order?.toString() || '')
  const [ingredients, setIngredients] = useState<string[]>(item?.ingredients || [])
  const [newIngredient, setNewIngredient] = useState('')
  const [imageUrl, setImageUrl] = useState(item?.image_url || '')
  const [isAvailable, setIsAvailable] = useState(item?.is_available ?? true)
  const [displayOrder, setDisplayOrder] = useState(item?.display_order?.toString() || '')
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const isEditing = !!item
  const isUserTyping = useRef(false)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  // Update form fields when item ID changes (more stable than entire item object)
  useEffect(() => {
    if (item && !isUserTyping.current) {
      console.log('Item ID changed, updating form fields:', item.id)
      setName(item.name || '')
      setDescription(item.description || '')
      setCategoryId(item.category_id || '')
      setPricePlate(item.price_per_plate?.toString() || '')
      setPriceHalfTray(item.price_half_tray?.toString() || '')
      setPriceFullTray(item.price_full_tray?.toString() || '')
      setPricePerPiece(item.price_per_piece?.toString() || '')
      setPiecesPerPlate(item.pieces_per_plate?.toString() || '')
      setMinPieceOrder(item.min_piece_order?.toString() || '')
      setIngredients(item.ingredients || [])
      setImageUrl(item.image_url || '')
      setIsAvailable(item.is_available ?? true)
      setDisplayOrder(item.display_order?.toString() || '')
    }
  }, [item?.id])

  const loadCategories = async () => {
    try {
      const data = await menuCategoriesApi.getAll()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const addIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()])
      setNewIngredient('')
    }
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🔄 Form submitted with description:', description)
    
    if (!name.trim() || !categoryId) {
      toast({
        title: "Error",
        description: "Name and category are required",
        variant: "destructive"
      })
      return
    }

    if (!pricePlate && !priceHalfTray && !priceFullTray && !pricePerPiece) {
      toast({
        title: "Error",
        description: "At least one price must be specified",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Get description directly from the textarea ref to avoid state issues
      const currentDescription = descriptionRef.current?.value?.trim() || description.trim()
      
      const itemData = {
        name: name.trim(),
        description: currentDescription || undefined,
        category_id: categoryId,
        price_per_plate: pricePlate ? parseFloat(pricePlate) : undefined,
        price_half_tray: priceHalfTray ? parseFloat(priceHalfTray) : undefined,
        price_full_tray: priceFullTray ? parseFloat(priceFullTray) : undefined,
        price_per_piece: pricePerPiece ? parseFloat(pricePerPiece) : undefined,
        pieces_per_plate: piecesPerPlate ? parseInt(piecesPerPlate) : undefined,
        min_piece_order: minPieceOrder ? parseInt(minPieceOrder) : undefined,
        ingredients: ingredients.length > 0 ? ingredients : undefined,
        image_url: imageUrl.trim() || undefined,
        is_available: isAvailable,
        display_order: displayOrder ? parseInt(displayOrder) : 0
      }

      console.log('📝 Submitting item data:', itemData)
      console.log('📝 Description value being saved:', currentDescription)
      console.log('📝 Description from state:', description.trim())
      console.log('📝 Description from ref:', descriptionRef.current?.value)

      if (isEditing) {
        console.log('📝 Updating item with ID:', item.id)
        const result = await menuItemsApi.update(item.id, itemData)
        console.log('✅ Update result:', result)
        toast({
          title: "Success",
          description: "Menu item updated successfully"
        })
      } else {
        console.log('📝 Creating new item')
        const result = await menuItemsApi.create(itemData)
        console.log('✅ Create result:', result)
        toast({
          title: "Success",
          description: "Menu item created successfully"
        })
      }
      
      onItemSaved()
      onClose()
    } catch (error) {
      console.error('❌ Error saving menu item:', error)
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} menu item: ${error.message}`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="item-name">Item Name *</Label>
              <Input
                id="item-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter item name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              ref={descriptionRef}
              id="description"
              defaultValue={description}
              onChange={(e) => {
                console.log('Description changing:', e.target.value)
                isUserTyping.current = true
                setDescription(e.target.value)
              }}
              onBlur={() => {
                isUserTyping.current = false
              }}
              placeholder="Enter item description"
              rows={3}
              disabled={loading}
              className="min-h-[80px] resize-none"
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Standard Pricing (Plate/Tray)</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <Label htmlFor="price-plate">Price per Plate ($)</Label>
                  <Input
                    id="price-plate"
                    type="number"
                    step="0.01"
                    value={pricePlate}
                    onChange={(e) => setPricePlate(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="price-half-tray">Price Half Tray ($)</Label>
                  <Input
                    id="price-half-tray"
                    type="number"
                    step="0.01"
                    value={priceHalfTray}
                    onChange={(e) => setPriceHalfTray(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="price-full-tray">Price Full Tray ($)</Label>
                  <Input
                    id="price-full-tray"
                    type="number"
                    step="0.01"
                    value={priceFullTray}
                    onChange={(e) => setPriceFullTray(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold">Piece-Based Pricing (for Breads, etc.)</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <Label htmlFor="price-per-piece">Price per Piece ($)</Label>
                  <Input
                    id="price-per-piece"
                    type="number"
                    step="0.01"
                    value={pricePerPiece}
                    onChange={(e) => setPricePerPiece(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="pieces-per-plate">Pieces per Plate</Label>
                  <Input
                    id="pieces-per-plate"
                    type="number"
                    value={piecesPerPlate}
                    onChange={(e) => setPiecesPerPlate(e.target.value)}
                    placeholder="e.g., 4"
                    min="1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="min-piece-order">Minimum Piece Order</Label>
                  <Input
                    id="min-piece-order"
                    type="number"
                    value={minPieceOrder}
                    onChange={(e) => setMinPieceOrder(e.target.value)}
                    placeholder="e.g., 2"
                    min="1"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Use piece-based pricing for items like rotis, parathas, pooris where customers order by quantity
              </p>
            </div>
          </div>
          
          <div>
            <Label htmlFor="ingredients">Ingredients</Label>
            <div className="flex space-x-2 mb-2">
              <Input
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                placeholder="Add ingredient"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
              />
              <Button type="button" onClick={addIngredient}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {ingredient}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeIngredient(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <Label htmlFor="image-url">Image URL</Label>
            <Input
              id="image-url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is-available"
                checked={isAvailable}
                onCheckedChange={setIsAvailable}
              />
              <Label htmlFor="is-available">Available</Label>
            </div>
            
            <div>
              <Label htmlFor="display-order">Display Order</Label>
              <Input
                id="display-order"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Update Item' : 'Create Item')}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default MenuItemForm
