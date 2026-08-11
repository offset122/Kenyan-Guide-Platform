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
    id: "services",
    title: "Businesses That Offer Services",
    subtitle: "Service companies",
    icon: "briefcase",
    iconSet: "Ionicons",
    color: "#1A3A5C",
    accentColor: "#6CA8E8",
    description: "Registered businesses offering services: law firms, surveyors, printing companies, consultancies, travel agencies, studios and more.",
  },
  {
    id: "products",
    title: "Businesses That Sell Products",
    subtitle: "Shops & retail",
    icon: "storefront",
    iconSet: "MaterialIcons",
    color: "#5C3A1A",
    accentColor: "#E8A84C",
    description: "Businesses selling physical goods: furniture shops, electronics stores, boutiques, hardware stores, gift shops, bookshops and more.",
  },
  {
    id: "food",
    title: "Food & Drinks",
    subtitle: "Restaurants, cafés & more",
    icon: "restaurant",
    iconSet: "Ionicons",
    color: "#5C1A1A",
    accentColor: "#E85C5C",
    description: "Restaurants, cafés, bakeries, caterers, food vendors, coffee shops, juice bars, butchers and more.",
  },
  {
    id: "emergency",
    title: "Emergency & Healthcare",
    subtitle: "Help when you need it",
    icon: "warning",
    iconSet: "Ionicons",
    color: "#5C1A1A",
    accentColor: "#E85C5C",
    description: "Emergency response and healthcare: ambulances, police, fire brigades, hospitals, clinics, pharmacies, laboratories and more.",
  },
  {
    id: "realestate",
    title: "Rentals & Real Estate",
    subtitle: "Properties across Kenya",
    icon: "home",
    iconSet: "Ionicons",
    color: "#3A5C1A",
    accentColor: "#88C84C",
    description: "Houses, apartments, bedsitters, commercial spaces, land, offices and properties for rent or sale.",
  },
  {
    id: "automobiles",
    title: "Automobiles & Bikes",
    subtitle: "Vehicles & related services",
    icon: "car",
    iconSet: "Ionicons",
    color: "#1A4A5C",
    accentColor: "#5CC8E8",
    description: "Cars, motorcycles, bicycles, spare parts, garages, vehicle dealers, vehicle hire and vehicles for sale.",
  },
  {
    id: "jobs",
    title: "Jobs",
    subtitle: "Opportunities & candidates",
    icon: "briefcase",
    iconSet: "Ionicons",
    color: "#3A1A5C",
    accentColor: "#A87AE8",
    description: "We're Hiring — post vacancies. I'm Looking — create a profile, upload your CV and list your skills.",
  },
  {
    id: "events",
    title: "What's Happening",
    subtitle: "Events & activities",
    icon: "calendar",
    iconSet: "Ionicons",
    color: "#5C3A1A",
    accentColor: "#E8A84C",
    description: "Discover concerts, exhibitions, festivals, conferences, church events, sports events and community activities nearby.",
  },
];

export const CATEGORY_TAGS: Record<string, string[]> = {
  providers: ["Plumbing", "Electrical", "Carpentry", "Painting", "Cleaning", "Tutoring", "Photography", "Mechanics", "HVAC", "Security", "Landscaping", "Catering"],
  services: ["Legal", "Surveying", "Printing", "Cleaning", "Repairs", "Consulting", "Travel", "Marketing", "Media", "Design", "Accounting", "Insurance"],
  products: ["Electronics", "Furniture", "Clothing", "Hardware", "Gifts", "Agrovet", "Books", "Flowers", "Groceries", "Tools", "Toys", "Jewelry"],
  food: ["Restaurant", "Café", "Bakery", "Catering", "Vendor", "Coffee", "Juice Bar", "Butcher", "Takeaway", "Fine Dining", "Food Truck", "Cooking Classes"],
  emergency: ["Ambulance", "Police", "Fire", "Hospital", "Clinic", "Pharmacy", "Lab", "Dental", "Vet", "Rescue", "Security", "First Aid"],
  realestate: ["1 Bedroom", "2 Bedrooms", "3 Bedrooms", "4+ Bedrooms", "Studio", "Land", "Commercial", "Airbnb", "Bedsitter", "Maisonette", "Office", "Shop"],
  automobiles: ["Cars", "Motorcycles", "Bicycles", "Spare Parts", "Garages", "Dealers", "Hire", "For Sale", "Tyres", "Batteries", "Bodywork", "Towing"],
  jobs: ["IT", "Construction", "Driving", "Administration", "Sales", "Finance", "Healthcare", "Education", "Hospitality", "Freelance", "Security", "Cleaning"],
  events: ["Concerts", "Exhibitions", "Festivals", "Conferences", "Church", "Sports", "Community", "Theatre", "Comedy", "Workshops", "Networking", "Markets"],
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
