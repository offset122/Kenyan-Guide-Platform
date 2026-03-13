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
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import { Colors } from "@/constants/colors";
import { CATEGORIES, CATEGORY_TAGS } from "@/constants/data";
import { useAppContext } from "@/context/AppContext";
import { ListingCard } from "@/components/ListingCard";

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const { getListingsByCategory } = useAppContext();

  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const category = CATEGORIES.find((c) => c.id === id);
  const allListings = useMemo(() => getListingsByCategory(id ?? ""), [id, getListingsByCategory]);
  const tags = CATEGORY_TAGS[id ?? ""] ?? [];

  const filtered = useMemo(() => {
    if (!selectedTag) return allListings;
    return allListings.filter((l) => l.tags.includes(selectedTag));
  }, [allListings, selectedTag]);

  if (!category) {
    return (
      <View style={[styles.container, { paddingTop: topPadding }]}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Category not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const Icon = category.iconSet === "MaterialIcons" ? MaterialIcons : Ionicons;

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={[styles.headerIconWrap, { backgroundColor: category.color }]}>
          {/* @ts-ignore */}
          <Icon name={category.icon} size={20} color={category.accentColor} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{category.title}</Text>
          <Text style={styles.headerSubtitle}>{filtered.length} listing{filtered.length !== 1 ? "s" : ""}</Text>
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={() => router.push("/search")}>
          <Ionicons name="search-outline" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Description */}
      <View style={styles.descBox}>
        <Text style={styles.descText}>{category.description}</Text>
      </View>

      {/* Tag filter */}
      {tags.length > 0 && (
        <FlatList
          horizontal
          data={[null, ...tags]}
          keyExtractor={(item) => item ?? "all"}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagRow}
          style={styles.tagScroll}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.tagChip, selectedTag === item && styles.tagChipActive]}
              onPress={() => setSelectedTag(item)}
            >
              <Text style={[styles.tagText, selectedTag === item && styles.tagTextActive]}>
                {item ?? "All"}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

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
            <View style={[styles.emptyIcon, { backgroundColor: category.color }]}>
              {/* @ts-ignore */}
              <Icon name={category.icon} size={32} color={category.accentColor} />
            </View>
            <Text style={styles.emptyTitle}>No listings yet</Text>
            <Text style={styles.emptyText}>
              Be the first to post in {category.title}!
            </Text>
            <TouchableOpacity style={styles.postBtn} onPress={() => router.push("/(tabs)/create" as any)}>
              <Ionicons name="add" size={16} color={Colors.darkBg} />
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
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  headerIconWrap: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerText: { flex: 1 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 17, color: Colors.textPrimary },
  headerSubtitle: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  searchBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  descBox: { marginHorizontal: 16, backgroundColor: Colors.darkCard, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 12, marginBottom: 12 },
  descText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  tagScroll: { maxHeight: 50 },
  tagRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
  tagChip: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  tagChipActive: { backgroundColor: Colors.green + "40", borderColor: Colors.gold + "60" },
  tagText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textMuted },
  tagTextActive: { color: Colors.gold },
  listContent: { paddingHorizontal: 16, paddingTop: 4 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 14, paddingHorizontal: 32 },
  emptyIcon: { width: 72, height: 72, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.textPrimary },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, textAlign: "center" },
  postBtn: { backgroundColor: Colors.gold, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, flexDirection: "row", gap: 8, alignItems: "center", marginTop: 4 },
  postBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.darkBg },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFoundText: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: Colors.textPrimary },
  backLink: { fontFamily: "Inter_500Medium", fontSize: 15, color: Colors.gold },
});
