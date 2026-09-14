import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { KoreanText, joinTokens } from '@/components/KoreanText';
import { MicButton } from '@/components/MicButton';
import { NavBar } from '@/components/NavBar';
import { Screen } from '@/components/Screen';
import { missionById, missions } from '@/data/missions';
import type { ChoiceQuestion, SpeakQuestion } from '@/data/types';
import { colors, radius, spacing } from '@/theme/tokens';
import { fontFamily, type } from '@/theme/typography';

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
    <View style={styles.root}>
      <NavBar
        title={mission.title}
        center={
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle} numberOfLines={1}>
              {mission.title}
            </Text>
            <Text style={styles.progressCount}>
              {position}/{mission.questionCount}
            </Text>
          </View>
        }
      />

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        {question.type === 'speak' ? (
          <SpeakStep
            question={question}
            answered={spoken}
            onSpeak={() => setSpoken(true)}
          />
        ) : (
          <ChoiceStep question={question} answer={answer} onAnswer={setAnswer} />
        )}
      </Screen>

      <View style={styles.footer}>
        <Button
          label={position >= mission.questionCount ? 'Finish' : 'Next'}
          onPress={next}
          disabled={question.type === 'speak' ? !spoken : answer === null}
        />
      </View>
    </View>
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
      <Card style={styles.sentenceCard}>
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
  onAnswer,
}: {
  question: ChoiceQuestion;
  answer: number | null;
  onAnswer: (index: number) => void;
}) {
  const answered = answer !== null;
  const correct = answer === question.answerIndex;

  const sentence = useMemo(
    () =>
      joinTokens(
        question.sentenceTokens.map((token) =>
          token ? token.text : answered ? question.options[answer] : '____',
        ),
      ),
    [question, answer, answered],
  );

  return (
    <View style={styles.step}>
      <Card style={styles.sentenceCard}>
        <Text style={styles.promptLabel}>{question.promptLabel}</Text>
        <KoreanText
          tokens={question.promptTokens}
          english={question.promptEnglish}
          meaning="toggle"
          onReplay={() => {}}
          tapHint="Tap a word to see how it sounds"
        />
      </Card>

      {sentence.length > 0 ? (
        <Card style={styles.answerCard} elevation="flat">
          <Text style={styles.answerSentence}>{sentence}</Text>
        </Card>
      ) : null}

      <View style={styles.options}>
        {question.options.map((option, optionIndex) => {
          const selected = answer === optionIndex;
          const isAnswer = optionIndex === question.answerIndex;
          return (
            <Pressable
              key={option}
              onPress={() => (answered ? undefined : onAnswer(optionIndex))}
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled: answered }}
              style={[
                styles.option,
                selected && !isAnswer ? styles.optionWrong : null,
                answered && isAnswer ? styles.optionRight : null,
              ]}
            >
              <Text style={[type.body, styles.optionLabel]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>

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
      <View
        style={[styles.feedbackBadge, correct ? styles.badgeGood : styles.badgeBad]}
      >
        <Text style={[styles.feedbackLabel, correct ? styles.labelGood : styles.labelBad]}>
          {label}
        </Text>
      </View>
      <Text style={type.secondary}>{explanation}</Text>
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
    <View style={styles.completeRoot}>
      <Screen contentStyle={styles.completeContent}>
        <View style={styles.completeText}>
          <Text style={type.display}>Mission complete!</Text>
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

        <View style={styles.completeActions}>
          <Button
            label="Retry"
            variant="secondary"
            style={styles.completeButton}
            onPress={() => router.replace('/(tabs)/review')}
          />
          <Button
            label="Done"
            style={styles.completeButton}
            onPress={() => router.replace('/(tabs)/review')}
          />
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  content: {
    gap: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.huge,
  },
  progressHeader: {
    alignItems: 'center',
    gap: 2,
  },
  progressTitle: {
    ...type.title,
  },
  progressCount: {
    fontFamily: fontFamily.numeric,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  step: {
    gap: spacing.xl,
  },
  sentenceCard: {
    gap: spacing.md,
  },
  promptLabel: {
    ...type.badge,
    color: colors.textTertiary,
  },
  answerCard: {
    alignItems: 'center',
  },
  answerSentence: {
    ...type.korean,
    textAlign: 'center',
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    minHeight: 56,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  optionRight: {
    backgroundColor: colors.successBg,
    borderColor: colors.success,
    borderWidth: 1.5,
  },
  optionWrong: {
    backgroundColor: colors.primary100,
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  optionLabel: {
    fontWeight: '600',
  },
  feedback: {
    gap: spacing.sm,
  },
  feedbackBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.badge,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeGood: { backgroundColor: colors.successBg },
  badgeBad: { backgroundColor: colors.primary100 },
  feedbackLabel: {
    fontFamily: fontFamily.sans,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  labelGood: { color: colors.success },
  labelBad: { color: colors.primary },
  micBlock: {
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
    backgroundColor: colors.surfaceAlt,
  },
  completeRoot: {
    flex: 1,
    backgroundColor: colors.surface,
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
    fontFamily: fontFamily.numeric,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    color: colors.ink,
  },
  summaryValueGood: {
    color: colors.success,
  },
  completeActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  completeButton: {
    flex: 1,
  },
});
