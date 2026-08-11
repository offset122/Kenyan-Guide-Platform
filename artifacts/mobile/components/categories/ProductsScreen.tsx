import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Dimensions, Linking } from "react-native";
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

const { width } = Dimensions.get("window");
const CARD_W = (width - 44) / 2;

// Products — warm amber marketplace grid with image-first cards
export default function ProductsScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { getListingsByCategory, isSaved, toggleSaved, user } = useAppContext();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const allListings = useMemo(() => getListingsByCategory("products"), [getListingsByCategory]);
  const tags = CATEGORY_TAGS["products"] ?? [];
  const filtered = useMemo(() => selectedTag ? allListings.filter(l => l.tags.includes(selectedTag)) : allListings, [allListings, selectedTag]);

  const renderItem = ({ item }: { item: Listing }) => {
    const saved = isSaved(item.id);
    return (
      <TouchableOpacity style={s.card} onPress={() => router.push({ pathname: "/listing/[id]", params: { id: item.id } })} activeOpacity={0.88}>
        <View style={s.imageWrap}>
          {item.photos?.[0] ? (
            <Image source={{ uri: item.photos[0] }} style={s.image} contentFit="cover" transition={200} />
          ) : (
            <LinearGradient colors={["#5C3A1A", "#2A1A0A"]} style={s.imagePlaceholder}>
              <Ionicons name="storefront-outline" size={32} color="#E8A84C" />
            </LinearGradient>
          )}
          <LinearGradient colors={["transparent", "rgba(10,6,2,0.7)"]} style={StyleSheet.absoluteFill} />
          <TouchableOpacity style={s.saveBtn} onPress={() => { if (!user) { router.push("/auth"); return; } Haptics.selectionAsync(); toggleSaved(item.id); }}>
            <Ionicons name={saved ? "heart" : "heart-outline"} size={16} color={saved ? "#E85C5C" : "#fff"} />
          </TouchableOpacity>
          {item.badge && <View style={s.imageBadge}><Text style={s.imageBadgeText}>{item.badge}</Text></View>}
        </View>
        <View style={s.cardInfo}>
          <Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={s.cardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
          {item.price && <Text style={s.price}>{item.price}</Text>}
          <View style={s.cardFooter}>
            <View style={s.locationRow}>
              <Ionicons name="location-outline" size={10} color={Colors.textMuted} />
              <Text style={s.locationText} numberOfLines={1}>{item.location}</Text>
            </View>
            <TouchableOpacity style={s.callBtn} onPress={() => Linking.openURL(`tel:${item.phone.replace(/\s/g, "")}`)}>
              <Ionicons name="call" size={12} color="#E8A84C" />
            </TouchableOpacity>
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
        <Text style={s.headerTitle}>Marketplace</Text>
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
        numColumns={2} columnWrapperStyle={s.row}
        contentContainerStyle={[s.list, { paddingBottom: isWeb ? 120 : 90 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={s.empty}><Ionicons name="storefront-outline" size={48} color={Colors.textMuted} /><Text style={s.emptyText}>No products listed yet</Text></View>}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0602" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12, backgroundColor: "#120C04", borderBottomWidth: 1, borderBottomColor: "rgba(232,168,76,0.12)" },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(232,168,76,0.1)", borderWidth: 1, borderColor: "rgba(232,168,76,0.2)", alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.textPrimary },
  searchBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(232,168,76,0.1)", borderWidth: 1, borderColor: "rgba(232,168,76,0.2)", alignItems: "center", justifyContent: "center" },
  filterScroll: { maxHeight: 48, backgroundColor: "#120C04" },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingVertical: 8 },
  filter: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: "rgba(232,168,76,0.07)", borderWidth: 1, borderColor: "rgba(232,168,76,0.12)" },
  filterActive: { backgroundColor: "rgba(232,168,76,0.18)", borderColor: "#E8A84C" },
  filterText: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.textMuted },
  filterTextActive: { color: "#E8A84C" },
  list: { paddingHorizontal: 12, paddingTop: 12 },
  row: { gap: 10, marginBottom: 10 },
  card: { width: CARD_W, backgroundColor: "#120C04", borderRadius: 16, borderWidth: 1, borderColor: "rgba(232,168,76,0.12)", overflow: "hidden" },
  imageWrap: { width: "100%", height: 150, position: "relative" },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  saveBtn: { position: "absolute", top: 8, right: 8, width: 30, height: 30, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  imageBadge: { position: "absolute", top: 8, left: 8, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: "rgba(232,168,76,0.3)" },
  imageBadgeText: { fontFamily: "Inter_700Bold", fontSize: 9, color: "#E8A84C" },
  cardInfo: { padding: 10, gap: 3 },
  cardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.textPrimary, lineHeight: 18 },
  cardSubtitle: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textSecondary },
  price: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#E8A84C", marginTop: 2 },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 2, flex: 1 },
  locationText: { fontFamily: "Inter_400Regular", fontSize: 10, color: Colors.textMuted },
  callBtn: { width: 26, height: 26, borderRadius: 8, backgroundColor: "rgba(232,168,76,0.12)", borderWidth: 1, borderColor: "rgba(232,168,76,0.25)", alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.textMuted },
});
