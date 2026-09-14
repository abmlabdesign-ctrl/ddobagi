import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { NavBar } from '@/components/NavBar';
import { Screen } from '@/components/Screen';
import { skillLabels } from '@/data/skills';
import { situationById } from '@/data/situations';
import { SpeakerIcon } from '@/icons';
import { useApp } from '@/store/AppStore';
import { colors, radius, spacing } from '@/theme/tokens';
import { fontFamily, type } from '@/theme/typography';

/** RV-3 Mistakes by situation */
export default function MistakeLog() {
  const { situationId } = useLocalSearchParams<{ situationId: string }>();
  const { mistakes, markMistakeFixed } = useApp();

  const situation = situationById[situationId];
  const rows = mistakes.filter((mistake) => mistake.situationId === situationId);

  return (
    <View style={styles.root}>
      <NavBar title="Mistake log" action="Script" onAction={() => router.push(`/review/script/${situationId}`)} />

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        <Text style={type.display}>{situation?.title ?? situationId}</Text>

        {rows.length === 0 ? (
          <Text style={type.secondary}>Nothing left to review here.</Text>
        ) : null}

        {rows.map((mistake) => (
          <Card key={mistake.id} style={styles.card}>
            <View style={styles.cardHeader}>
              {mistake.fixed ? (
                <Badge label="Fixed" color={colors.success} background={colors.successBg} />
              ) : (
                <Badge
                  label={skillLabels[mistake.skill]}
                  color={colors.primary}
                  background={colors.primary100}
                />
              )}
              <Text style={type.caption}>{mistake.date}</Text>
            </View>

            <View style={styles.block}>
              <Text style={[styles.korean, mistake.fixed ? null : styles.koreanWrong]}>
                {mistake.said.korean}
              </Text>
              <Text style={type.caption}>
                {mistake.said.english} {mistake.said.note}
              </Text>
            </View>

            {mistake.fixed ? null : (
              <>
                <View style={styles.block}>
                  <Text style={styles.korean}>{mistake.suggested.korean}</Text>
                  <Text style={type.caption}>{mistake.suggested.english}</Text>
                </View>

                <View style={styles.actions}>
                  <Pressable
                    accessibilityRole="button"
                    style={[styles.action, styles.actionSecondary]}
                  >
                    <SpeakerIcon size={16} color={colors.inkAlt} />
                    <Text style={styles.actionLabel}>Listen again</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => markMistakeFixed(mistake.id)}
                    accessibilityRole="button"
                    style={[styles.action, styles.actionPrimary]}
                  >
                    <Text style={[styles.actionLabel, styles.actionLabelPrimary]}>
                      Say it again
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </Card>
        ))}
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
    gap: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.huge,
  },
  card: {
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  block: {
    gap: spacing.xs,
  },
  korean: {
    fontFamily: fontFamily.sans,
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '600',
    color: colors.ink,
  },
  koreanWrong: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
    textDecorationColor: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  action: {
    flex: 1,
    height: 44,
    borderRadius: radius.search,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionSecondary: {
    backgroundColor: colors.fill,
  },
  actionPrimary: {
    backgroundColor: colors.primary100,
  },
  actionLabel: {
    fontFamily: fontFamily.sans,
    fontSize: 14,
    fontWeight: '600',
    color: colors.inkAlt,
  },
  actionLabelPrimary: {
    color: colors.primary,
  },
});
