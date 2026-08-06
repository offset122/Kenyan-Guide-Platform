import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  Switch,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInDown, FadeOutRight } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { Colors } from "@/constants/colors";
import { useNotifications, AppNotification, NotifCategory } from "@/context/NotificationContext";

// ─── Category meta ────────────────────────────────────────────────────────────

const CAT_META: Record<NotifCategory, { icon: string; color: string; bg: string; label: string }> = {
  message: { icon: "chatbubble-ellipses", color: "#A87AE8", bg: "#3A1A5C", label: "Messages" },
  listing: { icon: "storefront", color: Colors.gold, bg: Colors.green, label: "Listings" },
  review: { icon: "star", color: "#FFD700", bg: "#3A3A1A", label: "Reviews" },
  system: { icon: "shield-checkmark", color: "#5CC8E8", bg: "#1A3A5C", label: "System" },
  promo: { icon: "megaphone", color: "#E85C8A", bg: "#5C1A3A", label: "Promotions" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short" });
}

// ─── Notification Card ────────────────────────────────────────────────────────

function NotifCard({
  notif,
  index,
  onPress,
  onDelete,
}: {
  notif: AppNotification;
  index: number;
  onPress: (n: AppNotification) => void;
  onDelete: (id: string) => void;
}) {
  const meta = CAT_META[notif.category];

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).springify()} exiting={FadeOutRight.duration(250)}>
      <TouchableOpacity
        style={[styles.card, !notif.read && styles.cardUnread]}
        onPress={() => onPress(notif)}
        activeOpacity={0.85}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Alert.alert("Remove Notification", "Delete this notification?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => onDelete(notif.id) },
          ]);
        }}
      >
        {/* Unread indicator */}
        {!notif.read && <View style={styles.unreadDot} />}

        {/* Icon */}
        <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
          <Ionicons name={meta.icon as any} size={20} color={meta.color} />
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <View style={styles.cardTop}>
            <Text style={[styles.cardTitle, !notif.read && styles.cardTitleUnread]} numberOfLines={1}>
              {notif.title}
            </Text>
            <Text style={styles.cardTime}>{timeAgo(notif.createdAt)}</Text>
          </View>
          <Text style={styles.cardBody} numberOfLines={2}>{notif.body}</Text>
          <View style={styles.catPill}>
            <Text style={[styles.catPillText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Pref Row ─────────────────────────────────────────────────────────────────

function PrefRow({
  icon,
  color,
  bg,
  label,
  sub,
  value,
  onChange,
}: {
  icon: string;
  color: string;
  bg: string;
  label: string;
  sub: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.prefRow}>
      <View style={[styles.prefIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon as any} size={17} color={color} />
      </View>
      <View style={styles.prefText}>
        <Text style={styles.prefLabel}>{label}</Text>
        <Text style={styles.prefSub}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: Colors.darkCardElevated, true: Colors.green }}
        thumbColor={value ? Colors.gold : Colors.textMuted}
      />
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

type Tab = "inbox" | "settings";

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const {
    notifications,
    prefs,
    unreadCount,
    permissionStatus,
    requestPermission,
    markRead,
    markAllRead,
    deleteNotification,
    clearAll,
    handleNotificationTap,
    updatePrefs,
  } = useNotifications();

  const [tab, setTab] = useState<Tab>("inbox");

  const handlePress = (notif: AppNotification) => {
    Haptics.selectionAsync();
    if (!notif.read) markRead(notif.id);
    if (notif.data) handleNotificationTap(notif.data);
  };

  const handleClearAll = () => {
    Alert.alert("Clear All", "Remove all notifications?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All", style: "destructive", onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          clearAll();
        }
      },
    ]);
  };

  const handleEnablePush = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const granted = await requestPermission();
    if (!granted) {
      Alert.alert(
        "Permission Required",
        "Please enable notifications in your device settings to receive push notifications.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {tab === "inbox" && notifications.length > 0 && (
          <TouchableOpacity style={styles.headerAction} onPress={unreadCount > 0 ? markAllRead : handleClearAll}>
            <Text style={styles.headerActionText}>{unreadCount > 0 ? "Mark all read" : "Clear all"}</Text>
          </TouchableOpacity>
        )}
        {tab === "settings" && <View style={{ width: 80 }} />}
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {(["inbox", "settings"] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => setTab(t)}
          >
            <Ionicons
              name={t === "inbox" ? "notifications-outline" : "settings-outline"}
              size={16}
              color={tab === t ? Colors.gold : Colors.textMuted}
            />
            <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>
              {t === "inbox" ? "Inbox" : "Settings"}
            </Text>
            {t === "inbox" && unreadCount > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* ── INBOX TAB ── */}
      {tab === "inbox" && (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <NotifCard
              notif={item}
              index={index}
              onPress={handlePress}
              onDelete={deleteNotification}
            />
          )}
          contentContainerStyle={[styles.list, { paddingBottom: isWeb ? 120 : 100 }]}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Animated.View entering={FadeIn.duration(400)} style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="notifications-off-outline" size={40} color={Colors.gold} />
              </View>
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptyText}>
                You have no notifications yet. We'll let you know when something important happens.
              </Text>
            </Animated.View>
          }
        />
      )}

      {/* ── SETTINGS TAB ── */}
      {tab === "settings" && (
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={
            <Animated.View entering={FadeIn.duration(300)} style={styles.settingsWrap}>

              {/* Push permission banner */}
              {permissionStatus !== "granted" && (
                <View style={styles.permBanner}>
                  <View style={styles.permBannerIcon}>
                    <Ionicons name="notifications" size={24} color={Colors.gold} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.permBannerTitle}>Enable Push Notifications</Text>
                    <Text style={styles.permBannerText}>
                      Get real-time alerts for messages, new listings, and reviews
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.permBannerBtn} onPress={handleEnablePush}>
                    <Text style={styles.permBannerBtnText}>Enable</Text>
                  </TouchableOpacity>
                </View>
              )}

              {permissionStatus === "granted" && (
                <View style={styles.permGranted}>
                  <Ionicons name="checkmark-circle" size={18} color="#5ADE8A" />
                  <Text style={styles.permGrantedText}>Push notifications are enabled</Text>
                </View>
              )}

              {/* Master push toggle */}
              <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>Push Notifications</Text>
                <View style={styles.settingsCard}>
                  <PrefRow
                    icon="notifications"
                    color={Colors.gold}
                    bg={Colors.green}
                    label="Push Notifications"
                    sub="Receive alerts even when app is closed"
                    value={prefs.pushEnabled && permissionStatus === "granted"}
                    onChange={(v) => {
                      if (v && permissionStatus !== "granted") {
                        handleEnablePush();
                      } else {
                        updatePrefs({ pushEnabled: v });
                      }
                    }}
                  />
                </View>
              </View>

              {/* Per-category prefs */}
              <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>Notification Types</Text>
                <View style={styles.settingsCard}>
                  <PrefRow
                    icon="chatbubble-ellipses"
                    color="#A87AE8"
                    bg="#3A1A5C"
                    label="Messages"
                    sub="New messages from providers & sellers"
                    value={prefs.messages}
                    onChange={(v) => updatePrefs({ messages: v })}
                  />
                  <View style={styles.prefDivider} />
                  <PrefRow
                    icon="storefront"
                    color={Colors.gold}
                    bg={Colors.green}
                    label="Listings"
                    sub="Listing published, saved, and updates"
                    value={prefs.listings}
                    onChange={(v) => updatePrefs({ listings: v })}
                  />
                  <View style={styles.prefDivider} />
                  <PrefRow
                    icon="star"
                    color="#FFD700"
                    bg="#3A3A1A"
                    label="Reviews"
                    sub="New reviews on your listings"
                    value={prefs.reviews}
                    onChange={(v) => updatePrefs({ reviews: v })}
                  />
                  <View style={styles.prefDivider} />
                  <PrefRow
                    icon="shield-checkmark"
                    color="#5CC8E8"
                    bg="#1A3A5C"
                    label="System"
                    sub="Account updates and security alerts"
                    value={prefs.system}
                    onChange={(v) => updatePrefs({ system: v })}
                  />
                  <View style={styles.prefDivider} />
                  <PrefRow
                    icon="megaphone"
                    color="#E85C8A"
                    bg="#5C1A3A"
                    label="Promotions"
                    sub="Deals, tips, and platform news"
                    value={prefs.promo}
                    onChange={(v) => updatePrefs({ promo: v })}
                  />
                </View>
              </View>

              {/* Danger zone */}
              {notifications.length > 0 && (
                <View style={styles.settingsSection}>
                  <Text style={styles.settingsSectionTitle}>Manage</Text>
                  <View style={styles.settingsCard}>
                    <TouchableOpacity style={styles.dangerRow} onPress={handleClearAll}>
                      <View style={[styles.prefIcon, { backgroundColor: "rgba(187,25,25,0.15)" }]}>
                        <Ionicons name="trash-outline" size={17} color="#E85C5C" />
                      </View>
                      <View style={styles.prefText}>
                        <Text style={[styles.prefLabel, { color: "#E85C5C" }]}>Clear All Notifications</Text>
                        <Text style={styles.prefSub}>{notifications.length} notification{notifications.length !== 1 ? "s" : ""} in inbox</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View style={{ height: isWeb ? 80 : insets.bottom + 40 }} />
            </Animated.View>
          }
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBg },

  // Header
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.textPrimary },
  headerBadge: { backgroundColor: Colors.gold, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, minWidth: 22, alignItems: "center" },
  headerBadgeText: { fontFamily: "Inter_700Bold", fontSize: 11, color: Colors.darkBg },
  headerAction: { paddingHorizontal: 4 },
  headerActionText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.gold },

  // Tab bar
  tabBar: { flexDirection: "row", marginHorizontal: 16, marginBottom: 12, backgroundColor: Colors.darkCard, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 4 },
  tabBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10 },
  tabBtnActive: { backgroundColor: Colors.green + "60", borderWidth: 1, borderColor: Colors.gold + "30" },
  tabLabel: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textMuted },
  tabLabelActive: { color: Colors.gold, fontFamily: "Inter_600SemiBold" },
  tabBadge: { backgroundColor: Colors.gold, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1, minWidth: 18, alignItems: "center" },
  tabBadgeText: { fontFamily: "Inter_700Bold", fontSize: 9, color: Colors.darkBg },

  // List
  list: { paddingHorizontal: 16, paddingTop: 4 },

  // Notification card
  card: { flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: Colors.darkCard, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 14, position: "relative" },
  cardUnread: { borderColor: Colors.gold + "35", backgroundColor: Colors.green + "18" },
  unreadDot: { position: "absolute", top: 14, left: 6, width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.gold },
  iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardContent: { flex: 1, gap: 4 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  cardTitle: { fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.textSecondary, flex: 1 },
  cardTitleUnread: { fontFamily: "Inter_600SemiBold", color: Colors.textPrimary },
  cardTime: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted, flexShrink: 0 },
  cardBody: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textMuted, lineHeight: 18 },
  catPill: { alignSelf: "flex-start", marginTop: 2 },
  catPillText: { fontFamily: "Inter_500Medium", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 },

  // Empty
  empty: { alignItems: "center", paddingVertical: 60, gap: 14, paddingHorizontal: 32 },
  emptyIcon: { width: 80, height: 80, borderRadius: 26, backgroundColor: Colors.green, borderWidth: 1, borderColor: Colors.gold + "40", alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.textPrimary },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, textAlign: "center", lineHeight: 21 },

  // Settings
  settingsWrap: { paddingHorizontal: 16, paddingTop: 4, gap: 20 },
  settingsSection: { gap: 10 },
  settingsSectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: Colors.textMuted, textTransform: "uppercase", letterSpacing: 0.8, paddingLeft: 4 },
  settingsCard: { backgroundColor: Colors.darkCard, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: "hidden" },

  // Permission banner
  permBanner: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: Colors.green + "30", borderWidth: 1, borderColor: Colors.gold + "40", borderRadius: 16, padding: 14 },
  permBannerIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: Colors.green, borderWidth: 1, borderColor: Colors.gold + "40", alignItems: "center", justifyContent: "center" },
  permBannerTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.textPrimary },
  permBannerText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted, marginTop: 2, lineHeight: 17 },
  permBannerBtn: { backgroundColor: Colors.gold, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  permBannerBtnText: { fontFamily: "Inter_700Bold", fontSize: 13, color: Colors.darkBg },
  permGranted: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(90,222,138,0.08)", borderRadius: 12, borderWidth: 1, borderColor: "rgba(90,222,138,0.2)", paddingHorizontal: 14, paddingVertical: 10 },
  permGrantedText: { fontFamily: "Inter_500Medium", fontSize: 13, color: "#5ADE8A" },

  // Pref rows
  prefRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 14, gap: 12 },
  prefIcon: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  prefText: { flex: 1 },
  prefLabel: { fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.textPrimary },
  prefSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  prefDivider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 62 },
  dangerRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 14, gap: 12 },
});
