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

// Seed listings shown on first launch
const SEED_LISTINGS: Listing[] = [
  {
    id: "seed_p1",
    categoryId: "providers",
    title: "James Mwangi",
    subtitle: "Master Plumber",
    location: "Westlands, Nairobi",
    rating: 4.9,
    reviewCount: 284,
    price: "KSh 2,500/hr",
    phone: "+254 712 345 678",
    verified: true,
    badge: "Top Rated",
    tags: ["Plumbing", "Pipe Repair", "Drainage"],
    description: "Professional plumber with 12 years experience. Specializes in residential and commercial plumbing, pipe installations, and emergency repairs.",
    available: true,
    userId: "seed",
    userName: "James Mwangi",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "seed_p2",
    categoryId: "providers",
    title: "Grace Wanjiku",
    subtitle: "Certified Electrician",
    location: "Kilimani, Nairobi",
    rating: 4.8,
    reviewCount: 192,
    price: "KSh 3,000/hr",
    phone: "+254 723 456 789",
    verified: true,
    badge: "Verified Pro",
    tags: ["Electrical", "Wiring", "Solar"],
    description: "Certified electrician offering residential wiring, solar installations, and electrical fault diagnosis. Available for emergency callouts.",
    available: true,
    userId: "seed",
    userName: "Grace Wanjiku",
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "seed_b1",
    categoryId: "businesses",
    title: "Savannah Legal Associates",
    subtitle: "Law Firm",
    location: "Upper Hill, Nairobi",
    rating: 4.8,
    reviewCount: 87,
    phone: "+254 20 234 5678",
    verified: true,
    badge: "Premium",
    tags: ["Legal", "Corporate", "Property Law"],
    description: "Full-service law firm specializing in corporate law, real estate transactions, employment law, and dispute resolution.",
    available: true,
    userId: "seed",
    userName: "Savannah Legal",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "seed_e1",
    categoryId: "emergency",
    title: "AAR Ambulance Services",
    subtitle: "Emergency Medical",
    location: "All Nairobi Areas",
    rating: 4.9,
    reviewCount: 1204,
    price: "Emergency",
    phone: "+254 20 717 1000",
    verified: true,
    badge: "24/7",
    tags: ["Ambulance", "ICU", "First Aid"],
    description: "Kenya's leading emergency ambulance service with fully equipped ICU ambulances and trained paramedics. Available 24/7 across Nairobi.",
    available: true,
    userId: "seed",
    userName: "AAR Healthcare",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "seed_e2",
    categoryId: "emergency",
    title: "National Police Service",
    subtitle: "Police Emergency Line",
    location: "Nationwide",
    rating: 4.5,
    reviewCount: 892,
    phone: "999",
    verified: true,
    badge: "Official",
    tags: ["Police", "Emergency", "Security"],
    description: "National emergency police number. Available 24/7 for crimes, accidents, and security emergencies across Kenya.",
    available: true,
    userId: "seed",
    userName: "National Police",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "seed_j1",
    categoryId: "jobs",
    title: "Software Engineer",
    subtitle: "Andela Kenya",
    location: "Nairobi (Remote)",
    rating: 4.7,
    reviewCount: 42,
    price: "KSh 150,000–280,000/mo",
    phone: "+254 700 111 222",
    verified: true,
    badge: "Hot",
    tags: ["React", "Node.js", "TypeScript"],
    description: "Join Andela as a Senior Software Engineer. Work on cutting-edge projects for global clients. Remote-first culture with competitive pay.",
    available: true,
    userId: "seed",
    userName: "Andela Kenya",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "seed_pr1",
    categoryId: "products",
    title: "Samsung Galaxy S24",
    subtitle: "Brand New · Sealed Box",
    location: "CBD, Nairobi",
    rating: 4.8,
    reviewCount: 34,
    price: "KSh 78,000",
    phone: "+254 756 789 012",
    verified: true,
    badge: "New",
    tags: ["Phone", "Samsung", "Electronics"],
    description: "Brand new Samsung Galaxy S24. 256GB storage, 8GB RAM. Original box with all accessories. One year warranty included.",
    available: true,
    userId: "seed",
    userName: "TechMart Kenya",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "seed_r1",
    categoryId: "realestate",
    title: "3BR Apartment – Kileleshwa",
    subtitle: "For Rent",
    location: "Kileleshwa, Nairobi",
    rating: 4.8,
    reviewCount: 12,
    price: "KSh 85,000/mo",
    phone: "+254 789 012 345",
    verified: true,
    badge: "Featured",
    tags: ["3 Bedrooms", "Swimming Pool", "Secure"],
    description: "Spacious 3-bedroom apartment in a prime secure estate. Ensuite master bedroom, modern kitchen, parking, pool, and 24hr security.",
    available: true,
    userId: "seed",
    userName: "Prime Properties",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const [AppContextProvider, useAppContext] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all state from AsyncStorage on mount
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
        // Merge seed listings with user listings (seed ones won't duplicate)
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

  // Persist listings (only user-created ones, not seeds)
  const persistListings = useCallback(async (updated: Listing[]) => {
    const seedIds = new Set(SEED_LISTINGS.map((l) => l.id));
    const userListings = updated.filter((l) => !seedIds.has(l.id));
    await AsyncStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(userListings));
  }, []);

  // Auth
  const register = useCallback(async (data: Omit<User, "id" | "createdAt"> & { password: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const users: (User & { password: string })[] = usersJson ? JSON.parse(usersJson) : [];
      if (users.find((u) => u.email === data.email)) {
        return { success: false, error: "Email already registered" };
      }
      const newUser: User = {
        id: generateId(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        accountType: data.accountType,
        bio: data.bio,
        location: data.location,
        createdAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([...users, { ...newUser, password: data.password }]));
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      setUser(newUser);
      return { success: true };
    } catch (e) {
      return { success: false, error: "Registration failed" };
    }
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
    } catch (e) {
      return { success: false, error: "Login failed" };
    }
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
    // Also update in users list
    const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    if (usersJson) {
      const users = JSON.parse(usersJson);
      const idx = users.findIndex((u: User) => u.id === user.id);
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...updates };
        await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }
    }
  }, [user]);

  // Listings
  const addListing = useCallback(async (data: Omit<Listing, "id" | "userId" | "userName" | "verified" | "rating" | "reviewCount" | "createdAt">): Promise<Listing> => {
    if (!user) throw new Error("Not logged in");
    const newListing: Listing = {
      ...data,
      id: generateId(),
      userId: user.id,
      userName: user.name,
      verified: false,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
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
    // Also remove from saved
    const updatedSaved = savedIds.filter((s) => s !== id);
    setSavedIds(updatedSaved);
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(updatedSaved));
  }, [listings, savedIds, persistListings]);

  const toggleAvailability = useCallback(async (id: string) => {
    const updated = listings.map((l) => l.id === id ? { ...l, available: !l.available } : l);
    setListings(updated);
    await persistListings(updated);
  }, [listings, persistListings]);

  // Saved
  const toggleSaved = useCallback(async (id: string) => {
    const updated = savedIds.includes(id)
      ? savedIds.filter((s) => s !== id)
      : [...savedIds, id];
    setSavedIds(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(updated));
  }, [savedIds]);

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  const getListingsByCategory = useCallback((categoryId: string) =>
    listings.filter((l) => l.categoryId === categoryId),
    [listings]);

  const getMyListings = useCallback(() =>
    user ? listings.filter((l) => l.userId === user.id) : [],
    [user, listings]);

  const getSavedListings = useCallback(() =>
    listings.filter((l) => savedIds.includes(l.id)),
    [listings, savedIds]);

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
  };
});

export { AppContextProvider, useAppContext };
