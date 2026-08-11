import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import { Category } from "@/constants/data";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

interface CategoryCardProps {
  category: Category;
  count?: number;
}

export function CategoryCard({ category, count }: CategoryCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const Icon = category.iconSet === "MaterialIcons" ? MaterialIcons : Ionicons;

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({ pathname: "/category/[id]", params: { id: category.id } })}
        onPressIn={() => { scale.value = withSpring(0.95, { damping: 15 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
        activeOpacity={1}
      >
        {/* Top highlight */}
        <View style={[styles.topHighlight, { backgroundColor: category.accentColor + "30" }]} />

        {/* Icon area with gradient */}
        <LinearGradient
          colors={[category.color, category.color + "80"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconWrap}
        >
          <View style={[styles.iconGlow, { backgroundColor: category.accentColor + "25" }]} />
          {/* @ts-ignore */}
          <Icon name={category.icon} size={26} color={category.accentColor} />
        </LinearGradient>

        <Text style={styles.title} numberOfLines={1}>{category.title}</Text>
        <Text style={styles.subtitle} numberOfLines={2}>{category.subtitle}</Text>

        {count != null && (
          <View style={[styles.countBadge, { borderColor: category.accentColor + "30" }]}>
            <Text style={[styles.count, { color: category.accentColor }]}>
              {count} listed
            </Text>
          </View>
        )}

        {/* Bottom accent line */}
        <View style={[styles.bottomAccent, { backgroundColor: category.accentColor + "40" }]} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.darkCard,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: 16,
    gap: 9,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  topHighlight: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    borderRadius: 1,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  iconGlow: {
    position: "absolute",
    inset: 0,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  countBadge: {
    borderRadius: 7,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    backgroundColor: Colors.glassHighlight,
  },
  count: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  bottomAccent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
});
