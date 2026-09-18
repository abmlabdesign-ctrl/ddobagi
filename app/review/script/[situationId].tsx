import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { conversationBySituation, fallbackSituationId } from '@/data/conversations';
import { situationById } from '@/data/situations';
import { SpeakerIcon } from '@/icons';
import { colors, radius, shadows, spacing } from '@/theme/tokens';
import { gloss, text, type } from '@/theme/typography';

/**
 * RV-6 Mistake script + RV-7 inline detail.
 * Flagged learner lines carry a red marker; tapping one expands the correction
 * in place rather than pushing a new screen.
 */
export default function MistakeScript() {
  const { situationId } = useLocalSearchParams<{ situationId: string }>();
  const id = conversationBySituation[situationId] ? situationId : fallbackSituationId;
  const script = conversationBySituation[id];
  const situation = situationById[id];

  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <ScreenShell bottomEdge="content">
      <NavBar title={situation?.title ?? 'Script'} />

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        {script.turns.map((turn) => {
          const flagged = Boolean(turn.mistake);
          const expanded = expandedId === turn.id;
          const isUser = turn.speaker === 'user';

          const bubble = (
            <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
              {flagged ? (
                <View style={styles.flag}>
                  <Text style={styles.flagLabel}>!</Text>
                </View>
              ) : null}
              <View style={styles.bubbleText}>
                <Text style={flagged ? styles.koreanFlagged : styles.korean}>{turn.korean}</Text>
                <Text style={styles.gloss}>{turn.english}</Text>
              </View>
            </View>
          );

          return (
            <View key={turn.id} style={styles.turn}>
              {flagged ? (
                <Pressable
                  onPress={() => setExpandedId(expanded ? null : turn.id)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded }}
                  accessibilityLabel={`Mistake in ${turn.korean}`}
                  style={isUser ? styles.alignEnd : styles.alignStart}
                >
                  {bubble}
                </Pressable>
              ) : (
                <View style={isUser ? styles.alignEnd : styles.alignStart}>{bubble}</View>
              )}

              {expanded && turn.mistake ? (
                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>Mistake detail</Text>
                  <Card elevation="card" paddingHorizontal={18} paddingVertical={16} style={styles.detail}>
                    <View style={styles.detailSection}>
                      <Text style={styles.suggestedLabel}>Suggested sentence</Text>
                      <View style={styles.suggestedRow}>
                        <SpeakerIcon size={18} />
                        <View style={styles.suggestedText}>
                          <Text style={styles.suggestedKorean}>{turn.mistake.suggested.korean}</Text>
                          <Text style={styles.suggestedGloss}>{turn.mistake.suggested.english}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.whySection}>
                      <Text style={styles.whyLabel}>Why</Text>
                      <Text style={styles.why}>{turn.mistake.why}</Text>
                    </View>

                    <View style={styles.detailActions}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Say it again"
                        style={styles.detailSecondary}
                      >
                        <SpeakerIcon size={16} color={colors.inkAlt} />
                      </Pressable>
                      <Pressable
                        onPress={() => setExpandedId(null)}
                        accessibilityRole="button"
                        style={styles.detailPrimary}
                      >
                        <Text style={styles.detailPrimaryLabel}>Done</Text>
                      </Pressable>
                    </View>
                  </Card>
                </View>
              ) : null}
            </View>
          );
        })}
      </Screen>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingTop: 12,
    paddingBottom: spacing.huge,
  },
  turn: {
    gap: 12,
  },
  alignStart: {
    alignSelf: 'flex-start',
    maxWidth: 290,
  },
  alignEnd: {
    alignSelf: 'flex-end',
    maxWidth: 290,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  bubbleAi: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 4,
    borderTopRightRadius: radius.card,
    borderBottomLeftRadius: radius.card,
    borderBottomRightRadius: radius.card,
  },
  bubbleUser: {
    backgroundColor: colors.bubbleUserStrong,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    borderBottomLeftRadius: radius.card,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    flexShrink: 1,
    gap: 2,
  },
  flag: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    backgroundColor: '#F04452',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagLabel: text(13, 13, '700', colors.surface),
  korean: text(15, 23, '500', colors.inkAlt),
  koreanFlagged: text(15, 23, '600', colors.primary),
  gloss: text(12, 18, '400', colors.textSecondary),
  detailBlock: {
    gap: 8,
  },
  detailLabel: {
    ...type.badge,
    color: colors.textTertiary,
    paddingLeft: 4,
  },
  detail: {
    gap: 14,
    ...shadows.card,
  },
  detailSection: {
    gap: 8,
  },
  suggestedLabel: text(11, 16, '600', colors.primary),
  suggestedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  suggestedText: {
    flex: 1,
    gap: 4,
  },
  suggestedKorean: text(16, 24, '600', colors.inkAlt),
  suggestedGloss: gloss(16),
  whySection: {
    gap: 4,
  },
  whyLabel: text(11, 16, '600', colors.textTertiary),
  why: text(14, 21, '500', colors.inkAlt),
  detailActions: {
    flexDirection: 'row',
    gap: 8,
  },
  detailSecondary: {
    width: 44,
    height: 44,
    borderRadius: radius.search,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailPrimary: {
    flex: 1,
    height: 44,
    borderRadius: radius.search,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailPrimaryLabel: text(15, 22, '600', colors.surface),
});
