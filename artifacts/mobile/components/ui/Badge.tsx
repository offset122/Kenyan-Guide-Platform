import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";

interface BadgeProps {
  label: string;
  variant?: "gold" | "red" | "green" | "blue" | "purple";
  style?: ViewStyle;
}

const VARIANT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  gold:   { bg: "rgba(201,168,76,0.15)",  border: "rgba(201,168,76,0.4)",  text: Colors.gold },
  red:    { bg: "rgba(232,92,92,0.12)",   border: "rgba(232,92,92,0.35)",  text: "#E85C5C" },
  green:  { bg: "rgba(90,222,138,0.1)",   border: "rgba(90,222,138,0.3)",  text: "#5ADE8A" },
  blue:   { bg: "rgba(108,168,232,0.1)",  border: "rgba(108,168,232,0.3)", text: "#6CA8E8" },
  purple: { bg: "rgba(168,122,232,0.1)",  border: "rgba(168,122,232,0.3)", text: "#A87AE8" },
};

export function Badge({ label, variant = "gold", style }: BadgeProps) {
  const c = VARIANT_COLORS[variant];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.border }, style]}>
      <Text style={[styles.label, { color: c.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    borderWidth: 1,
  },
  label: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
