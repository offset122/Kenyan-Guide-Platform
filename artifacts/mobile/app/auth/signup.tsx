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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { Colors } from "@/constants/colors";
import { useAppContext, AccountType } from "@/context/AppContext";
import { ACCOUNT_TYPES, KENYAN_COUNTIES } from "@/constants/data";

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const { register } = useAppContext();

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+254 ");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>("customer");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateStep1 = () => {
    if (!name.trim()) return "Full name is required";
    if (!email.trim() || !email.includes("@")) return "Valid email is required";
    if (!phone.trim() || phone.trim().length < 8) return "Valid phone number is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password !== confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError("");
    setStep(2);
  };

  const handleRegister = async () => {
    setError("");
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await register({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      accountType,
      location: location.trim(),
      bio: bio.trim(),
    });
    setLoading(false);
    if (result.success) {
      router.replace("/(tabs)");
    } else {
      setError(result.error ?? "Registration failed");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setStep(1);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => step === 1 ? router.back() : setStep(1)}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Step {step} of 2</Text>
          {/* Progress */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: step === 1 ? "50%" : "100%" }]} />
          </View>
        </View>

        {step === 1 ? (
          <View style={styles.form}>
            <InputField label="Full Name" icon="person-outline" value={name} onChangeText={setName} placeholder="John Kamau" />
            <InputField label="Email Address" icon="mail-outline" value={email} onChangeText={setEmail} placeholder="john@email.com" keyboardType="email-address" autoCapitalize="none" />
            <InputField label="Phone Number" icon="call-outline" value={phone} onChangeText={setPhone} placeholder="+254 7XX XXX XXX" keyboardType="phone-pad" />
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Min 6 characters"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
            <InputField label="Confirm Password" icon="lock-closed-outline" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Repeat password" secureTextEntry={!showPassword} autoCapitalize="none" />

            {error ? <ErrorBox message={error} /> : null}

            <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
              <Text style={styles.primaryBtnText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.darkBg} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>I am a...</Text>
              <View style={styles.accountTypeGrid}>
                {ACCOUNT_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[styles.accountTypeCard, accountType === type.id && styles.accountTypeCardActive]}
                    onPress={() => setAccountType(type.id as AccountType)}
                  >
                    <Ionicons name={type.icon as any} size={22} color={accountType === type.id ? Colors.gold : Colors.textMuted} />
                    <Text style={[styles.accountTypeLabel, accountType === type.id && styles.accountTypeLabelActive]}>{type.label}</Text>
                    <Text style={styles.accountTypeDesc}>{type.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Location (County)</Text>
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
              {/* Quick county picks */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.countyPills} contentContainerStyle={styles.countyPillsContent}>
                {KENYAN_COUNTIES.slice(0, 10).map((c) => (
                  <TouchableOpacity key={c} style={[styles.countyPill, location === c && styles.countyPillActive]} onPress={() => setLocation(c)}>
                    <Text style={[styles.countyPillText, location === c && styles.countyPillTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Short Bio (Optional)</Text>
              <View style={[styles.inputWrap, { alignItems: "flex-start", paddingVertical: 12 }]}>
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell others a bit about yourself or your business..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  maxLength={200}
                />
              </View>
              <Text style={styles.charCount}>{bio.length}/200</Text>
            </View>

            {error ? <ErrorBox message={error} /> : null}

            <TouchableOpacity
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color={Colors.darkBg} /> : (
                <>
                  <Text style={styles.primaryBtnText}>Create Account</Text>
                  <Ionicons name="checkmark" size={18} color={Colors.darkBg} />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={{ paddingBottom: isWeb ? 34 : insets.bottom + 24 }} />
      </ScrollView>
    </View>
  );
}

function InputField({ label, icon, secureTextEntry, ...props }: {
  label: string;
  icon: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: any;
  autoCapitalize?: any;
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons name={icon as any} size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={secureTextEntry}
          {...props}
        />
      </View>
    </View>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <View style={styles.errorWrap}>
      <Ionicons name="alert-circle-outline" size={16} color="#E85C5C" />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBg },
  scroll: { paddingHorizontal: 24, flexGrow: 1 },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
    marginBottom: 24, marginTop: 12,
  },
  header: { marginBottom: 32, gap: 6 },
  title: { fontFamily: "Inter_700Bold", fontSize: 26, color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted },
  progressBar: { height: 4, backgroundColor: Colors.darkCard, borderRadius: 2, marginTop: 10 },
  progressFill: { height: 4, backgroundColor: Colors.gold, borderRadius: 2 },
  form: { gap: 18 },
  field: { gap: 8 },
  label: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary, paddingLeft: 4 },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, gap: 10,
  },
  input: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textPrimary, padding: 0 },
  accountTypeGrid: { gap: 8 },
  accountTypeCard: {
    backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", gap: 12,
  },
  accountTypeCardActive: { borderColor: Colors.gold + "60", backgroundColor: Colors.green + "30" },
  accountTypeLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.textPrimary, flex: 1 },
  accountTypeLabelActive: { color: Colors.gold },
  accountTypeDesc: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted },
  charCount: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted, textAlign: "right", marginTop: 4 },
  countyPills: { marginTop: 8 },
  countyPillsContent: { gap: 8 },
  countyPill: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  countyPillActive: { backgroundColor: Colors.gold + "20", borderColor: Colors.gold + "60" },
  countyPillText: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.textMuted },
  countyPillTextActive: { color: Colors.gold },
  errorWrap: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(232,92,92,0.1)", borderWidth: 1, borderColor: "rgba(232,92,92,0.3)",
    borderRadius: 10, padding: 12,
  },
  errorText: { fontFamily: "Inter_400Regular", fontSize: 13, color: "#E85C5C", flex: 1 },
  primaryBtn: {
    backgroundColor: Colors.gold, borderRadius: 14, paddingVertical: 16,
    alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8,
  },
  primaryBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.darkBg },
});
