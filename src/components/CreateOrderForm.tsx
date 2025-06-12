import { useState, useEffect } from 'react'
import { ordersApi, menuItemsApi, customersApi } from '@/services/api'
import { MenuItem, Customer, Order } from '@/config/supabase'
import { useToast } from '@/hooks/use-toast'
import CustomerInfoForm from './forms/CustomerInfoForm'
import DeliveryInfoForm from './forms/DeliveryInfoForm'
import MenuItemSelector from './forms/MenuItemSelector'
import OrderItemsList from './forms/OrderItemsList'
import OrderSummary from './forms/OrderSummary'

interface OrderItem {
  menu_item_id: string
  item_name: string
  size_type: 'plate' | 'half_tray' | 'full_tray'
  quantity: number
  unit_price: number
  total_price: number
  special_instructions?: string
}

interface CreateOrderFormProps {
  onOrderCreated: () => void
  onClose: () => void
  existingOrder?: Order
}

const CreateOrderForm = ({ onOrderCreated, onClose, existingOrder }: CreateOrderFormProps) => {
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [deliveryTime, setDeliveryTime] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadMenuItems()
  }, [])

  useEffect(() => {
    // Populate form when editing existing order
    if (existingOrder) {
      setCustomerName(existingOrder.customer_name)
      setCustomerPhone(existingOrder.customer_phone)
      setDeliveryDate(existingOrder.delivery_date)
      setDeliveryTime(existingOrder.delivery_time || '')
      setDeliveryAddress(existingOrder.delivery_address || '')
      setSpecialInstructions(existingOrder.special_instructions || '')
      
      // TODO: Load order items if needed
      // You might need to fetch order items from the order_items table
      // and convert them to the OrderItem format used by this form
    }
  }, [existingOrder])

  const loadMenuItems = async () => {
    try {
      const data = await menuItemsApi.getAll()
      setMenuItems(data)
    } catch (error) {
      console.error('Error loading menu items:', error)
    }
  }

  const getTotalAmount = () => {
    return orderItems.reduce((sum, item) => sum + item.total_price, 0)
  }

  const handleSubmit = async () => {
    if (!customerName || !customerPhone || !deliveryDate || orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and add at least one item",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      if (existingOrder) {
        // Update existing order
        const updatedOrder = {
          customer_name: customerName,
          customer_phone: customerPhone,
          delivery_date: deliveryDate,
          delivery_time: deliveryTime || undefined,
          delivery_address: deliveryAddress || undefined,
          special_instructions: specialInstructions || undefined,
          total_amount: getTotalAmount()
        }

        await ordersApi.update(existingOrder.id, updatedOrder)
        
        toast({
          title: "Success",
          description: "Order updated successfully"
        })
      } else {
        // Create new order
        let customerId = existingCustomer?.id
        if (!existingCustomer) {
          const newCustomer = await customersApi.create({
            name: customerName,
            phone: customerPhone,
            address: deliveryAddress || undefined
          })
          customerId = newCustomer.id
        }

        const order = {
          customer_id: customerId,
          customer_name: customerName,
          customer_phone: customerPhone,
          delivery_date: deliveryDate,
          delivery_time: deliveryTime || undefined,
          delivery_address: deliveryAddress || undefined,
          special_instructions: specialInstructions || undefined,
          total_amount: getTotalAmount(),
          status: 'pending' as const
        }

        await ordersApi.create(order, orderItems)
        
        toast({
          title: "Success",
          description: "Order created successfully"
        })
      }
      
      onOrderCreated()
      onClose()
    } catch (error) {
      console.error('Error saving order:', error)
      toast({
        title: "Error",
        description: `Failed to ${existingOrder ? 'update' : 'create'} order`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <CustomerInfoForm
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        deliveryAddress={deliveryAddress}
        setDeliveryAddress={setDeliveryAddress}
        existingCustomer={existingCustomer}
        setExistingCustomer={setExistingCustomer}
      />

      <DeliveryInfoForm
        deliveryDate={deliveryDate}
        setDeliveryDate={setDeliveryDate}
        deliveryTime={deliveryTime}
        setDeliveryTime={setDeliveryTime}
        specialInstructions={specialInstructions}
        setSpecialInstructions={setSpecialInstructions}
      />

      <MenuItemSelector
        menuItems={menuItems}
        orderItems={orderItems}
        setOrderItems={setOrderItems}
      />

      <OrderItemsList
        orderItems={orderItems}
        setOrderItems={setOrderItems}
      />

      <OrderSummary
        loading={loading}
        orderItems={orderItems}
        onSubmit={handleSubmit}
        onClose={onClose}
      />
    </div>
  )
}

export default CreateOrderForm
