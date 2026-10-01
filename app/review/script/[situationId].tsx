import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { useLineScrap } from '@/components/LineScrap';
import { Screen, ScreenShell } from '@/components/Screen';
import { conversationBySituation } from '@/data/conversations';
import { situationById } from '@/data/situations';
import type { Mistake, Turn } from '@/data/types';
import {
  BackChevronIcon,
  BookmarkIcon,
  PlayIcon,
  SkipBackIcon,
  SkipForwardIcon,
  SpeakerIcon,
} from '@/icons';
import { normalizeSpeech } from '@/services/recognition';
import { clipFor, useClipPlayer } from '@/services/recorder';
import { speak, stopSpeaking } from '@/services/speech';
import { shortDate, useApp, type SessionResult } from '@/store/AppStore';
import { colors, layout, radius, shadows, spacing } from '@/theme/tokens';
import { gloss, text, type } from '@/theme/typography';

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
  const situation = situationById[situationId];
  const { mistakes, sessions, savedPhrases, savePhrase, removePhrase } = useApp();
  const turns = transcriptFor(situationId, mistakes, sessions[situationId]);

  const lineScrap = useLineScrap(situationId);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  /** Lines whose correction the learner has read — they now show the fix. */
  const [corrected, setCorrected] = useState<string[]>([]);
  const playClip = useClipPlayer();
  /** The line being read aloud, or null when stopped. */
  const [cursor, setCursor] = useState<number | null>(null);
  // Each playFrom() bumps this, so a stale line's done callback (fired by the
  // stop that starts the next line) can't advance the new run.
  const run = useRef(0);

  useEffect(
    () => () => {
      run.current += 1;
      stopSpeaking();
    },
    [],
  );

  /** 재생은 대화를 위에서 아래로 한 줄씩 읽는 것이다. 앞뒤 버튼은 줄 단위로 옮긴다. */
  const playFrom = (index: number) => {
    run.current += 1;
    const token = run.current;
    if (index < 0 || index >= turns.length) {
      stopSpeaking();
      setCursor(null);
      return;
    }
    setCursor(index);
    speak(turns[index].korean.replace(/["“”]/g, ''), {
      onDone: () => {
        if (run.current === token) playFrom(index + 1);
      },
    });
  };

  const playing = cursor !== null;
  const togglePlayback = () => (playing ? playFrom(-1) : playFrom(0));

  if (turns.length === 0) {
    return (
      <ScreenShell>
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
        <Screen background="surface-alt">
          <Text style={type.secondary}>Finish this roleplay to see your transcript here.</Text>
        </Screen>
      </ScreenShell>
    );
  }

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
        {turns.map((turn, index) => {
          const flagged = Boolean(turn.mistake);
          const reading = cursor === index;
          const expanded = expandedId === turn.id;
          const isUser = turn.speaker === 'user';
          // Once checked, the bubble carries the corrected sentence, with what
          // was said struck through above it for comparison.
          const fix = turn.mistake && corrected.includes(turn.id) ? turn.mistake.suggested : null;
          const savedPhrase = turn.mistake
            ? savedPhrases.find((phrase) => phrase.korean === unquote(turn.mistake!.suggested.korean))
            : undefined;

          const bubble = (
            <View
              style={[
                styles.bubble,
                isUser ? styles.bubbleUser : styles.bubbleAi,
                expanded ? styles.bubbleExpanded : null,
                reading ? styles.bubbleReading : null,
              ]}
            >
              {flagged && !expanded ? (
                <View style={[styles.flag, fix ? styles.flagFixed : null]}>
                  <Text style={styles.flagLabel}>{fix ? '✓' : '!'}</Text>
                </View>
              ) : null}
              {fix && !expanded ? (
                <View style={styles.bubbleText}>
                  <Text style={styles.saidStruck} selectable={false}>
                    {turn.korean}
                  </Text>
                  <Text style={styles.korean} selectable={false}>
                    {unquote(fix.korean)}
                  </Text>
                  <Text style={styles.gloss} selectable={false}>
                    {unquote(fix.english)}
                  </Text>
                </View>
              ) : (
                <View style={[styles.bubbleText, expanded ? styles.bubbleTextExpanded : null]}>
                  <Text style={expanded ? styles.koreanFlagged : styles.korean} selectable={false}>
                    {turn.korean}
                  </Text>
                  {turn.english ? (
                    <Text style={styles.gloss} selectable={false}>
                      {turn.english}
                    </Text>
                  ) : null}
                </View>
              )}
            </View>
          );

          return (
            <View key={turn.id} style={styles.turn}>
              {/* Any line can go to the Scrapbook by long-press. A corrected line
                  saves what it reads now — the fixed sentence. */}
              <Pressable
                onPress={flagged ? () => setExpandedId(expanded ? null : turn.id) : undefined}
                onLongPress={() =>
                  lineScrap.open(fix ? { id: turn.id, korean: fix.korean, english: fix.english } : turn)
                }
                delayLongPress={450}
                accessibilityRole="button"
                accessibilityState={flagged ? { expanded } : undefined}
                accessibilityLabel={
                  fix
                    ? `Corrected to ${unquote(fix.korean)}`
                    : flagged
                      ? `Mistake in ${turn.korean}`
                      : turn.korean
                }
                accessibilityHint="Long-press to save or copy"
                style={isUser ? styles.alignEnd : styles.alignStart}
              >
                {bubble}
              </Pressable>

              {/* Your own take, right under the line — only from this app run. */}
              {isUser && clipFor(`${situationId}/${turn.id}`) ? (
                <Pressable
                  onPress={() => {
                    playFrom(-1);
                    playClip(clipFor(`${situationId}/${turn.id}`)!);
                  }}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Play your voice"
                  style={styles.yourVoice}
                >
                  <SpeakerIcon size={14} color={colors.textSecondary} />
                  <Text style={styles.yourVoiceLabel}>Your voice</Text>
                </Pressable>
              ) : null}

              {expanded && turn.mistake ? (
                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>Mistake detail</Text>
                  <Card
                    elevation="card"
                    paddingHorizontal={18}
                    paddingVertical={16}
                    style={styles.detail}
                  >
                    {/* What was actually said in this run, from the log entry. */}
                    <View style={styles.whySection}>
                      <Text style={styles.whyLabel}>You said</Text>
                      <Text style={styles.why}>{unquote(turn.mistake.said.korean)}</Text>
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.suggestedLabel}>Suggested sentence</Text>
                      <View style={styles.suggestedRow}>
                        <Pressable
                          onPress={() => speak(turn.mistake!.suggested.korean)}
                          hitSlop={8}
                          accessibilityRole="button"
                          accessibilityLabel="Replay the suggested sentence"
                        >
                          <SpeakerIcon size={18} />
                        </Pressable>
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
                      <SaveButton
                        saved={Boolean(savedPhrase)}
                        onPress={() =>
                          savedPhrase
                            ? removePhrase(savedPhrase.id)
                            : savePhrase({
                                id: `${situationId}-${turn.id}`,
                                situationId,
                                korean: unquote(turn.mistake!.suggested.korean),
                                english: unquote(turn.mistake!.suggested.english),
                                savedOn: shortDate(),
                              })
                        }
                      />
                      <Pressable
                        onPress={() => {
                          setCorrected((ids) => (ids.includes(turn.id) ? ids : [...ids, turn.id]));
                          setExpandedId(null);
                        }}
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
        {/* Speech synthesis can't seek, so the skip buttons step a line at a time. */}
        <Pressable
          onPress={() => playFrom(Math.max(0, (cursor ?? 0) - 1))}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Previous line"
          style={styles.skip}
        >
          <SkipBackIcon />
        </Pressable>
        <Pressable
          onPress={togglePlayback}
          accessibilityRole="button"
          accessibilityLabel={playing ? 'Stop' : 'Play'}
          accessibilityState={{ selected: playing }}
          style={styles.play}
        >
          {playing ? <View style={styles.stopMark} /> : <PlayIcon size={18} />}
        </Pressable>
        <Pressable
          onPress={() => playFrom(cursor === null ? 0 : cursor + 1)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Next line"
          style={styles.skip}
        >
          <SkipForwardIcon />
        </Pressable>
      </View>
      {lineScrap.ui}
    </ScreenShell>
  );
}

const unquote = (value: string) => value.replace(/["“”]/g, '');

/**
 * The lines RV-6 shows, built only from the learner's last finished run: the
 * AI's lines, then each answer exactly as it was heard. A line is flagged only
 * when that run logged it as a mistake, and its detail is that log entry —
 * what was said, the correction, why. No run yet means no transcript (never
 * the script's example run). A situation with no script shows its logged
 * mistakes on their own.
 */
function transcriptFor(
  situationId: string,
  mistakes: Mistake[],
  session: SessionResult | undefined,
): Turn[] {
  const script = conversationBySituation[situationId];
  if (!script) {
    return mistakes
      .filter((mistake) => mistake.situationId === situationId && !mistake.fixed)
      .map((mistake) => ({
        id: mistake.id,
        speaker: 'user',
        korean: unquote(mistake.said.korean),
        english: unquote(mistake.said.english),
        mistake,
      }));
  }
  if (!session) return [];

  return script.turns.map((turn) => {
    if (turn.speaker !== 'user') return turn;
    const heard = session.said[turn.id]?.trim() ?? '';
    if (!heard) {
      // Nothing was heard for this answer, so there's nothing to show or judge.
      return { ...turn, korean: '…', english: "We didn't catch this answer.", mistake: undefined };
    }
    const logged =
      session.flagged.includes(turn.id) && turn.mistake
        ? mistakes.find(
            (entry) =>
              entry.situationId === situationId &&
              !entry.fixed &&
              normalizeSpeech(entry.suggested.korean) ===
                normalizeSpeech(turn.mistake!.suggested.korean),
          )
        : undefined;
    return { ...turn, korean: heard, english: '', mistake: logged };
  });
}

/**
 * RV-7 bookmark: a toggle. Outline adds the suggested sentence to the
 * scrapbook; filled takes it back out.
 */
function SaveButton({ saved, onPress }: { saved: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={saved ? 'Remove from your scrapbook' : 'Save this phrase'}
      accessibilityState={{ selected: saved }}
      style={styles.detailSecondary}
    >
      <BookmarkIcon size={24} color={saved ? colors.primary : colors.ink} filled={saved} />
    </Pressable>
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
  yourVoice: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 4,
  },
  yourVoiceLabel: text(12, 16, '500', colors.textSecondary),
  bubbleReading: {
    borderWidth: 1,
    borderColor: colors.info,
  },
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
  flagFixed: {
    backgroundColor: colors.success,
  },
  flagLabel: text(13, 13, '700', colors.surface),
  saidStruck: {
    ...text(12, 18, '400', colors.textSecondary),
    textDecorationLine: 'line-through',
  },
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
  stopMark: {
    width: 16,
    height: 16,
    borderRadius: 3,
    backgroundColor: colors.surface,
  },
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
