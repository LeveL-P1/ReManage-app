import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { ActivityIndicator, Button, StyleSheet, Text, View } from "react-native";

import { SessionProvider, useSession } from "@/platform/auth/session-provider";
import { queryClient } from "@/platform/query/query-client";
import { ReactNativeQueryLifecycle } from "@/platform/query/react-native-query-lifecycle";
import { colors, residentTheme } from "@/platform/theme/tokens";

function SessionTransitionScreen() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator color={colors.orange} size="large" />
      <Text style={styles.message}>Loading your secure session…</Text>
    </View>
  );
}

function SessionRecoveryScreen({ message }: { message: string }) {
  const { retryRestore } = useSession();
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>We could not restore your session.</Text>
      <Text style={styles.message}>{message}</Text>
      <Button color={colors.orange} onPress={() => void retryRestore()} title="Try again" />
    </View>
  );
}

function RootNavigator() {
  const { state } = useSession();
  if (state.status === "restoring" || state.status === "switching_role") {
    return <SessionTransitionScreen />;
  }

  if (state.status === "recoverable_error") {
    return <SessionRecoveryScreen message={state.message} />;
  }

  const authenticated = state.status === "authenticated";
  const role = authenticated ? state.bootstrap.activeRole : null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={state.status === "signed_out"}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={authenticated && role === "resident"}>
        <Stack.Screen name="(resident)" />
      </Stack.Protected>
      <Stack.Protected guard={authenticated && role === "guard"}>
        <Stack.Screen name="(guard)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactNativeQueryLifecycle />
      <SessionProvider>
        <RootNavigator />
      </SessionProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  centered: { alignItems: "center", backgroundColor: residentTheme.background, flex: 1, gap: 16, justifyContent: "center", padding: 24 },
  message: { color: residentTheme.text, fontSize: 16, textAlign: "center" },
  title: { color: residentTheme.text, fontSize: 21, fontWeight: "700", textAlign: "center" },
});
