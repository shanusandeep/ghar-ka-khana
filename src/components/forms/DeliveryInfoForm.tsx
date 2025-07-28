import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Calendar } from 'lucide-react'
import { format } from 'date-fns'

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
  const [showDeliveryTime, setShowDeliveryTime] = useState(false)
  const [showSpecialInstructions, setShowSpecialInstructions] = useState(false)

  // Show delivery time if there's an existing value
  useEffect(() => {
    if (deliveryTime && deliveryTime.trim() !== '') {
      setShowDeliveryTime(true)
    }
  }, [deliveryTime])

  // Show special instructions if there are existing instructions
  useEffect(() => {
    if (specialInstructions && specialInstructions.trim() !== '') {
      setShowSpecialInstructions(true)
    }
  }, [specialInstructions])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Delivery Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label htmlFor="delivery-date">Delivery Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <div className="relative">
                <Input
                  id="delivery-date"
                  type="text"
                  value={deliveryDate ? format(new Date(deliveryDate + 'T00:00:00'), 'PPP') : ''}
                  placeholder="Select delivery date"
                  readOnly
                  required
                  className="pl-10 cursor-pointer"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={deliveryDate ? new Date(deliveryDate + 'T00:00:00') : undefined}
                onSelect={(date) => {
                  if (date) {
                    setDeliveryDate(format(date, 'yyyy-MM-dd'))
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Optional Delivery Time */}
        {showDeliveryTime ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="delivery-time">Delivery Time</Label>
              <button
                type="button"
                onClick={() => {
                  setShowDeliveryTime(false)
                  setDeliveryTime('')
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <Input
              id="delivery-time"
              type="time"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              autoFocus
            />
          </div>
        ) : (
          <div>
            <button
              type="button"
              onClick={() => setShowDeliveryTime(true)}
              className="text-sm text-orange-600 hover:text-orange-700 underline cursor-pointer"
            >
              + Add Delivery Time
            </button>
          </div>
        )}
        
        {/* Optional Special Instructions */}
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