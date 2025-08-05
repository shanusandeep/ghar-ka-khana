-- Add tip fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tip_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tip_percentage DECIMAL(5,2) DEFAULT 0;

-- Add index for tip analytics
CREATE INDEX IF NOT EXISTS idx_orders_tip_amount ON orders(tip_amount);
CREATE INDEX IF NOT EXISTS idx_orders_created_at_tips ON orders(created_at) WHERE tip_amount > 0; 