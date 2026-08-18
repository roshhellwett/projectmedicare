-- Fix critical RLS vulnerabilities for tables that anon users were able to modify

-- 1. Announcements
DROP POLICY IF EXISTS "Announcements are viewable by everyone." ON public.announcements;
DROP POLICY IF EXISTS "Admin can insert announcements." ON public.announcements;
DROP POLICY IF EXISTS "Admin can update announcements." ON public.announcements;
DROP POLICY IF EXISTS "Admin can delete announcements." ON public.announcements;

CREATE POLICY "Announcements are viewable by everyone." 
  ON public.announcements FOR SELECT 
  USING (true);

CREATE POLICY "Admin can insert announcements." 
  ON public.announcements FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin can update announcements." 
  ON public.announcements FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can delete announcements." 
  ON public.announcements FOR DELETE 
  USING (auth.role() = 'authenticated');


-- 2. Doctors
DROP POLICY IF EXISTS "Allow public read access on doctors" ON public.doctors;
DROP POLICY IF EXISTS "Allow authenticated full access on doctors" ON public.doctors;

CREATE POLICY "Allow public read access on doctors" 
  ON public.doctors FOR SELECT 
  USING (true);

CREATE POLICY "Allow authenticated insert on doctors" 
  ON public.doctors FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update on doctors" 
  ON public.doctors FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete on doctors" 
  ON public.doctors FOR DELETE 
  USING (auth.role() = 'authenticated');


-- 3. Patient Rates
DROP POLICY IF EXISTS "patient_rates public read" ON public.patient_rates;
-- In case there are any other policies
DROP POLICY IF EXISTS "patient_rates admin insert" ON public.patient_rates;
DROP POLICY IF EXISTS "patient_rates admin update" ON public.patient_rates;
DROP POLICY IF EXISTS "patient_rates admin delete" ON public.patient_rates;

CREATE POLICY "patient_rates public read" 
  ON public.patient_rates FOR SELECT 
  USING (true);

CREATE POLICY "patient_rates admin insert" 
  ON public.patient_rates FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "patient_rates admin update" 
  ON public.patient_rates FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "patient_rates admin delete" 
  ON public.patient_rates FOR DELETE 
  USING (auth.role() = 'authenticated');


-- Ensure RLS is strictly enabled
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_rates ENABLE ROW LEVEL SECURITY;

-- Revoke potentially dangerous grants from anon
REVOKE INSERT, UPDATE, DELETE ON public.announcements FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.doctors FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.patient_rates FROM anon;
