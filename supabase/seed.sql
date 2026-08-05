-- =============================================================================
-- My Kenyan Guide — Seed Data
-- Run AFTER applying the initial schema migration.
-- Creates a seed system user + one listing per category slot.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Seed system user (not a real auth account — bypass FK for demo data)
-- This user owns all seed listings. In production you may remove this user
-- and re-assign listings to real verified accounts.
-- ---------------------------------------------------------------------------
do $$
declare
  v_seed_id uuid := '00000000-0000-0000-0000-000000000001'::uuid;
begin
  -- Insert into auth.users (requires postgres superuser; safe in SQL Editor)
  insert into auth.users (
    id, instance_id, aud, role, email,
    encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data
  )
  values (
    v_seed_id,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated', 'authenticated',
    'seed@mykenyanguide.internal',
    '', now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"My Kenyan Guide","account_type":"provider"}'::jsonb
  )
  on conflict (id) do nothing;

  -- Profile for seed user
  insert into public.profiles (id, name, phone, account_type)
  values (v_seed_id, 'My Kenyan Guide', '', 'provider')
  on conflict (id) do nothing;
end;
$$;

-- ---------------------------------------------------------------------------
-- Seed listings helper — insert with explicit rating/review_count so the
-- trigger doesn't zero them out (we bypass the reviews table for demo data).
-- ---------------------------------------------------------------------------
do $$
declare
  v_seed uuid := '00000000-0000-0000-0000-000000000001'::uuid;
begin

-- ============================================================
-- SERVICE PROVIDERS
-- ============================================================
insert into public.listings
  (id, category_id, title, subtitle, description, location, county, price,
   phone, tags, user_id, verified, available, rating, review_count, created_at)
values
  ('a0000001-0000-0000-0000-000000000001', 'providers',
   'James Mwangi', 'Master Plumber',
   'Professional plumber with 12 years experience. Specialises in residential and commercial plumbing, pipe installations, and emergency repairs. Available 24/7 across Nairobi.',
   'Westlands, Nairobi', 'Nairobi', 'KSh 2,500/hr',
   '+254 712 345 678', ARRAY['Plumbing','Pipe Repair','Drainage','Emergency'],
   v_seed, true, true, 4.9, 284, now() - interval '30 days'),

  ('a0000001-0000-0000-0000-000000000002', 'providers',
   'Grace Wanjiku', 'Certified Electrician',
   'Licensed electrician offering residential wiring, solar installations, and electrical fault diagnosis. Available for emergency callouts in Nairobi and environs.',
   'Kilimani, Nairobi', 'Nairobi', 'KSh 3,000/hr',
   '+254 723 456 789', ARRAY['Electrical','Wiring','Solar','Emergency'],
   v_seed, true, true, 4.8, 192, now() - interval '25 days'),

  ('a0000001-0000-0000-0000-000000000003', 'providers',
   'David Kamau', 'Carpenter & Furniture Maker',
   'Skilled carpenter specialising in custom furniture, kitchen cabinets, wardrobes, and home renovation. Quality craftsmanship guaranteed with free consultation.',
   'Industrial Area, Nairobi', 'Nairobi', 'KSh 2,000/hr',
   '+254 734 567 890', ARRAY['Carpentry','Furniture','Renovation','Cabinets'],
   v_seed, true, true, 4.7, 156, now() - interval '18 days'),

  ('a0000001-0000-0000-0000-000000000004', 'providers',
   'Mary Njeri', 'Professional House Cleaner',
   'Thorough and reliable house cleaner. Services include deep cleaning, laundry, ironing, and regular maintenance cleaning. References available on request.',
   'South C, Nairobi', 'Nairobi', 'KSh 1,500/visit',
   '+254 745 678 901', ARRAY['Cleaning','Laundry','Ironing','Deep Clean'],
   v_seed, false, true, 4.6, 203, now() - interval '10 days'),

  ('a0000001-0000-0000-0000-000000000005', 'providers',
   'Peter Otieno', 'Auto Mechanic',
   'Expert auto mechanic with 15 years experience. Specialises in engine diagnostics, general servicing, body work, and tyre services. Walk-ins welcome.',
   'Eastleigh, Nairobi', 'Nairobi', 'KSh 500–5,000',
   '+254 756 789 012', ARRAY['Auto Repair','Engine','Tyres','Diagnostics'],
   v_seed, true, true, 4.8, 317, now() - interval '45 days'),

  ('a0000001-0000-0000-0000-000000000006', 'providers',
   'Amina Hassan', 'Private Tutor',
   'Experienced tutor for primary and secondary school students. Subjects: Mathematics, English, Sciences, and Kiswahili. Home visits and online sessions available.',
   'Parklands, Nairobi', 'Nairobi', 'KSh 800/hr',
   '+254 767 890 123', ARRAY['Tutoring','Mathematics','Sciences','English'],
   v_seed, true, true, 4.9, 128, now() - interval '60 days'),

  ('a0000001-0000-0000-0000-000000000007', 'providers',
   'John Kiprotich', 'HVAC Technician',
   'Certified HVAC technician offering AC installation, servicing, repair, and maintenance for homes and offices. Fast turnaround and competitive pricing.',
   'Upperhill, Nairobi', 'Nairobi', 'KSh 3,500/visit',
   '+254 778 901 234', ARRAY['HVAC','Air Conditioning','Installation','Repair'],
   v_seed, true, true, 4.7, 89, now() - interval '20 days'),

  ('a0000001-0000-0000-0000-000000000008', 'providers',
   'Susan Wairimu', 'Professional Photographer',
   'Creative photographer specialising in portraits, events, corporate photography, and real estate shoots. Includes basic editing and same-week delivery.',
   'Lavington, Nairobi', 'Nairobi', 'KSh 5,000/session',
   '+254 789 012 345', ARRAY['Photography','Portraits','Events','Corporate'],
   v_seed, true, true, 4.8, 74, now() - interval '15 days'),

-- ============================================================
-- BUSINESSES
-- ============================================================
  ('b0000002-0000-0000-0000-000000000001', 'businesses',
   'Savanna Law Group', 'Legal Services',
   'Full-service law firm specialising in property law, corporate law, employment disputes, and litigation. Free initial consultation. Nairobi and Mombasa branches.',
   'Upper Hill, Nairobi', 'Nairobi', 'Consultation from KSh 3,000',
   '+254 700 111 222', ARRAY['Law','Property','Corporate','Litigation'],
   v_seed, true, true, 4.7, 52, now() - interval '90 days'),

  ('b0000002-0000-0000-0000-000000000002', 'businesses',
   'AfyaCare Clinic', 'Private Medical Clinic',
   'Comprehensive outpatient care: general medicine, paediatrics, dental, and lab services. Cashless NHIF and major insurance accepted. Open daily 7am–10pm.',
   'Westlands, Nairobi', 'Nairobi', 'Consultation from KSh 1,500',
   '+254 700 222 333', ARRAY['Medical','Dental','Paediatrics','Lab','NHIF'],
   v_seed, true, true, 4.8, 311, now() - interval '120 days'),

  ('b0000002-0000-0000-0000-000000000003', 'businesses',
   'TechNova IT Solutions', 'IT Services & Support',
   'Managed IT services, network setup, cybersecurity, software development, and computer repairs for SMEs. SLA-backed support contracts available.',
   'Gigiri, Nairobi', 'Nairobi', 'Plans from KSh 15,000/mo',
   '+254 700 333 444', ARRAY['IT','Networking','Cybersecurity','Software','Support'],
   v_seed, true, true, 4.6, 47, now() - interval '80 days'),

  ('b0000002-0000-0000-0000-000000000004', 'businesses',
   'Jamii Catering Co.', 'Event Catering',
   'Professional catering for weddings, corporate events, birthday parties, and funerals. Swahili, Continental, and BBQ menus. Minimum 30 guests.',
   'Kasarani, Nairobi', 'Nairobi', 'From KSh 800/person',
   '+254 700 444 555', ARRAY['Catering','Weddings','Events','Food'],
   v_seed, true, true, 4.9, 183, now() - interval '50 days'),

  ('b0000002-0000-0000-0000-000000000005', 'businesses',
   'Mombasa Traders Ltd', 'Import & Wholesale',
   'Wholesale distributors of electronics, household goods, and building materials. Competitive prices for retailers and contractors. Delivery across Kenya.',
   'Mombasa CBD, Mombasa', 'Mombasa', 'Wholesale pricing',
   '+254 700 555 666', ARRAY['Wholesale','Electronics','Import','Building Materials'],
   v_seed, true, true, 4.5, 68, now() - interval '200 days'),

  ('b0000002-0000-0000-0000-000000000006', 'businesses',
   'Nakuru Agri Supplies', 'Agricultural Inputs',
   'One-stop shop for certified seeds, fertilisers, pesticides, farm equipment, and irrigation systems. Expert agronomist advice included. Delivery across Rift Valley.',
   'Nakuru Town, Nakuru', 'Nakuru', 'Prices vary by product',
   '+254 700 666 777', ARRAY['Agriculture','Seeds','Fertilisers','Farm Equipment'],
   v_seed, true, true, 4.7, 95, now() - interval '150 days'),

-- ============================================================
-- EMERGENCY SERVICES
-- ============================================================
  ('c0000003-0000-0000-0000-000000000001', 'emergency',
   'Nairobi Ambulance Services', '24/7 Emergency Ambulance',
   'Fully equipped ambulances with paramedics. Average response time under 15 minutes in Nairobi. Accepts cash, M-Pesa, and insurance. ICU-capable vehicles available.',
   'Nairobi (Citywide)', 'Nairobi', 'From KSh 3,000',
   '+254 0800 723 000', ARRAY['Ambulance','Paramedic','ICU','Emergency'],
   v_seed, true, true, 4.8, 420, now() - interval '365 days'),

  ('c0000003-0000-0000-0000-000000000002', 'emergency',
   'Kenya Red Cross — Nairobi', 'Humanitarian & Crisis Response',
   'Emergency response, disaster management, blood donation, and first aid training. 24/7 emergency helpline. Volunteers and donation support available.',
   'Nairobi (Citywide)', 'Nairobi', 'Free (donations welcome)',
   '+254 703 037 000', ARRAY['Rescue','Blood Donation','Disaster','Crisis'],
   v_seed, true, true, 4.9, 752, now() - interval '365 days'),

  ('c0000003-0000-0000-0000-000000000003', 'emergency',
   'AA Kenya Roadside Rescue', 'Vehicle Breakdown & Towing',
   'Roadside assistance across Kenya — flat tyre, battery jump, fuel delivery, and towing. 24/7 callout. Membership plans available for frequent travellers.',
   'Kenya-wide', 'Nairobi', 'From KSh 1,500 per callout',
   '+254 722 200 000', ARRAY['Towing','Roadside','Breakdown','Rescue'],
   v_seed, true, true, 4.6, 289, now() - interval '365 days'),

  ('c0000003-0000-0000-0000-000000000004', 'emergency',
   'CityLock Emergency Locksmiths', '24/7 Locksmith',
   'Locked out? Lost your keys? We arrive in under 30 minutes anywhere in Nairobi. Car, home, and office locks. No call-out fee during business hours.',
   'Nairobi (Citywide)', 'Nairobi', 'From KSh 1,000',
   '+254 711 500 500', ARRAY['Locksmith','Keys','Emergency','Cars'],
   v_seed, true, true, 4.7, 143, now() - interval '180 days'),

-- ============================================================
-- JOB CORNER
-- ============================================================
  ('d0000004-0000-0000-0000-000000000001', 'jobs',
   'Software Developer (React Native)', 'TechNova IT Solutions',
   'We are hiring a React Native developer to build and maintain our flagship mobile app. 2+ years experience required. Competitive salary + equity. Hybrid (Nairobi).',
   'Gigiri, Nairobi', 'Nairobi', 'KSh 120,000–180,000/mo',
   '+254 700 333 444', ARRAY['IT','React Native','Mobile','Software'],
   v_seed, true, true, 0, 0, now() - interval '3 days'),

  ('d0000004-0000-0000-0000-000000000002', 'jobs',
   'Truck Driver — Long Haul', 'Mombasa Traders Ltd',
   'Experienced truck driver needed for Mombasa–Nairobi–Kampala route. Valid C1E licence required. 5+ years experience. Attractive allowances and medical cover.',
   'Mombasa CBD, Mombasa', 'Mombasa', 'KSh 45,000–60,000/mo',
   '+254 700 555 666', ARRAY['Driving','Truck','Long Haul','Logistics'],
   v_seed, true, true, 0, 0, now() - interval '5 days'),

  ('d0000004-0000-0000-0000-000000000003', 'jobs',
   'Accounts Clerk', 'Savanna Law Group',
   'Looking for a detail-oriented accounts clerk to manage invoicing, payroll, and financial records. CPA Part II minimum. Previous law firm experience is a plus.',
   'Upper Hill, Nairobi', 'Nairobi', 'KSh 35,000–50,000/mo',
   '+254 700 111 222', ARRAY['Finance','Accounting','CPA','Office'],
   v_seed, true, true, 0, 0, now() - interval '7 days'),

  ('d0000004-0000-0000-0000-000000000004', 'jobs',
   'Farm Manager — Rift Valley', 'Nakuru Agri Supplies',
   'Seeking an experienced farm manager for a 200-acre mixed farm in Nakuru. Diploma in Agriculture required. Accommodation and transport provided.',
   'Nakuru Town, Nakuru', 'Nakuru', 'KSh 55,000/mo + benefits',
   '+254 700 666 777', ARRAY['Agriculture','Farm','Management','Rift Valley'],
   v_seed, true, true, 0, 0, now() - interval '2 days'),

  ('d0000004-0000-0000-0000-000000000005', 'jobs',
   'Registered Nurse (ICU)', 'AfyaCare Clinic',
   'Urgently needed: ICU-trained registered nurse. BScN required, KMPDB registration mandatory. Competitive salary, medical cover for family, and housing allowance.',
   'Westlands, Nairobi', 'Nairobi', 'KSh 70,000–90,000/mo',
   '+254 700 222 333', ARRAY['Healthcare','Nursing','ICU','Medical'],
   v_seed, true, true, 0, 0, now() - interval '1 day'),

  ('d0000004-0000-0000-0000-000000000006', 'jobs',
   'Chef — Event Catering', 'Jamii Catering Co.',
   'Experienced chef needed for high-volume event catering. Must have expertise in Swahili, Continental, and BBQ cuisines. Valid Food Handler certificate required.',
   'Kasarani, Nairobi', 'Nairobi', 'KSh 40,000–55,000/mo',
   '+254 700 444 555', ARRAY['Catering','Chef','Events','Food'],
   v_seed, true, true, 0, 0, now() - interval '4 days'),

-- ============================================================
-- MARKETPLACE (Products)
-- ============================================================
  ('e0000005-0000-0000-0000-000000000001', 'products',
   'Samsung Galaxy S24 Ultra', 'Smartphone — Like New',
   'Samsung Galaxy S24 Ultra, 12GB RAM / 512GB. Phantom Black. Used 3 months, comes with original box, two cases, and screen protector. No scratches. IMEI verified.',
   'Kilimani, Nairobi', 'Nairobi', 'KSh 145,000',
   '+254 722 111 001', ARRAY['Electronics','Samsung','Smartphone','Android'],
   v_seed, false, true, 0, 0, now() - interval '2 days'),

  ('e0000005-0000-0000-0000-000000000002', 'products',
   'L-Shaped Office Desk', 'Furniture — Good Condition',
   'Large L-shaped office desk with cable management and built-in drawers. Walnut finish. Dimensions: 180cm × 140cm. Collection only from Westlands.',
   'Westlands, Nairobi', 'Nairobi', 'KSh 18,500',
   '+254 722 111 002', ARRAY['Furniture','Office','Desk','Walnut'],
   v_seed, false, true, 0, 0, now() - interval '5 days'),

  ('e0000005-0000-0000-0000-000000000003', 'products',
   'Toyota Fielder 2018', 'Station Wagon — Excellent',
   '2018 Toyota Fielder, 1500cc, petrol. Silver. 62,000km on clock. Single owner, full service history at Toyota Kenya. New tyres fitted. Accident-free.',
   'Ngong Road, Nairobi', 'Nairobi', 'KSh 1,750,000',
   '+254 722 111 003', ARRAY['Vehicles','Toyota','Fielder','Station Wagon'],
   v_seed, true, true, 0, 0, now() - interval '8 days'),

  ('e0000005-0000-0000-0000-000000000004', 'products',
   'Dewalt 20V Cordless Drill Set', 'Power Tool — Barely Used',
   'Dewalt DCD771C2 cordless drill/driver kit. Two batteries, charger, carry case. Used twice on one project. Perfect working order. Selling because of duplicate.',
   'Industrial Area, Nairobi', 'Nairobi', 'KSh 12,000',
   '+254 722 111 004', ARRAY['Tools','Dewalt','Drill','Power Tools'],
   v_seed, false, true, 0, 0, now() - interval '3 days'),

  ('e0000005-0000-0000-0000-000000000005', 'products',
   'Maize — 90 kg Bags', 'Farm Produce (Bulk)',
   'Fresh maize from Nakuru farm. Moisture-tested at 12%. 50 × 90 kg bags available. Delivery available within Nakuru County. Minimum order 10 bags.',
   'Nakuru Town, Nakuru', 'Nakuru', 'KSh 4,500/bag',
   '+254 722 111 005', ARRAY['Agriculture','Maize','Farm Produce','Bulk'],
   v_seed, true, true, 0, 0, now() - interval '1 day'),

  ('e0000005-0000-0000-0000-000000000006', 'products',
   'LG 50" 4K Smart TV', 'Electronics — Like New',
   'LG 50UN7300 4K UHD Smart TV. ThinQ AI, webOS, Bluetooth, Wi-Fi built in. Purchased 6 months ago. All cables, remote, and wall bracket included.',
   'South B, Nairobi', 'Nairobi', 'KSh 52,000',
   '+254 722 111 006', ARRAY['Electronics','LG','TV','4K','Smart TV'],
   v_seed, false, true, 0, 0, now() - interval '4 days'),

-- ============================================================
-- REAL ESTATE
-- ============================================================
  ('f0000006-0000-0000-0000-000000000001', 'realestate',
   '2-Bedroom Apartment — Kileleshwa', 'For Rent',
   'Spacious 2-bed, 2-bath apartment in a secure gated complex. Swimming pool, gym, backup generator, DSQ. Unfurnished. Available from 1st next month. No brokers.',
   'Kileleshwa, Nairobi', 'Nairobi', 'KSh 65,000/mo',
   '+254 733 200 001', ARRAY['2 Bedrooms','Apartment','Pool','Gym','DSQ'],
   v_seed, true, true, 4.6, 18, now() - interval '10 days'),

  ('f0000006-0000-0000-0000-000000000002', 'realestate',
   '3-Bedroom House — Runda', 'For Sale',
   'Beautiful 3-bed, 3-bath house on 1/4 acre in Runda Evergreen. BQ, large garden, double garage, solar water heater, and borehole. Move-in ready. Title deed ready.',
   'Runda, Nairobi', 'Nairobi', 'KSh 42,000,000',
   '+254 733 200 002', ARRAY['3 Bedrooms','House','Sale','Runda','Garden'],
   v_seed, true, true, 0, 0, now() - interval '20 days'),

  ('f0000006-0000-0000-0000-000000000003', 'realestate',
   'Commercial Office Space — CBD', 'For Rent',
   'Open-plan office space, 1,200 sq ft on 4th floor of Harambee Plaza. Fibre internet, air conditioning, two boardrooms shared, parking space. Suitable for up to 20 staff.',
   'Nairobi CBD, Nairobi', 'Nairobi', 'KSh 120,000/mo',
   '+254 733 200 003', ARRAY['Commercial','Office','CBD','Fibre','Parking'],
   v_seed, true, true, 0, 0, now() - interval '7 days'),

  ('f0000006-0000-0000-0000-000000000004', 'realestate',
   '1-Acre Plot — Athi River', 'Land For Sale',
   '1 acre of land along Mombasa Road, Athi River. Fully fenced, level ground, close to EPZA and main road. Clean title. Ideal for warehouse, residential estate, or school.',
   'Athi River, Machakos', 'Machakos', 'KSh 8,500,000',
   '+254 733 200 004', ARRAY['Land','1 Acre','Athi River','Commercial','Residential'],
   v_seed, false, true, 0, 0, now() - interval '30 days'),

  ('f0000006-0000-0000-0000-000000000005', 'realestate',
   'Bedsitter — Zimmerman', 'For Rent',
   'Self-contained bedsitter in a quiet 3-floor block. Tiled floors, steel door, CCTV. Water 24/7 and electricity included. Close to Roysambu stage. Suitable for single professional.',
   'Zimmerman, Nairobi', 'Nairobi', 'KSh 8,500/mo',
   '+254 733 200 005', ARRAY['Bedsitter','Studio','Affordable','Self-Contained'],
   v_seed, false, true, 0, 0, now() - interval '2 days'),

  ('f0000006-0000-0000-0000-000000000006', 'realestate',
   'Airbnb — Diani Beach Cottage', 'Short-Term / Vacation',
   '2-bed beach cottage 100m from Diani Beach. Private pool, fully furnished, Netflix, high-speed Wi-Fi. Breakfast included. Minimum 3-night stay. Pet friendly.',
   'Diani Beach, Kwale', 'Kwale', 'KSh 12,000/night',
   '+254 733 200 006', ARRAY['Airbnb','Diani','Beach','Vacation','Pool'],
   v_seed, true, true, 4.9, 63, now() - interval '90 days')

on conflict (id) do nothing;

end;
$$;

-- ---------------------------------------------------------------------------
-- Force search_vector computation on all seeded listings
-- ---------------------------------------------------------------------------
update public.listings
set search_vector = public.listings_search_vector(title, subtitle, description, location, tags)
where search_vector is null;

-- Force badge computation on seeded listings
update public.listings
set badge = public.compute_listing_badge(rating, review_count, verified, created_at)
where true;
