-- ============================================================================
-- Migration: Add app_settings table for secure env keys
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name text NOT NULL UNIQUE,
  encrypted_value text NOT NULL,
  iv text NOT NULL,
  auth_tag text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: Only allow service_role to access this table
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Deny all access to public (anon/authenticated) by default (no policies)

-- Grant all to service_role
GRANT ALL ON public.app_settings TO service_role;

-- Setup updated_at trigger
DROP TRIGGER IF EXISTS app_settings_touch_updated_at ON public.app_settings;
CREATE TRIGGER app_settings_touch_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
