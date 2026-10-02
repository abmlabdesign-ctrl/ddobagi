import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, RowDivider } from '@/components/Card';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { situationById } from '@/data/situations';
import { ListChevronIcon } from '@/icons';
import { runTime, useApp } from '@/store/AppStore';
import { spacing } from '@/theme/tokens';
import { type } from '@/theme/typography';

/**
 * Transcript history — every finished run of one situation, newest first,
 * by when it finished. Picking one opens that run's transcript (RV-6).
 * Runs left part-way never get here: only `finishSession` writes the history.
 */
export default function TranscriptHistory() {
  const { situationId } = useLocalSearchParams<{ situationId: string }>();
  const { history } = useApp();
  const situation = situationById[situationId];
  const runs = history
    .filter((run) => run.situationId === situationId)
    .sort((a, b) => b.completedAt - a.completedAt);

  return (
    <ScreenShell bottomEdge="content">
      <NavBar title={situation?.title ?? 'Transcripts'} />

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        {runs.length === 0 ? (
          <View style={styles.empty}>
            <Text style={type.listTitle}>No transcripts yet</Text>
            <Text style={[type.secondary, styles.emptyText]}>
              Finish this roleplay to see your transcript here.
            </Text>
          </View>
        ) : (
          <>
            <Text style={type.label}>
              {runs.length} finished roleplay{runs.length === 1 ? '' : 's'}
            </Text>
            <Card radiusToken="group" paddingHorizontal={20} paddingVertical={6}>
              {runs.map((run, index) => {
                return (
                  <View key={run.id}>
                    {index > 0 ? <RowDivider /> : null}
                    <Pressable
                      onPress={() =>
                        router.push(
                          `/review/script/${situationId}?run=${encodeURIComponent(run.id)}`,
                        )
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`Transcript from ${runTime(run.completedAt)}`}
                      style={styles.row}
                    >
                      {/* Just when it finished — the transcript itself has the rest. */}
                      <Text style={[type.listTitle, styles.rowText]}>
                        {runTime(run.completedAt)}
                      </Text>
                      <ListChevronIcon />
                    </Pressable>
                  </View>
                );
              })}
            </Card>
          </>
        )}
      </Screen>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingTop: 8,
    paddingBottom: spacing.huge,
  },
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  rowText: {
    flex: 1,
  },
  empty: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.huge,
  },
  emptyText: {
    textAlign: 'center',
  },
});
