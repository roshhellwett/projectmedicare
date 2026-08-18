-- Add patient_phone to invoices
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS patient_phone TEXT;

-- Update create_invoice RPC to accept p_patient_phone
DROP FUNCTION IF EXISTS public.create_invoice(TEXT, TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC, NUMERIC, JSONB, TEXT);
DROP FUNCTION IF EXISTS public.create_invoice(TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC, NUMERIC, JSONB, TEXT);

CREATE OR REPLACE FUNCTION public.create_invoice(
    p_invoice_no TEXT,
    p_patient_name TEXT,
    p_patient_phone TEXT,
    p_doctor_name TEXT,
    p_subtotal NUMERIC,
    p_gst_total NUMERIC,
    p_discount NUMERIC,
    p_net_amount NUMERIC,
    p_items JSONB, -- Array of {batch_id, quantity, rate, gst_percent, gst_amount, amount}
    p_store_id TEXT DEFAULT NULL
) RETURNS BIGINT AS $$
DECLARE
    v_invoice_id BIGINT;
    v_item JSONB;
    v_batch_id BIGINT;
    v_quantity NUMERIC;
BEGIN
    -- Insert invoice
    INSERT INTO public.invoices (invoice_no, patient_name, patient_phone, doctor_name, subtotal, gst_total, discount, net_amount, status, store_id)
    VALUES (p_invoice_no, p_patient_name, p_patient_phone, p_doctor_name, p_subtotal, p_gst_total, p_discount, p_net_amount, 'completed', p_store_id)
    RETURNING id INTO v_invoice_id;

    -- Process each item
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_batch_id := (v_item->>'batch_id')::BIGINT;
        v_quantity := (v_item->>'quantity')::NUMERIC;

        -- Check and deduct stock atomically
        UPDATE public.medicine_batches
        SET stock = stock - v_quantity
        WHERE id = v_batch_id AND stock >= v_quantity;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Insufficient stock for batch %', v_batch_id;
        END IF;

        -- Insert invoice item
        INSERT INTO public.invoice_items (invoice_id, batch_id, quantity, rate, gst_percent, gst_amount, amount)
        VALUES (
            v_invoice_id, 
            v_batch_id, 
            v_quantity, 
            (v_item->>'rate')::NUMERIC, 
            (v_item->>'gst_percent')::NUMERIC, 
            (v_item->>'gst_amount')::NUMERIC, 
            (v_item->>'amount')::NUMERIC
        );
    END LOOP;

    RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.create_invoice(TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC, NUMERIC, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_invoice(TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC, NUMERIC, JSONB, TEXT) TO service_role;
