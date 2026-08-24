import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuthenticatedApi, useSession } from "@/platform/auth/session-provider";
import { Alert } from "react-native";

import { ScreenContainer, SafeScrollView, SectionHeader, EmptyState, LoadingState, ErrorState, PullToRefresh, PressableCard, RNView, RNText } from "./heroui-ui";
import { Card, Text, Divider, Button, ListGroup, Modal, TextField, TextArea, Switch, Avatar, Label } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

export function ProfileScreen() {
  const router = useRouter();
  const runAuthenticated = useAuthenticatedApi();
  const { state } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", emergencyContact: "", showPhoneInDirectory: false, showEmailInDirectory: false });
  const [submitting, setSubmitting] = useState(false);

  const fetchProfile = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const accessToken = state.status === "authenticated" ? state.tokens?.accessToken : "";
      const result = await runAuthenticated((api, token) => api.getProfile(token));
      setProfile(result);
      setFormData({
        name: result.name || "",
        phone: result.phone || "",
        emergencyContact: result.emergencyContact || "",
        showPhoneInDirectory: result.showPhoneInDirectory || false,
        showEmailInDirectory: result.showEmailInDirectory || false,
      });
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleRefresh = () => fetchProfile(true);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }
    setSubmitting(true);
    try {
      const accessToken = state.status === "authenticated" ? state.tokens?.accessToken : "";
      await runAuthenticated((api, token) => api.updateProfile(token, formData));
      setShowEditModal(false);
      fetchProfile();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <ScreenContainer><LoadingState /></ScreenContainer>;
  if (error) return <ScreenContainer><ErrorState message={error} onRetry={fetchProfile} /></ScreenContainer>;
  if (!profile) return <ScreenContainer><EmptyState icon="person-outline" title="Profile not found" description="Unable to load your profile." /></ScreenContainer>;

  return (
    <ScreenContainer>
      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
        <SafeScrollView>
          <RNView style={styles.header}>
            <RNView style={styles.profileHeader}>
              <Avatar src={profile.avatarUrl} fallback={profile.name?.charAt(0)?.toUpperCase() || "U"} size="lg" />
              <RNView style={styles.profileInfo}>
                <Text style={styles.profileName}>{profile.name || "Resident"}</Text>
                <RNView style={styles.profileMeta}>
                  <Text style={styles.profileUnit}>{profile.flat || profile.unit || "—"}</Text>
                  <RNText style={styles.profileDot}>·</RNText>
                  <Text style={styles.profileSociety}>{profile.society?.name || "Your Society"}</Text>
                </RNView>
              </RNView>
            </RNView>
            <Button variant="outline" onPress={() => setShowEditModal(true)}>
              <Ionicons name="create-outline" size={18} />
              <Text>Edit</Text>
            </Button>
          </RNView>

          <SectionHeader title="Contact Information" />
          <ListGroup style={styles.list}>
            <ListGroup.Item style={styles.listItem}>
              <RNView style={styles.infoRow}>
                <RNView style={styles.infoIcon}><Ionicons name="call-outline" size={20} color="#E86C00" /></RNView>
                <RNView style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{profile.phone || "Not set"}</Text>
                </RNView>
              </RNView>
            </ListGroup.Item>
            <ListGroup.Item style={styles.listItem}>
              <RNView style={styles.infoRow}>
                <RNView style={styles.infoIcon}><Ionicons name="mail-outline" size={20} color="#E86C00" /></RNView>
                <RNView style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{profile.email || "Not set"}</Text>
                </RNView>
              </RNView>
            </ListGroup.Item>
            <ListGroup.Item style={styles.listItem}>
              <RNView style={styles.infoRow}>
                <RNView style={styles.infoIcon}><Ionicons name="person-outline" size={20} color="#E86C00" /></RNView>
                <RNView style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Emergency Contact</Text>
                  <Text style={styles.infoValue}>{profile.emergencyContact || "Not set"}</Text>
                </RNView>
              </RNView>
            </ListGroup.Item>
          </ListGroup>

          <SectionHeader title="Directory Preferences" />
          <ListGroup style={styles.list}>
            <ListGroup.Item style={styles.listItem}>
              <RNView style={styles.switchRow}>
                <RNView style={styles.switchContent}>
                  <Text style={styles.switchLabel}>Show Phone in Directory</Text>
                  <Text style={styles.switchDesc}>Allow other residents to see your phone number</Text>
                </RNView>
                <Switch
                  isSelected={profile.showPhoneInDirectory}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, showPhoneInDirectory: value }))}
                />
              </RNView>
            </ListGroup.Item>
            <ListGroup.Item style={styles.listItem}>
              <RNView style={styles.switchRow}>
                <RNView style={styles.switchContent}>
                  <Text style={styles.switchLabel}>Show Email in Directory</Text>
                  <Text style={styles.switchDesc}>Allow other residents to see your email address</Text>
                </RNView>
                <Switch
                  isSelected={profile.showEmailInDirectory}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, showEmailInDirectory: value }))}
                />
              </RNView>
            </ListGroup.Item>
          </ListGroup>

          <SectionHeader title="Account" />
          <ListGroup style={styles.list}>
            <ListGroup.Item style={styles.listItem}>
              <RNView style={styles.infoRow}>
                <RNView style={styles.infoIcon}><Ionicons name="id-card-outline" size={20} color="#E86C00" /></RNView>
                <RNView style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Resident ID</Text>
                  <Text style={styles.infoValue}>{profile.userId || "—"}</Text>
                </RNView>
              </RNView>
            </ListGroup.Item>
            <ListGroup.Item style={styles.listItem}>
              <RNView style={styles.infoRow}>
                <RNView style={styles.infoIcon}><Ionicons name="calendar-outline" size={20} color="#E86C00" /></RNView>
                <RNView style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Member Since</Text>
                  <Text style={styles.infoValue}>{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}</Text>
                </RNView>
              </RNView>
            </ListGroup.Item>
          </ListGroup>
        </SafeScrollView>
      </PullToRefresh>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} size="lg">
        <RNView style={styles.modalContent}>
          <RNView style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Button variant="ghost" size="sm" onPress={() => setShowEditModal(false)}>
              <Ionicons name="close" size={24} />
            </Button>
          </RNView>
          <RNView style={styles.modalBody}>
            <RNView style={styles.field}>
              <Label>Full Name *</Label>
              <TextField
                placeholder="Your full name"
                value={formData.name}
                onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
              />
            </RNView>
            <RNView style={styles.field}>
              <Label>Phone Number</Label>
              <TextField
                placeholder="Phone number"
                value={formData.phone}
                onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                keyboardType="phone-pad"
              />
            </RNView>
            <RNView style={styles.field}>
              <Label>Emergency Contact</Label>
              <TextField
                placeholder="Emergency contact number"
                value={formData.emergencyContact}
                onChange={(value) => setFormData(prev => ({ ...prev, emergencyContact: value }))}
                keyboardType="phone-pad"
              />
            </RNView>
            <RNView style={styles.field}>
              <Label>Directory Preferences</Label>
              <Switch
                isSelected={formData.showPhoneInDirectory}
                onValueChange={(value) => setFormData(prev => ({ ...prev, showPhoneInDirectory: value }))}
                label="Show Phone in Directory"
              />
              <Switch
                isSelected={formData.showEmailInDirectory}
                onValueChange={(value) => setFormData(prev => ({ ...prev, showEmailInDirectory: value }))}
                label="Show Email in Directory"
                style={{ marginTop: 12 }}
              />
            </RNView>
          </RNView>
          <RNView style={styles.modalFooter}>
            <Button variant="ghost" onPress={() => setShowEditModal(false)}>Cancel</Button>
            <Button variant="primary" onPress={handleSave} isDisabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </RNView>
        </RNView>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  profileHeader: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 8 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 22, fontWeight: "700", color: "#111827" },
  profileMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  profileUnit: { fontSize: 14, fontWeight: "600", color: "#E86C00" },
  profileDot: { color: "#9CA3AF" },
  profileSociety: { fontSize: 14, color: "#6B7280" },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  listItem: { borderWidth: 0, backgroundColor: "transparent", paddingVertical: 8 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  infoIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#FEF3C7", alignItems: "center", justifyContent: "center" },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 13, color: "#9CA3AF" },
  infoValue: { fontSize: 16, fontWeight: "500", color: "#111827", marginTop: 2 },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  switchContent: { flex: 1 },
  switchLabel: { fontSize: 16, fontWeight: "500", color: "#111827" },
  switchDesc: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  modalContent: { padding: 16 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  modalBody: { marginBottom: 16 },
  field: { marginBottom: 16 },
  modalFooter: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
});