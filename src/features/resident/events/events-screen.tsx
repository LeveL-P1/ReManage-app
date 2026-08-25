import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuthenticatedApi, useSession } from "@/platform/auth/session-provider";
import { Alert } from "react-native";

import { ScreenContainer, SafeScrollView, SectionHeader, EmptyState, LoadingState, ErrorState, StatusBadge, PullToRefresh, PressableCard, RNView, RNText, Divider, Chip } from "../shared/heroui-ui";
import { Card, Text, ListGroup, Button } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { formatDistanceToNow } from "date-fns";

export function EventsScreen() {
  const router = useRouter();
  const runAuthenticated = useAuthenticatedApi();
  const { state } = useSession();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const result = await runAuthenticated((api, token) => api.listEvents(token));
      setEvents(result.events || []);
    } catch (err: any) {
      setError(err.message || "Failed to load events");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRefresh = () => fetchEvents(true);

  const handleRsvp = async (eventId: string, response: "attending" | "maybe" | "declined") => {
    try {
      await runAuthenticated((api, token) => api.rsvpEvent(token, { eventId, response }));
      fetchEvents();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to RSVP");
    }
  };

  const renderEvent = (event: any) => {
    const isUpcoming = new Date(event.startDate) > new Date();
    const hasRsvp = event.userRsvp;
    const rsvpStatus = event.userRsvp;

    return (
      <PressableCard style={styles.eventCard}>
        <Card>
          <RNView style={styles.eventHeader}>
            <RNView style={styles.eventDate}>
              <Text style={styles.eventDay}>{new Date(event.startDate).getDate()}</Text>
              <Text style={styles.eventMonth}>{new Date(event.startDate).toLocaleDateString("en-US", { month: "short" })}</Text>
            </RNView>
            <RNView style={styles.eventTitleContent}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <RNView style={styles.eventMeta}>
                <RNView style={styles.metaItem}>
                  <Ionicons name="time" size={14} color="#9CA3AF" />
                  <Text style={styles.metaText}>{new Date(event.startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {event.endDate ? new Date(event.endDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</Text>
                </RNView>
                {event.location && (
                  <RNView style={styles.metaItem}>
                    <Ionicons name="location" size={14} color="#9CA3AF" />
                    <Text style={styles.metaText}>{event.location}</Text>
                  </RNView>
                )}
              </RNView>
              <RNView style={styles.eventStatus}>
                {hasRsvp && <Chip variant="primary" size="sm">{rsvpStatus}</Chip>}
                {!hasRsvp && isUpcoming && <Chip variant="primary" size="sm">Upcoming</Chip>}
                {!isUpcoming && !hasRsvp && <Chip variant="secondary" size="sm">Ended</Chip>}
              </RNView>
            </RNView>
          </RNView>
          {event.description && (
            <>
              <Divider style={styles.divider} />
              <Text style={styles.eventDescription} numberOfLines={2}>{event.description}</Text>
            </>
          )}
          {isUpcoming && !hasRsvp && (
            <RNView style={styles.eventActions}>
              <Button variant="outline" size="sm" onPress={() => handleRsvp(event.id, "declined")}>Can't Go</Button>
              <Button variant="outline" size="sm" onPress={() => handleRsvp(event.id, "maybe")}>Maybe</Button>
              <Button variant="primary" size="sm" onPress={() => handleRsvp(event.id, "attending")}>Attending</Button>
            </RNView>
          )}
        </Card>
      </PressableCard>
    );
  };

  if (loading) return <ScreenContainer><LoadingState /></ScreenContainer>;
  if (error) return <ScreenContainer><ErrorState message={error} onRetry={fetchEvents} /></ScreenContainer>;

  const upcomingEvents = events.filter(e => new Date(e.startDate) > new Date());
  const pastEvents = events.filter(e => new Date(e.startDate) <= new Date());

  return (
    <ScreenContainer>
      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
        <SafeScrollView>
          <RNView style={styles.header}>
            <RNView style={styles.headerContent}>
              <Text style={styles.pageTitle}>Events</Text>
            </RNView>
          </RNView>
          {events.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="No events"
              description="There are no upcoming events in your society."
            />
          ) : (
            <>
              {upcomingEvents.length > 0 && (
                <RNView style={styles.section}>
                  <SectionHeader title="Upcoming" />
                  <ListGroup style={styles.list}>
                    {upcomingEvents.map((event) => (
                      <ListGroup.Item key={event.id} style={styles.listItem}>
                        {renderEvent(event)}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </RNView>
              )}
              {pastEvents.length > 0 && (
                <RNView style={styles.section}>
                  <SectionHeader title="Past Events" />
                  <ListGroup style={styles.list}>
                    {pastEvents.map((event) => (
                      <ListGroup.Item key={event.id} style={styles.listItem}>
                        {renderEvent(event)}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </RNView>
              )}
            </>
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
  eventCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 12 },
  eventHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  eventDate: { width: 56, height: 56, borderRadius: 12, backgroundColor: "#FEF3C7", alignItems: "center", justifyContent: "center" },
  eventDay: { fontSize: 20, fontWeight: "700", color: "#E86C00" },
  eventMonth: { fontSize: 10, fontWeight: "600", color: "#E86C00", textTransform: "uppercase" },
  eventTitleContent: { flex: 1 },
  eventTitle: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 4 },
  eventMeta: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: "#6B7280" },
  eventStatus: { marginTop: 8 },
  divider: { marginVertical: 8 },
  eventDescription: { fontSize: 14, color: "#6B7280", lineHeight: 20, marginBottom: 8 },
  eventActions: { flexDirection: "row", gap: 8 },
  section: { marginBottom: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  listItem: { borderWidth: 0, backgroundColor: "transparent" },
});