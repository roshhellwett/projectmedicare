-- Update search_medicines to join with medicine_batches and return gst
DROP FUNCTION IF EXISTS public.search_medicines(text, text, text, int, int);

CREATE OR REPLACE FUNCTION public.search_medicines(
  search_query text,
  sort_col text,
  sort_dir text,
  page_size int,
  page_offset int
)
RETURNS TABLE (
  id bigint,
  s_no integer,
  medicine_name text,
  selling_price numeric,
  pack_size text,
  mrp numeric,
  gst numeric,
  is_rx boolean,
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF search_query = '' THEN
    RETURN QUERY
    WITH batch_prices AS (
      SELECT medicine_id, MIN(mb.selling_price) as selling_price, MAX(mb.mrp) as mrp
      FROM public.medicine_batches mb
      WHERE mb.stock > 0
      GROUP BY medicine_id
    ),
    counted AS (
      SELECT count(*) as cnt FROM public.medicines m
      INNER JOIN batch_prices bp ON m.id = bp.medicine_id
    )
    SELECT 
      m.id, m.s_no, m.medicine_name, bp.selling_price, m.pack_size, bp.mrp, m.gst, m.is_rx,
      c.cnt as total_count
    FROM public.medicines m
    INNER JOIN batch_prices bp ON m.id = bp.medicine_id
    CROSS JOIN counted c
    ORDER BY 
      CASE WHEN sort_dir = 'asc' AND sort_col = 'medicine_name' THEN m.medicine_name END ASC,
      CASE WHEN sort_dir = 'desc' AND sort_col = 'medicine_name' THEN m.medicine_name END DESC,
      CASE WHEN sort_dir = 'asc' AND sort_col = 'selling_price' THEN bp.selling_price END ASC,
      CASE WHEN sort_dir = 'desc' AND sort_col = 'selling_price' THEN bp.selling_price END DESC,
      CASE WHEN sort_dir = 'asc' AND sort_col = 'mrp' THEN bp.mrp END ASC,
      CASE WHEN sort_dir = 'desc' AND sort_col = 'mrp' THEN bp.mrp END DESC,
      m.id ASC
    LIMIT page_size
    OFFSET page_offset;
  ELSE
    RETURN QUERY
    WITH batch_prices AS (
      SELECT medicine_id, MIN(mb.selling_price) as selling_price, MAX(mb.mrp) as mrp
      FROM public.medicine_batches mb
      WHERE mb.stock > 0
      GROUP BY medicine_id
    ),
    matched AS (
      SELECT 
        m.id, m.s_no, m.medicine_name, bp.selling_price, m.pack_size, bp.mrp, m.gst, m.is_rx,
        similarity(m.medicine_name, search_query) as sim
      FROM public.medicines m
      INNER JOIN batch_prices bp ON m.id = bp.medicine_id
      WHERE m.medicine_name % search_query 
         OR m.medicine_name ILIKE '%' || search_query || '%'
    ),
    counted AS (
      SELECT count(*) as cnt FROM matched
    )
    SELECT 
      m.id, m.s_no, m.medicine_name, m.selling_price, m.pack_size, m.mrp, m.gst, m.is_rx,
      c.cnt as total_count
    FROM matched m
    CROSS JOIN counted c
    ORDER BY 
      CASE WHEN sort_col = 'medicine_name' OR sort_col = '' THEN m.sim END DESC,
      CASE WHEN sort_dir = 'asc' AND sort_col = 'selling_price' THEN m.selling_price END ASC,
      CASE WHEN sort_dir = 'desc' AND sort_col = 'selling_price' THEN m.selling_price END DESC,
      CASE WHEN sort_dir = 'asc' AND sort_col = 'mrp' THEN m.mrp END ASC,
      CASE WHEN sort_dir = 'desc' AND sort_col = 'mrp' THEN m.mrp END DESC,
      m.id ASC
    LIMIT page_size
    OFFSET page_offset;
  END IF;
END;
$$;
