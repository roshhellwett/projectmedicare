-- ============================================================================
-- Migration: Advanced Settings & Staff Management
-- ============================================================================

-- 1. Pharmacy Stores Enhancements
ALTER TABLE public.pharmacy_stores
ADD COLUMN IF NOT EXISTS gst_number text,
ADD COLUMN IF NOT EXISTS legal_name text,
ADD COLUMN IF NOT EXISTS operating_hours text,
ADD COLUMN IF NOT EXISTS contact_numbers jsonb DEFAULT '[]'::jsonb;

-- 2. Global Settings Table (Unencrypted, for app configs)
CREATE TABLE IF NOT EXISTS public.global_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: Public can read, only service_role can write
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read global_settings" ON public.global_settings FOR SELECT USING (true);
GRANT ALL ON public.global_settings TO service_role;

-- 3. Admin Users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'BILLER' CHECK (role IN ('ADMIN', 'BILLER')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: Only service_role can access
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.admin_users TO service_role;

-- Setup updated_at trigger for global_settings
DROP TRIGGER IF EXISTS global_settings_touch_updated_at ON public.global_settings;
CREATE TRIGGER global_settings_touch_updated_at
  BEFORE UPDATE ON public.global_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Setup updated_at trigger for admin_users
DROP TRIGGER IF EXISTS admin_users_touch_updated_at ON public.admin_users;
CREATE TRIGGER admin_users_touch_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 4. Default Seed for Global Settings
INSERT INTO public.global_settings (key, value, description)
VALUES 
  ('invoice_prefix', '"INV-"'::jsonb, 'Prefix for generated invoices'),
  ('invoice_terms', '"Goods once sold will not be taken back or exchanged."'::jsonb, 'Terms & conditions footer on invoice'),
  ('default_gst_percent', '5'::jsonb, 'Default GST percentage for medicines'),
  ('online_ordering_enabled', 'true'::jsonb, 'Toggle to enable/disable online package/medicine orders'),
  ('flat_delivery_charge', '50'::jsonb, 'Flat delivery charge amount'),
  ('free_delivery_min', '500'::jsonb, 'Minimum order value for free delivery'),
  ('seo_title', '"Janta Medicare LLP"'::jsonb, 'Homepage SEO Title'),
  ('seo_description', '"Your trusted neighborhood pharmacy."'::jsonb, 'Homepage SEO Description'),
  ('global_discount_active', 'false'::jsonb, 'Toggle to enable a global discount'),
  ('global_discount_name', '"Festival Offer"'::jsonb, 'Name of the global discount'),
  ('global_discount_percent', '10'::jsonb, 'Percentage of the global discount'),
  ('global_discount_start', 'null'::jsonb, 'Start time of global discount (ISO string)'),
  ('global_discount_end', 'null'::jsonb, 'End time of global discount (ISO string)')
ON CONFLICT (key) DO NOTHING;
