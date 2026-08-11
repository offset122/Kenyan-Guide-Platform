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

// Services — navy/blue corporate horizontal cards with logo-style icons
export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { getListingsByCategory, isSaved, toggleSaved, user } = useAppContext();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const allListings = useMemo(() => getListingsByCategory("services"), [getListingsByCategory]);
  const tags = CATEGORY_TAGS["services"] ?? [];
  const filtered = useMemo(() => selectedTag ? allListings.filter(l => l.tags.includes(selectedTag)) : allListings, [allListings, selectedTag]);

  const renderItem = ({ item }: { item: Listing }) => {
    const saved = isSaved(item.id);
    return (
      <TouchableOpacity style={s.card} onPress={() => router.push({ pathname: "/listing/[id]", params: { id: item.id } })} activeOpacity={0.88}>
        <View style={s.cardLeft}>
          {item.photos?.[0] ? (
            <Image source={{ uri: item.photos[0] }} style={s.logo} contentFit="cover" />
          ) : (
            <View style={s.logoPlaceholder}>
              <Text style={s.logoText}>{item.title.slice(0, 2).toUpperCase()}</Text>
            </View>
          )}
        </View>
        <View style={s.cardBody}>
          <View style={s.cardTitleRow}>
            <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
            {item.verified && <Ionicons name="shield-checkmark" size={14} color="#6CA8E8" />}
          </View>
          <Text style={s.cardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
          <View style={s.tagRow}>
            {item.tags.slice(0, 2).map(t => <View key={t} style={s.tagChip}><Text style={s.tagChipText}>{t}</Text></View>)}
          </View>
          <View style={s.cardMeta}>
            <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
            <Text style={s.metaText} numberOfLines={1}>{item.location}</Text>
            {item.rating > 0 && <>
              <Ionicons name="star" size={11} color="#6CA8E8" />
              <Text style={[s.metaText, { color: "#6CA8E8" }]}>{item.rating.toFixed(1)}</Text>
            </>}
          </View>
        </View>
        <View style={s.cardRight}>
          <TouchableOpacity onPress={() => { if (!user) { router.push("/auth"); return; } Haptics.selectionAsync(); toggleSaved(item.id); }}>
            <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={18} color={saved ? "#6CA8E8" : Colors.textMuted} />
          </TouchableOpacity>
          {item.price && <Text style={s.price}>{item.price}</Text>}
          <TouchableOpacity style={s.callBtn} onPress={() => Linking.openURL(`tel:${item.phone.replace(/\s/g, "")}`)}>
            <Ionicons name="call" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[s.container, { paddingTop: isWeb ? 67 : insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Business Services</Text>
          <Text style={s.headerCount}>{filtered.length} companies</Text>
        </View>
        <TouchableOpacity style={s.searchBtn} onPress={() => router.push("/search")}>
          <Ionicons name="search-outline" size={20} color="#fff" />
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
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={s.empty}><Ionicons name="briefcase-outline" size={48} color={Colors.textMuted} /><Text style={s.emptyText}>No services listed yet</Text></View>}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080D14" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12, backgroundColor: "#0D1A2E", borderBottomWidth: 1, borderBottomColor: "rgba(108,168,232,0.15)" },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(108,168,232,0.1)", borderWidth: 1, borderColor: "rgba(108,168,232,0.2)", alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#fff" },
  headerCount: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.4)" },
  searchBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(108,168,232,0.1)", borderWidth: 1, borderColor: "rgba(108,168,232,0.2)", alignItems: "center", justifyContent: "center" },
  filterScroll: { maxHeight: 50, backgroundColor: "#0D1A2E" },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingVertical: 10 },
  filter: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: "rgba(108,168,232,0.08)", borderWidth: 1, borderColor: "rgba(108,168,232,0.15)" },
  filterActive: { backgroundColor: "rgba(108,168,232,0.2)", borderColor: "#6CA8E8" },
  filterText: { fontFamily: "Inter_500Medium", fontSize: 12, color: "rgba(255,255,255,0.5)" },
  filterTextActive: { color: "#6CA8E8" },
  list: { paddingHorizontal: 16, paddingTop: 12 },
  card: { flexDirection: "row", backgroundColor: "rgba(13,26,46,0.9)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(108,168,232,0.15)", padding: 14, gap: 12, alignItems: "center" },
  cardLeft: {},
  logo: { width: 52, height: 52, borderRadius: 14 },
  logoPlaceholder: { width: 52, height: 52, borderRadius: 14, backgroundColor: "#1A3A5C", alignItems: "center", justifyContent: "center" },
  logoText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#6CA8E8" },
  cardBody: { flex: 1, gap: 4 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#fff", flex: 1 },
  cardSubtitle: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.5)" },
  tagRow: { flexDirection: "row", gap: 5 },
  tagChip: { backgroundColor: "rgba(108,168,232,0.1)", borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2 },
  tagChipText: { fontFamily: "Inter_500Medium", fontSize: 10, color: "#6CA8E8" },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontFamily: "Inter_400Regular", fontSize: 11, color: "rgba(255,255,255,0.4)" },
  cardRight: { alignItems: "center", gap: 8 },
  price: { fontFamily: "Inter_700Bold", fontSize: 11, color: "#6CA8E8", textAlign: "center" },
  callBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: "#1A3A5C", borderWidth: 1, borderColor: "rgba(108,168,232,0.3)", alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.textMuted },
});
