import { useState, useEffect } from 'react'
import { ordersApi, menuItemsApi, customersApi } from '@/services/api'
import { MenuItem, Customer, Order, OrderItem as DBOrderItem } from '@/config/supabase'
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

// Extended Order type that includes order_items
interface OrderWithItems extends Order {
  order_items?: DBOrderItem[]
}

interface CreateOrderFormProps {
  onOrderCreated: () => void
  onClose: () => void
  existingOrder?: OrderWithItems
}

const CreateOrderForm = ({ onOrderCreated, onClose, existingOrder }: CreateOrderFormProps) => {
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [deliveryTime, setDeliveryTime] = useState('')
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
    // Set default delivery date to today for new orders
    if (!existingOrder && !deliveryDate) {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      const todayString = `${year}-${month}-${day}`
      setDeliveryDate(todayString)
    }
  }, [existingOrder, deliveryDate])

  useEffect(() => {
    // Populate form when editing existing order
    if (existingOrder) {
      setCustomerName(existingOrder.customer_name)
      setCustomerPhone(existingOrder.customer_phone)
      setDeliveryDate(existingOrder.delivery_date)
      setDeliveryTime(existingOrder.delivery_time || '')
      setSpecialInstructions(existingOrder.special_instructions || '')
      
      // Load existing customer if customer_id exists
      if (existingOrder.customer_id) {
        loadExistingCustomer(existingOrder.customer_id)
      }
      
      // Load order items if they exist
      if (existingOrder.order_items) {
        const formattedOrderItems = existingOrder.order_items.map(item => ({
          menu_item_id: item.menu_item_id || '',
          item_name: item.item_name,
          size_type: item.size_type,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          special_instructions: item.special_instructions
        }))
        setOrderItems(formattedOrderItems)
      }
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

  const loadExistingCustomer = async (customerId: string) => {
    try {
      const customers = await customersApi.getAll()
      const customer = customers.find(c => c.id === customerId)
      if (customer) {
        setExistingCustomer(customer)
      }
    } catch (error) {
      console.error('Error loading existing customer:', error)
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
          special_instructions: specialInstructions || undefined,
          total_amount: getTotalAmount()
        }

        // Find and delete removed items
        if (existingOrder.order_items) {
          const removedItems = existingOrder.order_items.filter(origItem => {
            // Try to match by menu_item_id and size_type (or use id if available)
            return !orderItems.some(newItem =>
              (origItem.menu_item_id === newItem.menu_item_id && origItem.size_type === newItem.size_type)
            )
          })
          for (const item of removedItems) {
            if (item.id) {
              await ordersApi.deleteOrderItem(item.id)
            }
          }
        }

        await ordersApi.update(existingOrder.id, updatedOrder)

        // Handle adding new items and updating existing ones
        for (const newItem of orderItems) {
          const existingItem = existingOrder.order_items?.find(origItem =>
            origItem.menu_item_id === newItem.menu_item_id && origItem.size_type === newItem.size_type
          )

          if (existingItem) {
            // Update existing item if quantity or price changed
            if (existingItem.quantity !== newItem.quantity || 
                existingItem.unit_price !== newItem.unit_price ||
                existingItem.total_price !== newItem.total_price ||
                existingItem.special_instructions !== newItem.special_instructions) {
              await ordersApi.updateOrderItem(existingItem.id, {
                quantity: newItem.quantity,
                unit_price: newItem.unit_price,
                total_price: newItem.total_price,
                special_instructions: newItem.special_instructions
              })
            }
          } else {
            // Add new item
            await ordersApi.addOrderItem(existingOrder.id, newItem)
          }
        }
        
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
            phone: customerPhone
          })
          customerId = newCustomer.id
        }

        const order = {
          customer_id: customerId,
          customer_name: customerName,
          customer_phone: customerPhone,
          delivery_date: deliveryDate,
          delivery_time: deliveryTime || undefined,
          special_instructions: specialInstructions || undefined,
          total_amount: getTotalAmount(),
          status: 'received' as const
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomerInfoForm
          customerName={customerName}
          setCustomerName={setCustomerName}
          customerPhone={customerPhone}
          setCustomerPhone={setCustomerPhone}
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
      </div>

      <OrderItemsList
        orderItems={orderItems}
        setOrderItems={setOrderItems}
      />

      <MenuItemSelector
        menuItems={menuItems}
        orderItems={orderItems}
        setOrderItems={setOrderItems}
      />

      <OrderSummary
        loading={loading}
        orderItems={orderItems}
        onSubmit={handleSubmit}
        onClose={onClose}
        isEditing={!!existingOrder}
      />
    </div>
  )
}

export default CreateOrderForm
