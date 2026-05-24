-- Fix: Allow public (unauthenticated) read access to menu data
-- Run this in Supabase Dashboard → SQL Editor if menu/category pages show no data.
--
-- Cause: RLS was only allowing admin/staff. Visitors using the anon key got zero rows.
-- This adds SELECT-only policies so everyone can see the menu; only admin/staff can edit.

-- Menu categories: anyone can read
DROP POLICY IF EXISTS "Public can view menu categories" ON menu_categories;
CREATE POLICY "Public can view menu categories"
  ON menu_categories FOR SELECT
  USING (true);

-- Menu items: anyone can read
DROP POLICY IF EXISTS "Public can view menu items" ON menu_items;
CREATE POLICY "Public can view menu items"
  ON menu_items FOR SELECT
  USING (true);
