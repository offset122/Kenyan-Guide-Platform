import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const { listings, user } = useAppContext();

  const featured = useMemo(() =>
    listings.filter((l) => l.available && l.rating >= 4.7).slice(0, 6),
    [listings]
  );
  const recent = useMemo(() =>
    [...listings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8),
    [listings]
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: topPadding, paddingBottom: isWeb ? 120 : 100 }]}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{user ? `Hello, ${user.name.split(" ")[0]} 👋` : "My Kenyan Guide"}</Text>
          <Text style={styles.tagline}>Discover services across Kenya</Text>
        </View>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => user ? router.push("/(tabs)/profile" as any) : router.push("/auth/index")}
        >
          {user ? (
            <Text style={styles.profileInitials}>
              {user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
            </Text>
          ) : (
            <Ionicons name="person-outline" size={20} color={Colors.gold} />
          )}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <TouchableOpacity style={styles.searchTouchable} onPress={() => router.push("/search")} activeOpacity={0.85}>
        <View style={styles.searchBarFake}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <Text style={styles.searchPlaceholder}>Search services, businesses, jobs...</Text>
          <Ionicons name="options-outline" size={18} color={Colors.textMuted} />
        </View>
      </TouchableOpacity>

      {/* Stats Row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll} contentContainerStyle={styles.statsRow}>
        {[
          { label: "Listings", value: listings.length, icon: "storefront-outline" },
          { label: "Categories", value: CATEGORIES.length, icon: "grid-outline" },
          { label: "Counties", value: "47", icon: "map-outline" },
          { label: "Free", value: "100%", icon: "checkmark-circle-outline" },
        ].map((s) => (
          <View key={s.label} style={styles.statChip}>
            <Ionicons name={s.icon as any} size={14} color={Colors.gold} />
            <Text style={styles.statChipValue}>{s.value}</Text>
            <Text style={styles.statChipLabel}>{s.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/explore" as any)}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryChip}
              onPress={() => router.push({ pathname: "/category/[id]", params: { id: cat.id } })}
            >
              <View style={[styles.categoryChipIcon, { backgroundColor: cat.color }]}>
                {cat.iconSet === "MaterialIcons" ? (
                  /* @ts-ignore */
                  <MaterialIcons name={cat.icon} size={18} color={cat.accentColor} />
                ) : (
                  <Ionicons name={cat.icon as any} size={18} color={cat.accentColor} />
                )}
              </View>
              <Text style={styles.categoryChipText}>{cat.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured */}
      {featured.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Rated</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/explore" as any)}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.listingsCol}>
            {featured.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </View>
        </View>
      )}

      {/* Recent */}
      {recent.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Added</Text>
          </View>
          <View style={styles.listingsCol}>
            {recent.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </View>
        </View>
      )}

      {/* CTA */}
      {!user && (
        <View style={styles.ctaBanner}>
          <Ionicons name="shield-checkmark" size={32} color={Colors.gold} />
          <Text style={styles.ctaTitle}>Reach More Customers</Text>
          <Text style={styles.ctaText}>Post a free listing and connect with thousands across Kenya</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push("/auth/signup")}>
            <Text style={styles.ctaBtnText}>Get Started Free</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBg },
  content: { paddingHorizontal: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 20, paddingBottom: 16 },
  headerLeft: { gap: 2 },
  greeting: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.textPrimary, letterSpacing: -0.4 },
  tagline: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textMuted },
  profileBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.green, borderWidth: 1.5, borderColor: Colors.gold, alignItems: "center", justifyContent: "center" },
  profileInitials: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.gold },
  searchTouchable: { marginBottom: 16 },
  searchBarFake: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14,
  },
  searchPlaceholder: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted },
  statsScroll: { marginBottom: 20 },
  statsRow: { gap: 10 },
  statChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7,
  },
  statChipValue: { fontFamily: "Inter_700Bold", fontSize: 13, color: Colors.textPrimary },
  statChipLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.textPrimary },
  seeAll: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.gold },
  categoriesRow: { gap: 12 },
  categoryChip: { alignItems: "center", gap: 8 },
  categoryChipIcon: { width: 54, height: 54, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  categoryChipText: { fontFamily: "Inter_500Medium", fontSize: 11, color: Colors.textSecondary, textAlign: "center", maxWidth: 66 },
  listingsCol: { gap: 12 },
  ctaBanner: {
    backgroundColor: Colors.green, borderRadius: 20, borderWidth: 1, borderColor: Colors.gold + "30",
    padding: 24, alignItems: "center", gap: 10, marginBottom: 16,
  },
  ctaTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.textPrimary, textAlign: "center" },
  ctaText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary, textAlign: "center" },
  ctaBtn: { backgroundColor: Colors.gold, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28, marginTop: 4 },
  ctaBtnText: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.darkBg },
});
