import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CtaDock } from '@/components/CtaDock';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { conversationBySituation } from '@/data/conversations';
import { situationById } from '@/data/situations';
import { SpeakerIcon } from '@/icons';
import { useApp } from '@/store/AppStore';
import { colors, radius, selectedOutline, shadows, spacing } from '@/theme/tokens';
import { text, type } from '@/theme/typography';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

/** Quotes differ between the report's fixes and the script's own lines. */
const bare = (value: string) => value.replace(/["“”]/g, '').trim();

/**
 * RV-5b Saved phrase. What was saved, what it means, and the exchange it came
 * out of — with a way through to the whole transcript.
 */
export default function SavedPhraseDetail() {
  const { phraseId, note: noteParam } = useLocalSearchParams<{
    phraseId: string;
    note?: string;
  }>();
  const { savedPhrases, setPhraseNote } = useApp();

  const phrase = savedPhrases.find((entry) => entry.id === phraseId);

  // `?note=1` comes from the card's More menu, which opens straight into editing.
  const [editing, setEditing] = useState(noteParam === '1');
  const [draft, setDraft] = useState(phrase?.note ?? '');

  if (!phrase) {
    return (
      <ScreenShell bottomEdge="content">
        <NavBar title="Saved phrase" />
        <Screen>
          <Text style={type.secondary}>That phrase isn&apos;t in your scrapbook.</Text>
        </Screen>
      </ScreenShell>
    );
  }

  const situation = situationById[phrase.situationId];
  const turns = conversationBySituation[phrase.situationId]?.turns ?? [];

  // A saved phrase is either a line as spoken or the correction suggested for
  // one, so the exchange it belongs to can be found under either.
  const at = turns.findIndex(
    (turn) =>
      bare(turn.korean) === bare(phrase.korean) ||
      (turn.mistake ? bare(turn.mistake.suggested.korean) === bare(phrase.korean) : false),
  );
  const context = at >= 0 ? turns.slice(Math.max(0, at - 1), at + 2) : turns.slice(0, 3);

  return (
    <ScreenShell>
      <NavBar title="Saved phrase" />

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        <Card elevation="card" radiusToken="group" padding={20} style={styles.phrase}>
          <View style={styles.phraseHead}>
            <Text style={styles.korean}>{phrase.korean}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Replay ${phrase.korean}`}
              style={styles.replay}
            >
              <SpeakerIcon size={16} color={colors.inkAlt} />
            </Pressable>
          </View>
          <Text style={styles.english}>{phrase.english}</Text>
          <Text style={styles.meta}>
            {situation?.title ?? phrase.situationId} · Saved {phrase.savedOn}
          </Text>
        </Card>

        <View style={styles.block}>
          <Text style={type.label}>Note</Text>
          {editing ? (
            <Card radiusToken="group" padding={16} style={styles.note}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                multiline
                autoFocus
                placeholder="What do you want to remember about this phrase?"
                placeholderTextColor={colors.textTertiary}
                style={styles.noteInput}
                accessibilityLabel="Note"
              />
              <View style={styles.noteActions}>
                <Button
                  label="Cancel"
                  variant="tonal"
                  height={44}
                  style={styles.noteButton}
                  onPress={() => {
                    setDraft(phrase.note ?? '');
                    setEditing(false);
                  }}
                />
                <Button
                  label="Save"
                  height={44}
                  style={styles.noteButton}
                  onPress={() => {
                    setPhraseNote(phrase.id, draft);
                    setEditing(false);
                  }}
                />
              </View>
            </Card>
          ) : (
            <Pressable
              onPress={() => {
                setDraft(phrase.note ?? '');
                setEditing(true);
              }}
              accessibilityRole="button"
              accessibilityLabel={phrase.note ? 'Edit the note' : 'Add a note'}
            >
              <Card radiusToken="group" padding={16}>
                <Text style={phrase.note ? styles.noteText : styles.notePlaceholder}>
                  {phrase.note ?? 'Add a note'}
                </Text>
              </Card>
            </Pressable>
          )}
        </View>

        <View style={styles.block}>
          <Text style={type.label}>From this conversation</Text>
          <View style={styles.bubbles}>
            {context.map((turn) => {
              const isUser = turn.speaker === 'user';
              const isSource = at >= 0 && turn === turns[at];
              return (
                <View
                  key={turn.id}
                  style={[
                    styles.bubble,
                    isUser ? styles.bubbleUser : styles.bubbleAi,
                    isSource ? selectedOutline : null,
                  ]}
                >
                  <Text style={styles.bubbleKorean}>{turn.korean}</Text>
                  <Text style={styles.bubbleGloss}>{turn.english}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </Screen>

      <CtaDock paddingTop={12}>
        <Button
          label="View transcript"
          onPress={() => router.push(`/review/script/${phrase.situationId}`)}
        />
      </CtaDock>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    paddingTop: 8,
    paddingBottom: spacing.huge,
  },
  phrase: {
    gap: 6,
  },
  phraseHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  korean: {
    ...type.section,
    flex: 1,
  },
  replay: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  english: text(14, 20, '400', colors.textSecondary),
  meta: {
    ...text(12, 16, '400', colors.textTertiary),
    paddingTop: 2,
  },
  block: {
    gap: 12,
  },
  note: {
    gap: 12,
  },
  noteInput: {
    ...text(14, 21, '400', colors.inkAlt),
    minHeight: 66,
    padding: 0,
    textAlignVertical: 'top',
  },
  noteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  noteButton: {
    flex: 1,
  },
  noteText: text(14, 21, '400', colors.inkAlt),
  notePlaceholder: text(14, 21, '400', colors.textTertiary),
  bubbles: {
    gap: 12,
  },
  bubble: {
    maxWidth: 290,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 2,
    ...shadows.card,
  },
  bubbleAi: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 4,
    borderTopRightRadius: radius.card,
    borderBottomLeftRadius: radius.card,
    borderBottomRightRadius: radius.card,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: colors.bubbleUserStrong,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    borderBottomLeftRadius: radius.card,
    borderBottomRightRadius: 4,
  },
  bubbleKorean: text(15, 23, '500', colors.inkAlt),
  bubbleGloss: text(12, 18, '400', colors.textSecondary),
});
