import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

import { Colors } from "@/constants/colors";
import { CATEGORIES, CATEGORY_TAGS, KENYAN_COUNTIES } from "@/constants/data";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { useNotifications } from "@/context/NotificationContext";
import { requestCameraPermission, requestMediaLibraryPermission } from "@/lib/permissions";

const MAX_PHOTOS = 6;
  const CATEGORY2_MAX_PHOTOS = 3;
  const CATEGORY2_MAX_DESC = 200;

export default function CreateListingScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const { user, addListing } = useAppContext();
  const { success: toastSuccess, error: toastError } = useToast();
  const { notifyListingPosted } = useNotifications();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  // Step 1 - Category
  const [categoryId, setCategoryId] = useState("");
  // Step 2 - Details
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [county, setCounty] = useState("");
  const [constituency, setConstituency] = useState("");
  const [areaCode, setAreaCode] = useState("");
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState(user?.phone ?? "+254 ");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [available, setAvailable] = useState(true);
  // Category-specific fields
  const [serviceType, setServiceType] = useState("");
  const [charges, setCharges] = useState("");
  const [onSite, setOnSite] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [foodCategory, setFoodCategory] = useState("");
  const [delivery, setDelivery] = useState(false);
  const [priceRange, setPriceRange] = useState("");
  const [facilityType, setFacilityType] = useState("");
  const [available247, setAvailable247] = useState(false);
  const [propertyType, setPropertyType] = useState("");
  const [listingFor, setListingFor] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [condition, setCondition] = useState("");
  const [jobType, setJobType] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [salary, setSalary] = useState("");
  const [education, setEducation] = useState("");
  const [experience, setExperience] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [eventCategory, setEventCategory] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venue, setVenue] = useState("");
  const [ticketPrice, setTicketPrice] = useState("");
  // Step 3 - Photos
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const availableTags = categoryId ? (CATEGORY_TAGS[categoryId] ?? []) : [];
  const isServicesCategory = categoryId === "services";
  const isFoodCategory = categoryId === "food";
  const isEmergencyCategory = categoryId === "emergency";
  const isRealEstateCategory = categoryId === "realestate";
  const isAutomobilesCategory = categoryId === "automobiles";
  const isJobsCategory = categoryId === "jobs";
  const isEventsCategory = categoryId === "events";
  const maxPhotos = isServicesCategory ? CATEGORY2_MAX_PHOTOS : MAX_PHOTOS;
  const descMaxLength = isServicesCategory || isEmergencyCategory || isFoodCategory ? 200 : isRealEstateCategory || isAutomobilesCategory || isEventsCategory || (isJobsCategory && jobType === "looking") ? 300 : isJobsCategory && jobType === "hiring" ? 500 : 600;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag].slice(0, 6)
    );
  };

  React.useEffect(() => {
    setServiceType("");
    setCharges("");
    setOnSite(false);
    setKeywords("");
    setLogoUrl("");
    setFoodCategory("");
    setDelivery(false);
    setPriceRange("");
    setFacilityType("");
    setAvailable247(false);
    setPropertyType("");
    setListingFor("");
    setVehicleType("");
    setCondition("");
    setJobType("");
    setEmploymentType("");
    setSalary("");
    setEducation("");
    setExperience("");
    setProfilePhoto("");
    setCvUrl("");
    setEventCategory("");
    setEventDate("");
    setEventTime("");
    setVenue("");
    setTicketPrice("");
  }, [categoryId]);

  const validateStep1 = () => {
    if (!categoryId) return "Please select a category";
    return null;
  };

  const validateStep2 = () => {
    if (!title.trim()) return "Title is required";
    if (!subtitle.trim()) return "Subtitle or short description is required";
    if (!description.trim() || description.trim().length < 20) return "Description must be at least 20 characters";
    if (!location.trim()) return "Location is required";
    if (!phone.trim() || phone.replace(/\s/g, "").length < 9) return "Valid phone number is required";
    if (isServicesCategory) {
      if (!serviceType.trim()) return "Service type is required for service businesses";
      if (!charges.trim()) return "Charges are required for service businesses";
      if (!keywords.trim()) return "At least one keyword is required for service businesses";
      if (!logoUrl.trim()) return "Business logo or cover photo is required";
    }
    if (isFoodCategory) {
      if (!foodCategory.trim()) return "Food category is required";
      if (!priceRange.trim()) return "Price range is required";
    }
    if (isEmergencyCategory) {
      if (!facilityType.trim()) return "Facility type is required";
    }
    if (isRealEstateCategory) {
      if (!propertyType.trim()) return "Property type is required";
      if (!listingFor.trim()) return "Listing type (Rent/Sale) is required";
    }
    if (isAutomobilesCategory) {
      if (!vehicleType.trim()) return "Vehicle type is required";
      if (!condition.trim()) return "Condition is required";
    }
    if (isJobsCategory) {
      if (!jobType.trim()) return "Job type is required";
      if (jobType === "hiring") {
        if (!employmentType.trim()) return "Employment type is required";
      }
      if (jobType === "looking") {
        if (!education.trim()) return "Education level is required";
        if (!experience.trim()) return "Years of experience is required";
      }
    }
    if (isEventsCategory) {
      if (!eventCategory.trim()) return "Event category is required";
      if (!eventDate.trim()) return "Event date is required";
      if (!eventTime.trim()) return "Event time is required";
      if (!venue.trim()) return "Venue is required";
      if (!ticketPrice.trim()) return "Ticket price is required";
    }
    return null;
  };

  const handleNext = () => {
    const err = step === 1 ? validateStep1() : step === 2 ? validateStep2() : null;
    if (err) { setError(err); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); return; }
    setError("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((s) => Math.min(s + 1, 3) as any);
  };

  const pickPhoto = async () => {
    if (photos.length >= maxPhotos) {
      toastError(`Maximum ${maxPhotos} photos allowed`);
      return;
    }
    const permission = await requestMediaLibraryPermission({ showRationale: true });
    if (permission !== "granted") return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: maxPhotos - photos.length,
      });
      if (!result.canceled) {
        const newUris = result.assets.map((a) => a.uri);
        setPhotos((prev) => [...prev, ...newUris].slice(0, maxPhotos));
        Haptics.selectionAsync();
      }
    } catch {
      toastError("Could not open photo library");
    }
  };

  const takePhoto = async () => {
    if (photos.length >= maxPhotos) { toastError(`Maximum ${maxPhotos} photos`); return; }
    const permission = await requestCameraPermission({ showRationale: true });
    if (permission !== "granted") return;
    try {
      const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
      if (!result.canceled && result.assets[0]) {
        setPhotos((prev) => [...prev, result.assets[0].uri].slice(0, maxPhotos));
        Haptics.selectionAsync();
      }
    } catch {}
  };

  const removePhoto = (idx: number) => {
    Haptics.selectionAsync();
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const newListing = await addListing({
        categoryId,
        title: title.trim(),
        subtitle: subtitle.trim(),
        description: description.trim(),
        location: location.trim(),
        county: county.trim(),
        constituency: constituency.trim(),
        areaCode: areaCode.trim(),
        price: price.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        email: email.trim(),
        logoUrl: logoUrl.trim(),
        tags: selectedTags,
        available,
        serviceType: isServicesCategory ? serviceType.trim() : "",
        charges: isServicesCategory ? charges.trim() : "",
        onSite: isServicesCategory ? onSite : false,
        keywords: isServicesCategory ? keywords.split(",").map((k) => k.trim()).filter(Boolean) : [],
        foodCategory: isFoodCategory ? foodCategory.trim() : "",
        delivery: isFoodCategory ? delivery : false,
        priceRange: isFoodCategory ? priceRange.trim() : "",
        facilityType: isEmergencyCategory ? facilityType.trim() : "",
        available247: isEmergencyCategory ? available247 : false,
        propertyType: isRealEstateCategory ? propertyType.trim() : "",
        listingFor: isRealEstateCategory ? listingFor.trim() : "",
        vehicleType: isAutomobilesCategory ? vehicleType.trim() : "",
        condition: isAutomobilesCategory ? condition.trim() : "",
        jobType: isJobsCategory ? jobType.trim() : "",
        employmentType: isJobsCategory && jobType === "hiring" ? employmentType.trim() : "",
        salary: isJobsCategory ? salary.trim() : "",
        education: isJobsCategory && jobType === "looking" ? education.trim() : "",
        experience: isJobsCategory && jobType === "looking" ? experience.trim() : "",
        profilePhoto: isJobsCategory && jobType === "looking" ? profilePhoto.trim() : "",
        cvUrl: isJobsCategory && jobType === "looking" ? cvUrl.trim() : "",
        eventCategory: isEventsCategory ? eventCategory.trim() : "",
        eventDate: isEventsCategory ? eventDate.trim() : "",
        eventTime: isEventsCategory ? eventTime.trim() : "",
        venue: isEventsCategory ? venue.trim() : "",
        ticketPrice: isEventsCategory ? ticketPrice.trim() : "",
        photos,
        badge: undefined,
      });
      toastSuccess("Listing posted successfully!");
      notifyListingPosted(title.trim(), newListing.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
       router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message ?? "Failed to post listing");
      toastError("Failed to post listing");
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = CATEGORIES.find((c) => c.id === categoryId);

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: topPadding }]}>
        <View style={styles.guestWrap}>
          <View style={styles.guestIcon}>
            <Ionicons name="lock-closed" size={40} color={Colors.gold} />
          </View>
          <Text style={styles.guestTitle}>Sign In to Post</Text>
          <Text style={styles.guestText}>Create a free account to post listings</Text>
          <TouchableOpacity style={styles.signInBtn} onPress={() => router.push("/auth")}>
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerBtn} onPress={() => router.push("/auth/signup")}>
            <Text style={styles.registerBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Nav */}
      <View style={styles.nav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => step === 1 ? null : setStep((s) => (s - 1) as any)}>
          {step > 1 && <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />}
        </TouchableOpacity>
        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>New Listing</Text>
          <Text style={styles.navStep}>Step {step} of 3</Text>
        </View>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round((step / 3) * 100)}%` as any }]} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: isWeb ? 34 : insets.bottom + 32 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* ─── STEP 1: CATEGORY ─── */}
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>Choose a Category</Text>
            <Text style={styles.stepSubtitle}>What type of listing are you creating?</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const isActive = categoryId === cat.id;
                const Icon = cat.iconSet === "MaterialIcons" ? MaterialIcons : Ionicons;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catCard, isActive && styles.catCardActive]}
                    onPress={() => { setCategoryId(cat.id); setSelectedTags([]); Haptics.selectionAsync(); }}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.catIcon, { backgroundColor: cat.color + (isActive ? "FF" : "99") }]}>
                      {/* @ts-ignore */}
                      <Icon name={cat.icon} size={24} color={cat.accentColor} />
                    </View>
                    <Text style={[styles.catLabel, isActive && { color: Colors.gold }]}>{cat.title}</Text>
                    <Text style={styles.catCount}>{cat.id === "providers" ? "Best for freelancers" : cat.id === "products" ? "Buy & sell items" : cat.id === "realestate" ? "Property listings" : cat.id === "jobs" ? "Job postings" : cat.id === "emergency" ? "Emergency services" : "Businesses"}</Text>
                    {isActive && (
                      <View style={styles.catCheck}>
                        <Ionicons name="checkmark-circle" size={18} color={Colors.gold} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            {error ? <ErrorBox message={error} /> : null}
            <TouchableOpacity style={[styles.primaryBtn, !categoryId && { opacity: 0.6 }]} onPress={handleNext} disabled={!categoryId}>
              <Text style={styles.primaryBtnText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.darkBg} />
            </TouchableOpacity>
          </View>
        )}

        {/* ─── STEP 2: DETAILS ─── */}
        {step === 2 && (
          <View>
            {selectedCategory && (
              <View style={styles.catBanner}>
                <View style={[styles.catBannerIcon, { backgroundColor: selectedCategory.color }]}>
                  {selectedCategory.iconSet === "MaterialIcons"
                    ? <MaterialIcons name={selectedCategory.icon as any} size={18} color={selectedCategory.accentColor} />
                    : <Ionicons name={selectedCategory.icon as any} size={18} color={selectedCategory.accentColor} />
                  }
                </View>
                <Text style={styles.catBannerText}>{selectedCategory.title}</Text>
              </View>
            )}

            <Text style={styles.stepTitle}>Listing Details</Text>
            <Text style={styles.stepSubtitle}>Fill in the information about your listing</Text>

            <View style={styles.form}>
              <Field label={isServicesCategory ? "Business Name *" : isJobsCategory && jobType === "looking" ? "Full Name *" : isEventsCategory ? "Event Title *" : isEmergencyCategory ? "Name of Facility or Service *" : isRealEstateCategory ? "Property Title *" : isAutomobilesCategory ? "Title *" : "Title *"} icon="text-outline" value={title} onChangeText={setTitle} placeholder={isServicesCategory ? "e.g. ABC Surveyors, Prime Cleaning Services" : categoryId === "products" ? "e.g. Samsung Galaxy S24 – 256GB" : categoryId === "jobs" && jobType === "hiring" ? "e.g. Senior Software Engineer" : "e.g. James Mwangi – Master Plumber"} />
              <Field label={isJobsCategory && jobType === "hiring" ? "Company Name *" : isJobsCategory && jobType === "looking" ? "Profession *" : "Short Description *"} icon="document-text-outline" value={subtitle} onChangeText={setSubtitle} placeholder={isJobsCategory && jobType === "looking" ? "e.g. Accountant, Chef, Driver, Electrician" : categoryId === "realestate" ? "e.g. 3BR Apartment, Kileleshwa" : "e.g. Certified electrician, 10 years experience"} />

                <View style={styles.field}>
                 <Text style={styles.label}>Full Description *{isServicesCategory ? " (max 200 characters)" : isRealEstateCategory || isAutomobilesCategory || isEventsCategory || (isJobsCategory && jobType === "looking") ? " (max 300 characters)" : isJobsCategory && jobType === "hiring" ? " (max 500 characters)" : isEmergencyCategory || isFoodCategory ? " (max 200 characters)" : ""}</Text>
                 <View style={[styles.inputWrap, { alignItems: "flex-start", paddingTop: 12, paddingBottom: 12 }]}>
                   <TextInput
                     style={[styles.input, { height: 100, textAlignVertical: "top" }]}
                     value={description}
                     onChangeText={setDescription}
                     placeholder={isServicesCategory ? "Describe your business in up to 200 characters" : "Describe your listing in detail. Include what makes it special, experience, conditions, etc."}
                     placeholderTextColor={Colors.textMuted}
                     multiline
                     maxLength={descMaxLength}
                   />
                 </View>
                 <Text style={styles.charCount}>{description.length}/{descMaxLength}</Text>
               </View>

               <View style={styles.row2}>
                 <View style={[styles.field, { flex: 1 }]}>
                   <Text style={styles.label}>Location *</Text>
                   <View style={styles.inputWrap}>
                     <Ionicons name="location-outline" size={16} color={Colors.textMuted} />
                     <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Area, County" placeholderTextColor={Colors.textMuted} />
                   </View>
                 </View>
                 <View style={[styles.field, { flex: 1 }]}>
                   <Text style={styles.label}>{isRealEstateCategory ? "Price *" : isEventsCategory ? "Ticket Price *" : isJobsCategory ? "Salary" : "Price"}</Text>
                   <View style={styles.inputWrap}>
                     <Text style={styles.kshLabel}>KSh</Text>
                     <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder={isEventsCategory ? "e.g. Free, KSh 500" : "e.g. 2,500/hr"} placeholderTextColor={Colors.textMuted} keyboardType="default" />
                   </View>
                 </View>
               </View>

               <Field label="Contact Phone *" icon="call-outline" value={phone} onChangeText={setPhone} placeholder="+254 7XX XXX XXX" keyboardType="phone-pad" />

               <View style={styles.row2}>
                 <View style={[styles.field, { flex: 1 }]}>
                   <Text style={styles.label}>County *</Text>
                   <View style={styles.inputWrap}>
                     <Ionicons name="map-outline" size={16} color={Colors.textMuted} />
                     <TextInput style={styles.input} value={county} onChangeText={setCounty} placeholder="e.g. Nairobi, Mombasa" placeholderTextColor={Colors.textMuted} />
                   </View>
                 </View>
                 <View style={[styles.field, { flex: 1 }]}>
                   <Text style={styles.label}>Constituency *</Text>
                   <View style={styles.inputWrap}>
                     <Ionicons name="map-marker-outline" size={16} color={Colors.textMuted} />
                     <TextInput style={styles.input} value={constituency} onChangeText={setConstituency} placeholder="e.g. Westlands, Embakasi" placeholderTextColor={Colors.textMuted} />
                   </View>
                 </View>
               </View>

               <View style={styles.field}>
                 <Text style={styles.label}>Area Code / Location *</Text>
                 <View style={styles.inputWrap}>
                   <Ionicons name="location-on" size={16} color={Colors.textMuted} />
                   <TextInput style={styles.input} value={areaCode} onChangeText={setAreaCode} placeholder="e.g. Kinoo, Thindigwa, Runda, Kikuyu" placeholderTextColor={Colors.textMuted} />
                 </View>
               </View>

               {/* Quick county chips */}
               <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
                 {KENYAN_COUNTIES.slice(0, 12).map((c) => (
                   <TouchableOpacity key={c} style={[styles.pill, location.includes(c) && styles.pillActive]} onPress={() => setLocation(c)}>
                     <Text style={[styles.pillText, location.includes(c) && styles.pillTextActive]}>{c}</Text>
                   </TouchableOpacity>
                 ))}
               </ScrollView>

               {/* Category 2: Businesses That Offer Services — extra fields */}
               {isServicesCategory && (
                 <View>
                   <Field label="What service does your business offer? *" icon="construct-outline" value={serviceType} onChangeText={setServiceType} placeholder="e.g. Surveying, Legal Services, Cleaning" />
                   <Field label="Business Logo or Cover Photo *" icon="image-outline" value={logoUrl} onChangeText={setLogoUrl} placeholder="URL to your business logo or cover photo" />
                   <Field label="Keywords *" icon="search-outline" value={keywords} onChangeText={setKeywords} placeholder="e.g. Land Survey, Beacons, Title Deeds, Company Registration" />
                   <Field label="How much do you charge? *" icon="cash-outline" value={charges} onChangeText={setCharges} placeholder="e.g. From KSh 5,000, Negotiable, Call for quotation" />
                   <Field label="WhatsApp Number" icon="logo-whatsapp" value={whatsapp} onChangeText={setWhatsapp} placeholder="+254 7XX XXX XXX" keyboardType="phone-pad" />
                   <Field label="Email Address" icon="mail-outline" value={email} onChangeText={setEmail} placeholder="info@yourbusiness.co.ke" keyboardType="email-address" />
                   <View style={styles.field}>
                     <Text style={styles.label}>Do you offer on-site services?</Text>
                     <View style={styles.switchRow}>
                       <Text style={[styles.switchLabel, !onSite && styles.switchLabelActive]}>No</Text>
                       <Switch value={onSite} onValueChange={setOnSite} trackColor={{ false: Colors.darkCardElevated, true: Colors.green }} thumbColor={onSite ? Colors.gold : Colors.textMuted} />
                       <Text style={[styles.switchLabel, onSite && styles.switchLabelActive]}>Yes</Text>
                     </View>
                   </View>
                 </View>
               )}

               {/* Category 4: Food & Drinks — extra fields */}
               {isFoodCategory && (
                 <View>
                   <Field label="Food & Drinks Category *" icon="restaurant-outline" value={foodCategory} onChangeText={setFoodCategory} placeholder="e.g. Restaurant, Café, Bakery, Catering, Butchery" />
                   <Field label="Price Range *" icon="cash-outline" value={priceRange} onChangeText={setPriceRange} placeholder="e.g. From KSh 300, Negotiable, Call for pricing" />
                   <View style={styles.field}>
                     <Text style={styles.label}>Do you offer delivery?</Text>
                     <View style={styles.switchRow}>
                       <Text style={[styles.switchLabel, !delivery && styles.switchLabelActive]}>No</Text>
                       <Switch value={delivery} onValueChange={setDelivery} trackColor={{ false: Colors.darkCardElevated, true: Colors.green }} thumbColor={delivery ? Colors.gold : Colors.textMuted} />
                       <Text style={[styles.switchLabel, delivery && styles.switchLabelActive]}>Yes</Text>
                     </View>
                   </View>
                   <Field label="Keywords *" icon="search-outline" value={keywords} onChangeText={setKeywords} placeholder="e.g. Pilau, Nyama Choma, Pizza, Coffee, Fresh Juice" />
                   <Field label="WhatsApp Number" icon="logo-whatsapp" value={whatsapp} onChangeText={setWhatsapp} placeholder="+254 7XX XXX XXX" keyboardType="phone-pad" />
                   <Field label="Email Address" icon="mail-outline" value={email} onChangeText={setEmail} placeholder="info@yourrestaurant.co.ke" keyboardType="email-address" />
                 </View>
               )}

               {/* Category 5: Emergency & Healthcare — extra fields */}
               {isEmergencyCategory && (
                 <View>
                   <Field label="You are a… *" icon="medkit-outline" value={facilityType} onChangeText={setFacilityType} placeholder="e.g. Healthcare, Emergency Services, Breakdown & Towing" />
                   <View style={styles.field}>
                     <Text style={styles.label}>Available 24/7?</Text>
                     <View style={styles.switchRow}>
                       <Text style={[styles.switchLabel, !available247 && styles.switchLabelActive]}>No</Text>
                       <Switch value={available247} onValueChange={setAvailable247} trackColor={{ false: Colors.darkCardElevated, true: Colors.green }} thumbColor={available247 ? Colors.gold : Colors.textMuted} />
                       <Text style={[styles.switchLabel, available247 && styles.switchLabelActive]}>Yes</Text>
                     </View>
                   </View>
                   <Field label="Keywords *" icon="search-outline" value={keywords} onChangeText={setKeywords} placeholder="e.g. Ambulance, Emergency, Breakdown, Towing, First Aid, Pharmacy" />
                   <Field label="WhatsApp Number" icon="logo-whatsapp" value={whatsapp} onChangeText={setWhatsapp} placeholder="+254 7XX XXX XXX" keyboardType="phone-pad" />
                   <Field label="Email Address" icon="mail-outline" value={email} onChangeText={setEmail} placeholder="info@yourfacility.co.ke" keyboardType="email-address" />
                 </View>
               )}

               {/* Category 6: Rentals & Real Estate — extra fields */}
               {isRealEstateCategory && (
                 <View>
                   <Field label="You are listing a… *" icon="home-outline" value={propertyType} onChangeText={setPropertyType} placeholder="e.g. Residential, Commercial, Land" />
                   <Field label="For… *" icon="pricetag" value={listingFor} onChangeText={setListingFor} placeholder="e.g. Rent, Sale" />
                   <Field label="Keywords *" icon="search-outline" value={keywords} onChangeText={setKeywords} placeholder="e.g. 2 Bedroom, Parking, Balcony, Borehole, Furnished" />
                   <Field label="WhatsApp Number" icon="logo-whatsapp" value={whatsapp} onChangeText={setWhatsapp} placeholder="+254 7XX XXX XXX" keyboardType="phone-pad" />
                   <Field label="Email Address" icon="mail-outline" value={email} onChangeText={setEmail} placeholder="info@youragency.co.ke" keyboardType="email-address" />
                 </View>
               )}

               {/* Category 7: Automobiles & Bikes — extra fields */}
               {isAutomobilesCategory && (
                 <View>
                   <Field label="You are listing a… *" icon="car-outline" value={vehicleType} onChangeText={setVehicleType} placeholder="e.g. Car, Motorcycle, Bicycle, Spare Parts, Vehicle Hire" />
                   <Field label="Condition *" icon="construct-outline" value={condition} onChangeText={setCondition} placeholder="e.g. New, Used" />
                   <Field label="Keywords *" icon="search-outline" value={keywords} onChangeText={setKeywords} placeholder="e.g. Toyota, Automatic, Diesel, Low Mileage, SUV, 4WD" />
                   <Field label="WhatsApp Number" icon="logo-whatsapp" value={whatsapp} onChangeText={setWhatsapp} placeholder="+254 7XX XXX XXX" keyboardType="phone-pad" />
                   <Field label="Email Address" icon="mail-outline" value={email} onChangeText={setEmail} placeholder="info@yourdealership.co.ke" keyboardType="email-address" />
                 </View>
               )}

               {/* Category 8: Jobs — extra fields */}
               {isJobsCategory && (
                 <View>
                   <Field label="We're Hiring or I'm Looking? *" icon="briefcase-outline" value={jobType} onChangeText={setJobType} placeholder="e.g. We're Hiring or I'm Looking" />
                   {jobType === "hiring" && (
                     <View>
                       <Field label="Employment Type *" icon="time-outline" value={employmentType} onChangeText={setEmploymentType} placeholder="e.g. Full-Time, Part-Time, Contract, Internship" />
                       <Field label="Keywords *" icon="search-outline" value={keywords} onChangeText={setKeywords} placeholder="e.g. Accountant, CPA, QuickBooks, Driver, Sales" />
                     </View>
                   )}
                   {jobType === "looking" && (
                     <View>
                       <Field label="Highest Level of Education *" icon="school-outline" value={education} onChangeText={setEducation} placeholder="e.g. Degree, Diploma, Certificate, Masters" />
                       <Field label="Years of Experience *" icon="time-outline" value={experience} onChangeText={setExperience} placeholder="e.g. 2 years, 5+ years" />
                       <Field label="Profile Photo URL" icon="image-outline" value={profilePhoto} onChangeText={setProfilePhoto} placeholder="URL to your profile photo" />
                       <Field label="Upload CV (PDF only)" icon="document-attach-outline" value={cvUrl} onChangeText={setCvUrl} placeholder="URL to your CV PDF" />
                       <Field label="Skills / Keywords *" icon="search-outline" value={keywords} onChangeText={setKeywords} placeholder="e.g. Excel, Driving, Plumbing, Customer Care, Sales" />
                     </View>
                   )}
                   <Field label="Expected Salary / Salary" icon="cash-outline" value={salary} onChangeText={setSalary} placeholder={jobType === "hiring" ? "e.g. KSh 30,000–40,000, Negotiable" : "e.g. KSh 50,000/month"} />
                   <Field label="WhatsApp Number" icon="logo-whatsapp" value={whatsapp} onChangeText={setWhatsapp} placeholder="+254 7XX XXX XXX" keyboardType="phone-pad" />
                   <Field label="Email Address *" icon="mail-outline" value={email} onChangeText={setEmail} placeholder={jobType === "hiring" ? "hr@yourcompany.co.ke" : "your.email@gmail.com"} keyboardType="email-address" />
                 </View>
               )}

               {/* Category 9: What's Happening — extra fields */}
               {isEventsCategory && (
                 <View>
                   <Field label="Event Category *" icon="calendar-outline" value={eventCategory} onChangeText={setEventCategory} placeholder="e.g. Music & Entertainment, Business, Sports, Community, Church & Faith" />
                   <View style={styles.row2}>
                     <View style={[styles.field, { flex: 1 }]}>
                       <Text style={styles.label}>Event Date *</Text>
                       <View style={styles.inputWrap}>
                         <Ionicons name="calendar-outline" size={16} color={Colors.textMuted} />
                         <TextInput style={styles.input} value={eventDate} onChangeText={setEventDate} placeholder="e.g. 2025-08-15" placeholderTextColor={Colors.textMuted} />
                       </View>
                     </View>
                     <View style={[styles.field, { flex: 1 }]}>
                       <Text style={styles.label}>Event Time *</Text>
                       <View style={styles.inputWrap}>
                         <Ionicons name="time-outline" size={16} color={Colors.textMuted} />
                         <TextInput style={styles.input} value={eventTime} onChangeText={setEventTime} placeholder="e.g. 2:00 PM" placeholderTextColor={Colors.textMuted} />
                       </View>
                     </View>
                   </View>
                   <Field label="Venue *" icon="location-outline" value={venue} onChangeText={setVenue} placeholder="e.g. KICC, Nairobi" />
                   <Field label="Keywords *" icon="search-outline" value={keywords} onChangeText={setKeywords} placeholder="e.g. Gospel Concert, Farmers Market, Business Expo, Rugby" />
                   <Field label="WhatsApp Number" icon="logo-whatsapp" value={whatsapp} onChangeText={setWhatsapp} placeholder="+254 7XX XXX XXX" keyboardType="phone-pad" />
                   <Field label="Email Address" icon="mail-outline" value={email} onChangeText={setEmail} placeholder="info@yourevent.co.ke" keyboardType="email-address" />
                 </View>
               )}

               {availableTags.length > 0 && (
                 <View style={styles.field}>
                   <Text style={styles.label}>Tags <Text style={{ color: Colors.textMuted }}>(select up to 6)</Text></Text>
                   <View style={styles.tagsWrap}>
                     {availableTags.map((tag) => (
                       <TouchableOpacity
                         key={tag}
                         style={[styles.tagChip, selectedTags.includes(tag) && styles.tagChipActive]}
                         onPress={() => toggleTag(tag)}
                       >
                         {selectedTags.includes(tag) && <Ionicons name="checkmark" size={12} color={Colors.gold} />}
                         <Text style={[styles.tagText, selectedTags.includes(tag) && { color: Colors.gold }]}>{tag}</Text>
                       </TouchableOpacity>
                     ))}
                   </View>
                 </View>
               )}

              {error ? <ErrorBox message={error} /> : null}

              <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
                <Text style={styles.primaryBtnText}>Add Photos & Publish</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.darkBg} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ─── STEP 3: PHOTOS & PUBLISH ─── */}
        {step === 3 && (
          <View>
            <Text style={styles.stepTitle}>Photos & Publish</Text>
            <Text style={styles.stepSubtitle}>Add up to {maxPhotos} photos. Listings with photos get 3× more views!</Text>

            <View style={styles.photoGrid}>
              {photos.map((uri, i) => (
                <View key={i} style={styles.photoThumb}>
                  <Image source={{ uri }} style={styles.photoImg} contentFit="cover" />
                  {i === 0 && (
                    <View style={styles.photoCoverBadge}>
                      <Text style={styles.photoCoverText}>Cover</Text>
                    </View>
                  )}
                  <TouchableOpacity style={styles.photoRemoveBtn} onPress={() => removePhoto(i)}>
                    <Ionicons name="close" size={12} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              {photos.length < maxPhotos && (
                <View style={styles.photoAddRow}>
                  <TouchableOpacity style={styles.photoAddBtn} onPress={pickPhoto}>
                    <Ionicons name="images-outline" size={24} color={Colors.gold} />
                    <Text style={styles.photoAddText}>Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.photoAddBtn} onPress={takePhoto}>
                    <Ionicons name="camera-outline" size={24} color={Colors.gold} />
                    <Text style={styles.photoAddText}>Camera</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {photos.length === 0 && (
              <View style={styles.noPhotosHint}>
                <Ionicons name="image-outline" size={38} color={Colors.textMuted} />
                <Text style={styles.noPhotosText}>No photos added yet</Text>
                <Text style={styles.noPhotosSubText}>Photos are optional but strongly recommended</Text>
              </View>
            )}

            {/* Availability */}
            <View style={styles.availRow}>
              <View style={styles.availInfo}>
                <View style={[styles.availDot, { backgroundColor: available ? "#5ADE8A" : Colors.textMuted }]} />
                <View>
                  <Text style={styles.availTitle}>{available ? "Available Now" : "Not Available"}</Text>
                  <Text style={styles.availSub}>Listing will show {available ? "as active" : "as unavailable"}</Text>
                </View>
              </View>
              <Switch
                value={available}
                onValueChange={setAvailable}
                trackColor={{ false: Colors.darkCardElevated, true: Colors.green }}
                thumbColor={available ? Colors.gold : Colors.textMuted}
              />
            </View>

            {/* Preview card */}
            <View style={styles.previewCard}>
              <Text style={styles.previewLabel}>Preview</Text>
              <View style={styles.previewContent}>
                {photos[0] ? (
                  <Image source={{ uri: photos[0] }} style={styles.previewImg} contentFit="cover" />
                ) : (
                  <View style={[styles.previewImg, { backgroundColor: selectedCategory?.color ?? Colors.darkCardElevated, alignItems: "center", justifyContent: "center" }]}>
                    {selectedCategory ? (
                      selectedCategory.iconSet === "MaterialIcons"
                        ? <MaterialIcons name={selectedCategory.icon as any} size={28} color={selectedCategory.accentColor} />
                        : <Ionicons name={selectedCategory.icon as any} size={28} color={selectedCategory.accentColor} />
                    ) : <Ionicons name="image-outline" size={28} color={Colors.textMuted} />}
                  </View>
                )}
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.previewTitle} numberOfLines={1}>{title || "Your listing title"}</Text>
                  <Text style={styles.previewSubtitle} numberOfLines={1}>{subtitle || "Short description"}</Text>
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    <Text style={styles.previewLocation}><Ionicons name="location-outline" size={11} /> {location || "Location"}</Text>
                    {price ? <Text style={styles.previewPrice}>KSh {price}</Text> : null}
                  </View>
                </View>
              </View>
            </View>

            {error ? <ErrorBox message={error} /> : null}

            <TouchableOpacity
              style={[styles.publishBtn, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.darkBg} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.darkBg} />
                  <Text style={styles.primaryBtnText}>Publish Listing</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Field({ label, icon, ...props }: any) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons name={icon} size={17} color={Colors.textMuted} />
        <TextInput style={styles.input} placeholderTextColor={Colors.textMuted} {...props} />
      </View>
    </View>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <View style={styles.errorBox}>
      <Ionicons name="alert-circle-outline" size={16} color="#E85C5C" />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBg },
  nav: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 8 },
  navBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  navCenter: { flex: 1, alignItems: "center" },
  navTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.textPrimary },
  navStep: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted },
  progressTrack: { height: 3, backgroundColor: Colors.borderLight, marginHorizontal: 16, borderRadius: 2 },
  progressFill: { height: 3, backgroundColor: Colors.gold, borderRadius: 2 },
  scroll: { paddingHorizontal: 16, paddingTop: 20, gap: 0 },
  stepTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.textPrimary, letterSpacing: -0.4, marginBottom: 6 },
  stepSubtitle: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, marginBottom: 20 },
  categoryGrid: { gap: 10, marginBottom: 20 },
  catCard: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 14, position: "relative" },
  catCardActive: { borderColor: Colors.gold + "60", backgroundColor: Colors.green + "20" },
  catIcon: { width: 48, height: 48, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  catLabel: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.textPrimary, flex: 1 },
  catCount: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted, position: "absolute", right: 14, bottom: 14 },
  catCheck: { position: "absolute", top: 12, right: 12 },
  catBanner: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: Colors.darkCard, borderRadius: 12, padding: 10, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  catBannerIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  catBannerText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.textSecondary },
  form: { gap: 16 },
  field: { gap: 7 },
  label: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary, paddingLeft: 2 },
  inputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, gap: 10 },
  input: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textPrimary, padding: 0 },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  switchLabel: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textMuted },
  switchLabelActive: { color: Colors.gold, fontFamily: "Inter_600SemiBold" },
  kshLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.textMuted },
  charCount: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted, textAlign: "right", marginTop: 3 },
  row2: { flexDirection: "row", gap: 10 },
  pill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border },
  pillActive: { backgroundColor: Colors.gold + "20", borderColor: Colors.gold + "50" },
  pillText: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.textMuted },
  pillTextActive: { color: Colors.gold },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tagChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 10 },
  tagChipActive: { borderColor: Colors.gold + "50", backgroundColor: Colors.green + "25" },
  tagText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  photoThumb: { width: 100, height: 100, borderRadius: 14, overflow: "hidden", position: "relative" },
  photoImg: { width: "100%", height: "100%" },
  photoCoverBadge: { position: "absolute", bottom: 6, left: 6, backgroundColor: Colors.gold, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  photoCoverText: { fontFamily: "Inter_700Bold", fontSize: 9, color: Colors.darkBg },
  photoRemoveBtn: { position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" },
  photoAddRow: { gap: 10 },
  photoAddBtn: { width: 100, height: 100, borderRadius: 14, backgroundColor: Colors.darkCard, borderWidth: 1.5, borderColor: Colors.gold + "40", borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 6 },
  photoAddText: { fontFamily: "Inter_500Medium", fontSize: 11, color: Colors.gold },
  noPhotosHint: { alignItems: "center", paddingVertical: 24, gap: 8, backgroundColor: Colors.darkCard, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.borderLight },
  noPhotosText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.textSecondary },
  noPhotosSubText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted },
  availRow: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.darkCard, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  availInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  availDot: { width: 10, height: 10, borderRadius: 5 },
  availTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.textPrimary },
  availSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted },
  previewCard: { backgroundColor: Colors.darkCard, borderRadius: 16, borderWidth: 1, borderColor: Colors.gold + "30", padding: 14, marginBottom: 20 },
  previewLabel: { fontFamily: "Inter_500Medium", fontSize: 11, color: Colors.gold, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 },
  previewContent: { flexDirection: "row", gap: 12, alignItems: "center" },
  previewImg: { width: 56, height: 56, borderRadius: 14 },
  previewTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.textPrimary },
  previewSubtitle: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary },
  previewLocation: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted },
  previewPrice: { fontFamily: "Inter_700Bold", fontSize: 11, color: Colors.gold },
  primaryBtn: { backgroundColor: Colors.gold, borderRadius: 14, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 8 },
  publishBtn: { backgroundColor: Colors.gold, borderRadius: 14, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 },
  primaryBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.darkBg },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(232,92,92,0.1)", borderWidth: 1, borderColor: "rgba(232,92,92,0.3)", borderRadius: 12, padding: 12 },
  errorText: { fontFamily: "Inter_400Regular", fontSize: 13, color: "#E85C5C", flex: 1 },
  guestWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 32 },
  guestIcon: { width: 88, height: 88, borderRadius: 28, backgroundColor: Colors.green, borderWidth: 1, borderColor: Colors.gold + "40", alignItems: "center", justifyContent: "center" },
  guestTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.textPrimary },
  guestText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, textAlign: "center" },
  signInBtn: { backgroundColor: Colors.gold, borderRadius: 14, paddingVertical: 14, width: "100%", alignItems: "center" },
  signInBtnText: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.darkBg },
  registerBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: 14, paddingVertical: 14, width: "100%", alignItems: "center" },
  registerBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.textPrimary },
});
