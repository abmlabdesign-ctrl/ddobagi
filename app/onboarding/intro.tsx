import { LinearGradient } from 'expo-linear-gradient';
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
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { ScreenShell } from '@/components/Screen';
import { introPages, type IntroPage } from '@/data/intro';
import { useApp } from '@/store/AppStore';
import { colors, radius } from '@/theme/tokens';
import { text } from '@/theme/typography';

/**
 * IN-1 ~ IN-4 Feature intro — ON-1b → here → ON-2, shown once.
 *
 * Final intro comp (390×844): a #F7F8FD hero with the page graphic centred
 * under `skip`, fading to white over 24px; then the centred title and two-line
 * body, the page dots and a full-width CTA. The hero takes whatever height is
 * left, so the bottom block keeps the comp's spacing on every phone.
 * `Next` pages forward, `skip` and the last page's `Check my level` lead into
 * setup.
 */
export default function Intro() {
  const { finishIntro } = useApp();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
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

  const goTo = (index: number) => pager.current?.scrollTo({ x: index * width, animated: true });

  return (
    <ScreenShell background="surface-alt" bottomEdge="dock">
      {/* `skip` sits 25 under the status bar, right-aligned on the 24 gutter. */}
      <View style={styles.topBar}>
        {last ? null : (
          <Pressable onPress={done} hitSlop={10} accessibilityRole="button">
            <Text style={styles.skip}>skip</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        ref={pager}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.pager}
        contentContainerStyle={styles.pagerContent}
      >
        {introPages.map((entry) => (
          <IntroSlide key={entry.id} page={entry} width={width} />
        ))}
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: Math.max(25, insets.bottom) }]}>
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
        <Button
          label={last ? 'Check my level' : 'Next'}
          onPress={last ? done : () => goTo(page + 1)}
          style={styles.cta}
        />
      </View>
    </ScreenShell>
  );
}

function IntroSlide({ page, width }: { page: IntroPage; width: number }) {
  /** The room the hero leaves for the art, measured — it depends on the phone. */
  const [box, setBox] = useState({ width: 0, height: 0 });
  const onArtLayout = (event: LayoutChangeEvent) => {
    const { width: w, height: h } = event.nativeEvent.layout;
    setBox((current) =>
      current.width === w && current.height === h ? current : { width: w, height: h },
    );
  };
  // Contain: never past the asset's own size, never cropped or stretched.
  const scale = Math.min(1, box.width / page.artWidth, box.height / page.artHeight);
  const ready = box.width > 0 && box.height > 0;

  return (
    <View style={[styles.slide, { width }]}>
      <View style={styles.hero}>
        <View style={styles.artArea} onLayout={onArtLayout}>
          {ready ? (
            <Image
              source={page.art}
              style={{ width: page.artWidth * scale, height: page.artHeight * scale }}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          ) : null}
        </View>
        <LinearGradient colors={[colors.surfaceAlt, colors.surface]} style={styles.fade} />
      </View>

      <View style={styles.copy}>
        <Text style={styles.title}>{page.title}</Text>
        <Text style={styles.body}>{page.body}</Text>
      </View>
    </View>
  );
}

/** comp: body → dots 25, dots 4 tall, dots → CTA 34, CTA 56, 25 to the bottom edge. */
const COPY_TO_DOTS = 25;
const DOTS_TO_CTA = 34;
const CTA_HEIGHT = 56;

const styles = StyleSheet.create({
  topBar: {
    height: 50,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  skip: text(14, 20, '400', colors.introSkip),
  pager: {
    flex: 1,
  },
  pagerContent: {
    flexGrow: 1,
  },
  slide: {
    flex: 1,
  },
  /** Grey ground under the art, fading to the white copy block. */
  hero: {
    flex: 1,
  },
  artArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  /** comp: #F7F8FD holds to y≈561, white by y≈585. */
  fade: {
    height: 24,
  },
  /** `padding-top:40` above the title; title 18/26 → 9 → body 14/20 × 2. */
  copy: {
    backgroundColor: colors.surface,
    paddingTop: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 9,
  },
  title: {
    ...text(18, 26, '700', colors.ink),
    textAlign: 'center',
  },
  body: {
    ...text(14, 20, '400', colors.introBody),
    textAlign: 'center',
  },
  bottom: {
    backgroundColor: colors.surface,
    paddingTop: COPY_TO_DOTS,
    paddingHorizontal: 24,
    gap: DOTS_TO_CTA,
  },
  /** 16×4 primary pill for the current page, 4×4 #D1D5D9 dots for the rest, gap 4. */
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 16,
    backgroundColor: colors.primary,
  },
  /** comp: 342×56, radius 16 — a touch tighter than the shared 18. */
  cta: {
    height: CTA_HEIGHT,
    borderRadius: 16,
  },
});
