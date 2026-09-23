import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MicButton } from '@/components/MicButton';
import { conversationBySituation, fallbackSituationId } from '@/data/conversations';
import type { Turn } from '@/data/types';
import { BackChevronIcon, ReplayIcon } from '@/icons';
import { colors, radius, shadows, spacing } from '@/theme/tokens';
import { gloss, numeral, text, type } from '@/theme/typography';

/**
 * RP-3 Live AI conversation + RP-3b Live script.
 * English is hidden by default and only appears behind `Show meaning` (§6.2).
 */
export default function Session() {
  const { situationId } = useLocalSearchParams<{ situationId: string }>();
  const insets = useSafeAreaInsets();

  const id = conversationBySituation[situationId] ? situationId : fallbackSituationId;
  const script = conversationBySituation[id];

  const aiTurns = script.turns.filter((turn) => turn.speaker === 'ai');
  const [turnIndex, setTurnIndex] = useState(1);
  const [micOn, setMicOn] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showScript, setShowScript] = useState(false);

  const progressPercent = Math.round(((turnIndex + 1) / aiTurns.length) * 100);
  const aiTurn = aiTurns[Math.min(turnIndex, aiTurns.length - 1)];
  const aiPosition = script.turns.indexOf(aiTurn);
  const userReply = script.turns.slice(aiPosition + 1).find((turn) => turn.speaker === 'user');

  // A hint is a nudge, not a panel: it floats in on tap and clears itself.
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (hintTimer.current) clearTimeout(hintTimer.current);
    },
    [],
  );

  const toggleHint = () => {
    if (hintTimer.current) clearTimeout(hintTimer.current);
    if (showHint) {
      setShowHint(false);
      return;
    }
    setShowHint(true);
    hintTimer.current = setTimeout(() => setShowHint(false), 4000);
  };

  const onMic = () => {
    if (micOn) advance();
    else setMicOn(true);
  };

  const advance = () => {
    if (turnIndex + 1 >= aiTurns.length) {
      router.replace(`/roleplay/report?situationId=${id}`);
      return;
    }
    setTurnIndex((value) => value + 1);
    setMicOn(false);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Leave the conversation"
          style={styles.topButton}
        >
          <BackChevronIcon close />
        </Pressable>
        {/* The comps read progress as a filling bar, not a count — it sits in
            the header row where the `2 / 4` label used to. */}
        <View
          style={styles.progressTrack}
          accessibilityRole="progressbar"
          accessibilityLabel="Conversation progress"
          accessibilityValue={{ min: 0, max: aiTurns.length, now: turnIndex + 1 }}
        >
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
        <View style={styles.topButton} />
      </View>

      <View style={styles.aiBlock}>
        <Text style={styles.blockLabel}>Live conversation script</Text>
        <Text style={styles.aiKorean}>{aiTurn.korean}</Text>

        <Pressable
          onPress={() => setShowMeaning((value) => !value)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ expanded: showMeaning }}
        >
          <Text style={styles.meaningToggle}>
            {showMeaning ? 'Hide meaning' : 'Show meaning'}
          </Text>
        </Pressable>

        {/* §6.2: English stays hidden on the live screen until the learner asks,
            and only ever for the AI's line — what the learner said needs no gloss. */}
        {showMeaning ? <Text style={styles.caption}>{aiTurn.english}</Text> : null}
      </View>

      <View style={styles.stage}>
        <Image
          source={require('../../assets/graphics/voice-wave.gif')}
          style={styles.wave}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
          accessibilityLabel="Voice waveform"
        />

        {/* Drawn after the waveform: the gif carries its own ground and would
            otherwise paint over the button. */}
        <Pressable
          onPress={() => {}}
          accessibilityRole="button"
          accessibilityLabel="Replay the last 10 seconds"
          style={styles.replay}
        >
          <ReplayIcon size={18} color={colors.ink} />
          <Text style={styles.replayLabel}>10</Text>
        </Pressable>

        {showHint ? <HintToast hint={script.hint} /> : null}
      </View>

      <SessionBottom
        userKorean={userReply?.korean ?? '…'}
        micActive={micOn}
        onMic={onMic}
        leftLabel="Script"
        onLeft={() => setShowScript(true)}
        onHint={toggleHint}
        hintOpen={showHint}
      />

      <LiveScript
        visible={showScript}
        turns={script.turns}
        hint={script.hint}
        hintOpen={showHint}
        userKorean={userReply?.korean ?? '…'}
        micActive={micOn}
        onMic={onMic}
        onHint={toggleHint}
        onClose={() => setShowScript(false)}
      />
    </View>
  );
}

/** The hint card, floating clear of the mic just above the `You` panel. */
function HintToast({ hint }: { hint: { korean: string; english: string } }) {
  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      exiting={FadeOut.duration(180)}
      style={styles.hintCard}
      pointerEvents="none"
    >
      <View style={styles.hintBadge}>
        <Text style={styles.hintBadgeLabel}>Hint</Text>
      </View>
      <Text style={styles.hintKorean}>{hint.korean}</Text>
      <Text style={styles.hintEnglish}>{hint.english}</Text>
    </Animated.View>
  );
}

/**
 * The `You` panel and the control row. Both RP-3 and RP-3b carry it in the
 * comps — only the left pill changes, since it swaps the two views.
 */
function SessionBottom({
  userKorean,
  micActive,
  onMic,
  leftLabel,
  onLeft,
  onHint,
  hintOpen,
}: {
  userKorean: string;
  micActive: boolean;
  onMic: () => void;
  leftLabel: string;
  onLeft: () => void;
  onHint: () => void;
  hintOpen: boolean;
}) {
  const insets = useSafeAreaInsets();

  return (
    <>
      <View style={styles.userSheet}>
        <Text style={styles.blockLabel}>You</Text>
        <Text style={styles.userKorean}>{userKorean}</Text>
      </View>

      <View style={[styles.controls, { paddingBottom: insets.bottom + spacing.md }]}>
        <Pressable
          onPress={onLeft}
          accessibilityRole="button"
          style={[styles.controlPill, styles.controlPillPrimary]}
        >
          <Text style={styles.controlPillLabelPrimary}>{leftLabel}</Text>
        </Pressable>

        <MicButton size={84} active={micActive} onPress={onMic} />

        <Pressable
          onPress={onHint}
          accessibilityRole="button"
          accessibilityState={{ selected: hintOpen }}
          style={styles.controlPill}
        >
          <Text style={styles.controlPillLabel}>Hint</Text>
        </Pressable>
      </View>
    </>
  );
}

/**
 * RP-3b Live script. The comp gives it the whole frame rather than a sheet over
 * RP-3: its own header, the conversation, then the same `You` panel and
 * controls, with the left pill pointing back at the roleplay.
 */
function LiveScript({
  visible,
  turns,
  hint,
  hintOpen,
  userKorean,
  micActive,
  onMic,
  onHint,
  onClose,
}: {
  visible: boolean;
  turns: Turn[];
  hint: { korean: string; english: string };
  hintOpen: boolean;
  userKorean: string;
  micActive: boolean;
  onMic: () => void;
  onHint: () => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close the script"
            style={styles.topButton}
          >
            <BackChevronIcon close />
          </Pressable>
          <View style={styles.topButton} />
        </View>

        <View style={styles.scriptStage}>
          <ScrollView
            contentContainerStyle={styles.scriptBody}
            showsVerticalScrollIndicator={false}
          >
            {turns.map((turn) => {
              const isUser = turn.speaker === 'user';
              return (
                <View
                  key={turn.id}
                  style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}
                >
                  <Text style={styles.bubbleKorean}>{turn.korean}</Text>
                  {/* Only the AI's lines are glossed — the learner's own words
                      need no translation back at them. */}
                  {isUser ? null : <Text style={styles.bubbleGloss}>{turn.english}</Text>}
                </View>
              );
            })}
          </ScrollView>

          {hintOpen ? <HintToast hint={hint} /> : null}
        </View>

        <SessionBottom
          userKorean={userKorean}
          micActive={micActive}
          onMic={onMic}
          leftLabel="Roleplay"
          onLeft={onClose}
          onHint={onHint}
          hintOpen={hintOpen}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
  topButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 6,
    marginHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  aiBlock: {
    paddingHorizontal: spacing.gutter,
    paddingBottom: 16,
    gap: 10,
    alignItems: 'center',
  },
  blockLabel: {
    ...type.badge,
    color: colors.textTertiary,
  },
  aiKorean: {
    ...text(22, 32, '700', colors.inkAlt),
    textAlign: 'center',
  },
  caption: {
    ...text(12, 18, '400', colors.textSecondary),
    textAlign: 'center',
  },
  meaningToggle: text(12, 16, '600', colors.primary),
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  replay: {
    position: 'absolute',
    left: spacing.gutter,
    top: 0,
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    ...shadows.card,
  },
  replayLabel: numeral(11, 14, '700', colors.ink),
  hintCard: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
    // The comp gives the hint a soft primary glow, not the neutral card shadow.
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  hintBadge: {
    alignSelf: 'flex-start',
    borderRadius: 60,
    backgroundColor: colors.primary100,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  hintBadgeLabel: {
    ...type.micro,
    color: colors.primary,
  },
  hintKorean: {
    ...text(15, 26, '600', colors.ink),
    letterSpacing: -0.3,
  },
  hintEnglish: gloss(15),
  wave: {
    width: 380,
    height: 340,
    marginBottom: 24,
  },
  userSheet: {
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xl,
    gap: 6,
    alignItems: 'center',
    ...shadows.bottomNav,
  },
  userKorean: {
    ...type.section,
    textAlign: 'center',
  },
  controls: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xl,
  },
  controlPill: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: radius.search,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlPillPrimary: {
    backgroundColor: colors.primary100,
  },
  controlPillLabel: type.label,
  controlPillLabelPrimary: {
    ...type.label,
    color: colors.primary,
  },
  scriptStage: {
    flex: 1,
  },
  scriptBody: {
    paddingHorizontal: spacing.gutter,
    paddingTop: 8,
    paddingBottom: spacing.xl,
    gap: 14,
  },
  bubble: {
    maxWidth: 290,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 2,
    ...shadows.card,
  },
  bubbleAi: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 4,
    borderTopRightRadius: radius.card,
    borderBottomLeftRadius: radius.card,
    borderBottomRightRadius: radius.card,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: colors.bubbleUserStrong,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    borderBottomLeftRadius: radius.card,
    borderBottomRightRadius: 4,
  },
  bubbleKorean: text(15, 23, '500', colors.inkAlt),
  bubbleGloss: text(12, 18, '400', colors.textSecondary),
});
