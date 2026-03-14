import createContextHook from "@nkzw/create-context-hook";
import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

type ToastType = "success" | "error" | "info";
type ToastMessage = { id: string; text: string; type: ToastType };

const TOAST_DURATION = 3000;

const TOAST_STYLES: Record<ToastType, { bg: string; icon: string; color: string }> = {
  success: { bg: "#1A3D2A", icon: "checkmark-circle", color: "#5ADE8A" },
  error: { bg: "#3D1A1A", icon: "close-circle", color: "#E85C5C" },
  info: { bg: Colors.darkCard, icon: "information-circle", color: Colors.gold },
};

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, tension: 100, friction: 10, useNativeDriver: true }),
    ]).start();
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -10, duration: 200, useNativeDriver: true }),
      ]).start(() => onDismiss(toast.id));
    }, TOAST_DURATION);
    return () => clearTimeout(timer);
  }, []);

  const s = TOAST_STYLES[toast.type];
  return (
    <Animated.View style={[styles.toast, { backgroundColor: s.bg, borderColor: s.color + "40", opacity, transform: [{ translateY }] }]}>
      <Ionicons name={s.icon as any} size={18} color={s.color} />
      <Text style={[styles.toastText, { flex: 1 }]}>{toast.text}</Text>
      <TouchableOpacity onPress={() => onDismiss(toast.id)} hitSlop={8}>
        <Ionicons name="close" size={14} color={Colors.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
}

function ToastOverlay({ toasts, onDismiss }: { toasts: ToastMessage[]; onDismiss: (id: string) => void }) {
  const insets = useSafeAreaInsets();
  if (toasts.length === 0) return null;
  return (
    <View style={[styles.overlay, { top: insets.top + 12 }]} pointerEvents="box-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </View>
  );
}

const [ToastProvider, useToast] = createContextHook(() => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((text: string, type: ToastType = "info") => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev.slice(-2), { id, text, type }]);
  }, []);

  const success = useCallback((text: string) => show(text, "success"), [show]);
  const error = useCallback((text: string) => show(text, "error"), [show]);
  const info = useCallback((text: string) => show(text, "info"), [show]);

  const Outlet = () => <ToastOverlay toasts={toasts} onDismiss={dismiss} />;

  return { show, success, error, info, Outlet };
});

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
    pointerEvents: "box-none" as any,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.textPrimary,
  },
});

export { ToastProvider, useToast };
