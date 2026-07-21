import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

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
        <Text accessibilityRole="header" style={styles.brand}>ReManage</Text>
        <Text style={styles.heading}>Sign in to your account</Text>
        <Text style={styles.copy}>Accounts are provided by your society management.</Text>
        {demoMode ? <Text style={styles.demoHint}>Web demo credentials: {demoCredentials.email} / {demoCredentials.password}</Text> : null}

        <Text style={styles.label}>Email address</Text>
        <TextInput
          accessibilityLabel="Email address"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          onBlur={() => setFocusedField(null)}
          onChangeText={setEmail}
          onFocus={() => setFocusedField("email")}
          placeholder="you@example.com"
          placeholderTextColor="#6B6B6B"
          style={[styles.input, focusedField === "email" && styles.inputFocused]}
          textContentType="username"
          value={email}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          accessibilityLabel="Password"
          autoComplete="current-password"
          onBlur={() => setFocusedField(null)}
          onChangeText={setPassword}
          onFocus={() => setFocusedField("password")}
          placeholder="Your password"
          placeholderTextColor="#6B6B6B"
          secureTextEntry
          style={[styles.input, focusedField === "password" && styles.inputFocused]}
          textContentType="password"
          value={password}
        />

        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

        <Pressable
          accessibilityLabel={pendingAction === "password" ? "Signing in" : "Sign in"}
          accessibilityRole="button"
          accessibilityState={{ disabled: isPending }}
          disabled={isPending}
          onPress={() => void handlePasswordSignIn()}
          style={({ pressed }) => [styles.primaryAction, (pressed || isPending) && styles.primaryActionPressed, isPending && styles.disabled]}
        >
          <Text style={styles.primaryActionText}>{pendingAction === "password" ? "Signing in…" : "Sign in"}</Text>
        </Pressable>

        <Pressable
          accessibilityLabel={demoMode ? "Email code unavailable in web demo" : "Email me a code"}
          accessibilityRole="button"
          accessibilityState={{ disabled: otpDisabled }}
          disabled={otpDisabled}
          onPress={() => void handleOtpRequest()}
          style={({ pressed }) => [styles.secondaryAction, (pressed || otpDisabled) && styles.secondaryActionPressed, otpDisabled && styles.disabled]}
        >
          <Text style={styles.secondaryActionText}>{demoMode ? demoOtpUnavailableMessage : pendingAction === "otp" ? "Sending code…" : "Email me a code"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: residentTheme.background, justifyContent: "center", padding: 24 },
  content: { gap: 10, width: "100%", maxWidth: 440, alignSelf: "center" },
  brand: { color: colors.orange, fontFamily: "System", fontSize: 32, fontWeight: "800" },
  heading: { color: residentTheme.text, fontFamily: "System", fontSize: 24, fontWeight: "700", marginTop: 8 },
  copy: { color: residentTheme.text, fontFamily: "System", fontSize: 16, lineHeight: 22, marginBottom: 14 },
  demoHint: { color: residentTheme.text, fontFamily: "System", fontSize: 14, lineHeight: 20 },
  label: { color: residentTheme.text, fontFamily: "System", fontSize: 15, fontWeight: "600", marginTop: 4 },
  input: { backgroundColor: residentTheme.surface, borderColor: colors.charcoal, borderRadius: 8, borderWidth: 1, color: residentTheme.text, fontFamily: "System", fontSize: 16, minHeight: 48, paddingHorizontal: 14 },
  inputFocused: { borderColor: colors.orange, borderWidth: 3, paddingHorizontal: 12 },
  error: { color: colors.danger, fontFamily: "System", fontSize: 14, marginTop: 4 },
  primaryAction: { alignItems: "center", backgroundColor: residentTheme.accent, borderRadius: 8, justifyContent: "center", minHeight: 48, marginTop: 12, paddingHorizontal: 16 },
  primaryActionPressed: { backgroundColor: "#CC4300" },
  primaryActionText: { color: colors.white, fontFamily: "System", fontSize: 16, fontWeight: "700" },
  secondaryAction: { alignItems: "center", backgroundColor: residentTheme.highlight, borderColor: colors.charcoal, borderRadius: 8, borderWidth: 1, justifyContent: "center", minHeight: 48, paddingHorizontal: 16 },
  secondaryActionPressed: { backgroundColor: "#E0A600" },
  secondaryActionText: { color: colors.charcoal, fontFamily: "System", fontSize: 16, fontWeight: "700" },
  disabled: { opacity: 0.65 },
});
