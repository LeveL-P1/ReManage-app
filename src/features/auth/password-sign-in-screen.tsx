import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { demoCredentials, demoOtpUnavailableMessage } from "@/platform/auth/development-demo-auth";
import { useSession } from "@/platform/auth/session-provider";
import { colors, residentTheme } from "@/platform/theme/tokens";

export interface PasswordSignInScreenProps {
  demoMode?: boolean;
  onOtpChallenge(challengeId: string): void;
}

const genericError = "We could not sign you in. Please try again.";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function PasswordSignInScreen({ demoMode = false, onOtpChallenge }: PasswordSignInScreenProps) {
  const { requestOtp, signInWithPassword } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"password" | "otp" | null>(null);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const isPending = pendingAction !== null;
  const otpDisabled = isPending || demoMode;

  const validateEmail = (): string | null => {
    if (normalizeEmail(email)) return null;
    return "Enter your email address.";
  };

  async function handlePasswordSignIn() {
    if (isPending) return;
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !password) {
      setError("Enter your email address and password.");
      return;
    }

    setError(null);
    setPendingAction("password");
    try {
      await signInWithPassword(normalizedEmail, password);
    } catch {
      setError(genericError);
    } finally {
      setPendingAction(null);
    }
  }

  async function handleOtpRequest() {
    if (otpDisabled) return;
    const emailError = validateEmail();
    if (emailError) {
      setError(emailError);
      return;
    }

    setError(null);
    setPendingAction("otp");
    try {
      const { challengeId } = await requestOtp(normalizeEmail(email));
      onOtpChallenge(challengeId);
    } catch {
      setError(genericError);
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.logoMark}>
          <Ionicons color={residentTheme.icon} name="home-outline" size={28} />
        </View>
        <Text accessibilityRole="header" style={styles.heading}>Welcome to ReManage</Text>
        <Text style={styles.copy}>Sign in with the account provided by your society management.</Text>
        {demoMode ? <Text style={styles.demoHint}>Web demo credentials: {demoCredentials.email} / {demoCredentials.password}</Text> : null}

        <View style={[styles.fieldWrap, focusedField === "email" && styles.fieldWrapFocused]}>
          <Text style={[styles.floatingLabel, (focusedField === "email" || email) && styles.floatingLabelActive]}>Email *</Text>
          <TextInput
            accessibilityLabel="Email address"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onBlur={() => setFocusedField(null)}
            onChangeText={setEmail}
            onFocus={() => setFocusedField("email")}
            placeholder=""
            style={styles.input}
            textContentType="username"
            value={email}
          />
        </View>

        <View style={[styles.fieldWrap, focusedField === "password" && styles.fieldWrapFocused]}>
          <Text style={[styles.floatingLabel, (focusedField === "password" || password) && styles.floatingLabelActive]}>Password *</Text>
          <View style={styles.passwordRow}>
            <TextInput
              accessibilityLabel="Password"
              autoComplete="current-password"
              onBlur={() => setFocusedField(null)}
              onChangeText={setPassword}
              onFocus={() => setFocusedField("password")}
              placeholder=""
              secureTextEntry={!showPassword}
              style={styles.passwordInput}
              textContentType="password"
              value={password}
            />
            <Pressable
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              accessibilityRole="button"
              onPress={() => setShowPassword((value) => !value)}
              style={styles.eyeButton}
            >
              <Ionicons color={residentTheme.muted} name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} />
            </Pressable>
          </View>
        </View>

        <Pressable accessibilityRole="button" style={styles.forgotLink}>
          <Text style={styles.forgotText}>Forgot your password?</Text>
        </Pressable>

        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

        <Pressable
          accessibilityLabel={pendingAction === "password" ? "Signing in" : "Continue"}
          accessibilityRole="button"
          accessibilityState={{ disabled: isPending }}
          disabled={isPending}
          onPress={() => void handlePasswordSignIn()}
          style={({ pressed }) => [styles.primaryAction, (pressed || isPending) && styles.primaryActionPressed, isPending && styles.disabled]}
        >
          <Text style={styles.primaryActionText}>{pendingAction === "password" ? "Signing in…" : "Continue"}</Text>
        </Pressable>

        <View style={styles.separatorRow}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>or</Text>
          <View style={styles.separatorLine} />
        </View>

        <Pressable
          accessibilityLabel={demoMode ? "Email code unavailable in web demo" : "Sign in with OTP"}
          accessibilityRole="button"
          accessibilityState={{ disabled: otpDisabled }}
          disabled={otpDisabled}
          onPress={() => void handleOtpRequest()}
          style={({ pressed }) => [styles.secondaryAction, (pressed || otpDisabled) && styles.secondaryActionPressed, otpDisabled && styles.disabled]}
        >
          <Text style={styles.secondaryActionText}>{demoMode ? demoOtpUnavailableMessage : pendingAction === "otp" ? "Sending code…" : "Sign in with OTP"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: residentTheme.surface, justifyContent: "center", padding: 24 },
  content: { gap: 8, width: "100%", maxWidth: 440, alignSelf: "center" },
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#E6F4F1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  heading: { color: residentTheme.ink, fontSize: 28, fontWeight: "800", lineHeight: 34 },
  copy: { color: residentTheme.muted, fontSize: 15, lineHeight: 22, marginBottom: 10 },
  demoHint: { color: residentTheme.muted, fontSize: 13, lineHeight: 19, marginBottom: 6 },
  fieldWrap: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: residentTheme.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 10,
    backgroundColor: residentTheme.surface,
  },
  fieldWrapFocused: { borderColor: residentTheme.accent, borderWidth: 2, paddingHorizontal: 13, paddingTop: 17 },
  floatingLabel: { position: "absolute", left: 14, top: 16, color: residentTheme.muted, fontSize: 16 },
  floatingLabelActive: { top: 8, fontSize: 12, fontWeight: "600" },
  input: { color: residentTheme.ink, fontSize: 16, minHeight: 28, padding: 0 },
  passwordRow: { flexDirection: "row", alignItems: "center" },
  passwordInput: { flex: 1, color: residentTheme.ink, fontSize: 16, minHeight: 28, padding: 0 },
  eyeButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  forgotLink: { alignSelf: "flex-start", marginTop: 4, marginBottom: 4 },
  forgotText: { color: residentTheme.ink, fontSize: 14, fontWeight: "600", textDecorationLine: "underline" },
  error: { color: colors.danger, fontSize: 14, marginTop: 4 },
  primaryAction: { alignItems: "center", backgroundColor: residentTheme.icon, borderRadius: 12, justifyContent: "center", minHeight: 52, marginTop: 8, paddingHorizontal: 16 },
  primaryActionPressed: { opacity: 0.86 },
  primaryActionText: { color: colors.white, fontSize: 16, fontWeight: "700" },
  separatorRow: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 8 },
  separatorLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: residentTheme.border },
  separatorText: { color: residentTheme.muted, fontSize: 13, textTransform: "lowercase" },
  secondaryAction: { alignItems: "center", backgroundColor: residentTheme.surface, borderColor: residentTheme.border, borderRadius: 12, borderWidth: 1, justifyContent: "center", minHeight: 52, paddingHorizontal: 16 },
  secondaryActionPressed: { backgroundColor: "#FAFAF8" },
  secondaryActionText: { color: residentTheme.ink, fontSize: 16, fontWeight: "700" },
  disabled: { opacity: 0.65 },
});
