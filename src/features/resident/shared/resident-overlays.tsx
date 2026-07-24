import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { ResidentIconKey } from "@/features/resident/catalog/resident-module-catalog";
import { residentTheme } from "@/platform/theme/tokens";
import { ResidentIcon } from "./resident-icon";

export function ResidentBottomSheet({
  visible,
  onDismiss,
  title,
  children,
  footer,
}: {
  visible: boolean;
  onDismiss(): void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Modal animationType="slide" onRequestClose={onDismiss} transparent visible={visible}>
      <View style={sheetStyles.modal}>
        <Pressable accessibilityLabel="Dismiss sheet" onPress={onDismiss} style={sheetStyles.backdrop} />
        <View accessibilityViewIsModal style={sheetStyles.sheet}>
          <View style={sheetStyles.handle} />
          {title ? <Text accessibilityRole="header" style={sheetStyles.title}>{title}</Text> : null}
          <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={sheetStyles.body}>
            {children}
          </ScrollView>
          {footer}
        </View>
      </View>
    </Modal>
  );
}

export function ResidentCenteredModal({
  visible,
  onDismiss,
  title,
  message,
  primaryLabel,
  onPrimary,
  secondaryLabel = "Cancel",
}: {
  visible: boolean;
  onDismiss(): void;
  title: string;
  message: string;
  primaryLabel: string;
  onPrimary(): void;
  secondaryLabel?: string;
}) {
  return (
    <Modal animationType="fade" onRequestClose={onDismiss} transparent visible={visible}>
      <View style={modalStyles.modal}>
        <Pressable accessibilityLabel="Dismiss dialog" onPress={onDismiss} style={modalStyles.backdrop} />
        <View accessibilityViewIsModal style={modalStyles.card}>
          <Text accessibilityRole="header" style={modalStyles.title}>{title}</Text>
          <Text style={modalStyles.message}>{message}</Text>
          <Pressable
            accessibilityLabel={primaryLabel}
            accessibilityRole="button"
            onPress={onPrimary}
            style={({ pressed }) => [modalStyles.primary, pressed && modalStyles.pressed]}
          >
            <Text style={modalStyles.primaryText}>{primaryLabel}</Text>
          </Pressable>
          <Pressable
            accessibilityLabel={secondaryLabel}
            accessibilityRole="button"
            onPress={onDismiss}
            style={({ pressed }) => [modalStyles.secondary, pressed && modalStyles.pressed]}
          >
            <Text style={modalStyles.secondaryText}>{secondaryLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export function ResidentTabBar<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  unreadTabs = [],
}: {
  tabs: readonly { id: T; label: string }[];
  activeTab: T;
  onTabChange(tab: T): void;
  unreadTabs?: readonly T[];
}) {
  return (
    <View style={tabStyles.bar}>
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        const unread = unreadTabs.includes(tab.id);
        return (
          <Pressable
            accessibilityLabel={tab.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            style={tabStyles.tab}
          >
            <View style={tabStyles.labelRow}>
              <Text style={[tabStyles.label, active && tabStyles.labelActive]}>{tab.label}</Text>
              {unread ? <View style={tabStyles.dot} /> : null}
            </View>
            {active ? <View style={tabStyles.underline} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export function ResidentListRow({
  avatarLabel,
  avatarColor = residentTheme.icon,
  title,
  subtitle,
  trailing,
  thumbnail,
  onPress,
}: {
  avatarLabel: string;
  avatarColor?: string;
  title: ReactNode;
  subtitle?: string;
  trailing?: string;
  thumbnail?: ReactNode;
  onPress?(): void;
}) {
  const body = (
    <>
      <View style={[rowStyles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={rowStyles.avatarText}>{avatarLabel}</Text>
      </View>
      <View style={rowStyles.copy}>
        {typeof title === "string" ? <Text style={rowStyles.title}>{title}</Text> : title}
        {subtitle ? <Text style={rowStyles.subtitle}>{subtitle}</Text> : null}
      </View>
      {thumbnail}
      {trailing ? <Text style={rowStyles.trailing}>{trailing}</Text> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [rowStyles.row, pressed && rowStyles.pressed]}
      >
        {body}
      </Pressable>
    );
  }

  return <View style={rowStyles.row}>{body}</View>;
}

export function ResidentStatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const toneStyle = toneStyles[tone];
  return (
    <View style={[pillStyles.pill, toneStyle.container]}>
      <Text style={[pillStyles.text, toneStyle.text]}>{label}</Text>
    </View>
  );
}

export function ResidentPopOutHeader({
  title,
  onBack,
  backIcon = "close",
  backLabel = "Close",
}: {
  title: string;
  onBack(): void;
  backIcon?: React.ComponentProps<typeof Ionicons>["name"];
  backLabel?: string;
}) {
  return (
    <View style={popOutStyles.header}>
      <Pressable
        accessibilityLabel={backLabel}
        accessibilityRole="button"
        onPress={onBack}
        style={popOutStyles.backControl}
      >
        <Ionicons color={residentTheme.ink} name={backIcon} size={24} />
      </Pressable>
      <Text numberOfLines={1} style={popOutStyles.headerTitle}>{title}</Text>
      <View style={popOutStyles.headerSpacer} />
    </View>
  );
}

export interface ResidentPopOutScreenProps {
  title: string;
  description: string;
  icon?: ResidentIconKey;
  eyebrow?: string;
  highlights?: readonly string[];
  notice?: string;
  noticeTone?: "info" | "warning";
  previewTitle?: string;
  previewDetail?: string;
  primaryAction?: { label: string; onPress(): void };
  secondaryLabel?: string;
  onBack(): void;
  backIcon?: React.ComponentProps<typeof Ionicons>["name"];
  backLabel?: string;
  hero?: ReactNode;
  children?: ReactNode;
}

export function ResidentPopOutScreen({
  title,
  description,
  icon,
  eyebrow = "REMANAGE",
  highlights = [],
  notice,
  noticeTone = "info",
  previewTitle = "Ready when your society enables it",
  previewDetail = "This preview does not submit, book, request, or change any live society record.",
  primaryAction,
  secondaryLabel = "Go back",
  onBack,
  backIcon = "close",
  backLabel = "Close",
  hero,
  children,
}: ResidentPopOutScreenProps) {
  return (
    <View style={popOutStyles.screen}>
      <ResidentPopOutHeader backIcon={backIcon} backLabel={backLabel} onBack={onBack} title={title} />
      <ScrollView contentContainerStyle={popOutStyles.content} showsVerticalScrollIndicator={false}>
        {hero ?? (icon ? (
          <View style={popOutStyles.heroIcon}>
            <ResidentIcon color={residentTheme.icon} name={icon} size={34} />
          </View>
        ) : null)}
        <Text accessibilityRole="header" style={popOutStyles.title}>{title}</Text>
        <Text style={popOutStyles.description}>{description}</Text>

        {notice ? (
          <View style={[popOutStyles.noticeCard, noticeTone === "warning" && popOutStyles.noticeWarning]}>
            <Ionicons
              color={noticeTone === "warning" ? residentTheme.accent : residentTheme.icon}
              name="information-circle-outline"
              size={22}
            />
            <Text style={popOutStyles.noticeText}>{notice}</Text>
          </View>
        ) : null}

        {highlights.length ? (
          <View style={popOutStyles.card}>
            <Text style={popOutStyles.eyebrow}>{eyebrow}</Text>
            {highlights.map((highlight) => (
              <View key={highlight} style={popOutStyles.highlight}>
                <Ionicons color={residentTheme.icon} name="checkmark-circle" size={20} />
                <Text style={popOutStyles.highlightText}>{highlight}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {children}

        <View style={popOutStyles.previewCard}>
          <Text style={popOutStyles.previewTitle}>{previewTitle}</Text>
          <Text style={popOutStyles.previewDetail}>{previewDetail}</Text>
        </View>

        {primaryAction ? (
          <Pressable
            accessibilityLabel={primaryAction.label}
            accessibilityRole="button"
            onPress={primaryAction.onPress}
            style={({ pressed }) => [popOutStyles.primaryButton, pressed && popOutStyles.pressed]}
          >
            <Text style={popOutStyles.primaryButtonText}>{primaryAction.label}</Text>
            <Ionicons color={residentTheme.surface} name="arrow-forward" size={20} />
          </Pressable>
        ) : null}

        <Pressable accessibilityLabel={secondaryLabel} accessibilityRole="button" onPress={onBack} style={popOutStyles.secondaryButton}>
          <Text style={popOutStyles.secondaryButtonText}>{secondaryLabel}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const sheetStyles = StyleSheet.create({
  modal: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(31, 35, 36, 0.48)" },
  sheet: {
    maxHeight: "88%",
    paddingBottom: Platform.OS === "web" ? 88 : 28,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: residentTheme.surface,
    zIndex: 1000,
  },
  handle: { alignSelf: "center", width: 42, height: 5, borderRadius: 3, backgroundColor: "#C9C5BE", marginTop: 10 },
  title: { color: residentTheme.ink, fontSize: 17, fontWeight: "700", lineHeight: 22, textAlign: "center", marginTop: 12, marginBottom: 8 },
  body: { paddingHorizontal: 16 },
});

const modalStyles = StyleSheet.create({
  modal: { flex: 1, justifyContent: "center", padding: 24 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(31, 35, 36, 0.48)" },
  card: {
    backgroundColor: residentTheme.surface,
    borderRadius: 20,
    padding: 22,
    zIndex: 1000,
  },
  title: { color: residentTheme.ink, fontSize: 20, fontWeight: "700", lineHeight: 26 },
  message: { color: residentTheme.muted, fontSize: 15, lineHeight: 22, marginTop: 8 },
  primary: {
    height: 48,
    borderRadius: 14,
    marginTop: 20,
    backgroundColor: residentTheme.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: residentTheme.surface, fontSize: 16, fontWeight: "700" },
  secondary: { alignItems: "center", marginTop: 12, paddingVertical: 8 },
  secondaryText: { color: residentTheme.icon, fontSize: 15, fontWeight: "700" },
  pressed: { opacity: 0.76 },
});

const tabStyles = StyleSheet.create({
  bar: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: residentTheme.border },
  tab: { flex: 1, alignItems: "center", paddingTop: 12, paddingBottom: 10 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  label: { color: residentTheme.muted, fontSize: 14, fontWeight: "600" },
  labelActive: { color: residentTheme.ink, fontWeight: "700" },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#E53935" },
  underline: { width: "72%", height: 3, borderRadius: 2, backgroundColor: residentTheme.ink, marginTop: 8 },
});

const rowStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { color: residentTheme.surface, fontSize: 15, fontWeight: "700" },
  copy: { flex: 1 },
  title: { color: residentTheme.ink, fontSize: 15, lineHeight: 21 },
  subtitle: { color: residentTheme.muted, fontSize: 13, lineHeight: 18, marginTop: 2 },
  trailing: { color: residentTheme.muted, fontSize: 12, lineHeight: 16 },
  pressed: { opacity: 0.72 },
});

const toneStyles = {
  neutral: { container: { backgroundColor: "#EEF0F2" }, text: { color: residentTheme.muted } },
  success: { container: { backgroundColor: "#E5F2F0" }, text: { color: residentTheme.icon } },
  warning: { container: { backgroundColor: "#FFF0D6" }, text: { color: residentTheme.accent } },
  danger: { container: { backgroundColor: "#FDECEC" }, text: { color: "#C62828" } },
} as const;

const pillStyles = StyleSheet.create({
  pill: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 11 },
  text: { fontSize: 10, lineHeight: 13, fontWeight: "700" },
});

const popOutStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: residentTheme.canvas },
  header: {
    alignItems: "center",
    backgroundColor: residentTheme.header,
    borderBottomColor: residentTheme.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    height: 72,
    paddingHorizontal: 16,
  },
  backControl: { alignItems: "center", borderRadius: 22, height: 44, justifyContent: "center", width: 44 },
  headerTitle: { color: residentTheme.ink, flex: 1, fontSize: 17, fontWeight: "700", lineHeight: 22, textAlign: "center" },
  headerSpacer: { width: 44 },
  content: { alignItems: "center", paddingBottom: 44, paddingHorizontal: 24, paddingTop: 42 },
  heroIcon: {
    alignItems: "center",
    backgroundColor: residentTheme.surface,
    borderColor: residentTheme.border,
    borderRadius: 25,
    borderWidth: StyleSheet.hairlineWidth,
    height: 76,
    justifyContent: "center",
    width: 76,
  },
  title: { color: residentTheme.ink, fontSize: 27, fontWeight: "700", lineHeight: 34, marginTop: 22, textAlign: "center" },
  description: { color: residentTheme.muted, fontSize: 16, lineHeight: 23, marginTop: 9, maxWidth: 320, textAlign: "center" },
  noticeCard: {
    alignItems: "flex-start",
    alignSelf: "stretch",
    backgroundColor: `${residentTheme.icon}12`,
    borderRadius: 17,
    flexDirection: "row",
    gap: 9,
    marginTop: 25,
    padding: 15,
  },
  noticeWarning: { backgroundColor: "#FFF0D6" },
  noticeText: { color: residentTheme.ink, flex: 1, fontSize: 14, lineHeight: 20 },
  card: {
    alignSelf: "stretch",
    backgroundColor: residentTheme.surface,
    borderColor: residentTheme.border,
    borderRadius: 21,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 16,
    padding: 20,
  },
  eyebrow: { color: residentTheme.accent, fontSize: 11, fontWeight: "800", letterSpacing: 0.7, lineHeight: 16 },
  highlight: { alignItems: "center", flexDirection: "row", gap: 11, marginTop: 17 },
  highlightText: { color: residentTheme.ink, flex: 1, fontSize: 15, lineHeight: 21 },
  previewCard: { alignSelf: "stretch", backgroundColor: residentTheme.surface, borderRadius: 18, marginTop: 16, padding: 18 },
  previewTitle: { color: residentTheme.ink, fontSize: 15, fontWeight: "700", lineHeight: 21 },
  previewDetail: { color: residentTheme.muted, fontSize: 13, lineHeight: 19, marginTop: 5 },
  primaryButton: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: residentTheme.accent,
    borderRadius: 15,
    flexDirection: "row",
    gap: 8,
    height: 52,
    justifyContent: "center",
    marginTop: 18,
    paddingHorizontal: 18,
  },
  primaryButtonText: { color: residentTheme.surface, fontSize: 16, fontWeight: "700" },
  secondaryButton: {
    alignItems: "center",
    alignSelf: "stretch",
    borderColor: residentTheme.icon,
    borderRadius: 15,
    borderWidth: 2,
    height: 52,
    justifyContent: "center",
    marginTop: 14,
    paddingHorizontal: 18,
  },
  secondaryButtonText: { color: residentTheme.icon, fontSize: 16, fontWeight: "700" },
  pressed: { opacity: 0.76 },
});
