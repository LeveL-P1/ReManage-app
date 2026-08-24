import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuthenticatedApi, useSession } from "@/platform/auth/session-provider";

import { ScreenContainer, SafeScrollView, SectionHeader, EmptyState, LoadingState, ErrorState, PullToRefresh, PressableCard, RNView, RNText } from "../shared/heroui-ui";
import { Card, Text, Divider, Button, ListGroup, Switch, Badge } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { formatDistanceToNow } from "date-fns";

const NOTIFICATION_ICONS: Record<string, string> = {
  bill: "card-outline",
  complaint: "headset-outline",
  event: "calendar-outline",
  poll: "bar-chart-outline",
  visitor: "people-outline",
  notice: "megaphone-outline",
  payment: "cash-outline",
  general: "notifications-outline",
};

export function NotificationsScreen() {
  const router = useRouter();
  const runAuthenticated = useAuthenticatedApi();
  const { state } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pushEnabled, setPushEnabled] = useState(false);

  const fetchNotifications = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const result = await runAuthenticated((api, token) => api.listNotifications(token));
      setNotifications(result.notifications || []);
    } catch (err: any) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRefresh = () => fetchNotifications(true);

  const handleMarkRead = async (notificationId: string) => {
    try {
      await runAuthenticated((api, token) => api.markNotificationRead(token, notificationId));
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    } catch (err: any) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleRegisterPush = async () => {
    try {
      await runAuthenticated((api, token) => api.registerPushToken(token, {
        endpoint: "https://example.com/push",
        p256dh: "test-key",
        auth: "test-auth",
        userAgent: "ReManage Mobile",
      }));
      setPushEnabled(true);
    } catch (err: any) {
      console.error("Failed to register push:", err);
    }
  };

  const renderNotification = (notification: any) => {
    const iconName = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.general;
    const iconColor = notification.read ? "#9CA3AF" : "#E86C00";

    return (
      <PressableCard onPress={() => { if (!notification.read) handleMarkRead(notification.id); }} style={[styles.notificationCard, !notification.read && styles.notificationCardUnread]}>
        <Card>
          <RNView style={styles.notificationHeader}>
            <RNView style={[styles.notificationIcon, { backgroundColor: `${iconColor}20` }]}>
              <Ionicons name={iconName} size={20} color={iconColor} />
            </RNView>
            <RNView style={styles.notificationTitleContent}>
              <RNView style={styles.notificationTitleRow}>
                <Text style={[styles.notificationTitle, !notification.read && styles.notificationTitleUnread]}>{notification.title}</Text>
                {!notification.read && <Badge color="primary" size="xs">New</Badge>}
              </RNView>
              <Text style={styles.notificationTime}>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</Text>
            </RNView>
          </RNView>
          <Divider style={styles.divider} />
          <Text style={styles.notificationBody}>{notification.body}</Text>
          {notification.actionUrl && (
            <Button variant="ghost" size="sm" style={styles.actionButton} onPress={(e) => { e.stopPropagation(); router.push(notification.actionUrl); }}>
              <Ionicons name="chevron-forward" size={14} />
              <Text>View Details</Text>
            </Button>
          )}
        </Card>
      </PressableCard>
    );
  };

  if (loading) return <ScreenContainer><LoadingState /></ScreenContainer>;
  if (error) return <ScreenContainer><ErrorState message={error} onRetry={fetchNotifications} /></ScreenContainer>;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <ScreenContainer>
      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
        <SafeScrollView>
          <RNView style={styles.header}>
            <RNView style={styles.headerContent}>
              <RNView style={styles.headerLeft}>
                <Text style={styles.pageTitle}>Notifications</Text>
                {unreadCount > 0 && <Badge color="danger">{unreadCount}</Badge>}
              </RNView>
              <RNView style={styles.headerRight}>
                <RNView style={styles.pushToggle}>
                  <Text style={styles.pushLabel}>Push Notifications</Text>
                  <Switch
                    isSelected={pushEnabled}
                    onValueChange={setPushEnabled}
                  />
                </RNView>
                {!pushEnabled && (
                  <Button variant="ghost" size="sm" onPress={handleRegisterPush}>
                    <Ionicons name="bell-outline" size={16} />
                    <Text>Enable</Text>
                  </Button>
                )}
              </RNView>
            </RNView>
          </RNView>
          {notifications.length === 0 ? (
            <EmptyState
              icon="notifications-off-outline"
              title="No notifications"
              description="You're all caught up! New notifications will appear here."
            />
          ) : (
            <ListGroup style={styles.list}>
              {notifications.map((notification) => (
                <ListGroup.Item key={notification.id} style={styles.listItem}>
                  {renderNotification(notification)}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </SafeScrollView>
      </PullToRefresh>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  pageTitle: { fontSize: 24, fontWeight: "700", color: "#111827" },
  pushToggle: { flexDirection: "row", alignItems: "center", gap: 8 },
  pushLabel: { fontSize: 14, color: "#6B7280" },
  notificationCard: { marginHorizontal: 16, marginBottom: 8, borderRadius: 12 },
  notificationCardUnread: { backgroundColor: "#FFFDF5", borderWidth: 1, borderColor: "#FEF3C7" },
  notificationHeader: { flexDirection: "row", gap: 12 },
  notificationIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  notificationTitleContent: { flex: 1 },
  notificationTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  notificationTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },
  notificationTitleUnread: { fontWeight: "700" },
  notificationTime: { fontSize: 12, color: "#9CA3AF" },
  divider: { marginVertical: 8 },
  notificationBody: { fontSize: 14, color: "#374151", lineHeight: 20, marginBottom: 8 },
  actionButton: { width: "100%" },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  listItem: { borderWidth: 0, backgroundColor: "transparent" },
});