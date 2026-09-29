import { StyleSheet, Text, View } from 'react-native';

import { Card, RowDivider } from '@/components/Card';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { fontLicenses, licenses } from '@/data/licenses';
import { colors, spacing } from '@/theme/tokens';
import { text, type } from '@/theme/typography';

/** MY-3 › About › Open-source licenses — the packages and fonts the app ships with. */
export default function Licenses() {
  return (
    <ScreenShell bottomEdge="content">
      <NavBar title="Open-source licenses" />

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        <Group
          title="Fonts"
          rows={fontLicenses.map((font) => ({ name: font.name, meta: font.license }))}
        />
        <Group
          title="Libraries"
          rows={licenses.map((entry) => ({
            name: entry.name,
            meta: `${entry.version} · ${entry.license}`,
          }))}
        />
      </Screen>
    </ScreenShell>
  );
}

function Group({ title, rows }: { title: string; rows: { name: string; meta: string }[] }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <Card radiusToken="group" elevation="card" paddingHorizontal={20} paddingVertical={4}>
        {rows.map((row, index) => (
          <View key={row.name}>
            {index > 0 ? <RowDivider /> : null}
            <View style={styles.row}>
              <Text style={type.listTitleTight}>{row.name}</Text>
              <Text style={type.caption}>{row.meta}</Text>
            </View>
          </View>
        ))}
      </Card>
    </View>
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
  row: {
    paddingVertical: 12,
    gap: 2,
  },
});
