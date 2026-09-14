import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Segmented, SelectRow } from '@/components/Controls';
import { NavBar } from '@/components/NavBar';
import { Screen } from '@/components/Screen';
import { avatars, interestOptions, koreanLevels } from '@/data/profile';
import { useApp } from '@/store/AppStore';
import { colors, radius, spacing } from '@/theme/tokens';
import { fontFamily, type } from '@/theme/typography';

const MAX_INTERESTS = 5;

/** MY-1b Edit profile */
export default function EditProfile() {
  const { profile, updateProfile } = useApp();

  const [avatarId, setAvatarId] = useState(profile.avatarId);
  const [nickname, setNickname] = useState(profile.nickname);
  const [level, setLevel] = useState(profile.koreanLevel);
  const [interests, setInterests] = useState(profile.interests);

  const toggleInterest = (value: string) => {
    setInterests((current) => {
      if (current.includes(value)) return current.filter((item) => item !== value);
      if (current.length >= MAX_INTERESTS) return current;
      return [...current, value];
    });
  };

  const save = () => {
    updateProfile({ avatarId, nickname, koreanLevel: level, interests });
    router.back();
  };

  return (
    <View style={styles.root}>
      <NavBar title="Edit profile" />

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        <View style={styles.group}>
          <View style={styles.groupHeader}>
            <Text style={type.section}>Avatar</Text>
            <Text style={type.caption}>Pick 1 of {avatars.length}</Text>
          </View>
          <View style={styles.avatarRow}>
            {avatars.map((avatar) => (
              <Pressable
                key={avatar.id}
                onPress={() => setAvatarId(avatar.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: avatarId === avatar.id }}
                accessibilityLabel={`Avatar ${avatar.id}`}
                style={[
                  styles.avatarButton,
                  avatarId === avatar.id ? styles.avatarSelected : null,
                ]}
              >
                <Image
                  source={avatar.source}
                  style={styles.avatarImage}
                  resizeMode="cover"
                  accessibilityIgnoresInvertColors
                />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.group}>
          <Text style={type.section}>Nickname</Text>
          <TextInput
            value={nickname}
            onChangeText={setNickname}
            style={styles.input}
            maxLength={20}
            accessibilityLabel="Nickname"
          />
        </View>

        <SelectRow label="Native language" value={profile.nativeLanguage} />

        <View style={styles.group}>
          <Text style={type.section}>Korean level</Text>
          <Segmented options={koreanLevels} value={level} onChange={setLevel} />
        </View>

        <View style={styles.group}>
          <View style={styles.groupHeader}>
            <Text style={type.section}>Interests</Text>
            <Text style={type.caption}>
              {interests.length} / {MAX_INTERESTS}
            </Text>
          </View>
          <View style={styles.chips}>
            {interestOptions.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={interests.includes(option)}
                onPress={() => toggleInterest(option)}
              />
            ))}
          </View>
        </View>
      </Screen>

      <View style={styles.footer}>
        <Button label="Save" onPress={save} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  content: {
    gap: spacing.xxl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.huge,
  },
  group: {
    gap: spacing.md,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  avatarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  avatarButton: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  avatarSelected: {
    borderColor: colors.primary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  input: {
    height: 48,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    fontFamily: fontFamily.sans,
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
    backgroundColor: colors.surfaceAlt,
  },
});
