import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuthenticatedApi, useSession } from "@/platform/auth/session-provider";
import { Alert } from "react-native";

import { ScreenContainer, SafeScrollView, SectionHeader, EmptyState, LoadingState, ErrorState, StatusBadge, PullToRefresh, PressableCard, RNView, RNText } from "../shared/heroui-ui";
import { Card, Text, Divider, Button, ListGroup, Modal, TextField, TextArea, Select, Image, Badge } from "heroui-native";
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
      active: { color: "active", label: "Available" },
      sold: { color: "completed", label: "Sold" },
      reserved: { color: "pending", label: "Reserved" },
    };
    const config = statusConfig[listing.status as keyof typeof statusConfig] || { color: "secondary", label: listing.status };

    return (
      <PressableCard style={styles.listingCard}>
        <Card>
          {listing.images && listing.images.length > 0 && (
            <Image source={{ uri: listing.images[0] }} style={styles.listingImage} resizeMode="cover" />
          )}
          <RNView style={styles.listingContent}>
            <RNView style={styles.listingHeader}>
              <RNView style={styles.listingTitleRow}>
                <Text style={styles.listingTitle}>{listing.title}</Text>
                <StatusBadge status={listing.status as any} />
              </RNView>
              {listing.price && (
                <Text style={styles.listingPrice}>₹{Number(listing.price).toLocaleString("en-IN")}</Text>
              )}
            </RNView>
            {listing.description && <Text style={styles.listingDescription} numberOfLines={2}>{listing.description}</Text>}
            <RNView style={styles.listingMeta}>
              <RNView style={styles.metaItem}>
                <Ionicons name="tag-outline" size={14} color="#9CA3AF" />
                <Text style={styles.metaText}>{listing.category}</Text>
              </RNView>
              <RNView style={styles.metaItem}>
                <Ionicons name="refresh-outline" size={14} color="#9CA3AF" />
                <Text style={styles.metaText}>{listing.condition.replace("_", " ")}</Text>
              </RNView>
              <RNView style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                <Text style={styles.metaText}>{formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}</Text>
              </RNView>
            </RNView>
            {listing.contactPhone && !isOwner && (
              <Button variant="outline" size="sm" style={styles.contactButton} onPress={() => setShowInterestModal({ listing })}>
                <Ionicons name="chatbubble-outline" size={16} />
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
              icon="storefront-outline"
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

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} size="lg">
        <RNView style={styles.modalContent}>
          <RNView style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Listing</Text>
            <Button variant="ghost" size="sm" onPress={() => setShowCreateModal(false)}>
              <Ionicons name="close" size={24} />
            </Button>
          </RNView>
          <RNView style={styles.modalBody}>
            <RNView style={styles.field}>
              <Label>Title *</Label>
              <TextField
                placeholder="Item title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target?.value || e }))}
              />
            </RNView>
            <RNView style={styles.field}>
              <Label>Description</Label>
              <TextArea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target?.value || e }))}
              />
            </RNView>
            <RNView style={styles.priceRow}>
              <RNView style={styles.field}>
                <Label>Price (₹) *</Label>
                <TextField
                  placeholder="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target?.value || e }))}
                  keyboardType="numeric"
                />
              </RNView>
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
              <Label>Condition</Label>
              <Select
                value={formData.condition}
                onChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
                options={CONDITIONS.map(c => ({ label: c.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()), value: c }))}
              />
            </RNView>
            <RNView style={styles.field}>
              <Label>Contact Phone</Label>
              <TextField
                placeholder="Your phone number"
                value={formData.contactPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target?.value || e }))}
                keyboardType="phone-pad"
              />
            </RNView>
          </RNView>
          <RNView style={styles.modalFooter}>
            <Button variant="ghost" onPress={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="primary" onPress={handleCreate} isDisabled={submitting}>
              {submitting ? "Creating..." : "Create Listing"}
            </Button>
          </RNView>
        </RNView>
      </Modal>

      {showInterestModal && (
        <Modal isOpen={true} onClose={() => { setShowInterestModal(null); setInterestMessage(""); }} size="md">
          <RNView style={styles.modalContent}>
            <RNView style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Contact Seller</Text>
              <Button variant="ghost" size="sm" onPress={() => { setShowInterestModal(null); setInterestMessage(""); }}>
                <Ionicons name="close" size={24} />
              </Button>
            </RNView>
            <RNView style={styles.modalBody}>
              <Text style={styles.interestPrompt}>Interested in "{showInterestModal.listing.title}"</Text>
              <Text style={styles.interestPrice}>₹{Number(showInterestModal.listing.price).toLocaleString("en-IN")}</Text>
              <RNView style={styles.field}>
                <Label>Message to Seller *</Label>
                <TextArea
                  placeholder="Hi, I'm interested in your item..."
                  value={interestMessage}
                  onChange={(e) => setInterestMessage(e.target?.value || e)}
                />
              </RNView>
            </RNView>
            <RNView style={styles.modalFooter}>
              <Button variant="ghost" onPress={() => { setShowInterestModal(null); setInterestMessage(""); }}>Cancel</Button>
              <Button variant="primary" onPress={() => handleInterest(showInterestModal.listing.id)} isDisabled={submitting || !interestMessage.trim()}>
                {submitting ? "Sending..." : "Send Interest"}
              </Button>
            </RNView>
          </RNView>
        </Modal>
      )}

      {showTransitionModal && (
        <Modal isOpen={true} onClose={() => setShowTransitionModal(null)} size="md">
          <RNView style={styles.modalContent}>
            <RNView style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Listing</Text>
              <Button variant="ghost" size="sm" onPress={() => setShowTransitionModal(null)}>
                <Ionicons name="close" size={24} />
              </Button>
            </RNView>
            <RNView style={styles.modalBody}>
              <Text style={styles.transitionPrompt}>Change status for "{showTransitionModal.listing.title}"</Text>
              <RNView style={styles.transitionOptions}>
                <Button variant={showTransitionModal.listing.status === "reserved" ? "primary" : "outline"} onPress={() => handleTransition(showTransitionModal.listing.id, "reserved")}>
                  <Ionicons name="lock-closed-outline" size={18} />
                  <Text>Mark Reserved</Text>
                </Button>
                <Button variant={showTransitionModal.listing.status === "sold" ? "primary" : "outline"} onPress={() => handleTransition(showTransitionModal.listing.id, "sold")}>
                  <Ionicons name="checkmark-circle-outline" size={18} />
                  <Text>Mark Sold</Text>
                </Button>
                <Button variant={showTransitionModal.listing.status === "active" ? "primary" : "outline"} onPress={() => handleTransition(showTransitionModal.listing.id, "active")}>
                  <Ionicons name="refresh-outline" size={18} />
                  <Text>Relist</Text>
                </Button>
              </RNView>
            </RNView>
            <RNView style={styles.modalFooter}>
              <Button variant="ghost" onPress={() => setShowTransitionModal(null)}>Cancel</Button>
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
  listingCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 12, overflow: "hidden" },
  listingImage: { width: "100%", height: 180 },
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
  modalContent: { padding: 16 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  modalBody: { marginBottom: 16 },
  field: { marginBottom: 16 },
  priceRow: { flexDirection: "row", gap: 12 },
  modalFooter: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  interestPrompt: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 4 },
  interestPrice: { fontSize: 18, fontWeight: "700", color: "#E86C00", marginBottom: 16 },
  transitionPrompt: { fontSize: 14, color: "#6B7280", marginBottom: 16 },
  transitionOptions: { flexDirection: "column", gap: 8 },
});