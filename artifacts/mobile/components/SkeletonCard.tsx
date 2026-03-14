import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Colors } from "@/constants/colors";

function ShimmerBox({ style }: { style?: object }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return <Animated.View style={[styles.shimmer, style, { opacity }]} />;
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <ShimmerBox style={styles.avatar} />
        <View style={styles.info}>
          <ShimmerBox style={styles.titleLine} />
          <ShimmerBox style={styles.subtitleLine} />
          <View style={styles.metaRow}>
            <ShimmerBox style={styles.smallLine} />
            <ShimmerBox style={styles.smallLine2} />
          </View>
        </View>
        <ShimmerBox style={styles.bookmarkIcon} />
      </View>
      <View style={styles.footer}>
        <ShimmerBox style={styles.tag} />
        <ShimmerBox style={styles.tag} />
        <View style={{ flex: 1 }} />
        <ShimmerBox style={styles.price} />
      </View>
    </View>
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
  },
  row: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  shimmer: { backgroundColor: Colors.darkCardElevated, borderRadius: 8 },
  avatar: { width: 48, height: 48, borderRadius: 14 },
  info: { flex: 1, gap: 8 },
  titleLine: { height: 14, width: "75%" },
  subtitleLine: { height: 12, width: "55%" },
  metaRow: { flexDirection: "row", gap: 10 },
  smallLine: { height: 10, width: 55 },
  smallLine2: { height: 10, width: 70 },
  bookmarkIcon: { width: 22, height: 22, borderRadius: 6 },
  footer: { flexDirection: "row", gap: 8, alignItems: "center", borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 10 },
  tag: { height: 22, width: 55, borderRadius: 6 },
  price: { height: 14, width: 70 },
});
