import { Avatar, Button, Card, Chip, ListGroup, Separator, Spinner, Surface, Text, TextArea, TextField } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, ViewStyle, TextStyle, View as RNView, Text as RNText, Image, ScrollView, Alert } from "react-native";
import { ReactNode } from "react";

export { Avatar, Button, Card, Chip, ListGroup, Separator, Spinner, Surface, Text, TextArea, TextField };
export { Ionicons, StyleSheet, RNView, RNText, Image, ScrollView, Alert };
export type { ViewStyle, TextStyle };

export const colors = {
  primary: "#ff5400",
  secondary: "#ffbe00",
  success: "#10B981",
  warning: "#ffeee5",
  danger: "#EF4444",
  background: "#fefddf",
  surface: "#FFFFFF",
  border: "#d0d0d0",
  text: "#1a1a1a",
  textMuted: "#666666",
  textLight: "#999999",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export function Divider({ style }: { style?: ViewStyle }) {
  return <Separator style={style} />;
}

export function Badge({ children, color = "primary", size = "md", ...props }: { children: ReactNode; color?: "primary" | "secondary"; size?: "sm" | "md" | "lg"; [key: string]: any }) {
  return <Chip variant={color as "primary" | "secondary"} size={size} {...props}>{children}</Chip>;
}

export function ScreenContainer({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <RNView style={[{ flex: 1, backgroundColor: colors.background }, style]}>{children}</RNView>;
}

export function SafeScrollView({ children, style, contentContainerStyle }: { children: ReactNode; style?: ViewStyle; contentContainerStyle?: ViewStyle }) {
  return (
    <RNView style={[{ flex: 1 }, style]}>
      <ScrollView contentContainerStyle={[{ paddingBottom: 100 }, contentContainerStyle]}>
        {children}
      </ScrollView>
    </RNView>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <RNView style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && onAction && (
        <Button variant="ghost" size="sm" onPress={onAction}>
          {action}
        </Button>
      )}
    </RNView>
  );
}

export function EmptyState({ icon, title, description, action, onAction }: { icon: string; title: string; description: string; action?: string; onAction?: () => void }) {
  return (
    <RNView style={styles.emptyState}>
      <Ionicons name="help" size={64} color={colors.textLight} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
      {action && onAction && (
        <Button variant="primary" onPress={onAction} style={{ marginTop: spacing.md }}>
          {action}
        </Button>
      )}
    </RNView>
  );
}

export function LoadingState({ message }: { message?: string }) {
  return (
    <RNView style={styles.loadingState}>
      <Spinner size="lg" color={colors.primary} />
      <Text style={styles.loadingText}>{message || "Loading..."}</Text>
    </RNView>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <RNView style={styles.errorState}>
      <Ionicons name="alert-circle" size={64} color={colors.danger} />
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      {onRetry && (
        <Button variant="primary" onPress={onRetry} style={{ marginTop: spacing.md }}>
          Try Again
        </Button>
      )}
    </RNView>
  );
}

export function ActionCard({ title, description, icon, onPress, variant = "default", showArrow = true }: { title: string; description?: string; icon?: string; onPress?: () => void; variant?: "default" | "outline" | "primary"; showArrow?: boolean }) {
  return (
    <RNView style={styles.actionCard}>
      <RNView style={styles.actionCardContent}>
        {icon && (
          <RNView style={styles.actionIcon}>
            <Ionicons name="star" size={24} color={colors.primary} />
          </RNView>
        )}
        <RNView style={styles.actionCardText}>
          <Text style={styles.actionTitle}>{title}</Text>
          {description && <Text style={styles.actionDescription}>{description}</Text>}
        </RNView>
        {showArrow && <Ionicons name="chevron-forward" size={20} color={colors.textLight} />}
      </RNView>
    </RNView>
  );
}

export function InfoRow({ label, value, icon, style }: { label: string; value: string; icon?: string; style?: ViewStyle }) {
  return (
    <RNView style={[{ flexDirection: "row", alignItems: "center", gap: spacing.sm }, style]}>
      {icon && <Ionicons name="star" size={20} color={colors.textMuted} />}
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </RNView>
  );
}

export function StatusBadge({ status, label }: { status: "active" | "pending" | "completed" | "cancelled" | "draft"; label?: string }) {
  const statusConfig = {
    active: { color: "primary", text: label || "Active" },
    pending: { color: "primary", text: label || "Pending" },
    completed: { color: "primary", text: label || "Completed" },
    cancelled: { color: "secondary", text: label || "Cancelled" },
    draft: { color: "secondary", text: label || "Draft" },
  };
  const config = statusConfig[status];
  return <Chip variant={config.color as "primary" | "secondary"} size="sm">{config.text}</Chip>;
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", variant = "danger" }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmText?: string; cancelText?: string; variant?: "primary" | "danger" }) {
  if (!isOpen) return null;
  return (
    <RNView style={styles.dialogOverlay}>
      <RNView style={styles.dialogContent}>
        <Text style={styles.dialogTitle}>{title}</Text>
        <Text style={styles.dialogMessage}>{message}</Text>
        <RNView style={styles.dialogFooter}>
          <Button variant="ghost" onPress={onClose}>{cancelText}</Button>
          <Button variant="primary" onPress={() => { onConfirm(); onClose(); }}>{confirmText}</Button>
        </RNView>
      </RNView>
    </RNView>
  );
}

export function PullToRefresh({ onRefresh, refreshing, children }: { onRefresh: () => void; refreshing: boolean; children: ReactNode }) {
  return (
    <RNView style={{ flex: 1 }}>
      <RNView style={styles.pullToRefresh}>
        <Spinner size="sm" color={colors.primary} />
      </RNView>
      {children}
    </RNView>
  );
}

export function PressableCard({ children, onPress, style, ...props }: { children: ReactNode; onPress?: () => void; style?: ViewStyle; [key: string]: any }) {
  return (
    <RNView style={[styles.pressableCard, style]}>
      {children}
    </RNView>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md, marginHorizontal: spacing.md },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.text },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: colors.text },
  emptyDescription: { fontSize: 14, color: colors.textMuted, textAlign: "center" },
  loadingState: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },
  loadingText: { fontSize: 14, color: colors.textMuted },
  errorState: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.md },
  errorTitle: { fontSize: 18, fontWeight: "600", color: colors.text },
  errorMessage: { fontSize: 14, color: colors.textMuted, textAlign: "center" },
  actionCard: { padding: spacing.md, borderRadius: borderRadius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: spacing.md },
  actionCardContent: { flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.md },
  actionIcon: { width: 48, height: 48, borderRadius: borderRadius.md, backgroundColor: "#FEF3C7", alignItems: "center", justifyContent: "center" },
  actionCardText: { flex: 1 },
  actionTitle: { fontSize: 16, fontWeight: "600", color: colors.text },
  actionDescription: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  infoLabel: { fontSize: 14, color: colors.textMuted, flex: 1 },
  infoValue: { fontSize: 14, fontWeight: "500", color: colors.text },
  dialogOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: spacing.lg },
  dialogContent: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, maxWidth: 400 },
  dialogTitle: { fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: spacing.sm },
  dialogMessage: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.lg },
  dialogFooter: { flexDirection: "row", justifyContent: "flex-end", gap: spacing.sm, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  pullToRefresh: { height: 60, alignItems: "center", justifyContent: "center" },
  pressableCard: { borderRadius: borderRadius.md, overflow: "hidden" },
});