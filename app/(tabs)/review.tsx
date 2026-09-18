import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { CountBadge } from '@/components/Badge';
import { Card, RowDivider } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { SearchField } from '@/components/Controls';
import { ScreenTitleBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { categoryById } from '@/data/categories';
import { mistakeGroups, mistakesSummary } from '@/data/review';
import { situationById } from '@/data/situations';
import type { SavedPhrase } from '@/data/types';
import { ListChevronIcon, MoreIcon, SpeakerIcon } from '@/icons';
import { useApp } from '@/store/AppStore';
import { colors, radius, spacing } from '@/theme/tokens';
import { numeral, text, type } from '@/theme/typography';

const tabs = ['Mistake log', 'Scrapbook'] as const;
type Tab = (typeof tabs)[number];

const tabByParam: Record<string, Tab> = {
  mistakes: 'Mistake log',
  scrapbook: 'Scrapbook',
};

/** RV-3a / RV-5 — the two review tabs. */
export default function Review() {
  const { tab: tabParam } = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<Tab>(tabByParam[tabParam ?? ''] ?? 'Mistake log');

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
        {tab === 'Mistake log' ? <MistakesTab /> : null}
        {tab === 'Scrapbook' ? <ScrapbookTab /> : null}
      </Screen>
    </ScreenShell>
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
                onPress={() => router.push(`/review/script/${group.situationId}`)}
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

const situationTitle = (situationId: string) => situationById[situationId]?.title ?? situationId;

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
        [phrase.korean, phrase.english, situationTitle(phrase.situationId)]
          .join(' ')
          .toLowerCase()
          .includes(needle),
      )
    : savedPhrases;

  const menuPhrase = savedPhrases.find((phrase) => phrase.id === menuId);

  return (
    <View style={styles.tabBody}>
      <SearchField value={query} onChangeText={setQuery} placeholder="Search saved phrases" />

      {phrases.length === 0 ? (
        <Text style={type.secondary}>
          {savedPhrases.length === 0
            ? 'Nothing saved yet. Save a phrase from a report.'
            : `No saved phrases match \u201c${query.trim()}\u201d.`}
        </Text>
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
          onNote={() => {
            setMenuId(null);
            router.push(`/review/phrase/${menuPhrase.id}?note=1`);
          }}
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
            {situationTitle(phrase.situationId)} · {phrase.savedOn}
          </Text>
          <Pressable
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

/** The card's `···` sheet. Two actions, so it stays a list rather than a menu. */
function PhraseMenu({
  phrase,
  onClose,
  onNote,
  onDelete,
}: {
  phrase: SavedPhrase;
  onClose: () => void;
  onNote: () => void;
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
        <Pressable onPress={onNote} accessibilityRole="button" style={styles.menuRow}>
          <Text style={styles.menuLabel}>{phrase.note ? 'Edit note' : 'Add note'}</Text>
        </Pressable>
        <RowDivider />
        <Pressable onPress={onDelete} accessibilityRole="button" style={styles.menuRow}>
          <Text style={styles.menuDelete}>Delete</Text>
        </Pressable>
      </View>
    </Modal>
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
  menuLabel: type.row,
  menuDelete: {
    ...type.row,
    color: colors.danger,
  },
});
