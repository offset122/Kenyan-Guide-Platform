import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { requestNotificationPermission } from "@/lib/permissions";

const STORAGE_KEY = "@mkg:notifications_v1";
const PREFS_KEY = "@mkg:notif_prefs_v1";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotifCategory =
  | "message"
  | "listing"
  | "review"
  | "system"
  | "promo";

export type AppNotification = {
  id: string;
  category: NotifCategory;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, string>;
};

export type NotifPrefs = {
  messages: boolean;
  listings: boolean;
  reviews: boolean;
  system: boolean;
  promo: boolean;
  pushEnabled: boolean;
};

const DEFAULT_PREFS: NotifPrefs = {
  messages: true,
  listings: true,
  reviews: true,
  system: true,
  promo: false,
  pushEnabled: false,
};

// ─── Push handler (runs while app is foregrounded) ───────────────────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false, // we handle in-app ourselves
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: false,
    shouldShowList: true,
  }),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}

async function registerForPushAsync(): Promise<string | null> {
  if (Platform.OS === "web") return null;
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "My Kenyan Guide",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#C9A84C",
        sound: "default",
        enableVibrate: true,
        showBadge: true,
      });
      await Notifications.setNotificationChannelAsync("messages", {
        name: "Messages",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 150, 100, 150],
        lightColor: "#A87AE8",
        sound: "default",
        enableVibrate: true,
        showBadge: true,
      });
      await Notifications.setNotificationChannelAsync("listings", {
        name: "Listings & Reviews",
        importance: Notifications.AndroidImportance.DEFAULT,
        lightColor: "#C9A84C",
        sound: "default",
        showBadge: true,
      });
    }
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: undefined,
    }).catch(() => null);
    return token?.data ?? null;
  } catch {
    return null;
  }
}

async function scheduleLocalPush(
  title: string,
  body: string,
  data: Record<string, string> = {},
  channelId = "default"
) {
  if (Platform.OS === "web") {
    // Web Push API
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/images/icon.png",
        badge: "/images/icon.png",
        tag: channelId,
        data,
      });
    }
    return;
  }
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: "default",
        ...(Platform.OS === "android" ? { channelId } : {}),
      },
      trigger: null, // immediate
    });
  } catch {}
}

// ─── Context ─────────────────────────────────────────────────────────────────

const [NotificationProvider, useNotifications] = createContextHook(() => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<"granted" | "denied" | "undetermined">("undetermined");
  const notifListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // ── Load persisted data ──────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [raw, prefsRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(PREFS_KEY),
        ]);
        if (raw) setNotifications(JSON.parse(raw));
        if (prefsRaw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(prefsRaw) });
      } catch {}
    };
    load();
  }, []);

  // ── Check permission status ──────────────────────────────────────────────
  useEffect(() => {
    if (Platform.OS === "web") {
      if ("Notification" in window) {
        setPermissionStatus(Notification.permission as any);
      }
      return;
    }
    Notifications.getPermissionsAsync().then(({ status }) => {
      setPermissionStatus(status as any);
    });
  }, []);

  // ── Notification listeners ───────────────────────────────────────────────
  useEffect(() => {
    // Foreground notification received
    notifListener.current = Notifications.addNotificationReceivedListener((notif) => {
      const { title, body, data } = notif.request.content;
      if (title && body) {
        addNotification({
          category: (data?.category as NotifCategory) ?? "system",
          title: String(title),
          body: String(body),
          data: data as Record<string, string>,
        });
      }
    });

    // User tapped a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, string>;
      handleNotificationTap(data);
    });

    return () => {
      notifListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  // ── App state — re-check permissions when foregrounded ───────────────────
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && Platform.OS !== "web") {
        Notifications.getPermissionsAsync().then(({ status }) => {
          setPermissionStatus(status as any);
        });
      }
    });
    return () => sub.remove();
  }, []);

  // ── Persist notifications ────────────────────────────────────────────────
  const persist = useCallback(async (items: AppNotification[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 100)));
    } catch {}
  }, []);

  const persistPrefs = useCallback(async (p: NotifPrefs) => {
    try {
      await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(p));
    } catch {}
  }, []);

  // ── Request push permission ──────────────────────────────────────────────
  const requestPermission = useCallback(async (): Promise<boolean> => {
    const result = await requestNotificationPermission({ showRationale: true });
    if (result !== "granted") {
      setPermissionStatus(result === "blocked" ? "denied" : "denied");
      return false;
    }
    // Set up Android channels + get token
    const token = await registerForPushAsync();
    setPushToken(token);
    setPermissionStatus("granted");
    setPrefs((p) => {
      const updated = { ...p, pushEnabled: true };
      persistPrefs(updated);
      return updated;
    });
    return true;
  }, [persistPrefs]);

  // ── Add in-app notification ──────────────────────────────────────────────
  const addNotification = useCallback((payload: {
    category: NotifCategory;
    title: string;
    body: string;
    data?: Record<string, string>;
  }) => {
    const notif: AppNotification = {
      id: genId(),
      ...payload,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => {
      const updated = [notif, ...prev].slice(0, 100);
      persist(updated);
      return updated;
    });
  }, [persist]);

  // ── Send notification (in-app + push if enabled) ─────────────────────────
  const send = useCallback(async (payload: {
    category: NotifCategory;
    title: string;
    body: string;
    data?: Record<string, string>;
    channelId?: string;
  }) => {
    const catPrefMap: Record<NotifCategory, keyof NotifPrefs> = {
      message: "messages",
      listing: "listings",
      review: "reviews",
      system: "system",
      promo: "promo",
    };
    const prefKey = catPrefMap[payload.category];

    // Always add in-app
    addNotification(payload);

    // Push only if pref enabled
    setPrefs((currentPrefs) => {
      if (currentPrefs[prefKey] && currentPrefs.pushEnabled) {
        scheduleLocalPush(
          payload.title,
          payload.body,
          payload.data ?? {},
          payload.channelId ?? "default"
        );
      }
      return currentPrefs;
    });
  }, [addNotification]);

  // ── Convenience senders ──────────────────────────────────────────────────
  const notifyNewMessage = useCallback((senderName: string, preview: string, conversationId: string) => {
    send({
      category: "message",
      title: `💬 ${senderName}`,
      body: preview,
      data: { screen: "messages", conversationId },
      channelId: "messages",
    });
  }, [send]);

  const notifyListingPosted = useCallback((listingTitle: string, listingId: string) => {
    send({
      category: "listing",
      title: "✅ Listing Published",
      body: `"${listingTitle}" is now live on My Kenyan Guide`,
      data: { screen: "listing", listingId },
      channelId: "listings",
    });
  }, [send]);

  const notifyNewReview = useCallback((listingTitle: string, reviewerName: string, listingId: string) => {
    send({
      category: "review",
      title: "⭐ New Review",
      body: `${reviewerName} reviewed "${listingTitle}"`,
      data: { screen: "listing", listingId },
      channelId: "listings",
    });
  }, [send]);

  const notifyListingSaved = useCallback((listingTitle: string) => {
    send({
      category: "listing",
      title: "🔖 Saved",
      body: `"${listingTitle}" added to your saved listings`,
      data: { screen: "saved" },
      channelId: "listings",
    });
  }, [send]);

  const notifyWelcome = useCallback((name: string) => {
    send({
      category: "system",
      title: "🇰🇪 Welcome to My Kenyan Guide!",
      body: `Hi ${name}! Discover services, jobs, and more across Kenya.`,
      data: { screen: "home" },
    });
  }, [send]);

  const notifyPromo = useCallback((title: string, body: string) => {
    send({ category: "promo", title, body, data: { screen: "explore" } });
  }, [send]);

  // ── Handle tap navigation ────────────────────────────────────────────────
  const handleNotificationTap = useCallback((data: Record<string, string>) => {
    if (!data?.screen) return;
    switch (data.screen) {
      case "messages":
        if (data.conversationId) {
          router.push({ pathname: "/messages/[id]", params: { id: data.conversationId } });
        } else {
          router.push("/messages" as any);
        }
        break;
      case "listing":
        if (data.listingId) {
          router.push({ pathname: "/listing/[id]", params: { id: data.listingId } });
        }
        break;
      case "saved":
        router.push("/(tabs)/saved" as any);
        break;
      case "explore":
        router.push("/(tabs)/explore" as any);
        break;
      default:
         router.push("/(tabs)" as any);
    }
  }, []);

  // ── Mark read ────────────────────────────────────────────────────────────
  const markRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => n.id === id ? { ...n, read: true } : n);
      persist(updated);
      return updated;
    });
  }, [persist]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      persist(updated);
      return updated;
    });
  }, [persist]);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      persist(updated);
      return updated;
    });
  }, [persist]);

  const clearAll = useCallback(() => {
    setNotifications([]);
    persist([]);
  }, [persist]);

  // ── Update prefs ─────────────────────────────────────────────────────────
  const updatePrefs = useCallback((updates: Partial<NotifPrefs>) => {
    setPrefs((prev) => {
      const updated = { ...prev, ...updates };
      persistPrefs(updated);
      return updated;
    });
  }, [persistPrefs]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    prefs,
    pushToken,
    permissionStatus,
    unreadCount,
    requestPermission,
    send,
    notifyNewMessage,
    notifyListingPosted,
    notifyNewReview,
    notifyListingSaved,
    notifyWelcome,
    notifyPromo,
    handleNotificationTap,
    markRead,
    markAllRead,
    deleteNotification,
    clearAll,
    updatePrefs,
  };
});

export { NotificationProvider, useNotifications };
