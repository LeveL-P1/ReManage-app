import { Avatar, Badge, Button, Card, Divider, Icon, Image, Input, Label, ListGroup, Menu, Modal, PressableFeedback, Select, Spinner, Surface, Switch, Text, TextField, Toast, View } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, ViewStyle, TextStyle } from "react-native";
import { ReactNode, forwardRef } from "react";

export { Avatar, Badge, Button, Card, Divider, Icon, Image, Input, Label, ListGroup, Menu, Modal, PressableFeedback, Select, Spinner, Surface, Switch, Text, TextField, Toast, View };

export const colors = {
  primary: "#E86C00",
  secondary: "#6B7280",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  background: "#F9FAFB",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  text: "#111827",
  textMuted: "#6B7280",
  textLight: "#9CA3AF",
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

export function ScreenContainer({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[{ flex: 1, backgroundColor: colors.background }, style]}>{children}</View>;
}

export function SafeScrollView({ children, style, contentContainerStyle }: { children: ReactNode; style?: ViewStyle; contentContainerStyle?: ViewStyle }) {
  return (
    <View style={[{ flex: 1 }, style]}>
      <View contentContainerStyle={[{ paddingBottom: 100 }, contentContainerStyle]}>
        {children}
      </View>
    </View>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && onAction && (
        <Button variant="ghost" size="sm" onPress={onAction}>
          {action}
        </Button>
      )}
    </View>
  );
}

export function EmptyState({ icon, title, description, action, onAction }: { icon: string; title: string; description: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.emptyState}>
      <Icon name={icon} size={64} color={colors.textLight} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
      {action && onAction && (
        <Button variant="primary" onPress={onAction} style={{ marginTop: spacing.md }}>
          {action}
        </Button>
      )}
    </View>
  );
}

export function LoadingState({ message }: { message?: string }) {
  return (
    <View style={styles.loadingState}>
      <Spinner size="lg" color={colors.primary} />
      <Text style={styles.loadingText}>{message || "Loading..."}</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.errorState}>
      <Icon name="alert-circle-outline" size={64} color={colors.danger} />
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      {onRetry && (
        <Button variant="primary" onPress={onRetry} style={{ marginTop: spacing.md }}>
          Try Again
        </Button>
      )}
    </View>
  );
}

export function ActionCard({ title, description, icon, onPress, variant = "default", showArrow = true }: { title: string; description?: string; icon?: string; onPress?: () => void; variant?: "default" | "outline" | "primary"; showArrow?: boolean }) {
  return (
    <PressableFeedback onPress={onPress} style={styles.actionCard} className={variant === "primary" ? "bg-primary/10 border-primary/20" : variant === "outline" ? "border-border" : undefined}>
      <View style={styles.actionCardContent}>
        {icon && (
          <View style={styles.actionIcon}>
            <Icon name={icon} size={24} color={colors.primary} />
          </View>
        )}
        <View style={styles.actionCardText}>
          <Text style={styles.actionTitle}>{title}</Text>
          {description && <Text style={styles.actionDescription}>{description}</Text>}
        </View>
        {showArrow && <Icon name="chevron-forward" size={20} color={colors.textLight} />}
      </View>
    </PressableFeedback>
  );
}

export function InfoRow({ label, value, icon, style }: { label: string; value: string; icon?: string; style?: ViewStyle }) {
  return (
    <View style={[{ flexDirection: "row", alignItems: "center", gap: spacing.sm }, style]}>
      {icon && <Icon name={icon} size={20} color={colors.textMuted} />}
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export function StatusBadge({ status, label }: { status: "active" | "pending" | "completed" | "cancelled" | "draft"; label?: string }) {
  const statusConfig = {
    active: { color: "success", text: label || "Active" },
    pending: { color: "warning", text: label || "Pending" },
    completed: { color: "primary", text: label || "Completed" },
    cancelled: { color: "danger", text: label || "Cancelled" },
    draft: { color: "secondary", text: label || "Draft" },
  };
  const config = statusConfig[status];
  return <Badge color={config.color as any}>{config.text}</Badge>;
}

export function Dialog({ isOpen, onClose, title, children, footer }: { isOpen: boolean; onClose: () => void; title?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      {title && (
        <View style={styles.dialogHeader}>
          <Text style={styles.dialogTitle}>{title}</Text>
          <PressableFeedback onPress={onClose}>
            <Icon name="close" size={24} color={colors.textMuted} />
          </PressableFeedback>
        </View>
      )}
      <View style={styles.dialogContent}>{children}</View>
      {footer && <View style={styles.dialogFooter}>{footer}</View>}
    </Modal>
  );
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", variant = "danger" }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmText?: string; cancelText?: string; variant?: "primary" | "danger" }) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title}>
      <Text style={styles.dialogMessage}>{message}</Text>
      <View style={styles.dialogFooter}>
        <Button variant="ghost" onPress={onClose}>{cancelText}</Button>
        <Button variant={variant} onPress={() => { onConfirm(); onClose(); }}>{confirmText}</Button>
      </View>
    </Dialog>
  );
}

export function PullToRefresh({ onRefresh, refreshing, children }: { onRefresh: () => void; refreshing: boolean; children: ReactNode }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.pullToRefresh}>
        {refreshing && <Spinner size="sm" color={colors.primary} />}
      </View>
      {children}
    </View>
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
  dialogHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: spacing.md },
  dialogTitle: { fontSize: 18, fontWeight: "600", color: colors.text },
  dialogContent: { marginBottom: spacing.md },
  dialogMessage: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.md },
  dialogFooter: { flexDirection: "row", justifyContent: "flex-end", gap: spacing.sm, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  pullToRefresh: { height: 60, alignItems: "center", justifyContent: "center" },
});