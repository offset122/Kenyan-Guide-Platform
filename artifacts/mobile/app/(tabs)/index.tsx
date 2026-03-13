import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { Colors } from "@/constants/colors";
import { CATEGORIES, LISTINGS } from "@/constants/data";
import { CategoryCard } from "@/components/CategoryCard";
import { ListingCard } from "@/components/ListingCard";
import { SearchBar } from "@/components/SearchBar";

const { width } = Dimensions.get("window");

const POPULAR_SEARCHES = ["Plumber", "Apartments", "Driver Jobs", "Electrician", "Land Sale"];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const topPadding = isWeb ? 67 : insets.top + 8;
  const bottomPadding = isWeb ? 34 : 0;

  const featuredListings = LISTINGS.filter((l) => l.badge === "Featured" || l.badge === "Top Rated").slice(0, 4);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPadding + 20, paddingBottom: bottomPadding + 100 },
      ]}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good day</Text>
          <Text style={styles.tagline}>Find what Kenya offers</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.section}>
        <SearchBar onPress={() => router.push("/search")} />
      </View>

      {/* Popular searches */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll} contentContainerStyle={styles.pillContent}>
        {POPULAR_SEARCHES.map((term) => (
          <TouchableOpacity key={term} style={styles.pill} onPress={() => router.push("/search")}>
            <Text style={styles.pillText}>{term}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Hero Banner */}
      <View style={styles.heroWrap}>
        <LinearGradient
          colors={[Colors.green, Colors.greenDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>TRUSTED PLATFORM</Text>
            </View>
            <Text style={styles.heroTitle}>Everything Kenya Needs.</Text>
            <Text style={styles.heroTitle}>In One Place.</Text>
            <Text style={styles.heroSub}>4,820+ verified providers · 6 categories</Text>
          </View>
          <View style={styles.heroAccent}>
            <Ionicons name="shield-checkmark" size={64} color={Colors.gold + "40"} />
          </View>
        </LinearGradient>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Explore Categories</Text>
          <TouchableOpacity onPress={() => router.push("/explore" as any)}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </View>
      </View>

      {/* Featured Listings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Listings</Text>
        </View>
        <View style={styles.listingList}>
          {featuredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </View>
      </View>

      {/* Trust Banner */}
      <View style={styles.trustBanner}>
        <View style={styles.trustItem}>
          <Ionicons name="shield-checkmark" size={22} color={Colors.gold} />
          <Text style={styles.trustLabel}>Verified</Text>
        </View>
        <View style={styles.trustDivider} />
        <View style={styles.trustItem}>
          <Ionicons name="star" size={22} color={Colors.gold} />
          <Text style={styles.trustLabel}>Rated</Text>
        </View>
        <View style={styles.trustDivider} />
        <View style={styles.trustItem}>
          <Ionicons name="location" size={22} color={Colors.gold} />
          <Text style={styles.trustLabel}>Local</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkBg,
  },
  content: {
    paddingHorizontal: 16,
    gap: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  greeting: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
  tagline: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: Colors.darkCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gold,
  },
  section: {
    marginBottom: 28,
  },
  pillScroll: {
    marginBottom: 20,
    marginHorizontal: -16,
  },
  pillContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: "row",
  },
  pill: {
    backgroundColor: Colors.darkCard,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  heroWrap: {
    marginBottom: 28,
    borderRadius: 20,
    overflow: "hidden",
  },
  hero: {
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.gold + "30",
  },
  heroContent: {
    flex: 1,
    gap: 6,
  },
  heroBadge: {
    backgroundColor: Colors.gold + "30",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  heroBadgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    color: Colors.gold,
    letterSpacing: 1,
  },
  heroTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  heroSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  heroAccent: {
    opacity: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  seeAll: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.gold,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  listingList: {
    gap: 12,
  },
  trustBanner: {
    backgroundColor: Colors.darkCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  trustItem: {
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  trustLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: Colors.textSecondary,
  },
  trustDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
});
