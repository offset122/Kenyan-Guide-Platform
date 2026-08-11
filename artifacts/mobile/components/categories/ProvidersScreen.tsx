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

// Providers — dark teal/gold professional card layout with avatar focus
export default function ProvidersScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { getListingsByCategory, isSaved, toggleSaved, user } = useAppContext();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const allListings = useMemo(() => getListingsByCategory("providers"), [getListingsByCategory]);
  const tags = CATEGORY_TAGS["providers"] ?? [];
  const filtered = useMemo(() => selectedTag ? allListings.filter(l => l.tags.includes(selectedTag)) : allListings, [allListings, selectedTag]);

  const renderItem = ({ item }: { item: Listing }) => {
    const saved = isSaved(item.id);
    return (
      <TouchableOpacity style={s.card} onPress={() => router.push({ pathname: "/listing/[id]", params: { id: item.id } })} activeOpacity={0.88}>
        <LinearGradient colors={["#0F2518", "#0A1A10"]} style={s.cardGradient}>
          <View style={s.cardTop}>
            <View style={s.avatarWrap}>
              {item.photos?.[0] ? (
                <Image source={{ uri: item.photos[0] }} style={s.avatar} contentFit="cover" />
              ) : (
                <LinearGradient colors={["#1A5C38", "#0E3D24"]} style={s.avatarPlaceholder}>
                  <Text style={s.avatarInitials}>{item.title.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}</Text>
                </LinearGradient>
              )}
              {item.verified && <View style={s.verifiedBadge}><Ionicons name="checkmark-circle" size={16} color={Colors.gold} /></View>}
            </View>
            <View style={s.cardInfo}>
              <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={s.cardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
              <View style={s.ratingRow}>
                <Ionicons name="star" size={12} color={Colors.gold} />
                <Text style={s.ratingText}>{item.rating > 0 ? item.rating.toFixed(1) : "New"}</Text>
                {item.reviewCount > 0 && <Text style={s.reviewCount}>({item.reviewCount})</Text>}
                {item.badge && <View style={s.badge}><Text style={s.badgeText}>{item.badge}</Text></View>}
              </View>
            </View>
            <TouchableOpacity onPress={() => { if (!user) { router.push("/auth"); return; } Haptics.selectionAsync(); toggleSaved(item.id); }} hitSlop={8}>
              <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={20} color={saved ? Colors.gold : Colors.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={s.cardDivider} />
          <View style={s.cardBottom}>
            <View style={s.locationRow}>
              <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
              <Text style={s.locationText} numberOfLines={1}>{item.location}</Text>
            </View>
            <View style={s.cardActions}>
              {item.price && <Text style={s.price}>{item.price}</Text>}
              <TouchableOpacity style={s.callBtn} onPress={() => Linking.openURL(`tel:${item.phone.replace(/\s/g, "")}`)}>
                <Ionicons name="call" size={14} color={Colors.darkBg} />
                <Text style={s.callBtnText}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[s.container, { paddingTop: isWeb ? 67 : insets.top }]}>
      <LinearGradient colors={["#0F2518", "#080F0A"]} style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Service Providers</Text>
          <Text style={s.headerCount}>{filtered.length} professionals</Text>
        </View>
        <TouchableOpacity style={s.searchBtn} onPress={() => router.push("/search")}>
          <Ionicons name="search-outline" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </LinearGradient>

      <View style={s.tagScrollWrap}>
        <FlatList horizontal data={[null, ...tags]} keyExtractor={i => i ?? "all"} showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tagRow}
          renderItem={({ item }) => (
            <TouchableOpacity style={[s.tag, selectedTag === item && s.tagActive]} onPress={() => setSelectedTag(item)}>
              <Text style={[s.tagText, selectedTag === item && s.tagTextActive]}>{item ?? "All"}</Text>
            </TouchableOpacity>
          )} />
      </View>

      <FlatList data={filtered} keyExtractor={i => i.id} renderItem={renderItem}
        contentContainerStyle={[s.list, { paddingBottom: isWeb ? 120 : 90 }]}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={s.empty}><Ionicons name="construct-outline" size={48} color={Colors.textMuted} /><Text style={s.emptyText}>No providers yet</Text></View>}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080F0A" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(201,168,76,0.1)", borderWidth: 1, borderColor: "rgba(201,168,76,0.2)", alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.textPrimary },
  headerCount: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted },
  searchBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(201,168,76,0.1)", borderWidth: 1, borderColor: "rgba(201,168,76,0.2)", alignItems: "center", justifyContent: "center" },
  tagScrollWrap: { paddingVertical: 10 },
  tagRow: { paddingHorizontal: 16, gap: 8 },
  tag: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "rgba(15,37,24,0.8)", borderWidth: 1, borderColor: "rgba(201,168,76,0.15)" },
  tagActive: { backgroundColor: "rgba(201,168,76,0.15)", borderColor: Colors.gold },
  tagText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textMuted },
  tagTextActive: { color: Colors.gold },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  card: { borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "rgba(201,168,76,0.15)" },
  cardGradient: { padding: 14, gap: 10 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarWrap: { position: "relative" },
  avatar: { width: 58, height: 58, borderRadius: 18 },
  avatarPlaceholder: { width: 58, height: 58, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  avatarInitials: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.gold },
  verifiedBadge: { position: "absolute", bottom: -2, right: -2 },
  cardInfo: { flex: 1, gap: 3 },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.textPrimary },
  cardSubtitle: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontFamily: "Inter_700Bold", fontSize: 12, color: Colors.gold },
  reviewCount: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted },
  badge: { backgroundColor: "rgba(201,168,76,0.15)", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: "rgba(201,168,76,0.3)" },
  badgeText: { fontFamily: "Inter_700Bold", fontSize: 9, color: Colors.gold },
  cardDivider: { height: 1, backgroundColor: "rgba(201,168,76,0.08)" },
  cardBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, flex: 1 },
  locationText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted },
  cardActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  price: { fontFamily: "Inter_700Bold", fontSize: 13, color: Colors.gold },
  callBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: Colors.gold, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  callBtnText: { fontFamily: "Inter_700Bold", fontSize: 12, color: Colors.darkBg },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.textMuted },
});
