import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MicButton } from '@/components/MicButton';
import { conversationBySituation, fallbackSituationId } from '@/data/conversations';
import { situationById } from '@/data/situations';
import type { Turn } from '@/data/types';
import { ChevronLeftIcon, ReplayIcon } from '@/icons';
import { colors, radius, shadows, spacing } from '@/theme/tokens';
import { fontFamily, type } from '@/theme/typography';

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
  const [showHint, setShowHint] = useState(true);
  const [showScript, setShowScript] = useState(false);

  const aiTurn = aiTurns[Math.min(turnIndex, aiTurns.length - 1)];
  const aiPosition = script.turns.indexOf(aiTurn);
  const userReply = script.turns
    .slice(aiPosition + 1)
    .find((turn) => turn.speaker === 'user');

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
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Leave the conversation"
          style={styles.topButton}
        >
          <ChevronLeftIcon size={24} />
        </Pressable>
        <Text style={styles.turnCounter}>
          {turnIndex + 1} / {aiTurns.length}
        </Text>
        <View style={styles.topButton} />
      </View>

      <View style={styles.aiBlock}>
        <Pressable
          onPress={() => setShowMeaning((value) => !value)}
          hitSlop={8}
          accessibilityRole="button"
        >
          <Text style={styles.blockLabel}>
            {showMeaning ? 'Hide meaning' : 'Live conversation script'}
          </Text>
        </Pressable>
        <Text style={styles.aiKorean}>{aiTurn.korean}</Text>
        {showMeaning ? <Text style={styles.caption}>{aiTurn.english}</Text> : null}
      </View>

      <View style={styles.stage}>
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
          <View style={styles.hintCard}>
            <View style={styles.hintBadge}>
              <Text style={styles.hintBadgeLabel}>Hint</Text>
            </View>
            <Text style={styles.hintKorean}>{script.hint.korean}</Text>
            <Text style={styles.hintEnglish}>{script.hint.english}</Text>
          </View>
        ) : null}

        <Image
          source={require('../../assets/graphics/voice-wave.gif')}
          style={styles.wave}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
          accessibilityLabel="Voice waveform"
        />
      </View>

      <View style={styles.userSheet}>
        <Text style={styles.blockLabel}>You</Text>
        <Text style={styles.userKorean}>{userReply?.korean ?? '…'}</Text>
        {showMeaning && userReply ? (
          <Text style={styles.caption}>{userReply.english}</Text>
        ) : null}
      </View>

      <View style={[styles.controls, { paddingBottom: insets.bottom + spacing.md }]}>
        <Pressable
          onPress={() => setShowScript(true)}
          accessibilityRole="button"
          style={[styles.controlPill, styles.controlPillActive]}
        >
          <Text style={styles.controlPillLabelActive}>Script</Text>
        </Pressable>

        <MicButton
          size={84}
          active={micOn}
          onPress={() => {
            if (micOn) {
              advance();
            } else {
              setMicOn(true);
            }
          }}
        />

        <Pressable
          onPress={() => setShowHint((value) => !value)}
          accessibilityRole="button"
          accessibilityState={{ selected: showHint }}
          style={[styles.controlPill, showHint ? styles.controlPillActive : null]}
        >
          <Text style={showHint ? styles.controlPillLabelActive : styles.controlPillLabel}>
            Hint
          </Text>
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
                styles.bubbleWrap,
                turn.speaker === 'user' ? styles.bubbleWrapUser : styles.bubbleWrapAi,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  turn.speaker === 'user' ? styles.bubbleUser : styles.bubbleAi,
                ]}
              >
                <Text style={styles.bubbleKorean}>{turn.korean}</Text>
              </View>
              <Text style={styles.caption}>{turn.english}</Text>
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
  turnCounter: {
    fontFamily: fontFamily.numeric,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  aiBlock: {
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  blockLabel: {
    ...type.badge,
    color: colors.textTertiary,
  },
  aiKorean: {
    fontFamily: fontFamily.sans,
    fontSize: 22,
    lineHeight: 32,
    fontWeight: '700',
    color: colors.inkAlt,
  },
  caption: {
    ...type.caption,
  },
  stage: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.gutter,
    gap: spacing.md,
  },
  replay: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    ...shadows.card,
  },
  replayLabel: {
    fontFamily: fontFamily.numeric,
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink,
  },
  hintCard: {
    alignSelf: 'flex-start',
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: spacing.sm,
    ...shadows.card,
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
    fontFamily: fontFamily.sans,
    fontSize: 15,
    lineHeight: 26,
    fontWeight: '600',
    color: colors.ink,
  },
  hintEnglish: {
    ...type.caption,
    marginTop: -4,
  },
  wave: {
    width: '100%',
    height: 160,
    marginBottom: spacing.sm,
  },
  userSheet: {
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xl,
    gap: 6,
  },
  userKorean: {
    ...type.section,
    color: colors.inkAlt,
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
  controlPillActive: {
    backgroundColor: colors.primary100,
  },
  controlPillLabel: {
    fontFamily: fontFamily.sans,
    fontSize: 14,
    fontWeight: '600',
    color: colors.inkAlt,
  },
  controlPillLabelActive: {
    fontFamily: fontFamily.sans,
    fontSize: 14,
    fontWeight: '600',
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
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  bubbleWrap: {
    gap: spacing.xs,
    maxWidth: '86%',
  },
  bubbleWrapAi: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubbleWrapUser: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  bubble: {
    borderRadius: radius.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  bubbleAi: {
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  bubbleUser: {
    backgroundColor: colors.bubbleUser,
  },
  bubbleKorean: {
    ...type.body,
    fontWeight: '600',
    color: colors.ink,
  },
});
