import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuthenticatedApi, useSession } from "@/platform/auth/session-provider";
import { Alert } from "react-native";

import { ScreenContainer, SafeScrollView, SectionHeader, EmptyState, LoadingState, ErrorState, PullToRefresh, PressableCard, RNView, RNText } from "./heroui-ui";
import { Card, Text, Divider, Button, ListGroup, Modal, TextField, TextArea, Select, Badge, Avatar } from "heroui-native";
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
      const accessToken = state.status === "authenticated" ? state.tokens?.accessToken : "";
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
      const accessToken = state.status === "authenticated" ? state.tokens?.accessToken : "";
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
      const accessToken = state.status === "authenticated" ? state.tokens?.accessToken : "";
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
      const accessToken = state.status === "authenticated" ? state.tokens?.accessToken : "";
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
          <Avatar fallback={thread.authorInitials || "U"} size="sm" />
          <RNView style={styles.threadTitleContent}>
            <RNView style={styles.threadTitleRow}>
              <Text style={styles.threadTitle}>{thread.title}</Text>
              {thread.category && <Badge color="primary" size="sm">{thread.category}</Badge>}
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
              <Ionicons name="chatbubble-outline" size={16} color="#9CA3AF" />
              <Text style={styles.statText}>{thread.replyCount || 0}</Text>
            </RNView>
            <RNView style={styles.stat}>
              <Ionicons name="eye-outline" size={16} color="#9CA3AF" />
              <Text style={styles.statText}>{thread.viewCount || 0}</Text>
            </RNView>
            <RNView style={styles.stat}>
              <Ionicons name="thumbs-up-outline" size={16} color="#9CA3AF" />
              <Text style={styles.statText}>{thread.likeCount || 0}</Text>
            </RNView>
          </RNView>
          <Button variant="ghost" size="sm" onPress={(e) => { e.stopPropagation(); openThread(thread); }}>
            <Ionicons name="chatbubble-outline" size={16} />
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
                <Ionicons name="create-outline" size={20} />
              </Button>
            </RNView>
          </RNView>
          {threads.length === 0 ? (
            <EmptyState
              icon="chatbubbles-outline"
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

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} size="lg">
        <RNView style={styles.modalContent}>
          <RNView style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Discussion</Text>
            <Button variant="ghost" size="sm" onPress={() => setShowCreateModal(false)}>
              <Ionicons name="close" size={24} />
            </Button>
          </RNView>
          <RNView style={styles.modalBody}>
            <RNView style={styles.field}>
              <Label>Title *</Label>
              <TextField
                placeholder="What's on your mind?"
                value={formData.title}
                onChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
              />
            </RNView>
            <RNView style={styles.field}>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                options={["general", "maintenance", "events", "suggestions", "complaints"].map(c => ({ label: c.charAt(0).toUpperCase() + c.slice(1), value: c }))}
              />
            </RNView>
            <RNView style={styles.field}>
              <Label>Content *</Label>
              <TextArea
                placeholder="Share your thoughts..."
                value={formData.content}
                onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                rows={6}
              />
            </RNView>
          </RNView>
          <RNView style={styles.modalFooter}>
            <Button variant="ghost" onPress={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="primary" onPress={handleCreateThread} isDisabled={submitting}>
              {submitting ? "Posting..." : "Post Discussion"}
            </Button>
          </RNView>
        </RNView>
      </Modal>

      {showReplyModal && (
        <Modal isOpen={true} onClose={() => { setShowReplyModal(null); setReplies([]); setReplyContent(""); }} size="lg">
          <RNView style={styles.modalContent}>
            <RNView style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Replies to "{showReplyModal.thread.title}"</Text>
              <Button variant="ghost" size="sm" onPress={() => { setShowReplyModal(null); setReplies([]); setReplyContent(""); }}>
                <Ionicons name="close" size={24} />
              </Button>
            </RNView>
            <RNView style={styles.modalBody}>
              {loadingReplies ? (
                <RNView style={styles.loadingReplies}><Spinner size="md" color="#E86C00" /></RNView>
              ) : replies.length === 0 ? (
                <EmptyState icon="chatbubble-outline" title="No replies yet" description="Be the first to reply!" />
              ) : (
                <RNView style={styles.repliesList}>
                  {replies.map((reply) => (
                    <RNView key={reply.id} style={styles.reply}>
                      <RNView style={styles.replyHeader}>
                        <Avatar fallback={reply.authorInitials || "U"} size="xs" />
                        <RNView style={styles.replyMeta}>
                          <Text style={styles.replyAuthor}>{reply.authorName}</Text>
                          <Text style={styles.replyTime}>{formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}</Text>
                        </RNView>
                      </RNView>
                      <Text style={styles.replyContent}>{reply.content}</Text>
                    </RNView>
                  ))}
                </RNView>
              )}
              <Divider style={styles.divider} />
              <RNView style={styles.replyInput}>
                <TextArea
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={setReplyContent}
                  rows={3}
                />
              </RNView>
            </RNView>
            <RNView style={styles.modalFooter}>
              <Button variant="ghost" onPress={() => { setShowReplyModal(null); setReplies([]); setReplyContent(""); }}>Cancel</Button>
              <Button variant="primary" onPress={() => handleReply(showReplyModal.threadId)} isDisabled={submitting || !replyContent.trim()}>
                {submitting ? "Posting..." : "Reply"}
              </Button>
            </RNView>
          </RNView>
        </Modal>
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
  modalContent: { padding: 16 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  modalBody: { marginBottom: 16 },
  field: { marginBottom: 16 },
  modalFooter: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  loadingReplies: { alignItems: "center", justifyContent: "center", padding: 32 },
  repliesList: { maxHeight: 300, marginBottom: 16 },
  reply: { paddingVertical: 8 },
  replyHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  replyMeta: { flex: 1 },
  replyAuthor: { fontSize: 14, fontWeight: "600", color: "#111827" },
  replyTime: { fontSize: 11, color: "#9CA3AF" },
  replyContent: { fontSize: 14, color: "#374151", lineHeight: 20, marginBottom: 8 },
  replyInput: { marginTop: 16 },
});