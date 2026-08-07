CREATE TABLE public.pharmacy_stores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  address text,
  phone text,
  lat double precision,
  lng double precision,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.packages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  tests text[] NOT NULL DEFAULT '{}',
  market_price numeric NOT NULL,
  janta_price numeric NOT NULL,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.package_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name text NOT NULL,
  phone_number text NOT NULL,
  package_id uuid REFERENCES public.packages(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  store_id uuid REFERENCES public.pharmacy_stores(id) ON DELETE SET NULL,
  selected_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.pharmacy_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read packages" ON public.packages FOR SELECT USING (true);

GRANT ALL ON public.pharmacy_stores TO service_role;
GRANT ALL ON public.packages TO service_role;
GRANT ALL ON public.package_orders TO service_role;
