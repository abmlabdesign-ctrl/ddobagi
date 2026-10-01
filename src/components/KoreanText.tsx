import { useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { SpeakerIcon } from '@/icons';
import { hasHangul, romanize } from '@/services/romanize';
import { speak } from '@/services/speech';
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
 *  - Romanization is never shown by default; every Korean word reveals a
 *    tooltip on tap — the authored `romanization` where there is one, the
 *    rule-based reading from `services/romanize` otherwise.
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
  /** Colour of the dotted rule under each word. RV-2c uses primary. */
  underlineColor?: string;
  /** RV-2b live caption: how many tokens the learner has read so far. */
  spokenCount?: number;
  /**
   * RV-2a: how many syllables (punctuation aside) speech recognition has heard
   * so far, counted from the start of the sentence. Lights up letter by letter.
   */
  spokenSyllables?: number;
};

export function KoreanText({
  tokens,
  english,
  meaning = 'none',
  onReplay,
  textStyle,
  captionStyle,
  style,
  underlineColor = colors.border,
  spokenCount = 0,
  spokenSyllables = 0,
}: Props) {
  const [openToken, setOpenToken] = useState<number | null>(null);
  const [showMeaning, setShowMeaning] = useState(false);

  const meaningVisible = meaning === 'always' || (meaning === 'toggle' && showMeaning);

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
              spoken={index < spokenCount}
              litSyllables={litIn(tokens, index, spokenSyllables)}
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
    </View>
  );
}

/** Keeps the tooltip clear of the screen edges. */
const TOOLTIP_MARGIN = 16;

function KoreanToken({
  token,
  textStyle,
  spaced,
  open,
  onToggle,
  underlineColor,
  spoken,
  litSyllables,
}: {
  token: Token;
  textStyle?: StyleProp<TextStyle>;
  spaced: boolean;
  open: boolean;
  onToggle: () => void;
  underlineColor: string;
  spoken: boolean;
  /** Leading syllables of this word heard so far (RV-2a). */
  litSyllables: number;
}) {
  // `shift` nudges the card back on screen near an edge; the tail stays on the
  // word, so it keeps pointing at what was tapped.
  const [tip, setTip] = useState({ width: 0, shift: 0 });
  const wrapRef = useRef<View>(null);
  const gap = spaced ? styles.spaced : null;

  const measureTooltip = (width: number) => {
    wrapRef.current?.measureInWindow((x, _y, wordWidth) => {
      const centre = x + wordWidth / 2;
      const half = width / 2;
      const screen = Dimensions.get('window').width;
      const clamped = Math.min(
        Math.max(centre, TOOLTIP_MARGIN + half),
        screen - TOOLTIP_MARGIN - half,
      );
      setTip({ width, shift: clamped - centre });
    });
  };
  // The rule is what tells the learner a word can be tapped, so every word gets
  // one. Punctuation keeps the same box — a clear rule — so baselines still line up.
  if (token.blank) {
    return <Text style={[styles.token, styles.blankRule, gap, textStyle]}>{BLANK}</Text>;
  }

  const rule = [
    styles.rule,
    { borderBottomColor: isPunctuation(token.text) ? 'transparent' : underlineColor },
    // RV-2b lights the sentence up as the learner reads through it.
    spoken ? styles.spokenToken : null,
  ];

  const sayWord = () => speak(token.text, { scale: 'word' });
  const romanization =
    token.romanization ?? (hasHangul(token.text) ? romanize(token.text) : undefined);

  // The heard part of a word turns orange syllable by syllable; the rest stays.
  const lit = Math.min(litSyllables, token.text.length);
  const label =
    lit > 0 && !spoken ? (
      <>
        <Text style={styles.spokenToken}>{token.text.slice(0, lit)}</Text>
        {token.text.slice(lit)}
      </>
    ) : (
      token.text
    );

  // 한글이 없는 토큰(문장부호 등)은 툴팁도 소리도 없다. Pressable로 감싸면
  // 정렬이 틀어지므로 Text를 그대로 둔다.
  if (!romanization) {
    return <Text style={[styles.token, rule, gap, textStyle]}>{label}</Text>;
  }

  return (
    <View ref={wrapRef} style={[styles.tokenWrap, open ? styles.tokenWrapOpen : null, gap]}>
      {open ? (
        <View
          onLayout={(event) => measureTooltip(event.nativeEvent.layout.width)}
          style={[styles.tooltip, { transform: [{ translateX: -tip.width / 2 + tip.shift }] }]}
          pointerEvents="none"
        >
          <View style={[styles.tooltipTail, { left: tip.width / 2 - tip.shift - 5 }]} />
          <Text style={styles.tooltipWord}>{token.text}</Text>
          <Text style={styles.tooltipRoman}>{romanization}</Text>
        </View>
      ) : null}
      <Pressable
        onPress={() => {
          onToggle();
          sayWord();
        }}
        hitSlop={{ top: 8, bottom: 8 }}
        accessibilityRole="button"
        accessibilityLabel={`${token.text}, tap for pronunciation`}
      >
        <Text style={[styles.token, rule, textStyle]}>{label}</Text>
      </Pressable>
    </View>
  );
}

/**
 * How many of `tokens[index]`'s characters fall inside the first `heard`
 * syllables of the sentence. Punctuation doesn't count as a syllable.
 */
function litIn(tokens: Token[], index: number, heard: number) {
  if (heard <= 0) return 0;
  let before = 0;
  for (let i = 0; i < index; i += 1) {
    if (!isPunctuation(tokens[i].text)) before += tokens[i].text.length;
  }
  return Math.max(0, heard - before);
}

/** Syllables in a sentence, punctuation aside — the total `spokenSyllables` counts toward. */
export function syllableCount(tokens: Token[]) {
  return tokens.reduce(
    (sum, token) => sum + (isPunctuation(token.text) ? 0 : token.text.length),
    0,
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
    // RN paints siblings in tree order, so without this the English caption
    // below would cover an open tooltip. The row, and the open word inside it,
    // have to out-rank everything drawn after them.
    zIndex: 2,
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
  tokenWrapOpen: {
    zIndex: 3,
  },
  token: {
    ...type.korean,
  },
  spokenToken: {
    color: colors.primary,
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
  /**
   * The comp hangs the tooltip under the word — `top: calc(100% + 8px)`, r10,
   * padding 8/12 — with a 10px square rotated 45° for the tail.
   */
  tooltip: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.ink,
    gap: 1,
    zIndex: 4,
    ...shadows.modal,
  },
  tooltipTail: {
    position: 'absolute',
    top: -5,
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: colors.ink,
    transform: [{ rotate: '45deg' }],
  },
  tooltipWord: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.surface,
  },
  tooltipRoman: {
    fontFamily: fontFamily.numeric,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textTertiary,
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
