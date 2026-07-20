import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { residentTheme } from "@/platform/theme/tokens";

export function ResidentShellScreen({ children, title }: { children?: ReactNode; title: string }) {
  return (
    <View style={styles.screen}>
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      <Text style={styles.message}>This Resident module arrives in a later phase.</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: residentTheme.background, flex: 1, gap: 14, padding: 24 },
  title: { color: residentTheme.text, fontSize: 28, fontWeight: "700" },
  message: { color: residentTheme.text, fontSize: 16, lineHeight: 22 },
});
