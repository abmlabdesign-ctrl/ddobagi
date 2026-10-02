import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { CountBadge } from '@/components/Badge';
import { Card, RowDivider } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { SearchField } from '@/components/Controls';
import { ScreenTitleBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { categoryById } from '@/data/categories';
import { TODAYS_FOCUS_ID, missions, todayFocus } from '@/data/missions';
import { mistakesSummary } from '@/data/review';
import { situationById } from '@/data/situations';
import type { Mistake, SavedPhrase } from '@/data/types';
import { ListChevronIcon, MoreIcon, SpeakerIcon } from '@/icons';
import { speak } from '@/services/speech';
import { todayFocus as recommendFocus } from '@/services/recommend';
import { useApp, type SessionRecord } from '@/store/AppStore';
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

  // The tab screen stays mounted, so `?tab=` has to be applied every time it
  // arrives, not just on first render. Clearing it afterwards lets the same
  // link (Home → Saved phrases) work again after the learner switched tabs.
  const [appliedParam, setAppliedParam] = useState(tabParam);
  if (tabParam !== appliedParam) {
    setAppliedParam(tabParam);
    const next = tabByParam[tabParam ?? ''];
    if (next) setTab(next);
  }
  useEffect(() => {
    if (tabParam) router.setParams({ tab: undefined });
  }, [tabParam]);

  return (
    <ScreenShell bottomEdge="tabs">
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
  // Named from open mistakes first, then ON-2's pain points; the CTA opens
  // the drill for the first of them.
  const { mistakes, profile } = useApp();
  const focus = recommendFocus(mistakes, profile.painPoints);

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
            Today&apos;s focus {focus.skills.map((skill) => `· ${skill}`).join(' ')}
          </Text>
          <Text style={type.lead}>{todayFocus.description}</Text>
        </View>
        <Pressable
          // Ten questions mixed across all six skills, not one skill's drill.
          onPress={() => router.push(`/review/mission?missionId=${TODAYS_FOCUS_ID}`)}
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

/**
 * RV-3a rows from the live log: open mistakes grouped by situation, newest
 * first. `toReview` — not yet `Done` in RV-7 — is what the badge and the
 * headline count; opening a mistake without pressing `Done` changes nothing.
 */
function groupMistakes(mistakes: Mistake[]) {
  const groups = new Map<
    string,
    {
      situationId: string;
      count: number;
      toReview: number;
      ids: string[];
      skills: string[];
      date: string;
    }
  >();
  for (const mistake of mistakes) {
    if (mistake.fixed) continue;
    const group = groups.get(mistake.situationId) ?? {
      situationId: mistake.situationId,
      count: 0,
      toReview: 0,
      ids: [],
      skills: [],
      date: mistake.date,
    };
    group.count += 1;
    group.ids.push(mistake.id);
    if (!mistake.done) group.toReview += 1;
    if (!group.skills.includes(mistake.skill)) group.skills.push(mistake.skill);
    groups.set(mistake.situationId, group);
  }
  return [...groups.values()];
}

/**
 * Where a Mistake log row opens: the newest finished run that flagged one of
 * the situation's open mistakes, so its `Done` is right there.
 */
function runWithMistake(history: SessionRecord[], situationId: string, ids: string[]) {
  return history.find(
    (run) =>
      run.situationId === situationId &&
      run.flagged.some((turnId) =>
        ids.includes(run.mistakes?.[turnId]?.id ?? `${situationId}-${turnId}`),
      ),
  );
}

function MistakesTab() {
  const { mistakes, history } = useApp();
  const mistakeGroups = groupMistakes(mistakes);
  // Headline and badges read the same per-situation numbers.
  const open = mistakeGroups.reduce((sum, group) => sum + group.toReview, 0);
  const openSituations = mistakeGroups.filter((group) => group.toReview > 0).length;
  const fixedCount = mistakes.filter((mistake) => mistake.fixed).length;

  return (
    <View style={styles.tabBody}>
      <Card paddingHorizontal={18} paddingVertical={14} style={styles.summaryCard}>
        <View style={styles.summaryText}>
          <Text style={type.caption}>Mistakes to review</Text>
          <Text style={type.cardTitle}>
            {open} left across {openSituations} situation
            {openSituations === 1 ? '' : 's'}
          </Text>
        </View>
        <View style={styles.summaryCount}>
          <Text style={styles.summaryCountLabel}>{open}</Text>
        </View>
      </Card>

      {mistakeGroups.length === 0 ? (
        // No log yet: a short line on how it fills, in the same white card as
        // the summary above and the fixed count below — and no list chrome.
        <Card paddingHorizontal={18} paddingVertical={28} style={styles.mistakesEmpty}>
          <Text style={type.listTitle}>Nothing to review yet</Text>
          <Text style={[type.secondary, styles.emptyStateText]}>
            Finish a roleplay to see your mistakes here.
          </Text>
        </Card>
      ) : (
        <>
          <View style={styles.sortRow}>
            <Text style={type.label}>Pick a situation</Text>
            <Text style={type.caption}>{mistakesSummary.sort}</Text>
          </View>

          <Card paddingHorizontal={18} paddingVertical={4}>
            {mistakeGroups.map((group, index) => {
              const situation = situationById[group.situationId];
              const category = situation ? categoryById[situation.categoryId] : undefined;
              const run = runWithMistake(history, group.situationId, group.ids);
              return (
                <View key={group.situationId}>
                  {index > 0 ? <RowDivider /> : null}
                  <Pressable
                    onPress={() =>
                      router.push(
                        run
                          ? `/review/script/${group.situationId}?run=${encodeURIComponent(run.id)}`
                          : `/review/script/${group.situationId}`,
                      )
                    }
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
                      {group.toReview > 0 ? <CountBadge label={`${group.toReview}`} /> : null}
                      <ListChevronIcon />
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </Card>
        </>
      )}

      <Card paddingHorizontal={18} paddingVertical={14} style={styles.fixedCard}>
        <Text style={type.row}>Mistakes you fixed</Text>
        <Text style={styles.fixedCount}>
          {fixedCount} · {mistakesSummary.fixedWindow}
        </Text>
      </Card>
    </View>
  );
}

/** The title saved with the phrase wins — it outlives the conversation and the catalog. */
const situationTitle = (phrase: SavedPhrase) =>
  phrase.situationTitle ?? situationById[phrase.situationId]?.title ?? phrase.situationId;

/**
 * RV-5 Scrapbook — the shelf of saved phrases. Each card carries its own source,
 * so the list needs no headings; search is the only control above it.
 */
function ScrapbookTab() {
  const { savedPhrases, removePhrase } = useApp();
  const [query, setQuery] = useState('');
  const [menuId, setMenuId] = useState<string | null>(null);

  const needle = query.trim().toLowerCase();
  const phrases = needle
    ? savedPhrases.filter((phrase) =>
        [phrase.korean, phrase.english, situationTitle(phrase)]
          .join(' ')
          .toLowerCase()
          .includes(needle),
      )
    : savedPhrases;

  const menuPhrase = savedPhrases.find((phrase) => phrase.id === menuId);

  return (
    <View style={styles.tabBody}>
      <SearchField value={query} onChangeText={setQuery} placeholder="Search saved phrases" />

      {savedPhrases.length === 0 ? (
        // Empty until the learner saves something — no sample phrases.
        <View style={styles.emptyState}>
          <Text style={type.listTitle}>Nothing saved yet</Text>
          <Text style={[type.secondary, styles.emptyStateText]}>
            Long-press a line in a roleplay and choose Save to Scrapbook.
          </Text>
        </View>
      ) : (
        <Text style={type.caption}>
          {needle ? `${phrases.length} of ` : ''}
          {savedPhrases.length} saved phrase{savedPhrases.length === 1 ? '' : 's'}
        </Text>
      )}

      {savedPhrases.length === 0 ? null : phrases.length === 0 ? (
        <Text style={type.secondary}>{`No saved phrases match \u201c${query.trim()}\u201d.`}</Text>
      ) : (
        <View style={styles.phraseList}>
          {phrases.map((phrase) => (
            <PhraseCard key={phrase.id} phrase={phrase} onMore={() => setMenuId(phrase.id)} />
          ))}
        </View>
      )}

      {menuPhrase ? (
        <PhraseMenu
          phrase={menuPhrase}
          onClose={() => setMenuId(null)}
          onDelete={() => {
            setMenuId(null);
            removePhrase(menuPhrase.id);
          }}
        />
      ) : null}
    </View>
  );
}

function PhraseCard({ phrase, onMore }: { phrase: SavedPhrase; onMore: () => void }) {
  return (
    <Pressable
      onPress={() => router.push(`/review/phrase/${phrase.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${phrase.korean}. Open this saved phrase`}
      style={({ pressed }) => (pressed ? styles.phrasePressed : null)}
    >
      <Card elevation="card" radiusToken="group" padding={16} style={styles.phraseCard}>
        <View style={styles.phraseTop}>
          <View style={styles.phraseText}>
            <Text style={styles.phraseKorean}>{phrase.korean}</Text>
            <Text style={styles.phraseGloss}>{phrase.english}</Text>
          </View>
          <Pressable
            onPress={onMore}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`More for ${phrase.korean}`}
            style={styles.phraseMore}
          >
            <MoreIcon />
          </Pressable>
        </View>

        <View style={styles.phraseFooter}>
          <Text style={styles.phraseMeta} numberOfLines={1}>
            {situationTitle(phrase)} · {phrase.savedOn}
          </Text>
          <Pressable
            onPress={() => speak(phrase.korean)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`Replay ${phrase.korean}`}
            style={styles.phraseAction}
          >
            <SpeakerIcon size={16} color={colors.inkAlt} />
          </Pressable>
          <ListChevronIcon />
        </View>
      </Card>
    </Pressable>
  );
}

/**
 * The card's `···` sheet. Deleting is the only thing it does — the note lives
 * on the phrase's own screen, where there is room to read it while writing.
 */
function PhraseMenu({
  phrase,
  onClose,
  onDelete,
}: {
  phrase: SavedPhrase;
  onClose: () => void;
  onDelete: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={styles.menuBackdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close the menu"
      />
      <View style={[styles.menuSheet, { paddingBottom: insets.bottom + spacing.md }]}>
        <Text style={styles.menuTitle} numberOfLines={1}>
          {phrase.korean}
        </Text>
        <Pressable onPress={onDelete} accessibilityRole="button" style={styles.menuRow}>
          <Text style={styles.menuDelete}>Delete</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  /** An empty tab: a short line on how it fills. */
  emptyState: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.huge,
  },
  mistakesEmpty: {
    alignItems: 'center',
    gap: 6,
  },
  emptyStateText: {
    textAlign: 'center',
  },
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
  phraseList: {
    gap: 12,
  },
  phraseCard: {
    gap: 12,
  },
  phrasePressed: {
    opacity: 0.85,
  },
  phraseTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  phraseText: {
    flex: 1,
    gap: 3,
  },
  phraseKorean: text(16, 24, '600', colors.inkAlt),
  phraseGloss: text(12, 18, '400', colors.textSecondary),
  phraseMore: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -2,
  },
  phraseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  phraseMeta: {
    ...text(12, 16, '400', colors.textTertiary),
    flex: 1,
  },
  phraseAction: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(25,31,40,0.35)',
  },
  menuSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.lg,
  },
  menuTitle: {
    ...text(13, 18, '500', colors.textTertiary),
    paddingBottom: 6,
  },
  menuRow: {
    height: 52,
    justifyContent: 'center',
  },
  menuDelete: {
    ...type.row,
    color: colors.danger,
  },
});
