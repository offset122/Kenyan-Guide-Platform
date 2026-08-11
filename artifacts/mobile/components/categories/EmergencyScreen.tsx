import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";
import { CATEGORY_TAGS } from "@/constants/data";
import { useAppContext } from "@/context/AppContext";
import { Listing } from "@/context/AppContext";

// Emergency — high-contrast red/dark urgent design with big call buttons
export default function EmergencyScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { getListingsByCategory } = useAppContext();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const allListings = useMemo(() => getListingsByCategory("emergency"), [getListingsByCategory]);
  const tags = CATEGORY_TAGS["emergency"] ?? [];
  const filtered = useMemo(() => selectedTag ? allListings.filter(l => l.tags.includes(selectedTag)) : allListings, [allListings, selectedTag]);

  const renderItem = ({ item }: { item: Listing }) => (
    <View style={s.card}>
      <View style={s.cardLeft}>
        <View style={[s.iconCircle, { backgroundColor: item.verified ? "rgba(232,92,92,0.15)" : "rgba(107,123,104,0.15)" }]}>
          <Ionicons name={item.tags.includes("Ambulance") ? "medkit" : item.tags.includes("Police") ? "shield" : item.tags.includes("Fire") ? "flame" : "alert-circle"} size={26} color={item.verified ? "#E85C5C" : Colors.textMuted} />
        </View>
        {item.verified && (
          <View style={s.officialBadge}>
            <Text style={s.officialText}>OFFICIAL</Text>
          </View>
        )}
      </View>
      <View style={s.cardBody}>
        <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={s.cardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
        <View style={s.tagsRow}>
          {item.tags.slice(0, 2).map(t => <View key={t} style={s.tag}><Text style={s.tagText}>{t}</Text></View>)}
        </View>
        <View style={s.locationRow}>
          <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
          <Text style={s.locationText}>{item.location}</Text>
        </View>
      </View>
      <TouchableOpacity style={s.callBtn} onPress={() => Linking.openURL(`tel:${item.phone.replace(/\s/g, "")}`)}>
        <Ionicons name="call" size={20} color="#fff" />
        <Text style={s.callBtnText}>{item.phone}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[s.container, { paddingTop: isWeb ? 67 : insets.top }]}>
      <LinearGradient colors={["#1A0505", "#0A0202"]} style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <View style={s.headerTitleRow}>
            <View style={s.pulseDot} />
            <Text style={s.headerTitle}>Emergency & Healthcare</Text>
          </View>
          <Text style={s.headerCount}>{filtered.length} services available</Text>
        </View>
        <TouchableOpacity style={s.searchBtn} onPress={() => router.push("/search")}>
          <Ionicons name="search-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={s.alertBanner}>
        <Ionicons name="warning-outline" size={16} color="#E85C5C" />
        <Text style={s.alertText}>For life-threatening emergencies, call 999 or 112 immediately</Text>
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
        ListEmptyComponent={<View style={s.empty}><Ionicons name="alert-circle-outline" size={48} color={Colors.textMuted} /><Text style={s.emptyText}>No emergency services listed</Text></View>}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0202" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(232,92,92,0.12)", borderWidth: 1, borderColor: "rgba(232,92,92,0.3)", alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1 },
  headerTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#E85C5C" },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 17, color: "#fff" },
  headerCount: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 },
  searchBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(232,92,92,0.12)", borderWidth: 1, borderColor: "rgba(232,92,92,0.3)", alignItems: "center", justifyContent: "center" },
  alertBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(232,92,92,0.08)", borderBottomWidth: 1, borderBottomColor: "rgba(232,92,92,0.15)", paddingHorizontal: 16, paddingVertical: 10 },
  alertText: { fontFamily: "Inter_500Medium", fontSize: 12, color: "rgba(232,92,92,0.9)", flex: 1 },
  filterScroll: { maxHeight: 48, backgroundColor: "#120404" },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingVertical: 8 },
  filter: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: "rgba(232,92,92,0.07)", borderWidth: 1, borderColor: "rgba(232,92,92,0.15)" },
  filterActive: { backgroundColor: "rgba(232,92,92,0.2)", borderColor: "#E85C5C" },
  filterText: { fontFamily: "Inter_500Medium", fontSize: 12, color: "rgba(255,255,255,0.5)" },
  filterTextActive: { color: "#E85C5C" },
  list: { paddingHorizontal: 16, paddingTop: 12 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#120404", borderRadius: 16, borderWidth: 1, borderColor: "rgba(232,92,92,0.15)", padding: 14, gap: 12 },
  cardLeft: { alignItems: "center", gap: 6 },
  iconCircle: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(232,92,92,0.2)" },
  officialBadge: { backgroundColor: "rgba(232,92,92,0.15)", borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, borderWidth: 1, borderColor: "rgba(232,92,92,0.3)" },
  officialText: { fontFamily: "Inter_700Bold", fontSize: 8, color: "#E85C5C", letterSpacing: 0.5 },
  cardBody: { flex: 1, gap: 4 },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#fff" },
  cardSubtitle: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.5)" },
  tagsRow: { flexDirection: "row", gap: 5 },
  tag: { backgroundColor: "rgba(232,92,92,0.08)", borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2 },
  tagText: { fontFamily: "Inter_500Medium", fontSize: 10, color: "#E85C5C" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  locationText: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted },
  callBtn: { alignItems: "center", justifyContent: "center", backgroundColor: "#E85C5C", borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12, gap: 4, minWidth: 64 },
  callBtnText: { fontFamily: "Inter_700Bold", fontSize: 10, color: "#fff", textAlign: "center" },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.textMuted },
});
