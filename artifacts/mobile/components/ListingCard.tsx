import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { Image } from "expo-image";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { CATEGORIES } from "@/constants/data";
import { Listing } from "@/context/AppContext";
import { useAppContext } from "@/context/AppContext";
import { StarRating } from "./ui/StarRating";
import { Badge } from "./ui/Badge";

interface ListingCardProps {
  listing: Listing;
  compact?: boolean;
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
  "Popular": "purple",
};

const IMAGE_CATEGORIES = new Set(["products", "realestate"]);

export function ListingCard({ listing, compact }: ListingCardProps) {
  const { isSaved, toggleSaved, user } = useAppContext();
  const category = CATEGORIES.find((c) => c.id === listing.categoryId);
  const saved = isSaved(listing.id);
  const hasImage = !!(listing.photos && listing.photos.length > 0);
  const showImageLayout = IMAGE_CATEGORIES.has(listing.categoryId) && hasImage;

  const handlePress = () => {
    Haptics.selectionAsync();
    router.push({ pathname: "/listing/[id]", params: { id: listing.id } });
  };

  const handleCall = () => {
    if (listing.phone) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Linking.openURL(`tel:${listing.phone.replace(/\s/g, "")}`);
    }
  };

  const handleSave = () => {
    if (!user) { router.push("/auth"); return; }
    Haptics.selectionAsync();
    toggleSaved(listing.id);
  };

  const Icon = category?.iconSet === "MaterialIcons" ? MaterialIcons : Ionicons;

  if (showImageLayout) {
    return (
      <TouchableOpacity style={styles.imageCard} onPress={handlePress} activeOpacity={0.88}>
        {/* Image */}
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: listing.photos![0] }}
            style={styles.cardImage}
            contentFit="cover"
            transition={200}
          />
          {listing.badge && (
            <View style={styles.imageBadgeOverlay}>
              <Badge label={listing.badge} variant={BADGE_VARIANT_MAP[listing.badge] ?? "gold"} />
            </View>
          )}
          <TouchableOpacity style={styles.imageBookmarkBtn} onPress={handleSave} hitSlop={8}>
            <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={16} color={saved ? Colors.gold : "#fff"} />
          </TouchableOpacity>
          {listing.photos!.length > 1 && (
            <View style={styles.photoCountBadge}>
              <Ionicons name="images-outline" size={10} color="#fff" />
              <Text style={styles.photoCountText}>{listing.photos!.length}</Text>
            </View>
          )}
          {listing.available === false && (
            <View style={styles.unavailableOverlay}>
              <Text style={styles.unavailableText}>Unavailable</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.imageInfo}>
          <View style={styles.imageTitleRow}>
            <Text style={styles.imageTitle} numberOfLines={1}>{listing.title}</Text>
          </View>
          <Text style={styles.imageSubtitle} numberOfLines={1}>{listing.subtitle}</Text>
          <View style={styles.imageMeta}>
            <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
            <Text style={styles.imageLocation} numberOfLines={1}>{listing.location}</Text>
          </View>
          <View style={styles.imageFooter}>
            {listing.price && <Text style={styles.imagePrice}>{listing.price}</Text>}
            <View style={styles.imageFooterRight}>
              <StarRating rating={listing.rating} size={11} />
              {listing.phone && (
                <TouchableOpacity style={styles.callBtnSmall} onPress={handleCall}>
                  <Ionicons name="call" size={14} color={Colors.gold} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.85}>
      <View style={styles.row}>
        {/* Avatar / thumbnail */}
        <View style={styles.avatarWrap}>
          {hasImage ? (
            <Image
              source={{ uri: listing.photos![0] }}
              style={styles.avatarImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: category?.color ?? Colors.darkCard }]}>
              {/* @ts-ignore */}
              {category && <Icon name={category.icon} size={20} color={category.accentColor} />}
            </View>
          )}
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

        {/* Bookmark */}
        <TouchableOpacity style={styles.bookmarkBtn} onPress={handleSave} hitSlop={8}>
          <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={18} color={saved ? Colors.gold : Colors.textMuted} />
        </TouchableOpacity>
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
            <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
              <Ionicons name="call" size={16} color={Colors.gold} />
            </TouchableOpacity>
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
  // Standard card
  card: {
    backgroundColor: Colors.darkCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 12,
    overflow: "hidden",
  },
  row: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 14,
  },
  verifiedDot: { position: "absolute", bottom: -2, right: -2 },
  info: { flex: 1, gap: 3 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.textPrimary, flex: 1 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary },
  meta: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 2 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  location: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted },
  bookmarkBtn: { padding: 4 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  tags: { flexDirection: "row", gap: 6, flex: 1 },
  tag: { backgroundColor: "rgba(201,168,76,0.1)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textSecondary },
  footerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  price: { fontFamily: "Inter_700Bold", fontSize: 13, color: Colors.gold },
  callBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: "rgba(201,168,76,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  unavailableOverlay: {
    position: "absolute", inset: 0,
    backgroundColor: "rgba(10,26,16,0.7)",
    alignItems: "center", justifyContent: "center",
  },
  unavailableText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.textMuted },

  // Image card (products / real estate)
  imageCard: {
    backgroundColor: Colors.darkCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  imageWrap: { position: "relative", width: "100%", height: 180 },
  cardImage: { width: "100%", height: "100%" },
  imageBadgeOverlay: { position: "absolute", top: 10, left: 10 },
  imageBookmarkBtn: {
    position: "absolute", top: 10, right: 10,
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center", justifyContent: "center",
  },
  photoCountBadge: {
    position: "absolute", bottom: 10, right: 10,
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8,
  },
  photoCountText: { fontFamily: "Inter_600SemiBold", fontSize: 10, color: "#fff" },
  imageInfo: { padding: 12, gap: 5 },
  imageTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  imageTitle: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.textPrimary, flex: 1 },
  imageSubtitle: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary },
  imageMeta: { flexDirection: "row", alignItems: "center", gap: 3 },
  imageLocation: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted, flex: 1 },
  imageFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  imagePrice: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.gold },
  imageFooterRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  callBtnSmall: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: "rgba(201,168,76,0.15)",
    alignItems: "center", justifyContent: "center",
  },
});
