import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import React, { useCallback, useEffect, useState } from "react";

const STORAGE_KEYS = {
  USER: "@mkg:user",
  USERS: "@mkg:users",
  LISTINGS: "@mkg:listings",
  SAVED: "@mkg:saved",
};

export type AccountType = "customer" | "provider" | "business" | "employer" | "agent";

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountType: AccountType;
  bio?: string;
  location?: string;
  createdAt: string;
};

export type Listing = {
  id: string;
  categoryId: string;
  title: string;
  subtitle: string;
  description: string;
  location: string;
  price?: string;
  phone: string;
  tags: string[];
  userId: string;
  userName: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  available: boolean;
  createdAt: string;
  badge?: string;
};

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

const SEED_LISTINGS: Listing[] = [
  // SERVICE PROVIDERS
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
  // BUSINESSES
  {
    id: "seed_b1", categoryId: "businesses", title: "Savannah Legal Associates", subtitle: "Law Firm",
    location: "Upper Hill, Nairobi", rating: 4.8, reviewCount: 87, phone: "+254 20 234 5678",
    verified: true, badge: "Premium", tags: ["Legal", "Corporate", "Property Law"],
    description: "Full-service law firm specializing in corporate law, real estate transactions, employment law, and dispute resolution.",
    available: true, userId: "seed", userName: "Savannah Legal",
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: "seed_b2", categoryId: "businesses", title: "Kenyatta National Hospital", subtitle: "Public Referral Hospital",
    location: "Hospital Road, Nairobi", rating: 4.3, reviewCount: 2341, phone: "+254 20 272 6300",
    verified: true, badge: "Official", tags: ["Hospital", "Emergency", "Outpatient"],
    description: "Kenya's largest public referral hospital offering comprehensive medical services including emergency care, surgery, maternity, and specialist clinics.",
    available: true, userId: "seed", userName: "KNH",
    createdAt: new Date(Date.now() - 180 * 86400000).toISOString(),
  },
  {
    id: "seed_b3", categoryId: "businesses", title: "Java House Nairobi", subtitle: "Coffee & Restaurant",
    location: "Westlands, Nairobi", rating: 4.6, reviewCount: 1205, phone: "+254 20 765 4321",
    verified: true, badge: "Popular", tags: ["Coffee", "Breakfast", "Wi-Fi"],
    description: "Kenya's beloved coffee house chain. Great coffee, fresh food, and fast Wi-Fi. Perfect for meetings or a relaxed meal. Open daily 6am–10pm.",
    available: true, userId: "seed", userName: "Java House",
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  // EMERGENCY
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
  // JOBS
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
  // PRODUCTS
  {
    id: "seed_pr1", categoryId: "products", title: "Samsung Galaxy S24", subtitle: "Brand New · Sealed Box",
    location: "CBD, Nairobi", rating: 4.8, reviewCount: 34, price: "KSh 78,000",
    phone: "+254 756 789 012", verified: true, badge: "New",
    tags: ["Phone", "Samsung", "Electronics"],
    description: "Brand new Samsung Galaxy S24. 256GB storage, 8GB RAM. Original box with all accessories. One year warranty included.",
    available: true, userId: "seed", userName: "TechMart Kenya",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "seed_pr2", categoryId: "products", title: "HP Laptop 15.6\"", subtitle: "Core i5 · 8GB RAM · 512GB SSD",
    location: "Moi Avenue, Nairobi", rating: 4.6, reviewCount: 19, price: "KSh 55,000",
    phone: "+254 767 890 123", verified: true, badge: "Featured",
    tags: ["Laptop", "HP", "Windows 11"],
    description: "HP Laptop 15s-fq5000. Intel Core i5-1235U, 8GB DDR4, 512GB NVMe SSD, Windows 11 Home. Ideal for work and school. Warranty included.",
    available: true, userId: "seed", userName: "Digital World Kenya",
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: "seed_pr3", categoryId: "products", title: "Leather Sofa Set (3+2+1)", subtitle: "Italian Leather · Like New",
    location: "Lavington, Nairobi", rating: 4.7, reviewCount: 9, price: "KSh 65,000",
    phone: "+254 778 901 234", verified: false, badge: "Popular",
    tags: ["Furniture", "Sofa", "Living Room"],
    description: "High quality Italian leather sofa set in excellent condition. 3-seater, 2-seater, and 1 armchair. Selling due to relocation. Negotiable.",
    available: true, userId: "seed", userName: "Susan Kamau",
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "seed_pr4", categoryId: "products", title: "Toyota Vitz 2018", subtitle: "1300cc · Accident Free",
    location: "Westlands, Nairobi", rating: 4.9, reviewCount: 6, price: "KSh 1,200,000",
    phone: "+254 789 012 345", verified: true, badge: "Top Rated",
    tags: ["Car", "Toyota", "Automatic"],
    description: "Toyota Vitz 2018, 1300cc, automatic transmission. Low mileage, accident-free, full service history. Comprehensive insurance. Test drives welcome.",
    available: true, userId: "seed", userName: "AutoMart Kenya",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  // REAL ESTATE
  {
    id: "seed_r1", categoryId: "realestate", title: "3BR Apartment – Kileleshwa", subtitle: "For Rent",
    location: "Kileleshwa, Nairobi", rating: 4.8, reviewCount: 12, price: "KSh 85,000/mo",
    phone: "+254 789 012 345", verified: true, badge: "Featured",
    tags: ["3 Bedrooms", "Swimming Pool", "Secure"],
    description: "Spacious 3-bedroom apartment in a prime secure estate. Ensuite master bedroom, modern kitchen, parking, pool, and 24hr security.",
    available: true, userId: "seed", userName: "Prime Properties",
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "seed_r2", categoryId: "realestate", title: "1BR Bedsitter – Kahawa West", subtitle: "For Rent · Student-Friendly",
    location: "Kahawa West, Nairobi", rating: 4.5, reviewCount: 28, price: "KSh 12,000/mo",
    phone: "+254 711 345 678", verified: false, badge: "Popular",
    tags: ["1 Bedroom", "Water Included", "Wi-Fi"],
    description: "Clean and spacious bedsitter near JKUAT. Water and Wi-Fi included. Ground floor, tiled, fitted kitchen. Walking distance to matatu stage.",
    available: true, userId: "seed", userName: "Wanjiku Agencies",
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "seed_r3", categoryId: "realestate", title: "4BR House for Sale – Runda", subtitle: "For Sale · Gated Community",
    location: "Runda, Nairobi", rating: 4.9, reviewCount: 5, price: "KSh 32M",
    phone: "+254 722 456 789", verified: true, badge: "Premium",
    tags: ["4 Bedrooms", "Garden", "Gated"],
    description: "Stunning 4-bedroom all-ensuite home in Runda. Spacious garden, 2-car garage, DSQ, borehole, solar water heater. Prime location near Runda Mall.",
    available: true, userId: "seed", userName: "Kenya Sotheby's",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "seed_r4", categoryId: "realestate", title: "0.5 Acre Plot – Ruiru", subtitle: "For Sale · Title Deed Ready",
    location: "Ruiru, Kiambu", rating: 4.7, reviewCount: 15, price: "KSh 4,500,000",
    phone: "+254 733 567 890", verified: true, badge: "Hot",
    tags: ["Plot", "Title Deed", "Near Bypass"],
    description: "Half-acre residential plot off the Eastern Bypass near Ruiru. Clean title deed ready. All utilities (water, electricity) available. Ideal for investment.",
    available: true, userId: "seed", userName: "Land Solutions Kenya",
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
];

const [AppContextProvider, useAppContext] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [userJson, listingsJson, savedJson] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.USER),
          AsyncStorage.getItem(STORAGE_KEYS.LISTINGS),
          AsyncStorage.getItem(STORAGE_KEYS.SAVED),
        ]);
        if (userJson) setUser(JSON.parse(userJson));
        const storedListings: Listing[] = listingsJson ? JSON.parse(listingsJson) : [];
        const seedIds = new Set(SEED_LISTINGS.map((l) => l.id));
        const userListings = storedListings.filter((l) => !seedIds.has(l.id));
        setListings([...SEED_LISTINGS, ...userListings]);
        if (savedJson) setSavedIds(JSON.parse(savedJson));
      } catch (e) {
        console.warn("Load error", e);
        setListings(SEED_LISTINGS);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const persistListings = useCallback(async (updated: Listing[]) => {
    const seedIds = new Set(SEED_LISTINGS.map((l) => l.id));
    const userListings = updated.filter((l) => !seedIds.has(l.id));
    await AsyncStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(userListings));
  }, []);

  const register = useCallback(async (data: Omit<User, "id" | "createdAt"> & { password: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const users: (User & { password: string })[] = usersJson ? JSON.parse(usersJson) : [];
      if (users.find((u) => u.email === data.email)) return { success: false, error: "Email already registered" };
      const newUser: User = {
        id: generateId(), name: data.name, email: data.email, phone: data.phone,
        accountType: data.accountType, bio: data.bio, location: data.location,
        createdAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([...users, { ...newUser, password: data.password }]));
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      setUser(newUser);
      return { success: true };
    } catch (e) { return { success: false, error: "Registration failed" }; }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const users: (User & { password: string })[] = usersJson ? JSON.parse(usersJson) : [];
      const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!found) return { success: false, error: "Invalid email or password" };
      const { password: _, ...userData } = found;
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (e) { return { success: false, error: "Login failed" }; }
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
    setSavedIds([]);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Omit<User, "id" | "createdAt">>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    if (usersJson) {
      const users = JSON.parse(usersJson);
      const idx = users.findIndex((u: User) => u.id === user.id);
      if (idx >= 0) { users[idx] = { ...users[idx], ...updates }; await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)); }
    }
  }, [user]);

  const addListing = useCallback(async (data: Omit<Listing, "id" | "userId" | "userName" | "verified" | "rating" | "reviewCount" | "createdAt">): Promise<Listing> => {
    if (!user) throw new Error("Not logged in");
    const newListing: Listing = {
      ...data, id: generateId(), userId: user.id, userName: user.name,
      verified: false, rating: 0, reviewCount: 0, createdAt: new Date().toISOString(),
    };
    const updated = [...listings, newListing];
    setListings(updated);
    await persistListings(updated);
    return newListing;
  }, [user, listings, persistListings]);

  const deleteListing = useCallback(async (id: string) => {
    const updated = listings.filter((l) => l.id !== id);
    setListings(updated);
    await persistListings(updated);
    const updatedSaved = savedIds.filter((s) => s !== id);
    setSavedIds(updatedSaved);
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(updatedSaved));
  }, [listings, savedIds, persistListings]);

  const toggleAvailability = useCallback(async (id: string) => {
    const updated = listings.map((l) => l.id === id ? { ...l, available: !l.available } : l);
    setListings(updated);
    await persistListings(updated);
  }, [listings, persistListings]);

  const toggleSaved = useCallback(async (id: string) => {
    const updated = savedIds.includes(id) ? savedIds.filter((s) => s !== id) : [...savedIds, id];
    setSavedIds(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(updated));
  }, [savedIds]);

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);
  const getListingsByCategory = useCallback((categoryId: string) => listings.filter((l) => l.categoryId === categoryId), [listings]);
  const getMyListings = useCallback(() => user ? listings.filter((l) => l.userId === user.id) : [], [user, listings]);
  const getSavedListings = useCallback(() => listings.filter((l) => savedIds.includes(l.id)), [listings, savedIds]);

  return {
    user, listings, savedIds, isLoading,
    register, login, logout, updateProfile,
    addListing, deleteListing, toggleAvailability,
    toggleSaved, isSaved, getListingsByCategory, getMyListings, getSavedListings,
  };
});

export { AppContextProvider, useAppContext };
