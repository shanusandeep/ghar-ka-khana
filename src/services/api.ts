
import { supabase, supabaseAnon, MenuCategory, MenuItem, Customer, Order, OrderItem, TodaysMenu } from '@/config/supabase'

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

  getByCategoryName: async (categoryName: string) => {
    console.log('🔍 API: Searching for category name:', categoryName);
    
    const { data, error } = await supabase
      .from('menu_items')
      .select(`
        *,
        menu_categories!inner (name)
      `)
      .eq('menu_categories.name', categoryName)
      .eq('is_available', true)
      .order('display_order')
    
    console.log('📊 API: Found menu items:', data);
    console.log('❌ API: Error (if any):', error);
    
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

// Today's Menu API
export const todaysMenuApi = {
  // Get today's menu items with full menu item details
  getForDate: async (date: string) => {
    const { data, error } = await supabase
      .from('todays_menu')
      .select(`
        *,
        menu_items (
          *,
          menu_categories (name)
        )
      `)
      .eq('date', date)
      .eq('is_available', true)
      .order('display_order')
    
    if (error) throw error
    return data
  },

  // Get all items for admin management (including unavailable ones)
  getForDateAdmin: async (date: string) => {
    const { data, error } = await supabase
      .from('todays_menu')
      .select(`
        *,
        menu_items (
          *,
          menu_categories (name)
        )
      `)
      .eq('date', date)
      .order('display_order')
    
    if (error) throw error
    return data
  },

  // Add item to today's menu
  add: async (menuItemId: string, date: string, specialNote?: string) => {
    const { data, error } = await supabase
      .from('todays_menu')
      .insert({
        menu_item_id: menuItemId,
        date: date,
        is_available: true,
        special_note: specialNote,
        display_order: 0
      })
      .select()
      .single()
    
    if (error) throw error
    return data as TodaysMenu
  },

  // Remove item from today's menu
  remove: async (id: string) => {
    const { error } = await supabase
      .from('todays_menu')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Toggle availability of item in today's menu
  toggleAvailability: async (id: string, isAvailable: boolean) => {
    const { data, error } = await supabase
      .from('todays_menu')
      .update({ 
        is_available: isAvailable,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as TodaysMenu
  },

  // Update special note for today's menu item
  updateNote: async (id: string, specialNote: string) => {
    const { data, error } = await supabase
      .from('todays_menu')
      .update({ 
        special_note: specialNote,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as TodaysMenu
  },

  // Update display order
  updateOrder: async (id: string, displayOrder: number) => {
    const { data, error } = await supabase
      .from('todays_menu')
      .update({ 
        display_order: displayOrder,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as TodaysMenu
  },

  // Clear all items for a specific date
  clearForDate: async (date: string) => {
    const { error } = await supabase
      .from('todays_menu')
      .delete()
      .eq('date', date)
    
    if (error) throw error
  }
}

// Reviews API
export const reviewsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        review_menu_items (
          id,
          menu_items (
            id,
            name,
            image_url,
            menu_categories (name)
          )
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Review[]
  },

  getApproved: async () => {
    const { data, error } = await supabaseAnon
      .from('reviews')
      .select(`
        *,
        review_menu_items (
          id,
          menu_items (
            id,
            name,
            image_url,
            menu_categories (name)
          )
        )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Review[]
  },

  getPending: async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        review_menu_items (
          id,
          menu_items (
            id,
            name,
            image_url,
            menu_categories (name)
          )
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Review[]
  },

  create: async (review: { 
    full_name: string
    review_text: string
    rating?: number
    status: 'pending' | 'approved' | 'rejected'
    menu_item_ids?: string[]
  }) => {
    console.log('API: Creating review with data:', review)
    
    // Create the review using anonymous client
    const { data: reviewData, error: reviewError } = await supabaseAnon
      .from('reviews')
      .insert({
        full_name: review.full_name,
        review_text: review.review_text,
        rating: review.rating,
        status: review.status
      })
      .select()
      .single()
    
    if (reviewError) {
      console.error('API: Error creating review:', reviewError)
      throw reviewError
    }
    
    console.log('API: Review created successfully:', reviewData)
    
    // If menu items are provided, create the junction table entries
    if (review.menu_item_ids && review.menu_item_ids.length > 0) {
      console.log('API: Creating junction entries for menu items:', review.menu_item_ids)
      
      const junctionEntries = review.menu_item_ids.map(menu_item_id => ({
        review_id: reviewData.id,
        menu_item_id
      }))
      
      console.log('API: Junction entries to insert:', junctionEntries)
      
      const { error: junctionError } = await supabaseAnon
        .from('review_menu_items')
        .insert(junctionEntries)
      
      if (junctionError) {
        console.error('API: Error creating junction entries:', junctionError)
        throw junctionError
      }
      
      console.log('API: Junction entries created successfully')
    }
    
    // Fetch the complete review with menu items using anonymous client
    const { data: completeReview, error: fetchError } = await supabaseAnon
      .from('reviews')
      .select(`
        *,
        review_menu_items (
          id,
          menu_items (
            id,
            name,
            image_url,
            menu_categories (name)
          )
        )
      `)
      .eq('id', reviewData.id)
      .single()
    
    if (fetchError) throw fetchError
    return completeReview as Review
  },

  updateStatus: async (id: string, status: 'approved' | 'rejected', reviewedBy: string) => {
    const { data, error } = await supabase
      .from('reviews')
      .update({ 
        status, 
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Review
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}
