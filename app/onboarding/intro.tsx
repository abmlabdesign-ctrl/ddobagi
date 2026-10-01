import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { Button } from '@/components/Button';
import { ScreenShell } from '@/components/Screen';
import { introPages, type IntroPage } from '@/data/intro';
import { useApp } from '@/store/AppStore';
import { colors, radius, shadows } from '@/theme/tokens';
import { text } from '@/theme/typography';

/**
 * IN-1 ~ IN-5 Feature intro — ON-1b → here → ON-2. A five-page swipe carousel
 * (`또박이 UI - 00 기능 소개.dc.html`). `Skip` and the last page's
 * `Check my level` both lead into setup; it's shown once and never again.
 */
export default function Intro() {
  const { finishIntro } = useApp();
  const { width } = useWindowDimensions();
  const pager = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const last = page === introPages.length - 1;

  // replace, so Back from About you doesn't land on the carousel again.
  const done = () => {
    finishIntro();
    router.replace('/onboarding/setup');
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / Math.max(1, width));
    if (next !== page) setPage(next);
  };

  // The dots double as a way to page without a swipe (a laptop has none).
  const goTo = (index: number) => pager.current?.scrollTo({ x: index * width, animated: true });

  return (
    <ScreenShell background="surface" bottomEdge="content">
      {/* `height:48; padding:0 24` — Skip on the right; IN-5 keeps the row empty. */}
      <View style={styles.topBar}>
        {last ? null : (
          <Pressable onPress={done} hitSlop={10} accessibilityRole="button">
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.dots} accessibilityRole="tablist">
        {introPages.map((entry, index) => (
          <Pressable
            key={entry.id}
            onPress={() => goTo(index)}
            hitSlop={6}
            accessibilityRole="tab"
            accessibilityState={{ selected: index === page }}
            accessibilityLabel={`Page ${index + 1} of ${introPages.length}`}
          >
            <View style={[styles.dot, index === page ? styles.dotActive : null]} />
          </Pressable>
        ))}
      </View>

      <ScrollView
        ref={pager}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.pager}
      >
        {introPages.map((entry, index) => (
          <IntroSlide
            key={entry.id}
            page={entry}
            width={width}
            onFinish={index === introPages.length - 1 ? done : undefined}
          />
        ))}
      </ScrollView>
    </ScreenShell>
  );
}

function IntroSlide({
  page,
  width,
  onFinish,
}: {
  page: IntroPage;
  width: number;
  onFinish?: () => void;
}) {
  return (
    <View style={[styles.slide, { width }]}>
      <View style={styles.copy}>
        <Text style={styles.title}>{page.title}</Text>
        <Text style={styles.body}>{page.body}</Text>
      </View>

      <View style={[styles.panel, { backgroundColor: page.tint }]}>
        <View style={styles.device}>
          <View style={styles.screen}>
            <Image
              source={page.shot}
              style={styles.shot}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
          </View>
        </View>
      </View>

      {onFinish ? (
        <View style={styles.cta}>
          <Button label="Check my level" onPress={onFinish} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: 48,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  skip: text(15, 22, '500', colors.textSecondary),
  /** 20×6 primary pill for the current page, 6×6 #D1D5D9 dots for the rest, gap 6. */
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.primary,
  },
  pager: {
    flex: 1,
  },
  slide: {
    flex: 1,
  },
  /** `padding:22px 28px 0; gap:4`, and it takes the slack so the panel sits low. */
  copy: {
    flexGrow: 1,
    flexShrink: 0,
    paddingTop: 22,
    paddingHorizontal: 28,
    gap: 4,
  },
  title: {
    ...text(18, 38, '700', colors.ink),
    letterSpacing: -0.18,
  },
  body: text(14, 25, '400', colors.introBody),
  /**
   * `margin:8px 24px 24px; height:500; radius 32; padding-top 32`. On a phone
   * shorter than the 844 frame the panel gives way first — the mockup inside
   * is already cropped by it, so it just shows a little less of the shot.
   */
  panel: {
    flexBasis: 500,
    flexShrink: 1,
    maxHeight: 500,
    minHeight: 240,
    marginTop: 8,
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 32,
    overflow: 'hidden',
    alignItems: 'center',
    paddingTop: 32,
  },
  /** 258×560, radius 38, ink bezel 7px. */
  device: {
    width: 258,
    height: 560,
    borderRadius: 38,
    backgroundColor: colors.ink,
    padding: 7,
    ...shadows.device,
  },
  screen: {
    width: 244,
    height: 528,
    borderRadius: 31,
    overflow: 'hidden',
  },
  shot: {
    width: '100%',
    height: '100%',
  },
  /** IN-5 only — `padding:0 24px 12px`. */
  cta: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
});
