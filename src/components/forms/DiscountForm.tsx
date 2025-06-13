import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Percent, DollarSign } from 'lucide-react'

interface DiscountFormProps {
  discountType: 'percentage' | 'fixed'
  setDiscountType: (type: 'percentage' | 'fixed') => void
  discountValue: number
  setDiscountValue: (value: number) => void
  subtotalAmount: number
  discountAmount: number
  totalAmount: number
}

const DiscountForm = ({
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
  subtotalAmount,
  discountAmount,
  totalAmount
}: DiscountFormProps) => {
  const handleDiscountValueChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    
    // Validation for percentage (0-100)
    if (discountType === 'percentage' && numValue > 100) {
      setDiscountValue(100)
    } else if (numValue < 0) {
      setDiscountValue(0)
    } else {
      setDiscountValue(numValue)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Discount & Total
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Discount Type and Value */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="discount-type">Discount Type</Label>
            <Select value={discountType} onValueChange={(value: 'percentage' | 'fixed') => setDiscountType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4" />
                    Percentage
                  </div>
                </SelectItem>
                <SelectItem value="fixed">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Fixed Amount
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="discount-value">
              Discount Value {discountType === 'percentage' ? '(%)' : '($)'}
            </Label>
            <Input
              id="discount-value"
              type="number"
              min="0"
              max={discountType === 'percentage' ? "100" : undefined}
              step={discountType === 'percentage' ? "1" : "0.01"}
              value={discountValue || ''}
              onChange={(e) => handleDiscountValueChange(e.target.value)}
              placeholder={discountType === 'percentage' ? "0" : "0.00"}
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>${subtotalAmount.toFixed(2)}</span>
          </div>
          
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-red-600">
              <span>
                Discount ({discountType === 'percentage' ? `${discountValue}%` : `$${discountValue}`}):
              </span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between text-lg font-semibold border-t pt-2">
            <span>Total Amount:</span>
            <span className="text-green-600">${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default DiscountForm 