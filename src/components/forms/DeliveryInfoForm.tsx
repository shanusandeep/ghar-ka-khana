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
