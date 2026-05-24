# Menu / category data not loading (Supabase)

## What’s going on

If **menu categories and items don’t show** (empty menu, empty category pages, “no data”) while the app itself loads, it’s usually **Row Level Security (RLS)** on Supabase:

- `menu_categories` and `menu_items` had RLS that **only allows admin/staff**.
- Visitors (and the app when not logged in) use the **anon** key, so they get **no rows** from those tables.

So Supabase is working; the data is hidden by RLS for non-admin users.

## Fix: allow public read for menu

1. Open **Supabase Dashboard** → your project (**gharkakhana**) → **SQL Editor**.
2. Run the SQL from **`src/utils/supabase-public-menu-policies.sql`** (or paste this):

```sql
-- Allow public (unauthenticated) read access to menu data
DROP POLICY IF EXISTS "Public can view menu categories" ON menu_categories;
CREATE POLICY "Public can view menu categories"
  ON menu_categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can view menu items" ON menu_items;
CREATE POLICY "Public can view menu items"
  ON menu_items FOR SELECT
  USING (true);
```

3. Run the script. After that, the menu and category pages should show data for everyone. Only admin/staff can still create/update/delete menu data.

## Check Supabase is reachable

- **Dashboard**: [https://supabase.com/dashboard](https://supabase.com/dashboard) → project **gharkakhana** (region **us-east-2**). If the project opens and tables (e.g. `menu_categories`, `menu_items`) are visible, the project is up.
- **App config**: URL and anon key are in `src/config/supabase.ts` (and `src/integrations/supabase/client.ts`). They point to `https://ikulboackbxhpvcusaro.supabase.co`. If you changed project or keys, update those files (and `.env` if you use env for the key).
- **Browser**: Open DevTools → **Network**. Reload a category or menu page. You should see requests to `...supabase.co/rest/v1/menu_items` or `menu_categories`. If you get **200** but empty `[]` in the response, RLS is the cause; applying the fix above should resolve it.

## If it’s still not working

- Confirm the SQL was run in the **correct project** (gharkakhana).
- In Supabase: **Authentication** → **Policies** (or **Table Editor** → table → “RLS” / “Policies”) and check that `menu_categories` and `menu_items` have a policy that allows **SELECT** for all (e.g. “Public can view menu categories” / “Public can view menu items”).
- Check the browser console for Supabase or network errors (CORS, 401, 403, 5xx) and fix config or keys if needed.
