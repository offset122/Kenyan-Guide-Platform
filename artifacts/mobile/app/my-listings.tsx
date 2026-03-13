import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { Colors } from "@/constants/colors";
import { useAppContext, Listing } from "@/context/AppContext";
import { CATEGORIES } from "@/constants/data";

function ListingManageCard({ listing, onDelete, onToggle }: {
  listing: Listing;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const category = CATEGORIES.find((c) => c.id === listing.categoryId);
  const Icon = category?.iconSet === "MaterialIcons" ? MaterialIcons : Ionicons;

  const handleDelete = () => {
    Alert.alert("Delete Listing", `Are you sure you want to delete "${listing.title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onDelete(listing.id); } },
    ]);
  };

  return (
    <TouchableOpacity
      style={styles.listingCard}
      onPress={() => router.push({ pathname: "/listing/[id]", params: { id: listing.id } })}
      activeOpacity={0.85}
    >
      <View style={styles.cardRow}>
        <View style={[styles.cardIcon, { backgroundColor: category?.color ?? Colors.darkCard }]}>
          {category && (
            /* @ts-ignore */
            <Icon name={category.icon} size={18} color={category.accentColor} />
          )}
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>{listing.title}</Text>
          <Text style={styles.cardSubtitle} numberOfLines={1}>{listing.subtitle}</Text>
          <View style={styles.cardMeta}>
            <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
            <Text style={styles.cardLocation}>{listing.location}</Text>
            {listing.price && (
              <>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.cardPrice}>{listing.price}</Text>
              </>
            )}
          </View>
        </View>
        <View style={[styles.statusBadge, listing.available ? styles.statusActive : styles.statusInactive]}>
          <View style={[styles.statusDot, { backgroundColor: listing.available ? "#5ADE8A" : Colors.textMuted }]} />
          <Text style={[styles.statusText, { color: listing.available ? "#5ADE8A" : Colors.textMuted }]}>
            {listing.available ? "Active" : "Paused"}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <View style={styles.tagsRow}>
          {listing.tags.slice(0, 2).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          <Text style={styles.dateText}>{new Date(listing.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}</Text>
        </View>
        <View style={styles.actionBtns}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => { Haptics.selectionAsync(); onToggle(listing.id); }}
          >
            <Ionicons name={listing.available ? "pause-circle-outline" : "play-circle-outline"} size={20} color={Colors.gold} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="#E85C5C" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function MyListingsScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const { getMyListings, deleteListing, toggleAvailability } = useAppContext();

  const myListings = getMyListings();
  const activeCount = myListings.filter((l) => l.available).length;

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>My Listings</Text>
          <Text style={styles.subtitle}>{activeCount} active · {myListings.length} total</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/(tabs)/create" as any)}
        >
          <Ionicons name="add" size={22} color={Colors.gold} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={myListings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListingManageCard
            listing={item}
            onDelete={deleteListing}
            onToggle={toggleAvailability}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: isWeb ? 120 : 80 },
        ]}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="storefront-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No listings yet</Text>
            <Text style={styles.emptyText}>Post your first listing to connect with customers across Kenya</Text>
            <TouchableOpacity style={styles.createBtn} onPress={() => router.push("/(tabs)/create" as any)}>
              <Ionicons name="add" size={18} color={Colors.darkBg} />
              <Text style={styles.createBtnText}>Create Listing</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBg },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1 },
  title: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.textPrimary },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  addBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(201,168,76,0.15)", borderWidth: 1, borderColor: Colors.gold + "40", alignItems: "center", justifyContent: "center" },
  listContent: { paddingHorizontal: 16, paddingTop: 8 },
  listingCard: { backgroundColor: Colors.darkCard, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 14, gap: 12 },
  cardRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  cardIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardInfo: { flex: 1 },
  cardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.textPrimary },
  cardSubtitle: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  cardLocation: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted },
  metaDot: { color: Colors.textMuted, fontSize: 11 },
  cardPrice: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: Colors.gold },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusActive: { backgroundColor: "rgba(90,222,138,0.1)" },
  statusInactive: { backgroundColor: "rgba(107,123,104,0.1)" },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  cardActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 10 },
  tagsRow: { flexDirection: "row", gap: 6, alignItems: "center", flex: 1 },
  tag: { backgroundColor: "rgba(201,168,76,0.1)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textSecondary },
  dateText: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted, marginLeft: 4 },
  actionBtns: { flexDirection: "row", gap: 8 },
  actionBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.green + "40", alignItems: "center", justifyContent: "center" },
  deleteBtn: { backgroundColor: "rgba(187,25,25,0.15)" },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12, paddingHorizontal: 32 },
  emptyTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.textPrimary },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, textAlign: "center" },
  createBtn: { backgroundColor: Colors.gold, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, flexDirection: "row", gap: 8, alignItems: "center", marginTop: 8 },
  createBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.darkBg },
});
