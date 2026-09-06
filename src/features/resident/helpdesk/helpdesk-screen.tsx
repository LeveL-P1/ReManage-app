import { useEffect, useState } from "react";
import { useAuthenticatedApi } from "@/platform/auth/session-provider";
import { Alert, TextInput } from "react-native";

import { ScreenContainer, SafeScrollView, SectionHeader, EmptyState, LoadingState, ErrorState, StatusBadge, PullToRefresh, ConfirmDialog, PressableCard, RNView, RNText, Divider, Chip } from "../shared/heroui-ui";
import { Card, Text, ListGroup, Button } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { formatDistanceToNow } from "date-fns";

const CATEGORIES = ["Maintenance", "Cleaning", "Security", "Noise", "Parking", "Other"];
const PRIORITIES = ["low", "medium", "high", "urgent"];

export function HelpdeskScreen() {
  const runAuthenticated = useAuthenticatedApi();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState<{ complaintId: string; complaint: any } | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "", category: "Maintenance", priority: "medium", mediaUrls: [] as string[] });
  const [submitting, setSubmitting] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState("");

  const fetchComplaints = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const result = await runAuthenticated((api, token) => api.listHelpdesk(token));
      setComplaints(result.complaints || []);
    } catch (err: any) {
      setError(err.message || "Failed to load complaints");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleRefresh = () => fetchComplaints(true);

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      await runAuthenticated((api, token) => api.raiseComplaint(token, formData));
      setShowCreateModal(false);
      setFormData({ title: "", description: "", category: "Maintenance", priority: "medium", mediaUrls: [] });
      fetchComplaints();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to create complaint");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransition = async (complaintId: string, action: string, resolution?: string) => {
    try {
      await runAuthenticated((api, token) => api.transitionComplaint(token, complaintId, { action, resolution }));
      fetchComplaints();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update complaint");
    }
  };

  const handleRate = async () => {
    if (!showRateModal) return;
    try {
      await runAuthenticated((api, token) => api.rateComplaint(token, showRateModal.complaintId, { rating: ratingValue, comment: ratingComment }));
      setShowRateModal(null);
      setRatingValue(5);
      setRatingComment("");
      fetchComplaints();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to rate complaint");
    }
  };

  const renderComplaint = (complaint: any) => {
    const statusConfig = {
      open: { color: "primary", label: "Open" },
      in_progress: { color: "primary", label: "In Progress" },
      resolved: { color: "primary", label: "Resolved" },
      closed: { color: "secondary", label: "Closed" },
    };
    const config = statusConfig[complaint.status as keyof typeof statusConfig] || { color: "secondary", label: complaint.status };

    const canRate = complaint.status === "resolved" && !complaint.rating;

    return (
      <PressableCard style={styles.complaintCard}>
        <Card>
          <RNView style={styles.complaintHeader}>
            <RNView style={styles.complaintTitleRow}>
              <Text style={styles.complaintTitle}>{complaint.title}</Text>
              <StatusBadge status={complaint.status as any} />
            </RNView>
            <Text style={styles.complaintTime}>{formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}</Text>
          </RNView>
          <Divider style={styles.divider} />
          <Text style={styles.complaintBody} numberOfLines={3}>{complaint.description}</Text>
          <RNView style={styles.complaintMeta}>
            <RNView style={styles.metaItem}>
              <Ionicons name="bag" size={16} color="#9CA3AF" />
              <Text style={styles.metaText}>{complaint.category}</Text>
            </RNView>
            <RNView style={styles.metaItem}>
              <Ionicons name="alert-circle" size={16} color="#9CA3AF" />
              <Text style={styles.metaText}>{complaint.priority}</Text>
            </RNView>
          </RNView>
          {canRate && (
            <RNView style={styles.rateButton}>
              <Button variant="outline" size="sm" onPress={() => setShowRateModal({ complaintId: complaint.id, complaint })}>
                Rate Resolution
              </Button>
            </RNView>
          )}
        </Card>
      </PressableCard>
    );
  };

  if (loading) return <ScreenContainer><LoadingState /></ScreenContainer>;
  if (error) return <ScreenContainer><ErrorState message={error} onRetry={fetchComplaints} /></ScreenContainer>;

  return (
    <ScreenContainer>
      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
        <SafeScrollView>
          <RNView style={styles.header}>
            <RNView style={styles.headerContent}>
              <Text style={styles.pageTitle}>Helpdesk</Text>
              <Button onPress={() => setShowCreateModal(true)}>
                <Ionicons name="add" size={20} />
              </Button>
            </RNView>
          </RNView>
          {complaints.length === 0 ? (
            <EmptyState
              icon="headset"
              title="No complaints"
              description="Your society helpdesk is quiet. Raise a complaint if you need assistance."
              action="Raise Complaint"
              onAction={() => setShowCreateModal(true)}
            />
          ) : (
            <ListGroup style={styles.list}>
              {complaints.map((complaint) => (
                <ListGroup.Item key={complaint.id} style={styles.listItem}>
                  {renderComplaint(complaint)}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </SafeScrollView>
      </PullToRefresh>

      <ConfirmDialog
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setFormData({ title: "", description: "", category: "Maintenance", priority: "medium", mediaUrls: [] }); }}
        onConfirm={handleCreate}
        title="Raise Complaint"
        confirmText="Submit Complaint"
        variant="primary"
      >
        <RNText style={styles.formLabel}>Title</RNText>
        <TextInput
          style={styles.formInput}
          onChangeText={(v) => setFormData((f) => ({ ...f, title: v }))}
          placeholder="Brief summary"
          value={formData.title}
        />
        <RNText style={styles.formLabel}>Description</RNText>
        <TextInput
          multiline
          numberOfLines={4}
          style={[styles.formInput, styles.formTextArea]}
          onChangeText={(v) => setFormData((f) => ({ ...f, description: v }))}
          placeholder="Describe the issue"
          value={formData.description}
        />
        <RNText style={styles.formLabel}>Category</RNText>
        <RNView style={styles.chipRow}>
          {CATEGORIES.map((c) => (
            <Chip key={c} variant={formData.category === c ? "primary" : "secondary"} size="sm" onPress={() => setFormData((f) => ({ ...f, category: c }))}>
              {c}
            </Chip>
          ))}
        </RNView>
        <RNText style={styles.formLabel}>Priority</RNText>
        <RNView style={styles.chipRow}>
          {PRIORITIES.map((p) => (
            <Chip key={p} variant={formData.priority === p ? "primary" : "secondary"} size="sm" onPress={() => setFormData((f) => ({ ...f, priority: p }))}>
              {p}
            </Chip>
          ))}
        </RNView>
      </ConfirmDialog>

      {showRateModal && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => { setShowRateModal(null); setRatingValue(5); setRatingComment(""); }}
          onConfirm={handleRate}
          title="Rate Resolution"
          message={`How satisfied are you with the resolution for "${showRateModal.complaint.title}"?`}
          confirmText="Submit Rating"
          variant="primary"
        >
          <RNView style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Button key={star} variant="ghost" onPress={() => setRatingValue(star)}>
                <Ionicons name={star <= ratingValue ? "star" : "star-outline"} size={28} color={star <= ratingValue ? "#F59E0B" : "#9CA3AF"} />
              </Button>
            ))}
          </RNView>
          <RNText style={styles.formLabel}>Comment (optional)</RNText>
          <TextInput
            multiline
            numberOfLines={3}
            style={[styles.formInput, styles.formTextArea]}
            onChangeText={setRatingComment}
            placeholder="Any feedback?"
            value={ratingComment}
          />
        </ConfirmDialog>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pageTitle: { fontSize: 24, fontWeight: "700", color: "#111827" },
  complaintCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 12 },
  complaintHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  complaintTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  complaintTitle: { fontSize: 16, fontWeight: "600", color: "#111827", flex: 1 },
  complaintTime: { fontSize: 12, color: "#9CA3AF" },
  divider: { marginVertical: 8 },
  complaintBody: { fontSize: 14, color: "#6B7280", lineHeight: 20, marginBottom: 8 },
  complaintMeta: { flexDirection: "row", gap: 16 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: "#6B7280" },
  rateButton: { marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#E5E7EB" },
  ratingRow: { flexDirection: "row", justifyContent: "center", gap: 4, marginVertical: 8 },
  formLabel: { fontSize: 13, fontWeight: "600", color: "#374151", marginTop: 12, marginBottom: 6 },
  formInput: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#111827" },
  formTextArea: { minHeight: 80, textAlignVertical: "top" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  listItem: { borderWidth: 0, backgroundColor: "transparent" },
});