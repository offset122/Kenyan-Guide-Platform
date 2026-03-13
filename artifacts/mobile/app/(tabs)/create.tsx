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

import { Colors } from "@/constants/colors";
import { CATEGORIES, CATEGORY_TAGS, KENYAN_COUNTIES } from "@/constants/data";
import { useAppContext } from "@/context/AppContext";

export default function CreateListingScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const { user, addListing } = useAppContext();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState(user?.phone ?? "+254 ");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: topPadding }]}>
        <View style={styles.guestWrap}>
          <View style={styles.guestIcon}>
            <Ionicons name="lock-closed" size={40} color={Colors.gold} />
          </View>
          <Text style={styles.guestTitle}>Sign In Required</Text>
          <Text style={styles.guestText}>Create an account to post listings for free</Text>
          <TouchableOpacity style={styles.signInBtn} onPress={() => router.push("/auth/index")}>
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerBtn} onPress={() => router.push("/auth/signup")}>
            <Text style={styles.registerBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (success) {
    return (
      <View style={[styles.container, styles.successContainer, { paddingTop: topPadding }]}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={64} color={Colors.gold} />
        </View>
        <Text style={styles.successTitle}>Listing Published!</Text>
        <Text style={styles.successText}>Your listing is now live on My Kenyan Guide</Text>
        <TouchableOpacity style={styles.viewListingBtn} onPress={() => { setSuccess(false); setStep(1); router.push("/my-listings"); }}>
          <Text style={styles.viewListingBtnText}>View My Listings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addAnotherBtn} onPress={() => {
          setSuccess(false);
          setStep(1);
          setCategoryId("");
          setTitle("");
          setSubtitle("");
          setDescription("");
          setLocation("");
          setPrice("");
          setPhone(user?.phone ?? "+254 ");
          setSelectedTags([]);
          setAvailable(true);
        }}>
          <Text style={styles.addAnotherBtnText}>Add Another Listing</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 5 ? [...prev, tag] : prev
    );
  };

  const validateStep = (): string | null => {
    if (step === 1 && !categoryId) return "Please select a category";
    if (step === 2) {
      if (!title.trim()) return "Title is required";
      if (!subtitle.trim()) return "Subtitle/Tagline is required";
      if (!description.trim() || description.length < 20) return "Description must be at least 20 characters";
    }
    if (step === 3) {
      if (!location.trim()) return "Location is required";
      if (!phone.trim() || phone.trim().length < 8) return "Valid phone number is required";
      if (selectedTags.length === 0) return "Add at least one tag";
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    if (step < 3) setStep((s) => (s + 1) as any);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await addListing({
        categoryId,
        title: title.trim(),
        subtitle: subtitle.trim(),
        description: description.trim(),
        location: location.trim(),
        price: price.trim() || undefined,
        phone: phone.trim(),
        tags: selectedTags,
        available,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccess(true);
    } catch (e) {
      setError("Failed to create listing. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const tags = categoryId ? CATEGORY_TAGS[categoryId] ?? [] : [];

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        {step > 1 ? (
          <TouchableOpacity style={styles.backBtn} onPress={() => { setStep((s) => (s - 1) as any); setError(""); }}>
            <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        ) : <View style={{ width: 38 }} />}
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Post a Listing</Text>
          <Text style={styles.headerStep}>Step {step} of 3</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Category</Text>
            <Text style={styles.sectionSubtitle}>What type of listing is this?</Text>
            <View style={styles.categoryList}>
              {CATEGORIES.map((cat) => {
                const Icon = cat.iconSet === "MaterialIcons" ? MaterialIcons : Ionicons;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catCard, categoryId === cat.id && styles.catCardActive]}
                    onPress={() => { setCategoryId(cat.id); setSelectedTags([]); }}
                  >
                    <View style={[styles.catIcon, { backgroundColor: cat.color }]}>
                      {/* @ts-ignore */}
                      <Icon name={cat.icon} size={22} color={cat.accentColor} />
                    </View>
                    <View style={styles.catInfo}>
                      <Text style={[styles.catTitle, categoryId === cat.id && { color: Colors.gold }]}>{cat.title}</Text>
                      <Text style={styles.catDesc}>{cat.description.substring(0, 60)}...</Text>
                    </View>
                    {categoryId === cat.id && (
                      <Ionicons name="checkmark-circle" size={22} color={Colors.gold} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Listing Details</Text>
            <Text style={styles.sectionSubtitle}>Describe what you're offering</Text>
            <View style={styles.form}>
              <FormField label="Title *" placeholder="e.g. John Kamau – Electrician" value={title} onChangeText={setTitle} maxLength={60} />
              <FormField label="Tagline *" placeholder="e.g. Certified residential & commercial" value={subtitle} onChangeText={setSubtitle} maxLength={80} />
              <View style={styles.field}>
                <Text style={styles.label}>Description *</Text>
                <View style={[styles.inputWrap, { alignItems: "flex-start", paddingVertical: 12 }]}>
                  <TextInput
                    style={[styles.input, { height: 120, textAlignVertical: "top" }]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Describe your service, experience, and what makes you unique..."
                    placeholderTextColor={Colors.textMuted}
                    multiline
                    maxLength={500}
                  />
                </View>
                <Text style={styles.charCount}>{description.length}/500 (min 20)</Text>
              </View>
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact & Details</Text>
            <Text style={styles.sectionSubtitle}>Help people reach you</Text>
            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Location *</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="location-outline" size={18} color={Colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    value={location}
                    onChangeText={setLocation}
                    placeholder="Area, Town, County"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }} contentContainerStyle={{ gap: 6 }}>
                  {KENYAN_COUNTIES.slice(0, 8).map((c) => (
                    <TouchableOpacity key={c} style={[styles.pill, location === c && styles.pillActive]} onPress={() => setLocation(c)}>
                      <Text style={[styles.pillText, location === c && styles.pillTextActive]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <FormField label="Phone Number *" placeholder="+254 7XX XXX XXX" value={phone} onChangeText={setPhone} keyboardType="phone-pad" icon="call-outline" />
              <FormField label="Price / Rate (Optional)" placeholder="e.g. KSh 2,500/hr, KSh 45,000/mo" value={price} onChangeText={setPrice} icon="pricetag-outline" />

              {/* Tags */}
              <View style={styles.field}>
                <Text style={styles.label}>Tags * (up to 5)</Text>
                <View style={styles.tagsWrap}>
                  {tags.map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      style={[styles.tagChip, selectedTags.includes(tag) && styles.tagChipActive]}
                      onPress={() => toggleTag(tag)}
                    >
                      <Text style={[styles.tagChipText, selectedTags.includes(tag) && styles.tagChipTextActive]}>{tag}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Availability */}
              <View style={styles.availableRow}>
                <View>
                  <Text style={styles.label}>Available Now</Text>
                  <Text style={styles.availableDesc}>Show as immediately available</Text>
                </View>
                <Switch
                  value={available}
                  onValueChange={setAvailable}
                  trackColor={{ false: Colors.darkCardElevated, true: Colors.green }}
                  thumbColor={available ? Colors.gold : Colors.textMuted}
                />
              </View>
            </View>
          </View>
        )}

        {error ? (
          <View style={styles.errorWrap}>
            <Ionicons name="alert-circle-outline" size={16} color="#E85C5C" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.nextBtn, loading && { opacity: 0.7 }]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color={Colors.darkBg} /> : (
            <>
              <Text style={styles.nextBtnText}>{step === 3 ? "Publish Listing" : "Continue"}</Text>
              <Ionicons name={step === 3 ? "checkmark" : "arrow-forward"} size={18} color={Colors.darkBg} />
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: isWeb ? 120 : 80 }} />
      </ScrollView>
    </View>
  );
}

function FormField({ label, value, onChangeText, placeholder, maxLength, icon, keyboardType, secureTextEntry }: {
  label: string; value: string; onChangeText: (t: string) => void;
  placeholder?: string; maxLength?: number; icon?: string;
  keyboardType?: any; secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        {icon && <Ionicons name={icon as any} size={18} color={Colors.textMuted} />}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          maxLength={maxLength}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
        />
      </View>
      {maxLength && <Text style={styles.charCount}>{value.length}/{maxLength}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBg },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, justifyContent: "space-between" },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
  },
  headerCenter: { alignItems: "center" },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.textPrimary },
  headerStep: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  progressBar: { height: 3, backgroundColor: Colors.darkCard, marginHorizontal: 16, borderRadius: 2, marginBottom: 20 },
  progressFill: { height: 3, backgroundColor: Colors.gold, borderRadius: 2 },
  scrollContent: { paddingHorizontal: 16 },
  section: { gap: 0 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.textPrimary, marginBottom: 4 },
  sectionSubtitle: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, marginBottom: 20 },
  categoryList: { gap: 10 },
  catCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 16, padding: 14,
  },
  catCardActive: { borderColor: Colors.gold + "60", backgroundColor: Colors.green + "20" },
  catIcon: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  catInfo: { flex: 1 },
  catTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.textPrimary },
  catDesc: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  form: { gap: 18 },
  field: { gap: 8 },
  label: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary, paddingLeft: 4 },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, gap: 10,
  },
  input: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textPrimary, padding: 0 },
  charCount: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted, textAlign: "right" },
  pill: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  pillActive: { backgroundColor: Colors.gold + "20", borderColor: Colors.gold },
  pillText: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.textMuted },
  pillTextActive: { color: Colors.gold },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tagChip: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  tagChipActive: { backgroundColor: Colors.green + "40", borderColor: Colors.green },
  tagChipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textMuted },
  tagChipTextActive: { color: Colors.textPrimary },
  availableRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 14, padding: 16,
  },
  availableDesc: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  errorWrap: {
    flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12,
    backgroundColor: "rgba(232,92,92,0.1)", borderWidth: 1, borderColor: "rgba(232,92,92,0.3)",
    borderRadius: 10, padding: 12,
  },
  errorText: { fontFamily: "Inter_400Regular", fontSize: 13, color: "#E85C5C", flex: 1 },
  nextBtn: {
    backgroundColor: Colors.gold, borderRadius: 14, paddingVertical: 16,
    alignItems: "center", justifyContent: "center",
    flexDirection: "row", gap: 8, marginTop: 24,
  },
  nextBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.darkBg },
  guestWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 16 },
  guestIcon: {
    width: 88, height: 88, borderRadius: 28, backgroundColor: Colors.green,
    borderWidth: 1, borderColor: Colors.gold + "40", alignItems: "center", justifyContent: "center",
  },
  guestTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.textPrimary },
  guestText: { fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textMuted, textAlign: "center" },
  signInBtn: { backgroundColor: Colors.gold, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 48, width: "100%", alignItems: "center" },
  signInBtnText: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.darkBg },
  registerBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 48, width: "100%", alignItems: "center" },
  registerBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.textPrimary },
  successContainer: { alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 32 },
  successIcon: { marginBottom: 8 },
  successTitle: { fontFamily: "Inter_700Bold", fontSize: 24, color: Colors.textPrimary },
  successText: { fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textMuted, textAlign: "center" },
  viewListingBtn: { backgroundColor: Colors.gold, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, width: "100%", alignItems: "center" },
  viewListingBtnText: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.darkBg },
  addAnotherBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, width: "100%", alignItems: "center" },
  addAnotherBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.textPrimary },
});
