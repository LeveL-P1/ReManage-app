import { useMemo, useState } from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import {
  ResidentListRow,
  ResidentPopOutHeader,
  ResidentTabBar,
} from "@/features/resident/shared/resident-overlays";
import { residentTheme } from "@/platform/theme/tokens";
import { residentNotificationsFixture, type NotificationTabId } from "./resident-notifications-fixtures";

export function ResidentNotificationsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<NotificationTabId>("neighborhood");
  const sections = useMemo(
    () => residentNotificationsFixture.filter((section) => section.tab === activeTab),
    [activeTab],
  );

  return (
    <View style={styles.screen}>
      <ResidentPopOutHeader backIcon="chevron-back" backLabel="Back" onBack={() => router.back()} title="Notifications" />
      <ResidentTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          { id: "neighborhood", label: "Neighborhood" },
          { id: "activity", label: "My activity" },
          { id: "alerts", label: "Alerts" },
        ]}
        unreadTabs={["activity"]}
      />
      <SectionList
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No notifications in this tab yet.</Text>}
        renderItem={({ item }) => (
          <ResidentListRow
            avatarColor={item.avatarColor}
            avatarLabel={item.initials}
            onPress={() => undefined}
            title={(
              <Text style={styles.rowTitle}>
                <Text style={styles.rowAuthor}>{item.author}</Text>
                {" "}{item.action}
              </Text>
            )}
            trailing={item.when}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        sections={sections}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: residentTheme.surface },
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },
  sectionHeader: { color: residentTheme.muted, fontSize: 13, fontWeight: "700", lineHeight: 18, marginTop: 18, marginBottom: 4 },
  rowTitle: { color: residentTheme.ink, fontSize: 15, lineHeight: 21 },
  rowAuthor: { fontWeight: "700" },
  empty: { color: residentTheme.muted, fontSize: 14, lineHeight: 20, textAlign: "center", marginTop: 40 },
});
