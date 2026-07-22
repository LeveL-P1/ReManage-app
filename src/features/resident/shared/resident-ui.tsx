import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ResidentIconKey } from "@/features/resident/catalog/resident-module-catalog";
import { residentTheme } from "@/platform/theme/tokens";
import { ResidentIcon } from "./resident-icon";

interface ResidentSocietyHeaderProps {
  unit: string;
  societyName: string;
  onSearch(): void;
  onNotifications(): void;
  onProfile(): void;
}

export function ResidentSocietyHeader({
  unit,
  societyName,
  onSearch,
  onNotifications,
  onProfile,
}: ResidentSocietyHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerIdentity}>
        <Text numberOfLines={1} style={styles.unit}>{unit}</Text>
        <Text numberOfLines={1} style={styles.societyName}>{societyName}</Text>
      </View>
      <View style={styles.headerActions}>
        <HeaderButton accessibilityLabel="Search" icon="search-outline" onPress={onSearch} />
        <HeaderButton accessibilityLabel="Notifications" icon="notifications-outline" onPress={onNotifications} />
        <Pressable
          accessibilityLabel="Open profile"
          accessibilityRole="button"
          onPress={onProfile}
          style={({ pressed }) => [styles.profileButton, pressed && styles.pressed]}
        >
          <Text style={styles.profileInitial}>D</Text>
        </Pressable>
      </View>
    </View>
  );
}

function HeaderButton({
  accessibilityLabel,
  icon,
  onPress,
}: {
  accessibilityLabel: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  onPress(): void;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
    >
      <Ionicons color={residentTheme.ink} name={icon} size={26} />
    </Pressable>
  );
}

export function ResidentSectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?(): void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed }) => [styles.sectionAction, pressed && styles.pressed]}
        >
          <Text style={styles.sectionActionText}>{actionLabel}</Text>
          <Ionicons color={residentTheme.icon} name="chevron-forward" size={18} />
        </Pressable>
      ) : null}
    </View>
  );
}

export interface ResidentActionTileProps {
  accessibilityLabel?: string;
  icon: ResidentIconKey;
  label: string;
  onPress(): void;
  columns: 4 | 5;
}

export function ResidentActionGrid({ children }: { children: ReactNode }) {
  return <View style={styles.actionGrid}>{children}</View>;
}

export function ResidentActionTile(props: ResidentActionTileProps) {
  const width = props.columns === 5 ? "18%" : "22%";
  return (
    <Pressable
      accessibilityLabel={props.accessibilityLabel ?? props.label}
      accessibilityRole="button"
      onPress={props.onPress}
      style={({ pressed }) => [styles.actionWrap, { opacity: pressed ? 0.72 : 1, width }]}
    >
      <View style={styles.actionIcon}>
        <ResidentIcon color={residentTheme.icon} name={props.icon} />
      </View>
      <Text numberOfLines={2} style={styles.actionLabel}>{props.label}</Text>
    </Pressable>
  );
}

export function ResidentStatTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {detail ? <Text style={styles.statDetail}>{detail}</Text> : null}
    </View>
  );
}

export function ResidentContentCard({
  title,
  description,
  icon,
  accent = residentTheme.accent,
  onPress,
  children,
}: {
  title: string;
  description: string;
  icon?: ResidentIconKey;
  accent?: string;
  onPress?(): void;
  children?: ReactNode;
}) {
  const body = (
    <>
      {icon ? (
        <View style={[styles.cardIcon, { backgroundColor: `${accent}18` }]}>
          <ResidentIcon color={accent} name={icon} />
        </View>
      ) : null}
      <View style={styles.cardCopy}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
        {children}
      </View>
      {onPress ? <Ionicons color={residentTheme.muted} name="chevron-forward" size={20} /> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityLabel={title}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.contentCard, pressed && styles.pressedCard]}
      >
        {body}
      </Pressable>
    );
  }

  return <View style={styles.contentCard}>{body}</View>;
}

const styles = StyleSheet.create({
  header: {
    minHeight: 84,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: residentTheme.header,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: residentTheme.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerIdentity: { flex: 1, paddingRight: 10 },
  unit: { color: residentTheme.ink, fontSize: 20, lineHeight: 25, fontWeight: "700" },
  societyName: { color: residentTheme.muted, fontSize: 14, lineHeight: 20 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 2 },
  headerButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: residentTheme.icon,
  },
  profileInitial: { color: residentTheme.surface, fontSize: 20, fontWeight: "600" },
  pressed: { opacity: 0.68 },
  sectionHeader: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: { color: residentTheme.ink, fontSize: 21, lineHeight: 27, fontWeight: "700" },
  sectionAction: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  sectionActionText: { color: residentTheme.icon, fontSize: 15, fontWeight: "600" },
  actionGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 16 },
  actionWrap: { alignItems: "center" },
  actionIcon: {
    width: 58,
    height: 58,
    borderRadius: 17,
    backgroundColor: residentTheme.surface,
    borderColor: residentTheme.border,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
  },
  actionLabel: {
    color: residentTheme.ink,
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 7,
    minHeight: 32,
  },
  statTile: {
    minWidth: 112,
    flexGrow: 1,
    padding: 14,
    borderRadius: 16,
    backgroundColor: residentTheme.surface,
    borderColor: residentTheme.border,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statLabel: { color: residentTheme.muted, fontSize: 13, lineHeight: 18 },
  statValue: { color: residentTheme.ink, fontSize: 22, lineHeight: 28, fontWeight: "700", marginTop: 4 },
  statDetail: { color: residentTheme.muted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  contentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: residentTheme.surface,
    borderColor: residentTheme.border,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 1,
  },
  pressedCard: { opacity: 0.76, transform: [{ scale: 0.995 }] },
  cardIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  cardCopy: { flex: 1 },
  cardTitle: { color: residentTheme.ink, fontSize: 16, lineHeight: 21, fontWeight: "700" },
  cardDescription: { color: residentTheme.muted, fontSize: 13, lineHeight: 18, marginTop: 3 },
});
