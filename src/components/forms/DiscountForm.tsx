
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Percent, DollarSign, ChevronDown, ChevronUp, Heart } from 'lucide-react'
import { useState } from 'react'

interface DiscountFormProps {
  discountType: 'percentage' | 'fixed'
  setDiscountType: (type: 'percentage' | 'fixed') => void
  discountValue: number
  setDiscountValue: (value: number) => void
  tipValue: number
  setTipValue: (value: number) => void
  subtotalAmount: number
  discountAmount: number
  tipAmount: number
  totalAmount: number
}

const DiscountForm = ({
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
  tipValue,
  setTipValue,
  subtotalAmount,
  discountAmount,
  tipAmount,
  totalAmount
}: DiscountFormProps) => {
  const [isDiscountExpanded, setIsDiscountExpanded] = useState(false)
  const [isTipExpanded, setIsTipExpanded] = useState(false)

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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="w-5 h-5" />
            Order Total
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDiscountExpanded(!isDiscountExpanded)}
              className="flex items-center gap-2"
            >
              Add Discount
              {isDiscountExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTipExpanded(!isTipExpanded)}
              className="flex items-center gap-2"
            >
              <Heart className="w-4 h-4 text-red-500" />
              Add Tip
              {tipAmount > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 ml-1">
                  ${tipAmount.toFixed(2)}
                </Badge>
              )}
              {isTipExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Discount Controls - Only show when expanded */}
        {isDiscountExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
            <div className="space-y-2">
              <Label htmlFor="discount-type">Discount Type</Label>
              <Select value={discountType} onValueChange={(value: 'percentage' | 'fixed') => setDiscountType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Fixed Amount
                    </div>
                  </SelectItem>
                  <SelectItem value="percentage">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      Percentage
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
        )}

        {/* Tip Controls - Only show when expanded */}
        {isTipExpanded && (
          <div className="p-4 border rounded-lg bg-green-50 space-y-4">
            {/* Tip Value Input */}
            <div className="space-y-2">
              <Label htmlFor="tip-value">Tip Amount ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="tip-value"
                  type="number"
                  min="0"
                  step="0.50"
                  value={tipValue || ''}
                  onChange={(e) => setTipValue(Number(e.target.value))}
                  placeholder="0.00"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Quick Tip Buttons */}
            <div className="space-y-2">
              <Label>Quick Select</Label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[5, 10, 15, 20, 25].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={tipValue === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTipValue(value)}
                    className="h-9"
                  >
                    <DollarSign className="w-3 h-3 mr-1" />
                    {value}
                  </Button>
                ))}
              </div>
            </div>

            {/* Clear Tip Button */}
            {tipValue > 0 && (
              <div className="flex justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => setTipValue(0)}>
                  Clear Tip
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Order Summary */}
        <div className="space-y-2">
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
          
          {tipAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Tip:</span>
              <span>+${tipAmount.toFixed(2)}</span>
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
