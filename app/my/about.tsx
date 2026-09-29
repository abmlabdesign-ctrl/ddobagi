import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Card, RowDivider } from '@/components/Card';
import { MenuRow } from '@/components/Controls';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { legalDocs, type LegalDocId } from '@/data/legal';
import { settings as settingsCopy } from '@/data/profile';
import { colors, radius, shadows, spacing } from '@/theme/tokens';
import { type } from '@/theme/typography';

const DOCS: LegalDocId[] = ['terms', 'privacy', 'voice'];

/** MY-3 › About Ddobak — the ON-1 logo block, then the legal and license rows. */
export default function About() {
  return (
    <ScreenShell bottomEdge="content">
      <NavBar title="About Ddobak" />

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        <View style={styles.brand}>
          <View style={styles.logoFrame}>
            <Image
              source={require('../../assets/graphics/logo.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          </View>
          <Text style={type.section}>Ddobak</Text>
          <Text style={type.caption}>{settingsCopy.appVersion}</Text>
        </View>

        <Card radiusToken="group" elevation="card" paddingHorizontal={20} paddingVertical={6}>
          {DOCS.map((id, index) => (
            <View key={id}>
              {index > 0 ? <RowDivider /> : null}
              <MenuRow
                label={legalDocs[id].title}
                height={56}
                onPress={() => router.push(`/legal/${id}`)}
              />
            </View>
          ))}
          <RowDivider />
          <MenuRow
            label="Open-source licenses"
            height={56}
            onPress={() => router.push('/my/licenses')}
          />
        </Card>
      </Screen>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 24,
    paddingTop: 16,
    paddingBottom: spacing.huge,
  },
  brand: {
    alignItems: 'center',
    gap: 4,
  },
  logoFrame: {
    width: 88,
    height: 88,
    borderRadius: radius.sheet,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    ...shadows.card,
  },
  logo: {
    width: 64,
    height: 64,
  },
});
