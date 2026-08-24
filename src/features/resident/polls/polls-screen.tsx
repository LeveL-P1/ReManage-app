import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuthenticatedApi, useSession } from "@/platform/auth/session-provider";
import { Alert } from "react-native";

import { ScreenContainer, SafeScrollView, SectionHeader, EmptyState, LoadingState, ErrorState, StatusBadge, PullToRefresh, PressableCard, RNView, RNText } from "./heroui-ui";
import { Card, Text, Divider, Button, ListGroup, Progress } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { formatDistanceToNow } from "date-fns";

export function PollsScreen() {
  const router = useRouter();
  const runAuthenticated = useAuthenticatedApi();
  const { state } = useSession();
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [votingPoll, setVotingPoll] = useState<{ pollId: string; selectedOption: number | null } | null>(null);

  const fetchPolls = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const accessToken = state.status === "authenticated" ? state.tokens?.accessToken : "";
      const result = await runAuthenticated((api, token) => api.listPolls(token));
      setPolls(result.polls || []);
    } catch (err: any) {
      setError(err.message || "Failed to load polls");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const handleRefresh = () => fetchPolls(true);

  const handleVote = async (pollId: string, optionIndex: number) => {
    try {
      const accessToken = state.status === "authenticated" ? state.tokens?.accessToken : "";
      await runAuthenticated((api, token) => api.votePoll(token, pollId, optionIndex));
      setVotingPoll(null);
      fetchPolls();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to vote");
    }
  };

  const renderPoll = (poll: any) => {
    const isActive = poll.status === "active";
    const hasVoted = poll.userVoted;
    const totalVotes = poll.options?.reduce((sum: number, opt: any) => sum + (opt.votes || 0), 0) || 0;
    const userVoteIndex = poll.userVoteIndex;

    const renderOption = (option: any, index: number) => {
      const percentage = totalVotes > 0 ? ((option.votes || 0) / totalVotes) * 100 : 0;
      const isUserVote = hasVoted && userVoteIndex === index;

      return (
        <RNView key={index} style={styles.option}>
          <RNView style={styles.optionHeader}>
            <RNView style={[styles.optionIndicator, isUserVote && styles.optionIndicatorSelected]} />
            <Text style={[styles.optionText, isUserVote && styles.optionTextSelected]}>{option.text}</Text>
          </RNView>
          {hasVoted && (
            <RNView style={styles.optionProgress}>
              <Progress value={percentage} max={100} style={styles.progress} color={isUserVote ? "#E86C00" : "#E5E7EB"} />
              <Text style={styles.optionPercentage}>{percentage.toFixed(0)}%</Text>
            </RNView>
          )}
        </RNView>
      );
    };

    return (
      <PressableCard style={styles.pollCard}>
        <Card>
          <RNView style={styles.pollHeader}>
            <RNView style={styles.pollTitleContent}>
              <RNView style={styles.pollTitleRow}>
                <Text style={styles.pollTitle}>{poll.title}</Text>
                <StatusBadge status={isActive ? "active" : "completed"} />
              </RNView>
              {poll.description && <Text style={styles.pollDescription}>{poll.description}</Text>}
            </RNView>
          </RNView>
          <Divider style={styles.divider} />
          <RNView style={styles.pollOptions}>
            {poll.options?.map((option: any, index: number) => renderOption(option, index))}
          </RNView>
          <Divider style={styles.divider} />
          <RNView style={styles.pollFooter}>
            <RNView style={styles.pollStats}>
              <Text style={styles.pollStat}>{totalVotes} {totalVotes === 1 ? "vote" : "votes"}</Text>
              <Text style={styles.pollStat}>Ends {formatDistanceToNow(new Date(poll.endDate), { addSuffix: true })}</Text>
            </RNView>
            {isActive && !hasVoted && (
              <Button variant="primary" size="sm" onPress={() => setVotingPoll({ pollId: poll.id, selectedOption: null })}>
                Vote
              </Button>
            )}
            {hasVoted && (
              <Button variant="ghost" size="sm" isDisabled>Voted</Button>
            )}
          </RNView>
        </Card>
      </PressableCard>
    );
  };

  if (loading) return <ScreenContainer><LoadingState /></ScreenContainer>;
  if (error) return <ScreenContainer><ErrorState message={error} onRetry={fetchPolls} /></ScreenContainer>;

  const activePolls = polls.filter(p => p.status === "active");
  const closedPolls = polls.filter(p => p.status !== "active");

  return (
    <ScreenContainer>
      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
        <SafeScrollView>
          <RNView style={styles.header}>
            <RNView style={styles.headerContent}>
              <Text style={styles.pageTitle}>Polls</Text>
            </RNView>
          </RNView>
          {polls.length === 0 ? (
            <EmptyState
              icon="bar-chart-outline"
              title="No polls"
              description="There are no active polls in your society."
            />
          ) : (
            <>
              {activePolls.length > 0 && (
                <RNView style={styles.section}>
                  <SectionHeader title="Active Polls" />
                  <ListGroup style={styles.list}>
                    {activePolls.map((poll) => (
                      <ListGroup.Item key={poll.id} style={styles.listItem}>
                        {renderPoll(poll)}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </RNView>
              )}
              {closedPolls.length > 0 && (
                <RNView style={styles.section}>
                  <SectionHeader title="Closed Polls" />
                  <ListGroup style={styles.list}>
                    {closedPolls.map((poll) => (
                      <ListGroup.Item key={poll.id} style={styles.listItem}>
                        {renderPoll(poll)}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </RNView>
              )}
            </>
          )}
        </SafeScrollView>
      </PullToRefresh>

      {votingPoll && (
        <RNView style={styles.voteOverlay}>
          <RNView style={styles.voteModal}>
            <RNView style={styles.voteModalHeader}>
              <Text style={styles.voteModalTitle}>Cast Your Vote</Text>
              <Button variant="ghost" size="sm" onPress={() => setVotingPoll(null)}>
                <Ionicons name="close" size={24} />
              </Button>
            </RNView>
            <RNView style={styles.voteModalBody}>
              {polls.find(p => p.id === votingPoll.pollId)?.options?.map((option: any, index: number) => (
                <Button
                  key={index}
                  variant={votingPoll.selectedOption === index ? "primary" : "outline"}
                  onPress={() => setVotingPoll(prev => prev ? { ...prev, selectedOption: index } : null)}
                  style={styles.voteOption}
                >
                  <Text style={[styles.voteOptionText, votingPoll.selectedOption === index && styles.voteOptionTextSelected]}>{option.text}</Text>
                </Button>
              ))}
            </RNView>
            <RNView style={styles.voteModalFooter}>
              <Button variant="ghost" onPress={() => setVotingPoll(null)}>Cancel</Button>
              <Button
                variant="primary"
                onPress={() => votingPoll.selectedOption !== null && handleVote(votingPoll.pollId, votingPoll.selectedOption)}
                isDisabled={votingPoll.selectedOption === null}
              >
                Submit Vote
              </Button>
            </RNView>
          </RNView>
        </RNView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pageTitle: { fontSize: 24, fontWeight: "700", color: "#111827" },
  pollCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 12 },
  pollHeader: { marginBottom: 8 },
  pollTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  pollTitle: { fontSize: 16, fontWeight: "600", color: "#111827", flex: 1 },
  pollDescription: { fontSize: 14, color: "#6B7280" },
  pollTitleContent: { flex: 1 },
  divider: { marginVertical: 8 },
  pollOptions: { marginBottom: 8 },
  option: { marginBottom: 8 },
  optionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  optionIndicator: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#E5E7EB" },
  optionIndicatorSelected: { borderColor: "#E86C00", backgroundColor: "#E86C00" },
  optionText: { fontSize: 14, color: "#111827", flex: 1 },
  optionTextSelected: { fontWeight: "600", color: "#E86C00" },
  optionProgress: { flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 28 },
  progress: { flex: 1, height: 6 },
  optionPercentage: { fontSize: 12, color: "#9CA3AF", width: 40 },
  pollFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8 },
  pollStats: { flexDirection: "row", gap: 16 },
  pollStat: { fontSize: 12, color: "#9CA3AF" },
  section: { marginBottom: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  listItem: { borderWidth: 0, backgroundColor: "transparent" },
  voteOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 16 },
  voteModal: { backgroundColor: "#FFFFFF", borderRadius: 16, width: "100%", maxWidth: 400, maxHeight: "80%" },
  voteModalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  voteModalTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  voteModalBody: { padding: 16, maxHeight: 400 },
  voteOption: { width: "100%", marginBottom: 8 },
  voteOptionText: { fontSize: 16, color: "#111827" },
  voteOptionTextSelected: { color: "#FFFFFF" },
  voteModalFooter: { flexDirection: "row", justifyContent: "flex-end", gap: 8, padding: 16, borderTopWidth: 1, borderTopColor: "#E5E7EB" },
});