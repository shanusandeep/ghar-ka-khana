
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calendar, RefreshCw, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { ordersApi } from '@/services/api'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface PreparationItem {
  item_name: string
  size_type: string
  total_quantity: number
  status?: 'pending' | 'in_progress' | 'completed'
}

interface ApiPreparationItem {
  item_name: string
  size_type: string
  total_quantity: number
}

const PreparationDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [preparationItems, setPreparationItems] = useState<PreparationItem[]>([])
  const [loading, setLoading] = useState(false)
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
      
      // Add default status to items with proper typing
      const itemsWithStatus: PreparationItem[] = (data as ApiPreparationItem[]).map((item: ApiPreparationItem) => ({
        item_name: item.item_name,
        size_type: item.size_type,
        total_quantity: item.total_quantity,
        status: 'pending' as const
      }))
      
      setPreparationItems(itemsWithStatus)
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

  const handleStatusChange = (itemName: string, sizeType: string, newStatus: string) => {
    setPreparationItems(prev => 
      prev.map(item => 
        item.item_name === itemName && item.size_type === sizeType
          ? { ...item, status: newStatus as 'pending' | 'in_progress' | 'completed' }
          : item
      )
    )
    
    toast({
      title: "Status Updated",
      description: `${itemName} (${sizeType}) marked as ${newStatus.replace('_', ' ')}`,
    })
  }

  const getStatusStats = () => {
    const stats = preparationItems.reduce((acc: Record<string, number>, item) => {
      const status = item.status || 'pending'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    return {
      pending: stats.pending || 0,
      in_progress: stats.in_progress || 0,
      completed: stats.completed || 0,
      total: preparationItems.length
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-orange-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-red-100 text-red-800 border-red-200'
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in_progress':
        return 'In Progress'
      default:
        return 'Pending'
    }
  }

  const stats = getStatusStats()
  const completionPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Preparation Dashboard</h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Track preparation status for delivery date: {format(new Date(selectedDate), 'PPP')}
          </p>
        </div>
        <Button 
          onClick={loadPreparationSummary} 
          disabled={loading}
          className="w-full sm:w-auto"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Select Delivery Date</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="space-y-2">
              <Label htmlFor="date">Delivery Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-auto"
              />
            </div>
            <div className="text-sm text-gray-600 mt-2 sm:mt-6">
              Showing preparation requirements for orders scheduled for delivery on this date
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Package className="w-5 h-5 text-blue-500" />
              <span className="text-2xl font-bold text-blue-600">{stats.total}</span>
            </div>
            <div className="text-sm text-gray-600">Total Items</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-2xl font-bold text-red-600">{stats.pending}</span>
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold text-orange-600">{stats.in_progress}</span>
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold text-green-600">{stats.completed}</span>
            </div>
            <div className="text-sm text-gray-600">Completed ({completionPercentage}%)</div>
          </CardContent>
        </Card>
      </div>

      {/* Preparation Items */}
      <Card>
        <CardHeader>
          <CardTitle>Preparation Items</CardTitle>
          <CardDescription>
            {preparationItems.length === 0 
              ? 'No items to prepare for the selected date.'
              : `${preparationItems.length} items need to be prepared for ${format(new Date(selectedDate), 'PPP')}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p>Loading preparation summary...</p>
            </div>
          ) : preparationItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No items to prepare for this date.</p>
              <p className="text-sm">Try selecting a different date or check if there are any orders for this date.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {preparationItems.map((item, index) => (
                <Card key={`${item.item_name}-${item.size_type}-${index}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        <Package className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium">{item.item_name}</h3>
                          <p className="text-sm text-gray-600">
                            {item.size_type} • Quantity: {item.total_quantity}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(item.status)}
                          <Badge className={getStatusColor(item.status)}>
                            {getStatusText(item.status)}
                          </Badge>
                        </div>
                        
                        <div className="flex space-x-1">
                          {item.status !== 'in_progress' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(item.item_name, item.size_type, 'in_progress')}
                              className="text-orange-600 border-orange-200 hover:bg-orange-50"
                            >
                              Start
                            </Button>
                          )}
                          {item.status !== 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(item.item_name, item.size_type, 'completed')}
                              className="text-green-600 border-green-200 hover:bg-green-50"
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PreparationDashboard
