GRANT SELECT ON public.medicines TO anon, authenticated;
GRANT SELECT ON public.patient_rates TO anon, authenticated;
GRANT SELECT ON public.doctors TO anon, authenticated;
GRANT SELECT ON public.packages TO anon, authenticated;
GRANT SELECT ON public.pharmacy_stores TO anon, authenticated;

-- Also ensure service_role has ALL permissions on everything
GRANT ALL ON public.medicines TO service_role;
GRANT ALL ON public.patient_rates TO service_role;
GRANT ALL ON public.doctors TO service_role;
GRANT ALL ON public.packages TO service_role;
GRANT ALL ON public.pharmacy_stores TO service_role;
GRANT ALL ON public.package_orders TO service_role;
