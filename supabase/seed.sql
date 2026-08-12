-- ============================================================================
-- Janta Medicare LLP - Comprehensive Seed Data
-- Generates realistic Indian dummy data for local testing.
-- ============================================================================

-- 1. Pharmacy Stores
INSERT INTO public.pharmacy_stores (id, name, address, phone, lat, lng) VALUES
('11111111-1111-1111-1111-111111111111', 'Shibpur Store', '123 Shibpur Road, Howrah', '+91 62907 45327', 22.5626, 88.3130),
('22222222-2222-2222-2222-222222222222', 'Vivek Vihar Store', '45 Vivek Vihar, Kolkata', '+91 82408 04490', 22.5726, 88.3639),
('33333333-3333-3333-3333-333333333333', 'Pilkhana Store', '78 Pilkhana, Howrah', '+91 91238 99472', 22.5833, 88.3333)
ON CONFLICT (id) DO NOTHING;

-- 2. Health Packages
INSERT INTO public.packages (id, name, description, tests, market_price, janta_price, is_featured) VALUES
('aaaa1111-aaaa-1111-aaaa-111111111111', 'Basic Health Checkup', 'Comprehensive routine checkup for general health monitoring.', ARRAY['CBC', 'Fasting Blood Sugar', 'Lipid Profile', 'Liver Function Test', 'Kidney Function Test'], 1500, 799, true),
('aaaa2222-aaaa-2222-aaaa-222222222222', 'Advanced Diabetic Care', 'Specialized package for diabetic patients to monitor vital organs.', ARRAY['HbA1c', 'Fasting Blood Sugar', 'PP Blood Sugar', 'Urine Routine', 'Creatinine'], 2200, 1199, true),
('aaaa3333-aaaa-3333-aaaa-333333333333', 'Senior Citizen Profile', 'Tailored for elderly patients above 60 years.', ARRAY['CBC', 'Thyroid Profile', 'Vitamin D', 'Vitamin B12', 'Calcium', 'ECG'], 3500, 1899, false)
ON CONFLICT (id) DO NOTHING;

-- 3. Package Orders
INSERT INTO public.package_orders (id, customer_name, phone_number, package_id, status, store_id) VALUES
(gen_random_uuid(), 'Rahul Sharma', '9876543210', 'aaaa1111-aaaa-1111-aaaa-111111111111', 'pending', '11111111-1111-1111-1111-111111111111'),
(gen_random_uuid(), 'Priya Patel', '9876543211', 'aaaa2222-aaaa-2222-aaaa-222222222222', 'completed', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO NOTHING;

-- 4. Medicines
INSERT INTO public.medicines (s_no, medicine_name, selling_price, pack_size, mrp) VALUES
(1, 'Paracetamol 500mg', 15.00, '10 Tablets', 20.00),
(2, 'Azithromycin 500mg', 60.00, '3 Tablets', 75.00),
(3, 'Pantoprazole 40mg', 45.00, '10 Tablets', 65.00),
(4, 'Vitamin C Zinc', 55.00, '15 Tablets', 85.00),
(5, 'Cough Syrup 100ml', 80.00, '1 Bottle', 110.00)
ON CONFLICT (id) DO NOTHING;

-- 5. Patient Rates
INSERT INTO public.patient_rates (sl_no, test_name, jm_rate, vail_name) VALUES
(1, 'Complete Blood Count (CBC)', '150', 'EDTA'),
(2, 'Fasting Blood Sugar (FBS)', '50', 'Fluoride'),
(3, 'Lipid Profile', '350', 'SST'),
(4, 'Thyroid Profile (T3, T4, TSH)', '400', 'SST'),
(5, 'HbA1c', '300', 'EDTA')
ON CONFLICT (id) DO NOTHING;

-- 6. Doctors
INSERT INTO public.doctors (id, name, gender, specialty, department, qualifications, contact, is_daily_chamber, daily_fee) VALUES
(gen_random_uuid(), 'Dr. A. K. Sen', 'male', 'Cardiologist', 'Cardiology', ARRAY['MBBS', 'MD (Medicine)', 'DM (Cardiology)'], '9876543212', true, 500),
(gen_random_uuid(), 'Dr. Sunita Roy', 'female', 'Gynecologist', 'Obstetrics & Gynecology', ARRAY['MBBS', 'MS (O&G)'], '9876543213', true, 400),
(gen_random_uuid(), 'Dr. Ramesh Gupta', 'male', 'General Physician', 'General Medicine', ARRAY['MBBS', 'MD (Medicine)'], '9876543214', false, 300)
ON CONFLICT (id) DO NOTHING;

-- 7. Feedbacks
INSERT INTO public.feedbacks (id, name, phone, note) VALUES
(gen_random_uuid(), 'Anil Kumar', '9876543215', 'Great service and very affordable medicines.'),
(gen_random_uuid(), 'Neha Singh', '9876543216', 'The health checkup process was very smooth.')
ON CONFLICT (id) DO NOTHING;

-- 8. Bulletins (Products & Offers)
INSERT INTO public.bulletins (id, body, kind, starts_at, ends_at, pinned) VALUES
(gen_random_uuid(), 'New Stock: Accu-Chek Active Blood Glucose Meter\nNow available at a discounted price of ₹850.', 'product', now() - interval '1 day', null, true),
(gen_random_uuid(), 'Himalaya Baby Care Gift Box\nPerfect gift for newborns. Available across all stores.', 'product', now() - interval '2 days', null, false),
(gen_random_uuid(), 'Special Sunday Offer: Flat 20% off on all generic medicines this Sunday!', 'offer', now() - interval '1 day', now() + interval '5 days', true),
(gen_random_uuid(), 'Free Blood Pressure Checkup this weekend at Shibpur branch.', 'offer', now(), now() + interval '2 days', false)
ON CONFLICT (id) DO NOTHING;

-- 9. Camp Posts
INSERT INTO public.camp_posts (id, title, description, venue, address, camp_date, fee, is_active) VALUES
(gen_random_uuid(), 'Free Heart Checkup Camp', 'Join our free cardiology consultation camp led by senior doctors.', 'Janta Medicare LLP Main Hub', '123 Shibpur Road, Howrah', current_date + interval '3 days', 'Registration ₹100 only', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.announcements (title, description, is_active) VALUES ('System Maintenance', 'The system will undergo maintenance tonight at 2 AM.', true);
