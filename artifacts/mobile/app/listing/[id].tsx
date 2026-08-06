import React, { useState } from "react";
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
  Dimensions,
  FlatList,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { Colors } from "@/constants/colors";
import { CATEGORIES } from "@/constants/data";
import { useAppContext } from "@/context/AppContext";
import { useMessaging } from "@/context/MessagingContext";
import { useToast } from "@/context/ToastContext";
import { useNotifications } from "@/context/NotificationContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const { listings, isSaved, toggleSaved, user, deleteListing, addReview, getReviews, hasReviewed } = useAppContext();
  const { getOrCreateConversation, totalUnread } = useMessaging();
  const { success: toastSuccess, error: toastError } = useToast();
  const { notifyListingSaved, notifyNewReview } = useNotifications();

  const listing = listings.find((l) => l.id === id);
  const saved = listing ? isSaved(listing.id) : false;
  const isOwner = user && listing && user.id === listing.userId;
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const hasPhotos = !!(listing?.photos && listing.photos.length > 0);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const listingReviews = listing ? getReviews(listing.id) : [];
  const alreadyReviewed = listing ? hasReviewed(listing.id) : false;

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
    if (!user) { router.push("/auth"); return; }
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
    if (!user) { router.push("/auth"); return; }
    Haptics.selectionAsync();
    const wasSaved = saved;
    toggleSaved(listing.id);
    if (!wasSaved) notifyListingSaved(listing.title);
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
        {/* Photo Gallery */}
        {hasPhotos && (
          <Animated.View entering={FadeInDown.springify()} style={styles.gallerySection}>
            <FlatList
              data={listing!.photos}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => String(i)}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setActivePhotoIdx(idx);
              }}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={{ width: SCREEN_WIDTH, height: 260 }}
                  contentFit="cover"
                  transition={200}
                />
              )}
            />
            {listing!.photos!.length > 1 && (
              <View style={styles.photoDots}>
                {listing!.photos!.map((_, i) => (
                  <View key={i} style={[styles.photoDot, i === activePhotoIdx && styles.photoDotActive]} />
                ))}
              </View>
            )}
            <View style={styles.photoCountOverlay}>
              <Ionicons name="images-outline" size={12} color="#fff" />
              <Text style={styles.photoCountText}>{activePhotoIdx + 1}/{listing!.photos!.length}</Text>
            </View>
          </Animated.View>
        )}

        {/* Category banner */}
        <Animated.View entering={FadeInDown.delay(hasPhotos ? 40 : 0).springify()}>
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
                {listing.userAvatarUrl ? (
                  <Image source={{ uri: listing.userAvatarUrl }} style={styles.contactAvatar} contentFit="cover" />
                ) : (
                  <Ionicons name="call" size={18} color={Colors.gold} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactLabel}>{listing.userName}</Text>
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

        {/* Reviews */}
        <Animated.View entering={FadeInDown.delay(260).springify()}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews ({listingReviews.length})</Text>

            {listingReviews.length > 0 && (
              <View style={styles.reviewsList}>
                {listingReviews.map((r) => (
                  <View key={r.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewAvatar}>
                        {r.userAvatarUrl ? (
                          <Image source={{ uri: r.userAvatarUrl }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                        ) : (
                          <Text style={styles.reviewAvatarText}>
                            {r.userName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                          </Text>
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reviewName}>{r.userName}</Text>
                        <View style={styles.reviewStars}>
                          {[1,2,3,4,5].map((s) => (
                            <Ionicons key={s} name={s <= r.rating ? "star" : "star-outline"} size={12} color={Colors.gold} />
                          ))}
                          <Text style={styles.reviewDate}>
                            {new Date(r.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {r.comment ? <Text style={styles.reviewComment}>{r.comment}</Text> : null}
                  </View>
                ))}
              </View>
            )}

            {!isOwner && user && !alreadyReviewed && (
              !showReviewForm ? (
                <TouchableOpacity style={styles.writeReviewBtn} onPress={() => setShowReviewForm(true)}>
                  <Ionicons name="star-outline" size={16} color={Colors.gold} />
                  <Text style={styles.writeReviewBtnText}>Write a Review</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.reviewForm}>
                  <Text style={styles.reviewFormLabel}>Your Rating</Text>
                  <View style={styles.starPicker}>
                    {[1,2,3,4,5].map((s) => (
                      <TouchableOpacity key={s} onPress={() => { setReviewRating(s); Haptics.selectionAsync(); }}>
                        <Ionicons name={s <= reviewRating ? "star" : "star-outline"} size={32} color={Colors.gold} />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.reviewInputWrap}>
                    <TextInput
                      style={styles.reviewInput}
                      value={reviewComment}
                      onChangeText={setReviewComment}
                      placeholder="Share your experience (optional)"
                      placeholderTextColor={Colors.textMuted}
                      multiline
                      maxLength={300}
                    />
                  </View>
                  <View style={styles.reviewFormBtns}>
                    <TouchableOpacity style={styles.reviewCancelBtn} onPress={() => { setShowReviewForm(false); setReviewRating(0); setReviewComment(""); }}>
                      <Text style={styles.reviewCancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.reviewSubmitBtn, (reviewRating === 0 || reviewLoading) && { opacity: 0.5 }]}
                      disabled={reviewRating === 0 || reviewLoading}
                      onPress={async () => {
                        setReviewLoading(true);
                        const result = await addReview(listing!.id, reviewRating, reviewComment);
                        setReviewLoading(false);
                        if (result.success) {
                          toastSuccess("Review submitted!");
                          notifyNewReview(listing!.title, user!.name, listing!.id);
                          setShowReviewForm(false);
                          setReviewRating(0);
                          setReviewComment("");
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        } else {
                          toastError(result.error ?? "Failed to submit review");
                        }
                      }}
                    >
                      {reviewLoading ? <ActivityIndicator size="small" color={Colors.darkBg} /> : <Text style={styles.reviewSubmitBtnText}>Submit</Text>}
                    </TouchableOpacity>
                  </View>
                </View>
              )
            )}

            {alreadyReviewed && (
              <View style={styles.alreadyReviewedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#5ADE8A" />
                <Text style={styles.alreadyReviewedText}>You reviewed this listing</Text>
              </View>
            )}

            {!user && (
              <TouchableOpacity style={styles.writeReviewBtn} onPress={() => router.push("/auth")}>
                <Ionicons name="star-outline" size={16} color={Colors.gold} />
                <Text style={styles.writeReviewBtnText}>Sign in to write a review</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Owner Actions */}
        {isOwner && (
          <View style={styles.ownerSection}>
            <Text style={styles.ownerLabel}>You own this listing</Text>
            <View style={styles.ownerBtns}>
              <TouchableOpacity style={styles.ownerBtn} onPress={() => router.push({ pathname: "/listing/edit/[id]", params: { id: listing!.id } })}>
                <Ionicons name="pencil-outline" size={16} color={Colors.gold} />
                <Text style={styles.ownerBtnText}>Edit</Text>
              </TouchableOpacity>
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
  gallerySection: { marginBottom: 14, position: "relative" },
  photoDots: { flexDirection: "row", justifyContent: "center", gap: 5, marginTop: 8 },
  photoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  photoDotActive: { backgroundColor: Colors.gold, width: 18 },
  photoCountOverlay: {
    position: "absolute", bottom: 18, right: 14,
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  photoCountText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "#fff" },
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
  contactIconWrap: { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.green + "40", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  contactAvatar: { width: "100%", height: "100%" },
  contactLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted },
  contactValue: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.textPrimary },
  contactCallBtn: { backgroundColor: Colors.gold + "20", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: Colors.gold + "40" },
  contactCallBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.gold },
  contactRow: { flexDirection: "row", gap: 4 },
  contactHint: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted },
  contactDate: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted },
  safetyBox: { flexDirection: "row", gap: 8, backgroundColor: Colors.darkCard, borderRadius: 12, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: Colors.border },
  safetyText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted, flex: 1, lineHeight: 18 },
  reviewsList: { gap: 10, marginBottom: 12 },
  reviewCard: { backgroundColor: Colors.darkCard, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 12, gap: 8 },
  reviewHeader: { flexDirection: "row", gap: 10, alignItems: "center" },
  reviewAvatar: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.green, borderWidth: 1, borderColor: Colors.gold + "40", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  reviewAvatarText: { fontFamily: "Inter_700Bold", fontSize: 13, color: Colors.gold },
  reviewName: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.textPrimary },
  reviewStars: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 2 },
  reviewDate: { fontFamily: "Inter_400Regular", fontSize: 10, color: Colors.textMuted, marginLeft: 6 },
  reviewComment: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  writeReviewBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: Colors.gold + "40", borderRadius: 12, paddingVertical: 12, backgroundColor: Colors.gold + "10" },
  writeReviewBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.gold },
  reviewForm: { backgroundColor: Colors.darkCard, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 14, gap: 12 },
  reviewFormLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.textSecondary },
  starPicker: { flexDirection: "row", gap: 8 },
  reviewInputWrap: { backgroundColor: Colors.darkBg, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, padding: 12 },
  reviewInput: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textPrimary, minHeight: 70, textAlignVertical: "top" },
  reviewFormBtns: { flexDirection: "row", gap: 10 },
  reviewCancelBtn: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingVertical: 11, alignItems: "center" },
  reviewCancelBtnText: { fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.textMuted },
  reviewSubmitBtn: { flex: 1, backgroundColor: Colors.gold, borderRadius: 10, paddingVertical: 11, alignItems: "center" },
  reviewSubmitBtnText: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.darkBg },
  alreadyReviewedBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: "rgba(90,222,138,0.08)", borderRadius: 10, borderWidth: 1, borderColor: "rgba(90,222,138,0.2)" },
  alreadyReviewedText: { fontFamily: "Inter_500Medium", fontSize: 13, color: "#5ADE8A" },
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
