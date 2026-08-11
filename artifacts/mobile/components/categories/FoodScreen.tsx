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

// Food — warm red/orange restaurant-style cards with cuisine tags
export default function FoodScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { getListingsByCategory, isSaved, toggleSaved, user } = useAppContext();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const allListings = useMemo(() => getListingsByCategory("food"), [getListingsByCategory]);
  const tags = CATEGORY_TAGS["food"] ?? [];
  const filtered = useMemo(() => selectedTag ? allListings.filter(l => l.tags.includes(selectedTag)) : allListings, [allListings, selectedTag]);

  const renderItem = ({ item }: { item: Listing }) => {
    const saved = isSaved(item.id);
    return (
      <TouchableOpacity style={s.card} onPress={() => router.push({ pathname: "/listing/[id]", params: { id: item.id } })} activeOpacity={0.88}>
        <View style={s.imageWrap}>
          {item.photos?.[0] ? (
            <Image source={{ uri: item.photos[0] }} style={s.image} contentFit="cover" transition={200} />
          ) : (
            <LinearGradient colors={["#5C1A1A", "#2A0A0A"]} style={s.imagePlaceholder}>
              <Ionicons name="restaurant" size={36} color="#E85C5C" />
            </LinearGradient>
          )}
          <LinearGradient colors={["transparent", "rgba(10,2,2,0.85)"]} style={StyleSheet.absoluteFill} />
          <TouchableOpacity style={s.saveBtn} onPress={() => { if (!user) { router.push("/auth"); return; } Haptics.selectionAsync(); toggleSaved(item.id); }}>
            <Ionicons name={saved ? "heart" : "heart-outline"} size={16} color={saved ? "#E85C5C" : "#fff"} />
          </TouchableOpacity>
          {item.badge && <View style={s.imageBadge}><Text style={s.imageBadgeText}>{item.badge}</Text></View>}
          <View style={s.imageBottom}>
            <Text style={s.imageTitle} numberOfLines={1}>{item.title}</Text>
            <View style={s.ratingPill}>
              <Ionicons name="star" size={10} color="#E8A84C" />
              <Text style={s.ratingText}>{item.rating > 0 ? item.rating.toFixed(1) : "New"}</Text>
            </View>
          </View>
        </View>
        <View style={s.cardBody}>
          <Text style={s.subtitle} numberOfLines={1}>{item.subtitle}</Text>
          <View style={s.tagsRow}>
            {item.tags.slice(0, 3).map(t => <View key={t} style={s.tag}><Text style={s.tagText}>{t}</Text></View>)}
          </View>
          <View style={s.cardFooter}>
            <View style={s.locationRow}>
              <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
              <Text style={s.locationText} numberOfLines={1}>{item.location}</Text>
            </View>
            <TouchableOpacity style={s.callBtn} onPress={() => Linking.openURL(`tel:${item.phone.replace(/\s/g, "")}`)}>
              <Ionicons name="call" size={13} color="#fff" />
              <Text style={s.callBtnText}>Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[s.container, { paddingTop: isWeb ? 67 : insets.top }]}>
      <LinearGradient colors={["#1A0808", "#0A0202"]} style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Food & Drinks</Text>
          <Text style={s.headerCount}>{filtered.length} places</Text>
        </View>
        <TouchableOpacity style={s.searchBtn} onPress={() => router.push("/search")}>
          <Ionicons name="search-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <FlatList horizontal data={[null, ...tags]} keyExtractor={i => i ?? "all"} showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterRow} style={s.filterScroll}
        renderItem={({ item }) => (
          <TouchableOpacity style={[s.filter, selectedTag === item && s.filterActive]} onPress={() => setSelectedTag(item)}>
            <Text style={[s.filterText, selectedTag === item && s.filterTextActive]}>{item ?? "All"}</Text>
          </TouchableOpacity>
        )} />

      <FlatList data={filtered} keyExtractor={i => i.id} renderItem={renderItem}
        contentContainerStyle={[s.list, { paddingBottom: isWeb ? 120 : 90 }]}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={s.empty}><Ionicons name="restaurant-outline" size={48} color={Colors.textMuted} /><Text style={s.emptyText}>No food listings yet</Text></View>}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0202" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(232,92,92,0.12)", borderWidth: 1, borderColor: "rgba(232,92,92,0.25)", alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#fff" },
  headerCount: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.4)" },
  searchBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(232,92,92,0.12)", borderWidth: 1, borderColor: "rgba(232,92,92,0.25)", alignItems: "center", justifyContent: "center" },
  filterScroll: { maxHeight: 48, backgroundColor: "#120404" },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingVertical: 8 },
  filter: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: "rgba(232,92,92,0.07)", borderWidth: 1, borderColor: "rgba(232,92,92,0.15)" },
  filterActive: { backgroundColor: "rgba(232,92,92,0.2)", borderColor: "#E85C5C" },
  filterText: { fontFamily: "Inter_500Medium", fontSize: 12, color: "rgba(255,255,255,0.5)" },
  filterTextActive: { color: "#E85C5C" },
  list: { paddingHorizontal: 16, paddingTop: 12 },
  card: { backgroundColor: "#120404", borderRadius: 18, borderWidth: 1, borderColor: "rgba(232,92,92,0.12)", overflow: "hidden" },
  imageWrap: { width: "100%", height: 170, position: "relative", justifyContent: "flex-end", padding: 12 },
  image: { ...StyleSheet.absoluteFillObject },
  imagePlaceholder: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  saveBtn: { position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  imageBadge: { position: "absolute", top: 12, left: 12, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: "rgba(232,92,92,0.4)" },
  imageBadgeText: { fontFamily: "Inter_700Bold", fontSize: 9, color: "#E85C5C" },
  imageBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  imageTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#fff", flex: 1 },
  ratingPill: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  ratingText: { fontFamily: "Inter_700Bold", fontSize: 11, color: "#E8A84C" },
  cardBody: { padding: 12, gap: 6 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.55)" },
  tagsRow: { flexDirection: "row", gap: 6 },
  tag: { backgroundColor: "rgba(232,92,92,0.1)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: "rgba(232,92,92,0.2)" },
  tagText: { fontFamily: "Inter_500Medium", fontSize: 11, color: "#E85C5C" },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 3, flex: 1 },
  locationText: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted },
  callBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#E85C5C", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  callBtnText: { fontFamily: "Inter_700Bold", fontSize: 12, color: "#fff" },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.textMuted },
});
