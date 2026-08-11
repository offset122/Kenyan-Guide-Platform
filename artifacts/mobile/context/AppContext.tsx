import { supabase } from "@/lib/supabase";
import createContextHook from "@nkzw/create-context-hook";
import React, { useCallback, useEffect, useState } from "react";

export type AccountType = "customer" | "provider" | "business" | "employer" | "agent";

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountType: AccountType;
  bio?: string;
  location?: string;
  avatarUrl?: string;
  createdAt: string;
};

export type Review = {
  id: string;
  listingId: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type Listing = {
  id: string;
  categoryId: string;
  title: string;
  subtitle: string;
  description: string;
  location: string;
  county?: string | null;
  constituency?: string | null;
  areaCode?: string | null;
  keywords?: string[] | null;
  serviceType?: string | null;
  onSite?: boolean | null;
  charges?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  foodCategory?: string | null;
  delivery?: boolean | null;
  priceRange?: string | null;
  facilityType?: string | null;
  available247?: boolean | null;
  propertyType?: string | null;
  listingFor?: string | null;
  vehicleType?: string | null;
  condition?: string | null;
  jobType?: string | null;
  employmentType?: string | null;
  salary?: string | null;
  education?: string | null;
  experience?: string | null;
  profilePhoto?: string | null;
  cvUrl?: string | null;
  eventCategory?: string | null;
  eventDate?: string | null;
  eventTime?: string | null;
  venue?: string | null;
  ticketPrice?: string | null;
  price?: string;
  phone: string;
  tags: string[];
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  available: boolean;
  createdAt: string;
  badge?: string;
  photos?: string[];
};

const SEED_LISTINGS: Listing[] = [
  {
    id: "seed_p1", categoryId: "providers", title: "James Mwangi", subtitle: "Master Plumber",
    location: "Westlands, Nairobi", rating: 4.9, reviewCount: 284, price: "KSh 2,500/hr",
    phone: "+254 712 345 678", verified: true, badge: "Top Rated",
    tags: ["Plumbing", "Pipe Repair", "Drainage"],
    description: "Professional plumber with 12 years experience. Specializes in residential and commercial plumbing, pipe installations, and emergency repairs.",
    available: true, userId: "seed", userName: "James Mwangi",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "seed_p2", categoryId: "providers", title: "Grace Wanjiku", subtitle: "Certified Electrician",
    location: "Kilimani, Nairobi", rating: 4.8, reviewCount: 192, price: "KSh 3,000/hr",
    phone: "+254 723 456 789", verified: true, badge: "Verified Pro",
    tags: ["Electrical", "Wiring", "Solar"],
    description: "Certified electrician offering residential wiring, solar installations, and electrical fault diagnosis. Available for emergency callouts.",
    available: true, userId: "seed", userName: "Grace Wanjiku",
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: "seed_p3", categoryId: "providers", title: "David Kamau", subtitle: "Carpenter & Furniture",
    location: "Industrial Area, Nairobi", rating: 4.7, reviewCount: 156, price: "KSh 2,000/hr",
    phone: "+254 734 567 890", verified: true, badge: "Verified Pro",
    tags: ["Carpentry", "Furniture", "Renovation"],
    description: "Skilled carpenter specialising in custom furniture, kitchen cabinets, wardrobes, and home renovation. Quality craftsmanship guaranteed.",
    available: true, userId: "seed", userName: "David Kamau",
    createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
  {
    id: "seed_p4", categoryId: "providers", title: "Mary Njeri", subtitle: "Professional House Cleaner",
    location: "South C, Nairobi", rating: 4.6, reviewCount: 203, price: "KSh 1,500/visit",
    phone: "+254 745 678 901", verified: false, badge: "Popular",
    tags: ["Cleaning", "Laundry", "Ironing"],
    description: "Thorough and reliable house cleaner. Services include deep cleaning, laundry, ironing, and regular maintenance cleaning. References available.",
    available: true, userId: "seed", userName: "Mary Njeri",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "seed_p5", categoryId: "providers", title: "Peter Otieno", subtitle: "Auto Mechanic",
    location: "Eastleigh, Nairobi", rating: 4.8, reviewCount: 317, price: "KSh 500–5,000",
    phone: "+254 756 789 012", verified: true, badge: "Top Rated",
    tags: ["Auto Repair", "Engine", "Tyres"],
    description: "Experienced mechanic for all vehicle makes and models. Engine diagnostics, brake repairs, tyre services, and general servicing. Mobile callouts available.",
    available: true, userId: "seed", userName: "Peter Otieno",
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: "seed_p6", categoryId: "providers", title: "Susan Njoroge", subtitle: "Private Home Tutor",
    location: "Karen, Nairobi", rating: 4.9, reviewCount: 88, price: "KSh 1,200/hr",
    phone: "+254 767 890 123", verified: true, badge: "Top Rated",
    tags: ["Tutoring", "KCSE", "Mathematics"],
    description: "Experienced private tutor for primary and secondary students. Specialises in Maths, Physics, and Chemistry. KCSE exam preparation available.",
    available: true, userId: "seed", userName: "Susan Njoroge",
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: "seed_s1", categoryId: "services", title: "Prime Surveying Co.", subtitle: "Land Surveying & Beacons",
    location: "Kilimani, Nairobi", county: "Nairobi", constituency: "Westlands", areaCode: "Kilimani",
    keywords: ["Surveying", "Land Survey", "Beacons", "Title Deeds", "GIS Mapping"],
    serviceType: "Land Surveying", onSite: true, charges: "From KSh 15,000", whatsapp: "+254 712 345 678", email: "info@primesurvey.co.ke", logoUrl: "",
    rating: 4.8, reviewCount: 67, price: "From KSh 15,000",
    phone: "+254 712 345 678", verified: true, badge: "Verified Pro",
    tags: ["Surveying", "Land", "Beacons", "Title Deeds"],
    description: "Professional land surveying services with over 10 years experience. Specialising in boundary surveys, topographic surveys, and beacon installation. Title deed verification and company registration support available.",
    available: true, userId: "seed", userName: "Prime Surveying",
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
  },
  {
    id: "seed_s2", categoryId: "services", title: "Elite Cleaning Services", subtitle: "Commercial & Residential Cleaning",
    location: "Westlands, Nairobi", county: "Nairobi", constituency: "Westlands", areaCode: "Westlands",
    keywords: ["Office Cleaning", "Deep Cleaning", "Carpet Cleaning", "House Cleaning"],
    serviceType: "Cleaning Services", onSite: true, charges: "From KSh 3,000", whatsapp: "+254 723 456 789", email: "hello@eliteclean.co.ke", logoUrl: "",
    rating: 4.7, reviewCount: 143, price: "From KSh 3,000",
    phone: "+254 723 456 789", verified: true, badge: "Popular",
    tags: ["Cleaning", "Office", "Commercial", "Residential"],
    description: "Reliable cleaning company serving offices, homes, and commercial spaces. Deep cleaning, carpet cleaning, and post-construction cleanup. Trained staff and eco-friendly products.",
    available: true, userId: "seed", userName: "Elite Cleaning",
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: "seed_s3", categoryId: "services", title: "TechPrint Solutions", subtitle: "Printing & Design Studio",
    location: "Upper Hill, Nairobi", county: "Nairobi", constituency: "Karura", areaCode: "Upper Hill",
    keywords: ["Printing", "Design", "Branding", "Flyers", "Business Cards"],
    serviceType: "Printing & Design", onSite: false, charges: "From KSh 500", whatsapp: "+254 734 567 890", email: "print@techprint.co.ke", logoUrl: "",
    rating: 4.6, reviewCount: 89, price: "From KSh 500",
    phone: "+254 734 567 890", verified: true, badge: "Verified Pro",
    tags: ["Printing", "Design", "Branding", "Marketing"],
    description: "Full-service printing and design studio. Business cards, flyers, banners, branded merchandise, and digital design. Fast turnaround and quality guaranteed.",
    available: true, userId: "seed", userName: "TechPrint",
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: "seed_s4", categoryId: "services", title: "FixIt Electrical & Plumbing", subtitle: "Repair & Installation Centre",
    location: "Eastleigh, Nairobi", county: "Nairobi", constituency: "Embakasi Central", areaCode: "Eastleigh",
    keywords: ["Electrical Repair", "Plumbing", "AC Repair", "Maintenance"],
    serviceType: "Repair Services", onSite: true, charges: "Negotiable", whatsapp: "+254 745 678 901", email: "", logoUrl: "",
    rating: 4.5, reviewCount: 211, price: "Negotiable",
    phone: "+254 745 678 901", verified: false, badge: "Popular",
    tags: ["Electrical", "Plumbing", "Repair", "Maintenance"],
    description: "Trusted electrical and plumbing repair centre. Wiring, pipe repair, AC servicing, and general maintenance. Emergency callouts available across Nairobi.",
    available: true, userId: "seed", userName: "FixIt Centre",
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: "seed_s5", categoryId: "services", title: "BrightMinds Consultancy", subtitle: "Business & Marketing Consultancy",
    location: "Kilimani, Nairobi", county: "Nairobi", constituency: "Westlands", areaCode: "Kilimani",
    keywords: ["Business Consultancy", "Marketing Strategy", "Brand Strategy", "SEO"],
    serviceType: "Consultancy", onSite: false, charges: "From KSh 8,000", whatsapp: "+254 756 789 012", email: "hello@brightminds.co.ke", logoUrl: "",
    rating: 4.9, reviewCount: 34, price: "From KSh 8,000",
    phone: "+254 756 789 012", verified: true, badge: "Top Rated",
    tags: ["Consulting", "Marketing", "Business", "Strategy"],
    description: "Strategic business and marketing consultancy helping SMEs grow. Services include brand strategy, digital marketing, SEO, and business plan development.",
    available: true, userId: "seed", userName: "BrightMinds",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "seed_b2", categoryId: "emergency", title: "Kenyatta National Hospital", subtitle: "Public Referral Hospital",
    location: "Hospital Road, Nairobi", rating: 4.3, reviewCount: 2341, phone: "+254 20 272 6300",
    verified: true, badge: "Official", tags: ["Hospital", "Emergency", "Outpatient"],
    description: "Kenya's largest public referral hospital offering comprehensive medical services including emergency care, surgery, maternity, and specialist clinics.",
    available: true, userId: "seed", userName: "KNH",
    createdAt: new Date(Date.now() - 180 * 86400000).toISOString(),
  },
  {
    id: "seed_b3", categoryId: "food", title: "Java House Nairobi", subtitle: "Coffee & Restaurant",
    location: "Westlands, Nairobi", rating: 4.6, reviewCount: 1205, phone: "+254 20 765 4321",
    verified: true, badge: "Popular", tags: ["Coffee", "Breakfast", "Wi-Fi"],
    description: "Kenya's beloved coffee house chain. Great coffee, fresh food, and fast Wi-Fi. Perfect for meetings or a relaxed meal. Open daily 6am–10pm.",
    available: true, userId: "seed", userName: "Java House",
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: "seed_e1", categoryId: "emergency", title: "AAR Ambulance Services", subtitle: "Emergency Medical",
    location: "All Nairobi Areas", rating: 4.9, reviewCount: 1204, price: "Emergency",
    phone: "+254 20 717 1000", verified: true, badge: "24/7",
    tags: ["Ambulance", "ICU", "First Aid"],
    description: "Kenya's leading emergency ambulance service with fully equipped ICU ambulances and trained paramedics. Available 24/7 across Nairobi.",
    available: true, userId: "seed", userName: "AAR Healthcare",
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: "seed_e2", categoryId: "emergency", title: "National Police Service", subtitle: "Police Emergency Line",
    location: "Nationwide", rating: 4.5, reviewCount: 892, phone: "999",
    verified: true, badge: "Official", tags: ["Police", "Emergency", "Security"],
    description: "National emergency police number. Available 24/7 for crimes, accidents, and security emergencies across Kenya.",
    available: true, userId: "seed", userName: "National Police",
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: "seed_e3", categoryId: "emergency", title: "Kenya Red Cross", subtitle: "Disaster & Humanitarian Response",
    location: "Nairobi & Nationwide", rating: 4.8, reviewCount: 543, phone: "+254 20 395 0000",
    verified: true, badge: "Official", tags: ["Relief", "Blood Bank", "Disaster"],
    description: "Providing emergency relief, blood bank services, and humanitarian assistance across Kenya. Call for disaster response and blood donation.",
    available: true, userId: "seed", userName: "Kenya Red Cross",
    createdAt: new Date(Date.now() - 100 * 86400000).toISOString(),
  },
  {
    id: "seed_e4", categoryId: "emergency", title: "Kenya Fire Brigade", subtitle: "Fire & Rescue",
    location: "Nairobi County", rating: 4.7, reviewCount: 321, phone: "999",
    verified: true, badge: "24/7", tags: ["Fire", "Rescue", "Hazmat"],
    description: "Nairobi City County Fire Department. Responds to fires, chemical spills, and rescue emergencies. Call 999 or 112 for emergencies.",
    available: true, userId: "seed", userName: "Nairobi Fire Brigade",
    createdAt: new Date(Date.now() - 75 * 86400000).toISOString(),
  },
  {
    id: "seed_j1", categoryId: "jobs", title: "Software Engineer", subtitle: "Andela Kenya",
    location: "Nairobi (Remote)", rating: 4.7, reviewCount: 42, price: "KSh 150,000–280,000/mo",
    phone: "+254 700 111 222", verified: true, badge: "Hot",
    tags: ["React", "Node.js", "TypeScript"],
    description: "Join Andela as a Senior Software Engineer. Work on cutting-edge projects for global clients. Remote-first culture with competitive pay.",
    available: true, userId: "seed", userName: "Andela Kenya",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "seed_j2", categoryId: "jobs", title: "Accountant CPA", subtitle: "Deloitte Kenya",
    location: "Upper Hill, Nairobi", rating: 4.6, reviewCount: 23, price: "KSh 80,000–120,000/mo",
    phone: "+254 20 423 0000", verified: true, badge: "Urgent",
    tags: ["Accounting", "CPA", "Audit"],
    description: "Deloitte Kenya is hiring a qualified CPA accountant for financial audit and advisory services. Min 3 years experience required.",
    available: true, userId: "seed", userName: "Deloitte Kenya",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "seed_j3", categoryId: "jobs", title: "Graphic Designer", subtitle: "Safaricom PLC",
    location: "Nairobi HQ", rating: 4.8, reviewCount: 17, price: "KSh 60,000–90,000/mo",
    phone: "+254 722 000 000", verified: true, badge: "Hot",
    tags: ["Design", "Adobe", "Branding"],
    description: "Safaricom seeks a creative Graphic Designer for brand assets, digital campaigns, and marketing materials. Strong portfolio required.",
    available: true, userId: "seed", userName: "Safaricom PLC",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "seed_j4", categoryId: "jobs", title: "Matatu Driver", subtitle: "City Hoppa Ltd",
    location: "Nairobi CBD", rating: 4.4, reviewCount: 31, price: "KSh 35,000–50,000/mo",
    phone: "+254 711 234 567", verified: false, badge: "New",
    tags: ["Driving", "PSV", "License"],
    description: "City Hoppa is hiring experienced matatu drivers with valid PSV licence. Must have clean driving record. Salary plus commissions.",
    available: true, userId: "seed", userName: "City Hoppa Ltd",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "seed_pr1", categoryId: "products", title: "Samsung Galaxy S24", subtitle: "Brand New · Sealed Box",
    location: "CBD, Nairobi", rating: 4.8, reviewCount: 34, price: "KSh 78,000",
    phone: "+254 756 789 012", verified: true, badge: "New",
    tags: ["Phone", "Samsung", "Electronics"],
    description: "Brand new Samsung Galaxy S24. 256GB storage, 8GB RAM. Original box with all accessories. One year warranty included.",
    available: true, userId: "seed", userName: "TechMart Kenya",
    photos: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80"],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "seed_pr2", categoryId: "products", title: "HP Laptop 15.6\"", subtitle: "Core i5 · 8GB RAM · 512GB SSD",
    location: "Moi Avenue, Nairobi", rating: 4.6, reviewCount: 19, price: "KSh 55,000",
    phone: "+254 767 890 123", verified: true, badge: "Featured",
    tags: ["Laptop", "HP", "Windows 11"],
    description: "HP Laptop 15s-fq5000. Intel Core i5-1235U, 8GB DDR4, 512GB NVMe SSD, Windows 11 Home. Ideal for work and school. Warranty included.",
    available: true, userId: "seed", userName: "Digital World Kenya",
    photos: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80", "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=80"],
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: "seed_pr3", categoryId: "products", title: "Leather Sofa Set (3+2+1)", subtitle: "Italian Leather · Like New",
    location: "Lavington, Nairobi", rating: 4.7, reviewCount: 9, price: "KSh 65,000",
    phone: "+254 778 901 234", verified: false, badge: "Popular",
    tags: ["Furniture", "Sofa", "Living Room"],
    description: "High quality Italian leather sofa set in excellent condition. 3-seater, 2-seater, and 1 armchair. Selling due to relocation. Negotiable.",
    available: true, userId: "seed", userName: "Susan Kamau",
    photos: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80", "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&q=80"],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "seed_pr4", categoryId: "products", title: "Toyota Vitz 2018", subtitle: "1300cc · Accident Free",
    location: "Westlands, Nairobi", rating: 4.9, reviewCount: 6, price: "KSh 1,200,000",
    phone: "+254 789 012 345", verified: true, badge: "Top Rated",
    tags: ["Car", "Toyota", "Automatic"],
    description: "Toyota Vitz 2018, 1300cc, automatic transmission. Low mileage, accident-free, full service history. Comprehensive insurance. Test drives welcome.",
    available: true, userId: "seed", userName: "AutoMart Kenya",
    photos: ["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80", "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&q=80"],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "seed_r1", categoryId: "realestate", title: "3BR Apartment – Kileleshwa", subtitle: "For Rent",
    location: "Kileleshwa, Nairobi", rating: 4.8, reviewCount: 12, price: "KSh 85,000/mo",
    phone: "+254 789 012 345", verified: true, badge: "Featured",
    tags: ["3 Bedrooms", "Swimming Pool", "Secure"],
    description: "Spacious 3-bedroom apartment in a prime secure estate. Ensuite master bedroom, modern kitchen, parking, pool, and 24hr security.",
    available: true, userId: "seed", userName: "Prime Properties",
    photos: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80", "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80"],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "seed_r2", categoryId: "realestate", title: "1BR Bedsitter – Kahawa West", subtitle: "For Rent · Student-Friendly",
    location: "Kahawa West, Nairobi", rating: 4.5, reviewCount: 28, price: "KSh 12,000/mo",
    phone: "+254 711 345 678", verified: false, badge: "Popular",
    tags: ["1 Bedroom", "Water Included", "Wi-Fi"],
    description: "Clean and spacious bedsitter near JKUAT. Water and Wi-Fi included. Ground floor, tiled, fitted kitchen. Walking distance to matatu stage.",
    available: true, userId: "seed", userName: "Wanjiku Agencies",
    photos: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80"],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "seed_r3", categoryId: "realestate", title: "4BR House for Sale – Runda", subtitle: "For Sale · Gated Community",
    location: "Runda, Nairobi", rating: 4.9, reviewCount: 5, price: "KSh 32M",
    phone: "+254 722 456 789", verified: true, badge: "Premium",
    tags: ["4 Bedrooms", "Garden", "Gated"],
    description: "Stunning 4-bedroom all-ensuite home in Runda. Spacious garden, 2-car garage, DSQ, borehole, solar water heater. Prime location near Runda Mall.",
    available: true, userId: "seed", userName: "Kenya Sotheby's",
    photos: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80"],
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "seed_r4", categoryId: "realestate", title: "0.5 Acre Plot – Ruiru", subtitle: "For Sale · Title Deed Ready",
    location: "Ruiru, Kiambu", rating: 4.7, reviewCount: 15, price: "KSh 4,500,000",
    phone: "+254 733 567 890", verified: true, badge: "Hot",
    tags: ["Plot", "Title Deed", "Near Bypass"],
    description: "Half-acre residential plot off the Eastern Bypass near Ruiru. Clean title deed ready. All utilities (water, electricity) available. Ideal for investment.",
    available: true, userId: "seed", userName: "Land Solutions Kenya",
    photos: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80"],
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
];

function mapListingFromSupabase(row: any): Listing {
  const photos = Array.isArray(row.listing_images)
    ? row.listing_images
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((img: any) => img.url)
    : undefined;
  return {
    id: row.id,
    categoryId: row.category_id,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    location: row.location,
    county: row.county,
    constituency: row.constituency,
    areaCode: row.area_code,
    keywords: row.keywords,
    serviceType: row.service_type,
    onSite: row.on_site,
    charges: row.charges,
    whatsapp: row.whatsapp,
    email: row.email,
    logoUrl: row.logo_url,
    foodCategory: row.food_category,
    delivery: row.delivery,
    priceRange: row.price_range,
    facilityType: row.facility_type,
    available247: row.available_247,
    propertyType: row.property_type,
    listingFor: row.listing_for,
    vehicleType: row.vehicle_type,
    condition: row.condition,
    jobType: row.job_type,
    employmentType: row.employment_type,
    salary: row.salary,
    education: row.education,
    experience: row.experience,
    profilePhoto: row.profile_photo,
    cvUrl: row.cv_url,
    eventCategory: row.event_category,
    eventDate: row.event_date,
    eventTime: row.event_time,
    venue: row.venue,
    ticketPrice: row.ticket_price,
    price: row.price,
    phone: row.phone,
    tags: row.tags ?? [],
    userId: row.user_id,
    userName: row.profiles?.name ?? "",
    userAvatarUrl: row.profiles?.avatar_url,
    verified: row.verified ?? false,
    rating: Number(row.rating) ?? 0,
    reviewCount: row.review_count ?? 0,
    available: row.available ?? true,
    createdAt: row.created_at,
    badge: row.badge,
    photos,
  };
}

function mapReviewFromSupabase(row: any): Review {
  return {
    id: row.id,
    listingId: row.listing_id,
    userId: row.user_id,
    userName: row.profiles?.name ?? "",
    userAvatarUrl: row.profiles?.avatar_url,
    rating: row.rating,
    comment: row.comment ?? "",
    createdAt: row.created_at,
  };
}

function mapProfileFromSupabase(row: any): User {
  return {
    id: row.id,
    name: row.name ?? "",
    email: "",
    phone: row.phone ?? "",
    accountType: row.account_type ?? "customer",
    bio: row.bio,
    location: row.location,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
  };
}

const [AppContextProvider, useAppContext] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (authUser) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authUser.id)
            .single();

          if (profile) {
            const mappedProfile = mapProfileFromSupabase(profile);
            setUser({ ...mappedProfile, email: authUser.email ?? "" });
          }

          const { data: savedData } = await supabase
            .from("saved_listings")
            .select("listing_id")
            .eq("user_id", authUser.id);

          if (savedData) {
            setSavedIds(savedData.map((s: any) => s.listing_id));
          }
        }

        const { data: listingsData, error: listingsError } = await supabase
          .from("listings")
          .select("*, profiles!listings_user_id_fkey(*), listing_images(url, sort_order)")
          .order("created_at", { ascending: false });

        if (listingsError) {
          console.warn("Failed to fetch listings:", listingsError);
          setListings(SEED_LISTINGS);
        } else if (listingsData && listingsData.length > 0) {
          setListings(listingsData.map(mapListingFromSupabase));
        } else {
          setListings(SEED_LISTINGS);
        }

        const { data: reviewsData, error: reviewsError } = await supabase
          .from("reviews")
          .select("*, profiles!reviews_user_id_fkey(*)");

        if (reviewsError) {
          console.warn("Failed to fetch reviews:", reviewsError);
        } else if (reviewsData) {
          setReviews(reviewsData.map(mapReviewFromSupabase));
        }
      } catch (e) {
        console.warn("Load error", e);
        setListings(SEED_LISTINGS);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const register = useCallback(async (data: Omit<User, "id" | "createdAt"> & { password: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            phone: data.phone,
            account_type: data.accountType,
          },
        },
      });

      if (signUpError) return { success: false, error: signUpError.message };
      if (!signUpData.user) return { success: false, error: "Registration failed" };

      const updates: Partial<{ bio: string; location: string }> = {};
      if (data.bio) updates.bio = data.bio;
      if (data.location) updates.location = data.location;

      if (Object.keys(updates).length > 0 && signUpData.user.id) {
        await supabase
          .from("profiles")
          .update(updates)
          .eq("id", signUpData.user.id);
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (!signInError && signInData.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", signInData.user.id)
          .single();

        const mappedProfile = profile ? mapProfileFromSupabase(profile) : {
          id: signInData.user.id,
          name: signInData.user.user_metadata?.name ?? data.name,
          email: signInData.user.email ?? "",
          phone: data.phone,
          accountType: data.accountType,
          bio: data.bio,
          location: data.location,
          createdAt: new Date().toISOString(),
        };

        setUser({ ...mappedProfile, email: signInData.user.email ?? "" });
      }

      return { success: true };
    } catch (e: any) {
      console.warn("Register error:", e);
      return { success: false, error: e.message ?? "Registration failed" };
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) return { success: false, error: signInError.message };
      if (!signInData.user) return { success: false, error: "Login failed" };

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", signInData.user.id)
        .single();

      const mappedProfile = profile ? mapProfileFromSupabase(profile) : {
        id: signInData.user.id,
        name: signInData.user.user_metadata?.name ?? "",
        email: signInData.user.email ?? "",
        phone: "",
        accountType: "customer" as AccountType,
        createdAt: new Date().toISOString(),
      };

      setUser({ ...mappedProfile, email: signInData.user.email ?? "" });

      return { success: true };
    } catch (e: any) {
      console.warn("Login error:", e);
      return { success: false, error: e.message ?? "Login failed" };
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSavedIds([]);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Omit<User, "id" | "createdAt">>) => {
    if (!user) return;

    const profileUpdates: Record<string, any> = {};
    if (updates.name !== undefined) profileUpdates.name = updates.name;
    if (updates.phone !== undefined) profileUpdates.phone = updates.phone;
    if (updates.accountType !== undefined) profileUpdates.account_type = updates.accountType;
    if (updates.bio !== undefined) profileUpdates.bio = updates.bio;
    if (updates.location !== undefined) profileUpdates.location = updates.location;
    if (updates.avatarUrl !== undefined) profileUpdates.avatar_url = updates.avatarUrl;

    try {
      await supabase
        .from("profiles")
        .update(profileUpdates)
        .eq("id", user.id);

      setUser((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (e: any) {
      console.warn("Update profile error:", e);
    }
  }, [user]);

  const addListing = useCallback(async (data: Omit<Listing, "id" | "userId" | "userName" | "userAvatarUrl" | "verified" | "rating" | "reviewCount" | "createdAt">): Promise<Listing> => {
    if (!user) throw new Error("Not logged in");

    const { data: inserted, error } = await supabase
      .from("listings")
      .insert({
        category_id: data.categoryId,
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        location: data.location,
        county: data.county,
        constituency: data.constituency,
        area_code: data.areaCode,
        keywords: data.keywords,
        service_type: data.serviceType,
        on_site: data.onSite,
        charges: data.charges,
        whatsapp: data.whatsapp,
        email: data.email,
        logo_url: data.logoUrl,
        food_category: data.foodCategory,
        delivery: data.delivery,
        price_range: data.priceRange,
        facility_type: data.facilityType,
        available_247: data.available247,
        property_type: data.propertyType,
        listing_for: data.listingFor,
        vehicle_type: data.vehicleType,
        condition: data.condition,
        job_type: data.jobType,
        employment_type: data.employmentType,
        salary: data.salary,
        education: data.education,
        experience: data.experience,
        profile_photo: data.profilePhoto,
        cv_url: data.cvUrl,
        event_category: data.eventCategory,
        event_date: data.eventDate,
        event_time: data.eventTime,
        venue: data.venue,
        ticket_price: data.ticketPrice,
        price: data.price,
        phone: data.phone,
        tags: data.tags,
        user_id: user.id,
        available: data.available ?? true,
      })
      .select("*, profiles!listings_user_id_fkey(*)")
      .single();

    if (error) throw error;

    if (data.photos && data.photos.length > 0) {
      await supabase.from("listing_images").insert(
        data.photos.map((url, i) => ({ listing_id: inserted.id, url, sort_order: i }))
      );
    }

    const listing = mapListingFromSupabase({
      ...inserted,
      listing_images: (data.photos ?? []).map((url, i) => ({ url, sort_order: i })),
    });
    setListings((prev) => [listing, ...prev]);
    return listing;
  }, [user]);

  const updateListing = useCallback(async (id: string, updates: Partial<Pick<Listing, "title" | "subtitle" | "description" | "location" | "county" | "constituency" | "areaCode" | "keywords" | "serviceType" | "onSite" | "charges" | "whatsapp" | "email" | "logoUrl" | "foodCategory" | "delivery" | "priceRange" | "facilityType" | "available247" | "propertyType" | "listingFor" | "vehicleType" | "condition" | "jobType" | "employmentType" | "salary" | "education" | "experience" | "profilePhoto" | "cvUrl" | "eventCategory" | "eventDate" | "eventTime" | "venue" | "ticketPrice" | "price" | "phone" | "tags" | "available" | "photos">>) => {
    const dbUpdates: Record<string, any> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.subtitle !== undefined) dbUpdates.subtitle = updates.subtitle;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.county !== undefined) dbUpdates.county = updates.county;
    if (updates.constituency !== undefined) dbUpdates.constituency = updates.constituency;
    if (updates.areaCode !== undefined) dbUpdates.area_code = updates.areaCode;
    if (updates.keywords !== undefined) dbUpdates.keywords = updates.keywords;
    if (updates.serviceType !== undefined) dbUpdates.service_type = updates.serviceType;
    if (updates.onSite !== undefined) dbUpdates.on_site = updates.onSite;
    if (updates.charges !== undefined) dbUpdates.charges = updates.charges;
    if (updates.whatsapp !== undefined) dbUpdates.whatsapp = updates.whatsapp;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.logoUrl !== undefined) dbUpdates.logo_url = updates.logoUrl;
    if (updates.foodCategory !== undefined) dbUpdates.food_category = updates.foodCategory;
    if (updates.delivery !== undefined) dbUpdates.delivery = updates.delivery;
    if (updates.priceRange !== undefined) dbUpdates.price_range = updates.priceRange;
    if (updates.facilityType !== undefined) dbUpdates.facility_type = updates.facilityType;
    if (updates.available247 !== undefined) dbUpdates.available_247 = updates.available247;
    if (updates.propertyType !== undefined) dbUpdates.property_type = updates.propertyType;
    if (updates.listingFor !== undefined) dbUpdates.listing_for = updates.listingFor;
    if (updates.vehicleType !== undefined) dbUpdates.vehicle_type = updates.vehicleType;
    if (updates.condition !== undefined) dbUpdates.condition = updates.condition;
    if (updates.jobType !== undefined) dbUpdates.job_type = updates.jobType;
    if (updates.employmentType !== undefined) dbUpdates.employment_type = updates.employmentType;
    if (updates.salary !== undefined) dbUpdates.salary = updates.salary;
    if (updates.education !== undefined) dbUpdates.education = updates.education;
    if (updates.experience !== undefined) dbUpdates.experience = updates.experience;
    if (updates.profilePhoto !== undefined) dbUpdates.profile_photo = updates.profilePhoto;
    if (updates.cvUrl !== undefined) dbUpdates.cv_url = updates.cvUrl;
    if (updates.eventCategory !== undefined) dbUpdates.event_category = updates.eventCategory;
    if (updates.eventDate !== undefined) dbUpdates.event_date = updates.eventDate;
    if (updates.eventTime !== undefined) dbUpdates.event_time = updates.eventTime;
    if (updates.venue !== undefined) dbUpdates.venue = updates.venue;
    if (updates.ticketPrice !== undefined) dbUpdates.ticket_price = updates.ticketPrice;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.available !== undefined) dbUpdates.available = updates.available;
    if (updates.photos !== undefined) dbUpdates.photos = updates.photos;

    const { data, error } = await supabase
      .from("listings")
      .update(dbUpdates)
      .eq("id", id)
      .eq("user_id", user?.id)
      .select("*, profiles!listings_user_id_fkey(*), listing_images(url, sort_order)")
      .single();

    if (error) throw error;

    const listing = mapListingFromSupabase(data);
    setListings((prev) => prev.map((l) => (l.id === id ? listing : l)));
  }, [user]);

  const addReview = useCallback(async (listingId: string, rating: number, comment: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Not logged in" };

    try {
      const { error } = await supabase
        .from("reviews")
        .insert({
          listing_id: listingId,
          user_id: user.id,
          rating,
          comment: comment.trim(),
        });

      if (error) return { success: false, error: error.message };

      return { success: true };
    } catch (e: any) {
      console.warn("Add review error:", e);
      return { success: false, error: e.message ?? "Failed to add review" };
    }
  }, [user]);

  const deleteListing = useCallback(async (id: string) => {
    try {
      await supabase.from("listings").delete().eq("id", id).eq("user_id", user?.id);
      await supabase.from("saved_listings").delete().eq("listing_id", id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      setSavedIds((prev) => prev.filter((s) => s !== id));
    } catch (e: any) {
      console.warn("Delete listing error:", e);
    }
  }, [user]);

  const toggleAvailability = useCallback(async (id: string) => {
    const listing = listings.find((l) => l.id === id);
    if (!listing) return;

    try {
      const { data, error } = await supabase
        .from("listings")
        .update({ available: !listing.available })
        .eq("id", id)
        .select("*, profiles!listings_user_id_fkey(*), listing_images(url, sort_order)")
        .single();

      if (error) throw error;

      const updated = mapListingFromSupabase(data);
      setListings((prev) => prev.map((l) => (l.id === id ? updated : l)));
    } catch (e: any) {
      console.warn("Toggle availability error:", e);
    }
  }, [listings]);

  const toggleSaved = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const exists = savedIds.includes(id);

      if (exists) {
        await supabase
          .from("saved_listings")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", id);
        setSavedIds((prev) => prev.filter((s) => s !== id));
      } else {
        await supabase
          .from("saved_listings")
          .insert({ user_id: user.id, listing_id: id });
        setSavedIds((prev) => [...prev, id]);
      }
    } catch (e: any) {
      console.warn("Toggle saved error:", e);
    }
  }, [user, savedIds]);

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);
  const getListingsByCategory = useCallback((categoryId: string) => listings.filter((l) => l.categoryId === categoryId), [listings]);
  const getMyListings = useCallback(() => (user ? listings.filter((l) => l.userId === user.id) : []), [user, listings]);
  const getSavedListings = useCallback(() => listings.filter((l) => savedIds.includes(l.id)), [listings, savedIds]);
  const getReviews = useCallback((listingId: string) => reviews.filter((r) => r.listingId === listingId), [reviews]);
  const hasReviewed = useCallback((listingId: string) => {
    if (!user) return false;
    return reviews.some((r) => r.listingId === listingId && r.userId === user.id);
  }, [user, reviews]);

  return {
    user,
    listings,
    savedIds,
    isLoading,
    register,
    login,
    logout,
    updateProfile,
    addListing,
    deleteListing,
    toggleAvailability,
    toggleSaved,
    isSaved,
    getListingsByCategory,
    getMyListings,
    getSavedListings,
    updateListing,
    addReview,
    getReviews,
    hasReviewed,
  };
});

export { AppContextProvider, useAppContext };