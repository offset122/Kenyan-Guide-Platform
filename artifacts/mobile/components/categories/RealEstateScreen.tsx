import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Linking } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { CATEGORY_TAGS } from "@/constants/data";
import { useAppContext } from "@/context/AppContext";
import { Listing } from "@/context/AppContext";

// Real Estate — clean property listing cards with large images and price prominence
export default function RealEstateScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { getListingsByCategory, isSaved, toggleSaved, user } = useAppContext();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const allListings = useMemo(() => getListingsByCategory("realestate"), [getListingsByCategory]);
  const tags = CATEGORY_TAGS["realestate"] ?? [];
  const filtered = useMemo(() => selectedTag ? allListings.filter(l => l.tags.includes(selectedTag)) : allListings, [allListings, selectedTag]);

  const renderItem = ({ item }: { item: Listing }) => {
    const saved = isSaved(item.id);
    return (
      <TouchableOpacity style={s.card} onPress={() => router.push({ pathname: "/listing/[id]", params: { id: item.id } })} activeOpacity={0.88}>
        <View style={s.imageWrap}>
          {item.photos?.[0] ? (
            <Image source={{ uri: item.photos[0] }} style={s.image} contentFit="cover" transition={200} />
          ) : (
            <LinearGradient colors={["#1A3A1A", "#0A1A0A"]} style={s.imagePlaceholder}>
              <Ionicons name="home" size={40} color="#88C84C" />
            </LinearGradient>
          )}
          <LinearGradient colors={["rgba(0,0,0,0.3)", "transparent", "rgba(0,0,0,0.6)"]} style={StyleSheet.absoluteFill} />
          <TouchableOpacity style={s.saveBtn} onPress={() => { if (!user) { router.push("/auth"); return; } Haptics.selectionAsync(); toggleSaved(item.id); }}>
            <Ionicons name={saved ? "heart" : "heart-outline"} size={16} color={saved ? "#E85C5C" : "#fff"} />
          </TouchableOpacity>
          {item.badge && <View style={s.imageBadge}><Text style={s.imageBadgeText}>{item.badge}</Text></View>}
          {item.photos && item.photos.length > 1 && (
            <View style={s.photoCount}>
              <Ionicons name="images-outline" size={11} color="#fff" />
              <Text style={s.photoCountText}>{item.photos.length}</Text>
            </View>
          )}
        </View>
        <View style={s.cardBody}>
          <View style={s.priceRow}>
            <Text style={s.price}>{item.price ?? "Price on request"}</Text>
            {item.verified && <View style={s.verifiedPill}><Ionicons name="shield-checkmark" size={11} color="#88C84C" /><Text style={s.verifiedText}>Verified</Text></View>}
          </View>
          <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={s.cardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
          <View style={s.featureRow}>
            {item.tags.slice(0, 3).map(t => (
              <View key={t} style={s.feature}>
                <Ionicons name="checkmark-circle" size={12} color="#88C84C" />
                <Text style={s.featureText}>{t}</Text>
              </View>
            ))}
          </View>
          <View style={s.cardFooter}>
            <View style={s.locationRow}>
              <Ionicons name="location" size={12} color="#88C84C" />
              <Text style={s.locationText} numberOfLines={1}>{item.location}</Text>
            </View>
            <View style={s.footerActions}>
              <TouchableOpacity style={s.msgBtn} onPress={() => router.push({ pathname: "/listing/[id]", params: { id: item.id } })}>
                <Ionicons name="chatbubble-outline" size={14} color="#88C84C" />
              </TouchableOpacity>
              <TouchableOpacity style={s.callBtn} onPress={() => Linking.openURL(`tel:${item.phone.replace(/\s/g, "")}`)}>
                <Ionicons name="call" size={14} color="#fff" />
                <Text style={s.callBtnText}>Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[s.container, { paddingTop: isWeb ? 67 : insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Rentals & Real Estate</Text>
          <Text style={s.headerCount}>{filtered.length} properties</Text>
        </View>
        <TouchableOpacity style={s.searchBtn} onPress={() => router.push("/search")}>
          <Ionicons name="search-outline" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <FlatList horizontal data={[null, ...tags]} keyExtractor={i => i ?? "all"} showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterRow} style={s.filterScroll}
        renderItem={({ item }) => (
          <TouchableOpacity style={[s.filter, selectedTag === item && s.filterActive]} onPress={() => setSelectedTag(item)}>
            <Text style={[s.filterText, selectedTag === item && s.filterTextActive]}>{item ?? "All"}</Text>
          </TouchableOpacity>
        )} />

      <FlatList data={filtered} keyExtractor={i => i.id} renderItem={renderItem}
        contentContainerStyle={[s.list, { paddingBottom: isWeb ? 120 : 90 }]}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={s.empty}><Ionicons name="home-outline" size={48} color={Colors.textMuted} /><Text style={s.emptyText}>No properties listed yet</Text></View>}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#060E06" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12, backgroundColor: "#0A140A", borderBottomWidth: 1, borderBottomColor: "rgba(136,200,76,0.12)" },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(136,200,76,0.08)", borderWidth: 1, borderColor: "rgba(136,200,76,0.2)", alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.textPrimary },
  headerCount: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted },
  searchBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(136,200,76,0.08)", borderWidth: 1, borderColor: "rgba(136,200,76,0.2)", alignItems: "center", justifyContent: "center" },
  filterScroll: { maxHeight: 48, backgroundColor: "#0A140A" },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingVertical: 8 },
  filter: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: "rgba(136,200,76,0.06)", borderWidth: 1, borderColor: "rgba(136,200,76,0.12)" },
  filterActive: { backgroundColor: "rgba(136,200,76,0.15)", borderColor: "#88C84C" },
  filterText: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.textMuted },
  filterTextActive: { color: "#88C84C" },
  list: { paddingHorizontal: 16, paddingTop: 12 },
  card: { backgroundColor: "#0A140A", borderRadius: 20, borderWidth: 1, borderColor: "rgba(136,200,76,0.12)", overflow: "hidden" },
  imageWrap: { width: "100%", height: 210, position: "relative" },
  image: { ...StyleSheet.absoluteFillObject },
  imagePlaceholder: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  saveBtn: { position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: 11, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  imageBadge: { position: "absolute", top: 12, left: 12, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 7, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(136,200,76,0.4)" },
  imageBadgeText: { fontFamily: "Inter_700Bold", fontSize: 10, color: "#88C84C" },
  photoCount: { position: "absolute", bottom: 12, right: 12, flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  photoCountText: { fontFamily: "Inter_600SemiBold", fontSize: 10, color: "#fff" },
  cardBody: { padding: 14, gap: 6 },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  price: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#88C84C" },
  verifiedPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(136,200,76,0.1)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(136,200,76,0.25)" },
  verifiedText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "#88C84C" },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.textPrimary },
  cardSubtitle: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary },
  featureRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  feature: { flexDirection: "row", alignItems: "center", gap: 4 },
  featureText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTopWidth: 1, borderTopColor: "rgba(136,200,76,0.08)" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, flex: 1 },
  locationText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted },
  footerActions: { flexDirection: "row", gap: 8, alignItems: "center" },
  msgBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(136,200,76,0.1)", borderWidth: 1, borderColor: "rgba(136,200,76,0.2)", alignItems: "center", justifyContent: "center" },
  callBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#88C84C", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  callBtnText: { fontFamily: "Inter_700Bold", fontSize: 12, color: "#0A140A" },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.textMuted },
});
