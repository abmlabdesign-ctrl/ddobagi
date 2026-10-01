import type { ImageSourcePropType } from 'react-native';

import { colors } from '@/theme/tokens';

/**
 * IN-1 ~ IN-5 Feature intro. Copy and panel tints are taken verbatim from
 * `docs/design/또박이 UI - 00 기능 소개.dc.html`; the phone shots are real app
 * screens, in the core-loop order the comp lays out.
 */
export type IntroPage = {
  id: string;
  title: string;
  body: string;
  /** The rounded panel behind the phone mockup. */
  tint: string;
  shot: ImageSourcePropType;
};

export const introPages: IntroPage[] = [
  {
    id: 'IN-1',
    title: "Practice the Korean you'll actually use",
    body: 'Order coffee, see a doctor, open a bank account. Talk it through with AI characters who reply like real people.',
    tint: colors.primary100,
    shot: require('../../assets/intro/intro-rp1.jpg'),
  },
  {
    id: 'IN-2',
    title: 'Practice Real-Life Conversations with AI',
    body: 'AI takes on roles like a barista, doctor, or bank clerk and responds just like in real situations.\nInstead of memorizing answers, learn naturally by speaking and interacting.',
    tint: colors.introLavender,
    shot: require('../../assets/intro/intro-rp3.jpg'),
  },
  {
    id: 'IN-3',
    title: 'Get feedback on every word',
    body: 'See which sounds landed and which need work, right after you speak.',
    tint: colors.infoBg,
    shot: require('../../assets/intro/intro-rp4.jpg'),
  },
  {
    id: 'IN-4',
    title: 'Your mistakes become your next lesson',
    body: 'Every slip is saved to your Mistake log. Fix them in quick 3-minute missions.',
    tint: colors.introButter,
    shot: require('../../assets/intro/intro-rv1.jpg'),
  },
  {
    id: 'IN-5',
    title: 'See yourself get better',
    body: "Start with a 1-minute level check. We'll track six speaking skills as you go.",
    tint: colors.successBg,
    shot: require('../../assets/intro/intro-my2.jpg'),
  },
];
