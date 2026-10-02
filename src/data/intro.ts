import type { ImageSourcePropType } from 'react-native';

/**
 * IN-1 ~ IN-4 Feature intro. Layout follows the final intro comps (IN-1, IN-4;
 * 2026-10-02) and the copy is the confirmed copy. Line breaks are the comps'
 * (IN-2 / IN-3 have no comp and break at a natural pause). Each graphic is the
 * delivered asset as-is, with its pixel size so the screen can scale it
 * without stretching.
 */
export type IntroPage = {
  id: string;
  title: string;
  body: string;
  art: ImageSourcePropType;
  /** The asset's own size in px — its 1× layout size and aspect ratio. */
  artWidth: number;
  artHeight: number;
  /**
   * `fit` — centred and scaled down until it fits whole. `top` — hung 21px
   * under `skip` at full size and cut off by the hero's fade (IN-4's phone).
   */
  artLayout: 'fit' | 'top';
};

export const introPages: IntroPage[] = [
  {
    id: 'IN-1',
    title: 'Practice Korean for real life',
    body: 'Order coffee, visit a doctor,\nand handle everyday situations.',
    artLayout: 'fit',
    art: require('../../assets/intro/intro-1.png'),
    artWidth: 346,
    artHeight: 390,
  },
  {
    id: 'IN-2',
    title: 'Talk it out with AI',
    body: 'Practice natural conversations with AI\nin real-life roles.',
    artLayout: 'fit',
    art: require('../../assets/intro/intro-2.png'),
    artWidth: 362,
    artHeight: 432,
  },
  {
    id: 'IN-3',
    title: 'Turn mistakes into practice',
    body: 'Save your mistakes and review them\nin quick missions.',
    artLayout: 'fit',
    art: require('../../assets/intro/intro-3.png'),
    artWidth: 351,
    artHeight: 400,
  },
  {
    id: 'IN-4',
    title: 'See yourself improve',
    body: 'Track your speaking skills and progress\nover time.',
    artLayout: 'top',
    art: require('../../assets/intro/intro-4.png'),
    artWidth: 289,
    artHeight: 602,
  },
];
