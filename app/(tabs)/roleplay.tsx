import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CardGrid } from '@/components/CardGrid';
import { Chip } from '@/components/Chip';
import { SearchField } from '@/components/Controls';
import { Screen } from '@/components/Screen';
import { SituationCard } from '@/components/SituationCard';
import { categories } from '@/data/categories';
import { situations } from '@/data/situations';
import { colors, spacing } from '@/theme/tokens';
import { type } from '@/theme/typography';

type Filter = 'All' | 'Status' | (typeof categories)[number]['id'];

/** RP-1 Browse situations */
export default function Roleplay() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return situations
      .filter((situation) => {
        if (filter === 'Status') return Boolean(situation.progress);
        if (filter !== 'All') return situation.categoryId === filter;
        return true;
      })
      .filter((situation) => !needle || situation.title.toLowerCase().includes(needle))
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }, [query, filter]);

  const countLabel =
    filter === 'All' || filter === 'Status'
      ? 'Situations'
      : `${results.length} situation${results.length === 1 ? '' : 's'}`;

  return (
    <Screen scroll background="surface-alt" contentStyle={styles.content}>
      <Text style={styles.title}>Choose a situation</Text>

      <SearchField value={query} onChangeText={setQuery} />

      <View style={styles.filters}>
        <Chip label="All" selected={filter === 'All'} onPress={() => setFilter('All')} />
        <Chip label="Status" selected={filter === 'Status'} onPress={() => setFilter('Status')} />
        {categories.map((category) => (
          <Chip
            key={category.id}
            label={category.name}
            selected={filter === category.id}
            onPress={() => setFilter(category.id)}
          />
        ))}
      </View>

      <Text style={styles.countLabel}>{countLabel}</Text>

      {results.length === 0 ? (
        <Text style={type.secondary}>No situations match that search yet.</Text>
      ) : (
        <CardGrid>
          {results.map((situation) => (
            <SituationCard
              key={situation.id}
              situation={situation}
              onPress={() => router.push(`/roleplay/${situation.id}`)}
            />
          ))}
        </CardGrid>
      )}
    </Screen>
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
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  countLabel: {
    ...type.secondary,
    fontWeight: '600',
    color: colors.inkAlt,
  },
});
