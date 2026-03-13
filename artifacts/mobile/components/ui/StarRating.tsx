import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: number;
}

export function StarRating({ rating, reviewCount, size = 12 }: StarRatingProps) {
  return (
    <View style={styles.row}>
      <Ionicons name="star" size={size} color={Colors.gold} />
      <Text style={[styles.rating, { fontSize: size }]}>{rating.toFixed(1)}</Text>
      {reviewCount !== undefined && (
        <Text style={[styles.count, { fontSize: size - 1 }]}>({reviewCount})</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  rating: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
  },
  count: {
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
});
