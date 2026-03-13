import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import { Category } from "@/constants/data";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    router.push({ pathname: "/category/[id]", params: { id: category.id } });
  };

  const Icon = category.iconSet === "MaterialIcons" ? MaterialIcons : Ionicons;

  return (
    <Animated.View style={[animatedStyle]}>
      <TouchableOpacity
        style={[styles.card, { borderColor: category.accentColor + "30" }]}
        onPress={handlePress}
        onPressIn={() => { scale.value = withSpring(0.96); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        activeOpacity={1}
      >
        <View style={[styles.iconWrap, { backgroundColor: category.color }]}>
          <View style={[styles.iconGlow, { backgroundColor: category.accentColor + "30" }]} />
          {/* @ts-ignore */}
          <Icon name={category.icon} size={28} color={category.accentColor} />
        </View>
        <Text style={styles.title} numberOfLines={1}>{category.title}</Text>
        <Text style={styles.subtitle} numberOfLines={2}>{category.subtitle}</Text>
        <View style={[styles.countBadge, { backgroundColor: category.accentColor + "20" }]}>
          <Text style={[styles.count, { color: category.accentColor }]}>
            {category.count.toLocaleString()} listed
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.darkCard,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  iconGlow: {
    position: "absolute",
    inset: 0,
    borderRadius: 16,
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
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  count: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
});
