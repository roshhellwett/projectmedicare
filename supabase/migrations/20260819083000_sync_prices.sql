-- Add mrp and selling_price columns back to medicines table to allow global pricing sync

ALTER TABLE public.medicines 
    ADD COLUMN IF NOT EXISTS mrp NUMERIC,
    ADD COLUMN IF NOT EXISTS selling_price NUMERIC;

-- Optional: If there's already data in medicine_batches, we can sync the latest batch price to the medicines table
-- as an initial migration step.
UPDATE public.medicines m
SET 
    mrp = b.mrp,
    selling_price = b.selling_price
FROM (
    SELECT DISTINCT ON (medicine_id) medicine_id, mrp, selling_price
    FROM public.medicine_batches
    ORDER BY medicine_id, updated_at DESC
) b
WHERE m.id = b.medicine_id;
