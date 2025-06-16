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
  // Get today's date in local timezone
  const today = new Date()
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const [selectedDate, setSelectedDate] = useState(todayString)
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
      console.log('Loading preparation summary for date:', selectedDate)
      const data = await ordersApi.getPreparationSummary(selectedDate)
      console.log('Preparation summary data:', data)
      setPreparationSummary(data as PreparationSummaryItem[])
      
      if (data.length === 0) {
        // Also try to get all orders for debugging
        const allOrders = await ordersApi.getAll()
        console.log('All orders in system:', allOrders)
        const ordersForDate = await ordersApi.getByDate(selectedDate)
        console.log('Orders for selected date:', ordersForDate)
      }
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
    // Create HTML content for PDF
    const date = new Date(selectedDate).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Kitchen Preparation List - ${date}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #f97316;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #f97316;
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .header h2 {
            color: #666;
            margin: 5px 0 0 0;
            font-size: 18px;
            font-weight: normal;
          }
          .summary {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 25px;
            border-left: 4px solid #f97316;
          }
          .summary-item {
            display: inline-block;
            margin-right: 30px;
            font-weight: 600;
          }
          .items-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          .item-card {
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .item-name {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 8px;
          }
          .size-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            padding: 8px 12px;
            background: #f9fafb;
            border-radius: 6px;
          }
          .size-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .size-badge.plate { background: #dbeafe; color: #1e40af; }
          .size-badge.half_tray { background: #fed7aa; color: #c2410c; }
          .size-badge.full_tray { background: #dcfce7; color: #166534; }
          .quantity {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
          }
          .total-row {
            border-top: 2px solid #e5e7eb;
            margin-top: 15px;
            padding-top: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f0fdf4;
            padding: 12px;
            border-radius: 6px;
          }
          .total-label {
            font-weight: bold;
            color: #166534;
          }
          .total-quantity {
            font-size: 18px;
            font-weight: bold;
            color: #166534;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #666;
            font-size: 12px;
          }
          @media print {
            body { margin: 0; }
            .item-card { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🍽️ Kitchen Preparation List</h1>
          <h2>${date}</h2>
        </div>
    `
    
    // Add summary
    const totalItems = Object.keys(groupedItems).length
    const totalQuantity = Object.values(groupedItems).reduce((sum, sizes) => 
      sum + sizes.reduce((sizeSum, size) => sizeSum + size.total_quantity, 0), 0
    )
    
    htmlContent += `
        <div class="summary">
          <div class="summary-item">📋 Total Items: ${totalItems}</div>
          <div class="summary-item">📦 Total Quantity: ${totalQuantity}</div>
          <div class="summary-item">📅 Delivery Date: ${date}</div>
        </div>
        
        <div class="items-grid">
    `
    
    // Add items
    Object.entries(groupedItems).forEach(([itemName, sizes]) => {
      htmlContent += `
          <div class="item-card">
            <div class="item-name">${itemName}</div>
      `
      
      sizes.forEach(sizeItem => {
        const sizeClass = sizeItem.size_type
        htmlContent += `
            <div class="size-row">
              <span class="size-badge ${sizeClass}">${getSizeDisplayName(sizeItem.size_type)}</span>
              <span class="quantity">${sizeItem.total_quantity}</span>
            </div>
        `
      })
      
      if (sizes.length > 1) {
        const total = sizes.reduce((sum, size) => sum + size.total_quantity, 0)
        htmlContent += `
            <div class="total-row">
              <span class="total-label">Total</span>
              <span class="total-quantity">${total}</span>
            </div>
        `
      }
      
      htmlContent += `</div>`
    })
    
    htmlContent += `
        </div>
        
        <div class="footer">
          Generated on ${new Date().toLocaleString('en-IN')} | Ghar Ka Khana Kitchen Management
        </div>
      </body>
      </html>
    `
    
    // Create and download PDF
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 500)
      }
    }
    
    toast({
      title: "Success",
      description: "Preparation list PDF generated successfully"
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center space-x-2">
            <ChefHat className="w-6 h-6" />
            <span>Kitchen Preparation Dashboard</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">View preparation requirements by delivery date</p>
        </div>
        <Button onClick={exportPreparationList} disabled={preparationSummary.length === 0} className="w-full sm:w-auto">
          <Download className="w-4 h-4 mr-2" />
          Export List
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2 w-full sm:w-auto">
              <Label htmlFor="delivery-date">Delivery Date</Label>
              <Input
                id="delivery-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-40"
              />
            </div>
            <div className="space-y-2 w-full sm:w-auto">
              <Label htmlFor="category-filter">Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-40">
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
            <Button onClick={loadPreparationSummary} disabled={loading} className="w-full sm:w-auto">
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
                  <p className="text-sm">Selected date: {selectedDate}</p>
                  <p className="text-sm">Looking for orders with status: received</p>
                  <p className="text-sm">Try selecting a different date or create some orders first.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Object.entries(groupedItems).map(([itemName, sizes]) => (
                <Card key={itemName} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold truncate" title={itemName}>
                      {itemName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {sizes.map((sizeItem, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <Badge className={getSizeBadgeColor(sizeItem.size_type)}>
                            {getSizeDisplayName(sizeItem.size_type)}
                          </Badge>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">
                              {sizeItem.total_quantity}
                            </div>
                            <div className="text-xs text-gray-500">
                              {sizeItem.size_type === 'plate' ? 'plates' : 'trays'}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Total for this item across all sizes */}
                      {sizes.length > 1 && (
                        <div className="border-t pt-2 mt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Total</span>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">
                                {sizes.reduce((sum, size) => sum + size.total_quantity, 0)}
                              </div>
                              <div className="text-xs text-gray-500">all sizes</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PreparationDashboard
