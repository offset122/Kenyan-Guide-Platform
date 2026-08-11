import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
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
  const hasPhoto = !!(listing.photos && listing.photos.length > 0);

  const handlePress = () => {
    Haptics.selectionAsync();
    router.push({ pathname: "/listing/[id]", params: { id: listing.id } });
  };

  const handleSave = () => {
    if (!user) { router.push("/auth"); return; }
    Haptics.selectionAsync();
    toggleSaved(listing.id);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.88}>
      {/* Image / gradient area */}
      <View style={styles.imageArea}>
        {hasPhoto ? (
          <>
            <Image
              source={{ uri: listing.photos![0] }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={300}
            />
            <LinearGradient
              colors={["transparent", "rgba(5,12,8,0.88)"]}
              style={StyleSheet.absoluteFill}
            />
          </>
        ) : (
          <LinearGradient
            colors={[category?.color ?? Colors.green, Colors.darkBg]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}

        {/* Category icon when no photo */}
        {!hasPhoto && (
          <View style={styles.iconWrap}>
            {category ? (
              /* @ts-ignore */
              <Icon name={category.icon} size={24} color={category.accentColor} />
            ) : <Ionicons name="grid-outline" size={24} color={Colors.gold} />}
          </View>
        )}

        {/* Badge */}
        {listing.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{listing.badge}</Text>
          </View>
        )}

        {/* Bookmark */}
        <TouchableOpacity style={styles.bookmarkBtn} onPress={handleSave} hitSlop={8}>
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={15}
            color={saved ? Colors.gold : "rgba(255,255,255,0.9)"}
          />
        </TouchableOpacity>

        {listing.verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={10} color={Colors.gold} />
          </View>
        )}
      </View>

      {/* Glass info panel */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{listing.subtitle}</Text>

        {listing.rating > 0 && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={11} color={Colors.gold} />
            <Text style={styles.ratingText}>{listing.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({listing.reviewCount})</Text>
          </View>
        )}

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={10} color={Colors.textMuted} />
          <Text style={styles.location} numberOfLines={1}>{listing.location}</Text>
        </View>

        {listing.price && <Text style={styles.price}>{listing.price}</Text>}
      </View>

      {/* Bottom accent */}
      <View style={styles.bottomAccent} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 175,
    backgroundColor: Colors.darkCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  imageArea: {
    height: 132,
    position: "relative",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 10,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.3)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  badgeText: { fontFamily: "Inter_700Bold", fontSize: 9, color: Colors.gold, letterSpacing: 0.4 },
  bookmarkBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    padding: 12,
    gap: 4,
    backgroundColor: Colors.darkCard,
  },
  title: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.textPrimary },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textSecondary },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingText: { fontFamily: "Inter_700Bold", fontSize: 11, color: Colors.gold },
  reviewCount: { fontFamily: "Inter_400Regular", fontSize: 10, color: Colors.textMuted },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  location: { fontFamily: "Inter_400Regular", fontSize: 10, color: Colors.textMuted },
  price: { fontFamily: "Inter_700Bold", fontSize: 13, color: Colors.gold, marginTop: 2 },
  bottomAccent: {
    height: 2,
    backgroundColor: "rgba(201,168,76,0.25)",
  },
});
