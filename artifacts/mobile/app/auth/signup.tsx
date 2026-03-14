import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  ScrollView,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";

import { Colors } from "@/constants/colors";
import { useAppContext, AccountType } from "@/context/AppContext";
import { ACCOUNT_TYPES, KENYAN_COUNTIES } from "@/constants/data";

const ACCOUNT_TYPE_META: Record<string, { emoji: string; color: string; desc: string }> = {
  customer: { emoji: "👤", color: "#1A3A5C", desc: "Browse & discover services" },
  provider: { emoji: "🔧", color: "#1A5C38", desc: "Offer your professional skills" },
  business: { emoji: "🏢", color: "#5C3A1A", desc: "Promote your business" },
  employer: { emoji: "💼", color: "#3A1A5C", desc: "Post jobs & hire talent" },
  agent: { emoji: "🏠", color: "#5C1A1A", desc: "List & sell properties" },
};

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const { register } = useAppContext();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  // Step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+254 ");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  // Step 2
  const [accountType, setAccountType] = useState<AccountType>("customer");
  // Step 3
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]) {
        setAvatar(result.assets[0].uri);
        Haptics.selectionAsync();
      }
    } catch {}
  };

  const validateStep1 = () => {
    if (!name.trim()) return "Full name is required";
    if (!email.trim() || !email.includes("@")) return "Valid email is required";
    if (!phone.trim() || phone.replace(/\s/g, "").length < 9) return "Valid phone number is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password !== confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleNext = () => {
    const err = step === 1 ? validateStep1() : null;
    if (err) { setError(err); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); return; }
    setError("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((prev) => Math.min(prev + 1, 3) as any);
  };

  const handleRegister = async () => {
    setError("");
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = await register({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password,
      accountType,
      location: location.trim(),
      bio: bio.trim(),
    });
    setLoading(false);
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } else {
      setError(result.error ?? "Registration failed");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setStep(1);
    }
  };

  const progress = step / 3;

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Top nav */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => step === 1 ? router.back() : setStep((s) => (s - 1) as any)}
        >
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>

        {/* Step dots */}
        <View style={styles.stepDots}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={[styles.dot, step >= s && styles.dotActive, step === s && styles.dotCurrent]} />
          ))}
        </View>

        <View style={{ width: 38 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` as any }]} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: isWeb ? 34 : insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && (
          <>
            {/* Hero */}
            <View style={styles.heroSection}>
              <TouchableOpacity style={styles.avatarPickerWrap} onPress={pickAvatar}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.avatarImage} contentFit="cover" />
                ) : (
                  <LinearGradient colors={[Colors.green, Colors.darkCard]} style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={32} color={Colors.textMuted} />
                  </LinearGradient>
                )}
                <View style={styles.avatarEditBadge}>
                  <Ionicons name="camera" size={12} color={Colors.darkBg} />
                </View>
              </TouchableOpacity>
              <Text style={styles.heroTitle}>Create Your Account</Text>
              <Text style={styles.heroSubtitle}>Join thousands of Kenyans on My Kenyan Guide</Text>
            </View>

            <View style={styles.form}>
              <Field label="Full Name" icon="person-outline" value={name} onChangeText={setName} placeholder="John Kamau" />
              <Field label="Email Address" icon="mail-outline" value={email} onChangeText={setEmail} placeholder="john@email.com" keyboardType="email-address" autoCapitalize="none" />
              <Field label="Phone Number" icon="call-outline" value={phone} onChangeText={setPhone} placeholder="+254 7XX XXX XXX" keyboardType="phone-pad" />

              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="At least 6 characters"
                    placeholderTextColor={Colors.textMuted}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
                {password.length > 0 && (
                  <View style={styles.strengthRow}>
                    {[...Array(4)].map((_, i) => (
                      <View key={i} style={[styles.strengthBar, { backgroundColor: password.length > i * 3 + 2 ? i < 2 ? "#E8A84C" : Colors.gold : Colors.borderLight }]} />
                    ))}
                    <Text style={styles.strengthLabel}>
                      {password.length < 6 ? "Too short" : password.length < 10 ? "Moderate" : "Strong"}
                    </Text>
                  </View>
                )}
              </View>

              <Field label="Confirm Password" icon="lock-closed-outline" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Repeat password" secureTextEntry={!showPassword} autoCapitalize="none" />

              {error ? <ErrorBox message={error} /> : null}

              <PrimaryButton onPress={handleNext} label="Continue" icon="arrow-forward" />

              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>Already have an account?</Text>
                <View style={styles.divider} />
              </View>

              <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push("/auth/index")}>
                <Text style={styles.secondaryBtnText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <View style={styles.stepHeader}>
              <View style={styles.stepIconWrap}>
                <Ionicons name="people-outline" size={28} color={Colors.gold} />
              </View>
              <Text style={styles.stepTitle}>What brings you here?</Text>
              <Text style={styles.stepSubtitle}>Choose the account type that best fits you</Text>
            </View>

            <View style={[styles.form, { gap: 10 }]}>
              {ACCOUNT_TYPES.map((type) => {
                const meta = ACCOUNT_TYPE_META[type.id] ?? { emoji: "👤", color: Colors.green, desc: "" };
                const isActive = accountType === type.id;
                return (
                  <TouchableOpacity
                    key={type.id}
                    style={[styles.typeCard, isActive && styles.typeCardActive]}
                    onPress={() => { setAccountType(type.id as AccountType); Haptics.selectionAsync(); }}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.typeEmoji, { backgroundColor: meta.color }]}>
                      <Text style={{ fontSize: 22 }}>{meta.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.typeLabel, isActive && { color: Colors.gold }]}>{type.label}</Text>
                      <Text style={styles.typeDesc}>{meta.desc}</Text>
                    </View>
                    <View style={[styles.typeRadio, isActive && styles.typeRadioActive]}>
                      {isActive && <Ionicons name="checkmark" size={14} color={Colors.darkBg} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
              <PrimaryButton onPress={handleNext} label="Continue" icon="arrow-forward" />
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <View style={styles.stepHeader}>
              <View style={styles.stepIconWrap}>
                <Ionicons name="location-outline" size={28} color={Colors.gold} />
              </View>
              <Text style={styles.stepTitle}>Almost done!</Text>
              <Text style={styles.stepSubtitle}>Add your location and a short bio to complete your profile</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Your County</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="location-outline" size={18} color={Colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    value={location}
                    onChangeText={setLocation}
                    placeholder="e.g. Nairobi, Mombasa, Kisumu"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }} contentContainerStyle={{ gap: 8 }}>
                  {KENYAN_COUNTIES.slice(0, 12).map((c) => (
                    <TouchableOpacity key={c} style={[styles.pill, location === c && styles.pillActive]} onPress={() => setLocation(c)}>
                      <Text style={[styles.pillText, location === c && styles.pillTextActive]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Short Bio <Text style={{ color: Colors.textMuted }}>(optional)</Text></Text>
                <View style={[styles.inputWrap, { alignItems: "flex-start", paddingTop: 12, paddingBottom: 12 }]}>
                  <TextInput
                    style={[styles.input, { height: 88, textAlignVertical: "top" }]}
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Tell others about yourself, your skills, or your business..."
                    placeholderTextColor={Colors.textMuted}
                    multiline
                    maxLength={220}
                  />
                </View>
                <Text style={styles.charCount}>{bio.length}/220</Text>
              </View>

              {/* Terms */}
              <TouchableOpacity style={styles.termsRow} onPress={() => setAgreed((a) => !a)}>
                <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
                  {agreed && <Ionicons name="checkmark" size={13} color={Colors.darkBg} />}
                </View>
                <Text style={styles.termsText}>
                  I agree to the{" "}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>

              {error ? <ErrorBox message={error} /> : null}

              <TouchableOpacity
                style={[styles.primaryBtn, (!agreed || loading) && { opacity: 0.65 }]}
                onPress={handleRegister}
                disabled={!agreed || loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.darkBg} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.darkBg} />
                    <Text style={styles.primaryBtnText}>Create Account</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Field({ label, icon, ...props }: any) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons name={icon} size={18} color={Colors.textMuted} />
        <TextInput style={styles.input} placeholderTextColor={Colors.textMuted} {...props} />
      </View>
    </View>
  );
}

function PrimaryButton({ onPress, label, icon, disabled }: { onPress: () => void; label: string; icon?: string; disabled?: boolean }) {
  return (
    <TouchableOpacity style={[styles.primaryBtn, disabled && { opacity: 0.6 }]} onPress={onPress} disabled={disabled}>
      {icon && <Ionicons name={icon as any} size={18} color={Colors.darkBg} />}
      <Text style={styles.primaryBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <View style={styles.errorBox}>
      <Ionicons name="alert-circle-outline" size={16} color="#E85C5C" />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBg },
  topNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 10 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  stepDots: { flexDirection: "row", gap: 7, alignItems: "center" },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.textMuted },
  dotCurrent: { width: 22, backgroundColor: Colors.gold },
  progressTrack: { height: 3, backgroundColor: Colors.borderLight, marginHorizontal: 20, borderRadius: 2, marginBottom: 4 },
  progressFill: { height: 3, backgroundColor: Colors.gold, borderRadius: 2 },
  scroll: { paddingHorizontal: 24, paddingTop: 16, gap: 0 },
  heroSection: { alignItems: "center", gap: 12, marginBottom: 32, marginTop: 8 },
  avatarPickerWrap: { position: "relative" },
  avatarImage: { width: 90, height: 90, borderRadius: 28, borderWidth: 2, borderColor: Colors.gold },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 28, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: Colors.border },
  avatarEditBadge: { position: "absolute", bottom: -2, right: -2, width: 26, height: 26, borderRadius: 8, backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: Colors.darkBg },
  heroTitle: { fontFamily: "Inter_700Bold", fontSize: 24, color: Colors.textPrimary, letterSpacing: -0.5 },
  heroSubtitle: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, textAlign: "center" },
  stepHeader: { alignItems: "center", gap: 10, marginBottom: 28, marginTop: 12 },
  stepIconWrap: { width: 64, height: 64, borderRadius: 22, backgroundColor: Colors.green, borderWidth: 1.5, borderColor: Colors.gold + "40", alignItems: "center", justifyContent: "center" },
  stepTitle: { fontFamily: "Inter_700Bold", fontSize: 24, color: Colors.textPrimary, letterSpacing: -0.4 },
  stepSubtitle: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, textAlign: "center", paddingHorizontal: 16 },
  form: { gap: 18 },
  field: { gap: 8 },
  label: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary, paddingLeft: 2 },
  inputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, gap: 10 },
  input: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textPrimary, padding: 0 },
  strengthRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  strengthBar: { flex: 1, height: 3, borderRadius: 2 },
  strengthLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted, minWidth: 56 },
  typeCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, padding: 16 },
  typeCardActive: { borderColor: Colors.gold + "60", backgroundColor: Colors.green + "25" },
  typeEmoji: { width: 50, height: 50, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  typeLabel: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.textPrimary },
  typeDesc: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  typeRadio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  typeRadioActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  pill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border },
  pillActive: { backgroundColor: Colors.gold + "20", borderColor: Colors.gold + "50" },
  pillText: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.textMuted },
  pillTextActive: { color: Colors.gold },
  charCount: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted, textAlign: "right", marginTop: 4 },
  termsRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center", justifyContent: "center", marginTop: 1, flexShrink: 0 },
  checkboxActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  termsText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textMuted, flex: 1, lineHeight: 20 },
  termsLink: { fontFamily: "Inter_500Medium", color: Colors.gold },
  primaryBtn: { backgroundColor: Colors.gold, borderRadius: 14, paddingVertical: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  primaryBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.darkBg },
  secondaryBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  secondaryBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.textPrimary },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  divider: { flex: 1, height: 1, backgroundColor: Colors.borderLight },
  dividerText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(232,92,92,0.1)", borderWidth: 1, borderColor: "rgba(232,92,92,0.3)", borderRadius: 12, padding: 12 },
  errorText: { fontFamily: "Inter_400Regular", fontSize: 13, color: "#E85C5C", flex: 1 },
});
