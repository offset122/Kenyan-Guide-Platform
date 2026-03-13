import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  Share,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { Colors } from "@/constants/colors";
import { CATEGORIES } from "@/constants/data";
import { useAppContext } from "@/context/AppContext";
import { useMessaging } from "@/context/MessagingContext";

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const { listings, isSaved, toggleSaved, user, deleteListing } = useAppContext();
  const { getOrCreateConversation, totalUnread } = useMessaging();

  const listing = listings.find((l) => l.id === id);
  const saved = listing ? isSaved(listing.id) : false;
  const isOwner = user && listing && user.id === listing.userId;

  if (!listing) {
    return (
      <View style={[styles.container, { paddingTop: topPadding }]}>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.notFoundText}>Listing not found</Text>
          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backLinkText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const category = CATEGORIES.find((c) => c.id === listing.categoryId);
  const Icon = category?.iconSet === "MaterialIcons" ? MaterialIcons : Ionicons;

  const handleCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`tel:${listing.phone.replace(/\s/g, "")}`);
  };

  const handleWhatsApp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const num = listing.phone.replace(/\s/g, "").replace("+", "");
    Linking.openURL(`whatsapp://send?phone=${num}&text=Hello, I found your listing on My Kenyan Guide: ${listing.title}`);
  };

  const handleMessage = () => {
    if (!user) { router.push("/auth/index"); return; }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const convId = getOrCreateConversation(
      listing.id,
      listing.title,
      listing.categoryId,
      user.id,
      user.name,
      listing.userId,
      listing.userName,
    );
    router.push({ pathname: "/messages/[id]", params: { id: convId } });
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `${listing.title} - ${listing.subtitle}\n📍 ${listing.location}\n📞 ${listing.phone}\n\nFound on My Kenyan Guide`,
        title: listing.title,
      });
    } catch (e) {}
  };

  const handleSave = () => {
    if (!user) { router.push("/auth/index"); return; }
    Haptics.selectionAsync();
    toggleSaved(listing.id);
  };

  const handleDelete = () => {
    Alert.alert("Delete Listing", `Delete "${listing.title}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          deleteListing(listing.id);
          router.back();
        }
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Top Nav */}
      <View style={styles.nav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.navRight}>
          <TouchableOpacity style={styles.navBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={handleSave}>
            <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={20} color={saved ? Colors.gold : Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: bottomPadding + 110 }]} showsVerticalScrollIndicator={false}>
        {/* Category banner */}
        <Animated.View entering={FadeInDown.springify()}>
          <View style={[styles.categoryBanner, { backgroundColor: category?.color ?? Colors.darkCard }]}>
            <View style={styles.categoryIconWrap}>
              {category ? (
                /* @ts-ignore */
                <Icon name={category.icon} size={28} color={category.accentColor} />
              ) : <Ionicons name="grid-outline" size={28} color={Colors.gold} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.categoryName}>{category?.title ?? "Listing"}</Text>
              <Text style={styles.categorySubname}>{listing.userName}</Text>
            </View>
            {listing.verified && (
              <View style={styles.verifiedPill}>
                <Ionicons name="shield-checkmark" size={12} color={Colors.gold} />
                <Text style={styles.verifiedPillText}>Verified</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Main info */}
        <Animated.View entering={FadeInDown.delay(80).springify()}>
          <View style={styles.mainCard}>
            <View style={styles.titleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listingTitle}>{listing.title}</Text>
                <Text style={styles.listingSubtitle}>{listing.subtitle}</Text>
              </View>
              {listing.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{listing.badge}</Text>
                </View>
              )}
            </View>

            {listing.rating > 0 ? (
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons key={star} name={star <= Math.round(listing.rating) ? "star" : "star-outline"} size={16} color={Colors.gold} />
                ))}
                <Text style={styles.ratingText}>{listing.rating.toFixed(1)}</Text>
                <Text style={styles.reviewCount}>({listing.reviewCount.toLocaleString()} reviews)</Text>
              </View>
            ) : (
              <View style={styles.ratingRow}>
                <Ionicons name="star-outline" size={16} color={Colors.textMuted} />
                <Text style={[styles.ratingText, { color: Colors.textMuted }]}>New listing — be the first!</Text>
              </View>
            )}

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={16} color={Colors.gold} />
                <Text style={styles.metaText}>{listing.location}</Text>
              </View>
              <View style={[styles.availBadge, { backgroundColor: listing.available ? "rgba(90,222,138,0.1)" : "rgba(107,123,104,0.1)" }]}>
                <View style={[styles.availDot, { backgroundColor: listing.available ? "#5ADE8A" : Colors.textMuted }]} />
                <Text style={[styles.availText, { color: listing.available ? "#5ADE8A" : Colors.textMuted }]}>
                  {listing.available ? "Available" : "Unavailable"}
                </Text>
              </View>
            </View>

            {listing.price && (
              <View style={styles.priceBox}>
                <Ionicons name="pricetag" size={16} color={Colors.gold} />
                <Text style={styles.priceText}>{listing.price}</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeInDown.delay(140).springify()}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.descText}>{listing.description}</Text>
          </View>
        </Animated.View>

        {/* Tags */}
        {listing.tags.length > 0 && (
          <Animated.View entering={FadeInDown.delay(180).springify()}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Specialties</Text>
              <View style={styles.tagsWrap}>
                {listing.tags.map((tag) => (
                  <View key={tag} style={styles.tagChip}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Contact */}
        <Animated.View entering={FadeInDown.delay(220).springify()}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <View style={styles.contactCard}>
              <View style={styles.contactIconWrap}>
                <Ionicons name="call" size={18} color={Colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{listing.phone}</Text>
              </View>
              <TouchableOpacity style={styles.contactCallBtn} onPress={handleCall}>
                <Text style={styles.contactCallBtnText}>Call</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.contactRow}>
              <Text style={styles.contactHint}>Posted by {listing.userName} ·</Text>
              <Text style={styles.contactDate}>
                {new Date(listing.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Safety tip */}
        <View style={styles.safetyBox}>
          <Ionicons name="shield-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.safetyText}>Always meet in public for transactions. Never pay in advance without verifying.</Text>
        </View>

        {/* Owner Actions */}
        {isOwner && (
          <View style={styles.ownerSection}>
            <Text style={styles.ownerLabel}>You own this listing</Text>
            <View style={styles.ownerBtns}>
              <TouchableOpacity style={styles.ownerBtn} onPress={() => router.push("/my-listings")}>
                <Ionicons name="list-outline" size={16} color={Colors.gold} />
                <Text style={styles.ownerBtnText}>Manage</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.ownerBtn, styles.ownerDeleteBtn]} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={16} color="#E85C5C" />
                <Text style={[styles.ownerBtnText, { color: "#E85C5C" }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      {!isOwner && (
        <View style={[styles.actionBar, { paddingBottom: bottomPadding + 8 }]}>
          <TouchableOpacity style={styles.messageBtn} onPress={handleMessage}>
            <Ionicons name="chatbubble-ellipses" size={18} color={Colors.textPrimary} />
            <Text style={styles.messageBtnText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.whatsappBtn} onPress={handleWhatsApp}>
            <Ionicons name="logo-whatsapp" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
            <Ionicons name="call" size={18} color={Colors.darkBg} />
            <Text style={styles.callBtnText}>Call Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBg },
  nav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10 },
  navBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  navRight: { flexDirection: "row", gap: 8 },
  scroll: { paddingHorizontal: 16, gap: 0 },
  categoryBanner: { borderRadius: 18, padding: 16, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  categoryIconWrap: { width: 50, height: 50, borderRadius: 15, backgroundColor: "rgba(0,0,0,0.25)", alignItems: "center", justifyContent: "center" },
  categoryName: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#fff" },
  categorySubname: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  verifiedPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,0,0,0.25)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5 },
  verifiedPillText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: Colors.gold },
  mainCard: { backgroundColor: Colors.darkCard, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, padding: 18, gap: 12, marginBottom: 16 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  listingTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.textPrimary, letterSpacing: -0.4 },
  listingSubtitle: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  badge: { backgroundColor: Colors.gold + "20", borderWidth: 1, borderColor: Colors.gold + "40", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: Colors.gold },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingText: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.gold, marginLeft: 4 },
  reviewCount: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textMuted },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary },
  availBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  availDot: { width: 6, height: 6, borderRadius: 3 },
  availText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  priceBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: Colors.gold + "12", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.gold + "25" },
  priceText: { fontFamily: "Inter_700Bold", fontSize: 17, color: Colors.gold },
  section: { marginBottom: 20 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.textPrimary, marginBottom: 10 },
  descText: { fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textSecondary, lineHeight: 24 },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tagChip: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  tagText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary },
  contactCard: { backgroundColor: Colors.darkCard, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  contactIconWrap: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.green + "40", alignItems: "center", justifyContent: "center" },
  contactLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted },
  contactValue: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.textPrimary },
  contactCallBtn: { backgroundColor: Colors.gold + "20", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: Colors.gold + "40" },
  contactCallBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.gold },
  contactRow: { flexDirection: "row", gap: 4 },
  contactHint: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted },
  contactDate: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted },
  safetyBox: { flexDirection: "row", gap: 8, backgroundColor: Colors.darkCard, borderRadius: 12, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: Colors.border },
  safetyText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted, flex: 1, lineHeight: 18 },
  ownerSection: { backgroundColor: Colors.darkCard, borderRadius: 14, borderWidth: 1, borderColor: Colors.gold + "30", padding: 14, gap: 12, marginBottom: 16 },
  ownerLabel: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.gold, textAlign: "center" },
  ownerBtns: { flexDirection: "row", gap: 10 },
  ownerBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: Colors.green + "40", borderRadius: 10, paddingVertical: 10 },
  ownerDeleteBtn: { backgroundColor: "rgba(187,25,25,0.15)" },
  ownerBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.gold },
  actionBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingTop: 10,
    backgroundColor: Colors.darkBg + "F0",
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  messageBtn: { flex: 1.4, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: Colors.darkCard, borderRadius: 14, paddingVertical: 14, borderWidth: 1, borderColor: Colors.border },
  messageBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.textPrimary },
  whatsappBtn: { width: 48, alignItems: "center", justifyContent: "center", backgroundColor: "#25D366", borderRadius: 14, paddingVertical: 14 },
  callBtn: { flex: 1.6, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: Colors.gold, borderRadius: 14, paddingVertical: 14 },
  callBtnText: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.darkBg },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  notFoundText: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: Colors.textPrimary },
  backLink: { backgroundColor: Colors.gold, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20 },
  backLinkText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.darkBg },
});
