import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ResidentCenteredModal, ResidentPopOutHeader } from "@/features/resident/shared/resident-overlays";
import { useSession } from "@/platform/auth/session-provider";
import { residentTheme } from "@/platform/theme/tokens";
import { residentProfileFixture } from "./resident-profile-fixtures";

export function ResidentProfileScreen() {
  const router = useRouter();
  const { state } = useSession();
  const profile = residentProfileFixture;
  const [editVisible, setEditVisible] = useState(false);
  const societyName = state.status === "authenticated" ? state.bootstrap.society.name : profile.societyName;

  return (
    <View style={styles.screen}>
      <ResidentPopOutHeader backIcon="chevron-back" backLabel="Back" onBack={() => router.back()} title="Profile" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.coverWrap}>
          <View style={styles.coverGradient} />
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{profile.initials}</Text></View>
          </View>
        </View>

        <View style={styles.profileBody}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.bio}>{profile.bio}</Text>
          <View style={styles.locationRow}>
            <Ionicons color={residentTheme.muted} name="location-outline" size={16} />
            <Text style={styles.location}>{societyName}</Text>
          </View>
          <Pressable
            accessibilityLabel="Edit profile"
            accessibilityRole="button"
            onPress={() => setEditVisible(true)}
            style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
          >
            <Text style={styles.editButtonText}>Edit profile</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dashboard</Text>
            <Text style={styles.sectionHint}>Only visible to you</Text>
          </View>
          <View style={styles.dashboardRow}>
            {profile.dashboard.map((item) => (
              <Pressable
                accessibilityLabel={item.label}
                accessibilityRole="button"
                key={item.id}
                style={({ pressed }) => [styles.dashboardCard, pressed && styles.pressed]}
              >
                <Ionicons color={residentTheme.icon} name={item.icon} size={24} />
                <Text style={styles.dashboardLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Faves</Text>
            <Text style={styles.sectionLink}>See all</Text>
          </View>
          <View style={styles.faveCard}>
            <View style={styles.faveThumb}><Ionicons color={residentTheme.icon} name="restaurant-outline" size={22} /></View>
            <View style={styles.faveCopy}>
              <Text style={styles.faveTitle}>{profile.favorite.name}</Text>
              <Text style={styles.faveDetail}>{profile.favorite.detail}</Text>
            </View>
            <View style={styles.favedPill}><Text style={styles.favedText}>Faved</Text></View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Groups</Text>
            <Text style={styles.sectionLink}>See all</Text>
          </View>
          <View style={styles.groupsCard}>
            {profile.groups.map((group, index) => (
              <View key={group.id}>
                {index > 0 ? <View style={styles.groupDivider} /> : null}
                <View style={styles.groupRow}>
                  <View style={styles.groupThumb}><Text style={styles.groupInitial}>{group.initials}</Text></View>
                  <View style={styles.groupCopy}>
                    <Text style={styles.groupTitle}>{group.name}</Text>
                    <Text style={styles.groupDetail}>{group.members} members</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <ResidentCenteredModal
        message="Profile editing is a mobile preview. No live account changes are saved."
        onDismiss={() => setEditVisible(false)}
        onPrimary={() => setEditVisible(false)}
        primaryLabel="Got it"
        title="Edit profile preview"
        visible={editVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F2F4F7" },
  content: { paddingBottom: 40 },
  coverWrap: { height: 150, backgroundColor: "#FFD8BF", position: "relative" },
  coverGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: "#FFB27A" },
  avatarWrap: { position: "absolute", left: 20, bottom: -36 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#D8E2EA", borderWidth: 4, borderColor: residentTheme.surface, alignItems: "center", justifyContent: "center" },
  avatarText: { color: residentTheme.ink, fontSize: 30, fontWeight: "800" },
  profileBody: { backgroundColor: residentTheme.surface, paddingTop: 48, paddingHorizontal: 20, paddingBottom: 20 },
  name: { color: residentTheme.ink, fontSize: 24, fontWeight: "700", lineHeight: 30 },
  bio: { color: residentTheme.muted, fontSize: 15, lineHeight: 22, marginTop: 6 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  location: { color: residentTheme.muted, fontSize: 14, lineHeight: 20 },
  editButton: { alignSelf: "flex-start", marginTop: 16, paddingHorizontal: 22, height: 42, borderRadius: 21, backgroundColor: residentTheme.ink, alignItems: "center", justifyContent: "center" },
  editButtonText: { color: residentTheme.surface, fontSize: 15, fontWeight: "700" },
  section: { paddingHorizontal: 16, marginTop: 18 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { color: residentTheme.ink, fontSize: 18, fontWeight: "700" },
  sectionHint: { color: residentTheme.muted, fontSize: 12 },
  sectionLink: { color: residentTheme.icon, fontSize: 14, fontWeight: "700" },
  dashboardRow: { flexDirection: "row", gap: 10 },
  dashboardCard: { flex: 1, minHeight: 88, borderRadius: 16, backgroundColor: residentTheme.surface, alignItems: "center", justifyContent: "center", gap: 8 },
  dashboardLabel: { color: residentTheme.ink, fontSize: 14, fontWeight: "700" },
  faveCard: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 16, backgroundColor: residentTheme.surface, gap: 12 },
  faveThumb: { width: 48, height: 48, borderRadius: 12, backgroundColor: "#E7DDC9", alignItems: "center", justifyContent: "center" },
  faveCopy: { flex: 1 },
  faveTitle: { color: residentTheme.ink, fontSize: 15, fontWeight: "700" },
  faveDetail: { color: residentTheme.muted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  favedPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: "#E8EEF2" },
  favedText: { color: residentTheme.icon, fontSize: 12, fontWeight: "700" },
  groupsCard: { borderRadius: 16, backgroundColor: residentTheme.surface, overflow: "hidden" },
  groupRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  groupThumb: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#E7DDC9", alignItems: "center", justifyContent: "center" },
  groupInitial: { color: residentTheme.icon, fontSize: 14, fontWeight: "800" },
  groupCopy: { flex: 1 },
  groupTitle: { color: residentTheme.ink, fontSize: 15, fontWeight: "700" },
  groupDetail: { color: residentTheme.muted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  groupDivider: { height: StyleSheet.hairlineWidth, marginLeft: 70, backgroundColor: residentTheme.border },
  pressed: { opacity: 0.74 },
});
