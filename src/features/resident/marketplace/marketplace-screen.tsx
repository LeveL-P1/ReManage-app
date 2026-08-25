import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuthenticatedApi, useSession } from "@/platform/auth/session-provider";
import { Alert } from "react-native";

import { ScreenContainer, SafeScrollView, SectionHeader, EmptyState, LoadingState, ErrorState, StatusBadge, PullToRefresh, ConfirmDialog, PressableCard, RNView, RNText, Divider, Chip } from "../shared/heroui-ui";
import { Card, Text, ListGroup, TextField, TextArea, Select, Button } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { formatDistanceToNow } from "date-fns";

const CATEGORIES = ["Electronics", "Furniture", "Vehicles", "Books", "Clothing", "Appliances", "Sports", "Other"];
const CONDITIONS = ["new", "like_new", "good", "fair", "poor"];

export function MarketplaceScreen() {
  const router = useRouter();
  const runAuthenticated = useAuthenticatedApi();
  const { state } = useSession();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState<{ listing: any } | null>(null);
  const [showTransitionModal, setShowTransitionModal] = useState<{ listing: any } | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "", price: "", category: "Other", condition: "good", contactPhone: "" });
  const [interestMessage, setInterestMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchListings = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const result = await runAuthenticated((api, token) => api.listMarketplaceListings(token));
      setListings(result.listings || []);
    } catch (err: any) {
      setError(err.message || "Failed to load listings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleRefresh = () => fetchListings(true);

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.price) {
      Alert.alert("Error", "Please fill in required fields");
      return;
    }
    setSubmitting(true);
    try {
      await runAuthenticated((api, token) => api.createMarketplaceListing(token, {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition,
        contactPhone: formData.contactPhone,
      }));
      setShowCreateModal(false);
      setFormData({ title: "", description: "", price: "", category: "Other", condition: "good", contactPhone: "" });
      fetchListings();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInterest = async (listingId: string) => {
    if (!interestMessage.trim()) {
      Alert.alert("Error", "Please enter a message");
      return;
    }
    setSubmitting(true);
    try {
      await runAuthenticated((api, token) => api.expressMarketplaceInterest(token, listingId, interestMessage));
      setShowInterestModal(null);
      setInterestMessage("");
      fetchListings();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to express interest");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransition = async (listingId: string, action: "sold" | "reserved" | "active") => {
    try {
      await runAuthenticated((api, token) => api.transitionMarketplaceListing(token, listingId, action));
      setShowTransitionModal(null);
      fetchListings();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update listing");
    }
  };

  const renderListing = (listing: any) => {
    const isOwner = listing.isOwner;
    const statusConfig = {
      active: { color: "primary", label: "Available" },
      sold: { color: "primary", label: "Sold" },
      reserved: { color: "primary", label: "Reserved" },
    };
    const config = statusConfig[listing.status as keyof typeof statusConfig] || { color: "secondary", label: listing.status };

    return (
      <PressableCard style={styles.listingCard}>
        <Card>
          <RNView style={styles.listingContent}>
            <RNView style={styles.listingHeader}>
              <RNView style={styles.listingTitleRow}>
                <Text style={styles.listingTitle}>{listing.title}</Text>
                <Chip variant={listing.status === "active" ? "primary" : listing.status === "sold" ? "primary" : "primary"} size="sm">{config.label}</Chip>
              </RNView>
              {listing.price && (
                <Text style={styles.listingPrice}>₹{Number(listing.price).toLocaleString("en-IN")}</Text>
              )}
            </RNView>
            {listing.description && <Text style={styles.listingDescription} numberOfLines={2}>{listing.description}</Text>}
            <RNView style={styles.listingMeta}>
              <RNView style={styles.metaItem}>
                <Ionicons name="pricetag" size={14} color="#9CA3AF" />
                <Text style={styles.metaText}>{listing.category}</Text>
              </RNView>
              <RNView style={styles.metaItem}>
                <Ionicons name="refresh" size={14} color="#9CA3AF" />
                <Text style={styles.metaText}>{listing.condition.replace("_", " ")}</Text>
              </RNView>
              <RNView style={styles.metaItem}>
                <Ionicons name="time" size={14} color="#9CA3AF" />
                <Text style={styles.metaText}>{formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}</Text>
              </RNView>
            </RNView>
            {listing.contactPhone && !isOwner && (
              <Button variant="outline" size="sm" style={styles.contactButton} onPress={() => setShowInterestModal({ listing })}>
                <Ionicons name="chatbubble" size={16} />
                <Text>Contact Seller</Text>
              </Button>
            )}
            {isOwner && listing.status === "active" && (
              <RNView style={styles.ownerActions}>
                <Button variant="ghost" size="sm" onPress={() => setShowTransitionModal({ listing })}>Mark Reserved</Button>
                <Button variant="ghost" size="sm" onPress={() => handleTransition(listing.id, "sold")}>Mark Sold</Button>
              </RNView>
            )}
          </RNView>
        </Card>
      </PressableCard>
    );
  };

  if (loading) return <ScreenContainer><LoadingState /></ScreenContainer>;
  if (error) return <ScreenContainer><ErrorState message={error} onRetry={fetchListings} /></ScreenContainer>;

  const myListings = listings.filter(l => l.isOwner);
  const otherListings = listings.filter(l => !l.isOwner);

  return (
    <ScreenContainer>
      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
        <SafeScrollView>
          <RNView style={styles.header}>
            <RNView style={styles.headerContent}>
              <Text style={styles.pageTitle}>Marketplace</Text>
              <Button onPress={() => setShowCreateModal(true)}>
                <Ionicons name="add" size={20} />
              </Button>
            </RNView>
          </RNView>
          {listings.length === 0 ? (
            <EmptyState
              icon="storefront"
              title="No listings"
              description="Be the first to list an item for sale in your society."
              action="Create Listing"
              onAction={() => setShowCreateModal(true)}
            />
          ) : (
            <>
              {myListings.length > 0 && (
                <RNView style={styles.section}>
                  <SectionHeader title="My Listings" />
                  <ListGroup style={styles.list}>
                    {myListings.map((listing) => (
                      <ListGroup.Item key={listing.id} style={styles.listItem}>
                        {renderListing(listing)}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </RNView>
              )}
              {otherListings.length > 0 && (
                <RNView style={styles.section}>
                  <SectionHeader title="Available Items" />
                  <ListGroup style={styles.list}>
                    {otherListings.map((listing) => (
                      <ListGroup.Item key={listing.id} style={styles.listItem}>
                        {renderListing(listing)}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </RNView>
              )}
            </>
          )}
        </SafeScrollView>
      </PullToRefresh>

      <ConfirmDialog
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onConfirm={handleCreate}
        title="Create Listing"
        message="Fill in the details to create a new listing."
        confirmText="Create Listing"
        variant="primary"
      />

      {showInterestModal && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => { setShowInterestModal(null); setInterestMessage(""); }}
          onConfirm={() => handleInterest(showInterestModal.listing.id)}
          title="Contact Seller"
          message={`Interested in "${showInterestModal.listing.title}"`}
          confirmText="Send Interest"
          variant="primary"
        />
      )}

      {showTransitionModal && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setShowTransitionModal(null)}
          onConfirm={() => handleTransition(showTransitionModal.listing.id, "sold")}
          title="Update Listing"
          message={`Change status for "${showTransitionModal.listing.title}"`}
          confirmText="Mark Sold"
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
  listingCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 12 },
  listingContent: { padding: 12 },
  listingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  listingTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  listingTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },
  listingPrice: { fontSize: 20, fontWeight: "700", color: "#E86C00", marginTop: 4 },
  listingDescription: { fontSize: 14, color: "#6B7280", lineHeight: 20, marginBottom: 8 },
  listingMeta: { flexDirection: "row", gap: 12, flexWrap: "wrap", marginBottom: 8 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: "#6B7280" },
  contactButton: { width: "100%", marginTop: 8 },
  ownerActions: { flexDirection: "row", gap: 8, marginTop: 8 },
  section: { marginBottom: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  listItem: { borderWidth: 0, backgroundColor: "transparent" },
});