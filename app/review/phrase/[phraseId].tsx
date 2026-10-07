import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CtaDock } from '@/components/CtaDock';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { situationById } from '@/data/situations';
import { EditIcon, SpeakerIcon } from '@/icons';
import { speak } from '@/services/speech';
import { useApp } from '@/store/AppStore';
import { useMeaning } from '@/store/useMeaning';
import { colors, spacing } from '@/theme/tokens';
import { text, type } from '@/theme/typography';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

/**
 * RV-5b Saved phrase. What was saved, what it means, where it came from and
 * what the learner wants to remember about it. The exchange itself is one tap
 * away behind `View transcript` rather than previewed here.
 */
export default function SavedPhraseDetail() {
  const { phraseId } = useLocalSearchParams<{ phraseId: string }>();
  const { savedPhrases, history, setPhraseNote } = useApp();
  const meaningOf = useMeaning();

  const phrase = savedPhrases.find((entry) => entry.id === phraseId);

  // Editing starts from the pencil next to the section header; there is no
  // other way in, so the note reads as a note until it is asked to be a field.
  const [editing, setEditing] = useState(false);
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
  // The phrase is its own copy; only the way back to its conversation depends
  // on that conversation still being on the device.
  const source = phrase.runId
    ? history.some((run) => run.id === phrase.runId)
      ? `/review/script/${phrase.situationId}?run=${encodeURIComponent(phrase.runId)}`
      : null
    : history.some((run) => run.situationId === phrase.situationId)
      ? `/review/history/${phrase.situationId}`
      : null;

  return (
    <ScreenShell bottomEdge={source ? undefined : 'content'}>
      <NavBar title="Saved phrase" />

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        <Card elevation="card" radiusToken="group" padding={20} style={styles.phrase}>
          <View style={styles.phraseHead}>
            <Text style={styles.korean}>{phrase.korean}</Text>
            <Pressable
              onPress={() => speak(phrase.korean)}
              accessibilityRole="button"
              accessibilityLabel={`Replay ${phrase.korean}`}
              style={styles.replay}
            >
              <SpeakerIcon size={16} color={colors.inkAlt} />
            </Pressable>
          </View>
          <Text style={styles.english}>{meaningOf(phrase)}</Text>
          {phrase.said ? <Text style={styles.meta}>You said: {phrase.said}</Text> : null}
          <Text style={styles.meta}>
            {phrase.situationTitle ?? situation?.title ?? phrase.situationId} · Saved{' '}
            {phrase.savedOn}
          </Text>
        </Card>

        <View style={styles.block}>
          <View style={styles.blockHead}>
            <Text style={type.label}>Note</Text>
            {editing ? null : (
              <Pressable
                onPress={() => {
                  setDraft(phrase.note ?? '');
                  setEditing(true);
                }}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={phrase.note ? 'Edit the note' : 'Write a note'}
              >
                <EditIcon size={18} />
              </Pressable>
            )}
          </View>
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
            // Nothing written yet reads as blank space, not as a prompt.
            <Card radiusToken="group" padding={16} style={styles.noteBox}>
              {phrase.note ? <Text style={styles.noteText}>{phrase.note}</Text> : null}
            </Card>
          )}
        </View>
      </Screen>

      {source ? (
        <CtaDock paddingTop={12}>
          <Button label="View transcript" onPress={() => router.push(source)} />
        </CtaDock>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing.gutter,
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
  blockHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  /** An empty note keeps the same footprint it will have once it is written. */
  noteBox: {
    minHeight: 58,
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
});
