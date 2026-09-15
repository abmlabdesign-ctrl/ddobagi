import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CountBadge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CtaDock } from '@/components/CtaDock';
import { KoreanText, joinTokens } from '@/components/KoreanText';
import { MicButton } from '@/components/MicButton';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { StepProgress } from '@/components/StepProgress';
import { missionById, missions } from '@/data/missions';
import type { ChoiceQuestion, SpeakQuestion } from '@/data/types';
import { DropdownChevronIcon, SpeakerIcon } from '@/icons';
import { colors, radius, spacing } from '@/theme/tokens';
import { text, type } from '@/theme/typography';

/**
 * RV-2 … RV-2f. One runner covers all six mission types: speaking drills use
 * the mic, choice drills grade on tap and then show the explanation.
 */
export default function MissionRunner() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>();
  const mission = missionById[missionId] ?? missions[0];

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [spoken, setSpoken] = useState(false);
  const [done, setDone] = useState(false);

  const question = mission.questions[index % mission.questions.length];
  const position = Math.min(index + 1, mission.questionCount);

  const next = () => {
    if (position >= mission.questionCount) {
      setDone(true);
      return;
    }
    setIndex((value) => value + 1);
    setAnswer(null);
    setSpoken(false);
  };

  if (done) {
    return <MissionComplete title={mission.title} questionCount={mission.questionCount} />;
  }

  return (
    <ScreenShell>
      <NavBar title={mission.title} closeIcon onBack={() => router.replace('/(tabs)/review')} />

      <View style={styles.progress}>
        <StepProgress total={mission.questionCount} completed={position} />
      </View>

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        {question.type === 'speak' ? (
          <SpeakStep question={question} answered={spoken} onSpeak={() => setSpoken(true)} />
        ) : (
          <ChoiceStep question={question} answer={answer} onAnswer={setAnswer} />
        )}
      </Screen>

      {question.type === 'choice' ? (
        <View style={styles.options}>
          {question.options.map((option, optionIndex) => {
            const answered = answer !== null;
            const selected = answer === optionIndex;
            const isAnswer = optionIndex === question.answerIndex;
            return (
              <Pressable
                key={option}
                onPress={() => (answered ? undefined : setAnswer(optionIndex))}
                accessibilityRole="radio"
                accessibilityState={{ selected, disabled: answered }}
                style={[
                  styles.option,
                  selected && !isAnswer ? styles.optionWrong : null,
                  answered && isAnswer ? styles.optionRight : null,
                ]}
              >
                <Text
                  style={
                    answered && isAnswer
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
      ) : null}

      <CtaDock>
        <Button
          label={position >= mission.questionCount ? 'Finish' : 'Next'}
          onPress={next}
          disabled={question.type === 'speak' ? !spoken : answer === null}
        />
      </CtaDock>
    </ScreenShell>
  );
}

/** RV-2 / RV-2a / RV-2b — read the sentence aloud, tap a word for romanization. */
function SpeakStep({
  question,
  answered,
  onSpeak,
}: {
  question: SpeakQuestion;
  answered: boolean;
  onSpeak: () => void;
}) {
  return (
    <View style={styles.step}>
      <Card elevation="card" radiusToken="card" padding={24} style={styles.promptCard}>
        <View style={styles.promptHeader}>
          <View style={styles.speaker}>
            <SpeakerIcon size={18} />
          </View>
          <Text style={styles.promptLabel}>Listen, then repeat</Text>
        </View>
        <KoreanText
          tokens={question.tokens}
          onReplay={() => {}}
          tapHint="Tap a word to see how it sounds"
        />
      </Card>

      {answered ? (
        <Feedback
          correct={question.feedback.correct}
          label={question.feedback.label}
          explanation={question.feedback.explanation}
        />
      ) : null}

      <View style={styles.micBlock}>
        <MicButton active={!answered} onPress={onSpeak} />
      </View>
    </View>
  );
}

/** RV-2c / RV-2d / RV-2e — pick the option that fits. */
function ChoiceStep({
  question,
  answer,
  onAnswer: _onAnswer,
}: {
  question: ChoiceQuestion;
  answer: number | null;
  onAnswer: (index: number) => void;
}) {
  const answered = answer !== null;
  const correct = answer === question.answerIndex;
  const [showMeaning, setShowMeaning] = useState(false);

  const sentence = useMemo(() => {
    const parts = question.sentenceTokens.map((token) =>
      token ? token.text : answered ? question.options[answer] : '____',
    );
    if (!question.blankAttachesLeft) return joinTokens(parts);
    // A particle joins the word before it, so the gap closes once it is filled.
    const gap = question.sentenceTokens.findIndex((token) => token === null);
    return joinTokens(
      parts.reduce<string[]>((acc, part, index) => {
        if (index === gap && acc.length) acc[acc.length - 1] += part;
        else acc.push(part);
        return acc;
      }, []),
    );
  }, [question, answer, answered]);

  return (
    <View style={styles.step}>
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

        {sentence.length > 0 ? <Text style={styles.answerSentence}>{sentence}</Text> : null}
      </Card>

      {answered ? (
        <Feedback
          correct={correct}
          label={correct ? 'Correct' : 'Try again'}
          explanation={question.explanation}
        />
      ) : null}
    </View>
  );
}

function Feedback({
  correct,
  label,
  explanation,
}: {
  correct: boolean;
  label: string;
  explanation: string;
}) {
  return (
    <View style={styles.feedback}>
      <CountBadge
        label={label}
        color={correct ? colors.success : colors.primary}
        background={correct ? colors.successBg : colors.primary100}
      />
      <Text style={styles.feedbackText}>{explanation}</Text>
    </View>
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
  progress: {
    paddingHorizontal: spacing.gutter,
    paddingTop: 25,
  },
  content: {
    gap: 16,
    paddingTop: 30,
    paddingBottom: 20,
  },
  step: {
    gap: 16,
  },
  promptCard: {
    gap: 8,
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
    ...type.korean,
    marginTop: 4,
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
    backgroundColor: colors.primary100,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  optionLabel: text(16, 22, '500', colors.inkAlt),
  optionLabelRight: text(16, 22, '600', colors.success),
  optionLabelWrong: text(16, 22, '600', colors.primary),
  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
  },
  feedbackText: {
    ...type.descriptionMedium,
    flex: 1,
  },
  micBlock: {
    alignItems: 'center',
  },
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
