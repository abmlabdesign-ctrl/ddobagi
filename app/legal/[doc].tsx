import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { legalDocs, legalDraft, type LegalDocId } from '@/data/legal';
import { colors, radius, spacing } from '@/theme/tokens';
import { text, type } from '@/theme/typography';

/**
 * Terms · Privacy · Voice recordings. Reached from ON-1, ON-1b and MY-3 ›
 * About. Plain reading layout on white: the title in the bar, a date line,
 * then heading + body pairs — no cards, since this is a document.
 */
export default function LegalDocument() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const entry = legalDocs[doc as LegalDocId];

  if (!entry) {
    return (
      <ScreenShell background="surface" bottomEdge="content">
        <NavBar title="Document" />
        <Screen>
          <Text style={type.secondary}>That document isn&apos;t available.</Text>
        </Screen>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell background="surface" bottomEdge="content">
      <NavBar title={entry.title} />
      <Screen scroll contentStyle={styles.content}>
        {legalDraft ? (
          <View style={styles.draft}>
            <Text style={styles.draftLabel}>
              Draft for review. The final version will replace this before launch.
            </Text>
          </View>
        ) : null}

        <Text style={type.caption}>Last updated {entry.updatedOn}</Text>

        {entry.sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text style={type.listTitle}>{section.heading}</Text>
            <Text style={styles.body}>{section.body}</Text>
          </View>
        ))}
      </Screen>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    paddingTop: 8,
    paddingBottom: spacing.huge,
  },
  draft: {
    borderRadius: radius.input,
    backgroundColor: colors.primary100,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  draftLabel: text(13, 19, '500', colors.primary),
  section: {
    gap: 6,
  },
  body: text(15, 24, '400', colors.textBody),
});
