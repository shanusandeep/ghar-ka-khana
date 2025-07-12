
import { Button } from '@/components/ui/button'

interface OrderSummaryProps {
  loading: boolean
  orderItems: any[]
  onSubmit: () => void
  onClose: () => void
  isEditing?: boolean
}

const OrderSummary = ({ loading, orderItems, onSubmit, onClose, isEditing = false }: OrderSummaryProps) => {
  return (
    <div className="flex justify-between items-center gap-4">
      <div className="text-sm text-gray-600">
        {orderItems.length} item{orderItems.length !== 1 ? 's' : ''} in order
      </div>
      <div className="flex space-x-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          className="min-w-20"
        >
          Cancel
        </Button>
        <Button 
          type="button" 
          disabled={loading || orderItems.length === 0}
          onClick={onSubmit}
          className="min-w-32"
        >
          {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Order' : 'Create Order')}
        </Button>
      </div>
    </div>
  )
}

export default OrderSummary
