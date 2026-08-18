CREATE TABLE IF NOT EXISTS public.sms_queue (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null,
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
ALTER TABLE public.sms_queue ENABLE ROW LEVEL SECURITY;

-- Allow admin role full access (service role bypasses RLS anyway, but good practice)
CREATE POLICY "Allow admin full access" ON public.sms_queue
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Function to handle medicine orders SMS
CREATE OR REPLACE FUNCTION queue_sms_for_medicine_order()
RETURNS trigger AS $$
DECLARE
  sms_msg text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    sms_msg := 'Hi ' || NEW.name || ', your medicine order has been successfully placed. We will notify you once a pharmacy claims it. - JantaMedicare';
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'claimed' THEN
      sms_msg := 'Hi ' || NEW.name || ', your medicine order has been claimed by a pharmacy and is being processed. - JantaMedicare';
    ELSIF NEW.status = 'preparing' THEN
      sms_msg := 'Hi ' || NEW.name || ', your medicine order has started preparing. - JantaMedicare';
    ELSIF NEW.status = 'out_for_delivery' THEN
      sms_msg := 'Hi ' || NEW.name || ', your medicine order is out for delivery! - JantaMedicare';
    ELSIF NEW.status = 'delivered' THEN
      sms_msg := 'Hi ' || NEW.name || ', your medicine order has been successfully delivered. Thank you! - JantaMedicare';
    ELSIF NEW.status = 'cancelled' THEN
      sms_msg := 'Hi ' || NEW.name || ', your medicine order has been cancelled. - JantaMedicare';
    END IF;
  END IF;

  IF sms_msg IS NOT NULL THEN
    INSERT INTO public.sms_queue (phone_number, message) VALUES (NEW.phone, sms_msg);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_medicine_orders_sms ON public.medicine_orders;
CREATE TRIGGER trg_medicine_orders_sms
  AFTER INSERT OR UPDATE OF status ON public.medicine_orders
  FOR EACH ROW
  EXECUTE FUNCTION queue_sms_for_medicine_order();


-- Function to handle package orders SMS
CREATE OR REPLACE FUNCTION queue_sms_for_package_order()
RETURNS trigger AS $$
DECLARE
  sms_msg text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    sms_msg := 'Hi ' || NEW.customer_name || ', your package order has been successfully placed. We will notify you once a store confirms it. - JantaMedicare';
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'confirmed' THEN
      sms_msg := 'Hi ' || NEW.customer_name || ', your package order has been confirmed by a store. - JantaMedicare';
    ELSIF NEW.status = 'preparing' THEN
      sms_msg := 'Hi ' || NEW.customer_name || ', your package order is now preparing. - JantaMedicare';
    ELSIF NEW.status = 'out_for_delivery' THEN
      sms_msg := 'Hi ' || NEW.customer_name || ', your package order is out for delivery! - JantaMedicare';
    ELSIF NEW.status = 'completed' THEN
      sms_msg := 'Hi ' || NEW.customer_name || ', your package order is completed. Thank you! - JantaMedicare';
    ELSIF NEW.status = 'cancelled' THEN
      sms_msg := 'Hi ' || NEW.customer_name || ', your package order has been cancelled. - JantaMedicare';
    END IF;
  END IF;

  IF sms_msg IS NOT NULL THEN
    INSERT INTO public.sms_queue (phone_number, message) VALUES (NEW.phone_number, sms_msg);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_package_orders_sms ON public.package_orders;
CREATE TRIGGER trg_package_orders_sms
  AFTER INSERT OR UPDATE OF status ON public.package_orders
  FOR EACH ROW
  EXECUTE FUNCTION queue_sms_for_package_order();


-- Function to handle job applications SMS
CREATE OR REPLACE FUNCTION queue_sms_for_job_application()
RETURNS trigger AS $$
DECLARE
  sms_msg text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    sms_msg := 'Hi ' || NEW.name || ', thank you for your application! We have received your CV and will get back to you soon. - JantaMedicare';
    INSERT INTO public.sms_queue (phone_number, message) VALUES (NEW.phone, sms_msg);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_job_applications_sms ON public.job_applications;
CREATE TRIGGER trg_job_applications_sms
  AFTER INSERT ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION queue_sms_for_job_application();
