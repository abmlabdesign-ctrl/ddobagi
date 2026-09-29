import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Local reminders — scheduled on the phone itself, so no push server.
 *
 * The whole schedule is rebuilt from settings each time something relevant
 * changes (a toggle, the open-mistake count, a trial starting). Rebuilding is
 * simpler and safer than patching: nothing stale can survive.
 *
 * The web has no scheduled notifications, so everything here is a no-op
 * there and MY-3 says reminders live in the phone app.
 */
export const remindersSupported = Platform.OS !== 'web';

/** Evening for practice, midday for review — apart, so they never stack. */
const PRACTICE_AT = { hour: 19, minute: 0 };
const REVIEW_AT = { hour: 12, minute: 30 };
/** How long before a trial ends to warn about the first charge. */
const TRIAL_WARNING_DAYS = 2;

export type ReminderPlan = {
  practice: boolean;
  review: boolean;
  openMistakes: number;
  /** Epoch ms the free trial turns paid, when a trial is running and set to renew. */
  trialEndsAt: number | null;
  trialPrice: string | null;
};

let configured = false;

function configure() {
  if (configured) return;
  configured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    }).catch(() => {});
  }
}

/** Ask once, only when something actually needs to be scheduled. */
async function permitted() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

export async function syncReminders(plan: ReminderPlan): Promise<'ok' | 'denied' | 'unsupported'> {
  if (!remindersSupported) return 'unsupported';
  configure();

  await Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});

  const trialWarnAt = plan.trialEndsAt
    ? plan.trialEndsAt - TRIAL_WARNING_DAYS * 24 * 60 * 60 * 1000
    : null;
  const wantsTrial = trialWarnAt !== null && trialWarnAt > Date.now();
  const wantsReview = plan.review && plan.openMistakes > 0;
  if (!plan.practice && !wantsReview && !wantsTrial) return 'ok';

  if (!(await permitted())) return 'denied';

  const daily = (at: { hour: number; minute: number }) => ({
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    channelId: 'reminders',
    ...at,
  }) as const;

  const jobs: Promise<string>[] = [];
  if (plan.practice) {
    jobs.push(
      Notifications.scheduleNotificationAsync({
        content: { title: 'Time to speak', body: 'One roleplay keeps your streak going.' },
        trigger: daily(PRACTICE_AT),
      }),
    );
  }
  if (wantsReview) {
    jobs.push(
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Review missions',
          body: `${plan.openMistakes} mistake${plan.openMistakes === 1 ? '' : 's'} waiting. Three minutes fixes one.`,
        },
        trigger: daily(REVIEW_AT),
      }),
    );
  }
  if (wantsTrial && trialWarnAt !== null) {
    // Stores expect a heads-up before a trial turns into a charge.
    jobs.push(
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Your free trial ends soon',
          body: `Plus renews in ${TRIAL_WARNING_DAYS} days${plan.trialPrice ? ` for ${plan.trialPrice}` : ''}. Cancel anytime in Subscription.`,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(trialWarnAt),
        },
      }),
    );
  }
  await Promise.all(jobs).catch(() => {});
  return 'ok';
}
