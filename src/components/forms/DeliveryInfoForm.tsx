
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
        <div>
          <Label htmlFor="special-instructions">Special Instructions</Label>
          <Textarea
            id="special-instructions"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="Any special requests or instructions"
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default DeliveryInfoForm
