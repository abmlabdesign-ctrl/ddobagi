import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { Screen, ScreenShell } from '@/components/Screen';
import { conversationBySituation, fallbackSituationId } from '@/data/conversations';
import { situationById } from '@/data/situations';
import {
  BackChevronIcon,
  BookmarkIcon,
  PlayIcon,
  SkipBackIcon,
  SkipForwardIcon,
  SpeakerIcon,
} from '@/icons';
import { colors, layout, radius, shadows, spacing } from '@/theme/tokens';
import { gloss, numeral, text, type } from '@/theme/typography';

/**
 * RV-6 Mistake script + RV-7 inline detail.
 *
 * The comp gives both states the same shell: a left-aligned title beside the
 * back chevron, the script scrolling under it, and a playback bar pinned to the
 * foot. A flagged learner line carries a red `!`; tapping it turns the bubble
 * orange and opens the correction in place rather than pushing a new screen.
 */
export default function MistakeScript() {
  const { situationId } = useLocalSearchParams<{ situationId: string }>();
  const insets = useSafeAreaInsets();
  const id = conversationBySituation[situationId] ? situationId : fallbackSituationId;
  const script = conversationBySituation[id];
  const situation = situationById[id];

  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <ScreenShell>
      {/* `height:52; padding:0 20; gap:4` — the title sits next to the chevron,
          not centred the way the other screens set it. */}
      <View style={styles.header}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/review'))}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.headerBack}
        >
          <BackChevronIcon />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {situation?.title ?? 'Script'}
        </Text>
      </View>

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        {script.turns.map((turn) => {
          const flagged = Boolean(turn.mistake);
          const expanded = expandedId === turn.id;
          const isUser = turn.speaker === 'user';

          const bubble = (
            <View
              style={[
                styles.bubble,
                isUser ? styles.bubbleUser : styles.bubbleAi,
                expanded ? styles.bubbleExpanded : null,
              ]}
            >
              {flagged && !expanded ? (
                <View style={styles.flag}>
                  <Text style={styles.flagLabel}>!</Text>
                </View>
              ) : null}
              <View style={[styles.bubbleText, expanded ? styles.bubbleTextExpanded : null]}>
                <Text style={expanded ? styles.koreanFlagged : styles.korean}>{turn.korean}</Text>
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
                  <Card
                    elevation="card"
                    paddingHorizontal={18}
                    paddingVertical={16}
                    style={styles.detail}
                  >
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
                        accessibilityLabel="Save this phrase"
                        style={styles.detailSecondary}
                      >
                        <BookmarkIcon size={24} color={colors.ink} />
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

      {/* `padding:20px 24px 16px; gap:44` over the home indicator. */}
      <View style={[styles.controls, { paddingBottom: 16 + insets.bottom }]}>
        <Pressable
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Back 10 seconds"
          style={styles.skip}
        >
          <SkipBackIcon />
          <Text style={styles.skipLabel}>10</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Play" style={styles.play}>
          <PlayIcon size={18} />
        </Pressable>
        <Pressable
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Forward 10 seconds"
          style={styles.skip}
        >
          <SkipForwardIcon />
          <Text style={styles.skipLabel}>10</Text>
        </Pressable>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    height: layout.navBarHeight,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerBack: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...text(16, 22, '600', colors.ink),
    flex: 1,
  },
  /**
   * `padding:12px 24px 0; gap:14`. The comp stops at 0, but a real scroller
   * needs the last bubble to clear the playback bar's shadow.
   */
  content: {
    gap: 14,
    paddingTop: 12,
    paddingBottom: spacing.lg,
  },
  turn: {
    gap: 14,
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
  /** Open, the bubble itself carries the flag: tinted fill, orange rule, orange text. */
  bubbleExpanded: {
    backgroundColor: colors.primary100,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  bubbleText: {
    flexShrink: 1,
    gap: 2,
  },
  bubbleTextExpanded: {
    gap: 4,
  },
  flag: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    backgroundColor: colors.danger,
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
  controls: {
    backgroundColor: colors.surface,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 44,
    ...shadows.bottomNav,
  },
  skip: {
    alignItems: 'center',
    gap: 1,
  },
  skipLabel: numeral(11, 14, '700', colors.ink),
  play: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.primaryGlow,
  },
});
