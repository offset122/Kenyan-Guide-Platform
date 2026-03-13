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
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Colors } from "@/constants/colors";
import { useMessaging, Conversation } from "@/context/MessagingContext";
import { useAppContext } from "@/context/AppContext";

function timeAgo(iso?: string): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function ConvCard({ conversation, index }: { conversation: Conversation; index: number }) {
  const initials = conversation.providerName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <TouchableOpacity
        style={[styles.convCard, conversation.unreadCount > 0 && styles.convCardUnread]}
        onPress={() => router.push({ pathname: "/messages/[id]", params: { id: conversation.id } })}
        activeOpacity={0.85}
      >
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.onlineDot} />
        </View>

        <View style={styles.convInfo}>
          <View style={styles.convHeader}>
            <Text style={styles.providerName} numberOfLines={1}>{conversation.providerName}</Text>
            <Text style={styles.timeAgo}>{timeAgo(conversation.lastMessageAt)}</Text>
          </View>
          <Text style={styles.listingTitle} numberOfLines={1}>
            <Ionicons name="pricetag-outline" size={10} color={Colors.textMuted} /> {conversation.listingTitle}
          </Text>
          <Text style={[styles.lastMessage, conversation.unreadCount > 0 && styles.lastMessageUnread]} numberOfLines={1}>
            {conversation.lastMessage ?? "Say hello!"}
          </Text>
        </View>

        {conversation.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const { conversations, totalUnread } = useMessaging();
  const { user } = useAppContext();

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: topPadding }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Messages</Text>
        </View>
        <View style={styles.guestWrap}>
          <Ionicons name="chatbubbles-outline" size={52} color={Colors.textMuted} />
          <Text style={styles.guestTitle}>Sign In to Message</Text>
          <Text style={styles.guestText}>Connect directly with service providers and sellers</Text>
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
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Messages</Text>
          {totalUnread > 0 && (
            <View style={styles.titleBadge}>
              <Text style={styles.titleBadgeText}>{totalUnread} unread</Text>
            </View>
          )}
        </View>
        <View style={{ width: 38 }} />
      </View>

      <FlatList
        data={[...conversations].sort((a, b) =>
          new Date(b.lastMessageAt ?? b.createdAt).getTime() - new Date(a.lastMessageAt ?? a.createdAt).getTime()
        )}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <ConvCard conversation={item} index={index} />}
        contentContainerStyle={[styles.list, { paddingBottom: isWeb ? 120 : 90 }]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={52} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptyText}>Tap "Message" on any listing to start chatting with providers</Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => router.back()}>
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
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  title: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.textPrimary },
  titleBadge: { backgroundColor: Colors.gold + "20", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  titleBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: Colors.gold },
  list: { paddingHorizontal: 16, paddingTop: 8 },
  convCard: {
    backgroundColor: Colors.darkCard, borderRadius: 16, borderWidth: 1, borderColor: Colors.border,
    padding: 14, flexDirection: "row", gap: 12, alignItems: "center",
  },
  convCardUnread: { borderColor: Colors.gold + "40", backgroundColor: Colors.green + "20" },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 50, height: 50, borderRadius: 16,
    backgroundColor: Colors.green, borderWidth: 2, borderColor: Colors.gold,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontFamily: "Inter_700Bold", fontSize: 17, color: Colors.gold },
  onlineDot: {
    position: "absolute", bottom: 0, right: 0,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: "#5ADE8A", borderWidth: 2, borderColor: Colors.darkBg,
  },
  convInfo: { flex: 1, gap: 3 },
  convHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  providerName: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.textPrimary, flex: 1 },
  timeAgo: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted },
  listingTitle: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.gold },
  lastMessage: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textMuted },
  lastMessageUnread: { fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  unreadBadge: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center",
  },
  unreadCount: { fontFamily: "Inter_700Bold", fontSize: 11, color: Colors.darkBg },
  separator: { height: 10 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12, paddingHorizontal: 32 },
  emptyTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.textPrimary },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, textAlign: "center" },
  browseBtn: { backgroundColor: Colors.gold, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, marginTop: 8 },
  browseBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.darkBg },
  guestWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, paddingHorizontal: 32 },
  guestTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.textPrimary },
  guestText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, textAlign: "center" },
  signInBtn: { backgroundColor: Colors.gold, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 48, marginTop: 8 },
  signInBtnText: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.darkBg },
});
