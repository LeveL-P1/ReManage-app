import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuthenticatedApi } from "@/platform/auth/use-authenticated-api";
import { Alert } from "react-native";

import { ScreenContainer, SafeScrollView, SectionHeader, EmptyState, LoadingState, ErrorState, StatusBadge, PullToRefresh, ConfirmDialog } from "./heroui-ui";
import { Card, Text, View, Icon, Divider, Button, ListGroup, Input, TextField, Modal, Surface, Avatar } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { formatDistanceToNow } from "date-fns";

const CATEGORIES = ["Maintenance", "Cleaning", "Security", "Noise", "Parking", "Other"];
const PRIORITIES = ["low", "medium", "high", "urgent"];

export function HelpdeskScreen() {
  const router = useRouter();
  const runAuthenticated = useAuthenticatedApi();
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
      const accessToken = await runAuthenticated(() => Promise.resolve(""));
      const result = await runAuthenticated((api) => api.listHelpdesk(accessToken));
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
      const accessToken = await runAuthenticated(() => Promise.resolve(""));
      await runAuthenticated((api) => api.raiseComplaint(accessToken, formData));
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
      const accessToken = await runAuthenticated(() => Promise.resolve(""));
      await runAuthenticated((api) => api.transitionComplaint(accessToken, complaintId, { action, resolution }));
      fetchComplaints();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update complaint");
    }
  };

  const handleRate = async (complaintId: string, rating: number, comment: string) => {
    try {
      const accessToken = await runAuthenticated(() => Promise.resolve(""));
      await runAuthenticated((api) => api.rateComplaint(accessToken, complaintId, { rating, comment }));
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
      <Card style={styles.complaintCard}>
        <View style={styles.complaintHeader}>
          <View style={styles.complaintTitleRow}>
            <Text style={styles.complaintTitle}>{complaint.title}</Text>
            <StatusBadge status={complaint.status as any} />
          </View>
          <Text style={styles.complaintTime}>{formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}</Text>
        </View>
        <Divider style={styles.divider} />
        <Text style={styles.complaintBody} numberOfLines={3}>{complaint.description}</Text>
        <View style={styles.complaintMeta}>
          <View style={styles.metaItem}>
            <Icon name="tag-outline" size={16} color="#9CA3AF" />
            <Text style={styles.metaText}>{complaint.category}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="alert-circle-outline" size={16} color="#9CA3AF" />
            <Text style={styles.metaText}>{complaint.priority}</Text>
          </View>
        </View>
        {canRate && (
          <View style={styles.rateButton}>
            <Button variant="outline" size="sm" onPress={() => setShowRateModal({ complaintId: complaint.id, complaint })}>
              Rate Resolution
            </Button>
          </View>
        )}
      </Card>
    );
  };

  if (loading) return <ScreenContainer><LoadingState /></ScreenContainer>;
  if (error) return <ScreenContainer><ErrorState message={error} onRetry={fetchComplaints} /></ScreenContainer>;

  return (
    <ScreenContainer>
      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
        <SafeScrollView>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.pageTitle}>Helpdesk</Text>
              <Button onPress={() => setShowCreateModal(true)}>
                <Icon name="add" size={20} />
              </Button>
            </View>
          </View>
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
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Raise Complaint</Text>
            <Button variant="ghost" size="sm" onPress={() => setShowCreateModal(false)}>
              <Icon name="close" size={24} />
            </Button>
          </View>
          <View style={styles.modalBody}>
            <View style={styles.field}>
              <Label>Title *</Label>
              <TextField
                placeholder="Brief summary of the issue"
                value={formData.title}
                onChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
              />
            </View>
            <View style={styles.field}>
              <Label>Description *</Label>
              <TextField
                placeholder="Detailed description"
                value={formData.description}
                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                multiline
                numberOfLines={4}
              />
            </View>
            <View style={styles.field}>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                options={CATEGORIES.map(c => ({ label: c, value: c }))}
              />
            </View>
            <View style={styles.field}>
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                options={PRIORITIES.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p }))}
              />
            </View>
          </View>
          <View style={styles.modalFooter}>
            <Button variant="ghost" onPress={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="primary" onPress={handleCreate} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Complaint"}
            </Button>
          </View>
        </View>
      </Modal>

      {showRateModal && (
        <Modal isOpen={true} onClose={() => setShowRateModal(null)} size="md">
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rate Resolution</Text>
              <Button variant="ghost" size="sm" onPress={() => setShowRateModal(null)}>
                <Icon name="close" size={24} />
              </Button>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.ratePrompt}>How satisfied are you with the resolution for "{showRateModal.complaint.title}"?</Text>
              <View style={styles.ratingContainer}>
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
              </View>
              <View style={styles.field}>
                <Label>Comment (optional)</Label>
                <TextField
                  placeholder="Additional feedback"
                  value={formData.description}
                  onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
            <View style={styles.modalFooter}>
              <Button variant="ghost" onPress={() => setShowRateModal(null)}>Cancel</Button>
              <Button variant="primary" onPress={() => handleRate(showRateModal.complaintId, parseInt(formData.title), formData.description)}>
                Submit Rating
              </Button>
            </View>
          </View>
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