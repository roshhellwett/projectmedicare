CREATE TABLE IF NOT EXISTS public.medicine_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  note TEXT,
  prescription_url TEXT,
  assigned_store_id UUID REFERENCES public.pharmacy_stores(id),
  status TEXT NOT NULL DEFAULT 'pending',
  selected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cart_items JSONB DEFAULT '[]'::jsonb
);

ALTER TABLE public.medicine_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "medicine_orders admin all" ON public.medicine_orders USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "medicine_orders public insert" ON public.medicine_orders FOR INSERT TO anon, authenticated WITH CHECK (true);
GRANT ALL ON public.medicine_orders TO service_role;
GRANT ALL ON public.medicine_orders TO authenticated;
GRANT INSERT ON public.medicine_orders TO anon;

CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  store_id UUID REFERENCES public.pharmacy_stores(id),
  cv_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "job_applications admin all" ON public.job_applications USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "job_applications public insert" ON public.job_applications FOR INSERT TO anon, authenticated WITH CHECK (true);
GRANT ALL ON public.job_applications TO service_role;
GRANT ALL ON public.job_applications TO authenticated;
GRANT INSERT ON public.job_applications TO anon;
