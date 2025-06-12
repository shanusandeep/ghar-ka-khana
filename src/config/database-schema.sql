
-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create menu_categories table
CREATE TABLE IF NOT EXISTS menu_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_per_plate DECIMAL(10,2),
  price_half_tray DECIMAL(10,2),
  price_full_tray DECIMAL(10,2),
  ingredients TEXT[],
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_time TIME,
  delivery_address TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'delivered', 'cancelled')),
  special_instructions TEXT,
  total_amount DECIMAL(10,2),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  item_name TEXT NOT NULL,
  size_type TEXT NOT NULL CHECK (size_type IN ('plate', 'half_tray', 'full_tray')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can manage menu categories" ON menu_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff'))
);

CREATE POLICY "Admin can manage menu items" ON menu_items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff'))
);

CREATE POLICY "Admin can manage customers" ON customers FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff'))
);

CREATE POLICY "Admin can manage orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff'))
);

CREATE POLICY "Admin can manage order items" ON order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff'))
);

-- Create functions for auto-generating order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  -- Get today's date in YYYYMMDD format
  SELECT TO_CHAR(NOW(), 'YYYYMMDD') INTO new_number;
  
  -- Get count of orders today
  SELECT COUNT(*) + 1 INTO counter
  FROM orders 
  WHERE DATE(created_at) = CURRENT_DATE;
  
  -- Combine date with counter (padded to 3 digits)
  new_number := new_number || LPAD(counter::TEXT, 3, '0');
  
  RETURN 'GK' || new_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Insert default menu categories
INSERT INTO menu_categories (name, description, display_order) VALUES
('Starter Items', 'Delicious appetizers to start your meal', 1),
('Main Course', 'Hearty main dishes with authentic flavors', 2),
('Breads', 'Freshly made traditional breads', 3),
('Rice', 'Fragrant rice dishes and biryanis', 4),
('Dessert', 'Sweet treats to end your meal perfectly', 5)
ON CONFLICT (name) DO NOTHING;
