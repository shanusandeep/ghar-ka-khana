import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Eye, EyeOff, Calendar, Save, X, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { todaysMenuApi, menuItemsApi, menuCategoriesApi } from '@/services/api'
import { format } from 'date-fns'

interface TodaysMenuManagementProps {
  selectedDate?: string
}

const TodaysMenuManagement = ({ selectedDate }: TodaysMenuManagementProps) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || format(new Date(), 'yyyy-MM-dd'))
  const [todaysMenuItems, setTodaysMenuItems] = useState<any[]>([])
  const [allMenuItems, setAllMenuItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteValue, setNoteValue] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [currentDate])

  const loadData = async () => {
    try {
      setLoading(true)
      const [todaysMenu, menuItems, menuCategories] = await Promise.all([
        todaysMenuApi.getForDateAdmin(currentDate),
        menuItemsApi.getAll(),
        menuCategoriesApi.getAll()
      ])
      
      setTodaysMenuItems(todaysMenu || [])
      setAllMenuItems(menuItems || [])
      setCategories(menuCategories || [])
    } catch (error) {
      console.error('Error loading today\'s menu data:', error)
      
      // Check if it's a table not found error
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message
        if (errorMessage.includes('relation "todays_menu" does not exist')) {
          toast({
            title: "Database Setup Required",
            description: "Please run the database migration to create the todays_menu table. Check the console for SQL commands.",
            variant: "destructive"
          })
          console.log(`
🗄️ DATABASE SETUP REQUIRED:

Please run this SQL in your Supabase SQL Editor:

-- Create todays_menu table
CREATE TABLE IF NOT EXISTS todays_menu (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  special_note TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(menu_item_id, date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_todays_menu_date ON todays_menu(date);
CREATE INDEX IF NOT EXISTS idx_todays_menu_item_date ON todays_menu(menu_item_id, date);
CREATE INDEX IF NOT EXISTS idx_todays_menu_available ON todays_menu(date, is_available);

-- Add trigger
CREATE OR REPLACE FUNCTION update_todays_menu_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_todays_menu_updated_at
  BEFORE UPDATE ON todays_menu
  FOR EACH ROW
  EXECUTE FUNCTION update_todays_menu_updated_at();
          `)
        } else {
          toast({
            title: "Error",
            description: "Failed to load today's menu data",
            variant: "destructive"
          })
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to load today's menu data",
          variant: "destructive"
        })
      }
      
      // Set empty state to allow UI to render
      setTodaysMenuItems([])
      setAllMenuItems([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async (menuItemId: string) => {
    try {
      await todaysMenuApi.add(menuItemId, currentDate)
      await loadData()
      setIsAddDialogOpen(false)
      toast({
        title: "Success",
        description: "Item added to today's menu"
      })
    } catch (error) {
      console.error('Error adding item:', error)
      toast({
        title: "Error",
        description: "Failed to add item to today's menu",
        variant: "destructive"
      })
    }
  }

  const handleRemoveItem = async (id: string) => {
    try {
      await todaysMenuApi.remove(id)
      await loadData()
      toast({
        title: "Success",
        description: "Item removed from today's menu"
      })
    } catch (error) {
      console.error('Error removing item:', error)
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive"
      })
    }
  }

  const handleToggleAvailability = async (id: string, isAvailable: boolean) => {
    try {
      await todaysMenuApi.toggleAvailability(id, isAvailable)
      await loadData()
      toast({
        title: "Success",
        description: `Item ${isAvailable ? 'enabled' : 'disabled'} for today's menu`
      })
    } catch (error) {
      console.error('Error toggling availability:', error)
      toast({
        title: "Error",
        description: "Failed to update item availability",
        variant: "destructive"
      })
    }
  }

  const handleSaveNote = async (id: string) => {
    try {
      await todaysMenuApi.updateNote(id, noteValue)
      setEditingNote(null)
      setNoteValue('')
      await loadData()
      toast({
        title: "Success",
        description: "Special note updated"
      })
    } catch (error) {
      console.error('Error updating note:', error)
      toast({
        title: "Error",
        description: "Failed to update special note",
        variant: "destructive"
      })
    }
  }

  const handleClearMenu = async () => {
    if (confirm('Are you sure you want to clear all items from today\'s menu?')) {
      try {
        await todaysMenuApi.clearForDate(currentDate)
        await loadData()
        toast({
          title: "Success",
          description: "Today's menu cleared"
        })
      } catch (error) {
        console.error('Error clearing menu:', error)
        toast({
          title: "Error",
          description: "Failed to clear today's menu",
          variant: "destructive"
        })
      }
    }
  }

  const getAvailableMenuItems = () => {
    const todaysItemIds = todaysMenuItems.map(item => item.menu_item_id)
    return allMenuItems.filter(item => 
      !todaysItemIds.includes(item.id) && 
      item.is_available &&
      (selectedCategory === 'all' || 
       (item.menu_categories && item.menu_categories.name === selectedCategory)) &&
      (searchQuery === '' || 
       item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())))
    )
  }

  const getCategoryName = (item: any) => {
    return item.menu_items?.menu_categories?.name || 'Unknown Category'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Today's Menu Management</h2>
          <p className="text-gray-600">Manage items available for pickup today</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <Input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="w-auto"
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Items
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Add Items to Today's Menu</DialogTitle>
                <DialogDescription>
                  Select items to add to today's menu for {format(new Date(currentDate), 'MMMM dd, yyyy')}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Search and Filter */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Available Items */}
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {getAvailableMenuItems().map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{item.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {item.menu_categories?.name || 'No Category'}
                          </Badge>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleAddItem(item.id)}
                        className="ml-4"
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                  
                  {getAvailableMenuItems().length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>No available items found</p>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {todaysMenuItems.length > 0 && (
            <Button variant="outline" onClick={handleClearMenu}>
              Clear Menu
            </Button>
          )}
        </div>
      </div>

      {/* Today's Menu Items */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading today's menu...</p>
        </div>
      ) : todaysMenuItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items in today's menu</h3>
            <p className="text-gray-500 mb-4">Add items to create today's special menu</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {todaysMenuItems.map((item) => (
            <Card key={item.id} className={`transition-colors ${!item.is_available ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{item.menu_items?.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {getCategoryName(item)}
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <Switch
                      checked={item.is_available}
                      onCheckedChange={(checked) => handleToggleAvailability(item.id, checked)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {item.menu_items?.description && (
                  <p className="text-sm text-gray-600">{item.menu_items.description}</p>
                )}
                
                {/* Pricing */}
                <div className="text-sm space-y-1">
                  {item.menu_items?.price_per_piece && (
                    <p className="text-green-600 font-medium">
                      ${item.menu_items.price_per_piece.toFixed(2)} per piece
                    </p>
                  )}
                  {item.menu_items?.price_per_plate && (
                    <p className="text-green-600 font-medium">
                      Plate: ${item.menu_items.price_per_plate.toFixed(2)}
                    </p>
                  )}
                  {item.menu_items?.price_half_tray && (
                    <p className="text-green-600">
                      Half Tray: ${item.menu_items.price_half_tray.toFixed(2)}
                    </p>
                  )}
                  {item.menu_items?.price_full_tray && (
                    <p className="text-green-600">
                      Full Tray: ${item.menu_items.price_full_tray.toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Special Note */}
                <div>
                  <Label className="text-xs text-gray-500">Special Note for Today</Label>
                  {editingNote === item.id ? (
                    <div className="flex gap-2 mt-1">
                      <Textarea
                        value={noteValue}
                        onChange={(e) => setNoteValue(e.target.value)}
                        placeholder="Add special note for today..."
                        className="text-sm"
                        rows={2}
                      />
                      <div className="flex flex-col gap-1">
                        <Button size="sm" onClick={() => handleSaveNote(item.id)}>
                          <Save className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            setEditingNote(null)
                            setNoteValue('')
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="text-sm p-2 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 min-h-[2.5rem] flex items-center"
                      onClick={() => {
                        setEditingNote(item.id)
                        setNoteValue(item.special_note || '')
                      }}
                    >
                      {item.special_note || (
                        <span className="text-gray-400 italic">Click to add special note...</span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default TodaysMenuManagement
