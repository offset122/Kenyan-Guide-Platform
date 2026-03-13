import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

import { Colors } from "@/constants/colors";
import { CATEGORIES } from "@/constants/data";
import { useAppContext } from "@/context/AppContext";
import { useMessaging } from "@/context/MessagingContext";
import { useLocation } from "@/context/LocationContext";
import { ListingCard } from "@/components/ListingCard";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const { listings, user } = useAppContext();
  const { totalUnread } = useMessaging();
  const { county, area, loading: locLoading, permissionGranted, requestLocation } = useLocation();

  const featured = useMemo(() =>
    listings.filter((l) => l.available && l.rating >= 4.7).slice(0, 5),
    [listings]
  );

  const nearbyListings = useMemo(() => {
    if (!county || county === "Kenya") return [];
    return listings.filter((l) => l.available && l.location.includes(county)).slice(0, 4);
  }, [listings, county]);

  const recent = useMemo(() =>
    [...listings]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6),
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
          <Text style={styles.greeting}>
            {user ? `Hello, ${user.name.split(" ")[0]} 👋` : "My Kenyan Guide"}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={12} color={county ? Colors.gold : Colors.textMuted} />
            <Text style={styles.locationText}>
              {locLoading ? "Getting location..." : county ? (area ? `${area}, ${county}` : county) : "Kenya"}
            </Text>
            {!permissionGranted && !locLoading && (
              <TouchableOpacity onPress={requestLocation} style={styles.locBtn}>
                <Text style={styles.locBtnText}>Enable</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.headerActions}>
          {totalUnread > 0 && (
            <TouchableOpacity style={styles.notifBtn} onPress={() => router.push("/messages/index" as any)}>
              <Ionicons name="chatbubble-ellipses" size={20} color={Colors.gold} />
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{totalUnread > 9 ? "9+" : totalUnread}</Text>
              </View>
            </TouchableOpacity>
          )}
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
      </View>

      {/* Search */}
      <TouchableOpacity style={styles.searchTouchable} onPress={() => router.push("/search")} activeOpacity={0.85}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <Text style={styles.searchPlaceholder}>Search services, businesses, jobs...</Text>
          <View style={styles.searchFilter}>
            <Ionicons name="options-outline" size={16} color={Colors.gold} />
          </View>
        </View>
      </TouchableOpacity>

      {/* Stats chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll} contentContainerStyle={styles.statsRow}>
        {[
          { label: "Listings", value: listings.length, icon: "storefront-outline", onPress: () => router.push("/(tabs)/explore" as any) },
          { label: "Categories", value: CATEGORIES.length, icon: "grid-outline", onPress: () => {} },
          { label: "Counties", value: "47", icon: "map-outline", onPress: () => {} },
          { label: "Free", value: "100%", icon: "checkmark-circle-outline", onPress: () => {} },
        ].map((s) => (
          <TouchableOpacity key={s.label} style={styles.statChip} onPress={s.onPress}>
            <Ionicons name={s.icon as any} size={14} color={Colors.gold} />
            <Text style={styles.statChipValue}>{s.value}</Text>
            <Text style={styles.statChipLabel}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Location permission nudge */}
      {!permissionGranted && !locLoading && (
        <Animated.View entering={FadeIn.duration(600)}>
          <TouchableOpacity style={styles.locationCard} onPress={requestLocation}>
            <View style={styles.locationCardIcon}>
              <Ionicons name="navigate" size={22} color={Colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationCardTitle}>Enable Location</Text>
              <Text style={styles.locationCardText}>Find services near you across Kenya</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </Animated.View>
      )}

      {locLoading && (
        <View style={styles.locLoadingRow}>
          <ActivityIndicator size="small" color={Colors.gold} />
          <Text style={styles.locLoadingText}>Finding your location...</Text>
        </View>
      )}

      {/* Categories */}
      <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.section}>
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
              <Text style={styles.categoryChipText} numberOfLines={2}>{cat.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Nearby */}
      {nearbyListings.length > 0 && (
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="location" size={16} color={Colors.gold} />
              <Text style={styles.sectionTitle}>Near You in {county}</Text>
            </View>
          </View>
          <View style={styles.listingsCol}>
            {nearbyListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </View>
        </Animated.View>
      )}

      {/* Top Rated */}
      {featured.length > 0 && (
        <Animated.View entering={FadeInDown.delay(140).springify()} style={styles.section}>
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
        </Animated.View>
      )}

      {/* Recent */}
      {recent.length > 0 && (
        <Animated.View entering={FadeInDown.delay(180).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Added</Text>
          </View>
          <View style={styles.listingsCol}>
            {recent.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </View>
        </Animated.View>
      )}

      {/* CTA for non-logged-in */}
      {!user && (
        <Animated.View entering={FadeInDown.delay(220).springify()}>
          <View style={styles.ctaBanner}>
            <View style={styles.ctaIcon}>
              <Ionicons name="shield-checkmark" size={28} color={Colors.gold} />
            </View>
            <Text style={styles.ctaTitle}>Reach More Customers</Text>
            <Text style={styles.ctaText}>Post a free listing and connect with thousands across Kenya</Text>
            <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push("/auth/signup")}>
              <Text style={styles.ctaBtnText}>Get Started Free</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.darkBg} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBg },
  content: { paddingHorizontal: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 20, paddingBottom: 16 },
  headerLeft: { gap: 4, flex: 1 },
  greeting: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.textPrimary, letterSpacing: -0.4 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  locationText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted },
  locBtn: { backgroundColor: Colors.gold + "25", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  locBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: Colors.gold },
  headerActions: { flexDirection: "row", gap: 8, alignItems: "center" },
  notifBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.green, borderWidth: 1, borderColor: Colors.gold + "40", alignItems: "center", justifyContent: "center", position: "relative" },
  notifBadge: { position: "absolute", top: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: Colors.darkBg },
  notifBadgeText: { fontFamily: "Inter_700Bold", fontSize: 9, color: Colors.darkBg },
  profileBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.green, borderWidth: 1.5, borderColor: Colors.gold, alignItems: "center", justifyContent: "center" },
  profileInitials: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.gold },
  searchTouchable: { marginBottom: 16 },
  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13,
  },
  searchPlaceholder: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted },
  searchFilter: { width: 30, height: 30, borderRadius: 9, backgroundColor: Colors.green + "40", alignItems: "center", justifyContent: "center" },
  statsScroll: { marginBottom: 16 },
  statsRow: { gap: 8 },
  statChip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
  statChipValue: { fontFamily: "Inter_700Bold", fontSize: 13, color: Colors.textPrimary },
  statChipLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted },
  locationCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.green + "25", borderWidth: 1, borderColor: Colors.gold + "30",
    borderRadius: 14, padding: 14, marginBottom: 16,
  },
  locationCardIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.green, borderWidth: 1, borderColor: Colors.gold + "40", alignItems: "center", justifyContent: "center" },
  locationCardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.textPrimary },
  locationCardText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  locLoadingRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16, paddingLeft: 4 },
  locLoadingText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textMuted },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.textPrimary },
  seeAll: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.gold },
  categoriesRow: { gap: 14 },
  categoryChip: { alignItems: "center", gap: 8 },
  categoryChipIcon: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  categoryChipText: { fontFamily: "Inter_500Medium", fontSize: 11, color: Colors.textSecondary, textAlign: "center", maxWidth: 66 },
  listingsCol: { gap: 12 },
  ctaBanner: { backgroundColor: Colors.green, borderRadius: 20, borderWidth: 1, borderColor: Colors.gold + "30", padding: 22, alignItems: "center", gap: 10, marginBottom: 12 },
  ctaIcon: { width: 56, height: 56, borderRadius: 18, backgroundColor: Colors.gold + "20", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.gold + "40" },
  ctaTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.textPrimary, textAlign: "center" },
  ctaText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary, textAlign: "center" },
  ctaBtn: { backgroundColor: Colors.gold, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, marginTop: 4, flexDirection: "row", gap: 8, alignItems: "center" },
  ctaBtnText: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.darkBg },
});
