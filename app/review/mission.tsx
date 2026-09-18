import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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
import { KoreanText, joinTokens } from '@/components/KoreanText';
import { MicButton } from '@/components/MicButton';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { StepProgress } from '@/components/StepProgress';
import { missionById, missions } from '@/data/missions';
import type { ChoiceQuestion, Mission, Token, WriteQuestion } from '@/data/types';
import { DropdownChevronIcon, SpeakerIcon } from '@/icons';
import { colors, radius, shadows, spacing } from '@/theme/tokens';
import { text, type } from '@/theme/typography';

/** Every RV-2 prompt card is the same height, whichever way the axis is drilled. */
const MISSION_CARD_HEIGHT = 300;

/** Spacing and punctuation are noise for every axis these drills grade. */
const normalize = (value: string) => value.replace(/[\s.,!?~]/g, '');

/**
 * Rebuilds the sentence around the gaps, marking the ones that were missed.
 * Both the written line and the answer line are built this way, so they line up
 * word for word and only the drilled part reads differently.
 */
const sentenceParts = (
  question: WriteQuestion,
  fill: (gap: number) => string,
  wrong: boolean[],
): Part[] => {
  if (!question.template) return [{ text: fill(0), mark: true }];
  return question.template.split('___').flatMap((chunk, gap) => [
    ...(chunk ? [{ text: chunk }] : []),
    ...(gap < question.blanks.length ? [{ text: fill(gap), mark: wrong[gap] }] : []),
  ]);
};

/** The run order: the authored items, cycled up to the mission's designed length. */
const buildQueue = (mission: Mission) =>
  Array.from({ length: mission.questionCount }, (_, i) => i % mission.questions.length);

/** A sentence split so the part being drilled can be picked out of it. */
type Part = { text: string; mark?: boolean };

type Verdict = {
  correct: boolean;
  /** Names the right answer outright, e.g. `The answer is 를.` */
  headline?: string;
  /** One line, about the axis this mission drills — not the whole sentence. */
  note: string;
  /** What the learner produced, with the part they got wrong marked. */
  given?: { label: string; parts: Part[] };
  /** The right version, with the corrected part marked. */
  expected?: { label: string; parts: Part[] };
};

/**
 * RV-2a … RV-2f. One runner, three ways to drill: speaking missions use the mic,
 * writing missions grade what the learner typed into the gaps, choice missions
 * grade on tap. The header, the progress bar, the 300px prompt card and the
 * feedback panel are the same in all three, and `Next` lives only inside that
 * panel. A miss is not re-asked on the spot — it comes back in a second pass
 * once the run is through.
 */
export default function MissionRunner() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>();
  const mission = missionById[missionId] ?? missions[0];
  const insets = useSafeAreaInsets();

  const [queue, setQueue] = useState<number[]>(() => buildQueue(mission));
  const [step, setStep] = useState(0);
  const [missed, setMissed] = useState<number[]>([]);
  const [reviewRound, setReviewRound] = useState(false);

  const [answer, setAnswer] = useState<number | null>(null);
  const [entries, setEntries] = useState<string[]>([]);
  const [recording, setRecording] = useState(false);
  const [spokenCount, setSpokenCount] = useState(0);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [done, setDone] = useState(false);

  const question = mission.questions[queue[step]];

  const reset = () => {
    setAnswer(null);
    setEntries([]);
    setRecording(false);
    setSpokenCount(0);
    setVerdict(null);
  };

  /** Records a miss so the second pass can re-ask it. */
  const judge = (result: Verdict) => {
    if (!result.correct && !reviewRound) {
      setMissed((current) =>
        current.includes(queue[step]) ? current : [...current, queue[step]],
      );
    }
    setVerdict(result);
  };

  const next = () => {
    if (step + 1 < queue.length) {
      setStep(step + 1);
      reset();
      return;
    }
    // One second pass over the misses, then the run is over — a drill that
    // keeps re-asking a miss it just showed the answer to is a loop, not practice.
    if (!reviewRound && missed.length) {
      setQueue(missed);
      setMissed([]);
      setReviewRound(true);
      setStep(0);
      reset();
      return;
    }
    setDone(true);
  };

  /**
   * RV-2b reads as a live caption: while the mic is open the sentence lights up
   * word by word, and the verdict lands once the last word is through.
   */
  useEffect(() => {
    if (!recording || question.type !== 'speak') return undefined;
    const total = question.tokens.length;
    let read = 0;
    const id = setInterval(() => {
      read += 1;
      setSpokenCount(read);
      if (read < total) return;
      clearInterval(id);
      setRecording(false);
      setVerdict({
        correct: question.feedback.correct,
        note: question.feedback.explanation,
        // Nothing was typed, so the model reading is the answer to show.
        expected: question.feedback.correct
          ? undefined
          : {
              label: 'Say this',
              parts: [{ text: joinTokens(question.tokens.map((token) => token.text)) }],
            },
      });
      if (!question.feedback.correct && !reviewRound) {
        setMissed((current) =>
          current.includes(queue[step]) ? current : [...current, queue[step]],
        );
      }
    }, 420);
    return () => clearInterval(id);
  }, [recording, question, queue, step, reviewRound]);

  const submitWrite = () => {
    if (question.type !== 'write') return;
    const wrong = question.blanks.map(
      (accepted, gap) =>
        !accepted.some((option) => normalize(option) === normalize(entries[gap] ?? '')),
    );
    if (!wrong.some(Boolean)) {
      judge({ correct: true, note: question.explanation });
      return;
    }
    // The headline and the note follow the first gap that was missed, so the
    // explanation stays about the one thing this mission is drilling.
    const missedGap = wrong.indexOf(true);
    judge({
      correct: false,
      headline: `The answer is ${question.blanks[missedGap][0]}.`,
      note: question.blankNotes?.[missedGap] ?? question.explanation,
      given: {
        label: 'You wrote',
        parts: sentenceParts(question, (gap) => (entries[gap] ?? '').trim(), wrong),
      },
      expected: {
        label: 'Answer',
        parts: sentenceParts(question, (gap) => question.blanks[gap][0], wrong),
      },
    });
  };

  const pick = (optionIndex: number) => {
    if (question.type !== 'choice' || verdict) return;
    const correct = optionIndex === question.answerIndex;
    setAnswer(optionIndex);
    judge({
      correct,
      note: question.explanation,
      given: correct
        ? undefined
        : { label: 'You picked', parts: [{ text: question.options[optionIndex], mark: true }] },
      expected: correct
        ? undefined
        : {
            label: 'Answer',
            parts: [{ text: question.options[question.answerIndex], mark: true }],
          },
    });
  };

  if (done) {
    return <MissionComplete title={mission.title} questionCount={mission.questionCount} />;
  }

  const lastOfRun = step + 1 >= queue.length && (reviewRound || missed.length === 0);
  const nextLabel = lastOfRun ? 'Finish' : 'Next';

  const header = (
    <>
      <NavBar title={mission.title} closeIcon onBack={() => router.replace('/(tabs)/review')} />
      <View style={styles.progress}>
        <StepProgress total={queue.length} completed={step + 1} />
        {reviewRound ? (
          <Text style={styles.roundNote}>Second pass — the ones you missed</Text>
        ) : null}
      </View>
    </>
  );

  const panel = verdict ? (
    <FeedbackPanel
      correct={verdict.correct}
      headline={verdict.headline}
      note={verdict.note}
      given={verdict.given}
      expected={verdict.expected}
      nextLabel={nextLabel}
      onNext={next}
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
            <View style={styles.speaker}>
              <SpeakerIcon size={18} />
            </View>
            <KoreanText
              tokens={question.tokens}
              spokenCount={mission.kind === 'fluency' ? spokenCount : 0}
              english={question.english}
              meaning="always"
              captionStyle={styles.sentenceMeaning}
            />
          </Card>
        </View>

        {verdict ? null : (
          <>
            <Waveband active={recording} />
            <MicDock
              recording={recording}
              onSpeak={() => {
                setSpokenCount(0);
                setRecording(true);
              }}
            />
          </>
        )}

        {panel}
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

      <View style={[styles.options, { paddingBottom: 24 + insets.bottom }]}>
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
                selected && !isAnswer ? styles.optionWrong : null,
                judged && isAnswer ? styles.optionRight : null,
              ]}
            >
              <Text
                style={
                  judged && isAnswer
                    ? styles.optionLabelRight
                    : selected
                      ? styles.optionLabelWrong
                      : styles.optionLabel
                }
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

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
  given,
  expected,
  nextLabel,
  onNext,
}: {
  correct: boolean;
  headline?: string;
  note: string;
  given?: { label: string; parts: Part[] };
  expected?: { label: string; parts: Part[] };
  nextLabel: string;
  onNext: () => void;
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

      {given || expected ? (
        <View style={styles.compare}>
          {given ? <CompareLine label={given.label} parts={given.parts} tone="given" /> : null}
          {expected ? (
            <CompareLine label={expected.label} parts={expected.parts} tone="expected" />
          ) : null}
        </View>
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
 * One side of the miss: the sentence with only the drilled part picked out —
 * struck through in red on what was produced, bold green on what it should be.
 */
function CompareLine({
  label,
  parts,
  tone,
}: {
  label: string;
  parts: Part[];
  tone: 'given' | 'expected';
}) {
  const given = tone === 'given';
  return (
    <View style={styles.compareRow}>
      <Text style={styles.compareLabel}>{label}</Text>
      <Text style={given ? styles.compareGiven : styles.compareExpected}>
        {parts.map((part, index) => (
          <Text
            key={index}
            style={
              part.mark ? (given ? styles.compareMarkGiven : styles.compareMarkExpected) : null
            }
          >
            {part.text}
          </Text>
        ))}
      </Text>
    </View>
  );
}

/**
 * The comp's ten-bar band above the mic: `0 -4px 24px` top shadow, 16px of
 * padding over a 40px bar box. Bar heights and tints are the declared values.
 */
const WAVE_BARS = [
  { height: 10, color: colors.primary200 },
  { height: 22, color: colors.primary300 },
  { height: 32, color: colors.primary },
  { height: 16, color: colors.primary300 },
  { height: 26, color: colors.primary },
  { height: 12, color: colors.primary200 },
  { height: 22, color: colors.primary300 },
  { height: 36, color: colors.primary },
  { height: 18, color: colors.primary300 },
  { height: 9, color: colors.primary200 },
];

function Waveband({ active }: { active: boolean }) {
  return (
    <View style={styles.waveband}>
      {WAVE_BARS.map((bar, index) => (
        <View
          key={index}
          style={[
            styles.waveBar,
            { height: bar.height, backgroundColor: bar.color },
            // Idle the band reads as a hint; while the mic is open it is live.
            active ? null : styles.waveBarIdle,
          ]}
        />
      ))}
    </View>
  );
}

/**
 * The mic band: `20px 24px 12px` over the home indicator, with the comp's two
 * empty 63×44 slots holding the 84px button dead centre.
 */
function MicDock({ recording, onSpeak }: { recording: boolean; onSpeak: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.micDock, { paddingBottom: 12 + insets.bottom }]}>
      <View style={styles.micSlot} />
      <MicButton size={84} active={recording} onPress={recording ? undefined : onSpeak} />
      <View style={styles.micSlot} />
    </View>
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
  const segments = question.template ? question.template.split('___') : null;

  // Each gap is marked on its own: getting the particle wrong should not paint
  // the one the learner got right.
  const gapOk = (gap: number) =>
    question.blanks[gap].some((option) => normalize(option) === normalize(entries[gap] ?? ''));

  // A fixed gap clips a 4-syllable ending, so each one takes its answer's width.
  const gapWidth = (gap: number) =>
    Math.min(240, Math.max(64, Math.max(...question.blanks[gap].map((a) => a.length)) * 22 + 22));

  const field = (gap: number, inline: boolean) => (
    <TextInput
      key={`gap-${gap}`}
      value={entries[gap] ?? ''}
      onChangeText={(value) => onChange(gap, value)}
      editable={!judged}
      placeholder={inline ? '' : 'Write it in Korean'}
      placeholderTextColor={colors.textTertiary}
      accessibilityLabel={question.template ? `Blank ${gap + 1}` : 'Your sentence'}
      style={[
        inline ? [styles.gapField, { width: gapWidth(gap) }] : styles.writeField,
        judged ? (gapOk(gap) ? styles.fieldRight : styles.fieldWrong) : null,
      ]}
    />
  );

  return (
    <Card elevation="card" radiusToken="card" padding={24} style={styles.promptCard}>
      <Text style={styles.promptLabel}>{question.promptLabel}</Text>
      <Text style={styles.writePrompt}>{question.prompt}</Text>
      {question.source ? <Text style={styles.writeSource}>{question.source}</Text> : null}

      {segments ? (
        <View style={styles.gapLine}>
          {segments.map((part, gap) => (
            <View key={`seg-${gap}`} style={styles.gapSegment}>
              {part ? <Text style={styles.gapText}>{part}</Text> : null}
              {gap < question.blanks.length ? field(gap, true) : null}
            </View>
          ))}
        </View>
      ) : (
        field(0, false)
      )}
    </Card>
  );
}

/** RV-2f — pick the answer that fits. */
function ChoiceCard({ question, answer }: { question: ChoiceQuestion; answer: number | null }) {
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
          <View style={styles.speaker}>
            <SpeakerIcon size={18} />
          </View>
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
      {showMeaning ? <Text style={type.caption}>{question.promptEnglish}</Text> : null}

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

/** RV-2f Mission complete */
function MissionComplete({
  title,
  questionCount,
}: {
  title: string;
  questionCount: number;
}) {
  return (
    <ScreenShell background="surface">
      <Screen contentStyle={styles.completeContent}>
        <View style={styles.completeText}>
          <Text style={type.screenTitle}>Mission complete!</Text>
          <Text style={type.secondary}>
            You finished all {questionCount} questions of{'\n'}the {title.toLowerCase()} mission.
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCell}>
            <Text style={styles.summaryValue}>4:12</Text>
            <Text style={type.caption}>Time</Text>
          </View>
          <View style={styles.summaryCell}>
            <Text style={[styles.summaryValue, styles.summaryValueGood]}>↑6</Text>
            <Text style={type.caption}>Politeness</Text>
          </View>
        </View>
      </Screen>

      <CtaDock row gap={10}>
        <Button
          label="Retry"
          variant="elevated"
          style={styles.completeButton}
          onPress={() => router.replace('/(tabs)/review')}
        />
        <Button
          label="Done"
          style={styles.completeButton}
          onPress={() => router.replace('/(tabs)/review')}
        />
      </CtaDock>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  progress: {
    paddingHorizontal: spacing.gutter,
    paddingTop: 25,
    gap: 8,
  },
  roundNote: text(12, 18, '400', colors.textTertiary),
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
  writePrompt: {
    ...type.section,
    marginTop: 2,
  },
  writeSource: {
    ...text(16, 24, '500', colors.textSecondary),
    marginTop: -2,
  },
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
  gapField: {
    ...text(22, 34, '600', colors.primary),
    // Never flexible, or the field grows to the row and breaks the sentence apart.
    flexGrow: 0,
    flexShrink: 0,
    height: 40,
    borderRadius: radius.badge,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    textAlign: 'center',
    marginHorizontal: 2,
  },
  fieldRight: {
    borderColor: colors.success,
    backgroundColor: colors.successBg,
  },
  fieldWrong: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerBg,
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
  optionLabelRight: text(16, 22, '600', colors.success),
  optionLabelWrong: text(16, 22, '600', colors.danger),
  /** `height:40` of bars over `padding:16px 24px 0`, so the band is 56 tall. */
  waveband: {
    height: 56,
    paddingTop: 16,
    paddingHorizontal: spacing.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    ...shadows.bottomNav,
  },
  waveBar: {
    width: 4,
    borderRadius: radius.pill,
  },
  waveBarIdle: {
    opacity: 0.45,
  },
  /** `padding:20px 24px 12px`; the 12 sits on top of the home indicator. */
  micDock: {
    paddingTop: 20,
    paddingHorizontal: spacing.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
  },
  /** The comp's empty side slots — 27px wide inside 18px padding — centre the mic. */
  micSlot: {
    width: 63,
    height: 44,
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
  panelNote: text(14, 21, '500', colors.textSecondary),
  compare: {
    backgroundColor: colors.surface,
    borderRadius: radius.input,
    padding: 12,
    gap: 6,
    marginBottom: 2,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  compareLabel: {
    ...text(12, 22, '600', colors.textTertiary),
    width: 74,
  },
  compareGiven: {
    ...text(15, 24, '500', colors.textSecondary),
    flex: 1,
  },
  compareMarkGiven: {
    ...text(15, 24, '600', colors.danger),
    textDecorationLine: 'line-through',
  },
  compareExpected: {
    ...text(15, 24, '500', colors.inkAlt),
    flex: 1,
  },
  compareMarkExpected: text(15, 24, '700', colors.success),
  completeContent: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.huge,
  },
  completeText: {
    gap: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.huge,
  },
  summaryCell: {
    gap: spacing.xs,
  },
  summaryValue: {
    ...type.timer,
    fontSize: 28,
    lineHeight: 36,
  },
  summaryValueGood: {
    color: colors.success,
  },
  completeButton: {
    flex: 1,
  },
});
