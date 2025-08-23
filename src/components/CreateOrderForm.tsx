import { useState, useEffect } from 'react'
import { ordersApi, menuItemsApi, customersApi } from '@/services/api'
import { MenuItem, Customer, Order, OrderItem as DBOrderItem } from '@/config/supabase'
import { useToast } from '@/hooks/use-toast'
import CustomerInfoForm from './forms/CustomerInfoForm'
import DeliveryInfoForm from './forms/DeliveryInfoForm'
import MenuItemSelector from './forms/MenuItemSelector'
import OrderItemsList from './forms/OrderItemsList'
import DiscountForm from './forms/DiscountForm'
import OrderSummary from './forms/OrderSummary'

interface OrderItem {
  menu_item_id: string
  item_name: string
  size_type: 'plate' | 'half_tray' | 'full_tray' | 'piece'
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
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('fixed')
  const [discountValue, setDiscountValue] = useState<number>(0)
  const [tipValue, setTipValue] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [topOrderItems, setTopOrderItems] = useState<{ item_name: string; total_revenue: number; size_type: string }[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadMenuItems()
    loadTopOrderItems()
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
      setDiscountType(existingOrder.discount_type || 'percentage')
      setDiscountValue(existingOrder.discount_value || 0)
      
      // Load existing tip data
      setTipValue(existingOrder.tip_amount || 0)
      
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

  const loadTopOrderItems = async () => {
    try {
      const orders = await ordersApi.getAll()
      const recentItems: { item_name: string; total_revenue: number; size_type: string; order_date: string }[] = []
      
      // Sort orders by created_at descending to get most recent orders first
      const sortedOrders = orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      
      // Collect all items from recent orders
      sortedOrders.forEach(order => {
        if (order.order_items) {
          order.order_items.forEach(item => {
            const existingItem = recentItems.find(ri => 
              ri.item_name === item.item_name && ri.size_type === item.size_type
            )
            
            if (!existingItem) {
              recentItems.push({
                item_name: item.item_name,
                total_revenue: item.total_price,
                size_type: item.size_type,
                order_date: order.created_at
              })
            }
          })
        }
      })

      // Get the last 3 unique items ordered
      const lastThreeItems = recentItems.slice(0, 3)
      setTopOrderItems(lastThreeItems)
    } catch (error) {
      console.error('Error loading recent order items:', error)
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

  const getSubtotalAmount = () => {
    return orderItems.reduce((sum, item) => sum + item.total_price, 0)
  }

  const getDiscountAmount = () => {
    const subtotal = getSubtotalAmount()
    if (discountValue <= 0) return 0
    
    if (discountType === 'percentage') {
      return (subtotal * discountValue) / 100
    } else {
      return Math.min(discountValue, subtotal) // Don't allow discount to exceed subtotal
    }
  }

  const getTipAmount = () => {
    if (tipValue <= 0) return 0
    return tipValue
  }

  const getTotalAmount = () => {
    return getSubtotalAmount() - getDiscountAmount() + getTipAmount()
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
          subtotal_amount: getSubtotalAmount(),
          discount_type: discountValue > 0 ? discountType : undefined,
          discount_value: discountValue > 0 ? discountValue : undefined,
          discount_amount: getDiscountAmount(),
          tip_amount: getTipAmount(),
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
          subtotal_amount: getSubtotalAmount(),
          discount_type: discountValue > 0 ? discountType : undefined,
          discount_value: discountValue > 0 ? discountValue : undefined,
          discount_amount: getDiscountAmount(),
          tip_amount: getTipAmount(),
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div className="space-y-4">
        <MenuItemSelector
          menuItems={menuItems}
          orderItems={orderItems}
          setOrderItems={setOrderItems}
          topOrderItems={topOrderItems}
        />

        <OrderItemsList
          orderItems={orderItems}
          setOrderItems={setOrderItems}
        />

        <DiscountForm
          discountType={discountType}
          setDiscountType={setDiscountType}
          discountValue={discountValue}
          setDiscountValue={setDiscountValue}
          tipValue={tipValue}
          setTipValue={setTipValue}
          subtotalAmount={getSubtotalAmount()}
          discountAmount={getDiscountAmount()}
          tipAmount={getTipAmount()}
          totalAmount={getTotalAmount()}
        />
      </div>

      {/* Fixed bottom section for buttons */}
      <div className="sticky bottom-0 bg-white border-t pt-4 mt-6">
        <OrderSummary
          loading={loading}
          orderItems={orderItems}
          onSubmit={handleSubmit}
          onClose={onClose}
          isEditing={!!existingOrder}
        />
      </div>
    </div>
  )
}

export default CreateOrderForm
