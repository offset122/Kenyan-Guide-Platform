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

// Jobs — purple/indigo job board style with salary and role prominence
export default function JobsScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { getListingsByCategory } = useAppContext();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const allListings = useMemo(() => getListingsByCategory("jobs"), [getListingsByCategory]);
  const tags = CATEGORY_TAGS["jobs"] ?? [];
  const filtered = useMemo(() => selectedTag ? allListings.filter(l => l.tags.includes(selectedTag)) : allListings, [allListings, selectedTag]);

  const renderItem = ({ item }: { item: Listing }) => (
    <TouchableOpacity style={s.card} onPress={() => router.push({ pathname: "/listing/[id]", params: { id: item.id } })} activeOpacity={0.88}>
      <View style={s.cardTop}>
        <View style={s.companyLogo}>
          <Text style={s.companyInitials}>{item.subtitle.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}</Text>
        </View>
        <View style={s.jobInfo}>
          <Text style={s.jobTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={s.companyName} numberOfLines={1}>{item.subtitle}</Text>
          <View style={s.locationRow}>
            <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
            <Text style={s.locationText}>{item.location}</Text>
          </View>
        </View>
        <View style={s.cardTopRight}>
          {item.badge && <View style={[s.badge, item.badge === "Urgent" && s.badgeUrgent]}>
            <Text style={[s.badgeText, item.badge === "Urgent" && s.badgeTextUrgent]}>{item.badge}</Text>
          </View>}
          {item.verified && <Ionicons name="shield-checkmark" size={16} color="#A87AE8" />}
        </View>
      </View>
      <View style={s.cardDivider} />
      <View style={s.cardBottom}>
        <View style={s.skillsRow}>
          {item.tags.slice(0, 3).map(t => <View key={t} style={s.skill}><Text style={s.skillText}>{t}</Text></View>)}
        </View>
        <View style={s.salaryRow}>
          {item.price && <Text style={s.salary}>{item.price}</Text>}
          <TouchableOpacity style={s.applyBtn} onPress={() => Linking.openURL(`tel:${item.phone.replace(/\s/g, "")}`)}>
            <Text style={s.applyBtnText}>Apply</Text>
            <Ionicons name="arrow-forward" size={13} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[s.container, { paddingTop: isWeb ? 67 : insets.top }]}>
      <LinearGradient colors={["#0E0A1A", "#080510"]} style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Job Opportunities</Text>
          <Text style={s.headerCount}>{filtered.length} openings</Text>
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
        ListEmptyComponent={<View style={s.empty}><Ionicons name="briefcase-outline" size={48} color={Colors.textMuted} /><Text style={s.emptyText}>No jobs posted yet</Text></View>}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080510" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: "rgba(168,122,232,0.15)" },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(168,122,232,0.1)", borderWidth: 1, borderColor: "rgba(168,122,232,0.25)", alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#fff" },
  headerCount: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.4)" },
  searchBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(168,122,232,0.1)", borderWidth: 1, borderColor: "rgba(168,122,232,0.25)", alignItems: "center", justifyContent: "center" },
  filterScroll: { maxHeight: 48, backgroundColor: "#0A0714" },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingVertical: 8 },
  filter: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: "rgba(168,122,232,0.07)", borderWidth: 1, borderColor: "rgba(168,122,232,0.15)" },
  filterActive: { backgroundColor: "rgba(168,122,232,0.2)", borderColor: "#A87AE8" },
  filterText: { fontFamily: "Inter_500Medium", fontSize: 12, color: "rgba(255,255,255,0.5)" },
  filterTextActive: { color: "#A87AE8" },
  list: { paddingHorizontal: 16, paddingTop: 12 },
  card: { backgroundColor: "#0A0714", borderRadius: 18, borderWidth: 1, borderColor: "rgba(168,122,232,0.15)", padding: 14, gap: 12 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  companyLogo: { width: 50, height: 50, borderRadius: 14, backgroundColor: "rgba(168,122,232,0.15)", borderWidth: 1, borderColor: "rgba(168,122,232,0.3)", alignItems: "center", justifyContent: "center" },
  companyInitials: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#A87AE8" },
  jobInfo: { flex: 1, gap: 3 },
  jobTitle: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#fff" },
  companyName: { fontFamily: "Inter_500Medium", fontSize: 13, color: "rgba(255,255,255,0.6)" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  locationText: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted },
  cardTopRight: { alignItems: "flex-end", gap: 6 },
  badge: { backgroundColor: "rgba(168,122,232,0.15)", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: "rgba(168,122,232,0.3)" },
  badgeUrgent: { backgroundColor: "rgba(232,92,92,0.15)", borderColor: "rgba(232,92,92,0.35)" },
  badgeText: { fontFamily: "Inter_700Bold", fontSize: 9, color: "#A87AE8", letterSpacing: 0.4 },
  badgeTextUrgent: { color: "#E85C5C" },
  cardDivider: { height: 1, backgroundColor: "rgba(168,122,232,0.08)" },
  cardBottom: { gap: 8 },
  skillsRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  skill: { backgroundColor: "rgba(168,122,232,0.08)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: "rgba(168,122,232,0.15)" },
  skillText: { fontFamily: "Inter_500Medium", fontSize: 11, color: "#A87AE8" },
  salaryRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  salary: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#A87AE8" },
  applyBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#A87AE8", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  applyBtnText: { fontFamily: "Inter_700Bold", fontSize: 13, color: "#fff" },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.textMuted },
});
