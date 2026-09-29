/**
 * Ddobak Plus — the one paid tier.
 *
 * Free keeps the whole loop usable every day (a roleplay and a few missions);
 * Plus removes the daily caps. AI turns cost money per conversation, so the cap
 * sits on roleplays, not on reviewing what you already did.
 *
 * Prices here are display defaults. With a store connected, `billing.ts`
 * replaces them with the store's localized prices.
 */
export type PlanId = 'plus-yearly' | 'plus-monthly';

export type Plan = {
  id: PlanId;
  label: string;
  price: string;
  period: 'year' | 'month';
  /** Per-month equivalent, shown under the yearly price. */
  perMonth?: string;
  badge?: string;
  trialDays: number;
};

export const plans: Plan[] = [
  {
    id: 'plus-yearly',
    label: 'Yearly',
    price: '$59.99',
    period: 'year',
    perMonth: '$5.00/mo',
    badge: 'Save 50%',
    trialDays: 7,
  },
  {
    id: 'plus-monthly',
    label: 'Monthly',
    price: '$9.99',
    period: 'month',
    trialDays: 0,
  },
];

export const planById = Object.fromEntries(plans.map((plan) => [plan.id, plan])) as Record<
  PlanId,
  Plan
>;

/** What Free allows per day. Plus has no caps. */
export const freeLimits = {
  roleplaysPerDay: 1,
  missionsPerDay: 3,
};

/** Paywall rows: what Plus adds, in the learner's terms. */
export const plusBenefits = [
  { title: 'Unlimited roleplays', caption: `Free is ${freeLimits.roleplaysPerDay} a day` },
  { title: 'Unlimited micro missions', caption: `Free is ${freeLimits.missionsPerDay} a day` },
  // Only what Plus actually changes today — no promises about features that
  // haven't shipped.
  { title: 'Cancel anytime', caption: 'Keep Plus until the end of the period you paid for' },
];

/** Why the paywall opened. Drives its headline. */
export type PaywallReason = 'roleplays' | 'missions' | 'upgrade';

export const paywallHeadline: Record<PaywallReason, { title: string; body: string }> = {
  roleplays: {
    title: "You've used today's free roleplay",
    body: 'Keep talking with Plus, or come back tomorrow for another free one.',
  },
  missions: {
    title: "You've done today's free missions",
    body: 'Keep reviewing with Plus, or come back tomorrow.',
  },
  upgrade: {
    title: 'Speak more with Ddobak Plus',
    body: 'Practice as much as you want, every day.',
  },
};
