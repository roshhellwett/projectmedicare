-- Update purge_expired_bulletins to also handle 'product' kind
-- Products with an end date should expire just like offers

CREATE OR REPLACE FUNCTION public.purge_expired_bulletins(grace_hours integer DEFAULT 24)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  removed integer;
BEGIN
  DELETE FROM public.bulletins
   WHERE kind IN ('offer', 'product')
     AND ends_at IS NOT NULL
     AND ends_at < now() - make_interval(hours => greatest(grace_hours, 0));
  GET DIAGNOSTICS removed = ROW_COUNT;
  RETURN removed;
END $$;

REVOKE ALL ON FUNCTION public.purge_expired_bulletins(integer) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_expired_bulletins(integer) TO service_role;

-- Also create an atomic publish_camp function for safe camp publishing
CREATE OR REPLACE FUNCTION public.publish_camp(
  p_title text,
  p_description text,
  p_venue text,
  p_address text,
  p_camp_date date,
  p_fee text,
  p_image_url text DEFAULT NULL,
  p_image_path text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  -- Archive all currently active camps
  UPDATE public.camp_posts SET is_active = false WHERE is_active = true;

  -- Insert the new active camp
  INSERT INTO public.camp_posts (title, description, venue, address, camp_date, fee, image_url, image_path, is_active)
  VALUES (p_title, p_description, p_venue, p_address, p_camp_date, p_fee, p_image_url, p_image_path, true)
  RETURNING id INTO new_id;

  RETURN new_id;
END $$;

REVOKE ALL ON FUNCTION public.publish_camp(text, text, text, text, date, text, text, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.publish_camp(text, text, text, text, date, text, text, text) TO service_role;
