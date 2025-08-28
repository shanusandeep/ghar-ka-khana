-- Create todays_menu table for managing daily menu items
CREATE TABLE IF NOT EXISTS todays_menu (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  special_note TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one entry per menu item per date
  UNIQUE(menu_item_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_todays_menu_date ON todays_menu(date);
CREATE INDEX IF NOT EXISTS idx_todays_menu_item_date ON todays_menu(menu_item_id, date);
CREATE INDEX IF NOT EXISTS idx_todays_menu_available ON todays_menu(date, is_available);

-- Add trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_todays_menu_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_todays_menu_updated_at
  BEFORE UPDATE ON todays_menu
  FOR EACH ROW
  EXECUTE FUNCTION update_todays_menu_updated_at();
