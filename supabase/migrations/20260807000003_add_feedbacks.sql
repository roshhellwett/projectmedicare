-- Create feedbacks table
CREATE TABLE public.feedbacks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    phone text NOT NULL UNIQUE,
    note text,
    image_url text,
    created_at timestamptz DEFAULT now()
);

-- RLS for feedbacks
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Allow public to insert feedbacks (actually we will use service_role from Next.js API, so we don't necessarily need public insert here)
-- But we can add it just in case, though the API route is better. Let's just grant select to anon.
GRANT SELECT ON public.feedbacks TO anon, authenticated;
GRANT ALL ON public.feedbacks TO service_role;

-- Allow public read so they could potentially see feedbacks if we want to display them
CREATE POLICY "Allow public read access on feedbacks" 
  ON public.feedbacks FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Allow full access to authenticated admins (and service_role bypasses RLS)
CREATE POLICY "Allow admin full access on feedbacks" 
  ON public.feedbacks FOR ALL 
  TO authenticated 
  USING (true);

-- Create storage bucket for feedbacks
INSERT INTO storage.buckets (id, name, public) 
VALUES ('feedbacks', 'feedbacks', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for feedbacks bucket
CREATE POLICY "feedbacks public read" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'feedbacks');

CREATE POLICY "feedbacks admin all" 
  ON storage.objects FOR ALL 
  TO authenticated 
  USING (bucket_id = 'feedbacks');
