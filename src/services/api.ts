
import { supabase, MenuCategory, MenuItem, Customer, Order, OrderItem } from '@/config/supabase'

// Menu Categories API
export const menuCategoriesApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
    
    if (error) throw error
    return data as MenuCategory[]
  },

  create: async (category: Omit<MenuCategory, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('menu_categories')
      .insert(category)
      .select()
      .single()
    
    if (error) throw error
    return data as MenuCategory
  },

  update: async (id: string, updates: Partial<MenuCategory>) => {
    const { data, error } = await supabase
      .from('menu_categories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as MenuCategory
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('menu_categories')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Menu Items API
export const menuItemsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select(`
        *,
        menu_categories (name)
      `)
      .order('display_order')
    
    if (error) throw error
    return data
  },

  getByCategory: async (categoryId: string) => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_available', true)
      .order('display_order')
    
    if (error) throw error
    return data as MenuItem[]
  },

  create: async (item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('menu_items')
      .insert(item)
      .select()
      .single()
    
    if (error) throw error
    return data as MenuItem
  },

  update: async (id: string, updates: Partial<MenuItem>) => {
    const { data, error } = await supabase
      .from('menu_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as MenuItem
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Orders API
export const ordersApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  getByDate: async (date: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('delivery_date', date)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  getByCustomerId: async (customerId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  create: async (order: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>, orderItems: Omit<OrderItem, 'id' | 'order_id' | 'created_at'>[]) => {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single()
    
    if (orderError) throw orderError

    const itemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: orderData.id
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsWithOrderId)
    
    if (itemsError) throw itemsError
    
    return orderData as Order
  },

  update: async (id: string, updates: Partial<Order>) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Order
  },

  delete: async (id: string) => {
    // First delete order items (due to foreign key constraint)
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', id)
    
    if (itemsError) throw itemsError

    // Then delete the order
    const { error: orderError } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)
    
    if (orderError) throw orderError
  },

  getPreparationSummary: async (date: string) => {
    console.log('API: Getting preparation summary for date:', date)
    
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        item_name,
        size_type,
        quantity,
        orders!inner (delivery_date, status)
      `)
      .eq('orders.delivery_date', date)
      .in('orders.status', ['received'])
    
    console.log('API: Raw order_items data:', data)
    console.log('API: Query error:', error)
    
    if (error) throw error
    
    // Group by item and size type
    const summary = data.reduce((acc: any, item: any) => {
      const key = `${item.item_name}_${item.size_type}`
      if (!acc[key]) {
        acc[key] = {
          item_name: item.item_name,
          size_type: item.size_type,
          total_quantity: 0
        }
      }
      acc[key].total_quantity += item.quantity
      return acc
    }, {})
    
    return Object.values(summary)
  },

  deleteOrderItem: async (id: string) => {
    const { error } = await supabase
      .from('order_items')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  updateOrderItem: async (id: string, updates: Partial<OrderItem>) => {
    const { data, error } = await supabase
      .from('order_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as OrderItem
  },

  addOrderItem: async (orderId: string, orderItem: Omit<OrderItem, 'id' | 'order_id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('order_items')
      .insert({
        ...orderItem,
        order_id: orderId
      })
      .select()
      .single()
    
    if (error) throw error
    return data as OrderItem
  }
}

// Customers API
export const customersApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data as Customer[]
  },

  getAllWithOrderTotals: async () => {
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .order('name')
    
    if (customersError) throw customersError

    // Get order totals for each customer
    const customersWithTotals = await Promise.all(
      customers.map(async (customer) => {
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('total_amount')
          .eq('customer_id', customer.id)
        
        if (ordersError) {
          console.error('Error fetching orders for customer:', customer.id, ordersError)
          return { ...customer, total_order_value: 0, order_count: 0 }
        }

        const totalOrderValue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
        const orderCount = orders.length

        return {
          ...customer,
          total_order_value: totalOrderValue,
          order_count: orderCount
        }
      })
    )

    return customersWithTotals
  },

  findByPhone: async (phone: string) => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data as Customer | null
  },

  create: async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single()
    
    if (error) throw error
    return data as Customer
  },

  update: async (id: string, updates: Partial<Customer>) => {
    const { data, error } = await supabase
      .from('customers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Customer
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}
