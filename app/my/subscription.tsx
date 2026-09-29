import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PillLabel } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card, RowDivider } from '@/components/Card';
import { MenuRow } from '@/components/Controls';
import { NavBar } from '@/components/NavBar';
import { PickerSheet } from '@/components/PickerSheet';
import { Screen, ScreenShell } from '@/components/Screen';
import { freeLimits, planById, plans, type PlanId } from '@/data/plans';
import {
  billingMode,
  formatLongDate,
  openStoreSubscriptions,
  purchase,
  restorePurchases,
} from '@/services/billing';
import { useApp } from '@/store/AppStore';
import { colors, radius, spacing } from '@/theme/tokens';
import { numeral, text, type } from '@/theme/typography';

/**
 * MY-3 › Subscription. Free shows today's allowance and the way up; Plus shows
 * the plan, when it renews (or ends), plan changes, cancel and billing history.
 * Laid out in the MY-3 grouped-card language.
 */
export default function SubscriptionScreen() {
  const {
    isPlus,
    freeLeft,
    subscription,
    receipts,
    subscribe,
    cancelSubscription,
    resumeSubscription,
  } = useApp();
  const insets = useSafeAreaInsets();
  const [picker, setPicker] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const plan = subscription ? planById[subscription.planId] : null;

  const changePlan = async (planId: PlanId) => {
    if (!subscription || planId === subscription.planId) return;
    setMessage(null);
    try {
      subscribe(await purchase(planId, false));
      setMessage(`Switched to ${planById[planId].label}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong.');
    }
  };

  const cancel = () => {
    setConfirmCancel(false);
    // Store subscriptions can only be cancelled in the store itself.
    if (billingMode === 'store') {
      openStoreSubscriptions();
      return;
    }
    cancelSubscription();
  };

  const restore = async () => {
    setMessage(null);
    try {
      const receipt = await restorePurchases();
      if (receipt) subscribe(receipt);
      setMessage(receipt ? 'Your subscription is back.' : 'We didn’t find a subscription to restore.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong.');
    }
  };

  return (
    <ScreenShell bottomEdge="content">
      <NavBar title="Subscription" />

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        <Card radiusToken="group" elevation="card" paddingHorizontal={20} paddingVertical={20}>
          {isPlus && subscription && plan ? (
            <View style={styles.planCard}>
              <View style={styles.planHead}>
                <PillLabel label="Plus" />
                <Text style={styles.status}>
                  {!subscription.autoRenew ? 'Cancelled' : subscription.trial ? 'Free trial' : 'Active'}
                </Text>
              </View>
              <Text style={type.cardTitle}>Ddobak Plus · {plan.label}</Text>
              <Text style={type.secondary}>
                {!subscription.autoRenew
                  ? `You keep Plus until ${formatLongDate(subscription.renewsAt)}.`
                  : subscription.trial
                    ? `Trial ends ${formatLongDate(subscription.renewsAt)}, then ${plan.price}/${plan.period}.`
                    : `Renews ${formatLongDate(subscription.renewsAt)} for ${plan.price}.`}
              </Text>
            </View>
          ) : (
            <View style={styles.planCard}>
              <Text style={type.cardTitle}>Free plan</Text>
              <Text style={type.secondary}>Today you have left:</Text>
              <View style={styles.usage}>
                <Usage
                  label="Roleplays"
                  left={freeLeft.roleplays}
                  total={freeLimits.roleplaysPerDay}
                />
                <Usage label="Missions" left={freeLeft.missions} total={freeLimits.missionsPerDay} />
              </View>
              <Button label="Get Plus" onPress={() => router.push('/plus')} glow />
            </View>
          )}
        </Card>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        {isPlus && subscription ? (
          <Group title="Manage">
            {subscription.autoRenew ? (
              <>
                <MenuRow
                  label="Change plan"
                  value={plan?.label}
                  height={56}
                  onPress={() => setPicker(true)}
                />
                <RowDivider />
                <Pressable
                  onPress={() => setConfirmCancel(true)}
                  accessibilityRole="button"
                  style={styles.textRow}
                >
                  <Text style={styles.dangerLabel}>Cancel subscription</Text>
                </Pressable>
              </>
            ) : (
              <Pressable onPress={resumeSubscription} accessibilityRole="button" style={styles.textRow}>
                <Text style={styles.primaryLabel}>Resume subscription</Text>
              </Pressable>
            )}
          </Group>
        ) : null}

        <Group title="Billing history">
          {receipts.length === 0 ? (
            <View style={styles.textRow}>
              <Text style={type.secondary}>No payments yet.</Text>
            </View>
          ) : (
            receipts.map((receipt, index) => (
              <View key={receipt.id}>
                {index > 0 ? <RowDivider /> : null}
                <View style={styles.receipt}>
                  <View style={styles.receiptText}>
                    <Text style={type.listTitleTight}>
                      Plus · {planById[receipt.planId].label}
                      {receipt.trial ? ' · free trial' : ''}
                    </Text>
                    <Text style={type.caption}>{receipt.date}</Text>
                  </View>
                  <Text style={styles.amount}>{receipt.amount}</Text>
                </View>
              </View>
            ))
          )}
        </Group>

        <Group title="Other">
          <MenuRow label="Restore purchases" height={56} onPress={restore} />
          {billingMode === 'store' ? (
            <>
              <RowDivider />
              <MenuRow label="Manage in store" height={56} onPress={openStoreSubscriptions} />
            </>
          ) : null}
        </Group>

        {billingMode === 'sandbox' ? (
          <Text style={styles.sandbox}>Test mode: purchases here don&apos;t charge anyone.</Text>
        ) : null}
      </Screen>

      {subscription ? (
        <PickerSheet
          visible={picker}
          title="Change plan"
          options={plans.map((option) => option.id)}
          selected={subscription.planId}
          format={(id) => `${planById[id].label} · ${planById[id].price}/${planById[id].period}`}
          onSelect={changePlan}
          onClose={() => setPicker(false)}
        />
      ) : null}

      <Modal
        visible={confirmCancel}
        transparent
        animationType="slide"
        onRequestClose={() => setConfirmCancel(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setConfirmCancel(false)}
          accessibilityLabel="Close"
        />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
          <Text style={type.section}>Cancel Plus?</Text>
          <Text style={type.secondary}>
            {subscription
              ? `You'll keep Plus until ${formatLongDate(subscription.renewsAt)}. After that, you're back to ${freeLimits.roleplaysPerDay} roleplay and ${freeLimits.missionsPerDay} missions a day.`
              : ''}
          </Text>
          <View style={styles.sheetActions}>
            <Button label="Keep Plus" onPress={() => setConfirmCancel(false)} />
            <Button label="Cancel subscription" variant="text" onPress={cancel} />
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
}

function Usage({ label, left, total }: { label: string; left: number; total: number }) {
  return (
    <View style={styles.usageCell}>
      <Text style={styles.usageValue}>
        {left} / {total}
      </Text>
      <Text style={type.caption}>{label}</Text>
    </View>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <Card radiusToken="group" elevation="card" paddingHorizontal={20} paddingVertical={6}>
        {children}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingTop: 8,
    paddingBottom: spacing.huge,
  },
  planCard: {
    gap: 10,
  },
  planHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  status: text(12, 16, '600', colors.success),
  usage: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  usageCell: {
    flex: 1,
    borderRadius: radius.input,
    backgroundColor: colors.surfaceAlt,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 2,
  },
  usageValue: numeral(20, 26, '700', colors.ink),
  message: {
    ...type.caption,
    textAlign: 'center',
  },
  group: {
    gap: 8,
  },
  groupTitle: {
    ...text(12, 16, '600', colors.textTertiary),
    paddingLeft: 4,
  },
  textRow: {
    height: 56,
    justifyContent: 'center',
  },
  dangerLabel: {
    ...type.row,
    color: colors.danger,
  },
  primaryLabel: {
    ...type.row,
    color: colors.primary,
  },
  receipt: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  receiptText: {
    flex: 1,
    gap: 2,
  },
  amount: numeral(15, 20, '600', colors.inkAlt),
  sandbox: {
    ...text(11, 16, '600', colors.info),
    textAlign: 'center',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(25,31,40,0.35)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xl,
    gap: 10,
  },
  sheetActions: {
    gap: 4,
    marginTop: 8,
  },
});
