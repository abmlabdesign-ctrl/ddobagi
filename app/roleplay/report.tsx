import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PillLabel } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CtaDock } from '@/components/CtaDock';
import { NavBar } from '@/components/NavBar';
import { ProgressRing } from '@/components/ProgressRing';
import { Screen, ScreenShell } from '@/components/Screen';
import { SkillBar } from '@/components/SkillBar';
import { ListChevronIcon } from '@/icons';
import { conversationBySituation, reports } from '@/data/conversations';
import { situationById } from '@/data/situations';
import { useApp } from '@/store/AppStore';
import { colors, spacing } from '@/theme/tokens';
import { numeral, text, type } from '@/theme/typography';

/** RP-4 Report — goals, score ring, 6-skill breakdown and a way into the transcript. */
export default function ReportScreen() {
  const { situationId } = useLocalSearchParams<{ situationId: string }>();
  const { savePhrase, sessions } = useApp();

  const base = reports[situationId];
  const session = sessions[situationId];
  const situation = situationById[situationId];

  if (!base) {
    return (
      <ScreenShell>
        <NavBar title="Report" />
        <Screen background="surface-alt">
          <Text style={type.secondary}>There&apos;s no report for this situation yet.</Text>
        </Screen>
      </ScreenShell>
    );
  }

  // The 6-skill scores are still the scripted ones (scoring needs a server),
  // but goals, date and corrections come from the run that just ended.
  const flaggedTurns = session
    ? (conversationBySituation[situationId]?.turns ?? []).filter(
        // Only answers that were heard can have been judged wrong.
        (turn) =>
          turn.mistake && session.flagged.includes(turn.id) && Boolean(session.said[turn.id]?.trim()),
      )
    : [];
  const report = session
    ? {
        ...base,
        completedOn: session.completedOn,
        goalsMet: session.goalsMet,
        goalsTotal: session.goalsTotal,
        fixes: flaggedTurns.map((turn) => ({
          said: {
            korean: `"${session.said[turn.id].trim()}"`,
            english: '',
          },
          suggested: turn.mistake!.suggested,
        })),
      }
    : base;
  const allGoals = report.goalsMet === report.goalsTotal;

  const save = () => {
    report.fixes.forEach((fix, index) => {
      savePhrase({
        id: `${report.situationId}-fix-${index}`,
        situationId: report.situationId,
        korean: fix.suggested.korean.replace(/"/g, ''),
        english: fix.suggested.english.replace(/[“”]/g, ''),
        meanings: fix.suggested.meanings,
        savedOn: report.completedOn,
        situationTitle: situation?.title,
        said: fix.said.korean.replace(/"/g, ''),
        runId: session?.id,
      });
    });
    router.replace('/(tabs)/roleplay');
  };

  return (
    <ScreenShell>
      {/* The comp has no back control here — the dock buttons are the exits. */}
      <NavBar title="Report" showBack={false} />

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        <View style={styles.headline}>
          <View style={styles.headlineText}>
            <PillLabel label={situation?.title ?? ''} />
            <Text style={styles.headlineBody}>
              {allGoals
                ? `You hit all ${report.goalsTotal} goal${report.goalsTotal === 1 ? '' : 's'}.`
                : `You hit ${report.goalsMet} of ${report.goalsTotal} goals.`}
              {'\n'}
              That&apos;s {report.scoreDelta} points more than last time.
            </Text>
          </View>

          <ProgressRing
            percent={report.score}
            size={96}
            strokeWidth={7}
            color={colors.info}
            center={
              <View style={styles.scoreCenter}>
                <Text style={styles.score}>{report.score}</Text>
                <Text style={styles.scoreUnit}>pts</Text>
              </View>
            }
          />
        </View>

        <Card paddingHorizontal={24} paddingVertical={20} style={styles.skills}>
          <View style={styles.skillsHeader}>
            <Text style={type.section}>6-skill breakdown</Text>
            <Text style={type.caption}>0–100</Text>
          </View>
          {report.skills.map((entry) => (
            <SkillBar
              key={entry.skill}
              skill={entry.skill}
              score={entry.score}
              band={entry.band}
            />
          ))}
        </Card>

        {/* The corrections read better line by line against the rest of the
            conversation, so the report points at the transcript instead of
            reprinting a pair of them here. */}
        <Card radiusToken="group" paddingHorizontal={24} paddingVertical={8}>
          <Pressable
            onPress={() => router.push(`/review/history/${report.situationId}`)}
            accessibilityRole="button"
            accessibilityLabel="View the transcript of this conversation"
            style={styles.transcriptRow}
          >
            <View style={styles.transcriptText}>
              <Text style={type.listTitleTight}>View transcript</Text>
              <Text style={type.caption}>
                Every line you and the AI said, with what to fix
              </Text>
            </View>
            <ListChevronIcon />
          </Pressable>
        </Card>
      </Screen>

      <CtaDock row gap={10} paddingTop={12}>
        <Button
          label="Try again"
          variant="elevated"
          style={styles.tryAgain}
          onPress={() => router.replace(`/roleplay/session?situationId=${report.situationId}`)}
        />
        <Button label="Save" glow style={styles.save} onPress={save} />
      </CtaDock>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    paddingTop: 8,
    paddingBottom: spacing.huge,
  },
  headline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  headlineText: {
    flex: 1,
    gap: 12,
  },
  headlineBody: text(16, 28, '500', colors.inkAlt),
  scoreCenter: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 1,
  },
  score: numeral(30, 34, '700', colors.info, true),
  scoreUnit: text(12, 16, '600', colors.textSecondary),
  skills: {
    gap: 16,
  },
  skillsHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  transcriptRow: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transcriptText: {
    flex: 1,
    gap: 1,
  },
  tryAgain: {
    flex: 1,
  },
  save: {
    flex: 1.4,
  },
});
