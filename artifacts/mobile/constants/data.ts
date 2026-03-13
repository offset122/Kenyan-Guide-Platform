export type Category = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconSet: "Ionicons" | "MaterialIcons" | "Feather" | "MaterialCommunityIcons";
  color: string;
  accentColor: string;
  description: string;
};

export const CATEGORIES: Category[] = [
  {
    id: "providers",
    title: "Service Providers",
    subtitle: "Skilled professionals",
    icon: "construct",
    iconSet: "Ionicons",
    color: "#1A5C38",
    accentColor: "#C9A84C",
    description: "Find skilled professionals: plumbers, electricians, carpenters, cleaners, tutors, photographers and more.",
  },
  {
    id: "businesses",
    title: "Businesses",
    subtitle: "Verified companies",
    icon: "business",
    iconSet: "Ionicons",
    color: "#1A3A5C",
    accentColor: "#6CA8E8",
    description: "Browse verified businesses: law firms, hospitals, tech companies, hotels, retail stores and more.",
  },
  {
    id: "emergency",
    title: "Emergency Services",
    subtitle: "Help when you need it",
    icon: "warning",
    iconSet: "Ionicons",
    color: "#5C1A1A",
    accentColor: "#E85C5C",
    description: "Quick access to emergency services: ambulance, police, fire brigade, hospitals and roadside assistance.",
  },
  {
    id: "jobs",
    title: "Job Corner",
    subtitle: "Opportunities across Kenya",
    icon: "briefcase",
    iconSet: "Ionicons",
    color: "#3A1A5C",
    accentColor: "#A87AE8",
    description: "Find jobs or post opportunities: IT, construction, driving, office, freelance and more.",
  },
  {
    id: "products",
    title: "Marketplace",
    subtitle: "Buy & sell locally",
    icon: "storefront",
    iconSet: "MaterialIcons",
    color: "#1A4A5C",
    accentColor: "#5CC8E8",
    description: "Buy and sell products: electronics, furniture, vehicles, tools, clothing and household items.",
  },
  {
    id: "realestate",
    title: "Real Estate",
    subtitle: "Properties across Kenya",
    icon: "home",
    iconSet: "Ionicons",
    color: "#3A5C1A",
    accentColor: "#88C84C",
    description: "Property listings: apartments for rent, houses for sale, land, commercial properties and Airbnb.",
  },
];

export const CATEGORY_TAGS: Record<string, string[]> = {
  providers: ["Plumbing", "Electrical", "Carpentry", "Painting", "Cleaning", "Tutoring", "Photography", "Mechanics", "HVAC", "Security", "Landscaping", "Catering"],
  businesses: ["Law", "Medical", "IT", "Construction", "Retail", "Hospitality", "Finance", "Education", "Logistics", "Media", "Manufacturing", "Consulting"],
  emergency: ["Ambulance", "Police", "Fire Brigade", "Hospital", "Roadside Help", "Locksmith", "Rescue", "Crisis Line"],
  jobs: ["IT", "Construction", "Driving", "Administration", "Sales", "Finance", "Healthcare", "Education", "Hospitality", "Freelance", "Security", "Cleaning"],
  products: ["Electronics", "Furniture", "Vehicles", "Clothing", "Tools", "Machinery", "Food", "Sports", "Books", "Household", "Baby", "Garden"],
  realestate: ["1 Bedroom", "2 Bedrooms", "3 Bedrooms", "4+ Bedrooms", "Studio", "Land", "Commercial", "Airbnb", "Bedsitter", "Maisonette"],
};

export const ACCOUNT_TYPES = [
  { id: "customer", label: "Customer", description: "Looking for services", icon: "person-outline" },
  { id: "provider", label: "Service Provider", description: "Offer your skills", icon: "construct-outline" },
  { id: "business", label: "Business", description: "Register your company", icon: "business-outline" },
  { id: "employer", label: "Employer", description: "Post job opportunities", icon: "briefcase-outline" },
  { id: "agent", label: "Property Agent", description: "List properties", icon: "home-outline" },
] as const;

export const KENYAN_COUNTIES = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Nyeri", "Meru", "Thika",
  "Kisii", "Kakamega", "Garissa", "Machakos", "Embu", "Kitale", "Malindi",
  "Kiambu", "Muranga", "Kirinyaga", "Laikipia", "Nyandarua", "Kajiado",
  "Makueni", "Kitui", "Kericho", "Bomet", "Migori", "Homa Bay", "Siaya",
  "Bungoma", "Busia", "Trans Nzoia", "Uasin Gishu", "Nandi", "Baringo",
  "West Pokot", "Samburu", "Isiolo", "Marsabit", "Wajir", "Mandera",
  "Turkana", "Kwale", "Kilifi", "Taita-Taveta", "Tana River", "Lamu",
];
