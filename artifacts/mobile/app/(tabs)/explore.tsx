import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Colors } from "@/constants/colors";
import { CATEGORIES } from "@/constants/data";
import { useAppContext } from "@/context/AppContext";
import { ListingCard } from "@/components/ListingCard";

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const { listings } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!selectedCategory) return listings.filter((l) => l.available);
    return listings.filter((l) => l.categoryId === selectedCategory && l.available);
  }, [listings, selectedCategory]);

  const catCount = useMemo(() => {
    const counts: Record<string, number> = {};
    listings.forEach((l) => { counts[l.categoryId] = (counts[l.categoryId] ?? 0) + 1; });
    return counts;
  }, [listings]);

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>{filtered.length} listings available</Text>
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        data={[{ id: null, title: "All", icon: "apps", iconSet: "Ionicons", color: Colors.green, accentColor: Colors.gold } as any, ...CATEGORIES]}
        keyExtractor={(item) => item.id ?? "all"}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
        renderItem={({ item }) => {
          const isActive = selectedCategory === item.id;
          const Icon = item.iconSet === "MaterialIcons" ? MaterialIcons : Ionicons;
          return (
            <TouchableOpacity
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <View style={[styles.filterIcon, { backgroundColor: item.color + (isActive ? "FF" : "80") }]}>
                {/* @ts-ignore */}
                <Icon name={item.icon} size={14} color={item.accentColor} />
              </View>
              <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>{item.title}</Text>
              {item.id && catCount[item.id] ? (
                <View style={[styles.filterCount, isActive && styles.filterCountActive]}>
                  <Text style={[styles.filterCountText, isActive && { color: Colors.darkBg }]}>{catCount[item.id]}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        }}
      />

      {/* Listings */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ListingCard listing={item} />}
        contentContainerStyle={[styles.listContent, { paddingBottom: isWeb ? 120 : 90 }]}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No listings found</Text>
            <Text style={styles.emptyText}>
              {selectedCategory
                ? "No listings in this category yet. Be the first to post!"
                : "No listings yet. Start by creating one."}
            </Text>
            <TouchableOpacity style={styles.postBtn} onPress={() => router.push("/(tabs)/create" as any)}>
              <Ionicons name="add" size={18} color={Colors.darkBg} />
              <Text style={styles.postBtnText}>Post a Listing</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBg },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, color: Colors.textPrimary, letterSpacing: -0.6 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textMuted, marginTop: 4 },
  filterScroll: { maxHeight: 60 },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
  filterChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7,
  },
  filterChipActive: { borderColor: Colors.gold + "60", backgroundColor: Colors.green + "30" },
  filterIcon: { width: 22, height: 22, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  filterLabel: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary },
  filterLabelActive: { color: Colors.gold },
  filterCount: { backgroundColor: Colors.darkCardElevated, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1 },
  filterCountActive: { backgroundColor: Colors.gold },
  filterCountText: { fontFamily: "Inter_700Bold", fontSize: 10, color: Colors.textMuted },
  listContent: { paddingHorizontal: 16, paddingTop: 4 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12, paddingHorizontal: 32 },
  emptyTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.textPrimary },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, textAlign: "center" },
  postBtn: { backgroundColor: Colors.gold, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, flexDirection: "row", gap: 8, alignItems: "center", marginTop: 8 },
  postBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.darkBg },
});
