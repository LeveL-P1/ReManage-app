import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { residentTheme } from "@/platform/theme/tokens";
import { ResidentBottomSheet } from "./resident-overlays";

export interface ResidentComment {
  id: string;
  author: string;
  initials: string;
  when: string;
  body: string;
  likes: number;
  pinned?: boolean;
  replies?: readonly ResidentComment[];
}

const quickEmojis = ["❤️", "🙌", "🔥", "👏", "😢", "😍", "😮", "😂"];

export function ResidentCommentsSheet({
  visible,
  postAuthor,
  comments,
  onDismiss,
}: {
  visible: boolean;
  postAuthor: string;
  comments: readonly ResidentComment[];
  onDismiss(): void;
}) {
  const [draft, setDraft] = useState("");

  return (
    <ResidentBottomSheet
      footer={(
        <View style={styles.footer}>
          <View style={styles.emojiRow}>
            {quickEmojis.map((emoji) => (
              <Pressable
                accessibilityLabel={`Add ${emoji}`}
                accessibilityRole="button"
                key={emoji}
                onPress={() => setDraft((value) => `${value}${emoji}`)}
                style={styles.emojiButton}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.inputRow}>
            <View style={styles.userAvatar}><Text style={styles.userInitial}>D</Text></View>
            <TextInput
              accessibilityLabel={`Add a comment for ${postAuthor}`}
              onChangeText={setDraft}
              placeholder={`Add a comment for ${postAuthor}…`}
              placeholderTextColor={residentTheme.muted}
              style={styles.input}
              value={draft}
            />
            <Ionicons color={residentTheme.muted} name="images-outline" size={22} />
          </View>
        </View>
      )}
      onDismiss={onDismiss}
      title="Comments"
      visible={visible}
    >
      {comments.map((comment) => (
        <View key={comment.id}>
          <CommentRow comment={comment} />
          {comment.replies?.map((reply) => (
            <View key={reply.id} style={styles.replyIndent}>
              <CommentRow comment={reply} compact />
            </View>
          ))}
          {comment.replies && comment.replies.length > 1 ? (
            <Pressable accessibilityRole="button" style={styles.moreReplies}>
              <View style={styles.moreLine} />
              <Text style={styles.moreText}>View {comment.replies.length - 1} more replies</Text>
            </Pressable>
          ) : null}
        </View>
      ))}
      <Text style={styles.previewNote}>Comments are a mobile preview only.</Text>
    </ResidentBottomSheet>
  );
}

function CommentRow({ comment, compact = false }: { comment: ResidentComment; compact?: boolean }) {
  return (
    <View style={[styles.commentRow, compact && styles.commentRowCompact]}>
      <View style={styles.commentAvatar}><Text style={styles.commentInitial}>{comment.initials}</Text></View>
      <View style={styles.commentCopy}>
        <View style={styles.commentMeta}>
          <Text style={styles.commentAuthor}>{comment.author}</Text>
          <Text style={styles.commentWhen}>{comment.when}{comment.pinned ? " · Pinned" : ""}</Text>
        </View>
        <Text style={styles.commentBody}>{comment.body}</Text>
        <View style={styles.commentActions}>
          <Text style={styles.commentMetric}>{comment.likes} likes</Text>
          <Pressable accessibilityRole="button"><Text style={styles.commentMetric}>Reply</Text></Pressable>
        </View>
      </View>
      <Ionicons color={residentTheme.muted} name="heart-outline" size={18} />
    </View>
  );
}

const styles = StyleSheet.create({
  commentRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 12 },
  commentRowCompact: { paddingVertical: 8 },
  replyIndent: { marginLeft: 42 },
  commentAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#E7DDC9", alignItems: "center", justifyContent: "center" },
  commentInitial: { color: residentTheme.icon, fontSize: 12, fontWeight: "800" },
  commentCopy: { flex: 1 },
  commentMeta: { flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center" },
  commentAuthor: { color: residentTheme.ink, fontSize: 14, fontWeight: "700" },
  commentWhen: { color: residentTheme.muted, fontSize: 12 },
  commentBody: { color: residentTheme.ink, fontSize: 14, lineHeight: 20, marginTop: 4 },
  commentActions: { flexDirection: "row", gap: 14, marginTop: 8 },
  commentMetric: { color: residentTheme.muted, fontSize: 12, fontWeight: "600" },
  moreReplies: { flexDirection: "row", alignItems: "center", gap: 10, marginLeft: 42, marginBottom: 8 },
  moreLine: { width: 28, height: StyleSheet.hairlineWidth, backgroundColor: residentTheme.border },
  moreText: { color: residentTheme.muted, fontSize: 13, fontWeight: "600" },
  previewNote: { color: residentTheme.muted, fontSize: 12, lineHeight: 18, textAlign: "center", marginVertical: 16 },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: residentTheme.border, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 },
  emojiRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  emojiButton: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 22 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  userAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: residentTheme.icon, alignItems: "center", justifyContent: "center" },
  userInitial: { color: residentTheme.surface, fontSize: 14, fontWeight: "700" },
  input: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: residentTheme.border,
    paddingHorizontal: 14,
    color: residentTheme.ink,
    fontSize: 14,
  },
});
