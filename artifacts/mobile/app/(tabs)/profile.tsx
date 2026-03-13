import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "@/constants/colors";

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  sublabel?: string;
  hasChevron?: boolean;
  toggle?: boolean;
}

const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
  {
    title: "Account",
    items: [
      { id: "listing", icon: "storefront-outline", label: "My Listings", sublabel: "Manage your listings", hasChevron: true },
      { id: "applications", icon: "document-text-outline", label: "Job Applications", sublabel: "Track your applications", hasChevron: true },
      { id: "reviews", icon: "star-outline", label: "Reviews", sublabel: "Your ratings & reviews", hasChevron: true },
    ],
  },
  {
    title: "Settings",
    items: [
      { id: "notifications", icon: "notifications-outline", label: "Notifications", toggle: true },
      { id: "location", icon: "location-outline", label: "Location Services", toggle: true },
      { id: "language", icon: "language-outline", label: "Language", sublabel: "English", hasChevron: true },
    ],
  },
  {
    title: "Support",
    items: [
      { id: "help", icon: "help-circle-outline", label: "Help Center", hasChevron: true },
      { id: "terms", icon: "document-outline", label: "Terms & Privacy", hasChevron: true },
      { id: "about", icon: "information-circle-outline", label: "About My Kenyan Guide", hasChevron: true },
    ],
  },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [locationOn, setLocationOn] = useState(false);

  const toggleMap: Record<string, [boolean, (v: boolean) => void]> = {
    notifications: [notificationsOn, setNotificationsOn],
    location: [locationOn, setLocationOn],
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPadding + 20, paddingBottom: isWeb ? 120 : 100 },
      ]}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={36} color={Colors.gold} />
          </View>
          <TouchableOpacity style={styles.editAvatarBtn}>
            <Ionicons name="camera" size={14} color={Colors.darkBg} />
          </TouchableOpacity>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Guest User</Text>
          <Text style={styles.profileEmail}>Sign in to access all features</Text>
        </View>
        <TouchableOpacity style={styles.signInBtn}>
          <Text style={styles.signInBtnText}>Sign In</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {[
          { label: "Listings", value: "0" },
          { label: "Saved", value: "5" },
          { label: "Reviews", value: "0" },
        ].map((s, i) => (
          <React.Fragment key={s.label}>
            {i > 0 && <View style={styles.statsDivider} />}
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>

      {/* List a Service Banner */}
      <TouchableOpacity style={styles.listBanner}>
        <View>
          <Text style={styles.listBannerTitle}>List Your Service</Text>
          <Text style={styles.listBannerSub}>Join 4,820+ providers on the platform</Text>
        </View>
        <View style={styles.listBannerIcon}>
          <Ionicons name="add" size={24} color={Colors.darkBg} />
        </View>
      </TouchableOpacity>

      {/* Menu Sections */}
      {MENU_SECTIONS.map((section) => (
        <View key={section.title} style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>{section.title}</Text>
          <View style={styles.menuCard}>
            {section.items.map((item, idx) => {
              const toggleEntry = item.toggle ? toggleMap[item.id] : null;
              return (
                <React.Fragment key={item.id}>
                  {idx > 0 && <View style={styles.menuDivider} />}
                  <TouchableOpacity style={styles.menuItem} disabled={!!item.toggle}>
                    <View style={styles.menuIconWrap}>
                      <Ionicons name={item.icon as any} size={20} color={Colors.gold} />
                    </View>
                    <View style={styles.menuLabel}>
                      <Text style={styles.menuLabelText}>{item.label}</Text>
                      {item.sublabel && (
                        <Text style={styles.menuSublabel}>{item.sublabel}</Text>
                      )}
                    </View>
                    {item.hasChevron && (
                      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                    )}
                    {item.toggle && toggleEntry && (
                      <Switch
                        value={toggleEntry[0]}
                        onValueChange={toggleEntry[1]}
                        trackColor={{ false: Colors.darkCardElevated, true: Colors.green }}
                        thumbColor={toggleEntry[0] ? Colors.gold : Colors.textMuted}
                      />
                    )}
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>
        </View>
      ))}

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutBtn}>
        <Ionicons name="log-out-outline" size={18} color="#E85C5C" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>My Kenyan Guide v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBg },
  content: { paddingHorizontal: 16, gap: 16 },
  profileCard: {
    backgroundColor: Colors.darkCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.green,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: Colors.textPrimary,
  },
  profileEmail: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  signInBtn: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  signInBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.darkBg,
  },
  statsRow: {
    backgroundColor: Colors.darkCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statsDivider: { width: 1, backgroundColor: Colors.border },
  statItem: { alignItems: "center", gap: 4, flex: 1 },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
  },
  listBanner: {
    backgroundColor: Colors.green,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gold + "40",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listBannerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.textPrimary,
  },
  listBannerSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  listBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  menuSection: { gap: 10 },
  menuSectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    paddingHorizontal: 4,
  },
  menuCard: {
    backgroundColor: Colors.darkCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.green + "40",
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { flex: 1 },
  menuLabelText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: Colors.textPrimary,
  },
  menuSublabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: 64,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(187,25,25,0.1)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(187,25,25,0.2)",
    paddingVertical: 14,
  },
  signOutText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#E85C5C",
  },
  version: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: "center",
    paddingBottom: 8,
  },
});
