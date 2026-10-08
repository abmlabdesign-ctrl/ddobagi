import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, RowDivider } from '@/components/Card';
import { Segmented } from '@/components/Controls';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { situationById } from '@/data/situations';
import type { Mistake } from '@/data/types';
import { ListChevronIcon } from '@/icons';
import { mistakeCompleted, shortDate, useApp } from '@/store/AppStore';
import { spacing } from '@/theme/tokens';
import { type } from '@/theme/typography';

const views = ['Recent', 'By situation'] as const;

const unquote = (value: string) => value.replace(/["“”]/g, '').trim();

/** `Oct 8`, or nothing for entries completed before the time was kept. */
const fixedOn = (mistake: Mistake) => (mistake.doneAt ? shortDate(new Date(mistake.doneAt)) : null);

const titleOf = (situationId: string) => situationById[situationId]?.title ?? situationId;

/**
 * RV-3a › Mistakes you fixed — every mistake marked `Done` (or fixed by saying
 * it right in a later roleplay), from the same log and the same rule as the
 * Mistake log's counts. `Recent` lists them newest first; `By situation`
 * groups them with a count and the latest completion. Rows open the
 * situation's transcript.
 */
export default function FixedMistakes() {
  const { mistakes } = useApp();
  const [view, setView] = useState<(typeof views)[number]>('Recent');

  // Newest completion first; ones without a time sink to the end.
  const fixed = mistakes
    .filter(mistakeCompleted)
    .sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0));

  const groups = [...new Set(fixed.map((mistake) => mistake.situationId))].map((situationId) => {
    const items = fixed.filter((mistake) => mistake.situationId === situationId);
    return { situationId, count: items.length, last: fixedOn(items[0]) };
  });

  const open = (situationId: string) => router.push(`/review/script/${situationId}`);

  return (
    <ScreenShell bottomEdge="content">
      <NavBar title="Mistakes you fixed" />

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        {fixed.length === 0 ? (
          <View style={styles.empty}>
            <Text style={type.listTitle}>Nothing fixed yet</Text>
            <Text style={[type.secondary, styles.emptyText]}>
              Open a mistake in your Mistake log and press Done once you&apos;ve got it.
            </Text>
          </View>
        ) : (
          <>
            <Segmented options={views} value={view} onChange={setView} />
            <Text style={type.label}>
              {fixed.length} mistake{fixed.length === 1 ? '' : 's'} fixed
            </Text>

            <Card radiusToken="group" paddingHorizontal={20} paddingVertical={6}>
              {view === 'Recent'
                ? fixed.map((mistake, index) => {
                    const date = fixedOn(mistake);
                    return (
                      <View key={mistake.id}>
                        {index > 0 ? <RowDivider /> : null}
                        <Pressable
                          onPress={() => open(mistake.situationId)}
                          accessibilityRole="button"
                          style={styles.row}
                        >
                          <View style={styles.rowText}>
                            <Text style={type.listTitle}>{unquote(mistake.suggested.korean)}</Text>
                            <Text style={type.caption}>
                              {titleOf(mistake.situationId)}
                              {date ? ` · Fixed ${date}` : ''}
                            </Text>
                          </View>
                          <ListChevronIcon />
                        </Pressable>
                      </View>
                    );
                  })
                : groups.map((group, index) => (
                    <View key={group.situationId}>
                      {index > 0 ? <RowDivider /> : null}
                      <Pressable
                        onPress={() => open(group.situationId)}
                        accessibilityRole="button"
                        style={styles.row}
                      >
                        <View style={styles.rowText}>
                          <Text style={type.listTitle}>{titleOf(group.situationId)}</Text>
                          <Text style={type.caption}>
                            {group.count} fixed
                            {group.last ? ` · Last fixed ${group.last}` : ''}
                          </Text>
                        </View>
                        <ListChevronIcon />
                      </Pressable>
                    </View>
                  ))}
            </Card>
          </>
        )}
      </Screen>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingTop: 8,
    paddingBottom: spacing.huge,
  },
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  empty: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.huge,
  },
  emptyText: {
    textAlign: 'center',
  },
});
