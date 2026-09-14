import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { MenuRow, Toggle } from '@/components/Controls';
import { NavBar } from '@/components/NavBar';
import { Screen } from '@/components/Screen';
import { settings as settingsCopy } from '@/data/profile';
import { useApp } from '@/store/AppStore';
import { colors, spacing } from '@/theme/tokens';
import { type } from '@/theme/typography';

/** MY-3 Settings */
export default function Settings() {
  const { profile, settings, updateSettings, resetOnboarding } = useApp();

  const cycleSpeed = () => {
    const speeds = settingsCopy.speechSpeeds;
    const next = speeds[(speeds.indexOf(settings.aiSpeechSpeed) + 1) % speeds.length];
    updateSettings({ aiSpeechSpeed: next });
  };

  const logOut = () => {
    resetOnboarding();
    router.replace('/onboarding/sign-in');
  };

  return (
    <View style={styles.root}>
      <NavBar title="Settings" />

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        <Group title="Learning">
          <MenuRow label="App language" value={profile.appLanguage} />
          <MenuRow label="AI speech speed" value={settings.aiSpeechSpeed} onPress={cycleSpeed} last />
        </Group>

        <Group title="Notifications">
          <ToggleRow
            label="Practice reminder"
            value={settings.practiceReminder}
            onChange={(value) => updateSettings({ practiceReminder: value })}
          />
          <ToggleRow
            label="Review mission alerts"
            value={settings.reviewAlerts}
            onChange={(value) => updateSettings({ reviewAlerts: value })}
            last
          />
        </Group>

        <Group title="Account">
          <MenuRow label="Account info" />
          <MenuRow label={settingsCopy.connectedProvider} />
          <MenuRow label="Help center" />
          <Pressable onPress={logOut} accessibilityRole="button" style={styles.logOut}>
            <Text style={styles.logOutLabel}>Log out</Text>
          </Pressable>
        </Group>

        <Text style={styles.version}>{settingsCopy.appVersion}</Text>
      </Screen>
    </View>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <Card padding={16}>{children}</Card>
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
  last = false,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.toggleRow, last ? null : styles.toggleDivider]}>
      <Text style={type.body}>{label}</Text>
      <Toggle label={label} value={value} onChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  content: {
    gap: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.huge,
  },
  group: {
    gap: spacing.md,
  },
  groupTitle: {
    ...type.secondary,
    fontWeight: '600',
    color: colors.inkAlt,
  },
  toggleRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  toggleDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.fill,
  },
  logOut: {
    minHeight: 56,
    justifyContent: 'center',
  },
  logOutLabel: {
    ...type.body,
    color: colors.primary,
    fontWeight: '600',
  },
  version: {
    ...type.caption,
    textAlign: 'center',
  },
});
