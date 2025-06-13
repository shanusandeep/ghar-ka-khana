
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ikulboackbxhpvcusaro.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrdWxib2Fja2J4aHB2Y3VzYXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDc4MzQsImV4cCI6MjA2NTI4MzgzNH0.e6KMjrPr1JqeuELjEdK1F31cXbjFP1tG4JIdhtVCsBM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  email: string
  full_name?: string
  role: 'admin' | 'staff'
  created_at: string
  updated_at: string
}

export interface MenuCategory {
  id: string
  name: string
  description?: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MenuItem {
  id: string
  category_id: string
  name: string
  description?: string
  price_per_plate?: number
  price_half_tray?: number
  price_full_tray?: number
  ingredients?: string[]
  image_url?: string
  is_available: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  customer_id?: string
  customer_name: string
  customer_phone: string
  delivery_date: string
  delivery_time?: string
  delivery_address?: string
  status: 'received' | 'delivered' | 'paid'
  special_instructions?: string
  subtotal_amount?: number
  discount_type?: 'percentage' | 'fixed'
  discount_value?: number
  discount_amount?: number
  total_amount?: number
  created_by?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id?: string
  item_name: string
  size_type: 'plate' | 'half_tray' | 'full_tray'
  quantity: number
  unit_price: number
  total_price: number
  special_instructions?: string
  created_at: string
}
