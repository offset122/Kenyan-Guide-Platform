import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { Colors } from "@/constants/colors";
import { LISTINGS, CATEGORIES } from "@/constants/data";
import { StarRating } from "@/components/ui/StarRating";
import { Badge } from "@/components/ui/Badge";

const BADGE_VARIANT_MAP: Record<string, "gold" | "red" | "green" | "blue" | "purple"> = {
  "Top Rated": "gold",
  "Verified Pro": "green",
  "Premium": "blue",
  "Verified": "green",
  "24/7": "red",
  "Official": "blue",
  "Hot": "red",
  "Urgent": "red",
  "Featured": "gold",
  "New": "green",
};

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const [saved, setSaved] = useState(false);

  const listing = LISTINGS.find((l) => l.id === id);
  const category = listing ? CATEGORIES.find((c) => c.id === listing.categoryId) : null;

  const Icon = category?.iconSet === "MaterialIcons" ? MaterialIcons : Ionicons;

  if (!listing) {
    return (
      <View style={[styles.container, { paddingTop: topPadding }]}>
        <TouchableOpacity style={[styles.backBtn, { margin: 16 }]} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.notFoundText}>Listing not found</Text>
        </View>
      </View>
    );
  }

  const handleCall = () => {
    if (listing.phone) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Linking.openURL(`tel:${listing.phone}`);
    }
  };

  const handleSave = () => {
    Haptics.selectionAsync();
    setSaved((prev) => !prev);
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerLabel}>{category?.title ?? "Listing"}</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={20}
            color={saved ? Colors.gold : Colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: isWeb ? 120 : insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileSection}>
          <View style={[styles.bigAvatar, { backgroundColor: category?.color ?? Colors.darkCard }]}>
            {category && (
              /* @ts-ignore */
              <Icon name={category.icon} size={40} color={category.accentColor} />
            )}
            {listing.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={22} color={Colors.gold} />
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.bigTitle}>{listing.title}</Text>
              {listing.badge && (
                <Badge label={listing.badge} variant={BADGE_VARIANT_MAP[listing.badge] ?? "gold"} />
              )}
            </View>
            <Text style={styles.bigSubtitle}>{listing.subtitle}</Text>
            <StarRating rating={listing.rating} reviewCount={listing.reviewCount} size={14} />

            <View style={styles.locationRow}>
              <Ionicons name="location" size={13} color={Colors.gold} />
              <Text style={styles.location}>{listing.location}</Text>
            </View>
          </View>
        </View>

        {/* Available Status */}
        {listing.available !== undefined && (
          <View style={[
            styles.statusRow,
            listing.available ? styles.statusAvailable : styles.statusUnavailable,
          ]}>
            <View style={[
              styles.statusDot,
              { backgroundColor: listing.available ? "#5ADE8A" : Colors.textMuted },
            ]} />
            <Text style={[
              styles.statusText,
              { color: listing.available ? "#5ADE8A" : Colors.textMuted },
            ]}>
              {listing.available ? "Available Now" : "Currently Unavailable"}
            </Text>
          </View>
        )}

        {/* Price */}
        {listing.price && (
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Price / Rate</Text>
            <Text style={styles.priceValue}>{listing.price}</Text>
          </View>
        )}

        {/* Description */}
        <View style={styles.descCard}>
          <Text style={styles.descTitle}>About</Text>
          <Text style={styles.descText}>{listing.description}</Text>
        </View>

        {/* Tags */}
        <View style={styles.tagsSection}>
          <Text style={styles.sectionLabel}>Specialities</Text>
          <View style={styles.tagWrap}>
            {listing.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contact */}
        {listing.phone && (
          <View style={styles.contactCard}>
            <Text style={styles.sectionLabel}>Contact</Text>
            <View style={styles.contactRow}>
              <Ionicons name="call" size={16} color={Colors.gold} />
              <Text style={styles.phoneText}>{listing.phone}</Text>
            </View>
          </View>
        )}

        {/* Reviews Preview */}
        <View style={styles.reviewsCard}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionLabel}>Reviews</Text>
            <StarRating rating={listing.rating} reviewCount={listing.reviewCount} size={14} />
          </View>
          <View style={styles.ratingBar}>
            {[5, 4, 3, 2, 1].map((star) => {
              const pct = star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : star === 2 ? 2 : 1;
              return (
                <View key={star} style={styles.ratingRow}>
                  <Text style={styles.starNum}>{star}</Text>
                  <Ionicons name="star" size={10} color={Colors.gold} />
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${pct}%` }]} />
                  </View>
                  <Text style={styles.pctText}>{pct}%</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* CTA Bar */}
      <View style={[
        styles.ctaBar,
        { paddingBottom: isWeb ? 34 : insets.bottom + 12 },
      ]}>
        {listing.phone ? (
          <>
            <TouchableOpacity style={styles.msgBtn}>
              <Ionicons name="chatbubble-outline" size={20} color={Colors.gold} />
              <Text style={styles.msgBtnText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
              <Ionicons name="call" size={20} color={Colors.darkBg} />
              <Text style={styles.callBtnText}>Call Now</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={[styles.callBtn, { flex: 1 }]}>
            <Ionicons name="arrow-forward" size={20} color={Colors.darkBg} />
            <Text style={styles.callBtnText}>Apply Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.darkCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.textSecondary,
    flex: 1,
  },
  saveBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.darkCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, gap: 16 },
  profileSection: {
    flexDirection: "row",
    gap: 16,
    alignItems: "flex-start",
    paddingBottom: 8,
  },
  bigAvatar: {
    width: 80,
    height: 80,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: Colors.darkBg,
    borderRadius: 12,
    padding: 1,
  },
  profileInfo: { flex: 1, gap: 6 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  bigTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    flex: 1,
  },
  bigSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  location: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textMuted,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusAvailable: {
    backgroundColor: "rgba(90,222,138,0.1)",
    borderColor: "rgba(90,222,138,0.3)",
  },
  statusUnavailable: {
    backgroundColor: "rgba(107,123,104,0.1)",
    borderColor: "rgba(107,123,104,0.2)",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  priceCard: {
    backgroundColor: Colors.darkCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textMuted,
  },
  priceValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.gold,
    letterSpacing: -0.3,
  },
  descCard: {
    backgroundColor: Colors.darkCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  descTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.textPrimary,
  },
  descText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  tagsSection: { gap: 10 },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.green + "40",
    borderWidth: 1,
    borderColor: Colors.green,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  contactCard: {
    backgroundColor: Colors.darkCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  phoneText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.textPrimary,
  },
  reviewsCard: {
    backgroundColor: Colors.darkCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingBar: { gap: 6 },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  starNum: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
    width: 8,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.darkCardElevated,
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: 6,
    backgroundColor: Colors.gold,
    borderRadius: 3,
  },
  pctText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.textMuted,
    width: 28,
    textAlign: "right",
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.textMuted,
  },
  ctaBar: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.darkBg,
  },
  msgBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(201,168,76,0.15)",
    borderWidth: 1,
    borderColor: Colors.gold + "40",
    borderRadius: 14,
    paddingVertical: 14,
  },
  msgBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.gold,
  },
  callBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.gold,
    borderRadius: 14,
    paddingVertical: 14,
  },
  callBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: Colors.darkBg,
  },
});
