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

// Automobiles — dark cyan/steel car dealership style with wide image cards
export default function AutomobilesScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { getListingsByCategory, isSaved, toggleSaved, user } = useAppContext();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const allListings = useMemo(() => getListingsByCategory("automobiles"), [getListingsByCategory]);
  const tags = CATEGORY_TAGS["automobiles"] ?? [];
  const filtered = useMemo(() => selectedTag ? allListings.filter(l => l.tags.includes(selectedTag)) : allListings, [allListings, selectedTag]);

  const renderItem = ({ item }: { item: Listing }) => {
    const saved = isSaved(item.id);
    return (
      <TouchableOpacity style={s.card} onPress={() => router.push({ pathname: "/listing/[id]", params: { id: item.id } })} activeOpacity={0.88}>
        <View style={s.imageWrap}>
          {item.photos?.[0] ? (
            <Image source={{ uri: item.photos[0] }} style={s.image} contentFit="cover" transition={200} />
          ) : (
            <LinearGradient colors={["#0A1E2A", "#050E14"]} style={s.imagePlaceholder}>
              <Ionicons name="car" size={44} color="#5CC8E8" />
            </LinearGradient>
          )}
          <LinearGradient colors={["transparent", "rgba(5,14,20,0.9)"]} style={StyleSheet.absoluteFill} />
          <TouchableOpacity style={s.saveBtn} onPress={() => { if (!user) { router.push("/auth"); return; } Haptics.selectionAsync(); toggleSaved(item.id); }}>
            <Ionicons name={saved ? "heart" : "heart-outline"} size={16} color={saved ? "#E85C5C" : "#fff"} />
          </TouchableOpacity>
          {item.badge && <View style={s.imageBadge}><Text style={s.imageBadgeText}>{item.badge}</Text></View>}
          <View style={s.imageBottom}>
            <View>
              <Text style={s.imageTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={s.imageSubtitle} numberOfLines={1}>{item.subtitle}</Text>
            </View>
            {item.price && <Text style={s.imagePrice}>{item.price}</Text>}
          </View>
        </View>
        <View style={s.cardBody}>
          <View style={s.specRow}>
            {item.tags.slice(0, 3).map(t => (
              <View key={t} style={s.spec}>
                <Text style={s.specText}>{t}</Text>
              </View>
            ))}
          </View>
          <View style={s.cardFooter}>
            <View style={s.locationRow}>
              <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
              <Text style={s.locationText} numberOfLines={1}>{item.location}</Text>
              {item.rating > 0 && <>
                <Ionicons name="star" size={11} color="#5CC8E8" />
                <Text style={s.ratingText}>{item.rating.toFixed(1)}</Text>
              </>}
            </View>
            <View style={s.actions}>
              <TouchableOpacity style={s.msgBtn} onPress={() => router.push({ pathname: "/listing/[id]", params: { id: item.id } })}>
                <Ionicons name="chatbubble-outline" size={14} color="#5CC8E8" />
              </TouchableOpacity>
              <TouchableOpacity style={s.callBtn} onPress={() => Linking.openURL(`tel:${item.phone.replace(/\s/g, "")}`)}>
                <Ionicons name="call" size={14} color="#050E14" />
                <Text style={s.callBtnText}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[s.container, { paddingTop: isWeb ? 67 : insets.top }]}>
      <LinearGradient colors={["#050E14", "#080F0A"]} style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Automobiles & Bikes</Text>
          <Text style={s.headerCount}>{filtered.length} vehicles</Text>
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
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={s.empty}><Ionicons name="car-outline" size={48} color={Colors.textMuted} /><Text style={s.emptyText}>No vehicles listed yet</Text></View>}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050E14" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: "rgba(92,200,232,0.12)" },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(92,200,232,0.1)", borderWidth: 1, borderColor: "rgba(92,200,232,0.2)", alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#fff" },
  headerCount: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.4)" },
  searchBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(92,200,232,0.1)", borderWidth: 1, borderColor: "rgba(92,200,232,0.2)", alignItems: "center", justifyContent: "center" },
  filterScroll: { maxHeight: 48, backgroundColor: "#060F16" },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingVertical: 8 },
  filter: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: "rgba(92,200,232,0.07)", borderWidth: 1, borderColor: "rgba(92,200,232,0.12)" },
  filterActive: { backgroundColor: "rgba(92,200,232,0.18)", borderColor: "#5CC8E8" },
  filterText: { fontFamily: "Inter_500Medium", fontSize: 12, color: "rgba(255,255,255,0.5)" },
  filterTextActive: { color: "#5CC8E8" },
  list: { paddingHorizontal: 16, paddingTop: 12 },
  card: { backgroundColor: "#060F16", borderRadius: 20, borderWidth: 1, borderColor: "rgba(92,200,232,0.12)", overflow: "hidden" },
  imageWrap: { width: "100%", height: 200, position: "relative", justifyContent: "flex-end", padding: 14 },
  image: { ...StyleSheet.absoluteFillObject },
  imagePlaceholder: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  saveBtn: { position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: 11, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  imageBadge: { position: "absolute", top: 12, left: 12, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 7, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(92,200,232,0.35)" },
  imageBadgeText: { fontFamily: "Inter_700Bold", fontSize: 10, color: "#5CC8E8" },
  imageBottom: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  imageTitle: { fontFamily: "Inter_700Bold", fontSize: 17, color: "#fff" },
  imageSubtitle: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.6)" },
  imagePrice: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#5CC8E8" },
  cardBody: { padding: 12, gap: 8 },
  specRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  spec: { backgroundColor: "rgba(92,200,232,0.08)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: "rgba(92,200,232,0.15)" },
  specText: { fontFamily: "Inter_500Medium", fontSize: 11, color: "#5CC8E8" },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, flex: 1 },
  locationText: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted },
  ratingText: { fontFamily: "Inter_700Bold", fontSize: 11, color: "#5CC8E8" },
  actions: { flexDirection: "row", gap: 8 },
  msgBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(92,200,232,0.1)", borderWidth: 1, borderColor: "rgba(92,200,232,0.2)", alignItems: "center", justifyContent: "center" },
  callBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#5CC8E8", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  callBtnText: { fontFamily: "Inter_700Bold", fontSize: 12, color: "#050E14" },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.textMuted },
});
