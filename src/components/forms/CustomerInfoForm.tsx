
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { customersApi } from '@/services/api'
import { Customer } from '@/config/supabase'

interface CustomerInfoFormProps {
  customerName: string
  setCustomerName: (name: string) => void
  customerPhone: string
  setCustomerPhone: (phone: string) => void
  deliveryAddress: string
  setDeliveryAddress: (address: string) => void
  existingCustomer: Customer | null
  setExistingCustomer: (customer: Customer | null) => void
}

const CustomerInfoForm = ({
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  deliveryAddress,
  setDeliveryAddress,
  existingCustomer,
  setExistingCustomer
}: CustomerInfoFormProps) => {
  useEffect(() => {
    if (customerPhone.length >= 10) {
      checkExistingCustomer()
    }
  }, [customerPhone])

  const checkExistingCustomer = async () => {
    try {
      const customer = await customersApi.findByPhone(customerPhone)
      if (customer) {
        setExistingCustomer(customer)
        setCustomerName(customer.name)
        setDeliveryAddress(customer.address || '')
      } else {
        setExistingCustomer(null)
      }
    } catch (error) {
      console.error('Error checking customer:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customer-phone">Phone Number *</Label>
            <Input
              id="customer-phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Enter phone number"
              required
            />
            {existingCustomer && (
              <Badge className="mt-1 bg-green-100 text-green-800">
                Existing Customer
              </Badge>
            )}
          </div>
          <div>
            <Label htmlFor="customer-name">Customer Name *</Label>
            <Input
              id="customer-name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="delivery-address">Delivery Address</Label>
          <Textarea
            id="delivery-address"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="Enter delivery address"
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default CustomerInfoForm
