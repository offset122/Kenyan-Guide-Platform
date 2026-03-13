import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import React, { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "@mkg:messages_v2";

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  read: boolean;
};

export type Conversation = {
  id: string;
  listingId: string;
  listingTitle: string;
  categoryId: string;
  userId: string;
  userName: string;
  providerId: string;
  providerName: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
};

type StorageShape = {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
};

// Category-aware bot replies
const BOT_REPLIES: Record<string, string[]> = {
  providers: [
    "Hello! Thanks for reaching out. I'm available this week — what time suits you?",
    "Hi there! I can come for a free assessment first. Where are you located?",
    "Thanks! I work across Nairobi. What exactly do you need done?",
    "I'm available today afternoon or tomorrow morning. Which works for you?",
    "Great to hear from you! I charge KSh 2,500 for the first hour. Shall I come over?",
  ],
  businesses: [
    "Hello! Thanks for your inquiry. How can we assist you today?",
    "Good day! Please share more details and we'll get back to you shortly.",
    "Hi! Our team is happy to help. What services are you looking for?",
    "Thank you for reaching out. Would you like to schedule an appointment?",
    "We'd love to work with you. When are you available for a call?",
  ],
  emergency: [
    "Hello! For emergencies, please call directly on our hotline. How can I assist?",
    "Hi! Please describe your situation so we can help quickly.",
    "Emergency services available 24/7. Are you safe right now?",
    "Hello! We're here to help. What's the nature of the emergency?",
    "Please call us immediately if this is an active emergency. Are you okay?",
  ],
  jobs: [
    "Hi! Thanks for your interest. Are you looking to apply or posting a job?",
    "Hello! Please send your CV and we'll review it within 24 hours.",
    "Great interest! The position is still available. When can you start?",
    "Thanks for reaching out. What's your experience level for this role?",
    "Hi! We're still hiring. Please share your contact and qualifications.",
  ],
  products: [
    "Hi! The item is still available. Are you interested in buying?",
    "Hello! I can arrange delivery or you can pick up. What works for you?",
    "Thanks for your interest! Price is negotiable for serious buyers.",
    "Hi! The condition is as described. Would you like more photos?",
    "Still available! Can meet in a public place for the transaction.",
  ],
  realestate: [
    "Hi! The property is still available. Would you like to schedule a viewing?",
    "Hello! I can arrange a viewing this week. Which days work for you?",
    "Thanks! The price is slightly negotiable. What's your budget range?",
    "Hi! I can send more photos and the floor plan if you're interested.",
    "The property is available from next month. Are you looking to rent or buy?",
  ],
};

function getRandomReply(categoryId: string): string {
  const replies = BOT_REPLIES[categoryId] ?? BOT_REPLIES.businesses;
  return replies[Math.floor(Math.random() * replies.length)];
}

const [MessagingProvider, useMessaging] = createContextHook(() => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [typingConversations, setTypingConversations] = useState<Set<string>>(new Set());
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data: StorageShape = JSON.parse(raw);
          setConversations(data.conversations ?? []);
          setMessages(data.messages ?? {});
        }
      } catch (e) {
        console.warn("Messaging load error", e);
      }
    };
    load();
  }, []);

  const persist = useCallback(async (convs: Conversation[], msgs: Record<string, Message[]>) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ conversations: convs, messages: msgs }));
    } catch (e) {
      console.warn("Messaging save error", e);
    }
  }, []);

  const getOrCreateConversation = useCallback((
    listingId: string,
    listingTitle: string,
    categoryId: string,
    userId: string,
    userName: string,
    providerId: string,
    providerName: string,
  ): string => {
    const convId = `${listingId}__${userId}`;
    const existing = conversations.find((c) => c.id === convId);
    if (existing) return convId;

    const newConv: Conversation = {
      id: convId,
      listingId,
      listingTitle,
      categoryId,
      userId,
      userName,
      providerId,
      providerName,
      unreadCount: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [newConv, ...conversations];
    setConversations(updated);
    persist(updated, messages);
    return convId;
  }, [conversations, messages, persist]);

  const sendMessage = useCallback(async (
    conversationId: string,
    senderId: string,
    senderName: string,
    text: string,
    categoryId: string,
  ) => {
    const msg: Message = {
      id: genId(),
      conversationId,
      senderId,
      senderName,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      read: true,
    };

    const convMsgs = [...(messages[conversationId] ?? []), msg];
    const updatedMessages = { ...messages, [conversationId]: convMsgs };

    // Update conversation's last message
    const updatedConvs = conversations.map((c) =>
      c.id === conversationId
        ? { ...c, lastMessage: msg.text, lastMessageAt: msg.timestamp }
        : c
    );

    setMessages(updatedMessages);
    setConversations(updatedConvs);
    persist(updatedConvs, updatedMessages);

    // Simulate typing then bot reply
    setTypingConversations((prev) => new Set([...prev, conversationId]));
    const delay = 1200 + Math.random() * 1800;
    setTimeout(() => {
      setTypingConversations((prev) => {
        const next = new Set(prev);
        next.delete(conversationId);
        return next;
      });
      const reply: Message = {
        id: genId(),
        conversationId,
        senderId: "provider",
        senderName: updatedConvs.find((c) => c.id === conversationId)?.providerName ?? "Provider",
        text: getRandomReply(categoryId),
        timestamp: new Date().toISOString(),
        read: false,
      };
      setMessages((prev) => {
        const updated = { ...prev, [conversationId]: [...(prev[conversationId] ?? []), reply] };
        setConversations((prevConvs) => {
          const updConvs = prevConvs.map((c) =>
            c.id === conversationId
              ? { ...c, lastMessage: reply.text, lastMessageAt: reply.timestamp, unreadCount: c.unreadCount + 1 }
              : c
          );
          persist(updConvs, updated);
          return updConvs;
        });
        return updated;
      });
    }, delay);
  }, [messages, conversations, persist]);

  const markAsRead = useCallback((conversationId: string) => {
    const updatedMsgs = {
      ...messages,
      [conversationId]: (messages[conversationId] ?? []).map((m) => ({ ...m, read: true })),
    };
    const updatedConvs = conversations.map((c) =>
      c.id === conversationId ? { ...c, unreadCount: 0 } : c
    );
    setMessages(updatedMsgs);
    setConversations(updatedConvs);
    persist(updatedConvs, updatedMsgs);
  }, [messages, conversations, persist]);

  const getConversationMessages = useCallback((id: string) => messages[id] ?? [], [messages]);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const isTyping = useCallback((conversationId: string) => typingConversations.has(conversationId), [typingConversations]);

  return {
    conversations,
    getConversationMessages,
    getOrCreateConversation,
    sendMessage,
    markAsRead,
    totalUnread,
    isTyping,
  };
});

export { MessagingProvider, useMessaging };
