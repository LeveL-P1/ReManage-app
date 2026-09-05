import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "heroui-native";
import { ScreenContainer, colors } from "@/features/resident/shared/heroui-ui";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

export function ComingSoonScreen({
  title,
  icon,
  description = "This feature is coming soon on mobile.",
}: {
  title: string;
  icon: IoniconsName;
  description?: string;
}) {
  return (
    <ScreenContainer>
      <View style={styles.center}>
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={40} color={colors.primary} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.warning,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: "700", color: colors.text, marginBottom: 8, textAlign: "center" },
  description: { fontSize: 15, color: colors.textMuted, textAlign: "center", lineHeight: 22 },
});
