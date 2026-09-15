import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { CountBadge } from '@/components/Badge';
import { Card, RowDivider } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { ScreenTitleBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { categoryById } from '@/data/categories';
import { missions, todayFocus } from '@/data/missions';
import { mistakeGroups, mistakesSummary } from '@/data/review';
import { situationById } from '@/data/situations';
import { ListChevronIcon, SpeakerIcon } from '@/icons';
import { useApp } from '@/store/AppStore';
import { colors, radius, spacing } from '@/theme/tokens';
import { numeral, text, type } from '@/theme/typography';

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
    <ScreenShell>
      <ScreenTitleBar title="Review missions" />

      <View style={styles.tabs}>
        {tabs.map((entry) => (
          <Chip
            key={entry}
            label={entry}
            variant="tab"
            selected={tab === entry}
            onPress={() => setTab(entry)}
          />
        ))}
      </View>

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        {tab === 'Micro missions' ? <MissionsTab /> : null}
        {tab === 'Mistake log' ? <MistakesTab /> : null}
        {tab === 'Scrapbook' ? <ScrapbookTab /> : null}
      </Screen>
    </ScreenShell>
  );
}

function MissionsTab() {
  return (
    <View style={styles.tabBody}>
      <LinearGradient
        colors={['#D8E7FF', '#FFF0EC']}
        locations={[0.08, 0.96]}
        start={{ x: 0, y: 0.35 }}
        end={{ x: 1, y: 0.65 }}
        style={styles.focusCard}
      >
        <View style={styles.focusText}>
          <Text style={styles.focusLabel}>
            Today&apos;s focus {todayFocus.skills.map((skill) => `· ${skill}`).join(' ')}
          </Text>
          <Text style={type.lead}>{todayFocus.description}</Text>
        </View>
        <Pressable
          onPress={() => router.push(`/review/mission?missionId=${missions[0].id}`)}
          accessibilityRole="button"
          style={styles.focusCta}
        >
          <Text style={styles.focusCtaLabel}>{todayFocus.cta}</Text>
        </Pressable>
      </LinearGradient>

      <Card elevation="card" paddingHorizontal={18} paddingVertical={4}>
        {missions.map((mission, index) => (
          <View key={mission.id}>
            {index > 0 ? <RowDivider /> : null}
            <Pressable
              onPress={() => router.push(`/review/mission?missionId=${mission.id}`)}
              accessibilityRole="button"
              style={styles.listRow}
            >
              <View style={styles.listText}>
                <Text style={type.listTitleTight}>{mission.title}</Text>
                <Text style={type.caption}>
                  {mission.questionCount} questions · {mission.minutes} min
                </Text>
              </View>
              <ListChevronIcon />
            </Pressable>
          </View>
        ))}
      </Card>
    </View>
  );
}

function MistakesTab() {
  return (
    <View style={styles.tabBody}>
      <Card paddingHorizontal={18} paddingVertical={14} style={styles.summaryCard}>
        <View style={styles.summaryText}>
          <Text style={type.caption}>Mistakes to review</Text>
          <Text style={type.cardTitle}>
            {mistakesSummary.total} left across {mistakesSummary.situations} situations
          </Text>
        </View>
        <View style={styles.summaryCount}>
          <Text style={styles.summaryCountLabel}>{mistakesSummary.total}</Text>
        </View>
      </Card>

      <View style={styles.sortRow}>
        <Text style={type.label}>Pick a situation</Text>
        <Text style={type.caption}>{mistakesSummary.sort}</Text>
      </View>

      <Card paddingHorizontal={18} paddingVertical={4}>
        {mistakeGroups.map((group, index) => {
          const situation = situationById[group.situationId];
          const category = situation ? categoryById[situation.categoryId] : undefined;
          return (
            <View key={group.situationId}>
              {index > 0 ? <RowDivider /> : null}
              <Pressable
                onPress={() => router.push(`/review/mistakes/${group.situationId}`)}
                accessibilityRole="button"
                style={styles.mistakeRow}
              >
                {category ? (
                  <Image
                    source={category.illustration}
                    style={styles.thumb}
                    resizeMode="cover"
                    accessibilityIgnoresInvertColors
                  />
                ) : null}
                <View style={styles.listText}>
                  <Text style={type.listTitle}>{situation?.title ?? group.situationId}</Text>
                  <Text style={type.caption}>
                    {group.count} mistakes · {group.skills.join(' · ')} · {group.date}
                  </Text>
                </View>
                <View style={styles.mistakeRight}>
                  <CountBadge label={`${group.count}`} />
                  <ListChevronIcon />
                </View>
              </Pressable>
            </View>
          );
        })}
      </Card>

      <Card paddingHorizontal={18} paddingVertical={14} style={styles.fixedCard}>
        <Text style={type.row}>Mistakes you fixed</Text>
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
          <Text style={type.label}>{situationById[situationId]?.title ?? situationId}</Text>
          <Card paddingHorizontal={18} paddingVertical={4}>
            {phrases.map((phrase, index) => (
              <View key={phrase.id}>
                {index > 0 ? <RowDivider /> : null}
                <View style={styles.phraseRow}>
                  <View style={styles.listText}>
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
              </View>
            ))}
          </Card>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.gutter,
    paddingVertical: 8,
  },
  content: {
    gap: 12,
    paddingTop: 16,
    paddingBottom: spacing.huge,
  },
  tabBody: {
    gap: 12,
  },
  focusCard: {
    borderRadius: radius.group,
    padding: 20,
    gap: 14,
  },
  focusText: {
    gap: 6,
  },
  focusLabel: text(13, 19, '600', colors.primary),
  focusCta: {
    height: 48,
    borderRadius: radius.search,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusCtaLabel: text(16, 22, '600', colors.primary),
  listRow: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listText: {
    flex: 1,
    gap: 1,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryText: {
    flex: 1,
    gap: 2,
  },
  summaryCount: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCountLabel: numeral(15, 20, '700', colors.primary),
  sortRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  mistakeRow: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: radius.badge,
    backgroundColor: colors.fill,
  },
  mistakeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fixedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fixedCount: text(14, 20, '600', colors.success),
  group: {
    gap: 8,
  },
  phraseRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  phraseKorean: text(15, 22, '600', colors.inkAlt),
  speaker: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
