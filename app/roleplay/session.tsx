import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MicButton } from '@/components/MicButton';
import { conversationBySituation, fallbackSituationId } from '@/data/conversations';
import { situationById } from '@/data/situations';
import type { Turn } from '@/data/types';
import { BackChevronIcon, DropdownChevronIcon, ReplayIcon, SpeakerIcon } from '@/icons';
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
  const situation = situationById[id];

  const aiTurns = script.turns.filter((turn) => turn.speaker === 'ai');
  const [turnIndex, setTurnIndex] = useState(1);
  const [micOn, setMicOn] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showScript, setShowScript] = useState(false);

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
        <Text style={styles.turnCounter}>
          {turnIndex + 1} / {aiTurns.length}
        </Text>
        <View style={styles.topButton} />
      </View>

      <View style={styles.aiBlock}>
        <Text style={styles.blockLabel}>Live conversation script</Text>
        <Text style={styles.aiKorean}>{aiTurn.korean}</Text>

        {/* The comp sets replay and the meaning toggle side by side as two white
            pills under the sentence, and hangs the English caption below them. */}
        <View style={styles.pillRow}>
          <Pressable
            onPress={() => {}}
            accessibilityRole="button"
            accessibilityLabel="Play the sentence again"
            style={styles.speakerPill}
          >
            <SpeakerIcon size={16} />
          </Pressable>
          <Pressable
            onPress={() => setShowMeaning((value) => !value)}
            accessibilityRole="button"
            accessibilityState={{ expanded: showMeaning }}
            style={styles.meaningPill}
          >
            <Text style={styles.meaningLabel}>
              {showMeaning ? 'Hide meaning' : 'Show meaning'}
            </Text>
            <DropdownChevronIcon color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* §6.2: English stays hidden on the live screen until the learner asks. */}
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

        {showHint ? (
          <Animated.View
            entering={FadeInDown.duration(220)}
            exiting={FadeOut.duration(180)}
            style={styles.hintCard}
            pointerEvents="none"
          >
            <View style={styles.hintBadge}>
              <Text style={styles.hintBadgeLabel}>Hint</Text>
            </View>
            <Text style={styles.hintKorean}>{script.hint.korean}</Text>
            <Text style={styles.hintEnglish}>{script.hint.english}</Text>
          </Animated.View>
        ) : null}
      </View>

      <View style={styles.userSheet}>
        <Text style={styles.blockLabel}>You</Text>
        <Text style={styles.userKorean}>{userReply?.korean ?? '…'}</Text>
        {showMeaning && userReply ? (
          <Text style={styles.userGloss}>{userReply.english}</Text>
        ) : null}
      </View>

      <View style={[styles.controls, { paddingBottom: insets.bottom + spacing.md }]}>
        <Pressable
          onPress={() => setShowScript(true)}
          accessibilityRole="button"
          style={[styles.controlPill, styles.controlPillPrimary]}
        >
          <Text style={styles.controlPillLabelPrimary}>Script</Text>
        </Pressable>

        <MicButton
          size={84}
          active={micOn}
          onPress={() => {
            if (micOn) advance();
            else setMicOn(true);
          }}
        />

        <Pressable
          onPress={toggleHint}
          accessibilityRole="button"
          accessibilityState={{ selected: showHint }}
          style={styles.controlPill}
        >
          <Text style={styles.controlPillLabel}>Hint</Text>
        </Pressable>
      </View>

      <LiveScript
        visible={showScript}
        title={situation?.title ?? 'Live script'}
        turns={script.turns}
        onClose={() => setShowScript(false)}
      />
    </View>
  );
}

/** RP-3b — the whole conversation so far, with English captions per bubble. */
function LiveScript({
  visible,
  title,
  turns,
  onClose,
}: {
  visible: boolean;
  title: string;
  turns: Turn[];
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close the script" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>{title}</Text>
        <ScrollView contentContainerStyle={styles.sheetBody} showsVerticalScrollIndicator={false}>
          {turns.map((turn) => (
            <View
              key={turn.id}
              style={[
                styles.bubble,
                turn.speaker === 'user' ? styles.bubbleUser : styles.bubbleAi,
              ]}
            >
              <Text style={styles.bubbleKorean}>{turn.korean}</Text>
              <Text style={styles.bubbleGloss}>{turn.english}</Text>
            </View>
          ))}
        </ScrollView>
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
  turnCounter: numeral(14, 20, '500', colors.textSecondary),
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
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  speakerPill: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  meaningPill: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    ...shadows.card,
  },
  meaningLabel: text(12, 16, '600', colors.textSecondary),
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
  userGloss: {
    ...text(12, 18, '400', colors.textSecondary),
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(25,31,40,0.35)',
  },
  sheet: {
    backgroundColor: colors.surfaceAlt,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    maxHeight: '78%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  sheetTitle: {
    ...type.title,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  sheetBody: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  bubble: {
    maxWidth: 290,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 2,
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
