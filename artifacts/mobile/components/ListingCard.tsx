import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { Listing, CATEGORIES } from "@/constants/data";
import { StarRating } from "./ui/StarRating";
import { Badge } from "./ui/Badge";

interface ListingCardProps {
  listing: Listing;
}

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

export function ListingCard({ listing }: ListingCardProps) {
  const category = CATEGORIES.find((c) => c.id === listing.categoryId);
  const initials = listing.title.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const handlePress = () => {
    Haptics.selectionAsync();
    router.push({ pathname: "/listing/[id]", params: { id: listing.id } });
  };

  const handleCall = () => {
    if (listing.phone) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const Icon = category?.iconSet === "MaterialIcons" ? MaterialIcons : Ionicons;

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.85}>
      <View style={styles.row}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: category?.color ?? Colors.darkCard }]}>
          {/* @ts-ignore */}
          {category && <Icon name={category.icon} size={20} color={category.accentColor} />}
          {listing.verified && (
            <View style={styles.verifiedDot}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.gold} />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
            {listing.badge && (
              <Badge label={listing.badge} variant={BADGE_VARIANT_MAP[listing.badge] ?? "gold"} />
            )}
          </View>
          <Text style={styles.subtitle} numberOfLines={1}>{listing.subtitle}</Text>
          <View style={styles.meta}>
            <StarRating rating={listing.rating} reviewCount={listing.reviewCount} />
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
              <Text style={styles.location} numberOfLines={1}>{listing.location}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.tags}>
          {listing.tags.slice(0, 2).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footerRight}>
          {listing.price && (
            <Text style={styles.price}>{listing.price}</Text>
          )}
          {listing.phone && (
            <Pressable style={styles.callBtn} onPress={handleCall}>
              <Ionicons name="call" size={16} color={Colors.gold} />
            </Pressable>
          )}
        </View>
      </View>

      {listing.available === false && (
        <View style={styles.unavailableOverlay}>
          <Text style={styles.unavailableText}>Unavailable</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.darkCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 12,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  verifiedDot: {
    position: "absolute",
    bottom: -2,
    right: -2,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.textPrimary,
    flex: 1,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  location: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.textMuted,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  tags: {
    flexDirection: "row",
    gap: 6,
    flex: 1,
  },
  tag: {
    backgroundColor: "rgba(201,168,76,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.textSecondary,
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  price: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: Colors.gold,
  },
  callBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(201,168,76,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  unavailableOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(10,26,16,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  unavailableText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.textMuted,
  },
});
