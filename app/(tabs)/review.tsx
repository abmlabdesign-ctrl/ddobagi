import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Segmented } from '@/components/Controls';
import { SpeakerIcon } from '@/icons';
import { missions, todayFocus } from '@/data/missions';
import { mistakeGroups, mistakesSummary } from '@/data/review';
import { situationById } from '@/data/situations';
import { useApp } from '@/store/AppStore';
import { colors, radius, shadows, spacing } from '@/theme/tokens';
import { fontFamily, type } from '@/theme/typography';

const tabs = ['Micro missions', 'Mistake log', 'Scrapbook'] as const;
type Tab = (typeof tabs)[number];

const tabByParam: Record<string, Tab> = {
  missions: 'Micro missions',
  mistakes: 'Mistake log',
  scrapbook: 'Scrapbook',
};

/** RV-1 / RV-3a / RV-5 — the three review tabs. */
export default function Review() {
  const { tab: tabParam } = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<Tab>(tabByParam[tabParam ?? ''] ?? 'Micro missions');

  return (
    <Screen scroll background="surface-alt" contentStyle={styles.content}>
      <Text style={styles.title}>Review missions</Text>
      <Segmented options={tabs} value={tab} onChange={setTab} />

      {tab === 'Micro missions' ? <MissionsTab /> : null}
      {tab === 'Mistake log' ? <MistakesTab /> : null}
      {tab === 'Scrapbook' ? <ScrapbookTab /> : null}
    </Screen>
  );
}

function MissionsTab() {
  return (
    <View style={styles.tabBody}>
      <Card style={styles.focusCard}>
        <Text style={styles.focusLabel}>Today&apos;s focus</Text>
        <Text style={type.section}>
          {todayFocus.skills.map((skill) => `· ${skill}`).join(' ')}
        </Text>
        <Text style={type.secondary}>{todayFocus.description}</Text>
        <Button
          label={todayFocus.cta}
          style={styles.focusCta}
          onPress={() => router.push(`/review/mission?missionId=${missions[0].id}`)}
        />
      </Card>

      <View style={styles.list}>
        {missions.map((mission) => (
          <Pressable
            key={mission.id}
            onPress={() => router.push(`/review/mission?missionId=${mission.id}`)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
          >
            <Text style={type.listTitle}>{mission.title}</Text>
            <Text style={styles.rowMeta}>
              {mission.questionCount} questions · {mission.minutes} min
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function MistakesTab() {
  return (
    <View style={styles.tabBody}>
      <View style={styles.summaryHeader}>
        <View style={styles.summaryText}>
          <Text style={type.section}>Mistakes to review</Text>
          <Text style={type.secondary}>
            {mistakesSummary.total} left across {mistakesSummary.situations} situations
          </Text>
        </View>
        <View style={styles.countPill}>
          <Text style={styles.countPillLabel}>{mistakesSummary.total}</Text>
        </View>
      </View>

      <View style={styles.sortRow}>
        <Text style={styles.sectionLabel}>Pick a situation</Text>
        <Text style={type.caption}>{mistakesSummary.sort}</Text>
      </View>

      <View style={styles.list}>
        {mistakeGroups.map((group) => {
          const situation = situationById[group.situationId];
          return (
            <Pressable
              key={group.situationId}
              onPress={() => router.push(`/review/mistakes/${group.situationId}`)}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.row,
                styles.rowSplit,
                pressed ? styles.rowPressed : null,
              ]}
            >
              <View style={styles.rowText}>
                <Text style={type.listTitle}>{situation?.title ?? group.situationId}</Text>
                <Text style={styles.rowMeta}>
                  {group.count} mistakes · {group.skills.join(' · ')} · {group.date}
                </Text>
              </View>
              <View style={styles.countPillSmall}>
                <Text style={styles.countPillSmallLabel}>{group.count}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Card style={styles.fixedCard}>
        <Text style={type.body}>Mistakes you fixed</Text>
        <Text style={styles.fixedCount}>
          {mistakesSummary.fixedCount} · {mistakesSummary.fixedWindow}
        </Text>
      </Card>
    </View>
  );
}

function ScrapbookTab() {
  const { savedPhrases } = useApp();
  const grouped = savedPhrases.reduce<Record<string, typeof savedPhrases>>((acc, phrase) => {
    acc[phrase.situationId] = [...(acc[phrase.situationId] ?? []), phrase];
    return acc;
  }, {});

  if (savedPhrases.length === 0) {
    return (
      <View style={styles.tabBody}>
        <Text style={type.secondary}>Nothing saved yet. Save a phrase from a report.</Text>
      </View>
    );
  }

  return (
    <View style={styles.tabBody}>
      {Object.entries(grouped).map(([situationId, phrases]) => (
        <View key={situationId} style={styles.group}>
          <Text style={styles.sectionLabel}>
            {situationById[situationId]?.title ?? situationId}
          </Text>
          <View style={styles.list}>
            {phrases.map((phrase) => (
              <View key={phrase.id} style={[styles.row, styles.rowSplit]}>
                <View style={styles.rowText}>
                  <Text style={styles.phraseKorean}>{phrase.korean}</Text>
                  <Text style={type.description}>{phrase.english}</Text>
                </View>
                <Pressable
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={`Replay ${phrase.korean}`}
                  style={styles.speaker}
                >
                  <SpeakerIcon size={18} />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingTop: spacing.huge,
    paddingBottom: spacing.huge,
  },
  title: {
    ...type.display,
    color: colors.inkAlt,
  },
  tabBody: {
    gap: spacing.lg,
    paddingTop: spacing.xs,
  },
  focusCard: {
    gap: spacing.sm,
  },
  focusLabel: {
    ...type.badge,
    color: colors.textTertiary,
  },
  focusCta: {
    marginTop: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: 16,
    gap: spacing.xs,
    ...shadows.card,
  },
  rowSplit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowPressed: {
    backgroundColor: colors.fill,
  },
  rowMeta: {
    ...type.description,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryText: {
    gap: spacing.xs,
  },
  countPill: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countPillLabel: {
    fontFamily: fontFamily.numeric,
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  countPillSmall: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countPillSmallLabel: {
    fontFamily: fontFamily.numeric,
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    ...type.secondary,
    fontWeight: '600',
    color: colors.inkAlt,
  },
  fixedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fixedCount: {
    ...type.secondary,
    color: colors.success,
    fontWeight: '600',
  },
  group: {
    gap: spacing.md,
  },
  phraseKorean: {
    fontFamily: fontFamily.sans,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
    color: colors.ink,
  },
  speaker: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
