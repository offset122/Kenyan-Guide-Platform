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
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";

import { Colors } from "@/constants/colors";
import { CATEGORY_TAGS, KENYAN_COUNTIES } from "@/constants/data";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { requestMediaLibraryPermission } from "@/lib/permissions";

const MAX_PHOTOS = 6;

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const { listings, user, updateListing } = useAppContext();
  const { success: toastSuccess, error: toastError } = useToast();

  const listing = listings.find((l) => l.id === id);

  const [title, setTitle] = useState(listing?.title ?? "");
  const [subtitle, setSubtitle] = useState(listing?.subtitle ?? "");
  const [description, setDescription] = useState(listing?.description ?? "");
  const [location, setLocation] = useState(listing?.location ?? "");
  const [price, setPrice] = useState(listing?.price ?? "");
  const [phone, setPhone] = useState(listing?.phone ?? "");
  const [selectedTags, setSelectedTags] = useState<string[]>(listing?.tags ?? []);
  const [available, setAvailable] = useState(listing?.available ?? true);
  const [photos, setPhotos] = useState<string[]>(listing?.photos ?? []);
  const [loading, setLoading] = useState(false);

  if (!listing || !user || listing.userId !== user.id) {
    return (
      <View style={[styles.container, { paddingTop: topPadding }]}>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.notFoundText}>Listing not found</Text>
          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backLinkText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const availableTags = CATEGORY_TAGS[listing.categoryId] ?? [];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag].slice(0, 6)
    );
  };

  const pickPhoto = async () => {
    if (photos.length >= MAX_PHOTOS) { toastError(`Maximum ${MAX_PHOTOS} photos`); return; }
    const permission = await requestMediaLibraryPermission({ showRationale: true });
    if (permission !== "granted") return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: MAX_PHOTOS - photos.length,
        quality: 0.8,
      });
      if (!result.canceled) {
        setPhotos((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, MAX_PHOTOS));
        Haptics.selectionAsync();
      }
    } catch { toastError("Could not open photo library"); }
  };

  const handleSave = async () => {
    if (!title.trim()) { toastError("Title is required"); return; }
    if (!description.trim() || description.trim().length < 20) { toastError("Description must be at least 20 characters"); return; }
    if (!location.trim()) { toastError("Location is required"); return; }
    if (!phone.trim()) { toastError("Phone number is required"); return; }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await updateListing(listing.id, {
        title: title.trim(),
        subtitle: subtitle.trim(),
        description: description.trim(),
        location: location.trim(),
        price: price.trim(),
        phone: phone.trim(),
        tags: selectedTags,
        available,
        photos,
      });
      toastSuccess("Listing updated!");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      toastError("Failed to update listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Listing</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: isWeb ? 40 : insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Field label="Title *" icon="text-outline" value={title} onChangeText={setTitle} placeholder="Listing title" />
        <Field label="Short Description *" icon="document-text-outline" value={subtitle} onChangeText={setSubtitle} placeholder="Brief description" />

        <View style={styles.field}>
          <Text style={styles.label}>Full Description *</Text>
          <View style={[styles.inputWrap, { alignItems: "flex-start", paddingTop: 12, paddingBottom: 12 }]}>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your listing in detail..."
              placeholderTextColor={Colors.textMuted}
              multiline
              maxLength={600}
            />
          </View>
          <Text style={styles.charCount}>{description.length}/600</Text>
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
            <Text style={styles.label}>Price</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.kshLabel}>KSh</Text>
              <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="e.g. 2,500/hr" placeholderTextColor={Colors.textMuted} />
            </View>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
          {KENYAN_COUNTIES.slice(0, 12).map((c) => (
            <TouchableOpacity key={c} style={[styles.pill, location.includes(c) && styles.pillActive]} onPress={() => setLocation(c)}>
              <Text style={[styles.pillText, location.includes(c) && styles.pillTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Field label="Contact Phone *" icon="call-outline" value={phone} onChangeText={setPhone} placeholder="+254 7XX XXX XXX" keyboardType="phone-pad" />

        {availableTags.length > 0 && (
          <View style={styles.field}>
            <Text style={styles.label}>Tags <Text style={{ color: Colors.textMuted }}>(up to 6)</Text></Text>
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

        <View style={styles.field}>
          <Text style={styles.label}>Photos</Text>
          <View style={styles.photoGrid}>
            {photos.map((uri, i) => (
              <View key={i} style={styles.photoThumb}>
                <Image source={{ uri }} style={styles.photoImg} contentFit="cover" />
                {i === 0 && (
                  <View style={styles.photoCoverBadge}>
                    <Text style={styles.photoCoverText}>Cover</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.photoRemoveBtn}
                  onPress={() => { Haptics.selectionAsync(); setPhotos((prev) => prev.filter((_, idx) => idx !== i)); }}
                >
                  <Ionicons name="close" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {photos.length < MAX_PHOTOS && (
              <TouchableOpacity style={styles.photoAddBtn} onPress={pickPhoto}>
                <Ionicons name="add" size={24} color={Colors.gold} />
                <Text style={styles.photoAddText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.availRow}>
          <View style={styles.availInfo}>
            <View style={[styles.availDot, { backgroundColor: available ? "#5ADE8A" : Colors.textMuted }]} />
            <View>
              <Text style={styles.availTitle}>{available ? "Available Now" : "Not Available"}</Text>
              <Text style={styles.availSub}>Listing shows as {available ? "active" : "paused"}</Text>
            </View>
          </View>
          <Switch
            value={available}
            onValueChange={setAvailable}
            trackColor={{ false: Colors.darkCardElevated, true: Colors.green }}
            thumbColor={available ? Colors.gold : Colors.textMuted}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.darkBg} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={Colors.darkBg} />
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBg },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, justifyContent: "space-between" },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.textPrimary },
  scroll: { paddingHorizontal: 16, paddingTop: 8, gap: 16 },
  field: { gap: 7 },
  label: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary, paddingLeft: 2 },
  inputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, gap: 10 },
  input: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textPrimary, padding: 0 },
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
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  photoThumb: { width: 90, height: 90, borderRadius: 12, overflow: "hidden", position: "relative" },
  photoImg: { width: "100%", height: "100%" },
  photoCoverBadge: { position: "absolute", bottom: 5, left: 5, backgroundColor: Colors.gold, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2 },
  photoCoverText: { fontFamily: "Inter_700Bold", fontSize: 9, color: Colors.darkBg },
  photoRemoveBtn: { position: "absolute", top: 5, right: 5, width: 20, height: 20, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" },
  photoAddBtn: { width: 90, height: 90, borderRadius: 12, backgroundColor: Colors.darkCard, borderWidth: 1.5, borderColor: Colors.gold + "40", borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 4 },
  photoAddText: { fontFamily: "Inter_500Medium", fontSize: 11, color: Colors.gold },
  availRow: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.darkCard, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.border },
  availInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  availDot: { width: 10, height: 10, borderRadius: 5 },
  availTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.textPrimary },
  availSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted },
  saveBtn: { backgroundColor: Colors.gold, borderRadius: 14, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 8 },
  saveBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.darkBg },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  notFoundText: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: Colors.textPrimary },
  backLink: { backgroundColor: Colors.gold, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20 },
  backLinkText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.darkBg },
});
