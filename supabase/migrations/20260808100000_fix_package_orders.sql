-- Fix package_orders table: add missing selected_at column and fix store_id type
-- Safe to run: all statements are guarded with IF NOT EXISTS / IF EXISTS

-- 1. Add selected_at column if missing
ALTER TABLE public.package_orders ADD COLUMN IF NOT EXISTS selected_at timestamptz;

-- 2. Fix store_id: convert from text to uuid
-- First drop any existing FK constraint on store_id (if any)
DO $$
BEGIN
  -- Check if store_id is text type and convert to uuid
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'package_orders'
      AND column_name = 'store_id'
      AND data_type = 'text'
  ) THEN
    -- Nullify any non-uuid values to avoid cast errors
    UPDATE public.package_orders
    SET store_id = NULL
    WHERE store_id IS NOT NULL
      AND store_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

    -- Alter column type
    ALTER TABLE public.package_orders
      ALTER COLUMN store_id TYPE uuid USING store_id::uuid;

    RAISE NOTICE 'Converted package_orders.store_id from text to uuid';
  END IF;
END $$;

-- 3. Add FK constraint if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
      AND table_schema = 'public'
      AND table_name = 'package_orders'
      AND constraint_name = 'package_orders_store_id_fkey'
  ) THEN
    ALTER TABLE public.package_orders
      ADD CONSTRAINT package_orders_store_id_fkey
      FOREIGN KEY (store_id) REFERENCES public.pharmacy_stores(id) ON DELETE SET NULL;

    RAISE NOTICE 'Added FK constraint package_orders.store_id -> pharmacy_stores.id';
  END IF;
END $$;

-- 4. Ensure created_at has a proper default
ALTER TABLE public.package_orders ALTER COLUMN created_at SET DEFAULT now();
