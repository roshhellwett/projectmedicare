-- Add missing RLS policies for complete security coverage
-- Safe to re-run: all policies use DROP IF EXISTS before CREATE

-- 1. pharmacy_stores: allow public SELECT (needed for store selector, locations page)
DROP POLICY IF EXISTS "pharmacy_stores public read" ON public.pharmacy_stores;
CREATE POLICY "pharmacy_stores public read"
  ON public.pharmacy_stores FOR SELECT
  TO anon, authenticated
  USING (true);

-- 2. package_orders: allow public INSERT (for booking form)
DROP POLICY IF EXISTS "package_orders public insert" ON public.package_orders;
CREATE POLICY "package_orders public insert"
  ON public.package_orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 3. package_orders: allow service_role SELECT (admin panel reads)
-- Note: service_role already bypasses RLS, but this is belt-and-suspenders
DROP POLICY IF EXISTS "package_orders admin read" ON public.package_orders;
CREATE POLICY "package_orders admin read"
  ON public.package_orders FOR SELECT
  TO service_role
  USING (true);

-- 4. feedbacks: allow anon INSERT (public feedback form uploads via service_role,
--    but the createAdminClient already bypasses. This is defense-in-depth.)
DROP POLICY IF EXISTS "feedbacks public insert" ON public.feedbacks;
CREATE POLICY "feedbacks public insert"
  ON public.feedbacks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);


-- 6. Grant SELECT on pharmacy_stores to anon (needed for the public client)
GRANT SELECT ON public.pharmacy_stores TO anon, authenticated;

-- 7. Grant INSERT on package_orders to anon (for public booking)
GRANT INSERT ON public.package_orders TO anon, authenticated;

-- 8. Grant INSERT on feedbacks to anon (for public feedback submission)
GRANT INSERT ON public.feedbacks TO anon, authenticated;
