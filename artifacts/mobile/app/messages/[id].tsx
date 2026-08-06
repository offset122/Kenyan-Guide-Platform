import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInDown, SlideInRight, SlideInLeft } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { Colors } from "@/constants/colors";
import { useMessaging, Message } from "@/context/MessagingContext";
import { useAppContext } from "@/context/AppContext";
import { useNotifications } from "@/context/NotificationContext";

function TypingIndicator() {
  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.typingWrap}>
      <View style={styles.typingBubble}>
        <View style={styles.typingDots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.typingDot, { opacity: 0.4 + i * 0.2 }]} />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

function MessageBubble({ message, isMe, showName }: { message: Message; isMe: boolean; showName: boolean }) {
  const time = new Date(message.timestamp).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });

  return (
    <Animated.View
      entering={isMe ? SlideInRight.springify().damping(18) : SlideInLeft.springify().damping(18)}
      style={[styles.bubbleRow, isMe ? styles.bubbleRowMe : styles.bubbleRowThem]}
    >
      {!isMe && (
        <View style={styles.providerAvatar}>
          <Text style={styles.providerAvatarText}>{message.senderName[0]}</Text>
        </View>
      )}
      <View style={[styles.bubbleCol, isMe ? styles.bubbleColMe : styles.bubbleColThem]}>
        {showName && !isMe && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{message.text}</Text>
        </View>
        <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>{time}</Text>
      </View>
    </Animated.View>
  );
}

export default function ChatScreen() {
  const { id: conversationId } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;

  const { user } = useAppContext();
  const { conversations, getConversationMessages, sendMessage, markAsRead, isTyping } = useMessaging();
  const { notifyNewMessage } = useNotifications();
  const flatRef = useRef<FlatList>(null);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const conversation = conversations.find((c) => c.id === conversationId);
  const messages = getConversationMessages(conversationId ?? "");
  const typing = isTyping(conversationId ?? "");

  useEffect(() => {
    if (conversationId) markAsRead(conversationId);
  }, [conversationId]);

  useEffect(() => {
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages.length, typing]);

  // Track previous message count to detect new bot replies
  const prevMsgCount = useRef(messages.length);
  useEffect(() => {
    if (messages.length > prevMsgCount.current) {
      const latest = messages[messages.length - 1];
      if (latest && latest.senderId !== user?.id) {
        notifyNewMessage(latest.senderName, latest.text, conversationId ?? "");
      }
    }
    prevMsgCount.current = messages.length;
  }, [messages.length]);

  const handleSend = useCallback(async () => {
    if (!text.trim() || !user || !conversation) return;
    setSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const t = text.trim();
    setText("");
    await sendMessage(conversationId!, user.id, user.name, t, conversation.categoryId);
    setSending(false);
  }, [text, user, conversation, conversationId, sendMessage]);

  if (!user || !conversation) {
    return (
      <View style={[styles.container, { paddingTop: topPadding }]}>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.centerText}>Conversation not found</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: topPadding }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Nav Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navProfile}
          onPress={() => router.push({ pathname: "/listing/[id]", params: { id: conversation.listingId } })}
        >
          <View style={styles.navAvatar}>
            <Text style={styles.navAvatarText}>
              {conversation.providerName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </Text>
          </View>
          <View>
            <Text style={styles.navName}>{conversation.providerName}</Text>
            <View style={styles.navStatusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.navStatus}>Online</Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.push({ pathname: "/listing/[id]", params: { id: conversation.listingId } })}>
          <Ionicons name="information-circle-outline" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Listing chip */}
      <TouchableOpacity
        style={styles.listingChip}
        onPress={() => router.push({ pathname: "/listing/[id]", params: { id: conversation.listingId } })}
      >
        <Ionicons name="pricetag-outline" size={14} color={Colors.gold} />
        <Text style={styles.listingChipText} numberOfLines={1}>{conversation.listingTitle}</Text>
        <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
      </TouchableOpacity>

      {/* Messages */}
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.messagesList, { paddingBottom: 8 }]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item, index }) => (
          <MessageBubble
            message={item}
            isMe={item.senderId === user.id}
            showName={index === 0 || messages[index - 1]?.senderId !== item.senderId}
          />
        )}
        ListFooterComponent={typing ? <TypingIndicator /> : null}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <View style={styles.emptyChatAvatar}>
              <Text style={styles.emptyChatAvatarText}>
                {conversation.providerName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </Text>
            </View>
            <Text style={styles.emptyChatName}>{conversation.providerName}</Text>
            <Text style={styles.emptyChatHint}>Say hello! They typically reply within minutes.</Text>
          </View>
        }
      />

      {/* Input */}
      <View style={[styles.inputBar, { paddingBottom: bottomPadding + 8 }]}>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={500}
            returnKeyType="default"
          />
        </View>
        <TouchableOpacity
          style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
        >
          <Ionicons name="send" size={18} color={Colors.darkBg} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBg },
  navBar: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 12,
    paddingVertical: 10, gap: 10, borderBottomWidth: 1, borderBottomColor: Colors.border,
    backgroundColor: Colors.darkBg,
  },
  navBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  navProfile: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  navAvatar: { width: 40, height: 40, borderRadius: 13, backgroundColor: Colors.green, borderWidth: 1.5, borderColor: Colors.gold, alignItems: "center", justifyContent: "center" },
  navAvatarText: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.gold },
  navName: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.textPrimary },
  navStatusRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#5ADE8A" },
  navStatus: { fontFamily: "Inter_400Regular", fontSize: 12, color: "#5ADE8A" },
  listingChip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginHorizontal: 16, marginVertical: 8,
    backgroundColor: Colors.green + "30", borderRadius: 10, borderWidth: 1, borderColor: Colors.gold + "30",
    paddingHorizontal: 12, paddingVertical: 8,
  },
  listingChipText: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.gold },
  messagesList: { paddingHorizontal: 14, paddingTop: 8, gap: 8, flexGrow: 1 },
  bubbleRow: { flexDirection: "row", gap: 8, alignItems: "flex-end", marginVertical: 2 },
  bubbleRowMe: { justifyContent: "flex-end" },
  bubbleRowThem: { justifyContent: "flex-start" },
  bubbleCol: { maxWidth: "75%", gap: 3 },
  bubbleColMe: { alignItems: "flex-end" },
  bubbleColThem: { alignItems: "flex-start" },
  providerAvatar: { width: 30, height: 30, borderRadius: 10, backgroundColor: Colors.green, borderWidth: 1, borderColor: Colors.gold, alignItems: "center", justifyContent: "center" },
  providerAvatarText: { fontFamily: "Inter_700Bold", fontSize: 11, color: Colors.gold },
  senderName: { fontFamily: "Inter_500Medium", fontSize: 11, color: Colors.textMuted, paddingLeft: 4, marginBottom: 2 },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMe: { backgroundColor: Colors.gold, borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, borderBottomLeftRadius: 4 },
  bubbleText: { fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },
  bubbleTextMe: { color: Colors.darkBg },
  bubbleTime: { fontFamily: "Inter_400Regular", fontSize: 10, color: Colors.textMuted },
  bubbleTimeMe: { color: Colors.textMuted },
  typingWrap: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginVertical: 4 },
  typingBubble: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 16, paddingVertical: 12 },
  typingDots: { flexDirection: "row", gap: 5, alignItems: "center" },
  typingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.textMuted },
  inputBar: {
    flexDirection: "row", gap: 10, paddingHorizontal: 14, paddingTop: 10,
    backgroundColor: Colors.darkBg, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  inputWrap: {
    flex: 1, backgroundColor: Colors.darkCard, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 10,
    maxHeight: 120,
  },
  input: { fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textPrimary, padding: 0 },
  sendBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center",
    alignSelf: "flex-end",
  },
  sendBtnDisabled: { backgroundColor: Colors.textMuted + "40" },
  emptyChat: { flex: 1, alignItems: "center", paddingTop: 48, gap: 12 },
  emptyChatAvatar: { width: 72, height: 72, borderRadius: 22, backgroundColor: Colors.green, borderWidth: 2, borderColor: Colors.gold, alignItems: "center", justifyContent: "center" },
  emptyChatAvatarText: { fontFamily: "Inter_700Bold", fontSize: 26, color: Colors.gold },
  emptyChatName: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.textPrimary },
  emptyChatHint: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, textAlign: "center", paddingHorizontal: 32 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  centerText: { fontFamily: "Inter_400Regular", fontSize: 16, color: Colors.textMuted },
});
