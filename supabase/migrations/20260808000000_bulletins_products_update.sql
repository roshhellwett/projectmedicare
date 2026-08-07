-- Add 'product' to the bulletin_kind enum
ALTER TYPE public.bulletin_kind ADD VALUE IF NOT EXISTS 'product';

-- Add image_url to bulletins table
ALTER TABLE public.bulletins ADD COLUMN IF NOT EXISTS image_url text;

-- Create the products storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for the products bucket
CREATE POLICY "Public Access for products" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'products');

CREATE POLICY "Authenticated Insert for products" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Update for products" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'products' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Delete for products" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'products' AND auth.role() = 'authenticated');
