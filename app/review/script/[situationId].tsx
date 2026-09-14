import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { NavBar } from '@/components/NavBar';
import { Screen } from '@/components/Screen';
import { conversationBySituation, fallbackSituationId } from '@/data/conversations';
import { situationById } from '@/data/situations';
import { AlertIcon } from '@/icons';
import { colors, radius, shadows, spacing } from '@/theme/tokens';
import { fontFamily, type } from '@/theme/typography';

/**
 * RV-6 Mistake script + RV-7 inline detail.
 * Flagged learner lines get the primary-100 highlight; tapping one expands the
 * correction in place rather than pushing a new screen.
 */
export default function MistakeScript() {
  const { situationId } = useLocalSearchParams<{ situationId: string }>();
  const id = conversationBySituation[situationId] ? situationId : fallbackSituationId;
  const script = conversationBySituation[id];
  const situation = situationById[id];

  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <View style={styles.root}>
      <NavBar title={situation?.title ?? 'Script'} />

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        {script.turns.map((turn) => {
          const flagged = Boolean(turn.mistake);
          const expanded = expandedId === turn.id;

          const bubble = (
            <View
              style={[
                styles.bubble,
                turn.speaker === 'user' ? styles.bubbleUser : styles.bubbleAi,
                flagged ? styles.bubbleFlagged : null,
              ]}
            >
              {flagged ? (
                <View style={styles.flag}>
                  <AlertIcon size={14} />
                </View>
              ) : null}
              <Text style={styles.korean}>{turn.korean}</Text>
              <Text style={type.caption}>{turn.english}</Text>
            </View>
          );

          return (
            <View
              key={turn.id}
              style={[
                styles.row,
                turn.speaker === 'user' ? styles.rowUser : styles.rowAi,
              ]}
            >
              {flagged ? (
                <Pressable
                  onPress={() => setExpandedId(expanded ? null : turn.id)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded }}
                  accessibilityLabel={`Mistake in ${turn.korean}`}
                >
                  {bubble}
                </Pressable>
              ) : (
                bubble
              )}

              {expanded && turn.mistake ? (
                <Card style={styles.detail}>
                  <Text style={styles.detailLabel}>Mistake detail</Text>
                  <View style={styles.detailBlock}>
                    <Text style={styles.detailHeading}>Suggested sentence</Text>
                    <Text style={styles.korean}>{turn.mistake.suggested.korean}</Text>
                    <Text style={type.caption}>{turn.mistake.suggested.english}</Text>
                  </View>
                  <View style={styles.detailBlock}>
                    <Text style={styles.detailHeading}>Why</Text>
                    <Text style={type.secondary}>{turn.mistake.why}</Text>
                  </View>
                  <Pressable
                    onPress={() => setExpandedId(null)}
                    accessibilityRole="button"
                    style={styles.detailDone}
                  >
                    <Text style={styles.detailDoneLabel}>Done</Text>
                  </Pressable>
                </Card>
              ) : null}
            </View>
          );
        })}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  content: {
    gap: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.huge,
  },
  row: {
    gap: spacing.sm,
    maxWidth: '92%',
  },
  rowAi: {
    alignSelf: 'flex-start',
  },
  rowUser: {
    alignSelf: 'flex-end',
  },
  bubble: {
    borderRadius: radius.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: spacing.xs,
  },
  bubbleAi: {
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  bubbleUser: {
    backgroundColor: colors.bubbleUser,
  },
  bubbleFlagged: {
    backgroundColor: colors.primary100,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  flag: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  korean: {
    fontFamily: fontFamily.sans,
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '600',
    color: colors.ink,
  },
  detail: {
    gap: spacing.md,
  },
  detailLabel: {
    ...type.badge,
    color: colors.primary,
  },
  detailBlock: {
    gap: spacing.xs,
  },
  detailHeading: {
    ...type.caption,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  detailDone: {
    alignSelf: 'flex-start',
    height: 40,
    paddingHorizontal: 18,
    borderRadius: radius.search,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailDoneLabel: {
    fontFamily: fontFamily.sans,
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
