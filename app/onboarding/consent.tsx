import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { CheckRow } from '@/components/CheckRow';
import { CtaDock } from '@/components/CtaDock';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { legalDocs, type LegalDocId } from '@/data/legal';
import { shortDate, useApp } from '@/store/AppStore';
import { colors, spacing } from '@/theme/tokens';
import { type } from '@/theme/typography';

const REQUIRED: LegalDocId[] = ['terms', 'privacy', 'voice'];

/**
 * ON-1b Before we start — ON-1 → here → ON-2. Each required item is agreed
 * separately (voice recordings leave the device for speech-to-text, so they
 * get their own line rather than hiding inside the privacy policy). Laid out
 * like ON-2: white page, section title, rows, one CTA disabled until ready.
 */
export default function Consent() {
  const { profile, updateProfile, updateSettings } = useApp();
  const [agreed, setAgreed] = useState<Record<LegalDocId, boolean>>({
    terms: profile.consents?.terms ?? false,
    privacy: profile.consents?.privacy ?? false,
    voice: profile.consents?.voice ?? false,
  });
  const [marketing, setMarketing] = useState(profile.consents?.marketing ?? false);

  const allRequired = REQUIRED.every((id) => agreed[id]);
  const everything = allRequired && marketing;

  const toggleAll = () => {
    const next = !everything;
    setAgreed({ terms: next, privacy: next, voice: next });
    setMarketing(next);
  };

  const next = () => {
    updateProfile({ consents: { ...agreed, marketing, agreedOn: shortDate() } });
    // The optional line is literally "Practice reminders and news".
    updateSettings({ practiceReminder: marketing });
    router.push('/onboarding/setup');
  };

  return (
    <ScreenShell background="surface">
      <NavBar title="Before we start" />

      <Screen scroll contentStyle={styles.content}>
        <View style={styles.intro}>
          <Text style={type.screenTitle}>A few things first</Text>
          <Text style={type.secondary}>
            Ddobak listens to you speak, so we need your OK before you start.
          </Text>
        </View>

        <View style={styles.list}>
          <CheckRow label="Agree to all" checked={everything} onToggle={toggleAll} strong />
          <View style={styles.rule} />
          {REQUIRED.map((id) => (
            <CheckRow
              key={id}
              tag="Required"
              label={legalDocs[id].consentLabel}
              checked={agreed[id]}
              onToggle={() => setAgreed((current) => ({ ...current, [id]: !current[id] }))}
              onView={() => router.push(`/legal/${id}`)}
            />
          ))}
          <CheckRow
            tag="Optional"
            label="Practice reminders and news"
            checked={marketing}
            onToggle={() => setMarketing((value) => !value)}
          />
        </View>
      </Screen>

      <CtaDock>
        <Button label="Next" onPress={next} disabled={!allRequired} />
      </CtaDock>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 28,
    paddingTop: 16,
    paddingBottom: spacing.huge,
  },
  intro: {
    gap: 8,
  },
  list: {
    gap: 4,
  },
  rule: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 4,
  },
});
