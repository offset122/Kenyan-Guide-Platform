import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Colors } from "@/constants/colors";
import { useAppContext } from "@/context/AppContext";
import { ListingCard } from "@/components/ListingCard";

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const { user, getSavedListings } = useAppContext();
  const [refreshing, setRefreshing] = useState(false);

  const savedListings = getSavedListings();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: topPadding }]}>
        <View style={styles.guestWrap}>
          <View style={styles.guestIcon}>
            <Ionicons name="bookmark-outline" size={36} color={Colors.gold} />
          </View>
          <Text style={styles.guestTitle}>Your Saved Listings</Text>
          <Text style={styles.guestText}>Sign in to bookmark listings and access them here anytime</Text>
          <TouchableOpacity style={styles.signInBtn} onPress={() => router.push("/auth")}>
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerBtn} onPress={() => router.push("/auth/signup")}>
            <Text style={styles.registerBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Saved</Text>
          <Text style={styles.subtitle}>
            {savedListings.length} bookmark{savedListings.length !== 1 ? "s" : ""}
          </Text>
        </View>
        {savedListings.length > 0 && (
          <View style={styles.headerBadge}>
            <Ionicons name="bookmark" size={14} color={Colors.gold} />
            <Text style={styles.headerBadgeText}>{savedListings.length}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={savedListings}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
            <ListingCard listing={item} />
          </Animated.View>
        )}
        contentContainerStyle={[styles.list, { paddingBottom: isWeb ? 120 : 100 }]}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} colors={[Colors.gold]} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="bookmark-outline" size={36} color={Colors.gold} />
            </View>
            <Text style={styles.emptyTitle}>Nothing saved yet</Text>
            <Text style={styles.emptyText}>Tap the bookmark icon on any listing to save it here for quick access</Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => router.push("/(tabs)/explore" as any)}>
              <Ionicons name="grid-outline" size={16} color={Colors.darkBg} />
              <Text style={styles.browseBtnText}>Browse Listings</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBg },
  header: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, color: Colors.textPrimary, letterSpacing: -0.6 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, marginTop: 4 },
  headerBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: Colors.gold + "20", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: Colors.gold + "30" },
  headerBadgeText: { fontFamily: "Inter_700Bold", fontSize: 13, color: Colors.gold },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 14, paddingHorizontal: 32 },
  emptyIcon: { width: 76, height: 76, borderRadius: 24, backgroundColor: Colors.green, borderWidth: 1, borderColor: Colors.gold + "40", alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.textPrimary },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, textAlign: "center" },
  browseBtn: { backgroundColor: Colors.gold, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 4, flexDirection: "row", gap: 8, alignItems: "center" },
  browseBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.darkBg },
  guestWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, paddingHorizontal: 32 },
  guestIcon: { width: 88, height: 88, borderRadius: 28, backgroundColor: Colors.green, borderWidth: 1, borderColor: Colors.gold + "40", alignItems: "center", justifyContent: "center" },
  guestTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.textPrimary, textAlign: "center" },
  guestText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, textAlign: "center" },
  signInBtn: { backgroundColor: Colors.gold, borderRadius: 14, paddingVertical: 14, width: "100%", alignItems: "center" },
  signInBtnText: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.darkBg },
  registerBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: 14, paddingVertical: 14, width: "100%", alignItems: "center" },
  registerBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.textPrimary },
});
