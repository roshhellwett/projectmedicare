CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_medicines_name_trgm ON public.medicines USING gin (medicine_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_patient_rates_name_trgm ON public.patient_rates USING gin (test_name gin_trgm_ops);

-- Medicines Search
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
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF search_query = '' THEN
    RETURN QUERY
    WITH counted AS (
      SELECT count(*) as cnt FROM public.medicines
    )
    SELECT 
      m.id, m.s_no, m.medicine_name, m.selling_price, m.pack_size, m.mrp,
      c.cnt as total_count
    FROM public.medicines m
    CROSS JOIN counted c
    ORDER BY 
      CASE WHEN sort_dir = 'asc' AND sort_col = 'medicine_name' THEN m.medicine_name END ASC,
      CASE WHEN sort_dir = 'desc' AND sort_col = 'medicine_name' THEN m.medicine_name END DESC,
      CASE WHEN sort_dir = 'asc' AND sort_col = 'selling_price' THEN m.selling_price END ASC,
      CASE WHEN sort_dir = 'desc' AND sort_col = 'selling_price' THEN m.selling_price END DESC,
      CASE WHEN sort_dir = 'asc' AND sort_col = 'mrp' THEN m.mrp END ASC,
      CASE WHEN sort_dir = 'desc' AND sort_col = 'mrp' THEN m.mrp END DESC,
      m.id ASC
    LIMIT page_size
    OFFSET page_offset;
  ELSE
    RETURN QUERY
    WITH matched AS (
      SELECT 
        m.id, m.s_no, m.medicine_name, m.selling_price, m.pack_size, m.mrp,
        similarity(m.medicine_name, search_query) as sim
      FROM public.medicines m
      WHERE m.medicine_name % search_query 
         OR m.medicine_name ILIKE '%' || search_query || '%'
    ),
    counted AS (
      SELECT count(*) as cnt FROM matched
    )
    SELECT 
      m.id, m.s_no, m.medicine_name, m.selling_price, m.pack_size, m.mrp,
      c.cnt as total_count
    FROM matched m
    CROSS JOIN counted c
    ORDER BY 
      -- When searching, usually relevance (similarity) is the best default sort
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


-- Rate Chart Search
CREATE OR REPLACE FUNCTION public.search_rates(
  search_query text,
  sort_col text,
  sort_dir text,
  page_size int,
  page_offset int
)
RETURNS TABLE (
  id bigint,
  sl_no integer,
  test_name text,
  jm_rate text,
  vail_name text,
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF search_query = '' THEN
    RETURN QUERY
    WITH counted AS (
      SELECT count(*) as cnt FROM public.patient_rates
    )
    SELECT 
      m.id, m.sl_no, m.test_name, m.jm_rate, m.vail_name,
      c.cnt as total_count
    FROM public.patient_rates m
    CROSS JOIN counted c
    ORDER BY 
      CASE WHEN sort_dir = 'asc' AND sort_col = 'test_name' THEN m.test_name END ASC,
      CASE WHEN sort_dir = 'desc' AND sort_col = 'test_name' THEN m.test_name END DESC,
      m.id ASC
    LIMIT page_size
    OFFSET page_offset;
  ELSE
    RETURN QUERY
    WITH matched AS (
      SELECT 
        m.id, m.sl_no, m.test_name, m.jm_rate, m.vail_name,
        similarity(m.test_name, search_query) as sim
      FROM public.patient_rates m
      WHERE m.test_name % search_query 
         OR m.test_name ILIKE '%' || search_query || '%'
    ),
    counted AS (
      SELECT count(*) as cnt FROM matched
    )
    SELECT 
      m.id, m.sl_no, m.test_name, m.jm_rate, m.vail_name,
      c.cnt as total_count
    FROM matched m
    CROSS JOIN counted c
    ORDER BY 
      CASE WHEN sort_col = 'test_name' OR sort_col = '' THEN m.sim END DESC,
      m.id ASC
    LIMIT page_size
    OFFSET page_offset;
  END IF;
END;
$$;
