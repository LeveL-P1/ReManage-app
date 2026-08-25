import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuthenticatedApi, useSession } from "@/platform/auth/session-provider";

import { ScreenContainer, SafeScrollView, SectionHeader, EmptyState, LoadingState, ErrorState, StatusBadge, PullToRefresh, PressableCard, RNView, RNText, Divider, Chip } from "../shared/heroui-ui";
import { Card, Text, ListGroup } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { formatDistanceToNow } from "date-fns";

export function NoticesScreen() {
  const router = useRouter();
  const runAuthenticated = useAuthenticatedApi();
  const { state } = useSession();
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotices = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const [noticeResult, unreadResult] = await Promise.all([
        runAuthenticated((api, token) => api.listNotices(token, { activeOnly: true })),
        runAuthenticated((api, token) => api.unreadNoticeCount(token)),
      ]);
      setNotices(noticeResult.notices || []);
      setUnreadCount(unreadResult.unreadCount || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load notices");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleRefresh = () => fetchNotices(true);

  const handleMarkRead = async (noticeId: string) => {
    try {
      await runAuthenticated((api, token) => api.markNoticeRead(token, noticeId));
      setNotices(prev => prev.map(n => n.id === noticeId ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error("Failed to mark notice as read:", err);
    }
  };

  const renderNotice = (notice: any) => (
    <PressableCard onPress={() => { if (!notice.read) handleMarkRead(notice.id); router.push(`/notices` as any); }} style={styles.noticeCard}>
      <Card>
        <RNView style={styles.noticeHeader}>
          <RNView style={styles.noticeTitleRow}>
            <Text style={styles.noticeTitle}>{notice.title}</Text>
            {!notice.read && <RNView style={styles.unreadDot} />}
          </RNView>
          <Text style={styles.noticeTime}>{formatDistanceToNow(new Date(notice.createdAt), { addSuffix: true })}</Text>
        </RNView>
        <Divider style={styles.divider} />
        <Text style={styles.noticeBody} numberOfLines={2}>{notice.body}</Text>
        <RNView style={styles.noticeFooter}>
          <StatusBadge status={notice.category === "urgent" ? "active" : notice.category === "maintenance" ? "pending" : "completed"} />
          <Text style={styles.noticeCategory}>{notice.category}</Text>
        </RNView>
      </Card>
    </PressableCard>
  );

  if (loading) return <ScreenContainer><LoadingState /></ScreenContainer>;
  if (error) return <ScreenContainer><ErrorState message={error} onRetry={fetchNotices} /></ScreenContainer>;

  return (
    <ScreenContainer>
      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
        <SafeScrollView>
          <RNView style={styles.header}>
            <RNView style={styles.headerContent}>
              <Text style={styles.pageTitle}>Announcements</Text>
              {unreadCount > 0 && <Chip variant="primary">{unreadCount} unread</Chip>}
            </RNView>
          </RNView>
          {notices.length === 0 ? (
            <EmptyState
              icon="megaphone"
              title="No announcements"
              description="You're all caught up! New announcements will appear here."
            />
          ) : (
            <ListGroup style={styles.list}>
              {notices.map((notice) => (
                <ListGroup.Item key={notice.id} style={styles.listItem}>
                  {renderNotice(notice)}
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
  pageTitle: { fontSize: 24, fontWeight: "700", color: "#111827" },
  noticeCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 12 },
  noticeHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  noticeTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  noticeTitle: { fontSize: 16, fontWeight: "600", color: "#111827", flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#EF4444" },
  noticeTime: { fontSize: 12, color: "#9CA3AF" },
  divider: { marginVertical: 8 },
  noticeBody: { fontSize: 14, color: "#6B7280", lineHeight: 20, marginBottom: 8 },
  noticeFooter: { flexDirection: "row", alignItems: "center", gap: 8 },
  noticeCategory: { fontSize: 12, fontWeight: "500", color: "#6B7280" },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  listItem: { borderWidth: 0, backgroundColor: "transparent" },
});