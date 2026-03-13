import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Colors } from "@/constants/colors";
import { useAppContext } from "@/context/AppContext";
import { ListingCard } from "@/components/ListingCard";

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const { user, getSavedListings } = useAppContext();

  const savedListings = getSavedListings();

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: topPadding }]}>
        <View style={styles.guestWrap}>
          <Ionicons name="bookmark-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.guestTitle}>Save Listings</Text>
          <Text style={styles.guestText}>Sign in to bookmark listings and find them here</Text>
          <TouchableOpacity style={styles.signInBtn} onPress={() => router.push("/auth/index")}>
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved</Text>
        <Text style={styles.subtitle}>{savedListings.length} bookmark{savedListings.length !== 1 ? "s" : ""}</Text>
      </View>

      <FlatList
        data={savedListings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ListingCard listing={item} />}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: isWeb ? 120 : 100 },
        ]}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="bookmark-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No saved listings</Text>
            <Text style={styles.emptyText}>Tap the bookmark icon on any listing to save it here</Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => router.push("/(tabs)/explore" as any)}>
              <Text style={styles.browseBtnText}>Browse Listings</Text>
            </TouchableOpacity>
          </View>
        }
        contentInsetAdjustmentBehavior="automatic"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBg },
  header: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, color: Colors.textPrimary, letterSpacing: -0.6 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, marginTop: 4 },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 12, paddingHorizontal: 32 },
  emptyTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.textPrimary },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, textAlign: "center" },
  browseBtn: { backgroundColor: Colors.gold, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  browseBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.darkBg },
  guestWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 32 },
  guestTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.textPrimary },
  guestText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, textAlign: "center" },
  signInBtn: { backgroundColor: Colors.gold, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 48, marginTop: 8 },
  signInBtnText: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.darkBg },
});
