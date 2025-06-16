
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle, AlertCircle, Package } from 'lucide-react'

interface PreparationItem {
  item_name: string
  size_type: string
  total_quantity: number
  status?: 'pending' | 'in_progress' | 'completed'
  estimated_time?: number
}

interface PreparationStatusCardProps {
  items: PreparationItem[]
  onStatusChange?: (itemName: string, sizeType: string, status: string) => void
}

const PreparationStatusCard = ({ items, onStatusChange }: PreparationStatusCardProps) => {
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

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <Card key={`${item.item_name}-${item.size_type}-${index}`} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-gray-500" />
                <div>
                  <h3 className="font-medium">{item.item_name}</h3>
                  <p className="text-sm text-gray-600">
                    {item.size_type} • Quantity: {item.total_quantity}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(item.status)}
                  <Badge className={getStatusColor(item.status)}>
                    {getStatusText(item.status)}
                  </Badge>
                </div>
                
                {onStatusChange && (
                  <div className="flex space-x-1">
                    {item.status !== 'in_progress' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onStatusChange(item.item_name, item.size_type, 'in_progress')}
                        className="text-orange-600 border-orange-200 hover:bg-orange-50"
                      >
                        Start
                      </Button>
                    )}
                    {item.status !== 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onStatusChange(item.item_name, item.size_type, 'completed')}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default PreparationStatusCard
