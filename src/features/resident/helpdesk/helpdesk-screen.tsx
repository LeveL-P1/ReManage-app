import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuthenticatedApi, useSession } from "@/platform/auth/session-provider";
import { Alert } from "react-native";

import { ScreenContainer, SafeScrollView, SectionHeader, EmptyState, LoadingState, ErrorState, StatusBadge, PullToRefresh, ConfirmDialog, PressableCard, RNView, RNText } from "../shared/heroui-ui";
import { Card, Text, Divider, Button, ListGroup, TextField, TextArea, Select, Modal, Label } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { formatDistanceToNow } from "date-fns";

const CATEGORIES = ["Maintenance", "Cleaning", "Security", "Noise", "Parking", "Other"];
const PRIORITIES = ["low", "medium", "high", "urgent"];

export function HelpdeskScreen() {
  const router = useRouter();
  const runAuthenticated = useAuthenticatedApi();
  const { state } = useSession();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState<{ complaintId: string; complaint: any } | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "", category: "Maintenance", priority: "medium", mediaUrls: [] as string[] });
  const [submitting, setSubmitting] = useState(false);

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

  const handleRate = async (complaintId: string, rating: number, comment: string) => {
    try {
      await runAuthenticated((api, token) => api.rateComplaint(token, complaintId, { rating, comment }));
      setShowRateModal(null);
      fetchComplaints();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to rate complaint");
    }
  };

  const renderComplaint = (complaint: any) => {
    const statusConfig = {
      open: { color: "primary", label: "Open" },
      in_progress: { color: "warning", label: "In Progress" },
      resolved: { color: "success", label: "Resolved" },
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
              <Ionicons name="bag-outline" size={16} color="#9CA3AF" />
              <Text style={styles.metaText}>{complaint.category}</Text>
            </RNView>
            <RNView style={styles.metaItem}>
              <Ionicons name="alert-circle-outline" size={16} color="#9CA3AF" />
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
              icon="headset-outline"
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

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} size="lg">
        <RNView style={styles.modalContent}>
          <RNView style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Raise Complaint</Text>
            <Button variant="ghost" size="sm" onPress={() => setShowCreateModal(false)}>
              <Ionicons name="close" size={24} />
            </Button>
          </RNView>
          <RNView style={styles.modalBody}>
            <RNView style={styles.field}>
              <Label>Title *</Label>
              <TextField
                placeholder="Brief summary of the issue"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target?.value || e }))}
              />
            </RNView>
            <RNView style={styles.field}>
              <Label>Description *</Label>
              <TextArea
                placeholder="Detailed description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target?.value || e }))}
              />
            </RNView>
            <RNView style={styles.field}>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                options={CATEGORIES.map(c => ({ label: c, value: c }))}
              />
            </RNView>
            <RNView style={styles.field}>
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                options={PRIORITIES.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p }))}
              />
            </RNView>
          </RNView>
          <RNView style={styles.modalFooter}>
            <Button variant="ghost" onPress={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="primary" onPress={handleCreate} isDisabled={submitting}>
              {submitting ? "Submitting..." : "Submit Complaint"}
            </Button>
          </RNView>
        </RNView>
      </Modal>

      {showRateModal && (
        <Modal isOpen={true} onClose={() => setShowRateModal(null)} size="md">
          <RNView style={styles.modalContent}>
            <RNView style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rate Resolution</Text>
              <Button variant="ghost" size="sm" onPress={() => setShowRateModal(null)}>
                <Ionicons name="close" size={24} />
              </Button>
            </RNView>
            <RNView style={styles.modalBody}>
              <Text style={styles.ratePrompt}>How satisfied are you with the resolution for "{showRateModal.complaint.title}"?</Text>
              <RNView style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant={formData.title === String(star) ? "primary" : "outline"}
                    size="sm"
                    onPress={() => setFormData(prev => ({ ...prev, title: String(star) }))}
                    style={{ width: 50, height: 50 }}
                  >
                    <Text style={{ fontSize: 24 }}>{"★"}</Text>
                  </Button>
                ))}
              </RNView>
              <RNView style={styles.field}>
                <Label>Comment (optional)</Label>
                <TextArea
                  placeholder="Additional feedback"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target?.value || e }))}
                />
              </RNView>
            </RNView>
            <RNView style={styles.modalFooter}>
              <Button variant="ghost" onPress={() => setShowRateModal(null)}>Cancel</Button>
              <Button variant="primary" onPress={() => handleRate(showRateModal.complaintId, parseInt(formData.title), formData.description)}>
                Submit Rating
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
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  listItem: { borderWidth: 0, backgroundColor: "transparent" },
  modalContent: { padding: 16 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  modalBody: { marginBottom: 16 },
  field: { marginBottom: 16 },
  modalFooter: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  ratingContainer: { flexDirection: "row", gap: 8, marginVertical: 16 },
  ratePrompt: { fontSize: 14, color: "#6B7280", marginBottom: 16, lineHeight: 20 },
});