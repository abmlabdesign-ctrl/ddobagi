import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { SpeakerIcon } from '@/icons';
import type { Token } from '@/data/types';
import { colors, radius, shadows } from '@/theme/tokens';
import { fontFamily, type } from '@/theme/typography';

/**
 * Progressive disclosure (handoff §6):
 *  - Korean is the primary text and is always read first.
 *  - English is a caption: `always` where meaning is required to do the task,
 *    `toggle` behind Show meaning, `none` for speaking drills.
 *  - Every word carries a dotted underline — that is the affordance for
 *    "tap to hear how it sounds" across RV-2a … RV-2e. Punctuation does not.
 *  - Romanization is never shown by default; a word that has one reveals a
 *    tooltip on tap.
 *  - Replay is offered for every Korean utterance.
 */
export type MeaningMode = 'always' | 'toggle' | 'none';

type Props = {
  tokens: Token[];
  english?: string;
  meaning?: MeaningMode;
  onReplay?: () => void;
  textStyle?: StyleProp<TextStyle>;
  captionStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  /** Shown under the sentence when any token can be tapped. */
  tapHint?: string;
  /** Colour of the dotted rule under each word. RV-2c uses primary. */
  underlineColor?: string;
};

export function KoreanText({
  tokens,
  english,
  meaning = 'none',
  onReplay,
  textStyle,
  captionStyle,
  style,
  tapHint,
  underlineColor = colors.border,
}: Props) {
  const [openToken, setOpenToken] = useState<number | null>(null);
  const [showMeaning, setShowMeaning] = useState(false);

  const meaningVisible = meaning === 'always' || (meaning === 'toggle' && showMeaning);
  const hasRomanization = tokens.some((token) => token.romanization);

  return (
    <View style={[styles.root, style]}>
      <View style={styles.sentenceRow}>
        {onReplay ? (
          <Pressable
            onPress={onReplay}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Replay"
            style={styles.replay}
          >
            <SpeakerIcon size={16} />
          </Pressable>
        ) : null}

        <View style={styles.tokens}>
          {tokens.map((token, index) => (
            <KoreanToken
              key={`${token.text}-${index}`}
              token={token}
              textStyle={textStyle}
              underlineColor={underlineColor}
              spaced={index > 0 && !isPunctuation(token.text)}
              open={openToken === index}
              onToggle={() => setOpenToken(openToken === index ? null : index)}
            />
          ))}
        </View>
      </View>

      {meaning === 'toggle' ? (
        <Pressable
          onPress={() => setShowMeaning((value) => !value)}
          hitSlop={8}
          accessibilityRole="button"
          style={styles.meaningToggle}
        >
          <Text style={styles.meaningToggleLabel}>
            {showMeaning ? 'Hide meaning' : 'Show meaning'}
          </Text>
        </Pressable>
      ) : null}

      {meaningVisible && english ? (
        <Text style={[type.secondary, captionStyle]}>{english}</Text>
      ) : null}

      {hasRomanization && tapHint ? <Text style={type.caption}>{tapHint}</Text> : null}
    </View>
  );
}

function KoreanToken({
  token,
  textStyle,
  spaced,
  open,
  onToggle,
  underlineColor,
}: {
  token: Token;
  textStyle?: StyleProp<TextStyle>;
  spaced: boolean;
  open: boolean;
  onToggle: () => void;
  underlineColor: string;
}) {
  const [tooltipWidth, setTooltipWidth] = useState(0);
  const gap = spaced ? styles.spaced : null;
  // The rule is what tells the learner a word can be tapped, so every word gets
  // one. Punctuation keeps the same box — a clear rule — so baselines still line up.
  if (token.blank) {
    return <Text style={[styles.token, styles.blankRule, gap, textStyle]}>{BLANK}</Text>;
  }

  const rule = [
    styles.rule,
    { borderBottomColor: isPunctuation(token.text) ? 'transparent' : underlineColor },
  ];

  if (!token.romanization) {
    return <Text style={[styles.token, rule, gap, textStyle]}>{token.text}</Text>;
  }

  return (
    <View style={[styles.tokenWrap, gap]}>
      {open ? (
        <View
          onLayout={(event) => setTooltipWidth(event.nativeEvent.layout.width)}
          style={[styles.tooltip, { transform: [{ translateX: -tooltipWidth / 2 }] }]}
          pointerEvents="none"
        >
          <Text style={styles.tooltipText}>{token.romanization}</Text>
        </View>
      ) : null}
      <Pressable
        onPress={onToggle}
        hitSlop={{ top: 8, bottom: 8 }}
        accessibilityRole="button"
        accessibilityLabel={`${token.text}, tap for pronunciation`}
      >
        <Text style={[styles.token, rule, textStyle]}>{token.text}</Text>
      </Pressable>
    </View>
  );
}

/** The comp sizes the gap with six non-breaking space pairs at the sentence size. */
const BLANK = '\u00a0 '.repeat(6);

/** Text-only helper for Korean without romanization or a caption. */
export function toTokens(sentence: string): Token[] {
  return sentence.split(' ').map((text) => ({ text }));
}

const PUNCTUATION = /^[.,!?;:)\]}»”’·…]+$/u;

/** Korean punctuation hangs off the previous word rather than standing alone. */
export function isPunctuation(text: string) {
  return PUNCTUATION.test(text.trim());
}

/** Joins tokens into a plain string with the same punctuation rule. */
export function joinTokens(parts: string[]) {
  return parts.reduce(
    (sentence, part, index) =>
      index === 0 || isPunctuation(part) ? sentence + part : `${sentence} ${part}`,
    '',
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 8,
  },
  sentenceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  replay: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  tokens: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  spaced: {
    marginLeft: 8,
  },
  tokenWrap: {
    position: 'relative',
  },
  token: {
    ...type.korean,
  },
  rule: {
    borderBottomWidth: 2,
    borderStyle: 'dotted',
    paddingBottom: 1,
  },
  blankRule: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: 1,
  },
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.badge,
    backgroundColor: colors.ink,
    ...shadows.modal,
  },
  tooltipText: {
    fontFamily: fontFamily.numeric,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: colors.surface,
  },
  meaningToggle: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  meaningToggleLabel: {
    fontFamily: fontFamily.sans,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});
