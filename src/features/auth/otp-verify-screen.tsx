import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ResidentCenteredModal } from "@/features/resident/shared/resident-overlays";
import { useSession } from "@/platform/auth/session-provider";
import { colors, residentTheme } from "@/platform/theme/tokens";
import { AuthBrand } from "./auth-brand";

export interface OtpVerifyScreenProps {
  challengeId: string;
  onBack(): void;
}

const genericError = "We could not verify that code. Please try again.";

export function OtpVerifyScreen({ challengeId, onBack }: OtpVerifyScreenProps) {
  const { verifyOtp } = useSession();
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isPending, setIsPending] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(45);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const code = digits.join("");
  const isCodeComplete = code.length === 6;

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = setTimeout(() => setResendSeconds((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendSeconds]);

  function updateDigits(value: string) {
    const next = value.replace(/\D/g, "").slice(0, 6).split("");
    setDigits(Array.from({ length: 6 }, (_, index) => next[index] ?? ""));
  }

  async function handleVerify() {
    if (isPending || !isCodeComplete) return;

    setIsPending(true);
    try {
      await verifyOtp(challengeId, code);
    } catch {
      setDigits(["", "", "", "", "", ""]);
      setErrorModalVisible(true);
      inputRef.current?.focus();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <AuthBrand />
        <Text accessibilityRole="header" style={styles.heading}>Check your email</Text>
        <Text style={styles.copy}>Enter the six-digit code we sent to your email address.</Text>

        <TextInput
          ref={inputRef}
          accessibilityLabel="One-time code"
          autoComplete="one-time-code"
          keyboardType="number-pad"
          maxLength={6}
          onChangeText={updateDigits}
          style={styles.hiddenInput}
          textContentType="oneTimeCode"
          value={code}
        />
        <Pressable accessibilityRole="button" onPress={() => inputRef.current?.focus()} style={styles.digitRow}>
          {digits.map((digit, index) => (
            <View key={index} style={[styles.digitBox, digit && styles.digitBoxFilled]}>
              <Text style={styles.digitText}>{digit}</Text>
            </View>
          ))}
        </Pressable>

        <Text style={styles.resendCopy}>
          {resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : "You can request a new code from sign in."}
        </Text>

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

      <ResidentCenteredModal
        message={genericError}
        onDismiss={() => setErrorModalVisible(false)}
        onPrimary={() => setErrorModalVisible(false)}
        primaryLabel="Try again"
        title="Invalid code"
        visible={errorModalVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: residentTheme.surface, justifyContent: "center", padding: 24 },
  content: { gap: 10, width: "100%", maxWidth: 440, alignSelf: "center" },
  heading: { color: residentTheme.ink, fontSize: 28, fontWeight: "800", lineHeight: 34 },
  copy: { color: residentTheme.muted, fontSize: 15, lineHeight: 22, marginBottom: 10 },
  hiddenInput: { position: "absolute", opacity: 0, height: 0, width: 0 },
  digitRow: { flexDirection: "row", justifyContent: "space-between", gap: 8, marginTop: 8 },
  digitBox: {
    flex: 1,
    maxWidth: 52,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: residentTheme.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: residentTheme.surface,
  },
  digitBoxFilled: { borderColor: residentTheme.icon },
  digitText: { color: residentTheme.ink, fontSize: 24, fontWeight: "700" },
  resendCopy: { color: residentTheme.muted, fontSize: 13, lineHeight: 18, marginTop: 8 },
  primaryAction: { alignItems: "center", backgroundColor: residentTheme.accent, borderRadius: 12, justifyContent: "center", minHeight: 52, marginTop: 12, paddingHorizontal: 16 },
  primaryActionPressed: { opacity: 0.86 },
  primaryActionText: { color: colors.white, fontSize: 16, fontWeight: "700" },
  backAction: { alignItems: "center", borderColor: residentTheme.border, borderRadius: 12, borderWidth: 1, justifyContent: "center", minHeight: 52, paddingHorizontal: 16 },
  backActionPressed: { backgroundColor: "#FAFAF8" },
  backActionText: { color: residentTheme.ink, fontSize: 16, fontWeight: "700" },
  disabled: { opacity: 0.65 },
});
