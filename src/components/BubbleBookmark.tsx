import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Turn } from '@/data/types';
import { BookmarkIcon } from '@/icons';
import { shortDate, useApp } from '@/store/AppStore';
import { colors } from '@/theme/tokens';

const unquote = (value: string) => value.replace(/["“”]/g, '').trim();

/**
 * Saving any line of a conversation to the Scrapbook, not only a corrected
 * one. A line counts as saved when the Scrapbook already holds the same
 * Korean, so a phrase saved elsewhere shows as saved here too.
 */
export function useLineBookmark(situationId: string) {
  const { savedPhrases, savePhrase, removePhrase } = useApp();

  const savedFor = (korean: string) =>
    savedPhrases.find((phrase) => phrase.korean === unquote(korean));

  const toggle = (turn: Turn) => {
    const existing = savedFor(turn.korean);
    if (existing) {
      removePhrase(existing.id);
      return;
    }
    savePhrase({
      // `-line` keeps it apart from RV-7's suggested-sentence save for the same turn.
      id: `${situationId}-${turn.id}-line`,
      situationId,
      korean: unquote(turn.korean),
      english: unquote(turn.english ?? ''),
      savedOn: shortDate(),
    });
  };

  return { isSaved: (korean: string) => Boolean(savedFor(korean)), toggle };
}

/**
 * A conversation bubble with its bookmark just outside it: to the right of the
 * other person's (left-aligned) bubble, to the left of the learner's
 * (right-aligned) one, vertically centred and kept clear of the text.
 */
export function BookmarkedBubble({
  side,
  saved,
  onToggle,
  children,
}: {
  side: 'ai' | 'user';
  saved: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const mark = (
    <Pressable
      onPress={onToggle}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={saved ? 'Remove from your scrapbook' : 'Save this line'}
      accessibilityState={{ selected: saved }}
      style={styles.mark}
    >
      <BookmarkIcon
        size={18}
        color={saved ? colors.primary : colors.textTertiary}
        filled={saved}
      />
    </Pressable>
  );

  return (
    <View style={[styles.row, side === 'ai' ? styles.rowAi : styles.rowUser]}>
      {side === 'user' ? mark : null}
      <View style={styles.bubble}>{children}</View>
      {side === 'ai' ? mark : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowAi: {
    alignSelf: 'flex-start',
  },
  rowUser: {
    alignSelf: 'flex-end',
  },
  /** Shrinks before the 24px mark does, so the mark never gets pushed off. */
  bubble: {
    flexShrink: 1,
  },
  mark: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
