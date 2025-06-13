-- Fix order number generation race condition
-- Run this SQL in your Supabase SQL editor

-- Drop existing function and recreate with better logic
DROP FUNCTION IF EXISTS generate_order_number();

-- Create improved order number generation function with retry logic
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
  max_attempts INTEGER := 10;
  attempt INTEGER := 0;
  date_part TEXT;
BEGIN
  -- Get today's date in YYYYMMDD format
  SELECT TO_CHAR(NOW(), 'YYYYMMDD') INTO date_part;
  
  LOOP
    attempt := attempt + 1;
    
    -- Get count of orders today and add 1
    SELECT COUNT(*) + 1 INTO counter
    FROM orders 
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- Combine date with counter (padded to 3 digits)
    new_number := 'GK' || date_part || LPAD(counter::TEXT, 3, '0');
    
    -- Check if this order number already exists
    IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_number) THEN
      RETURN new_number;
    END IF;
    
    -- If we've tried too many times, use a random suffix
    IF attempt >= max_attempts THEN
      new_number := 'GK' || date_part || LPAD((EXTRACT(EPOCH FROM NOW())::INTEGER % 1000)::TEXT, 3, '0');
      RETURN new_number;
    END IF;
    
    -- Small delay to reduce race condition probability
    PERFORM pg_sleep(0.001);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Alternative approach: Use a sequence-based order number generator
-- This is more robust for high-concurrency scenarios

-- Create a sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS daily_order_sequence;

-- Create function that uses sequence
CREATE OR REPLACE FUNCTION generate_order_number_v2()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
  date_part TEXT;
BEGIN
  -- Get today's date in YYYYMMDD format
  SELECT TO_CHAR(NOW(), 'YYYYMMDD') INTO date_part;
  
  -- Reset sequence daily (check if it's a new day)
  IF NOT EXISTS (
    SELECT 1 FROM orders 
    WHERE DATE(created_at) = CURRENT_DATE 
    LIMIT 1
  ) THEN
    -- Reset sequence for new day
    ALTER SEQUENCE daily_order_sequence RESTART WITH 1;
  END IF;
  
  -- Get next sequence value
  SELECT nextval('daily_order_sequence') INTO counter;
  
  -- Combine date with counter (padded to 3 digits)
  new_number := 'GK' || date_part || LPAD(counter::TEXT, 3, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Update the trigger to use the improved function
DROP TRIGGER IF EXISTS trigger_set_order_number ON orders;

CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    -- Use the sequence-based version for better concurrency
    NEW.order_number := generate_order_number_v2();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Clean up any duplicate order numbers (if any exist)
-- This will update duplicates with new unique numbers
DO $$
DECLARE
  duplicate_record RECORD;
BEGIN
  FOR duplicate_record IN 
    SELECT id, order_number, ROW_NUMBER() OVER (PARTITION BY order_number ORDER BY created_at) as rn
    FROM orders
    WHERE order_number IN (
      SELECT order_number 
      FROM orders 
      GROUP BY order_number 
      HAVING COUNT(*) > 1
    )
  LOOP
    IF duplicate_record.rn > 1 THEN
      UPDATE orders 
      SET order_number = generate_order_number_v2()
      WHERE id = duplicate_record.id;
    END IF;
  END LOOP;
END $$; 