import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

import { Colors } from "@/constants/colors";
import { CATEGORIES } from "@/constants/data";
import { Listing } from "@/context/AppContext";
import { useAppContext } from "@/context/AppContext";

interface FeaturedCardProps {
  listing: Listing;
}

export function FeaturedCard({ listing }: FeaturedCardProps) {
  const { isSaved, toggleSaved, user } = useAppContext();
  const category = CATEGORIES.find((c) => c.id === listing.categoryId);
  const saved = isSaved(listing.id);
  const Icon = category?.iconSet === "MaterialIcons" ? MaterialIcons : Ionicons;

  const handlePress = () => {
    Haptics.selectionAsync();
    router.push({ pathname: "/listing/[id]", params: { id: listing.id } });
  };

  const handleSave = () => {
    if (!user) { router.push("/auth/index"); return; }
    Haptics.selectionAsync();
    toggleSaved(listing.id);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.9}>
      <LinearGradient
        colors={[category?.color ?? Colors.green, Colors.darkCard]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Category icon */}
        <View style={styles.iconWrap}>
          {category ? (
            /* @ts-ignore */
            <Icon name={category.icon} size={22} color={category.accentColor} />
          ) : <Ionicons name="grid-outline" size={22} color={Colors.gold} />}
        </View>

        {/* Badge */}
        {listing.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{listing.badge}</Text>
          </View>
        )}

        {/* Bookmark */}
        <TouchableOpacity style={styles.bookmarkBtn} onPress={handleSave} hitSlop={8}>
          <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={16} color={saved ? Colors.gold : "rgba(255,255,255,0.7)"} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{listing.subtitle}</Text>

        {listing.rating > 0 && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={11} color={Colors.gold} />
            <Text style={styles.ratingText}>{listing.rating.toFixed(1)}</Text>
          </View>
        )}

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={10} color={Colors.textMuted} />
          <Text style={styles.location} numberOfLines={1}>{listing.location}</Text>
        </View>

        {listing.price && <Text style={styles.price}>{listing.price}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 168,
    backgroundColor: Colors.darkCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  gradient: {
    height: 120,
    padding: 12,
    position: "relative",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: Colors.gold,
  },
  bookmarkBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    padding: 12,
    gap: 4,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.textSecondary,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    color: Colors.gold,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  location: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: Colors.textMuted,
  },
  price: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    color: Colors.gold,
    marginTop: 2,
  },
});
