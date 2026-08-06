import { Alert, Linking, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PermissionType = "camera" | "mediaLibrary" | "location" | "notifications";

export type PermissionResult = "granted" | "denied" | "blocked";

// ─── Open device settings ─────────────────────────────────────────────────────

function openSettings() {
  if (Platform.OS === "web") return;
  Linking.openSettings().catch(() => {});
}

// ─── Blocked alert — directs user to Settings ────────────────────────────────

function showBlockedAlert(permissionLabel: string, reason: string) {
  Alert.alert(
    `${permissionLabel} Access Required`,
    `${reason}\n\nPlease go to Settings and enable ${permissionLabel} for My Kenyan Guide.`,
    [
      { text: "Not Now", style: "cancel" },
      { text: "Open Settings", onPress: openSettings },
    ]
  );
}

// ─── Rationale alert — explains why before asking ────────────────────────────

function showRationaleAlert(
  permissionLabel: string,
  rationale: string,
  onContinue: () => void
) {
  Alert.alert(
    `Allow ${permissionLabel}`,
    rationale,
    [
      { text: "Not Now", style: "cancel" },
      { text: "Continue", onPress: onContinue },
    ]
  );
}

// ─── Camera ──────────────────────────────────────────────────────────────────

export async function requestCameraPermission(
  options: { showRationale?: boolean } = {}
): Promise<PermissionResult> {
  if (Platform.OS === "web") return "granted";

  const { status: current, canAskAgain } =
    await ImagePicker.getCameraPermissionsAsync();

  if (current === "granted") return "granted";

  if (!canAskAgain) {
    showBlockedAlert(
      "Camera",
      "My Kenyan Guide needs camera access to let you take photos for your listings and profile."
    );
    return "blocked";
  }

  if (options.showRationale) {
    return new Promise((resolve) => {
      showRationaleAlert(
        "Camera",
        "My Kenyan Guide would like to use your camera to take photos for your listings and profile picture.",
        async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          resolve(status === "granted" ? "granted" : "denied");
        }
      );
    });
  }

  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === "granted" ? "granted" : "denied";
}

// ─── Media Library ────────────────────────────────────────────────────────────

export async function requestMediaLibraryPermission(
  options: { showRationale?: boolean } = {}
): Promise<PermissionResult> {
  if (Platform.OS === "web") return "granted";

  const { status: current, canAskAgain } =
    await ImagePicker.getMediaLibraryPermissionsAsync();

  if (current === "granted") return "granted";

  if (!canAskAgain) {
    showBlockedAlert(
      "Photo Library",
      "My Kenyan Guide needs access to your photo library to let you upload photos for listings and your profile."
    );
    return "blocked";
  }

  if (options.showRationale) {
    return new Promise((resolve) => {
      showRationaleAlert(
        "Photo Library",
        "My Kenyan Guide would like to access your photo library so you can upload photos for your listings and profile picture.",
        async () => {
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          resolve(status === "granted" ? "granted" : "denied");
        }
      );
    });
  }

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === "granted" ? "granted" : "denied";
}

// ─── Location ─────────────────────────────────────────────────────────────────

export async function requestLocationPermission(
  options: { showRationale?: boolean } = {}
): Promise<PermissionResult> {
  if (Platform.OS === "web") return "granted";

  const { status: current, canAskAgain } =
    await Location.getForegroundPermissionsAsync();

  if (current === "granted") return "granted";

  if (!canAskAgain) {
    showBlockedAlert(
      "Location",
      "My Kenyan Guide uses your location to show nearby services and listings in your area."
    );
    return "blocked";
  }

  if (options.showRationale) {
    return new Promise((resolve) => {
      showRationaleAlert(
        "Location",
        "My Kenyan Guide would like to use your location to show you nearby services, businesses, and listings across Kenya.",
        async () => {
          const { status } =
            await Location.requestForegroundPermissionsAsync();
          resolve(status === "granted" ? "granted" : "denied");
        }
      );
    });
  }

  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted" ? "granted" : "denied";
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function requestNotificationPermission(
  options: { showRationale?: boolean } = {}
): Promise<PermissionResult> {
  if (Platform.OS === "web") {
    if (!("Notification" in window)) return "denied";
    if (Notification.permission === "granted") return "granted";
    if (Notification.permission === "denied") {
      showBlockedAlert(
        "Notifications",
        "My Kenyan Guide needs notification permission to alert you about messages, listings, and reviews."
      );
      return "blocked";
    }
    const result = await Notification.requestPermission();
    return result === "granted" ? "granted" : "denied";
  }

  const { status: current, canAskAgain } =
    await Notifications.getPermissionsAsync();

  if (current === "granted") return "granted";

  if (!canAskAgain) {
    showBlockedAlert(
      "Notifications",
      "My Kenyan Guide needs notification permission to alert you about new messages, listing updates, and reviews."
    );
    return "blocked";
  }

  if (options.showRationale) {
    return new Promise((resolve) => {
      showRationaleAlert(
        "Notifications",
        "My Kenyan Guide would like to send you notifications for new messages, listing activity, and important updates.",
        async () => {
          const { status } = await Notifications.requestPermissionsAsync();
          resolve(status === "granted" ? "granted" : "denied");
        }
      );
    });
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted" ? "granted" : "denied";
}
