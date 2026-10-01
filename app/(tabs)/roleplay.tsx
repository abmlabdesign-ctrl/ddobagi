import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardGrid } from '@/components/CardGrid';
import { Chip } from '@/components/Chip';
import { SearchField } from '@/components/Controls';
import { ScreenTitleBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { SituationCard } from '@/components/SituationCard';
import { categories } from '@/data/categories';
import type { Difficulty, Situation } from '@/data/types';
import { isInProgress, useSituations } from '@/store/useSituations';
import { colors, radius, spacing } from '@/theme/tokens';
import { text, type } from '@/theme/typography';

type CategoryFilter = 'All' | (typeof categories)[number]['id'];
type LevelFilter = 'All' | Difficulty;
type StatusFilter = 'All' | SituationStatus;

/** Where the learner is with a situation, read from its progress. */
type SituationStatus = 'not-started' | 'in-progress' | 'completed';

const statusOf = (situation: Situation): SituationStatus =>
  !situation.progress
    ? 'not-started'
    : situation.progress.percent >= 100
      ? 'completed'
      : 'in-progress';

const LEVEL_OPTIONS: { value: LevelFilter; label: string }[] = [
  { value: 'All', label: 'All levels' },
  { value: 'Easy', label: 'Easy' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Hard', label: 'Hard' },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'not-started', label: 'Not started' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

/**
 * RP-1 Browse situations. The comp exposes dropdown chips rather than a row of
 * category chips: category, level and status each open their own sheet.
 */
export default function Roleplay() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [level, setLevel] = useState<LevelFilter>('All');
  const [status, setStatus] = useState<StatusFilter>('All');
  const [sheet, setSheet] = useState<'category' | 'level' | 'status' | null>(null);

  const { situations } = useSituations();

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return situations
      .filter((situation) => (status === 'All' ? true : statusOf(situation) === status))
      .filter((situation) => (level === 'All' ? true : situation.difficulty === level))
      .filter((situation) => (category === 'All' ? true : situation.categoryId === category))
      .filter((situation) => !needle || situation.title.toLowerCase().includes(needle))
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }, [situations, query, category, level, status]);

  const categoryOptions: { value: CategoryFilter; label: string }[] = [
    { value: 'All', label: 'All' },
    ...categories.map((entry) => ({ value: entry.id as CategoryFilter, label: entry.name })),
  ];
  const categoryLabel = categoryOptions.find((entry) => entry.value === category)?.label ?? 'All';
  const filtered = category !== 'All' || level !== 'All' || status !== 'All';
  const countLabel = filtered
    ? `${results.length} situation${results.length === 1 ? '' : 's'}`
    : 'Situations';

  return (
    <ScreenShell bottomEdge="tabs">
      <ScreenTitleBar title="Choose a situation" />

      <View style={styles.filters}>
        <SearchField value={query} onChangeText={setQuery} />
        <View style={styles.chips}>
          <Chip
            label={categoryLabel}
            variant="filter"
            dropdown
            selected={category !== 'All'}
            onPress={() => setSheet('category')}
          />
          <Chip
            label={level === 'All' ? 'Level' : level}
            variant="filter"
            dropdown
            selected={level !== 'All'}
            onPress={() => setSheet('level')}
          />
          <Chip
            label={
              status === 'All'
                ? 'Status'
                : (STATUS_OPTIONS.find((entry) => entry.value === status)?.label ?? 'Status')
            }
            variant="filter"
            dropdown
            selected={status !== 'All'}
            onPress={() => setSheet('status')}
          />
        </View>
      </View>

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        <Text style={styles.countLabel}>{countLabel}</Text>

        {results.length === 0 ? (
          <Text style={type.secondary}>No situations match that search yet.</Text>
        ) : (
          <CardGrid gap={10}>
            {results.map((situation) => (
              <SituationCard
                key={situation.id}
                situation={situation}
                // The bar and percent belong to a situation under way only —
                // not one that's untouched, nor one already finished.
                showProgress={isInProgress(situation)}
                onPress={() => router.push(`/roleplay/${situation.id}`)}
              />
            ))}
          </CardGrid>
        )}
      </Screen>

      <FilterSheet
        visible={sheet === 'category'}
        title="Category"
        options={categoryOptions}
        selected={category}
        onSelect={setCategory}
        onClose={() => setSheet(null)}
      />
      <FilterSheet
        visible={sheet === 'level'}
        title="Level"
        options={LEVEL_OPTIONS}
        selected={level}
        onSelect={setLevel}
        onClose={() => setSheet(null)}
      />
      <FilterSheet
        visible={sheet === 'status'}
        title="Status"
        options={STATUS_OPTIONS}
        selected={status}
        onSelect={setStatus}
        onClose={() => setSheet(null)}
      />
    </ScreenShell>
  );
}

/** The bottom sheet behind each dropdown chip. Picking closes it. */
function FilterSheet<T extends string>({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>{title}</Text>
        <ScrollView contentContainerStyle={styles.sheetBody} showsVerticalScrollIndicator={false}>
          {options.map(({ value, label }) => {
            const active = value === selected;
            return (
              <Pressable
                key={value}
                onPress={() => {
                  onSelect(value);
                  onClose();
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={styles.sheetRow}
              >
                <Text style={active ? styles.sheetRowActive : styles.sheetRowLabel}>{label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  filters: {
    paddingHorizontal: spacing.gutter,
    paddingTop: 4,
    gap: 12,
  },
  chips: {
    flexDirection: 'row',
    // Three chips; a long category name wraps the row rather than running off.
    flexWrap: 'wrap',
    gap: 8,
  },
  content: {
    gap: 12,
    paddingTop: 20,
    paddingBottom: spacing.huge,
  },
  countLabel: type.label,
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(25,31,40,0.35)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    maxHeight: '72%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  sheetTitle: {
    ...type.title,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  sheetBody: {
    paddingBottom: spacing.md,
  },
  sheetRow: {
    height: 52,
    justifyContent: 'center',
  },
  sheetRowLabel: text(16, 22, '500', colors.inkAlt),
  sheetRowActive: text(16, 22, '600', colors.primary),
});
