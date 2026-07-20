import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useSession } from "@/platform/auth/session-provider";
import { colors, residentTheme } from "@/platform/theme/tokens";

export interface OtpVerifyScreenProps {
  challengeId: string;
  onBack(): void;
}

const genericError = "We could not verify that code. Please try again.";

export function OtpVerifyScreen({ challengeId, onBack }: OtpVerifyScreenProps) {
  const { verifyOtp } = useSession();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isCodeComplete = code.length === 6;

  async function handleVerify() {
    if (isPending || !isCodeComplete) return;

    setError(null);
    setIsPending(true);
    try {
      await verifyOtp(challengeId, code);
    } catch {
      setCode("");
      setError(genericError);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.brand}>ReManage</Text>
        <Text style={styles.heading}>Check your email</Text>
        <Text style={styles.copy}>Enter the six-digit code we sent to your email address.</Text>

        <Text style={styles.label}>One-time code</Text>
        <TextInput
          accessibilityLabel="One-time code"
          autoComplete="one-time-code"
          keyboardType="number-pad"
          maxLength={6}
          onBlur={() => setIsFocused(false)}
          onChangeText={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))}
          onFocus={() => setIsFocused(true)}
          placeholder="123456"
          placeholderTextColor="#6B6B6B"
          style={[styles.input, isFocused && styles.inputFocused]}
          textContentType="oneTimeCode"
          value={code}
        />

        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

        <Pressable
          accessibilityLabel={isPending ? "Verifying code" : "Verify code"}
          accessibilityRole="button"
          accessibilityState={{ disabled: isPending || !isCodeComplete }}
          disabled={isPending || !isCodeComplete}
          onPress={() => void handleVerify()}
          style={({ pressed }) => [styles.primaryAction, (pressed || isPending) && styles.primaryActionPressed, (isPending || !isCodeComplete) && styles.disabled]}
        >
          <Text style={styles.primaryActionText}>{isPending ? "Verifying…" : "Verify code"}</Text>
        </Pressable>

        <Pressable
          accessibilityLabel="Back to sign in"
          accessibilityRole="button"
          disabled={isPending}
          onPress={onBack}
          style={({ pressed }) => [styles.backAction, (pressed || isPending) && styles.backActionPressed, isPending && styles.disabled]}
        >
          <Text style={styles.backActionText}>Back to sign in</Text>
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
  label: { color: residentTheme.text, fontFamily: "System", fontSize: 15, fontWeight: "600", marginTop: 4 },
  input: { backgroundColor: residentTheme.surface, borderColor: colors.charcoal, borderRadius: 8, borderWidth: 1, color: residentTheme.text, fontFamily: "System", fontSize: 24, letterSpacing: 8, minHeight: 48, paddingHorizontal: 14, textAlign: "center" },
  inputFocused: { borderColor: colors.orange, borderWidth: 3, paddingHorizontal: 12 },
  error: { color: colors.danger, fontFamily: "System", fontSize: 14, marginTop: 4 },
  primaryAction: { alignItems: "center", backgroundColor: residentTheme.accent, borderRadius: 8, justifyContent: "center", minHeight: 48, marginTop: 12, paddingHorizontal: 16 },
  primaryActionPressed: { backgroundColor: "#CC4300" },
  primaryActionText: { color: colors.white, fontFamily: "System", fontSize: 16, fontWeight: "700" },
  backAction: { alignItems: "center", borderColor: colors.charcoal, borderRadius: 8, borderWidth: 1, justifyContent: "center", minHeight: 48, paddingHorizontal: 16 },
  backActionPressed: { backgroundColor: colors.yellow },
  backActionText: { color: colors.charcoal, fontFamily: "System", fontSize: 16, fontWeight: "700" },
  disabled: { opacity: 0.65 },
});
