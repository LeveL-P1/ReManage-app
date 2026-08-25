import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuthenticatedApi, useSession } from "@/platform/auth/session-provider";
import { Alert } from "react-native";

import { ScreenContainer, SafeScrollView, SectionHeader, EmptyState, LoadingState, ErrorState, PullToRefresh, PressableCard, RNView, RNText, Divider, Chip, ConfirmDialog, Spinner } from "../shared/heroui-ui";
import { Card, Text, ListGroup, TextField, TextArea, Select, Button, Avatar } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { formatDistanceToNow } from "date-fns";

export function ForumScreen() {
  const router = useRouter();
  const runAuthenticated = useAuthenticatedApi();
  const { state } = useSession();
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState<{ threadId: string; thread: any } | null>(null);
  const [formData, setFormData] = useState({ title: "", content: "", category: "general" });
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replies, setReplies] = useState<any[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const fetchThreads = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const result = await runAuthenticated((api, token) => api.listForumThreads(token));
      setThreads(result.threads || []);
    } catch (err: any) {
      setError(err.message || "Failed to load discussions");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  const handleRefresh = () => fetchThreads(true);

  const handleCreateThread = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      await runAuthenticated((api, token) => api.createForumThread(token, { title: formData.title, content: formData.content, category: formData.category }));
      setShowCreateModal(false);
      setFormData({ title: "", content: "", category: "general" });
      fetchThreads();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to create thread");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (threadId: string) => {
    if (!replyContent.trim()) {
      Alert.alert("Error", "Please enter your reply");
      return;
    }
    setSubmitting(true);
    try {
      await runAuthenticated((api, token) => api.replyForumThread(token, threadId, replyContent));
      setShowReplyModal(null);
      setReplyContent("");
      if (showReplyModal) {
        fetchReplies(showReplyModal.threadId);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to reply");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchReplies = async (threadId: string) => {
    setLoadingReplies(true);
    try {
      const result = await runAuthenticated((api, token) => api.listForumReplies(token, threadId));
      setReplies(result.replies || []);
    } catch (err: any) {
      console.error("Failed to load replies:", err);
    } finally {
      setLoadingReplies(false);
    }
  };

  const openThread = (thread: any) => {
    setShowReplyModal({ threadId: thread.id, thread });
    fetchReplies(thread.id);
  };

  const renderThread = (thread: any) => (
    <PressableCard onPress={() => openThread(thread)} style={styles.threadCard}>
      <Card>
        <RNView style={styles.threadHeader}>
          <Avatar size="sm" />
          <RNView style={styles.threadTitleContent}>
            <RNView style={styles.threadTitleRow}>
              <Text style={styles.threadTitle}>{thread.title}</Text>
              {thread.category && <Chip variant="primary" size="sm">{thread.category}</Chip>}
            </RNView>
            <RNView style={styles.threadMeta}>
              <Text style={styles.threadAuthor}>{thread.authorName}</Text>
              <Text style={styles.threadTime}>{formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}</Text>
            </RNView>
          </RNView>
        </RNView>
        <Divider style={styles.divider} />
        <Text style={styles.threadBody} numberOfLines={2}>{thread.content}</Text>
        <RNView style={styles.threadFooter}>
          <RNView style={styles.threadStats}>
            <RNView style={styles.stat}>
              <Ionicons name="chatbubble" size={16} color="#9CA3AF" />
              <Text style={styles.statText}>{thread.replyCount || 0}</Text>
            </RNView>
            <RNView style={styles.stat}>
              <Ionicons name="eye" size={16} color="#9CA3AF" />
              <Text style={styles.statText}>{thread.viewCount || 0}</Text>
            </RNView>
            <RNView style={styles.stat}>
              <Ionicons name="thumbs-up" size={16} color="#9CA3AF" />
              <Text style={styles.statText}>{thread.likeCount || 0}</Text>
            </RNView>
          </RNView>
          <Button variant="ghost" size="sm" onPress={(e) => { e.stopPropagation(); openThread(thread); }}>
            <Ionicons name="chatbubble" size={16} />
            <Text>Reply</Text>
          </Button>
        </RNView>
      </Card>
    </PressableCard>
  );

  if (loading) return <ScreenContainer><LoadingState /></ScreenContainer>;
  if (error) return <ScreenContainer><ErrorState message={error} onRetry={fetchThreads} /></ScreenContainer>;

  return (
    <ScreenContainer>
      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
        <SafeScrollView>
          <RNView style={styles.header}>
            <RNView style={styles.headerContent}>
              <Text style={styles.pageTitle}>Discussions</Text>
              <Button onPress={() => setShowCreateModal(true)}>
                <Ionicons name="create" size={20} />
              </Button>
            </RNView>
          </RNView>
          {threads.length === 0 ? (
            <EmptyState
              icon="chatbubbles"
              title="No discussions"
              description="Be the first to start a conversation in your society."
              action="New Post"
              onAction={() => setShowCreateModal(true)}
            />
          ) : (
            <ListGroup style={styles.list}>
              {threads.map((thread) => (
                <ListGroup.Item key={thread.id} style={styles.listItem}>
                  {renderThread(thread)}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </SafeScrollView>
      </PullToRefresh>

      <ConfirmDialog
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onConfirm={handleCreateThread}
        title="New Discussion"
        message="Create a new discussion thread."
        confirmText="Post Discussion"
        variant="primary"
      />

      {showReplyModal && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => { setShowReplyModal(null); setReplies([]); setReplyContent(""); }}
          onConfirm={() => handleReply(showReplyModal.threadId)}
          title={`Replies to "${showReplyModal.thread.title}"`}
          message="Loading replies..."
          confirmText="Reply"
          variant="primary"
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pageTitle: { fontSize: 24, fontWeight: "700", color: "#111827" },
  threadCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 12 },
  threadHeader: { flexDirection: "row", gap: 12, marginBottom: 8 },
  threadTitleContent: { flex: 1 },
  threadTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  threadTitle: { fontSize: 16, fontWeight: "600", color: "#111827", flex: 1 },
  threadMeta: { flexDirection: "row", gap: 12 },
  threadAuthor: { fontSize: 13, fontWeight: "500", color: "#111827" },
  threadTime: { fontSize: 12, color: "#9CA3AF" },
  divider: { marginVertical: 8 },
  threadBody: { fontSize: 14, color: "#6B7280", lineHeight: 20, marginBottom: 8 },
  threadFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8 },
  threadStats: { flexDirection: "row", gap: 16 },
  stat: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { fontSize: 12, color: "#9CA3AF" },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  listItem: { borderWidth: 0, backgroundColor: "transparent" },
});