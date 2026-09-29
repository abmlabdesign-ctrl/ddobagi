import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, RowDivider } from '@/components/Card';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { notices } from '@/data/support';
import { ChevronDownIcon } from '@/icons';
import { colors, spacing } from '@/theme/tokens';
import { text, type } from '@/theme/typography';

/** MY-3 › Notices — announcements, newest first. Tap a title to read it in place. */
export default function Notices() {
  const [openId, setOpenId] = useState<string | null>(notices[0]?.id ?? null);

  return (
    <ScreenShell bottomEdge="content">
      <NavBar title="Notices" />

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        {notices.length === 0 ? (
          <Text style={type.secondary}>No notices yet.</Text>
        ) : (
          <Card radiusToken="group" elevation="card" paddingHorizontal={20} paddingVertical={6}>
            {notices.map((notice, index) => {
              const open = openId === notice.id;
              return (
                <View key={notice.id}>
                  {index > 0 ? <RowDivider /> : null}
                  <Pressable
                    onPress={() => setOpenId(open ? null : notice.id)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: open }}
                    style={styles.row}
                  >
                    <View style={styles.rowText}>
                      <Text style={type.listTitle}>{notice.title}</Text>
                      <Text style={type.caption}>{notice.date}</Text>
                    </View>
                    <View style={open ? styles.chevronOpen : null}>
                      <ChevronDownIcon size={18} color={colors.textTertiary} />
                    </View>
                  </Pressable>
                  {open ? <Text style={styles.body}>{notice.body}</Text> : null}
                </View>
              );
            })}
          </Card>
        )}
      </Screen>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
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
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  body: {
    ...text(14, 22, '400', colors.textBody),
    paddingBottom: 16,
  },
});
