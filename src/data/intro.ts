import type { ImageSourcePropType } from 'react-native';

/**
 * IN-1 ~ IN-4 Feature intro. Layout and the IN-1 copy follow the final intro
 * comp (2026-10-02); each page's graphic is the delivered asset as-is, with
 * its pixel size so the screen can scale it without stretching or cropping.
 * The comp only spells out IN-1's copy — IN-2 ~ IN-4 follow its two-line
 * pattern and say what their graphic shows.
 */
export type IntroPage = {
  id: string;
  title: string;
  body: string;
  art: ImageSourcePropType;
  /** The asset's own size in px — its 1× layout size and aspect ratio. */
  artWidth: number;
  artHeight: number;
};

export const introPages: IntroPage[] = [
  {
    id: 'IN-1',
    title: 'Practice Korean for real life',
    body: 'Order coffee, visit a doctor,\nand handle everyday situations.',
    art: require('../../assets/intro/intro-1.png'),
    artWidth: 346,
    artHeight: 390,
  },
  {
    id: 'IN-2',
    title: 'Talk it through with AI',
    body: 'AI plays the barista, doctor or clerk\nand replies just like in real life.',
    art: require('../../assets/intro/intro-2.png'),
    artWidth: 362,
    artHeight: 432,
  },
  {
    id: 'IN-3',
    title: 'Turn mistakes into quick lessons',
    body: 'Every slip goes to your Mistake log.\nFix it in a 3-minute mission.',
    art: require('../../assets/intro/intro-3.png'),
    artWidth: 351,
    artHeight: 400,
  },
  {
    id: 'IN-4',
    title: 'See yourself get better',
    body: 'Get a report on six speaking skills\nafter every conversation.',
    art: require('../../assets/intro/intro-4.png'),
    artWidth: 289,
    artHeight: 602,
  },
];
