import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CtaDock } from '@/components/CtaDock';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { situationById } from '@/data/situations';
import { EditIcon, SpeakerIcon } from '@/icons';
import { useApp } from '@/store/AppStore';
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
  const { savedPhrases, setPhraseNote } = useApp();

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
