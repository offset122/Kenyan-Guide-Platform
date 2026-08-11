import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { Image } from "expo-image";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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
      <TouchableOpacity style={styles.imageCard} onPress={handlePress} activeOpacity={0.9}>
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: listing.photos![0] }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient
            colors={["transparent", "rgba(5,12,8,0.82)"]}
            style={StyleSheet.absoluteFill}
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
          {/* Bottom info overlay on image */}
          <View style={styles.imageOverlayInfo}>
            <Text style={styles.imageOverlayTitle} numberOfLines={1}>{listing.title}</Text>
            <View style={styles.imageOverlayRow}>
              <Ionicons name="location-outline" size={10} color="rgba(255,255,255,0.7)" />
              <Text style={styles.imageOverlayLocation} numberOfLines={1}>{listing.location}</Text>
              {listing.price && <Text style={styles.imageOverlayPrice}>{listing.price}</Text>}
            </View>
          </View>
          {listing.available === false && (
            <View style={styles.unavailableOverlay}>
              <Text style={styles.unavailableText}>Unavailable</Text>
            </View>
          )}
        </View>

        {/* Glass info strip */}
        <View style={styles.imageGlassInfo}>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={styles.imageSubtitle} numberOfLines={1}>{listing.subtitle}</Text>
            <View style={styles.imageMetaRow}>
              <StarRating rating={listing.rating} reviewCount={listing.reviewCount} size={11} />
            </View>
          </View>
          <View style={styles.imageActions}>
            {listing.phone && (
              <TouchableOpacity style={styles.callBtnSmall} onPress={handleCall}>
                <Ionicons name="call" size={14} color={Colors.gold} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.88}>
      {/* Subtle top highlight line */}
      <View style={styles.cardHighlight} />

      <View style={styles.row}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          {hasImage ? (
            <Image
              source={{ uri: listing.photos![0] }}
              style={styles.avatarImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <LinearGradient
              colors={[category?.color ?? Colors.green, Colors.darkBg]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              {/* @ts-ignore */}
              {category && <Icon name={category.icon} size={22} color={category.accentColor} />}
            </LinearGradient>
          )}
          {listing.verified && (
            <View style={styles.verifiedDot}>
              <Ionicons name="checkmark-circle" size={15} color={Colors.gold} />
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
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={18}
            color={saved ? Colors.gold : Colors.textMuted}
          />
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
          {listing.price && <Text style={styles.price}>{listing.price}</Text>}
          {listing.phone && (
            <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
              <Ionicons name="call" size={15} color={Colors.gold} />
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
  // ── Standard glass card ──────────────────────────────────────────
  card: {
    backgroundColor: Colors.darkCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: 14,
    gap: 12,
    overflow: "hidden",
    // subtle shadow depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHighlight: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: "rgba(201,168,76,0.2)",
    borderRadius: 1,
  },
  row: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 54,
    height: 54,
    borderRadius: 16,
  },
  verifiedDot: { position: "absolute", bottom: -3, right: -3 },
  info: { flex: 1, gap: 4 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.textPrimary, flex: 1 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary },
  meta: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 2 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  location: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted },
  bookmarkBtn: { padding: 4 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  tags: { flexDirection: "row", gap: 6, flex: 1 },
  tag: {
    backgroundColor: Colors.glassHighlight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: { fontFamily: "Inter_500Medium", fontSize: 11, color: Colors.textSecondary },
  footerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  price: { fontFamily: "Inter_700Bold", fontSize: 13, color: Colors.gold },
  callBtn: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "rgba(201,168,76,0.12)",
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  unavailableOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(8,15,10,0.75)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  unavailableText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.textMuted },

  // ── Image card (products / real estate) ─────────────────────────
  imageCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: "hidden",
    backgroundColor: Colors.darkCardSolid,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  imageWrap: { width: "100%", height: 200, position: "relative", justifyContent: "flex-end", padding: 12 },
  imageBadgeOverlay: { position: "absolute", top: 12, left: 12 },
  imageBookmarkBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoCountBadge: {
    position: "absolute",
    bottom: 52,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  photoCountText: { fontFamily: "Inter_600SemiBold", fontSize: 10, color: "#fff" },
  imageOverlayInfo: { gap: 4 },
  imageOverlayTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#fff" },
  imageOverlayRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  imageOverlayLocation: { fontFamily: "Inter_400Regular", fontSize: 11, color: "rgba(255,255,255,0.7)", flex: 1 },
  imageOverlayPrice: { fontFamily: "Inter_700Bold", fontSize: 13, color: Colors.gold },
  imageGlassInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingTop: 10,
    backgroundColor: Colors.darkCard,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 10,
  },
  imageSubtitle: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary },
  imageMetaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  imageActions: { flexDirection: "row", gap: 8 },
  callBtnSmall: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(201,168,76,0.12)",
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
});
