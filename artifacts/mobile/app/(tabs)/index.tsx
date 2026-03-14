import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
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
import { FeaturedCard } from "@/components/FeaturedCard";
import { SkeletonCard } from "@/components/SkeletonCard";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const { listings, user, isLoading } = useAppContext();
  const { totalUnread } = useMessaging();
  const { county, area, loading: locLoading, permissionGranted, requestLocation } = useLocation();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const featured = useMemo(() =>
    listings.filter((l) => l.available && l.rating >= 4.7).slice(0, 8),
    [listings]
  );

  const nearbyListings = useMemo(() => {
    if (!county || county === "Kenya") return [];
    return listings.filter((l) => l.available && l.location.toLowerCase().includes(county.toLowerCase())).slice(0, 4);
  }, [listings, county]);

  const recent = useMemo(() =>
    [...listings]
      .filter((l) => l.available)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6),
    [listings]
  );

  const jobs = useMemo(() => listings.filter((l) => l.categoryId === "jobs" && l.available).slice(0, 3), [listings]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: topPadding }]}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} colors={[Colors.gold]} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>
            {user ? `Hello, ${user.name.split(" ")[0]} 👋` : "My Kenyan Guide"}
          </Text>
          <TouchableOpacity style={styles.locationRow} onPress={!permissionGranted ? requestLocation : undefined}>
            <Ionicons name="location" size={12} color={county && county !== "Kenya" ? Colors.gold : Colors.textMuted} />
            <Text style={styles.locationText}>
              {locLoading ? "Finding you..." : county && county !== "Kenya" ? (area ? `${area}, ${county}` : county) : "Kenya"}
            </Text>
            {!permissionGranted && !locLoading && (
              <View style={styles.locEnableChip}>
                <Text style={styles.locEnableText}>Enable GPS</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.searchIconBtn} onPress={() => router.push("/search")}>
            <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.notifBtn, totalUnread > 0 && styles.notifBtnActive]}
            onPress={() => router.push("/messages/index" as any)}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={totalUnread > 0 ? Colors.gold : Colors.textSecondary} />
            {totalUnread > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{totalUnread > 9 ? "9+" : totalUnread}</Text>
              </View>
            )}
          </TouchableOpacity>
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

      {/* Search Bar */}
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
          { label: "Listings", value: listings.length.toString(), icon: "storefront-outline" as const, onPress: () => router.push("/(tabs)/explore" as any) },
          { label: "Categories", value: CATEGORIES.length.toString(), icon: "grid-outline" as const, onPress: () => {} },
          { label: "Counties", value: "47", icon: "map-outline" as const, onPress: () => {} },
          { label: "Free", value: "100%", icon: "checkmark-circle-outline" as const, onPress: () => {} },
        ].map((s) => (
          <TouchableOpacity key={s.label} style={styles.statChip} onPress={s.onPress}>
            <Ionicons name={s.icon} size={13} color={Colors.gold} />
            <Text style={styles.statChipValue}>{s.value}</Text>
            <Text style={styles.statChipLabel}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Categories */}
      <Animated.View entering={FadeInDown.delay(40).springify()} style={styles.section}>
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
                  <MaterialIcons name={cat.icon} size={20} color={cat.accentColor} />
                ) : (
                  <Ionicons name={cat.icon as any} size={20} color={cat.accentColor} />
                )}
              </View>
              <Text style={styles.categoryChipText} numberOfLines={2}>{cat.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Location nudge */}
      {!permissionGranted && !locLoading && (
        <Animated.View entering={FadeIn.duration(600)}>
          <TouchableOpacity style={styles.locationCard} onPress={requestLocation}>
            <View style={styles.locationCardIcon}>
              <Ionicons name="navigate" size={22} color={Colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationCardTitle}>Enable Location</Text>
              <Text style={styles.locationCardText}>Discover services near you across Kenya</Text>
            </View>
            <View style={styles.locationArrow}>
              <Ionicons name="chevron-forward" size={16} color={Colors.gold} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {locLoading && (
        <View style={styles.locLoadingRow}>
          <ActivityIndicator size="small" color={Colors.gold} />
          <Text style={styles.locLoadingText}>Finding your location...</Text>
        </View>
      )}

      {/* Featured Horizontal Scroll */}
      {featured.length > 0 && (
        <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="star" size={16} color={Colors.gold} />
              <Text style={styles.sectionTitle}>Top Rated</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(tabs)/explore" as any)}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredRow}>
            {featured.map((listing) => (
              <FeaturedCard key={listing.id} listing={listing} />
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Nearby listings */}
      {nearbyListings.length > 0 && (
        <Animated.View entering={FadeInDown.delay(110).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="location" size={16} color={Colors.gold} />
              <Text style={styles.sectionTitle}>Near You in {county}</Text>
            </View>
          </View>
          <View style={styles.listingsCol}>
            {nearbyListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
          </View>
        </Animated.View>
      )}

      {/* Jobs Spotlight */}
      {jobs.length > 0 && (
        <Animated.View entering={FadeInDown.delay(140).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="briefcase" size={16} color="#A87AE8" />
              <Text style={styles.sectionTitle}>Job Opportunities</Text>
            </View>
            <TouchableOpacity onPress={() => router.push({ pathname: "/category/[id]", params: { id: "jobs" } })}>
              <Text style={styles.seeAll}>View all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.listingsCol}>
            {jobs.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
          </View>
        </Animated.View>
      )}

      {/* Recently added */}
      {recent.length > 0 && (
        <Animated.View entering={FadeInDown.delay(170).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Added</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/explore" as any)}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {isLoading ? (
            <View style={styles.listingsCol}>
              {Array(3).fill(null).map((_, i) => <SkeletonCard key={i} />)}
            </View>
          ) : (
            <View style={styles.listingsCol}>
              {recent.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
            </View>
          )}
        </Animated.View>
      )}

      {/* CTA for guests */}
      {!user && (
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <View style={styles.ctaBanner}>
            <View style={styles.ctaIconWrap}>
              <Ionicons name="megaphone" size={28} color={Colors.gold} />
            </View>
            <Text style={styles.ctaTitle}>Reach More Customers</Text>
            <Text style={styles.ctaText}>Post a free listing and connect with thousands across Kenya</Text>
            <View style={styles.ctaBtns}>
              <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push("/auth/signup")}>
                <Text style={styles.ctaBtnText}>Get Started Free</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.darkBg} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.ctaSecondaryBtn} onPress={() => router.push("/auth/index")}>
                <Text style={styles.ctaSecondaryBtnText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      <View style={{ height: isWeb ? 120 : 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBg },
  content: { paddingHorizontal: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 18, paddingBottom: 14 },
  headerLeft: { gap: 5, flex: 1 },
  greeting: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.textPrimary, letterSpacing: -0.4 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  locationText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted },
  locEnableChip: { backgroundColor: Colors.gold + "25", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  locEnableText: { fontFamily: "Inter_600SemiBold", fontSize: 10, color: Colors.gold },
  headerActions: { flexDirection: "row", gap: 6, alignItems: "center" },
  searchIconBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  notifBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center", position: "relative" },
  notifBtnActive: { borderColor: Colors.gold + "50", backgroundColor: Colors.green },
  notifBadge: { position: "absolute", top: -5, right: -5, width: 17, height: 17, borderRadius: 9, backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: Colors.darkBg },
  notifBadgeText: { fontFamily: "Inter_700Bold", fontSize: 9, color: Colors.darkBg },
  profileBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.green, borderWidth: 1.5, borderColor: Colors.gold, alignItems: "center", justifyContent: "center" },
  profileInitials: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.gold },
  searchTouchable: { marginBottom: 14 },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13 },
  searchPlaceholder: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted },
  searchFilter: { width: 28, height: 28, borderRadius: 8, backgroundColor: Colors.green + "60", alignItems: "center", justifyContent: "center" },
  statsScroll: { marginBottom: 14 },
  statsRow: { gap: 8 },
  statChip: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
  statChipValue: { fontFamily: "Inter_700Bold", fontSize: 13, color: Colors.textPrimary },
  statChipLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted },
  section: { marginBottom: 22 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.textPrimary },
  seeAll: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.gold },
  categoriesRow: { gap: 16 },
  categoryChip: { alignItems: "center", gap: 8 },
  categoryChipIcon: { width: 58, height: 58, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  categoryChipText: { fontFamily: "Inter_500Medium", fontSize: 11, color: Colors.textSecondary, textAlign: "center", maxWidth: 70 },
  locationCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: Colors.green + "25", borderWidth: 1, borderColor: Colors.gold + "30", borderRadius: 16, padding: 14, marginBottom: 18 },
  locationCardIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.green, borderWidth: 1, borderColor: Colors.gold + "40", alignItems: "center", justifyContent: "center" },
  locationCardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.textPrimary },
  locationCardText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  locationArrow: { width: 28, height: 28, borderRadius: 8, backgroundColor: Colors.gold + "20", alignItems: "center", justifyContent: "center" },
  locLoadingRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16, paddingLeft: 4 },
  locLoadingText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textMuted },
  featuredRow: { gap: 12 },
  listingsCol: { gap: 12 },
  ctaBanner: { backgroundColor: Colors.green, borderRadius: 22, borderWidth: 1, borderColor: Colors.gold + "30", padding: 22, alignItems: "center", gap: 10 },
  ctaIconWrap: { width: 60, height: 60, borderRadius: 20, backgroundColor: Colors.gold + "20", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.gold + "40" },
  ctaTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.textPrimary, textAlign: "center" },
  ctaText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary, textAlign: "center" },
  ctaBtns: { flexDirection: "row", gap: 10, marginTop: 4 },
  ctaBtn: { flex: 1, backgroundColor: Colors.gold, borderRadius: 12, paddingVertical: 13, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center" },
  ctaBtnText: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.darkBg },
  ctaSecondaryBtn: { flex: 1, borderWidth: 1, borderColor: Colors.gold + "50", borderRadius: 12, paddingVertical: 13, alignItems: "center", justifyContent: "center" },
  ctaSecondaryBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.gold },
});
