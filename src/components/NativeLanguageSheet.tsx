import { nativeLanguageOptions } from '@/data/profile';
import { useApp } from '@/store/AppStore';

import { PickerSheet } from './PickerSheet';

/**
 * The one native-language picker. ON-2 (About you), MY-1 and MY-1b all open
 * this sheet, so the list and what a pick does can't drift between them: a
 * pick lands in the profile right away, and reopening shows it selected.
 */
export function NativeLanguageSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { profile, updateProfile } = useApp();

  return (
    <PickerSheet
      visible={visible}
      title="Native language"
      options={nativeLanguageOptions}
      selected={profile.nativeLanguage}
      onSelect={(nativeLanguage) => updateProfile({ nativeLanguage })}
      onClose={onClose}
    />
  );
}
