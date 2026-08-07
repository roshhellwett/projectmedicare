-- Update any existing 'info' bulletins to be 'product'
UPDATE public.bulletins SET kind = 'product' WHERE kind = 'info';
