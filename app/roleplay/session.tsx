import { Redirect, router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { KoreanVoiceNotice } from '@/components/KoreanVoiceNotice';
import { ScrapTip, useLineScrap } from '@/components/LineScrap';
import { MicButton } from '@/components/MicButton';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { conversationBySituation } from '@/data/conversations';
import type { ConversationScript, Turn } from '@/data/types';
import { BackChevronIcon, ReplayIcon } from '@/icons';
import { setWebBackGuard } from '@/services/backGuard';
import { romanize } from '@/services/romanize';
import { recognitionMessage, useSpeechRecognition } from '@/services/recognition';
import { micMessage, rememberClip, useVoiceRecorder } from '@/services/recorder';
import { speak, stopSpeaking } from '@/services/speech';
import { useApp, type JudgedLine } from '@/store/AppStore';
import { colors, radius, shadows, spacing } from '@/theme/tokens';
import { numeral, text, type } from '@/theme/typography';

/**
 * RP-3 Live AI conversation + RP-3b Live script.
 * English is hidden by default and only appears behind `Show meaning` (§6.2).
 */
export default function Session() {
  const { situationId } = useLocalSearchParams<{ situationId: string }>();
  const script = conversationBySituation[situationId];
  const { freeLeft } = useApp();
  // Judged once on entry: finishing this session uses up the allowance, and
  // the screen must not turn into the paywall on its way to the report.
  const [allowed] = useState(freeLeft.roleplays > 0);

  // No silent stand-in: a situation without a script says so instead of
  // playing another situation's conversation under its title.
  if (!script) {
    return (
      <ScreenShell background="surface">
        <NavBar title="Conversation" />
        <Screen>
          <Text style={type.secondary}>This conversation isn&apos;t ready yet.</Text>
        </Screen>
      </ScreenShell>
    );
  }

  if (!allowed) return <Redirect href="/plus?reason=roleplays" />;

  return <Conversation script={script} />;
}

function Conversation({ script }: { script: ConversationScript }) {
  const id = script.situationId;
  const insets = useSafeAreaInsets();
  /** The middle area's size — the waveform is fitted to it, never cropped. */
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const navigation = useNavigation();
  const { finishSession, drafts, saveDraft } = useApp();
  const lineScrap = useLineScrap(id);
  // A run saved with `Save and leave` resumes where it stopped.
  const [draft] = useState(() => drafts[id]);

  const aiTurns = script.turns.filter((turn) => turn.speaker === 'ai');
  const userTurnCount = script.turns.filter((turn) => turn.speaker === 'user').length;
  // Start on the AI's opening line — the greeting is part of the exchange.
  const [turnIndex, setTurnIndex] = useState(draft?.turnIndex ?? 0);
  const [micOn, setMicOn] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const voice = useVoiceRecorder();
  const heard = useSpeechRecognition();
  /** 이번 턴에 실제로 말한 것. 비어 있으면 대본의 예시 문장을 보여준다. */
  const [said, setSaid] = useState('');
  /**
   * A finished take waiting for the learner's call — `Submit` sends it,
   * `Try again` (or the mic) throws it away. Null while there's none.
   */
  const [take, setTake] = useState<{ text: string; clip: string | null } | null>(null);
  /** 턴마다 말한 것 — 끝나면 리포트와 오답 로그로 넘긴다. */
  const [lines, setLines] = useState<JudgedLine[]>(draft?.lines ?? []);
  const [micBlocked, setMicBlocked] = useState(false);
  const [startedAt] = useState(() => Date.now());
  /** Set on the last reply: the bar fills to 100% before the report opens. */
  const [finished, setFinished] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  /** Once true, leaving is intended and the confirm sheet stays out of the way. */
  const leaving = useRef(false);

  // Progress is the share of the learner's replies given so far: 0% on the
  // opening line, a step per reply, 100% only once the conversation ends.
  const progressPercent = finished
    ? 100
    : Math.round((Math.min(lines.length, userTurnCount) / Math.max(1, userTurnCount)) * 100);
  const aiTurn = aiTurns[Math.min(turnIndex, aiTurns.length - 1)];
  const aiPosition = script.turns.indexOf(aiTurn);
  const userReply = script.turns.slice(aiPosition + 1).find((turn) => turn.speaker === 'user');
  // The hint gives this turn's key words, never the finished answer: the
  // learner still has to build the sentence themselves.
  const hint: HintWord[] = userReply?.hintWords ?? [];

  // A hint is a nudge, not a panel: it floats in on tap and clears itself.
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * 대화이므로 AI 차례가 오면 바로 들려준다. 화면을 떠날 때는 끊는다.
   * 첫 턴은 브라우저가 사용자 동작 없는 재생을 막을 수 있어 소리가 안 날 수
   * 있는데, 그때는 Replay 버튼으로 들으면 된다.
   */
  useEffect(() => {
    speak(aiTurn.korean);
    return () => stopSpeaking();
  }, [aiTurn.korean]);

  useEffect(
    () => () => {
      if (hintTimer.current) clearTimeout(hintTimer.current);
    },
    [],
  );

  // Back gestures, the hardware back button and the close button all ask
  // before a half-done conversation is thrown away.
  useEffect(
    () =>
      navigation.addListener('beforeRemove', (event) => {
        if (leaving.current) return;
        event.preventDefault();
        setLeaveOpen(true);
      }),
    [navigation],
  );

  // Browser Back on the web: step forward again to this screen's own entry,
  // then ask, same as the close button. The forward step fires a popstate of
  // its own, which is swallowed too so the router never hears either.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    let restoring = false;
    return setWebBackGuard(() => {
      if (restoring) {
        restoring = false;
        return true;
      }
      if (leaving.current) return false;
      restoring = true;
      window.history.go(1);
      setLeaveOpen(true);
      return true;
    });
  }, []);

  /** Leave for RP-1, keeping this run's progress only when asked to. */
  const leave = async (save: boolean) => {
    if (save) {
      saveDraft(id, {
        turnIndex,
        lines,
        percent: progressPercent,
        answered: Math.min(lines.length, userTurnCount),
        total: userTurnCount,
        savedAt: Date.now(),
      });
    }
    setLeaveOpen(false);
    leaving.current = true;
    heard.reset();
    if (micOn) await voice.stop();
    stopSpeaking();
    router.dismissTo('/(tabs)/roleplay');
  };

  const toggleHint = () => {
    if (hintTimer.current) clearTimeout(hintTimer.current);
    if (showHint) {
      setShowHint(false);
      return;
    }
    setShowHint(true);
    hintTimer.current = setTimeout(() => setShowHint(false), 4000);
  };

  const onMic = async () => {
    if (finished) return;
    if (micOn) {
      // `said` carries the words still being settled; stop() only the settled ones.
      const settled = heard.supported ? heard.stop() : '';
      const final = said || settled;
      const clip = await voice.stop();
      setMicOn(false);
      // Like the level check: stopping holds the take for Submit / Try again.
      setTake({ text: final, clip });
      return;
    }
    // A new take replaces the one waiting, if any.
    setTake(null);
    // AI가 말하는 중에 마이크를 열면 자기 목소리를 덮으므로 먼저 끊는다.
    stopSpeaking();
    setSaid('');
    heard.reset();
    const on = await voice.start();
    setMicBlocked(!on);
    if (on && heard.supported) heard.start({ onTranscript: setSaid });
    setMicOn(on);
  };

  const submitTake = () => {
    if (!take || finished) return;
    if (take.clip && userReply) rememberClip(`${id}/${userReply.id}`, take.clip);
    setTake(null);
    advance(take.text);
  };

  /** Try again: clear what was heard and wait for a fresh take. */
  const retryTake = () => {
    setTake(null);
    setSaid('');
    heard.reset();
  };

  const advance = (final: string) => {
    const next = userReply
      ? [...lines, { turnId: userReply.id, said: final, mistake: userReply.mistake }]
      : lines;
    if (turnIndex + 1 >= aiTurns.length) {
      finishSession({
        situationId: id,
        lines: next,
        goalsTotal: 3,
        minutes: Math.max(1, Math.round((Date.now() - startedAt) / 60000)),
      });
      setLines(next);
      setMicOn(false);
      setFinished(true);
      leaving.current = true;
      // Long enough to see the bar reach the end before the report slides in.
      setTimeout(() => router.replace(`/roleplay/report?situationId=${id}`), 700);
      return;
    }
    setLines(next);
    setTurnIndex((value) => value + 1);
    setMicOn(false);
    setSaid('');
    heard.reset();
  };

  // RP-3b shows the conversation so far, with the learner's own words in
  // place of the script's where they were heard.
  const saidByTurn = Object.fromEntries(lines.map((line) => [line.turnId, line.said]));
  const liveTurns = script.turns
    .slice(0, aiPosition + 1)
    .map((turn) =>
      saidByTurn[turn.id] && saidByTurn[turn.id] !== turn.korean
        ? // The script's English no longer matches what was actually said.
          { ...turn, korean: saidByTurn[turn.id], english: '' }
        : turn,
    );

  const takeControls = take ? { onRetry: retryTake, onSubmit: submitTake } : undefined;

  // Nothing of the answer shows before the learner speaks: the panel holds a
  // prompt until words are actually heard, then only what was heard.
  const userKorean = micBlocked
    ? micMessage(voice.permission)
    : heard.error !== 'none'
      ? recognitionMessage[heard.error]
      : said
        ? said
        : micOn
          ? '…'
          : take
            ? heard.supported
              ? "We didn't catch any words. Try again?"
              : 'Your answer is recorded.'
            : 'Tap the mic to answer.';
  const userIsPrompt = !said;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => (finished ? null : setLeaveOpen(true))}
          accessibilityRole="button"
          accessibilityLabel="Leave the conversation"
          style={styles.topButton}
        >
          <BackChevronIcon close />
        </Pressable>
        {/* The comps read progress as a filling bar, not a count — it sits in
            the header row where the `2 / 4` label used to. */}
        <ProgressBar percent={progressPercent} />
        <View style={styles.topButton} />
      </View>

      {/* Three bands: the line on top, the waveform in whatever is left, the
          `You` panel and controls below. The top band sizes to its text and
          scrolls on its own if a long meaning outgrows it, so it never slides
          under the panel; the waveform band takes the rest. */}
      <ScrollView
        style={styles.aiScroll}
        contentContainerStyle={styles.aiBlock}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.blockLabel}>Live conversation script</Text>
        {/* Long-press keeps the line, the same as a bubble in the script. */}
        <Pressable
          onLongPress={() => lineScrap.open(aiTurn)}
          delayLongPress={450}
          accessibilityHint="Long-press to save or copy"
        >
          <Text style={styles.aiKorean} selectable={false}>
            {aiTurn.korean}
          </Text>
        </Pressable>

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
        <KoreanVoiceNotice />
      </ScrollView>

      <View
        style={styles.stage}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setStageSize((current) =>
            current.width === width && current.height === height ? current : { width, height },
          );
        }}
      >
        {stageSize.height > 0 ? (
          <Image
            source={require('../../assets/graphics/voice-wave.gif')}
            // Up to 380×340, scaled down whole to fit the band on a short screen.
            style={waveSize(stageSize)}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
            accessibilityLabel="Voice waveform"
          />
        ) : null}

        {/* Drawn after the waveform: the gif carries its own ground and would
            otherwise paint over the button. */}
        <Pressable
          onPress={() => speak(aiTurn.korean)}
          accessibilityRole="button"
          accessibilityLabel="Replay what the other person said"
          style={styles.replay}
        >
          <ReplayIcon size={18} color={colors.ink} />
          <Text style={styles.replayLabel}>10</Text>
        </Pressable>

        {showHint ? <HintToast hint={hint} /> : null}
      </View>

      <SessionBottom
        // 말하기 시작하면 대본이 아니라 실제로 인식된 말을 보여준다.
        userKorean={userKorean}
        userIsPrompt={userIsPrompt}
        micActive={micOn}
        onMic={onMic}
        leftLabel="Script"
        onLeft={() => setShowScript(true)}
        onHint={toggleHint}
        hintOpen={showHint}
        take={takeControls}
      />

      <LiveScript
        situationId={id}
        take={takeControls}
        visible={showScript}
        turns={liveTurns}
        hint={hint}
        hintOpen={showHint}
        userKorean={userKorean}
        userIsPrompt={userIsPrompt}
        micActive={micOn}
        onMic={onMic}
        onHint={toggleHint}
        onClose={() => setShowScript(false)}
      />

      <LeaveSheet
        visible={leaveOpen}
        percent={progressPercent}
        onSave={() => leave(true)}
        onDiscard={() => leave(false)}
        onCancel={() => setLeaveOpen(false)}
      />

      {lineScrap.ui}
      <ScrapTip />
    </View>
  );
}

/** The waveform art is 380×340. */
const WAVE = { width: 380, height: 340 };

/** The biggest 380:340 box that fits the band, never above the art's own size. */
const waveSize = ({ width, height }: { width: number; height: number }) => {
  const scale = Math.max(0, Math.min(1, width / WAVE.width, height / WAVE.height));
  return { width: WAVE.width * scale, height: WAVE.height * scale };
};

/** The header bar, easing from one reply's share to the next. */
function ProgressBar({ percent }: { percent: number }) {
  const [trackWidth, setTrackWidth] = useState(0);
  const fill = useSharedValue(0);

  useEffect(() => {
    // Always a sliver at 0%, so the bar reads as started rather than empty.
    const target = Math.max(percent, 3);
    fill.value = withTiming((trackWidth * target) / 100, { duration: 420 });
  }, [percent, trackWidth, fill]);

  const fillStyle = useAnimatedStyle(() => ({ width: fill.value }));

  return (
    <View
      style={styles.progressTrack}
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      accessibilityRole="progressbar"
      accessibilityLabel="Conversation progress"
      accessibilityValue={{ min: 0, max: 100, now: percent, text: `${percent}%` }}
    >
      <Animated.View style={[styles.progressFill, fillStyle]} />
    </View>
  );
}

/**
 * Asked before a conversation is left part-way. Saving keeps the percent on
 * the situation card and lets RP-2 resume from this line.
 */
function LeaveSheet({
  visible,
  percent,
  onSave,
  onDiscard,
  onCancel,
}: {
  visible: boolean;
  percent: number;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel} accessibilityLabel="Close" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
        <Text style={type.section}>Save this conversation?</Text>
        <Text style={type.secondary}>
          You&apos;re {percent}% through. Save it to pick up from here next time.
        </Text>
        <View style={styles.sheetActions}>
          <Button label="Save and leave" onPress={onSave} />
          <Button label="Leave without saving" variant="tonal" onPress={onDiscard} />
          <Button label="Cancel" variant="text" onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
}

type HintWord = { korean: string; english: string };

/**
 * The hint card, floating clear of the mic just above the `You` panel: a few
 * key words as `목  mok  — throat`, not the sentence they make.
 */
function HintToast({ hint }: { hint: HintWord[] }) {
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
      {hint.length === 0 ? (
        <Text style={styles.hintEnglish}>Answer in your own words.</Text>
      ) : (
        hint.map((word) => (
          <View key={word.korean} style={styles.hintRow}>
            <Text style={styles.hintKorean}>{word.korean}</Text>
            <Text style={styles.hintRoman}>{romanize(word.korean)}</Text>
            <Text style={styles.hintEnglish}>— {word.english}</Text>
          </View>
        ))
      )}
    </Animated.View>
  );
}

/**
 * The `You` panel and the control row. Both RP-3 and RP-3b carry it in the
 * comps — only the left pill changes, since it swaps the two views.
 */
function SessionBottom({
  userKorean,
  userIsPrompt,
  micActive,
  onMic,
  leftLabel,
  onLeft,
  onHint,
  hintOpen,
  take,
}: {
  userKorean: string;
  /** True while the panel holds a prompt or notice rather than heard words. */
  userIsPrompt: boolean;
  micActive: boolean;
  onMic: () => void;
  leftLabel: string;
  onLeft: () => void;
  onHint: () => void;
  hintOpen: boolean;
  /** Present while a finished take waits — the side pills become Try again / Submit. */
  take?: { onRetry: () => void; onSubmit: () => void };
}) {
  const insets = useSafeAreaInsets();

  return (
    <>
      <View style={styles.userSheet}>
        <Text style={styles.blockLabel}>You</Text>
        <Text style={userIsPrompt ? styles.userPrompt : styles.userKorean}>{userKorean}</Text>
      </View>

      <View style={[styles.controls, { paddingBottom: insets.bottom + spacing.md }]}>
        {take ? (
          // The same pair the level check offers once a take is done.
          <Pressable
            onPress={take.onRetry}
            accessibilityRole="button"
            accessibilityLabel="Try again from the start"
            style={styles.controlPill}
          >
            <Text style={styles.controlPillLabel}>Try again</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={onLeft}
            accessibilityRole="button"
            style={[styles.controlPill, styles.controlPillPrimary]}
          >
            <Text style={styles.controlPillLabelPrimary}>{leftLabel}</Text>
          </Pressable>
        )}

        <MicButton size={84} active={micActive} onPress={onMic} />

        {take ? (
          <Pressable
            onPress={take.onSubmit}
            accessibilityRole="button"
            style={[styles.controlPill, styles.controlPillPrimary]}
          >
            <Text style={styles.controlPillLabelPrimary}>Submit</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={onHint}
            accessibilityRole="button"
            accessibilityState={{ selected: hintOpen }}
            style={styles.controlPill}
          >
            <Text style={styles.controlPillLabel}>Hint</Text>
          </Pressable>
        )}
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
  userIsPrompt,
  situationId,
  take,
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
  userIsPrompt: boolean;
  situationId: string;
  take?: { onRetry: () => void; onSubmit: () => void };
  visible: boolean;
  turns: Turn[];
  hint: HintWord[];
  hintOpen: boolean;
  userKorean: string;
  micActive: boolean;
  onMic: () => void;
  onHint: () => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  // Its own sheet and toast: this screen is a Modal, so they must draw inside it.
  const lineScrap = useLineScrap(situationId);

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
                <Pressable
                  key={turn.id}
                  onLongPress={() => lineScrap.open(turn)}
                  delayLongPress={450}
                  accessibilityHint="Long-press to save or copy"
                  style={({ pressed }) => [
                    styles.bubble,
                    isUser ? styles.bubbleUser : styles.bubbleAi,
                    pressed ? styles.bubblePressed : null,
                  ]}
                >
                  <Text style={styles.bubbleKorean} selectable={false}>
                    {turn.korean}
                  </Text>
                  {/* Only the AI's lines are glossed — the learner's own words
                      need no translation back at them. */}
                  {isUser ? null : (
                    <Text style={styles.bubbleGloss} selectable={false}>
                      {turn.english}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          {hintOpen ? <HintToast hint={hint} /> : null}
        </View>

        <SessionBottom
          userKorean={userKorean}
          userIsPrompt={userIsPrompt}
          micActive={micActive}
          onMic={onMic}
          leftLabel="Roleplay"
          onLeft={onClose}
          onHint={onHint}
          hintOpen={hintOpen}
          take={take}
        />
        {lineScrap.ui}
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
  /** Sizes to its text; shrinks and scrolls only if the text outgrows half the screen. */
  aiScroll: {
    flexGrow: 0,
    flexShrink: 1,
    maxHeight: '50%',
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
  /** The rest of the height, with the waveform centred both ways inside it. */
  stage: {
    flex: 1,
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
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
  hintRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 8,
  },
  hintRoman: numeral(13, 18, '500', colors.textSecondary),
  hintEnglish: text(13, 18, '400', colors.textSecondary),
  userPrompt: {
    ...text(15, 22, '500', colors.textTertiary),
    textAlign: 'center',
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
  /** Held for a long-press: a light dim says the line is being picked up. */
  bubblePressed: {
    opacity: 0.7,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(25,31,40,0.35)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xl,
    gap: 10,
  },
  sheetActions: {
    gap: 4,
    marginTop: 8,
  },
});
