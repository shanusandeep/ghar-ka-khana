
import { Button } from '@/components/ui/button'

interface OrderSummaryProps {
  loading: boolean
  orderItems: any[]
  onSubmit: () => void
  onClose: () => void
}

const OrderSummary = ({ loading, orderItems, onSubmit, onClose }: OrderSummaryProps) => {
  return (
    <div className="flex space-x-4">
      <Button 
        type="button" 
        disabled={loading || orderItems.length === 0}
        onClick={onSubmit}
      >
        {loading ? 'Creating...' : 'Create Order'}
      </Button>
      <Button type="button" variant="outline" onClick={onClose}>
        Cancel
      </Button>
    </div>
  )
}

export default OrderSummary
