import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuthenticatedApi, useSession } from "@/platform/auth/session-provider";

import { ScreenContainer, SafeScrollView, SectionHeader, EmptyState, LoadingState, ErrorState, StatusBadge, PullToRefresh, PressableCard, RNView, RNText, Divider } from "../shared/heroui-ui";
import { Card, Text, ListGroup } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { formatDistanceToNow } from "date-fns";

const DOCUMENT_ICONS: Record<string, string> = {
  pdf: "document-text",
  doc: "document",
  docx: "document",
  xls: "table",
  xlsx: "table",
  ppt: "easel",
  pptx: "easel",
  jpg: "image",
  jpeg: "image",
  png: "image",
  default: "document",
};

export function DocumentsScreen() {
  const router = useRouter();
  const runAuthenticated = useAuthenticatedApi();
  const { state } = useSession();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const result = await runAuthenticated((api, token) => api.listDocuments(token));
      setDocuments(result.documents || []);
    } catch (err: any) {
      setError(err.message || "Failed to load documents");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleRefresh = () => fetchDocuments(true);

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    return DOCUMENT_ICONS[ext] || DOCUMENT_ICONS.default;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderDocument = (doc: any) => (
    <PressableCard onPress={() => doc.url && router.push(doc.url)} style={styles.docCard}>
      <Card>
        <RNView style={styles.docHeader}>
          <RNView style={styles.docIcon}>
            <Ionicons name="document" size={28} color="#E86C00" />
          </RNView>
          <RNView style={styles.docTitleContent}>
            <Text style={styles.docTitle}>{doc.name}</Text>
            <RNView style={styles.docMeta}>
              <Text style={styles.docMetaText}>{doc.category || "General"}</Text>
              <Text style={styles.docMetaText}>{formatFileSize(doc.size || 0)}</Text>
              <Text style={styles.docMetaText}>{formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}</Text>
            </RNView>
          </RNView>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </RNView>
      </Card>
    </PressableCard>
  );

  if (loading) return <ScreenContainer><LoadingState /></ScreenContainer>;
  if (error) return <ScreenContainer><ErrorState message={error} onRetry={fetchDocuments} /></ScreenContainer>;

  return (
    <ScreenContainer>
      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
        <SafeScrollView>
          <RNView style={styles.header}>
            <RNView style={styles.headerContent}>
              <Text style={styles.pageTitle}>Documents</Text>
            </RNView>
          </RNView>
          {documents.length === 0 ? (
            <EmptyState
              icon="folder"
              title="No documents"
              description="Your society hasn't shared any documents yet."
            />
          ) : (
            <ListGroup style={styles.list}>
              {documents.map((doc) => (
                <ListGroup.Item key={doc.id} style={styles.listItem}>
                  {renderDocument(doc)}
                </ListGroup.Item>
              ))}
            </ListGroup>
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
  docCard: { marginHorizontal: 16, marginBottom: 8, borderRadius: 12 },
  docHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  docIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: "#FEF3C7", alignItems: "center", justifyContent: "center" },
  docTitleContent: { flex: 1 },
  docTitle: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 4 },
  docMeta: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  docMetaText: { fontSize: 12, color: "#9CA3AF" },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  listItem: { borderWidth: 0, backgroundColor: "transparent" },
});