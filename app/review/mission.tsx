import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CtaDock } from '@/components/CtaDock';
import { KoreanText, isPunctuation, joinTokens, syllableCount } from '@/components/KoreanText';
import { KoreanVoiceNotice } from '@/components/KoreanVoiceNotice';
import { MicButton } from '@/components/MicButton';
import { NavBar } from '@/components/NavBar';
import { ScreenShell } from '@/components/Screen';
import { StepProgress } from '@/components/StepProgress';
import { TODAYS_FOCUS_ID, missionById, missions, questionKind } from '@/data/missions';
import type { ChoiceQuestion, Mission, Token, WriteQuestion } from '@/data/types';
import { BackChevronIcon, CheckIcon, DropdownChevronIcon, SpeakerIcon } from '@/icons';
import {
  matchSentence,
  matchSyllables,
  recognitionMessage,
  useSpeechRecognition,
  type RecognitionError,
} from '@/services/recognition';
import { micMessage, useVoiceRecorder } from '@/services/recorder';
import { buildMixedMission } from '@/services/mixedMission';
import { dealMission } from '@/services/questionPicker';
import { speak } from '@/services/speech';
import { useApp } from '@/store/AppStore';
import { useHelpText, useMeaning } from '@/store/useMeaning';
import { colors, layout, radius, shadows, spacing } from '@/theme/tokens';
import { numeral, text, type } from '@/theme/typography';

/**
 * How long the mic waits for a first word before the take counts as no
 * answer. Long enough to read the sentence once before speaking.
 */
const NO_ANSWER_MS = 8000;

/** Every RV-2 prompt card is the same height, whichever way the axis is drilled. */
const MISSION_CARD_HEIGHT = 300;

/** Spacing and punctuation are noise for every axis these drills grade. */
const normalize = (value: string) => value.replace(/[\s.,!?~]/g, '');

/** The run order: the authored items, cycled up to the mission's designed length. */
const buildQueue = (mission: Mission) =>
  Array.from({ length: mission.questionCount }, (_, i) => i % mission.questions.length);

type Verdict = {
  correct: boolean;
  /** Names the right answer outright, e.g. `The answer is 를.` */
  headline?: string;
  /** One line, about the axis this mission drills — not the whole sentence. */
  note: string;
};

/**
 * RV-2a … RV-2f. One runner, three ways to drill: speaking missions use the mic,
 * writing missions grade what the learner typed into the gaps, choice missions
 * grade on tap. The header, the progress bar, the 300px prompt card and the
 * feedback panel are the same in all three, and `Next` lives only inside that
 * panel. A miss is shown the answer and then comes back at the end of the run,
 * inside the same flow — the learner never crosses into a separate round.
 */
export default function MissionRunner() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>();
  const { finishMission, freeLeft, recentQuestions, markQuestionsDealt } = useApp();
  // Every run is dealt on the spot, questions not seen lately first: Today's
  // focus mixes ten across all six skills, a skill mission deals from its bank.
  const pickMission = () =>
    missionId === TODAYS_FOCUS_ID
      ? buildMixedMission(recentQuestions)
      : dealMission(missionById[missionId] ?? missions[0], recentQuestions);
  const [mission, setMission] = useState(pickMission);
  const insets = useSafeAreaInsets();

  // The run is one queue. A miss is appended to its tail, so the questions the
  // learner got wrong simply keep coming until the queue is through — there is
  // no second round to announce, just a longer run.
  const [queue, setQueue] = useState<number[]>(() => buildQueue(mission));
  const [step, setStep] = useState(0);

  const [answer, setAnswer] = useState<number | null>(null);
  const [entries, setEntries] = useState<string[]>([]);
  const [recording, setRecording] = useState(false);
  const [spokenCount, setSpokenCount] = useState(0);
  /** RV-2a: syllables heard so far, lit orange one by one. */
  const [spokenSyllables, setSpokenSyllables] = useState(0);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [done, setDone] = useState(false);
  /** The mic (or the browser's speech service) said no — speaking questions offer `Skip`. */
  const [micBlocked, setMicBlocked] = useState(false);
  /** Under the mic: why nothing was graded (blocked mic, nothing heard). */
  const [micNote, setMicNote] = useState<string | null>(null);
  /** Steps skipped without an answer — neither right nor wrong, and left out of MY-2. */
  const [skipped, setSkipped] = useState<number[]>([]);
  /**
   * Silent takes on this question. The first opens the skip sheet; a second
   * is graded wrong — by then the sheet has already offered the way out.
   */
  const [silentTakes, setSilentTakes] = useState(0);
  /** The bottom sheet asking to skip speaking practice on this question. */
  const [skipAsk, setSkipAsk] = useState(false);
  /** Fires when no first word arrives in time; cleared by the first word heard. */
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearSilenceTimer = () => {
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    silenceTimer.current = null;
  };
  useEffect(() => () => clearSilenceTimer(), []);
  /** Questions right on the first attempt — RV-2f's second stat. */
  /** Steps answered right on the first attempt (only steps inside the designed length count). */
  const [firstTryHits, setFirstTryHits] = useState<number[]>([]);
  const firstTry = firstTryHits.length;
  const hit = (at: number) =>
    setFirstTryHits((current) => (current.includes(at) ? current : [...current, at]));
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const meaningOf = useMeaning();
  const helpText = useHelpText();
  // Judged on entry (and on Retry), never mid-run: the finish itself uses
  // the allowance, and RV-2f must still show.
  const [allowed] = useState(freeLeft.missions > 0);
  const voice = useVoiceRecorder();
  const heard = useSpeechRecognition();

  // Remember what this run deals, so the next one leads with other questions.
  useEffect(() => {
    markQuestionsDealt(buildQueue(mission).map((index) => mission.questions[index].id));
  }, [mission, markQuestionsDealt]);

  const question = mission.questions[queue[step]];
  /** The skill this question drills — in a mixed run it changes question to question. */
  const kind = questionKind[question.id] ?? mission.kind;

  const reset = () => {
    graded.current = false;
    clearSilenceTimer();
    setSilentTakes(0);
    setSkipAsk(false);
    // A blocked mic stays blocked, so its note carries over; "say it again" doesn't.
    setMicNote((note) => (micBlocked ? note : null));
    heard.reset();
    setAnswer(null);
    setEntries([]);
    setRecording(false);
    setSpokenCount(0);
    setSpokenSyllables(0);
    setVerdict(null);
  };

  /**
   * A missed question goes to the back of the queue, once. A retry that misses
   * again is not re-appended: with the scoring still mocked, a question that
   * always grades wrong would never let the run end.
   */
  const judge = (result: Verdict) => {
    setVerdict(result);
    if (result.correct && step < mission.questionCount) hit(step);
    if (result.correct || step >= mission.questionCount) return;
    setQueue((current) =>
      current.includes(current[step], mission.questionCount) ? current : [...current, current[step]],
    );
  };

  const next = (skippedSteps = skipped) => {
    if (step + 1 < queue.length) {
      setStep(step + 1);
      reset();
      return;
    }
    const took = Date.now() - startedAt;
    setElapsed(took);
    // One row per skill drilled, so a mixed run feeds MY-2 for each of them.
    const bySkill = new Map<Mission['kind'], { correct: number; total: number }>();
    for (let at = 0; at < mission.questionCount; at += 1) {
      // A skipped question measured nothing.
      if (skippedSteps.includes(at)) continue;
      const skill = questionKind[mission.questions[queue[at]].id] ?? mission.kind;
      const row = bySkill.get(skill) ?? { correct: 0, total: 0 };
      row.total += 1;
      if (firstTryHits.includes(at)) row.correct += 1;
      bySkill.set(skill, row);
    }
    // A run where every question was skipped wasn't practice: nothing counts.
    if (bySkill.size > 0) {
      finishMission({
        minutes: Math.max(1, Math.round(took / 60000)),
        results: [...bySkill].map(([skill, row]) => ({ skill, ...row })),
      });
    }
    setDone(true);
  };

  /** Moves on without grading — the sheet's `Continue`. */
  const skip = () => {
    setSkipAsk(false);
    const list = skipped.includes(step) ? skipped : [...skipped, step];
    setSkipped(list);
    next(list);
  };

  /** RV-2f `Retry` — the same mission from the top, as a fresh run. */
  const restart = () => {
    if (freeLeft.missions <= 0) {
      router.replace('/plus?reason=missions');
      return;
    }
    reset();
    // A fresh deal, so Retry doesn't replay the same questions in the same order.
    const again = pickMission();
    setMission(again);
    setQueue(buildQueue(again));
    setStep(0);
    setFirstTryHits([]);
    setSkipped([]);
    setStartedAt(Date.now());
    setDone(false);
  };

  const stopRecording = voice.stop;

  /** 문장을 이루는 낱말 — 문장부호는 발음 판정에서 뺀다. */
  const speakWords =
    question.type === 'speak'
      ? question.tokens.map((token) => token.text).filter((word) => !isPunctuation(word))
      : [];

  /** 한 발화는 한 번만 판정한다 — stop()과 onend가 겹쳐 들어올 수 있다. */
  const graded = useRef(false);

  /**
   * 말하기 판정. 인식된 문장이 목표 문장과 같으면 정답이고, 아니면 목표
   * 문장을 보여준 뒤 실제로 들린 말을 적어준다 — 발음 연습에서는 무엇으로
   * 들렸는지가 가장 쓸모 있는 피드백이다.
   */
  const finishSpeak = (spoken: string, problem: RecognitionError = 'none') => {
    if (graded.current || question.type !== 'speak') return;
    graded.current = true;

    setRecording(false);
    heard.stop();
    stopRecording();

    clearSilenceTimer();
    if (!spoken.trim()) {
      graded.current = false;
      // A refused or broken speech service isn't the learner being silent:
      // say what's wrong (the Skip button stays there) rather than count it.
      if (problem === 'denied' || problem === 'network' || problem === 'failed') {
        if (problem === 'denied') setMicBlocked(true);
        setMicNote(recognitionMessage[problem]);
        return;
      }
      noAnswer();
      return;
    }

    const match = matchSentence(spoken, speakWords);
    // Reading the sentence through to its last word is the pass mark: the
    // orange that follows the reading reaching the end means it was all heard.
    if (match.correct || match.spokenCount >= speakWords.length) {
      setSpokenCount(speakWords.length);
      setSpokenSyllables(syllableCount(question.tokens));
      judge({ correct: true, note: helpText(question.feedback.explanation) });
      return;
    }
    judge({
      correct: false,
      headline: joinTokens(speakWords),
      note:
        problem !== 'none'
          ? recognitionMessage[problem]
          : `Heard: “${spoken.trim()}”`,
    });
  };

  /**
   * A take with nothing heard. The first offers to skip the question instead
   * of marking it wrong; a second on the same question is graded wrong.
   */
  const noAnswer = () => {
    if (silentTakes === 0) {
      setSilentTakes(1);
      setSkipAsk(true);
      return;
    }
    graded.current = true;
    judge({
      correct: false,
      headline: joinTokens(speakWords),
      note: "We didn't hear an answer this time either.",
    });
  };

  /** 말하는 대로 문장에 불이 켜지고, 끝까지 맞게 말하면 그 자리에서 판정된다. */
  const onHeard = (text: string) => {
    if (text.trim()) clearSilenceTimer();
    const match = matchSentence(text, speakWords);
    setSpokenCount(match.spokenCount);
    setSpokenSyllables(matchSyllables(text, speakWords.join('')));
    if (match.correct || match.spokenCount >= speakWords.length) finishSpeak(text);
  };

  /**
   * RV-2b reads as a live caption: while the mic is open the sentence lights up
   * word by word, and the verdict lands once the last word is through.
   * 인식이 되지 않는 환경(네이티브, Firefox)에서만 쓰는 목 경로다.
   */
  useEffect(() => {
    if (heard.supported) return undefined;
    if (!recording || question.type !== 'speak') return undefined;
    // 낱말 단위(RV-2b)와 음절 단위(RV-2a)를 같은 박자로 채운다.
    const bySyllable = kind === 'pronunciation';
    const total = bySyllable ? syllableCount(question.tokens) : question.tokens.length;
    let read = 0;
    const id = setInterval(() => {
      read += 1;
      if (bySyllable) setSpokenSyllables(read);
      else setSpokenCount(read);
      if (read < total) return;
      clearInterval(id);
      setRecording(false);
      stopRecording();
      // 끝까지 다 읽었으면 정답 — 인식 경로와 같은 기준.
      setVerdict({ correct: true, note: helpText(question.feedback.explanation) });
      if (step < mission.questionCount) hit(step);
    }, bySyllable ? 260 : 420);
    return () => clearInterval(id);
  }, [
    heard.supported,
    recording,
    question,
    step,
    mission.questionCount,
    kind,
    stopRecording,
    helpText,
  ]);

  const submitWrite = () => {
    if (question.type !== 'write') return;
    const wrong = question.blanks.map(
      (accepted, gap) =>
        !accepted.some((option) => normalize(option) === normalize(entries[gap] ?? '')),
    );
    if (!wrong.some(Boolean)) {
      judge({ correct: true, note: helpText(question.explanation) });
      return;
    }
    // The headline and the note follow the first gap that was missed, so the
    // explanation stays about the one thing this mission is drilling.
    const missedGap = wrong.indexOf(true);
    judge({
      correct: false,
      headline: `The answer is ${question.blanks[missedGap][0]}.`,
      note: helpText(question.blankNotes?.[missedGap] ?? question.explanation),
    });
  };

  const pick = (optionIndex: number) => {
    if (question.type !== 'choice' || verdict) return;
    setAnswer(optionIndex);
  };

  const submitChoice = () => {
    if (question.type !== 'choice' || answer === null) return;
    const correct = answer === question.answerIndex;
    judge({
      correct,
      note: helpText(question.explanation),
      headline: correct ? undefined : `The answer is ${question.options[question.answerIndex]}`,
    });
  };

  if (!allowed) return <Redirect href="/plus?reason=missions" />;

  if (done) {
    return (
      <MissionComplete
        title={mission.title}
        mixed={mission.id === TODAYS_FOCUS_ID}
        questionCount={mission.questionCount}
        firstTry={firstTry}
        elapsedMs={elapsed}
        onRetry={restart}
      />
    );
  }

  const nextLabel = step + 1 >= queue.length ? 'Finish' : 'Next';

  const header = (
    <>
      <NavBar title={mission.title} closeIcon onBack={() => router.replace('/(tabs)/review')} />
      <View style={styles.progress}>
        <StepProgress total={queue.length} completed={step + 1} />
      </View>
    </>
  );

  const panel = verdict ? (
    <FeedbackPanel
      correct={verdict.correct}
      headline={verdict.headline}
      note={verdict.note}
      nextLabel={nextLabel}
      onNext={() => next()}
      onPlayback={question.type === 'speak' && voice.hasClip ? voice.playBack : undefined}
    />
  ) : null;

  /**
   * RV-2a / RV-2b — a fixed three-band screen: prompt card, waveform, mic. The
   * bottom two step aside once the verdict is in, so the panel has the room.
   */
  if (question.type === 'speak') {
    return (
      <ScreenShell>
        {header}

        <View style={styles.speakScene}>
          <Card elevation="card" radiusToken="card" padding={24} style={styles.promptCard}>
            <Pressable
              onPress={() => speak(joinTokens(question.tokens.map((token) => token.text)))}
              accessibilityRole="button"
              accessibilityLabel="Replay the sentence"
              style={styles.speaker}
            >
              <SpeakerIcon size={18} />
            </Pressable>
            <KoreanText
              tokens={question.tokens}
              spokenCount={kind === 'fluency' ? spokenCount : 0}
              spokenSyllables={kind === 'pronunciation' ? spokenSyllables : 0}
              english={meaningOf(question)}
              meaning="always"
              captionStyle={styles.sentenceMeaning}
            />
          </Card>
          <KoreanVoiceNotice />
        </View>

        {verdict || skipAsk ? null : (
          <>
            <MicDock
              recording={recording}
              onSpeak={async () => {
                setSpokenCount(0);
                setSpokenSyllables(0);
                heard.reset();
                graded.current = false;
                // 권한이 없으면 파형만 돌고 아무것도 녹음되지 않으므로 함께 막는다.
                const on = await voice.start();
                setMicBlocked(!on);
                setMicNote(on ? null : micMessage(voice.permission));
                if (on && heard.supported) {
                  heard.start({
                    onTranscript: onHeard,
                    // 침묵으로 끊기거나 오류가 나도 그때까지 들린 말로 판정한다.
                    onEnd: finishSpeak,
                  });
                  // No first word in time: end the take as an empty one.
                  clearSilenceTimer();
                  silenceTimer.current = setTimeout(() => finishSpeak(''), NO_ANSWER_MS);
                }
                setRecording(on);
              }}
              // 인식이 되는 환경에서는 다 말했다고 알릴 방법이 있어야 한다.
              // 목 경로에서는 다시 누르면 이번 시도를 그만둔다.
              onStop={
                heard.supported
                  ? () => finishSpeak(heard.transcript)
                  : () => {
                      setRecording(false);
                      stopRecording();
                    }
              }
              onSkip={() => setSkipAsk(true)}
            />
            {micNote ? <Text style={styles.micNotice}>{micNote}</Text> : null}
          </>
        )}

        {panel}
        {skipAsk && !verdict ? (
          <SkipSheet
            onCancel={() => {
              // Back to the question, ready for another take.
              setSkipAsk(false);
              setMicNote((note) => (micBlocked ? note : null));
              graded.current = false;
            }}
            onContinue={skip}
          />
        ) : null}
      </ScreenShell>
    );
  }

  /**
   * RV-2c / RV-2d / RV-2e — the learner types the Korean into the gaps. The
   * body lifts with the keyboard so neither the sentence nor `Submit` is buried.
   */
  if (question.type === 'write') {
    return (
      <ScreenShell>
        {header}

        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.scene, { paddingBottom: insets.bottom }]}>
            <WriteCard
              question={question}
              entries={entries}
              judged={verdict !== null}
              onChange={(gap, value) =>
                setEntries((current) => {
                  const draft = [...current];
                  draft[gap] = value;
                  return draft;
                })
              }
            />

            {verdict ? null : (
              <View style={styles.submit}>
                <Button
                  label="Submit"
                  height={52}
                  disabled={question.blanks.some((_, gap) => (entries[gap] ?? '').trim() === '')}
                  onPress={submitWrite}
                />
              </View>
            )}
          </View>
        </KeyboardAvoidingView>

        {panel}
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      {header}

      <View style={styles.scene}>
        <ChoiceCard question={question} answer={answer} />
      </View>

      <View style={styles.options}>
        {question.options.map((option, optionIndex) => {
          const selected = answer === optionIndex;
          const isAnswer = optionIndex === question.answerIndex;
          const judged = verdict !== null;
          return (
            <Pressable
              key={option}
              onPress={() => pick(optionIndex)}
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled: judged }}
              style={[
                styles.option,
                // Chosen but not graded yet — the answer is still the learner's
                // to change, so it reads as a choice rather than a result.
                selected && !judged ? styles.optionPicked : null,
                judged && selected && !isAnswer ? styles.optionWrong : null,
                judged && isAnswer ? styles.optionRight : null,
              ]}
            >
              <Text
                style={
                  judged && isAnswer
                    ? styles.optionLabelRight
                    : judged && selected
                      ? styles.optionLabelWrong
                      : selected
                        ? styles.optionLabelPicked
                        : styles.optionLabel
                }
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* The comp's dock, with `Submit` where the static mock draws `Next`. */}
      <CtaDock paddingTop={16} style={styles.choiceDock}>
        <Button
          label="Submit"
          disabled={answer === null || verdict !== null}
          onPress={submitChoice}
        />
      </CtaDock>

      {panel}
    </ScreenShell>
  );
}

/**
 * The one verdict surface for all three drills: it rises from the foot of the
 * screen, green when the answer was right and red when it was not, and carries
 * the only `Next` on the screen. A miss shows what was written against what was
 * expected; it is not re-asked here, it comes back in the second pass.
 */
function FeedbackPanel({
  correct,
  headline,
  note,
  nextLabel,
  onNext,
  onPlayback,
}: {
  correct: boolean;
  headline?: string;
  note: string;
  nextLabel: string;
  onNext: () => void;
  /** 말하기 문제에서 방금 녹음된 발화가 있을 때만 들어온다. */
  onPlayback?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const tone = correct ? colors.success : colors.danger;

  return (
    <Animated.View
      entering={SlideInDown.duration(260)}
      style={[
        styles.panel,
        {
          backgroundColor: correct ? colors.successBg : colors.dangerBg,
          paddingBottom: insets.bottom + spacing.lg,
        },
      ]}
    >
      <Text style={[styles.panelTitle, { color: tone }]}>{correct ? 'Nice!' : 'Not quite'}</Text>

      {headline ? <Text style={styles.panelHeadline}>{headline}</Text> : null}
      <Text style={styles.panelNote}>{note}</Text>

      {onPlayback ? (
        <Pressable onPress={onPlayback} accessibilityRole="button" hitSlop={8}>
          <Text style={[styles.panelPlayback, { color: tone }]}>Play back your answer</Text>
        </Pressable>
      ) : null}

      <Button
        label={nextLabel}
        height={52}
        style={{ backgroundColor: tone }}
        onPress={onNext}
      />
    </Animated.View>
  );
}

/**
 * The mic band: `20px 24px 12px` over the home indicator, with the comp's two
 * empty 63×44 slots holding the 84px button dead centre.
 */
function MicDock({
  recording,
  onSpeak,
  onStop,
  onSkip,
}: {
  recording: boolean;
  onSpeak: () => void;
  /** 녹음 중 다시 눌러 발화를 끝내는 동작. */
  onStop: () => void;
  /** Opens the skip sheet. Lives in the dock's right slot, out of the mic's way. */
  onSkip: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.micDock, { paddingBottom: 12 + insets.bottom }]}>
      <View style={styles.micSlot} />
      {/* MicButton이 상태에 맞는 라벨(Start/Stop recording)을 스스로 붙인다. */}
      <MicButton size={84} active={recording} onPress={recording ? onStop : onSpeak} />
      <View style={styles.micSlot}>
        {recording ? null : (
          <Pressable
            onPress={onSkip}
            accessibilityRole="button"
            accessibilityLabel="Skip this question"
            hitSlop={8}
            style={styles.skipButton}
          >
            <Text style={styles.skipLabel}>Skip</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

/**
 * Rises like the verdict panel, but neutral: skipping is neither right nor
 * wrong. Shown after the first silent take, or when the learner taps `Skip`.
 */
function SkipSheet({ onCancel, onContinue }: { onCancel: () => void; onContinue: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      entering={SlideInDown.duration(260)}
      style={[
        styles.panel,
        styles.skipSheet,
        { paddingBottom: insets.bottom + spacing.lg },
      ]}
    >
      <Text style={styles.skipTitle}>Skip this one?</Text>
      <Text style={styles.panelNote}>
        We&apos;ll skip speaking practice for this question. It won&apos;t count as right or
        wrong.
      </Text>
      <View style={styles.skipActions}>
        <Button
          label="Cancel"
          variant="tonal"
          height={52}
          style={styles.skipAction}
          onPress={onCancel}
        />
        <Button label="Continue" height={52} style={styles.skipAction} onPress={onContinue} />
      </View>
    </Animated.View>
  );
}

/**
 * RV-2c / RV-2d / RV-2e — the situation or meaning first, then the Korean
 * sentence with only the part being drilled left open. A template splits into a
 * field per gap; without one the learner writes the whole sentence.
 */
function WriteCard({
  question,
  entries,
  judged,
  onChange,
}: {
  question: WriteQuestion;
  entries: string[];
  judged: boolean;
  onChange: (gap: number, value: string) => void;
}) {
  const helpText = useHelpText();
  const segments = question.template ? question.template.split('___') : null;

  // Each gap is marked on its own: getting the particle wrong should not paint
  // the one the learner got right.
  const gapOk = (gap: number) =>
    question.blanks[gap].some((option) => normalize(option) === normalize(entries[gap] ?? ''));

  /**
   * The blank is as wide as the answer it takes — one syllable for 를, two for
   * 에서 — so the sentence still reads as a sentence while it is being filled.
   * 22px is the sentence size, which is one Korean syllable wide.
   */
  const gapWidth = (gap: number) =>
    Math.min(240, Math.max(30, Math.max(...question.blanks[gap].map((a) => a.length)) * 22 + 8));

  /** Once it is graded the sentence reads as written: only a wrong gap is red. */
  const filled = (gap: number) => (
    <Text
      key={`gap-${gap}`}
      style={[styles.gapFilled, gapOk(gap) ? null : styles.gapFilledWrong]}
    >
      {(entries[gap] ?? '').trim()}
    </Text>
  );

  const field = (gap: number, inline: boolean) => (
    <TextInput
      key={`gap-${gap}`}
      value={entries[gap] ?? ''}
      onChangeText={(value) => onChange(gap, value)}
      placeholder={inline ? '' : 'Write it in Korean'}
      placeholderTextColor={colors.textTertiary}
      accessibilityLabel={question.template ? `Blank ${gap + 1}` : 'Your sentence'}
      style={inline ? [styles.gapField, { width: gapWidth(gap) }] : styles.writeField}
    />
  );

  /** 빈칸을 정답으로 채운 문장 — 소리 버튼이 읽어준다. */
  const answerSentence = question.template
    ? question.template
        .split('___')
        .reduce((line, part, gap) => line + part + (question.blanks[gap]?.[0] ?? ''), '')
    : (question.blanks[0]?.[0] ?? '');

  return (
    <Card elevation="card" radiusToken="card" padding={24} style={styles.promptCard}>
      <Pressable
        // The finished sentence, answer filled in — before and after grading alike.
        onPress={() => speak(answerSentence)}
        accessibilityRole="button"
        accessibilityLabel="Replay the sentence"
        style={styles.speaker}
      >
        <SpeakerIcon size={18} />
      </Pressable>

      {question.source ? <Text style={styles.writeSource}>{question.source}</Text> : null}

      {segments ? (
        <View style={styles.gapLine}>
          {segments.map((part, gap) => (
            <View key={`seg-${gap}`} style={styles.gapSegment}>
              {part ? <Text style={styles.gapText}>{part}</Text> : null}
              {gap < question.blanks.length ? (judged ? filled(gap) : field(gap, true)) : null}
            </View>
          ))}
        </View>
      ) : judged ? (
        filled(0)
      ) : (
        field(0, false)
      )}

      <Text style={styles.sentenceMeaning}>{helpText(question.prompt)}</Text>
    </Card>
  );
}

/** RV-2f — pick the answer that fits. */
function ChoiceCard({ question, answer }: { question: ChoiceQuestion; answer: number | null }) {
  const meaningOf = useMeaning();
  const [showMeaning, setShowMeaning] = useState(false);

  // The comp draws the answer sentence word by word, each on its own dotted rule.
  const sentenceTokens = useMemo<Token[]>(() => {
    // Until it is filled the gap stands on its own, as an orange rule; only the
    // answer fuses onto the word before it, and only for a particle.
    if (answer === null) {
      return question.sentenceTokens.map((token) =>
        token ? { text: token.text } : { text: '', blank: true },
      );
    }
    const parts = question.sentenceTokens.map((token) =>
      token ? token.text : question.options[answer],
    );
    if (!question.blankAttachesLeft) return parts.map((text) => ({ text }));
    const gap = question.sentenceTokens.findIndex((token) => token === null);
    return parts
      .reduce<string[]>((acc, part, index) => {
        if (index === gap && acc.length) acc[acc.length - 1] += part;
        else acc.push(part);
        return acc;
      }, [])
      .map((text) => ({ text }));
  }, [question, answer]);

  return (
    <Card elevation="card" radiusToken="card" padding={24} style={styles.promptCard}>
      <View style={styles.promptHeader}>
        <View style={styles.promptHeaderLeft}>
          <Pressable
            onPress={() => speak(joinTokens(question.promptTokens.map((token) => token.text)))}
            accessibilityRole="button"
            accessibilityLabel="Replay the question"
            style={styles.speaker}
          >
            <SpeakerIcon size={18} />
          </Pressable>
          <Text style={styles.promptLabel}>{question.promptLabel}</Text>
        </View>
        <Pressable
          onPress={() => setShowMeaning((value) => !value)}
          accessibilityRole="button"
          accessibilityState={{ expanded: showMeaning }}
          style={styles.meaningPill}
        >
          <Text style={styles.meaningLabel}>Meaning</Text>
          <DropdownChevronIcon color={colors.textSecondary} />
        </Pressable>
      </View>

      <KoreanText tokens={question.promptTokens} />
      {showMeaning ? <Text style={type.caption}>{meaningOf({ english: question.promptEnglish, meanings: question.promptMeanings })}</Text> : null}

      {sentenceTokens.length > 0 ? (
        <KoreanText
          tokens={sentenceTokens}
          underlineColor={colors.primary}
          style={styles.answerSentence}
        />
      ) : null}
    </Card>
  );
}

/**
 * RV-2f Mission complete. The comp is a white screen with only a close control
 * at the top right, the result stack optically centred in what is left, and a
 * two-button dock at the foot.
 */
function MissionComplete({
  title,
  questionCount,
  firstTry,
  elapsedMs,
  onRetry,
  mixed = false,
}: {
  /** Today's focus — the caption names the six skills, not one mission. */
  mixed?: boolean;
  title: string;
  questionCount: number;
  firstTry: number;
  elapsedMs: number;
  onRetry: () => void;
}) {
  const seconds = Math.round(elapsedMs / 1000);
  const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  const leave = () => router.replace('/(tabs)/review');

  return (
    <ScreenShell background="surface" bottomEdge="dock">
      <View style={styles.completeBar}>
        <Pressable
          onPress={leave}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={styles.completeClose}
        >
          <BackChevronIcon close color={colors.textTertiary} />
        </Pressable>
      </View>

      <View style={styles.completeBody}>
        <View style={styles.completeHead}>
          <View style={styles.completeRing}>
            {/*
              The comp draws the tick in a 56 viewBox rendered at 98: 42px wide
              with a 7px stroke. Our 24-unit glyph spans 14 units, so size 72
              and weight 2.3 land on the same geometry.
            */}
            <CheckIcon size={72} weight={2.3} color={colors.primary} />
          </View>

          <View style={styles.completeText}>
            <Text style={styles.completeTitle}>Mission complete!</Text>
            <Text style={styles.completeCaption}>
              {mixed
                ? `You finished all ${questionCount} questions\nacross all six skills.`
                : `You finished all ${questionCount} questions of\nthe ${title.toLowerCase()} mission.`}
            </Text>
          </View>
        </View>

        <View style={styles.statPanel}>
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{time}</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
          <View style={styles.statDivider} />
          {/* A per-skill gain needs server scoring; first-try accuracy is measured here. */}
          <View style={styles.statCell}>
            <Text style={[styles.statValue, styles.statValueUp]}>
              {firstTry}/{questionCount}
            </Text>
            <Text style={styles.statLabel}>First try</Text>
          </View>
        </View>
      </View>

      {/* The comp's dock carries no top shadow — the screen is white throughout. */}
      <CtaDock paddingTop={12} gap={10} style={styles.completeDock}>
        <Button label="Done" onPress={leave} />
        <Pressable onPress={onRetry} accessibilityRole="button" style={styles.retry}>
          <Text style={styles.retryLabel}>Retry</Text>
        </Pressable>
      </CtaDock>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  micNotice: {
    ...type.caption,
    textAlign: 'center',
    paddingHorizontal: spacing.gutter,
    paddingBottom: 8,
  },
  progress: {
    paddingHorizontal: spacing.gutter,
    paddingTop: 25,
  },
  /**
   * The band between the progress bar and whatever the drill puts at the foot.
   * RV-2a declares `padding:30px 24px 0; gap:24; margin-bottom:20`; the written
   * and choice comps use the same band at gap 16.
   */
  speakScene: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: spacing.gutter,
    marginBottom: 20,
    gap: 24,
  },
  scene: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: spacing.gutter,
    marginBottom: 20,
    gap: 16,
  },
  /** One height for every drill, so the screen does not jump between axes. */
  promptCard: {
    height: MISSION_CARD_HEIGHT,
    gap: 8,
  },
  /** `Submit` sits at the foot of the band and rides up with the keyboard. */
  submit: {
    marginTop: 'auto',
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promptHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  speaker: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptLabel: {
    ...type.badge,
    color: colors.textTertiary,
    flexShrink: 1,
  },
  meaningPill: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  meaningLabel: text(11, 16, '600', colors.textSecondary),
  answerSentence: {
    marginTop: 4,
  },
  /** `12/18/400 #B0B8C1` — the meaning line under a spoken sentence. */
  sentenceMeaning: text(12, 18, '400', colors.textTertiary),
  writeSource: text(16, 24, '500', colors.textTertiary),
  writeField: {
    ...text(18, 26, '600', colors.inkAlt),
    marginTop: 8,
    minHeight: 52,
    borderRadius: radius.search,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  gapLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 6,
  },
  gapSegment: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gapText: text(22, 34, '600', colors.inkAlt),
  /**
   * An inline blank, not a field: a rule under it is the only chrome, and the
   * rule stays once it is filled so the sentence still reads as one sentence.
   */
  gapField: {
    ...text(22, 34, '600', colors.inkAlt),
    // Never flexible, or the field grows to the row and breaks the sentence apart.
    flexGrow: 0,
    flexShrink: 0,
    height: 34,
    paddingVertical: 0,
    paddingHorizontal: 2,
    marginHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    textAlign: 'center',
  },
  gapFilled: {
    ...text(22, 34, '600', colors.inkAlt),
    paddingHorizontal: 2,
    marginHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  gapFilledWrong: {
    color: colors.danger,
    borderBottomColor: colors.danger,
  },
  options: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.gutter,
    paddingVertical: 24,
    gap: 8,
  },
  option: {
    height: 48,
    borderRadius: radius.search,
    backgroundColor: colors.fill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  optionPicked: {
    backgroundColor: colors.primary100,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  optionRight: {
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: colors.success,
  },
  optionWrong: {
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  optionLabel: text(16, 22, '500', colors.inkAlt),
  optionLabelPicked: text(16, 22, '600', colors.primary),
  optionLabelRight: text(16, 22, '600', colors.success),
  optionLabelWrong: text(16, 22, '600', colors.danger),
  /** The comp declares `0 0 0 0` on this dock — no shadow under the options. */
  choiceDock: {
    shadowOpacity: 0,
    elevation: 0,
  },
  /** `padding:20px 24px 12px`; the 12 sits on top of the home indicator. */
  micDock: {
    paddingTop: 20,
    paddingHorizontal: spacing.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    // The top shadow the bar band above it used to carry; the band is gone.
    ...shadows.bottomNav,
  },
  /** The comp's empty side slots — 27px wide inside 18px padding — centre the mic. */
  micSlot: {
    width: 63,
    height: 44,
  },
  skipButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipLabel: text(14, 20, '600', colors.textSecondary),
  skipSheet: {
    backgroundColor: colors.surface,
    ...shadows.bottomNav,
  },
  skipTitle: text(18, 26, '700', colors.inkAlt),
  skipActions: {
    flexDirection: 'row',
    gap: 8,
  },
  skipAction: {
    flex: 1,
  },
  /**
   * The verdict is a layer, not a row: it rises from the bottom edge and covers
   * whatever the drill had down there — the option rows on a choice question,
   * the mic band on a spoken one.
   */
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xl,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    gap: 10,
    ...shadows.dock,
  },
  panelTitle: text(18, 26, '700', colors.success),
  panelHeadline: text(16, 24, '600', colors.inkAlt),
  panelNote: {
    ...text(14, 21, '500', colors.textSecondary),
    paddingBottom: 4,
  },
  /** 패널 안에서 Next 위에 놓이는 보조 동작 — 버튼이 아니라 글자 링크다. */
  panelPlayback: {
    ...text(14, 20, '600'),
    paddingBottom: 8,
  },
  /** `height:52; padding:0 20; justify-content:flex-end` — close control only. */
  completeBar: {
    height: layout.navBarHeight,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  completeClose: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** `flex:1; padding:0 34; gap:28; centred` — the comp's optical centre. */
  completeBody: {
    flex: 1,
    paddingHorizontal: 34,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxl,
  },
  completeHead: {
    alignItems: 'center',
    gap: spacing.xl,
  },
  completeRing: {
    width: 90,
    height: 90,
    borderRadius: radius.pill,
    borderWidth: 5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeText: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  completeTitle: {
    ...text(28, 38, '700', colors.primary),
    textAlign: 'center',
  },
  completeCaption: {
    ...text(15, 23, '400', colors.textBody),
    textAlign: 'center',
  },
  /** `width:232; radius:13; padding:18 20` on `#F6F6F6`, two cells either side of a rule. */
  statPanel: {
    width: 232,
    borderRadius: radius.stat,
    paddingVertical: 18,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.fillSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: numeral(20, 28, '700', colors.inkAlt),
  statValueUp: {
    color: colors.primary,
  },
  statLabel: text(12, 16, '500', colors.textSecondary),
  statDivider: {
    width: 1,
    height: 34,
    backgroundColor: colors.divider,
  },
  completeDock: {
    shadowOpacity: 0,
    elevation: 0,
  },
  /** `height:44; radius:16` on `#F2F3F5` with a 14/600 label. */
  retry: {
    height: 44,
    borderRadius: radius.card,
    backgroundColor: colors.fill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryLabel: text(14, 20, '600', colors.inkAlt),
});
