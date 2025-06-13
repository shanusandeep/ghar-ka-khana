-- Add discount fields to orders table
-- Run this SQL in your Supabase SQL editor

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS subtotal_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
ADD COLUMN IF NOT EXISTS discount_value DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2);

-- Update existing orders to have subtotal_amount equal to total_amount
UPDATE orders 
SET subtotal_amount = total_amount 
WHERE subtotal_amount IS NULL AND total_amount IS NOT NULL;

-- Add comment to document the new fields
COMMENT ON COLUMN orders.subtotal_amount IS 'Order subtotal before discount';
COMMENT ON COLUMN orders.discount_type IS 'Type of discount: percentage or fixed amount';
COMMENT ON COLUMN orders.discount_value IS 'Discount value (percentage number or fixed amount)';
COMMENT ON COLUMN orders.discount_amount IS 'Calculated discount amount in dollars'; 