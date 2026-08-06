import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Switch,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Colors } from "@/constants/colors";
import { useAppContext } from "@/context/AppContext";
import { useMessaging } from "@/context/MessagingContext";
import { useLocation } from "@/context/LocationContext";
import { ACCOUNT_TYPES } from "@/constants/data";
import { useNotifications } from "@/context/NotificationContext";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const { user, logout, getMyListings, getSavedListings } = useAppContext();
  const { totalUnread, conversations } = useMessaging();
  const { unreadCount: notifUnread } = useNotifications();
  const { county, permissionGranted, requestLocation } = useLocation();
  const [notificationsOn, setNotificationsOn] = useState(true);

  const myListings = getMyListings();
  const savedListings = getSavedListings();
  const accountTypeLabel = ACCOUNT_TYPES.find((t) => t.id === user?.accountType)?.label ?? "Customer";

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => logout() },
    ]);
  };

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: topPadding }]}>
        <View style={styles.guestWrap}>
          <View style={styles.guestAvatar}>
            <Ionicons name="person" size={40} color={Colors.gold} />
          </View>
          <Text style={styles.guestTitle}>Join My Kenyan Guide</Text>
          <Text style={styles.guestText}>Create an account to post listings, save favourites, and message providers</Text>
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: topPadding + 12, paddingBottom: isWeb ? 120 : 100 }]}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Profile Card */}
      <Animated.View entering={FadeInDown.springify()}>
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarWrap}>
              <TouchableOpacity style={styles.avatar} onPress={() => router.push("/edit-profile")} activeOpacity={0.85}>
                {user.avatarUrl ? (
                  <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} contentFit="cover" />
                ) : (
                  <Text style={styles.avatarInitials}>
                    {user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </Text>
                )}
                <View style={styles.avatarEditOverlay}>
                  <Ionicons name="camera" size={14} color="#fff" />
                </View>
              </TouchableOpacity>
              <View style={styles.avatarOnline} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.name}</Text>
              <View style={styles.accountTypeBadge}>
                <Ionicons name="shield-checkmark" size={11} color={Colors.gold} />
                <Text style={styles.accountTypeText}>{accountTypeLabel}</Text>
              </View>
              <Text style={styles.profileEmail}>{user.email}</Text>
              {user.location && (
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
                  <Text style={styles.profileLocation}>{user.location}</Text>
                </View>
              )}
              {county && (
                <View style={styles.infoRow}>
                  <Ionicons name="navigate-outline" size={11} color={Colors.gold} />
                  <Text style={[styles.profileLocation, { color: Colors.gold }]}>Currently in {county}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={() => router.push("/edit-profile")}>
              <Ionicons name="pencil-outline" size={18} color={Colors.gold} />
            </TouchableOpacity>
          </View>

          {user.bio ? <Text style={styles.profileBio}>{user.bio}</Text> : null}

          <View style={styles.profileStats}>
            <TouchableOpacity style={styles.statItem} onPress={() => router.push("/my-listings")}>
              <Text style={styles.statValue}>{myListings.length}</Text>
              <Text style={styles.statLabel}>Listings</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.statItem} onPress={() => router.push("/(tabs)/saved" as any)}>
              <Text style={styles.statValue}>{savedListings.length}</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.statItem} onPress={() => router.push("/messages" as any)}>
              <View style={{ alignItems: "center" }}>
                <Text style={styles.statValue}>{conversations.length}</Text>
                {totalUnread > 0 && (
                  <View style={styles.statBadge}>
                    <Text style={styles.statBadgeText}>{totalUnread} new</Text>
                  </View>
                )}
              </View>
              <Text style={styles.statLabel}>Messages</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/(tabs)/create" as any)}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.green }]}>
              <Ionicons name="add" size={22} color={Colors.gold} />
            </View>
            <Text style={styles.actionLabel}>Post Listing</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/my-listings")}>
            <View style={[styles.actionIcon, { backgroundColor: "#1A3A5C" }]}>
              <Ionicons name="list" size={22} color="#6CA8E8" />
            </View>
            <Text style={styles.actionLabel}>My Listings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, { position: "relative" }]} onPress={() => router.push("/notifications" as any)}>
            <View style={[styles.actionIcon, { backgroundColor: "#1A3A5C" }]}>
              <Ionicons name="notifications" size={22} color="#5CC8E8" />
            </View>
            {notifUnread > 0 && (
              <View style={styles.actionBadge}>
                <Text style={styles.actionBadgeText}>{notifUnread > 9 ? "9+" : notifUnread}</Text>
              </View>
            )}
            <Text style={styles.actionLabel}>Alerts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, { position: "relative" }]} onPress={() => router.push("/messages" as any)}>
            <View style={[styles.actionIcon, { backgroundColor: "#3A1A5C" }]}>
              <Ionicons name="chatbubbles" size={22} color="#A87AE8" />
            </View>
            {totalUnread > 0 && (
              <View style={styles.actionBadge}>
                <Text style={styles.actionBadgeText}>{totalUnread > 9 ? "9+" : totalUnread}</Text>
              </View>
            )}
            <Text style={styles.actionLabel}>Messages</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/edit-profile")}>
            <View style={[styles.actionIcon, { backgroundColor: "#3A5C1A" }]}>
              <Ionicons name="settings" size={22} color="#88C84C" />
            </View>
            <Text style={styles.actionLabel}>Settings</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Location */}
      <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={requestLocation}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="navigate" size={18} color={Colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>
                {permissionGranted ? "Update Location" : "Enable Location"}
              </Text>
              {county && <Text style={styles.menuSub}>Currently: {county}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Preferences */}
      <Animated.View entering={FadeInDown.delay(140).springify()} style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.menuCard}>
          <View style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="notifications-outline" size={18} color={Colors.gold} />
            </View>
            <Text style={styles.menuLabel}>Push Notifications</Text>
            <Switch
              value={notificationsOn}
              onValueChange={setNotificationsOn}
              trackColor={{ false: Colors.darkCardElevated, true: Colors.green }}
              thumbColor={notificationsOn ? Colors.gold : Colors.textMuted}
            />
          </View>
        </View>
      </Animated.View>

      {/* Support */}
      <Animated.View entering={FadeInDown.delay(160).springify()} style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.menuCard}>
          {[
            { icon: "help-circle-outline", label: "Help Center" },
            { icon: "shield-outline", label: "Trust & Safety" },
            { icon: "document-outline", label: "Terms & Privacy" },
            { icon: "information-circle-outline", label: "About — v1.0.0" },
          ].map((item, idx, arr) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuIconWrap}>
                  <Ionicons name={item.icon as any} size={18} color={Colors.gold} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
              {idx < arr.length - 1 && <View style={styles.menuDivider} />}
            </React.Fragment>
          ))}
        </View>
      </Animated.View>

      {/* Sign Out */}
      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#E85C5C" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBg },
  content: { paddingHorizontal: 16, gap: 20 },
  guestWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, paddingHorizontal: 32 },
  guestAvatar: { width: 88, height: 88, borderRadius: 28, backgroundColor: Colors.green, borderWidth: 1, borderColor: Colors.gold + "40", alignItems: "center", justifyContent: "center" },
  guestTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.textPrimary, textAlign: "center" },
  guestText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, textAlign: "center" },
  signInBtn: { backgroundColor: Colors.gold, borderRadius: 14, paddingVertical: 14, width: "100%", alignItems: "center" },
  signInBtnText: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.darkBg },
  registerBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: 14, paddingVertical: 14, width: "100%", alignItems: "center" },
  registerBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.textPrimary },
  profileCard: { backgroundColor: Colors.darkCard, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, padding: 18, gap: 14 },
  avatarRow: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  avatarWrap: { position: "relative" },
  avatar: { width: 68, height: 68, borderRadius: 22, backgroundColor: Colors.green, borderWidth: 2, borderColor: Colors.gold, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarImage: { width: "100%", height: "100%" },
  avatarInitials: { fontFamily: "Inter_700Bold", fontSize: 24, color: Colors.gold },
  avatarEditOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, height: 22, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  avatarOnline: { position: "absolute", bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: "#5ADE8A", borderWidth: 2, borderColor: Colors.darkCard },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.textPrimary },
  accountTypeBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: Colors.gold + "20", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: "flex-start" },
  accountTypeText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: Colors.gold },
  profileEmail: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textMuted },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  profileLocation: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted },
  editBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.green + "40", borderWidth: 1, borderColor: Colors.gold + "30", alignItems: "center", justifyContent: "center" },
  profileBio: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary, lineHeight: 20, paddingTop: 4, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  profileStats: { flexDirection: "row", justifyContent: "space-around", borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 14 },
  statItem: { alignItems: "center", gap: 4, flex: 1 },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.textPrimary },
  statBadge: { backgroundColor: Colors.gold, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 },
  statBadgeText: { fontFamily: "Inter_700Bold", fontSize: 9, color: Colors.darkBg },
  statLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted },
  statDivider: { width: 1, backgroundColor: Colors.border },
  section: { gap: 10 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.textMuted, textTransform: "uppercase", letterSpacing: 0.8 },
  actionGrid: { flexDirection: "row", gap: 10 },
  actionCard: { flex: 1, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, padding: 14, alignItems: "center", gap: 8 },
  actionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontFamily: "Inter_500Medium", fontSize: 11, color: Colors.textSecondary, textAlign: "center" },
  actionBadge: { position: "absolute", top: -4, right: -4, backgroundColor: Colors.gold, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1, borderWidth: 2, borderColor: Colors.darkCard },
  actionBadgeText: { fontFamily: "Inter_700Bold", fontSize: 9, color: Colors.darkBg },
  menuCard: { backgroundColor: Colors.darkCard, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  menuIconWrap: { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.green + "40", alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 15, color: Colors.textPrimary },
  menuSub: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  menuDivider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 62 },
  signOutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "rgba(187,25,25,0.1)", borderRadius: 14, borderWidth: 1, borderColor: "rgba(187,25,25,0.2)", paddingVertical: 14 },
  signOutText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#E85C5C" },
});
