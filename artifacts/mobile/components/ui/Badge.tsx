import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";

interface BadgeProps {
  label: string;
  variant?: "gold" | "red" | "green" | "blue" | "purple";
  style?: ViewStyle;
}

const VARIANT_COLORS: Record<string, { bg: string; text: string }> = {
  gold: { bg: "rgba(201,168,76,0.2)", text: Colors.gold },
  red: { bg: "rgba(187,25,25,0.2)", text: "#E85C5C" },
  green: { bg: "rgba(26,92,56,0.3)", text: "#5ADE8A" },
  blue: { bg: "rgba(26,58,92,0.3)", text: "#6CA8E8" },
  purple: { bg: "rgba(58,26,92,0.3)", text: "#A87AE8" },
};

export function Badge({ label, variant = "gold", style }: BadgeProps) {
  const colors = VARIANT_COLORS[variant];
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.4,
  },
});
