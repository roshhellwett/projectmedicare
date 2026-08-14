-- Add directions_url to camp_posts
ALTER TABLE public.camp_posts
ADD COLUMN directions_url text DEFAULT NULL;

-- Update publish_camp function to accept directions_url
CREATE OR REPLACE FUNCTION public.publish_camp(
  p_title text,
  p_description text,
  p_venue text,
  p_address text,
  p_camp_date date,
  p_fee text,
  p_image_url text DEFAULT NULL,
  p_image_path text DEFAULT NULL,
  p_directions_url text DEFAULT NULL
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
  INSERT INTO public.camp_posts (title, description, venue, address, camp_date, fee, image_url, image_path, directions_url, is_active)
  VALUES (p_title, p_description, p_venue, p_address, p_camp_date, p_fee, p_image_url, p_image_path, p_directions_url, true)
  RETURNING id INTO new_id;

  RETURN new_id;
END $$;

REVOKE ALL ON FUNCTION public.publish_camp(text, text, text, text, date, text, text, text, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.publish_camp(text, text, text, text, date, text, text, text, text) TO service_role;
