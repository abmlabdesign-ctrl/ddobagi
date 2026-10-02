import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { CheckRow } from '@/components/CheckRow';
import { situationById } from '@/data/situations';
import type { Turn } from '@/data/types';
import { shortDate, useApp } from '@/store/AppStore';
import { colors, radius, shadows, spacing } from '@/theme/tokens';
import { text, type } from '@/theme/typography';

const unquote = (value: string) => value.replace(/["“”]/g, '').trim();

/** A conversation line as it reads now — a corrected line passes its fix. */
export type ScrapLine = Pick<Turn, 'id' | 'korean' | 'english'>;

/**
 * Long-press a conversation line → action sheet → Save to Scrapbook / Copy.
 * One way to keep a line, in RP-3, RP-3b and RV-6 alike. Render `ui` once
 * inside the screen (inside its Modal, if the screen is one) so the sheet and
 * the toast draw over that screen.
 */
export function useLineScrap(situationId: string, source: { runId?: string } = {}) {
  const { savePhrase } = useApp();
  const [line, setLine] = useState<ScrapLine | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  };

  const scrap = () => {
    if (!line) return;
    // The store skips a phrase it already holds, so saving twice is harmless.
    savePhrase({
      id: `${situationId}-${line.id}-line`,
      situationId,
      korean: unquote(line.korean),
      english: unquote(line.english ?? ''),
      savedOn: shortDate(),
      // Copied in, so the phrase stays readable once its conversation is gone.
      situationTitle: situationById[situationId]?.title,
      runId: source.runId,
    });
    setLine(null);
    showToast('Saved to your Scrapbook');
  };

  const copy = async () => {
    if (!line) return;
    const korean = unquote(line.korean);
    setLine(null);
    const ok = await Clipboard.setStringAsync(korean).catch(() => false);
    showToast(ok ? 'Copied' : "Couldn't copy that line");
  };

  const ui = (
    <>
      <ActionSheet
        visible={line !== null}
        preview={line ? unquote(line.korean) : ''}
        onScrap={scrap}
        onCopy={copy}
        onCancel={() => setLine(null)}
      />
      {toast ? <Toast message={toast} /> : null}
    </>
  );

  return { open: (next: ScrapLine) => setLine(next), ui };
}

function ActionSheet({
  visible,
  preview,
  onScrap,
  onCopy,
  onCancel,
}: {
  visible: boolean;
  preview: string;
  onScrap: () => void;
  onCopy: () => void;
  onCancel: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel} accessibilityLabel="Close" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.handle} />
        {/* The line being acted on, so it's clear what gets saved. */}
        <Text style={styles.preview} numberOfLines={2}>
          {preview}
        </Text>
        <SheetRow label="Save to Scrapbook" onPress={onScrap} primary />
        <SheetRow label="Copy" onPress={onCopy} />
        <SheetRow label="Cancel" onPress={onCancel} muted />
      </View>
    </Modal>
  );
}

function SheetRow({
  label,
  onPress,
  primary = false,
  muted = false,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
  muted?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
    >
      <Text style={primary ? styles.rowPrimary : muted ? styles.rowMuted : styles.rowLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

function Toast({ message }: { message: string }) {
  const insets = useSafeAreaInsets();
  return (
    <Animated.View
      entering={FadeIn.duration(160)}
      exiting={FadeOut.duration(160)}
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      // High enough to clear RP-3's `You` panel and controls.
      style={[styles.toast, { bottom: insets.bottom + 240 }]}
    >
      <Text style={styles.toastLabel}>{message}</Text>
    </Animated.View>
  );
}

/** Stored when the learner ticks "Don't show again" — this device only. */
const TIP_KEY = 'ddobak/tip/line-scrap';
/** Shown once per app run until it's turned off for good. */
let tipShownThisRun = false;

/**
 * The first-visit tip for RP-3: how to keep a line. Shows on entry until the
 * learner ticks "Don't show again" and taps OK; that choice lives in device
 * storage (localStorage on the web), not the learner's synced state.
 */
export function ScrapTip(): ReactNode {
  const [visible, setVisible] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    if (tipShownThisRun) return undefined;
    let cancelled = false;
    AsyncStorage.getItem(TIP_KEY)
      .catch(() => null)
      .then((value) => {
        if (cancelled || value === 'off') return;
        tipShownThisRun = true;
        setVisible(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const close = () => {
    if (dontShow) AsyncStorage.setItem(TIP_KEY, 'off').catch(() => {});
    setVisible(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.tipBackdrop}>
        <View style={styles.tipCard}>
          <View style={styles.tipText}>
            <Text style={type.section}>Save phrases you like</Text>
            <Text style={type.secondary}>
              Long-press any line or corrected sentence to save it to your Scrapbook.
            </Text>
          </View>
          <CheckRow label="Don't show again" checked={dontShow} onToggle={() => setDontShow((v) => !v)} />
          <Button label="OK" height={52} onPress={close} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(25,31,40,0.35)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  preview: {
    ...text(14, 21, '500', colors.textSecondary),
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  row: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.input,
  },
  rowPressed: {
    backgroundColor: colors.fill,
  },
  rowPrimary: text(16, 22, '600', colors.primary),
  rowLabel: text(16, 22, '500', colors.inkAlt),
  rowMuted: text(16, 22, '500', colors.textSecondary),
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    zIndex: 20,
    ...shadows.modal,
  },
  toastLabel: text(14, 20, '600', colors.surface),
  tipBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(25,31,40,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.gutter,
  },
  tipCard: {
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: radius.group,
    padding: spacing.gutter,
    gap: spacing.lg,
    ...shadows.modal,
  },
  tipText: {
    gap: 8,
  },
});
