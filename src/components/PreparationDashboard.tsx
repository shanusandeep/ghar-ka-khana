import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, ChefHat, Download, Filter } from 'lucide-react'
import { ordersApi } from '@/services/api'
import { useToast } from '@/hooks/use-toast'

interface PreparationSummaryItem {
  item_name: string
  size_type: 'plate' | 'half_tray' | 'full_tray'
  total_quantity: number
}

const PreparationDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [preparationSummary, setPreparationSummary] = useState<PreparationSummaryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const { toast } = useToast()

  useEffect(() => {
    loadPreparationSummary()
  }, [selectedDate])

  const loadPreparationSummary = async () => {
    setLoading(true)
    try {
      const data = await ordersApi.getPreparationSummary(selectedDate)
      setPreparationSummary(data as PreparationSummaryItem[])
    } catch (error) {
      console.error('Error loading preparation summary:', error)
      toast({
        title: "Error",
        description: "Failed to load preparation summary",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getSizeDisplayName = (sizeType: string) => {
    switch (sizeType) {
      case 'plate': return 'Plates'
      case 'half_tray': return 'Half Trays'
      case 'full_tray': return 'Full Trays'
      default: return sizeType
    }
  }

  const getSizeBadgeColor = (sizeType: string) => {
    switch (sizeType) {
      case 'plate': return 'bg-blue-100 text-blue-800'
      case 'half_tray': return 'bg-orange-100 text-orange-800'
      case 'full_tray': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const exportPreparationList = () => {
    // Simple text export for now
    let exportText = `Preparation List for ${new Date(selectedDate).toLocaleDateString()}\n\n`
    
    preparationSummary.forEach(item => {
      exportText += `${item.item_name} - ${item.total_quantity} ${getSizeDisplayName(item.size_type)}\n`
    })
    
    const blob = new Blob([exportText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `preparation-list-${selectedDate}.txt`
    link.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: "Success",
      description: "Preparation list exported successfully"
    })
  }

  const groupedItems = preparationSummary.reduce((acc, item) => {
    if (!acc[item.item_name]) {
      acc[item.item_name] = []
    }
    acc[item.item_name].push(item)
    return acc
  }, {} as Record<string, PreparationSummaryItem[]>)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <ChefHat className="w-6 h-6" />
            <span>Kitchen Preparation Dashboard</span>
          </h2>
          <p className="text-gray-600">View preparation requirements by delivery date</p>
        </div>
        <Button onClick={exportPreparationList} disabled={preparationSummary.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export List
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="delivery-date">Delivery Date</Label>
              <Input
                id="delivery-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-filter">Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="starter">Starters</SelectItem>
                  <SelectItem value="main">Main Course</SelectItem>
                  <SelectItem value="bread">Breads</SelectItem>
                  <SelectItem value="rice">Rice</SelectItem>
                  <SelectItem value="dessert">Desserts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={loadPreparationSummary} disabled={loading}>
              <Filter className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading preparation summary...</div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.keys(groupedItems).length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <ChefHat className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No orders found for {new Date(selectedDate).toLocaleDateString()}</p>
                  <p className="text-sm">Select a different date or check if orders are confirmed.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedItems).map(([itemName, variations]) => (
              <Card key={itemName}>
                <CardHeader>
                  <CardTitle className="text-lg">{itemName}</CardTitle>
                  <CardDescription>
                    Total variations: {variations.length}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {variations.map((variation, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <Badge className={getSizeBadgeColor(variation.size_type)}>
                            {getSizeDisplayName(variation.size_type)}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {variation.total_quantity}
                          </div>
                          <div className="text-sm text-gray-500">
                            {variation.size_type === 'plate' ? 'plates' : 'trays'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default PreparationDashboard
