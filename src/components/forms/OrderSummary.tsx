
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
    <div className="flex space-x-4">
      <Button 
        type="button" 
        disabled={loading || orderItems.length === 0}
        onClick={onSubmit}
      >
        {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Order' : 'Create Order')}
      </Button>
      <Button type="button" variant="outline" onClick={onClose}>
        Cancel
      </Button>
    </div>
  )
}

export default OrderSummary
