import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import type { ResidentModuleDefinition } from "@/features/resident/catalog/resident-module-catalog";
import { residentTheme } from "@/platform/theme/tokens";
import { ResidentIcon } from "./resident-icon";

export function ResidentFeedbackSheet({
  module,
  onDismiss,
}: {
  module: ResidentModuleDefinition | null;
  onDismiss(): void;
}) {
  if (!module) return null;

  return (
    <Modal animationType="fade" onRequestClose={onDismiss} transparent visible>
      <View style={styles.modal}>
        <Pressable accessibilityLabel="Dismiss module details" onPress={onDismiss} style={styles.backdrop} />
        <View accessibilityViewIsModal style={styles.sheet}>
          <View style={styles.icon}>
            <ResidentIcon color={residentTheme.accent} name={module.icon} size={28} />
          </View>
          <Text accessibilityRole="header" style={styles.title}>{module.label}</Text>
          <Text style={styles.description}>{module.description}</Text>
          <Text style={styles.message}>This mobile module is coming in the next ReManage phase.</Text>
          <Pressable
            accessibilityLabel="Close module details"
            accessibilityRole="button"
            onPress={onDismiss}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          >
            <Text style={styles.buttonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(31, 35, 36, 0.48)" },
  sheet: {
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: Platform.OS === "web" ? 88 : 28,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: residentTheme.surface,
    alignItems: "center",
    zIndex: 1000,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#FFF0E8",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: residentTheme.ink, fontSize: 22, lineHeight: 28, fontWeight: "700", marginTop: 14 },
  description: { color: residentTheme.muted, fontSize: 14, lineHeight: 20, marginTop: 6, textAlign: "center" },
  message: { color: residentTheme.ink, fontSize: 15, lineHeight: 22, marginTop: 18, textAlign: "center" },
  button: {
    width: "100%",
    height: 48,
    borderRadius: 14,
    marginTop: 22,
    backgroundColor: residentTheme.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: { opacity: 0.78 },
  buttonText: { color: residentTheme.surface, fontSize: 16, fontWeight: "700" },
});
