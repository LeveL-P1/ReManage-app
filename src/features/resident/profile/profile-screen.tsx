import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuthenticatedApi, useSession } from "@/platform/auth/session-provider";
import { Alert } from "react-native";

import { ScreenContainer, SafeScrollView, SectionHeader, EmptyState, LoadingState, ErrorState, PullToRefresh, PressableCard, RNView, RNText, Divider, Chip, ConfirmDialog } from "../shared/heroui-ui";
import { Card, Text, ListGroup, Button, Avatar } from "heroui-native";
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
  if (!profile) return <ScreenContainer><EmptyState icon="person" title="Profile not found" description="Unable to load your profile." /></ScreenContainer>;

  return (
    <ScreenContainer>
      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
        <SafeScrollView>
          <RNView style={styles.header}>
            <RNView style={styles.profileHeader}>
              <Avatar size="lg" />
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
              <Ionicons name="create" size={18} />
              <Text>Edit</Text>
            </Button>
          </RNView>

          <SectionHeader title="Contact Information" />
          <ListGroup style={styles.list}>
            <ListGroup.Item style={styles.listItem}>
              <RNView style={styles.infoRow}>
                <RNView style={styles.infoIcon}><Ionicons name="call" size={20} color="#E86C00" /></RNView>
                <RNView style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{profile.phone || "Not set"}</Text>
                </RNView>
              </RNView>
            </ListGroup.Item>
            <ListGroup.Item style={styles.listItem}>
              <RNView style={styles.infoRow}>
                <RNView style={styles.infoIcon}><Ionicons name="mail" size={20} color="#E86C00" /></RNView>
                <RNView style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{profile.email || "Not set"}</Text>
                </RNView>
              </RNView>
            </ListGroup.Item>
            <ListGroup.Item style={styles.listItem}>
              <RNView style={styles.infoRow}>
                <RNView style={styles.infoIcon}><Ionicons name="person" size={20} color="#E86C00" /></RNView>
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
                <Button variant="outline" size="sm" onPress={() => setFormData(prev => ({ ...prev, showPhoneInDirectory: !prev.showPhoneInDirectory }))}>
                  {profile.showPhoneInDirectory ? "On" : "Off"}
                </Button>
              </RNView>
            </ListGroup.Item>
            <ListGroup.Item style={styles.listItem}>
              <RNView style={styles.switchRow}>
                <RNView style={styles.switchContent}>
                  <Text style={styles.switchLabel}>Show Email in Directory</Text>
                  <Text style={styles.switchDesc}>Allow other residents to see your email address</Text>
                </RNView>
                <Button variant="outline" size="sm" onPress={() => setFormData(prev => ({ ...prev, showEmailInDirectory: !prev.showEmailInDirectory }))}>
                  {profile.showEmailInDirectory ? "On" : "Off"}
                </Button>
              </RNView>
            </ListGroup.Item>
          </ListGroup>

          <SectionHeader title="Account" />
          <ListGroup style={styles.list}>
            <ListGroup.Item style={styles.listItem}>
              <RNView style={styles.infoRow}>
                <RNView style={styles.infoIcon}><Ionicons name="id-card" size={20} color="#E86C00" /></RNView>
                <RNView style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Resident ID</Text>
                  <Text style={styles.infoValue}>{profile.userId || "—"}</Text>
                </RNView>
              </RNView>
            </ListGroup.Item>
            <ListGroup.Item style={styles.listItem}>
              <RNView style={styles.infoRow}>
                <RNView style={styles.infoIcon}><Ionicons name="calendar" size={20} color="#E86C00" /></RNView>
                <RNView style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Member Since</Text>
                  <Text style={styles.infoValue}>{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}</Text>
                </RNView>
              </RNView>
            </ListGroup.Item>
          </ListGroup>
        </SafeScrollView>
      </PullToRefresh>

      <ConfirmDialog
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onConfirm={handleSave}
        title="Edit Profile"
        message="Update your profile information below."
        confirmText="Save Changes"
        variant="primary"
      />
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
});