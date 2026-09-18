import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, RowDivider } from '@/components/Card';
import { MenuRow, SliderRow, Toggle } from '@/components/Controls';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { settings as settingsCopy } from '@/data/profile';
import { useApp } from '@/store/AppStore';
import { colors, spacing } from '@/theme/tokens';
import { text, type } from '@/theme/typography';

/** MY-3 Settings */
export default function Settings() {
  const { profile, settings, updateSettings, resetOnboarding } = useApp();

  const logOut = () => {
    resetOnboarding();
    router.replace('/onboarding/sign-in');
  };

  return (
    <ScreenShell bottomEdge="content">
      <NavBar title="Settings" />

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        <Group title="Learning">
          <MenuRow label="App language" value={profile.appLanguage} height={56} />
          <RowDivider />
          <SliderRow
            label="AI speech speed"
            value={settings.aiSpeechSpeed}
            options={settingsCopy.speechSpeeds}
            onChange={(value) => updateSettings({ aiSpeechSpeed: value })}
          />
        </Group>

        <Group title="Notifications">
          <ToggleRow
            label="Practice reminder"
            value={settings.practiceReminder}
            onChange={(value) => updateSettings({ practiceReminder: value })}
          />
          <RowDivider />
          <ToggleRow
            label="Review mission alerts"
            value={settings.reviewAlerts}
            onChange={(value) => updateSettings({ reviewAlerts: value })}
          />
        </Group>

        <Group title="Account">
          <MenuRow label="Account info" height={56} />
          <RowDivider />
          <MenuRow label={settingsCopy.connectedProvider} height={56} />
          <RowDivider />
          <MenuRow label="Help center" height={56} />
          <RowDivider />
          <Pressable onPress={logOut} accessibilityRole="button" style={styles.logOut}>
            <Text style={styles.logOutLabel}>Log out</Text>
          </Pressable>
        </Group>

        <Text style={styles.version}>{settingsCopy.appVersion}</Text>
      </Screen>
    </ScreenShell>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <Card radiusToken="group" elevation="card" paddingHorizontal={20} paddingVertical={6}>
        {children}
      </Card>
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={type.row}>{label}</Text>
      <Toggle label={label} value={value} onChange={onChange} />
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
  toggleRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logOut: {
    height: 56,
    justifyContent: 'center',
  },
  logOutLabel: {
    ...type.row,
    color: colors.primary,
  },
  version: {
    ...type.caption,
    textAlign: 'center',
    marginTop: 8,
  },
});
