import { nativeLanguageOptions } from '@/data/profile';
import { useApp } from '@/store/AppStore';

import { PickerSheet } from './PickerSheet';

/**
 * The app's one language setting. ON-2 (About you), MY-1b and MY-3
 * (Settings, as `App language`) all open this sheet, so the list and what a pick does can't drift
 * between them: a pick lands in `profile.nativeLanguage` right away (saved on
 * the device), and every screen reads it from there. It sets the language of
 * meanings and explanations; the app's own UI stays in English (§6).
 */
export function NativeLanguageSheet({
  visible,
  title = 'Native language',
  onClose,
}: {
  visible: boolean;
  /** Settings calls the same setting `App language`. */
  title?: string;
  onClose: () => void;
}) {
  const { profile, updateProfile } = useApp();

  return (
    <PickerSheet
      visible={visible}
      title={title}
      options={nativeLanguageOptions}
      selected={profile.nativeLanguage}
      onSelect={(nativeLanguage) => updateProfile({ nativeLanguage })}
      onClose={onClose}
    />
  );
}
