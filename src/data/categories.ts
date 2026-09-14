import type { Category } from './types';

/**
 * The 11 roleplay categories. Illustrations are the AI character the learner
 * talks to, so a category and its situations share one character.
 */
export const categories: Category[] = [
  {
    id: 'shopping',
    name: 'Shopping',
    blurb: 'clothes · refunds · exchanges',
    illustration: require('../../assets/illustrations/shop-assistant.png'),
  },
  {
    id: 'clinic',
    name: 'Clinic',
    blurb: 'reception · exam · prescription',
    illustration: require('../../assets/illustrations/pharmacist.png'),
  },
  {
    id: 'school',
    name: 'School',
    blurb: 'class · assignments · admin',
    illustration: require('../../assets/illustrations/professor.png'),
  },
  {
    id: 'transit',
    name: 'Transit',
    blurb: 'bus · subway · taxi',
    illustration: require('../../assets/illustrations/bus-driver.png'),
  },
  {
    id: 'government',
    name: 'Government',
    blurb: 'civil service · documents · applications',
    illustration: require('../../assets/illustrations/government-officer.png'),
  },
  {
    id: 'part-time-job',
    name: 'Part-time job',
    blurb: 'interview · shifts · service',
    illustration: require('../../assets/illustrations/cafe.png'),
  },
  {
    id: 'airport',
    name: 'Airport',
    blurb: 'immigration · baggage · boarding',
    illustration: require('../../assets/illustrations/airport-staff.png'),
  },
  {
    id: 'accommodation',
    name: 'Accommodation',
    blurb: 'check-in · questions · requests',
    illustration: require('../../assets/illustrations/front-desk.png'),
  },
  {
    id: 'directions',
    name: 'Directions',
    blurb: 'places · directions · help',
    illustration: require('../../assets/illustrations/passer-by.png'),
  },
  {
    id: 'friends',
    name: 'Friends',
    blurb: 'casual speech · daily life · plans',
    illustration: require('../../assets/illustrations/friend.png'),
  },
  {
    id: 'k-content',
    name: 'K-content',
    blurb: 'drama · variety · fan life',
    illustration: require('../../assets/illustrations/celebrity.png'),
  },
];

export const categoryById = Object.fromEntries(
  categories.map((category) => [category.id, category]),
) as Record<Category['id'], Category>;
