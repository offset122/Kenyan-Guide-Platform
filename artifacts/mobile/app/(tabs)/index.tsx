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
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

import { Colors } from "@/constants/colors";
import { CATEGORIES } from "@/constants/data";
import { useAppContext } from "@/context/AppContext";
import { useMessaging } from "@/context/MessagingContext";
import { useLocation } from "@/context/LocationContext";
import { useNotifications } from "@/context/NotificationContext";
import { ListingCard } from "@/components/ListingCard";
import { FeaturedCard } from "@/components/FeaturedCard";
import { SkeletonCard } from "@/components/SkeletonCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PRODUCT_CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const { listings, user, isLoading } = useAppContext();
  const { totalUnread } = useMessaging();
  const { unreadCount: notifUnread } = useNotifications();
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
  const marketplaceProducts = useMemo(() =>
    listings.filter((l) => l.categoryId === "products" && l.available && l.photos && l.photos.length > 0).slice(0, 6),
    [listings]
  );

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
            style={[styles.notifBtn, notifUnread > 0 && styles.notifBtnActive]}
            onPress={() => router.push("/notifications" as any)}
          >
            <Ionicons name="notifications-outline" size={20} color={notifUnread > 0 ? Colors.gold : Colors.textSecondary} />
            {notifUnread > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{notifUnread > 9 ? "9+" : notifUnread}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.notifBtn, totalUnread > 0 && styles.notifBtnActive]}
            onPress={() => router.push("/messages" as any)}
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
            onPress={() => user ? router.push("/(tabs)/profile" as any) : router.push("/auth")}
          >
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.profileAvatar} contentFit="cover" />
            ) : user ? (
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

      {/* Marketplace Product Grid */}
      {marketplaceProducts.length > 0 && (
        <Animated.View entering={FadeInDown.delay(155).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="storefront-outline" size={16} color="#5CC8E8" />
              <Text style={styles.sectionTitle}>Marketplace</Text>
            </View>
            <TouchableOpacity onPress={() => router.push({ pathname: "/category/[id]", params: { id: "products" } })}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productGrid}>
            {marketplaceProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => router.push({ pathname: "/listing/[id]", params: { id: product.id } })}
                activeOpacity={0.88}
              >
                <Image
                  source={{ uri: product.photos![0] }}
                  style={styles.productImage}
                  contentFit="cover"
                  transition={200}
                />
                {product.badge && (
                  <View style={styles.productBadge}>
                    <Text style={styles.productBadgeText}>{product.badge}</Text>
                  </View>
                )}
                <View style={styles.productInfo}>
                  <Text style={styles.productTitle} numberOfLines={1}>{product.title}</Text>
                  <Text style={styles.productSubtitle} numberOfLines={1}>{product.subtitle}</Text>
                  {product.price && <Text style={styles.productPrice}>{product.price}</Text>}
                  <View style={styles.productMeta}>
                    <Ionicons name="location-outline" size={10} color={Colors.textMuted} />
                    <Text style={styles.productLocation} numberOfLines={1}>{product.location}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
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
              <TouchableOpacity style={styles.ctaSecondaryBtn} onPress={() => router.push("/auth")}>
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
  greeting: { fontFamily: "Inter_700Bold", fontSize: 23, color: Colors.textPrimary, letterSpacing: -0.5 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  locationText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted },
  locEnableChip: { backgroundColor: Colors.gold + "20", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: Colors.gold + "30" },
  locEnableText: { fontFamily: "Inter_600SemiBold", fontSize: 10, color: Colors.gold },
  headerActions: { flexDirection: "row", gap: 6, alignItems: "center" },
  searchIconBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, alignItems: "center", justifyContent: "center" },
  notifBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, alignItems: "center", justifyContent: "center", position: "relative" },
  notifBtnActive: { borderColor: Colors.gold + "50", backgroundColor: Colors.green + "80" },
  notifBadge: { position: "absolute", top: -5, right: -5, width: 17, height: 17, borderRadius: 9, backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: Colors.darkBg },
  notifBadgeText: { fontFamily: "Inter_700Bold", fontSize: 9, color: Colors.darkBg },
  profileBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.green, borderWidth: 1.5, borderColor: Colors.gold + "80", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  profileAvatar: { width: "100%", height: "100%" },
  profileInitials: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.gold },
  searchTouchable: { marginBottom: 14 },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 14 },
  searchPlaceholder: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted },
  searchFilter: { width: 30, height: 30, borderRadius: 9, backgroundColor: "rgba(201,168,76,0.12)", borderWidth: 1, borderColor: "rgba(201,168,76,0.25)", alignItems: "center", justifyContent: "center" },
  statsScroll: { marginBottom: 16 },
  statsRow: { gap: 8 },
  statChip: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  statChipValue: { fontFamily: "Inter_700Bold", fontSize: 13, color: Colors.textPrimary },
  statChipLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.textPrimary, letterSpacing: -0.3 },
  seeAll: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.gold },
  categoriesRow: { gap: 18 },
  categoryChip: { alignItems: "center", gap: 8 },
  categoryChipIcon: { width: 58, height: 58, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  categoryChipText: { fontFamily: "Inter_500Medium", fontSize: 11, color: Colors.textSecondary, textAlign: "center", maxWidth: 70 },
  locationCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorderStrong, borderRadius: 18, padding: 14, marginBottom: 18 },
  locationCardIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: Colors.green, borderWidth: 1, borderColor: Colors.gold + "40", alignItems: "center", justifyContent: "center" },
  locationCardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.textPrimary },
  locationCardText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  locationArrow: { width: 30, height: 30, borderRadius: 9, backgroundColor: Colors.glassHighlight, borderWidth: 1, borderColor: Colors.glassBorder, alignItems: "center", justifyContent: "center" },
  locLoadingRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16, paddingLeft: 4 },
  locLoadingText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textMuted },
  featuredRow: { gap: 12 },
  listingsCol: { gap: 12 },
  productGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  productCard: { width: PRODUCT_CARD_WIDTH, backgroundColor: Colors.darkCard, borderRadius: 18, borderWidth: 1, borderColor: Colors.glassBorder, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  productImage: { width: "100%", height: 130 },
  productBadge: { position: "absolute", top: 8, left: 8, backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 7, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: "rgba(201,168,76,0.25)" },
  productBadgeText: { fontFamily: "Inter_700Bold", fontSize: 9, color: Colors.gold, letterSpacing: 0.4 },
  productInfo: { padding: 10, gap: 3 },
  productTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.textPrimary },
  productSubtitle: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textSecondary },
  productPrice: { fontFamily: "Inter_700Bold", fontSize: 13, color: Colors.gold, marginTop: 2 },
  productMeta: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 2 },
  productLocation: { fontFamily: "Inter_400Regular", fontSize: 10, color: Colors.textMuted, flex: 1 },
  ctaBanner: { backgroundColor: Colors.darkCard, borderRadius: 24, borderWidth: 1, borderColor: Colors.glassBorderStrong, padding: 24, alignItems: "center", gap: 10 },
  ctaIconWrap: { width: 64, height: 64, borderRadius: 22, backgroundColor: "rgba(201,168,76,0.12)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.glassBorderStrong },
  ctaTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.textPrimary, textAlign: "center", letterSpacing: -0.3 },
  ctaText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary, textAlign: "center" },
  ctaBtns: { flexDirection: "row", gap: 10, marginTop: 4 },
  ctaBtn: { flex: 1, backgroundColor: Colors.gold, borderRadius: 14, paddingVertical: 14, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center" },
  ctaBtnText: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.darkBg },
  ctaSecondaryBtn: { flex: 1, borderWidth: 1, borderColor: Colors.glassBorderStrong, borderRadius: 14, paddingVertical: 14, alignItems: "center", justifyContent: "center" },
  ctaSecondaryBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.gold },
});
