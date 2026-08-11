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

// Events — vibrant amber/festival poster-style cards
export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { getListingsByCategory, isSaved, toggleSaved, user } = useAppContext();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const allListings = useMemo(() => getListingsByCategory("events"), [getListingsByCategory]);
  const tags = CATEGORY_TAGS["events"] ?? [];
  const filtered = useMemo(() => selectedTag ? allListings.filter(l => l.tags.includes(selectedTag)) : allListings, [allListings, selectedTag]);

  const renderItem = ({ item }: { item: Listing }) => {
    const saved = isSaved(item.id);
    const date = new Date(item.createdAt);
    return (
      <TouchableOpacity style={s.card} onPress={() => router.push({ pathname: "/listing/[id]", params: { id: item.id } })} activeOpacity={0.88}>
        <View style={s.dateBadge}>
          <Text style={s.dateMonth}>{date.toLocaleString("en-KE", { month: "short" }).toUpperCase()}</Text>
          <Text style={s.dateDay}>{date.getDate()}</Text>
        </View>
        <View style={s.cardBody}>
          <View style={s.cardTitleRow}>
            <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
            <TouchableOpacity onPress={() => { if (!user) { router.push("/auth"); return; } Haptics.selectionAsync(); toggleSaved(item.id); }}>
              <Ionicons name={saved ? "heart" : "heart-outline"} size={18} color={saved ? "#E8A84C" : Colors.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={s.cardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
          <View style={s.tagsRow}>
            {item.tags.slice(0, 3).map(t => <View key={t} style={s.tag}><Text style={s.tagText}>{t}</Text></View>)}
          </View>
          <View style={s.cardFooter}>
            <View style={s.locationRow}>
              <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
              <Text style={s.locationText} numberOfLines={1}>{item.location}</Text>
            </View>
            {item.price ? (
              <Text style={s.price}>{item.price}</Text>
            ) : (
              <View style={s.freeBadge}><Text style={s.freeText}>FREE</Text></View>
            )}
          </View>
        </View>
        {item.photos?.[0] && (
          <Image source={{ uri: item.photos[0] }} style={s.thumbnail} contentFit="cover" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[s.container, { paddingTop: isWeb ? 67 : insets.top }]}>
      <LinearGradient colors={["#1A1005", "#0A0802"]} style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>What's Happening</Text>
          <Text style={s.headerCount}>{filtered.length} events</Text>
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
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={s.empty}><Ionicons name="calendar-outline" size={48} color={Colors.textMuted} /><Text style={s.emptyText}>No events listed yet</Text></View>}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0802" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(232,168,76,0.1)", borderWidth: 1, borderColor: "rgba(232,168,76,0.25)", alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#fff" },
  headerCount: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.4)" },
  searchBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(232,168,76,0.1)", borderWidth: 1, borderColor: "rgba(232,168,76,0.25)", alignItems: "center", justifyContent: "center" },
  filterScroll: { maxHeight: 48, backgroundColor: "#120E04" },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingVertical: 8 },
  filter: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: "rgba(232,168,76,0.07)", borderWidth: 1, borderColor: "rgba(232,168,76,0.15)" },
  filterActive: { backgroundColor: "rgba(232,168,76,0.2)", borderColor: "#E8A84C" },
  filterText: { fontFamily: "Inter_500Medium", fontSize: 12, color: "rgba(255,255,255,0.5)" },
  filterTextActive: { color: "#E8A84C" },
  list: { paddingHorizontal: 16, paddingTop: 12 },
  card: { flexDirection: "row", backgroundColor: "#120E04", borderRadius: 18, borderWidth: 1, borderColor: "rgba(232,168,76,0.15)", padding: 14, gap: 12, alignItems: "center" },
  dateBadge: { width: 48, alignItems: "center", backgroundColor: "rgba(232,168,76,0.12)", borderRadius: 12, paddingVertical: 8, borderWidth: 1, borderColor: "rgba(232,168,76,0.25)" },
  dateMonth: { fontFamily: "Inter_700Bold", fontSize: 10, color: "#E8A84C", letterSpacing: 0.5 },
  dateDay: { fontFamily: "Inter_700Bold", fontSize: 22, color: "#fff" },
  cardBody: { flex: 1, gap: 5 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#fff", flex: 1 },
  cardSubtitle: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.5)" },
  tagsRow: { flexDirection: "row", gap: 5 },
  tag: { backgroundColor: "rgba(232,168,76,0.1)", borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2 },
  tagText: { fontFamily: "Inter_500Medium", fontSize: 10, color: "#E8A84C" },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 3, flex: 1 },
  locationText: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted },
  price: { fontFamily: "Inter_700Bold", fontSize: 13, color: "#E8A84C" },
  freeBadge: { backgroundColor: "rgba(90,222,138,0.12)", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: "rgba(90,222,138,0.25)" },
  freeText: { fontFamily: "Inter_700Bold", fontSize: 10, color: "#5ADE8A" },
  thumbnail: { width: 70, height: 70, borderRadius: 12 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.textMuted },
});
