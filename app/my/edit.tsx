import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Button } from '@/components/Button';
import { Card, RowDivider } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { CtaDock } from '@/components/CtaDock';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { avatars, interestOptions, koreanLevels } from '@/data/profile';
import { ListChevronIcon } from '@/icons';
import { useApp } from '@/store/AppStore';
import { colors, radius, selectedOutline, spacing } from '@/theme/tokens';
import { numeral, text, type } from '@/theme/typography';

const MAX_INTERESTS = 5;

/** MY-1b Edit profile — four white cards, each holding one field group. */
export default function EditProfile() {
  const { profile, updateProfile } = useApp();

  const [avatarId, setAvatarId] = useState(profile.avatarId);
  const [nickname] = useState(profile.nickname);
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
    <ScreenShell>
      <NavBar title="Edit profile" />

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        <Card radiusToken="card" paddingHorizontal={20} paddingVertical={18} style={styles.group}>
          <View style={styles.groupHeader}>
            <Text style={type.listTitle}>Avatar</Text>
            <Text style={styles.groupMeta}>Pick 1 of {avatars.length}</Text>
          </View>
          <View style={styles.avatarGrid}>
            {avatars.map((avatar) => {
              const selected = avatarId === avatar.id;
              return (
                <Pressable
                  key={avatar.id}
                  onPress={() => setAvatarId(avatar.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Avatar ${avatar.id}`}
                  style={[styles.avatarButton, selected ? styles.avatarSelected : null]}
                >
                  <Image
                    source={avatar.source}
                    style={styles.avatarImage}
                    resizeMode="cover"
                    accessibilityIgnoresInvertColors
                  />
                  {selected ? (
                    <View style={styles.avatarCheck}>
                      <CheckMark />
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card radiusToken="card" paddingHorizontal={20} paddingVertical={6}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Nickname</Text>
            <Text style={styles.fieldValueStrong}>{nickname}</Text>
          </View>
          <RowDivider />
          <Pressable accessibilityRole="button" style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Native language</Text>
            <View style={styles.fieldRight}>
              <Text style={styles.fieldValue}>{profile.nativeLanguage}</Text>
              <ListChevronIcon />
            </View>
          </Pressable>
        </Card>

        <Card radiusToken="card" paddingHorizontal={20} paddingVertical={18} style={styles.group}>
          <Text style={type.listTitle}>Korean level</Text>
          <View style={styles.levels}>
            {koreanLevels.map((option) => {
              const active = option === level;
              return (
                <Pressable
                  key={option}
                  onPress={() => setLevel(option)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  style={[styles.level, active ? styles.levelActive : styles.levelIdle]}
                >
                  <Text style={active ? styles.levelLabelActive : styles.levelLabel}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card radiusToken="card" paddingHorizontal={20} paddingVertical={18} style={styles.group}>
          <View style={styles.groupHeader}>
            <Text style={type.listTitle}>Interests</Text>
            <Text style={styles.groupCount}>
              {interests.length} / {MAX_INTERESTS}
            </Text>
          </View>
          <View style={styles.chips}>
            {interestOptions.map((option) => (
              <Chip
                key={option}
                label={option}
                variant="option"
                selected={interests.includes(option)}
                onPress={() => toggleInterest(option)}
              />
            ))}
          </View>
        </Card>
      </Screen>

      <CtaDock paddingTop={12}>
        <Button label="Save" onPress={save} />
      </CtaDock>
    </ScreenShell>
  );
}

function CheckMark() {
  return (
    <Svg width={11} height={9} viewBox="0 0 11 9">
      <Path
        d="M1 4.6L4 7.6 10 1.4"
        stroke={colors.surface}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingTop: 8,
    paddingBottom: spacing.huge,
  },
  group: {
    gap: 12,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  groupMeta: text(12, 16, '500', colors.textSecondary),
  groupCount: numeral(12, 16, '400', colors.textSecondary),
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  avatarButton: {
    width: 70,
    height: 70,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  avatarSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarCheck: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldRow: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: text(16, 22, '500', colors.textSecondary),
  fieldValue: text(16, 22, '500', colors.inkAlt),
  fieldValueStrong: text(16, 22, '600', colors.inkAlt),
  fieldRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  levels: {
    flexDirection: 'row',
    gap: 8,
  },
  level: {
    flex: 1,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelIdle: {
    backgroundColor: colors.surfaceAlt,
  },
  levelActive: {
    backgroundColor: colors.primary100,
    ...selectedOutline,
  },
  levelLabel: text(14, 20, '500', colors.textSecondary),
  levelLabelActive: text(14, 20, '600', colors.primary),
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
