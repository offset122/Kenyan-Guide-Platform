import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  Modal,
  Pressable,
  RefreshControl,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { Colors } from "@/constants/colors";
import { CATEGORIES } from "@/constants/data";
import { useAppContext } from "@/context/AppContext";
import { ListingCard } from "@/components/ListingCard";
import { SkeletonCard } from "@/components/SkeletonCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_CARD_WIDTH = (SCREEN_WIDTH - 44) / 2;

const GRID_CATEGORIES = new Set(["products", "realestate"]);

type SortOption = "relevant" | "rating" | "newest" | "price_low" | "price_high";
type FilterState = { availability: "all" | "available"; verified: boolean };

const SORT_OPTIONS: { id: SortOption; label: string; icon: string }[] = [
  { id: "relevant", label: "Most Relevant", icon: "sparkles-outline" },
  { id: "rating", label: "Highest Rated", icon: "star-outline" },
  { id: "newest", label: "Newest First", icon: "time-outline" },
  { id: "price_low", label: "Price: Low to High", icon: "trending-down-outline" },
  { id: "price_high", label: "Price: High to Low", icon: "trending-up-outline" },
];

function parsePrice(price?: string): number {
  if (!price) return 0;
  const match = price.replace(/,/g, "").match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const { listings, isLoading } = useAppContext();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("relevant");
  const [filters, setFilters] = useState<FilterState>({ availability: "all", verified: false });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const catCount = useMemo(() => {
    const counts: Record<string, number> = {};
    listings.forEach((l) => { counts[l.categoryId] = (counts[l.categoryId] ?? 0) + 1; });
    return counts;
  }, [listings]);

  const activeFilterCount = (filters.availability !== "all" ? 1 : 0) + (filters.verified ? 1 : 0) + (sortBy !== "relevant" ? 1 : 0);
  const isGridCategory = selectedCategory ? GRID_CATEGORIES.has(selectedCategory) : false;

  const filtered = useMemo(() => {
    let result = listings.filter((l) => {
      if (selectedCategory && l.categoryId !== selectedCategory) return false;
      if (filters.availability === "available" && !l.available) return false;
      if (filters.verified && !l.verified) return false;
      return true;
    });

    switch (sortBy) {
      case "rating": result = [...result].sort((a, b) => b.rating - a.rating); break;
      case "newest": result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case "price_low": result = [...result].sort((a, b) => parsePrice(a.price) - parsePrice(b.price)); break;
      case "price_high": result = [...result].sort((a, b) => parsePrice(b.price) - parsePrice(a.price)); break;
    }
    return result;
  }, [listings, selectedCategory, sortBy, filters]);

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Explore</Text>
          <Text style={styles.subtitle}>{filtered.length} listings</Text>
        </View>
        <View style={styles.headerActions}>
          {isGridCategory && (
            <TouchableOpacity
              style={styles.viewToggleBtn}
              onPress={() => setViewMode((v) => v === "list" ? "grid" : "list")}
            >
              <Ionicons name={viewMode === "grid" ? "list-outline" : "grid-outline"} size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="options-outline" size={18} color={activeFilterCount > 0 ? Colors.gold : Colors.textSecondary} />
            {activeFilterCount > 0 && (
              <View style={styles.filterBtnBadge}>
                <Text style={styles.filterBtnBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        data={[{ id: null, title: "All", icon: "apps-outline", iconSet: "Ionicons", color: Colors.green, accentColor: Colors.gold } as any, ...CATEGORIES]}
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
              <View style={[styles.filterIcon, { backgroundColor: item.color + (isActive ? "FF" : "70") }]}>
                {/* @ts-ignore */}
                <Icon name={item.icon} size={13} color={item.accentColor} />
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

      {/* Sort indicator */}
      {sortBy !== "relevant" && (
        <View style={styles.sortBar}>
          <Ionicons name="funnel-outline" size={12} color={Colors.gold} />
          <Text style={styles.sortBarText}>Sorted by: {SORT_OPTIONS.find((s) => s.id === sortBy)?.label}</Text>
          <TouchableOpacity onPress={() => setSortBy("relevant")}>
            <Ionicons name="close-circle" size={14} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      )}

      {/* Listings */}
      <FlatList
        key={isGridCategory && viewMode === "grid" ? "grid" : "list"}
        data={isLoading ? Array(4).fill(null) : filtered}
        keyExtractor={(item, index) => item?.id ?? `skel-${index}`}
        numColumns={isGridCategory && viewMode === "grid" ? 2 : 1}
        columnWrapperStyle={isGridCategory && viewMode === "grid" ? styles.gridRow : undefined}
        renderItem={({ item, index }) =>
          !item
            ? <SkeletonCard />
            : isGridCategory && viewMode === "grid"
            ? (
              <Animated.View entering={FadeInDown.delay(index * 40).springify()} style={styles.gridItem}>
                <TouchableOpacity
                  style={styles.gridCard}
                  onPress={() => router.push({ pathname: "/listing/[id]", params: { id: item.id } })}
                  activeOpacity={0.88}
                >
                  {item.photos && item.photos.length > 0 ? (
                    <Image source={{ uri: item.photos[0] }} style={styles.gridImage} contentFit="cover" transition={200} />
                  ) : (
                    <View style={[styles.gridImage, { backgroundColor: Colors.darkCardElevated, alignItems: "center", justifyContent: "center" }]}>
                      <Ionicons name="image-outline" size={28} color={Colors.textMuted} />
                    </View>
                  )}
                  {item.badge && (
                    <View style={styles.gridBadge}>
                      <Text style={styles.gridBadgeText}>{item.badge}</Text>
                    </View>
                  )}
                  <View style={styles.gridInfo}>
                    <Text style={styles.gridTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.gridSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                    {item.price && <Text style={styles.gridPrice}>{item.price}</Text>}
                    <View style={styles.gridMeta}>
                      <Ionicons name="location-outline" size={10} color={Colors.textMuted} />
                      <Text style={styles.gridLocation} numberOfLines={1}>{item.location}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            )
            : (
              <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
                <ListingCard listing={item} />
              </Animated.View>
            )
        }
        contentContainerStyle={[styles.listContent, { paddingBottom: isWeb ? 120 : 100 }]}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} colors={[Colors.gold]} />}
        ListEmptyComponent={
          !isLoading ? (
            <Animated.View entering={FadeIn.duration(400)} style={styles.empty}>
              <Ionicons name="search-outline" size={52} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No listings found</Text>
              <Text style={styles.emptyText}>
                {selectedCategory
                  ? "No listings in this category yet. Be the first to post!"
                  : "Try adjusting your filters or search terms."}
              </Text>
              {activeFilterCount > 0 && (
                <TouchableOpacity style={styles.clearFiltersBtn} onPress={() => { setFilters({ availability: "all", verified: false }); setSortBy("relevant"); }}>
                  <Text style={styles.clearFiltersBtnText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.postBtn} onPress={() => router.push("/(tabs)/create" as any)}>
                <Ionicons name="add" size={18} color={Colors.darkBg} />
                <Text style={styles.postBtnText}>Post a Listing</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : null
        }
      />

      {/* Filter/Sort Modal */}
      <Modal visible={showFilterModal} transparent animationType="slide" onRequestClose={() => setShowFilterModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowFilterModal(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort & Filter</Text>
              <TouchableOpacity onPress={() => { setFilters({ availability: "all", verified: false }); setSortBy("relevant"); }}>
                <Text style={styles.modalReset}>Reset</Text>
              </TouchableOpacity>
            </View>

            {/* Sort */}
            <Text style={styles.modalSection}>Sort By</Text>
            <View style={styles.sortOptions}>
              {SORT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.sortOption, sortBy === opt.id && styles.sortOptionActive]}
                  onPress={() => setSortBy(opt.id)}
                >
                  <Ionicons name={opt.icon as any} size={16} color={sortBy === opt.id ? Colors.gold : Colors.textSecondary} />
                  <Text style={[styles.sortOptionText, sortBy === opt.id && styles.sortOptionTextActive]}>{opt.label}</Text>
                  {sortBy === opt.id && <Ionicons name="checkmark" size={16} color={Colors.gold} />}
                </TouchableOpacity>
              ))}
            </View>

            {/* Filters */}
            <Text style={styles.modalSection}>Filter By</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[styles.toggleOption, filters.availability === "available" && styles.toggleOptionActive]}
                onPress={() => setFilters((f) => ({ ...f, availability: f.availability === "available" ? "all" : "available" }))}
              >
                <View style={[styles.toggleCheck, filters.availability === "available" && styles.toggleCheckActive]}>
                  {filters.availability === "available" && <Ionicons name="checkmark" size={12} color={Colors.darkBg} />}
                </View>
                <Text style={styles.toggleLabel}>Available Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleOption, filters.verified && styles.toggleOptionActive]}
                onPress={() => setFilters((f) => ({ ...f, verified: !f.verified }))}
              >
                <View style={[styles.toggleCheck, filters.verified && styles.toggleCheckActive]}>
                  {filters.verified && <Ionicons name="checkmark" size={12} color={Colors.darkBg} />}
                </View>
                <Text style={styles.toggleLabel}>Verified Only</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilterModal(false)}>
              <Text style={styles.applyBtnText}>Apply — {filtered.length} results</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBg },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  headerActions: { flexDirection: "row", gap: 8, alignItems: "center" },
  viewToggleBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  gridRow: { paddingHorizontal: 16, gap: 12, marginBottom: 12 },
  gridItem: { flex: 1 },
  gridCard: { backgroundColor: Colors.darkCard, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, overflow: "hidden" },
  gridImage: { width: "100%", height: 130 },
  gridBadge: { position: "absolute", top: 8, left: 8, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  gridBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 9, color: Colors.gold },
  gridInfo: { padding: 10, gap: 3 },
  gridTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.textPrimary },
  gridSubtitle: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textSecondary },
  gridPrice: { fontFamily: "Inter_700Bold", fontSize: 13, color: Colors.gold, marginTop: 2 },
  gridMeta: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 2 },
  gridLocation: { fontFamily: "Inter_400Regular", fontSize: 10, color: Colors.textMuted, flex: 1 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, color: Colors.textPrimary, letterSpacing: -0.6 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  filterBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center", position: "relative" },
  filterBtnActive: { borderColor: Colors.gold + "60", backgroundColor: Colors.green + "30" },
  filterBtnBadge: { position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: Colors.darkBg },
  filterBtnBadgeText: { fontFamily: "Inter_700Bold", fontSize: 9, color: Colors.darkBg },
  filterScroll: { maxHeight: 56 },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  filterChip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
  filterChipActive: { borderColor: Colors.gold + "60", backgroundColor: Colors.green + "30" },
  filterIcon: { width: 22, height: 22, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  filterLabel: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.textSecondary },
  filterLabelActive: { color: Colors.gold },
  filterCount: { backgroundColor: Colors.darkCardElevated, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1 },
  filterCountActive: { backgroundColor: Colors.gold },
  filterCountText: { fontFamily: "Inter_700Bold", fontSize: 10, color: Colors.textMuted },
  sortBar: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingBottom: 8 },
  sortBarText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.gold, flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 4 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12, paddingHorizontal: 32 },
  emptyTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.textPrimary },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, textAlign: "center" },
  clearFiltersBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 },
  clearFiltersBtnText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary },
  postBtn: { backgroundColor: Colors.gold, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, flexDirection: "row", gap: 8, alignItems: "center", marginTop: 4 },
  postBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.darkBg },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: Colors.darkCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 40, borderWidth: 1, borderColor: Colors.border },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: "center", marginTop: 12, marginBottom: 16 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.textPrimary },
  modalReset: { fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.textMuted },
  modalSection: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: Colors.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10, marginTop: 8 },
  sortOptions: { gap: 4, marginBottom: 12 },
  sortOption: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: Colors.darkBg, borderWidth: 1, borderColor: Colors.borderLight },
  sortOptionActive: { borderColor: Colors.gold + "40", backgroundColor: Colors.green + "20" },
  sortOptionText: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.textSecondary },
  sortOptionTextActive: { color: Colors.gold },
  filterOptions: { gap: 8, marginBottom: 20 },
  toggleOption: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: Colors.darkBg, borderWidth: 1, borderColor: Colors.borderLight },
  toggleOptionActive: { borderColor: Colors.gold + "40", backgroundColor: Colors.green + "20" },
  toggleCheck: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  toggleCheckActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  toggleLabel: { fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.textSecondary },
  applyBtn: { backgroundColor: Colors.gold, borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  applyBtnText: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.darkBg },
});
