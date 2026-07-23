import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { useSession } from "@/platform/auth/session-provider";
import { residentTheme } from "@/platform/theme/tokens";
import { ResidentIcon } from "@/features/resident/shared/resident-icon";
import {
  ResidentActionGrid,
  ResidentActionTile,
  ResidentSectionHeader,
  ResidentSocietyHeader,
} from "@/features/resident/shared/resident-ui";
import {
  canUseResidentHomeFeature,
  getResidentHomeFeature,
  residentHomeQuickActionIds,
  type ResidentHomeFeatureId,
} from "./resident-home-feature-catalog";
import { residentHomeFixture, type ResidentHomeViewModel } from "./resident-home-fixtures";

function pushHomeFeature(router: ReturnType<typeof useRouter>, id: ResidentHomeFeatureId) {
  router.push(getResidentHomeFeature(id).route as never);
}

export function ResidentHomeScreen({
  viewModel = residentHomeFixture,
}: {
  viewModel?: ResidentHomeViewModel;
}) {
  const router = useRouter();
  const { state } = useSession();
  const bootstrap = state.status === "authenticated" ? state.bootstrap : null;
  const quickActions = useMemo(
    () => residentHomeQuickActionIds
      .map(getResidentHomeFeature)
      .filter((feature) => canUseResidentHomeFeature(feature, bootstrap?.permissions ?? [])),
    [bootstrap?.permissions],
  );

  return (
    <View style={styles.screen}>
      <ResidentSocietyHeader
        unit={viewModel.unit}
        societyName={bootstrap?.society.name ?? "Your society"}
        onSearch={() => pushHomeFeature(router, "search")}
        onNotifications={() => pushHomeFeature(router, "notifications")}
        onProfile={() => pushHomeFeature(router, "profile")}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <ResidentSectionHeader
            actionLabel="Customise"
            onAction={() => pushHomeFeature(router, "customise")}
            title="Quick Actions"
          />
          <ResidentActionGrid>
            {quickActions.map((feature) => (
              <ResidentActionTile
                columns={4}
                icon={feature.icon}
                key={feature.id}
                label={feature.title}
                onPress={() => pushHomeFeature(router, feature.id)}
              />
            ))}
          </ResidentActionGrid>

          <View style={styles.updateSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.updateHeader}>
              <Text style={styles.updateTitle}>You have no new updates</Text>
            </View>
            <View style={styles.entryCard}>
              <View style={styles.entryCardHeader}>
                <Text style={styles.entryTitle}>Today’s Entry Updates</Text>
                <Pressable
                  accessibilityLabel="View all entry updates"
                  accessibilityRole="button"
                  onPress={() => pushHomeFeature(router, "entry-updates")}
                  style={styles.entryViewAll}
                >
                  <Text style={styles.entryViewAllText}>View All</Text>
                  <Ionicons color={residentTheme.icon} name="chevron-forward" size={18} />
                </Pressable>
              </View>
              <View style={styles.entryBody}>
                <View style={styles.entryActions}>
                  {viewModel.entryUpdates.map((entry) => (
                    <Pressable
                      accessibilityLabel={entry.label}
                      accessibilityRole="button"
                      key={entry.id}
                      onPress={() => pushHomeFeature(router, entry.featureId)}
                      style={({ pressed }) => [styles.entryAction, pressed && styles.pressed]}
                    >
                      <View style={styles.entryIcon}>
                        <ResidentIcon color={residentTheme.icon} name={entry.icon} size={23} />
                        {entry.featureId !== "order-now" ? <View style={styles.plusBadge}><Ionicons color={residentTheme.surface} name="add" size={13} /></View> : null}
                      </View>
                      <Text numberOfLines={2} style={styles.entryActionLabel}>{entry.label}</Text>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.entryDivider} />
                <Text style={styles.entryEmptyText}>You don&apos;t have any{`\n`}upcoming visitors.</Text>
              </View>
            </View>
          </View>

          <View style={styles.postsHeading}>
            <Text accessibilityRole="header" style={styles.postsTitle}>Community Posts</Text>
            <Pressable
              accessibilityLabel="New Post"
              accessibilityRole="button"
              onPress={() => pushHomeFeature(router, "new-post")}
              style={({ pressed }) => [styles.newPostButton, pressed && styles.pressed]}
            >
              <Ionicons color={residentTheme.icon} name="create-outline" size={22} />
              <Text style={styles.newPostText}>New Post</Text>
            </Pressable>
          </View>
          <View style={styles.postList}>
            {viewModel.posts.map((post) => (
              <Pressable
                accessibilityLabel={`Open ${post.author} post`}
                accessibilityRole="button"
                key={post.id}
                onPress={() => pushHomeFeature(router, "community-posts")}
                style={({ pressed }) => [styles.postCard, pressed && styles.pressed]}
              >
                <View style={styles.postAuthorRow}>
                  <View style={styles.avatar}><Text style={styles.avatarText}>{post.initials}</Text></View>
                  <View style={styles.postAuthorCopy}>
                    <Text style={styles.postAuthor}>{post.author}</Text>
                    <Text style={styles.postMeta}>{post.unit} · {post.when} · <Ionicons color={residentTheme.muted} name="lock-closed" size={12} /></Text>
                  </View>
                  <Ionicons color={residentTheme.ink} name="ellipsis-vertical" size={20} />
                </View>
                <Text style={styles.postBody}>{post.body}</Text>
                <View style={styles.thoughtBox}>
                  <Text style={styles.thoughtText}>Add your thoughts…</Text>
                  <Ionicons color={residentTheme.muted} name="send-outline" size={23} />
                </View>
                <View style={styles.postFooter}>
                  <View style={styles.postFooterLeft}>
                    <Ionicons color={residentTheme.ink} name="thumbs-up-outline" size={24} />
                    <Ionicons color={residentTheme.ink} name="arrow-redo-outline" size={24} />
                  </View>
                  <View style={styles.postFooterRight}>
                    <Ionicons color={residentTheme.muted} name="eye-outline" size={19} />
                    <Text style={styles.postMetric}>{post.views}</Text>
                    <Ionicons color="#2E9BE8" name="thumbs-up" size={18} />
                    <Text style={styles.postMetric}>{post.reactions}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>

          <View style={styles.caughtUp}>
            <View style={styles.caughtUpIllustration}>
              <View style={styles.paperShadow} />
              <View style={styles.paper}>
                <Ionicons color={residentTheme.icon} name="checkmark" size={56} />
              </View>
              <View style={styles.illustrationHand} />
            </View>
            <Text style={styles.caughtUpTitle}>You are all caught up!</Text>
            <Text style={styles.caughtUpCopy}>You’ve seen all posts from the last two months.</Text>
            <Pressable
              accessibilityLabel="View Older Posts"
              accessibilityRole="button"
              onPress={() => pushHomeFeature(router, "older-posts")}
              style={({ pressed }) => [styles.olderPostsButton, pressed && styles.pressed]}
            >
              <Text style={styles.olderPostsText}>View Older Posts</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: residentTheme.canvas },
  scrollContent: { paddingBottom: 116 },
  content: { paddingHorizontal: 16 },
  updateSheet: { marginTop: 24, marginHorizontal: -16, paddingTop: 10, paddingHorizontal: 16, paddingBottom: 16, borderTopLeftRadius: 26, borderTopRightRadius: 26, backgroundColor: "#E8E4DD" },
  sheetHandle: { alignSelf: "center", width: 48, height: 5, borderRadius: 3, backgroundColor: "#A7A49E" },
  updateHeader: { paddingHorizontal: 12, paddingTop: 19, paddingBottom: 17 },
  updateTitle: { color: residentTheme.ink, fontSize: 22, lineHeight: 28, fontWeight: "500" },
  entryCard: { padding: 18, borderRadius: 21, backgroundColor: residentTheme.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: residentTheme.border },
  entryCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  entryTitle: { flex: 1, color: residentTheme.ink, fontSize: 18, lineHeight: 24, fontWeight: "700" },
  entryViewAll: { flexDirection: "row", alignItems: "center", marginLeft: 8 },
  entryViewAllText: { color: residentTheme.icon, fontSize: 16, fontWeight: "700" },
  entryBody: { flexDirection: "row", alignItems: "center", marginTop: 20 },
  entryActions: { flex: 1, flexDirection: "row", justifyContent: "space-between", gap: 5 },
  entryAction: { width: "31%", alignItems: "center" },
  entryIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#EFF1EE", alignItems: "center", justifyContent: "center" },
  plusBadge: { position: "absolute", top: -3, right: -3, width: 21, height: 21, borderRadius: 11, backgroundColor: residentTheme.icon, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: residentTheme.surface },
  entryActionLabel: { color: residentTheme.ink, fontSize: 12, lineHeight: 16, textAlign: "center", marginTop: 8 },
  entryDivider: { width: StyleSheet.hairlineWidth, height: 76, marginHorizontal: 12, backgroundColor: residentTheme.border },
  entryEmptyText: { width: 95, color: residentTheme.muted, fontSize: 13, lineHeight: 18 },
  postsHeading: { marginTop: 27, marginBottom: 12, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  postsTitle: { color: residentTheme.ink, fontSize: 22, lineHeight: 28, fontWeight: "700" },
  newPostButton: { height: 44, paddingHorizontal: 15, borderRadius: 22, backgroundColor: residentTheme.surface, flexDirection: "row", alignItems: "center", gap: 7, borderWidth: StyleSheet.hairlineWidth, borderColor: residentTheme.border },
  newPostText: { color: residentTheme.icon, fontSize: 16, fontWeight: "700" },
  postList: { gap: 14 },
  postCard: { padding: 18, borderRadius: 23, backgroundColor: residentTheme.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: residentTheme.border },
  postAuthorRow: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 43, height: 43, borderRadius: 14, backgroundColor: "#E7DDC9", alignItems: "center", justifyContent: "center" },
  avatarText: { color: residentTheme.icon, fontSize: 14, fontWeight: "800" },
  postAuthorCopy: { flex: 1, marginLeft: 12 },
  postAuthor: { color: residentTheme.ink, fontSize: 17, lineHeight: 21, fontWeight: "700" },
  postMeta: { color: residentTheme.muted, fontSize: 12, lineHeight: 18, marginTop: 2 },
  postBody: { color: residentTheme.ink, fontSize: 16, lineHeight: 23, marginTop: 18 },
  thoughtBox: { height: 55, marginTop: 19, paddingHorizontal: 14, borderRadius: 15, borderWidth: 1, borderColor: "#C7C7C3", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  thoughtText: { color: "#979996", fontSize: 16 },
  postFooter: { marginTop: 19, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  postFooterLeft: { flexDirection: "row", alignItems: "center", gap: 24 },
  postFooterRight: { flexDirection: "row", alignItems: "center", gap: 5 },
  postMetric: { color: residentTheme.muted, fontSize: 14 },
  caughtUp: { alignItems: "center", marginTop: 48, paddingBottom: 22 },
  caughtUpIllustration: { width: 230, height: 174, position: "relative", alignItems: "center", justifyContent: "center" },
  paperShadow: { position: "absolute", width: 128, height: 132, borderRadius: 18, backgroundColor: "#D9DCE3", transform: [{ rotate: "13deg" }, { translateX: -18 }, { translateY: 7 }] },
  paper: { width: 135, height: 138, borderRadius: 19, backgroundColor: residentTheme.surface, borderWidth: 7, borderColor: "#EEF0F4", transform: [{ rotate: "-12deg" }], alignItems: "center", justifyContent: "center" },
  illustrationHand: { position: "absolute", right: 18, bottom: 13, width: 77, height: 47, borderRadius: 28, backgroundColor: "#F1AD7E", transform: [{ rotate: "-28deg" }] },
  caughtUpTitle: { color: residentTheme.ink, fontSize: 23, lineHeight: 30, fontWeight: "700", marginTop: 20 },
  caughtUpCopy: { color: residentTheme.muted, fontSize: 15, lineHeight: 22, textAlign: "center", marginTop: 8 },
  olderPostsButton: { height: 50, marginTop: 20, paddingHorizontal: 24, borderRadius: 15, borderWidth: 2, borderColor: residentTheme.icon, alignItems: "center", justifyContent: "center" },
  olderPostsText: { color: residentTheme.icon, fontSize: 16, fontWeight: "700" },
  pressed: { opacity: 0.74 },
});
