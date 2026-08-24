import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuthenticatedApi, useSession } from "@/platform/auth/session-provider";
import { Alert } from "react-native";

import { ScreenContainer, SafeScrollView, SectionHeader, EmptyState, LoadingState, ErrorState, StatusBadge, PullToRefresh, ConfirmDialog, PressableCard, RNView, RNText } from "../shared/heroui-ui";
import { Card, Text, Divider, Button, ListGroup, Modal, TextField, TextArea, Select, DatePicker, TimePicker } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { formatDistanceToNow } from "date-fns";

export function AmenitiesScreen() {
  const router = useRouter();
  const runAuthenticated = useAuthenticatedApi();
  const { state } = useSession();
  const [amenities, setAmenities] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBookModal, setShowBookModal] = useState<{ amenity: any } | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState<string | null>(null);
  const [bookingForm, setBookingForm] = useState({ date: "", startTime: "", endTime: "", purpose: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const [amenityResult, bookingResult] = await Promise.all([
        runAuthenticated((api, token) => api.listAmenities(token)),
        runAuthenticated((api, token) => api.listAmenityBookings(token)),
      ]);
      setAmenities(amenityResult.amenities || []);
      setBookings(bookingResult.bookings || []);
    } catch (err: any) {
      setError(err.message || "Failed to load amenities");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => fetchData(true);

  const handleBook = async (amenity: any) => {
    if (!bookingForm.date || !bookingForm.startTime || !bookingForm.endTime) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      await runAuthenticated((api, token) => api.createAmenityBooking(token, {
        amenityId: amenity.id,
        date: bookingForm.date,
        startTime: bookingForm.startTime,
        endTime: bookingForm.endTime,
        purpose: bookingForm.purpose,
      }));
      setShowBookModal(null);
      setBookingForm({ date: "", startTime: "", endTime: "", purpose: "" });
      fetchData();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to book amenity");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    setShowCancelDialog(bookingId);
  };

  const confirmCancel = async (bookingId: string) => {
    try {
      await runAuthenticated((api, token) => api.cancelAmenityBooking(token, bookingId));
      setShowCancelDialog(null);
      fetchData();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to cancel booking");
    }
  };

  const renderAmenity = (amenity: any) => {
    const isAvailable = amenity.status === "available";
    const hasActiveBooking = bookings.some(b => b.amenityId === amenity.id && b.status === "confirmed" && new Date(b.date) >= new Date());

    return (
      <PressableCard style={styles.amenityCard}>
        <Card>
          <RNView style={styles.amenityHeader}>
            <RNView style={styles.amenityIcon}>
              <Ionicons name="home-outline" size={28} color="#E86C00" />
            </RNView>
            <RNView style={styles.amenityTitleContent}>
              <RNView style={styles.amenityTitleRow}>
                <Text style={styles.amenityTitle}>{amenity.name}</Text>
                <StatusBadge status={isAvailable ? "active" : "cancelled"} />
              </RNView>
              {amenity.description && <Text style={styles.amenityDescription}>{amenity.description}</Text>}
              <RNView style={styles.amenityMeta}>
                {amenity.capacity && (
                  <RNView style={styles.metaItem}>
                    <Ionicons name="people-outline" size={14} color="#9CA3AF" />
                    <Text style={styles.metaText}>Capacity: {amenity.capacity}</Text>
                  </RNView>
                )}
                {amenity.location && (
                  <RNView style={styles.metaItem}>
                    <Ionicons name="location-outline" size={14} color="#9CA3AF" />
                    <Text style={styles.metaText}>{amenity.location}</Text>
                  </RNView>
                )}
              </RNView>
            </RNView>
          </RNView>
          <Divider style={styles.divider} />
          <RNView style={styles.amenityActions}>
            <Button variant="primary" size="sm" onPress={() => { setBookingForm({ date: "", startTime: "", endTime: "", purpose: "" }); setShowBookModal(amenity); }} isDisabled={!isAvailable || hasActiveBooking}>
              {hasActiveBooking ? "Booked" : isAvailable ? "Book Now" : "Unavailable"}
            </Button>
          </RNView>
        </Card>
      </PressableCard>
    );
  };

  const renderBooking = (booking: any) => {
    const isUpcoming = new Date(booking.date) >= new Date();
    const statusConfig = {
      confirmed: { color: "active", label: "Confirmed" },
      pending: { color: "pending", label: "Pending" },
      cancelled: { color: "cancelled", label: "Cancelled" },
    };
    const config = statusConfig[booking.status as keyof typeof statusConfig] || { color: "secondary", label: booking.status };

    return (
      <PressableCard style={styles.bookingCard}>
        <Card>
          <RNView style={styles.bookingHeader}>
            <RNView style={styles.bookingTitleContent}>
              <Text style={styles.bookingTitle}>{booking.amenityName || "Amenity"}</Text>
              <Text style={styles.bookingTime}>{new Date(booking.date).toLocaleDateString()} · {booking.startTime} - {booking.endTime}</Text>
            </RNView>
            <StatusBadge status={booking.status as any} />
          </RNView>
          {booking.purpose && (
            <>
              <Divider style={styles.divider} />
              <Text style={styles.bookingPurpose}>{booking.purpose}</Text>
            </>
          )}
          {isUpcoming && booking.status === "confirmed" && (
            <RNView style={styles.bookingActions}>
              <Button variant="outline" size="sm" onPress={() => handleCancel(booking.id)}>Cancel</Button>
            </RNView>
          )}
        </Card>
      </PressableCard>
    );
  };

  if (loading) return <ScreenContainer><LoadingState /></ScreenContainer>;
  if (error) return <ScreenContainer><ErrorState message={error} onRetry={fetchData} /></ScreenContainer>;

  const upcomingBookings = bookings.filter(b => new Date(b.date) >= new Date() && b.status === "confirmed");
  const pastBookings = bookings.filter(b => new Date(b.date) < new Date() || b.status !== "confirmed");

  return (
    <ScreenContainer>
      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
        <SafeScrollView>
          <RNView style={styles.header}>
            <RNView style={styles.headerContent}>
              <Text style={styles.pageTitle}>Amenities</Text>
            </RNView>
          </RNView>
          {amenities.length === 0 ? (
            <EmptyState
              icon="home-outline"
              title="No amenities"
              description="Your society doesn't have any bookable amenities configured."
            />
          ) : (
            <>
              <SectionHeader title="Available Amenities" />
              <ListGroup style={styles.list}>
                {amenities.map((amenity) => (
                  <ListGroup.Item key={amenity.id} style={styles.listItem}>
                    {renderAmenity(amenity)}
                  </ListGroup.Item>
                ))}
              </ListGroup>

              {(upcomingBookings.length > 0 || pastBookings.length > 0) && (
                <SectionHeader title="My Bookings" />
              )}

              {upcomingBookings.length > 0 && (
                <RNView style={styles.section}>
                  <Text style={styles.subSectionTitle}>Upcoming</Text>
                  <ListGroup style={styles.list}>
                    {upcomingBookings.map((booking) => (
                      <ListGroup.Item key={booking.id} style={styles.listItem}>
                        {renderBooking(booking)}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </RNView>
              )}

              {pastBookings.length > 0 && (
                <RNView style={styles.section}>
                  <Text style={styles.subSectionTitle}>Past</Text>
                  <ListGroup style={styles.list}>
                    {pastBookings.map((booking) => (
                      <ListGroup.Item key={booking.id} style={styles.listItem}>
                        {renderBooking(booking)}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </RNView>
              )}
            </>
          )}
        </SafeScrollView>
      </PullToRefresh>

      {showBookModal && (
        <Modal isOpen={true} onClose={() => setShowBookModal(null)} size="lg">
          <RNView style={styles.modalContent}>
            <RNView style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book {showBookModal.amenity.name}</Text>
              <Button variant="ghost" size="sm" onPress={() => setShowBookModal(null)}>
                <Ionicons name="close" size={24} />
              </Button>
            </RNView>
            <RNView style={styles.modalBody}>
              <RNView style={styles.field}>
                <Label>Date *</Label>
                <DatePicker
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target?.value || e }))}
                  minDate={new Date().toISOString().split("T")[0]}
                />
              </RNView>
              <RNView style={styles.timeRow}>
                <RNView style={styles.field}>
                  <Label>Start Time *</Label>
                  <TimePicker
                    value={bookingForm.startTime}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, startTime: e.target?.value || e }))}
                  />
                </RNView>
                <RNView style={styles.field}>
                  <Label>End Time *</Label>
                  <TimePicker
                    value={bookingForm.endTime}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, endTime: e.target?.value || e }))}
                  />
                </RNView>
              </RNView>
              <RNView style={styles.field}>
                <Label>Purpose</Label>
                <TextArea
                  placeholder="Reason for booking"
                  value={bookingForm.purpose}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, purpose: e.target?.value || e }))}
                />
              </RNView>
            </RNView>
            <RNView style={styles.modalFooter}>
              <Button variant="ghost" onPress={() => setShowBookModal(null)}>Cancel</Button>
              <Button variant="primary" onPress={() => handleBook(showBookModal.amenity)} isDisabled={submitting}>
                {submitting ? "Booking..." : "Confirm Booking"}
              </Button>
            </RNView>
          </RNView>
        </Modal>
      )}

      {showCancelDialog && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setShowCancelDialog(null)}
          onConfirm={() => confirmCancel(showCancelDialog!)}
          title="Cancel Booking"
          message="Are you sure you want to cancel this booking?"
          confirmText="Yes, Cancel"
          variant="danger"
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pageTitle: { fontSize: 24, fontWeight: "700", color: "#111827" },
  amenityCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 12 },
  amenityHeader: { flexDirection: "row", gap: 12, marginBottom: 8 },
  amenityIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: "#FEF3C7", alignItems: "center", justifyContent: "center" },
  amenityTitleContent: { flex: 1 },
  amenityTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  amenityTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },
  amenityDescription: { fontSize: 14, color: "#6B7280", marginBottom: 8 },
  amenityMeta: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: "#6B7280" },
  divider: { marginVertical: 8 },
  amenityActions: { paddingTop: 8 },
  bookingCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 12 },
  bookingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  bookingTitleContent: { flex: 1 },
  bookingTitle: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 4 },
  bookingTime: { fontSize: 13, color: "#6B7280" },
  bookingPurpose: { fontSize: 13, color: "#6B7280", lineHeight: 18 },
  bookingActions: { paddingTop: 8, borderTopWidth: 1, borderTopColor: "#E5E7EB" },
  section: { marginBottom: 16 },
  subSectionTitle: { fontSize: 16, fontWeight: "600", color: "#111827", marginHorizontal: 16, marginBottom: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  listItem: { borderWidth: 0, backgroundColor: "transparent" },
  modalContent: { padding: 16 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  modalBody: { marginBottom: 16 },
  field: { marginBottom: 16 },
  timeRow: { flexDirection: "row", gap: 12 },
  modalFooter: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
});