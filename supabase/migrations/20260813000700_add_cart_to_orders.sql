ALTER TABLE public.medicine_orders DROP CONSTRAINT IF EXISTS medicine_orders_prescription_url_check;
ALTER TABLE public.medicine_orders ALTER COLUMN prescription_url DROP NOT NULL;
ALTER TABLE public.medicine_orders ADD COLUMN IF NOT EXISTS cart_items JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.medicines ADD COLUMN IF NOT EXISTS is_rx BOOLEAN DEFAULT true;
