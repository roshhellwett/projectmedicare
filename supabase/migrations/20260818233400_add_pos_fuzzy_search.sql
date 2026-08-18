-- Create search_pos_batches function for autocomplete and fuzzy search
DROP FUNCTION IF EXISTS public.search_pos_batches(text);

CREATE OR REPLACE FUNCTION public.search_pos_batches(search_query text)
RETURNS TABLE (
  id bigint,
  medicine_id bigint,
  barcode text,
  batch_number text,
  expiry_date text,
  buying_price numeric,
  selling_price numeric,
  mrp numeric,
  purchase numeric,
  sale numeric,
  stock numeric,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  medicine_name text,
  pack_size text,
  hsn_code text,
  gst numeric,
  sim real
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF search_query = '' THEN
    RETURN QUERY
    SELECT 
      mb.id, mb.medicine_id, mb.barcode, mb.batch_number, mb.expiry_date, 
      mb.buying_price, mb.selling_price, mb.mrp, mb.purchase, mb.sale, 
      mb.stock, mb.created_at, mb.updated_at,
      m.medicine_name,
      m.pack_size,
      m.hsn_code,
      m.gst,
      1.0::real as sim
    FROM public.medicine_batches mb
    INNER JOIN public.medicines m ON mb.medicine_id = m.id
    WHERE mb.stock > 0
    ORDER BY m.medicine_name ASC;
  ELSE
    RETURN QUERY
    SELECT 
      mb.id, mb.medicine_id, mb.barcode, mb.batch_number, mb.expiry_date, 
      mb.buying_price, mb.selling_price, mb.mrp, mb.purchase, mb.sale, 
      mb.stock, mb.created_at, mb.updated_at,
      m.medicine_name,
      m.pack_size,
      m.hsn_code,
      m.gst,
      similarity(m.medicine_name, search_query) as sim
    FROM public.medicine_batches mb
    INNER JOIN public.medicines m ON mb.medicine_id = m.id
    WHERE mb.stock > 0
      AND (
        mb.barcode ILIKE '%' || search_query || '%'
        OR mb.batch_number ILIKE '%' || search_query || '%'
        OR m.medicine_name % search_query 
        OR m.medicine_name ILIKE '%' || search_query || '%'
      )
    ORDER BY 
      CASE WHEN mb.barcode = search_query THEN 1 ELSE 0 END DESC,
      similarity(m.medicine_name, search_query) DESC,
      mb.expiry_date ASC;
  END IF;
END;
$$;

-- Ensure RLS allows access
GRANT EXECUTE ON FUNCTION public.search_pos_batches(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_pos_batches(text) TO service_role;
