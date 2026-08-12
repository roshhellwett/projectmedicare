ALTER TABLE public.medicine_orders ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
