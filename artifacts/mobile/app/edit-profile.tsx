import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";

import { Colors } from "@/constants/colors";
import { useAppContext, AccountType } from "@/context/AppContext";
import { ACCOUNT_TYPES, KENYAN_COUNTIES } from "@/constants/data";
import { requestCameraPermission, requestMediaLibraryPermission } from "@/lib/permissions";

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const { user, updateProfile } = useAppContext();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [location, setLocation] = useState(user?.location ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [accountType, setAccountType] = useState<AccountType>(user?.accountType ?? "customer");
  const [avatarUri, setAvatarUri] = useState<string | undefined>(user?.avatarUrl);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const pickAvatar = async () => {
    const permission = await requestMediaLibraryPermission({ showRationale: true });
    if (permission !== "granted") return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
        Haptics.selectionAsync();
      }
    } catch {}
  };

  const takeAvatarPhoto = async () => {
    const permission = await requestCameraPermission({ showRationale: true });
    if (permission !== "granted") return;
    try {
      const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
        Haptics.selectionAsync();
      }
    } catch {}
  };

  const handleChangeAvatar = () => {
    Alert.alert("Change Profile Photo", "Choose an option", [
      { text: "Camera", onPress: takeAvatarPhoto },
      { text: "Photo Library", onPress: pickAvatar },
      { text: "Remove Photo", style: "destructive", onPress: () => setAvatarUri(undefined) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter your full name");
      return;
    }
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateProfile({ name: name.trim(), phone: phone.trim(), location: location.trim(), bio: bio.trim(), accountType, avatarUrl: avatarUri });
    setLoading(false);
    setSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => { setSaved(false); router.back(); }, 1200);
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleChangeAvatar} activeOpacity={0.85}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} contentFit="cover" />
            ) : (
              <Text style={styles.avatarInitials}>
                {(user?.name ?? "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
              </Text>
            )}
            <View style={styles.avatarCameraOverlay}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleChangeAvatar}>
            <Text style={styles.avatarHint}>Tap to change photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <FormField label="Full Name *" icon="person-outline" value={name} onChangeText={setName} placeholder="John Kamau" maxLength={60} />
          <FormField label="Phone Number" icon="call-outline" value={phone} onChangeText={setPhone} placeholder="+254 7XX XXX XXX" keyboardType="phone-pad" />
          <FormField label="Location" icon="location-outline" value={location} onChangeText={setLocation} placeholder="Nairobi, Mombasa..." />

          {/* County quick-pick */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: -8 }} contentContainerStyle={{ gap: 6 }}>
            {KENYAN_COUNTIES.slice(0, 8).map((c) => (
              <TouchableOpacity key={c} style={[styles.pill, location === c && styles.pillActive]} onPress={() => setLocation(c)}>
                <Text style={[styles.pillText, location === c && styles.pillTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Account Type */}
          <View style={styles.field}>
            <Text style={styles.label}>Account Type</Text>
            <View style={styles.accountTypeList}>
              {ACCOUNT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.accountTypeCard, accountType === type.id && styles.accountTypeCardActive]}
                  onPress={() => setAccountType(type.id as AccountType)}
                >
                  <Ionicons name={type.icon as any} size={18} color={accountType === type.id ? Colors.gold : Colors.textMuted} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.accountTypeLabel, accountType === type.id && { color: Colors.gold }]}>{type.label}</Text>
                    <Text style={styles.accountTypeDesc}>{type.description}</Text>
                  </View>
                  {accountType === type.id && <Ionicons name="checkmark-circle" size={18} color={Colors.gold} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bio */}
          <View style={styles.field}>
            <Text style={styles.label}>Bio (Optional)</Text>
            <View style={[styles.inputWrap, { alignItems: "flex-start", paddingVertical: 12 }]}>
              <TextInput
                style={[styles.input, { height: 90, textAlignVertical: "top" }]}
                value={bio}
                onChangeText={setBio}
                placeholder="A short description about you or your business..."
                placeholderTextColor={Colors.textMuted}
                multiline
                maxLength={200}
              />
            </View>
            <Text style={styles.charCount}>{bio.length}/200</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, loading && { opacity: 0.7 }, saved && styles.saveBtnSuccess]}
          onPress={handleSave}
          disabled={loading || saved}
        >
          {loading ? (
            <ActivityIndicator color={Colors.darkBg} />
          ) : saved ? (
            <>
              <Ionicons name="checkmark" size={18} color={Colors.darkBg} />
              <Text style={styles.saveBtnText}>Saved!</Text>
            </>
          ) : (
            <Text style={styles.saveBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: isWeb ? 80 : insets.bottom + 40 }} />
      </ScrollView>
    </View>
  );
}

function FormField({ label, icon, value, onChangeText, placeholder, maxLength, keyboardType }: {
  label: string; icon: string; value: string; onChangeText: (t: string) => void;
  placeholder?: string; maxLength?: number; keyboardType?: any;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons name={icon as any} size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          maxLength={maxLength}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBg },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, justifyContent: "space-between" },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.textPrimary },
  content: { paddingHorizontal: 16, gap: 0 },
  avatarSection: { alignItems: "center", paddingVertical: 24, gap: 10 },
  avatarContainer: { width: 88, height: 88, borderRadius: 28, backgroundColor: Colors.green, borderWidth: 2, borderColor: Colors.gold, alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" },
  avatarImage: { width: "100%", height: "100%" },
  avatarInitials: { fontFamily: "Inter_700Bold", fontSize: 30, color: Colors.gold },
  avatarCameraOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, height: 28, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  avatarHint: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.gold },
  form: { gap: 16 },
  field: { gap: 8 },
  label: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary, paddingLeft: 4 },
  inputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, gap: 10 },
  input: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textPrimary, padding: 0 },
  charCount: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted, textAlign: "right" },
  pill: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  pillActive: { backgroundColor: Colors.gold + "20", borderColor: Colors.gold },
  pillText: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.textMuted },
  pillTextActive: { color: Colors.gold },
  accountTypeList: { gap: 8 },
  accountTypeCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 12 },
  accountTypeCardActive: { borderColor: Colors.gold + "60", backgroundColor: Colors.green + "30" },
  accountTypeLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.textPrimary },
  accountTypeDesc: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  saveBtn: { backgroundColor: Colors.gold, borderRadius: 14, paddingVertical: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, marginTop: 28 },
  saveBtnSuccess: { backgroundColor: "#5ADE8A" },
  saveBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.darkBg },
});
