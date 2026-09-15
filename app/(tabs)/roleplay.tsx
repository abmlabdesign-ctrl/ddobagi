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
import { situations } from '@/data/situations';
import { colors, radius, spacing } from '@/theme/tokens';
import { text, type } from '@/theme/typography';

type CategoryFilter = 'All' | (typeof categories)[number]['id'];

/**
 * RP-1 Browse situations. The comp exposes two dropdown chips rather than a
 * row of category chips, so the category list lives in a sheet behind `All`.
 */
export default function Roleplay() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [inProgressOnly, setInProgressOnly] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return situations
      .filter((situation) => (inProgressOnly ? Boolean(situation.progress) : true))
      .filter((situation) => (category === 'All' ? true : situation.categoryId === category))
      .filter((situation) => !needle || situation.title.toLowerCase().includes(needle))
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }, [query, category, inProgressOnly]);

  const categoryLabel =
    category === 'All' ? 'All' : categories.find((entry) => entry.id === category)?.name ?? 'All';
  const countLabel =
    category === 'All' && !inProgressOnly
      ? 'Situations'
      : `${results.length} situation${results.length === 1 ? '' : 's'}`;

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
            onPress={() => setSheetOpen(true)}
          />
          <Chip
            label="Status"
            variant="filter"
            dropdown
            selected={inProgressOnly}
            onPress={() => setInProgressOnly((value) => !value)}
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
                showProgress
                onPress={() => router.push(`/roleplay/${situation.id}`)}
              />
            ))}
          </CardGrid>
        )}
      </Screen>

      <CategorySheet
        visible={sheetOpen}
        selected={category}
        onSelect={(next) => {
          setCategory(next);
          setSheetOpen(false);
        }}
        onClose={() => setSheetOpen(false)}
      />
    </ScreenShell>
  );
}

function CategorySheet({
  visible,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selected: CategoryFilter;
  onSelect: (value: CategoryFilter) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>Category</Text>
        <ScrollView contentContainerStyle={styles.sheetBody} showsVerticalScrollIndicator={false}>
          {(['All', ...categories.map((entry) => entry.id)] as CategoryFilter[]).map((value) => {
            const label =
              value === 'All' ? 'All' : categories.find((entry) => entry.id === value)?.name ?? '';
            const active = value === selected;
            return (
              <Pressable
                key={value}
                onPress={() => onSelect(value)}
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
