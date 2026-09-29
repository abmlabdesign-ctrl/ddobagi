import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, RowDivider } from '@/components/Card';
import { MenuRow } from '@/components/Controls';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { settings as settingsCopy } from '@/data/profile';
import { faq, supportEmail } from '@/data/support';
import { ChevronDownIcon } from '@/icons';
import { colors, spacing } from '@/theme/tokens';
import { text, type } from '@/theme/typography';

/**
 * MY-3 › Help center. The MY-3 grouped-card language: a small grey group title
 * over a white card. Answers open in place, the way RV-7 opens a mistake,
 * rather than pushing a screen per question.
 */
export default function HelpCenter() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const contact = () => {
    if (!supportEmail) return;
    const subject = encodeURIComponent(`Ddobak help · ${settingsCopy.appVersion}`);
    Linking.openURL(`mailto:${supportEmail}?subject=${subject}`).catch(() => {});
  };

  return (
    <ScreenShell bottomEdge="content">
      <NavBar title="Help center" />

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        <View style={styles.group}>
          <Text style={styles.groupTitle}>Common questions</Text>
          <Card radiusToken="group" elevation="card" paddingHorizontal={20} paddingVertical={6}>
            {faq.map((item, index) => {
              const open = openIndex === index;
              return (
                <View key={item.question}>
                  {index > 0 ? <RowDivider /> : null}
                  <Pressable
                    onPress={() => setOpenIndex(open ? null : index)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: open }}
                    style={styles.question}
                  >
                    <Text style={[type.row, styles.questionLabel]}>{item.question}</Text>
                    <View style={open ? styles.chevronOpen : null}>
                      <ChevronDownIcon size={18} color={colors.textTertiary} />
                    </View>
                  </Pressable>
                  {open ? <Text style={styles.answer}>{item.answer}</Text> : null}
                </View>
              );
            })}
          </Card>
        </View>

        {supportEmail ? (
          <View style={styles.group}>
            <Text style={styles.groupTitle}>Still stuck?</Text>
            <Card radiusToken="group" elevation="card" paddingHorizontal={20} paddingVertical={6}>
              <MenuRow label="Contact us" value={supportEmail} height={56} onPress={contact} />
            </Card>
          </View>
        ) : null}
      </Screen>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 10,
    paddingTop: 8,
    paddingBottom: spacing.huge,
  },
  group: {
    gap: 8,
  },
  groupTitle: {
    ...text(12, 16, '600', colors.textTertiary),
    paddingLeft: 4,
  },
  question: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  questionLabel: {
    flex: 1,
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  answer: {
    ...text(14, 22, '400', colors.textBody),
    paddingBottom: 16,
  },
});
