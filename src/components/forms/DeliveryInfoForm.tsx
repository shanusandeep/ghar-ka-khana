import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DeliveryInfoFormProps {
  deliveryDate: string
  setDeliveryDate: (date: string) => void
  deliveryTime: string
  setDeliveryTime: (time: string) => void
  specialInstructions: string
  setSpecialInstructions: (instructions: string) => void
}

const DeliveryInfoForm = ({
  deliveryDate,
  setDeliveryDate,
  deliveryTime,
  setDeliveryTime,
  specialInstructions,
  setSpecialInstructions
}: DeliveryInfoFormProps) => {
  const [showSpecialInstructions, setShowSpecialInstructions] = useState(false)

  // Show special instructions if there are existing instructions
  useEffect(() => {
    if (specialInstructions && specialInstructions.trim() !== '') {
      setShowSpecialInstructions(true)
    }
  }, [specialInstructions])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="delivery-date">Delivery Date *</Label>
            <Input
              id="delivery-date"
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="delivery-time">Delivery Time</Label>
            <Input
              id="delivery-time"
              type="time"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
            />
          </div>
        </div>
        
        {!showSpecialInstructions ? (
          <div>
            <button
              type="button"
              onClick={() => setShowSpecialInstructions(true)}
              className="text-sm text-orange-600 hover:text-orange-700 underline cursor-pointer"
            >
              + Add Special Instructions
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="special-instructions">Special Instructions</Label>
              <button
                type="button"
                onClick={() => {
                  setShowSpecialInstructions(false)
                  setSpecialInstructions('')
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <Textarea
              id="special-instructions"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special requests or instructions"
              rows={2}
              autoFocus
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DeliveryInfoForm
