import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, RowDivider } from '@/components/Card';
import { MenuRow, SliderRow, Toggle } from '@/components/Controls';
import { NavBar } from '@/components/NavBar';
import { NoticeSheet, PickerSheet } from '@/components/PickerSheet';
import { Screen, ScreenShell } from '@/components/Screen';
import { appLanguageOptions, settings as settingsCopy } from '@/data/profile';
import { useApp } from '@/store/AppStore';
import { colors, spacing } from '@/theme/tokens';
import { text, type } from '@/theme/typography';

/** MY-3 Settings */
export default function Settings() {
  const { profile, settings, isPlus, reminderStatus, updateProfile, updateSettings, logOut } =
    useApp();
  const [sheet, setSheet] = useState<'language' | 'account' | null>(null);
  const close = () => setSheet(null);

  // Progress and onboarding stay on the device, so signing back in goes home.
  const signOut = () => {
    logOut();
    router.replace('/onboarding/sign-in');
  };

  return (
    <ScreenShell bottomEdge="content">
      <NavBar title="Settings" />

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        <Group title="Learning">
          <MenuRow
            label="App language"
            value={profile.appLanguage}
            height={56}
            onPress={() => setSheet('language')}
          />
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
        {reminderStatus !== 'ok' ? (
          <Text style={styles.note}>
            {reminderStatus === 'unsupported'
              ? 'Reminders arrive in the phone app.'
              : 'Notifications are off for Ddobak. Turn them on in your phone settings.'}
          </Text>
        ) : null}

        <Group title="Account">
          <MenuRow label="Account info" height={56} onPress={() => router.push('/my/edit')} />
          <RowDivider />
          <MenuRow
            label="Subscription"
            value={isPlus ? 'Plus' : 'Free'}
            height={56}
            onPress={() => router.push('/my/subscription')}
          />
          <RowDivider />
          <MenuRow
            label={
              profile.signInProvider === 'Email'
                ? 'Signed in with email'
                : `Connected to ${profile.signInProvider}`
            }
            height={56}
            onPress={() => setSheet('account')}
          />
          <RowDivider />
          <Pressable onPress={signOut} accessibilityRole="button" style={styles.logOut}>
            <Text style={styles.logOutLabel}>Log out</Text>
          </Pressable>
        </Group>

        <Group title="Support">
          <MenuRow label="Notices" height={56} onPress={() => router.push('/my/notices')} />
          <RowDivider />
          <MenuRow label="Help center" height={56} onPress={() => router.push('/my/help')} />
          <RowDivider />
          <MenuRow label="About Ddobak" height={56} onPress={() => router.push('/my/about')} />
        </Group>

        {/* Kept out of the Account card so it can't be hit on the way to Log out. */}
        <Pressable
          onPress={() => router.push('/my/delete-account')}
          accessibilityRole="button"
          hitSlop={8}
          style={styles.delete}
        >
          <Text style={styles.deleteLabel}>Delete account</Text>
        </Pressable>

        <Text style={styles.version}>{settingsCopy.appVersion}</Text>
      </Screen>

      <PickerSheet
        visible={sheet === 'language'}
        title="App language"
        note="Ddobak is in English for now. More languages are coming."
        options={appLanguageOptions}
        selected={profile.appLanguage}
        onSelect={(appLanguage) => updateProfile({ appLanguage })}
        onClose={close}
      />
      <NoticeSheet
        visible={sheet === 'account'}
        title="Account"
        lines={[
          `${profile.nickname} · signed in with ${profile.signInProvider}.`,
          'Your progress is saved on this device. Log out to clear it.',
        ]}
        onClose={close}
      />
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
  note: {
    ...type.caption,
    paddingHorizontal: 4,
  },
  delete: {
    alignSelf: 'center',
    marginTop: 8,
    paddingVertical: 8,
  },
  deleteLabel: {
    ...text(13, 19, '500', colors.textSecondary),
    textDecorationLine: 'underline',
  },
  version: {
    ...type.caption,
    textAlign: 'center',
    marginTop: 8,
  },
});
