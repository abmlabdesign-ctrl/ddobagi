import { Linking, Platform } from 'react-native';

import { planById, type PlanId } from '@/data/plans';

/**
 * Subscriptions.
 *
 * `sandbox` is the only mode today: purchases succeed locally without charging
 * anyone, and every paywall says so. To sell for real, add a store SDK
 * (RevenueCat, or StoreKit / Play Billing directly), switch `billingMode` to
 * `store`, and fill in the three `store` branches below — the screens only
 * talk to this file.
 *
 * Entitlements should then be checked by a server (or RevenueCat) rather than
 * trusted from the device, since anything stored locally can be edited.
 */
export const billingMode: 'sandbox' | 'store' = 'sandbox';

export type Receipt = {
  id: string;
  planId: PlanId;
  amount: string;
  /** Display date, e.g. `Sep 29`. */
  date: string;
  /** Epoch ms. */
  purchasedAt: number;
  /** The first charge is a free trial. */
  trial: boolean;
};

export class BillingError extends Error {
  constructor(
    message: string,
    readonly cancelled = false,
  ) {
    super(message);
  }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const displayDate = (date: Date) => `${MONTHS[date.getMonth()]} ${date.getDate()}`;

/** Start or switch a plan. Resolves with the receipt; rejects on failure or cancel. */
export async function purchase(planId: PlanId, withTrial: boolean): Promise<Receipt> {
  if (billingMode === 'store') {
    throw new BillingError('The store isn’t connected yet.');
  }
  const plan = planById[planId];
  // Long enough for the button's busy state to read as a real round trip.
  await new Promise((resolve) => setTimeout(resolve, 700));
  const now = new Date();
  const trial = withTrial && plan.trialDays > 0;
  return {
    id: `sbx-${now.getTime()}`,
    planId,
    amount: trial ? '$0.00' : plan.price,
    date: displayDate(now),
    purchasedAt: now.getTime(),
    trial,
  };
}

/**
 * Ask the store for purchases made on this account (new phone, reinstall).
 * The sandbox has no store to ask, so there is never anything to restore.
 */
export async function restorePurchases(): Promise<Receipt | null> {
  if (billingMode === 'store') {
    throw new BillingError('The store isn’t connected yet.');
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
  return null;
}

/** Store subscriptions are cancelled in the store, not in the app. */
export const storeManageUrl =
  Platform.OS === 'ios'
    ? 'https://apps.apple.com/account/subscriptions'
    : 'https://play.google.com/store/account/subscriptions';

export function openStoreSubscriptions() {
  return Linking.openURL(storeManageUrl).catch(() => {});
}

/** When a plan bought now next renews (or the trial ends). */
export function renewalFrom(purchasedAt: number, planId: PlanId, trial: boolean) {
  const date = new Date(purchasedAt);
  if (trial) {
    date.setDate(date.getDate() + planById[planId].trialDays);
  } else if (planById[planId].period === 'year') {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    date.setMonth(date.getMonth() + 1);
  }
  return date.getTime();
}

export const formatLongDate = (ms: number) => {
  const date = new Date(ms);
  return `${displayDate(date)}, ${date.getFullYear()}`;
};
