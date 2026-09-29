import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PillLabel } from '@/components/Badge';
import { Button } from '@/components/Button';
import { CtaDock } from '@/components/CtaDock';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import {
  paywallHeadline,
  planById,
  plans,
  plusBenefits,
  type PaywallReason,
  type PlanId,
} from '@/data/plans';
import { CheckIcon } from '@/icons';
import { BillingError, billingMode, purchase, restorePurchases } from '@/services/billing';
import { useApp } from '@/store/AppStore';
import { colors, hairline, radius, selectedOutline, spacing } from '@/theme/tokens';
import { numeral, text, type } from '@/theme/typography';

/**
 * Paywall — Ddobak Plus. Opened from a free cap (session / mission), My Page
 * and Settings. Built from the existing parts: the RV-1 focus gradient as the
 * hero, ON-2 ring-selected rows as plan cards, the standard CTA dock.
 *
 * The fine print (price, period, auto-renew, how to cancel) sits next to the
 * button on purpose — both stores reject paywalls that hide it.
 */
export default function Paywall() {
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const headline = paywallHeadline[(reason as PaywallReason) ?? 'upgrade'] ?? paywallHeadline.upgrade;
  const { isPlus, receipts, subscribe } = useApp();

  const [planId, setPlanId] = useState<PlanId>('plus-yearly');
  const [busy, setBusy] = useState<'buy' | 'restore' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const plan = planById[planId];
  // A trial is for first-time subscribers only.
  const trial = plan.trialDays > 0 && receipts.length === 0;

  const buy = async () => {
    setBusy('buy');
    setMessage(null);
    try {
      subscribe(await purchase(planId, trial));
      router.replace('/plus/success');
    } catch (error) {
      if (!(error instanceof BillingError && error.cancelled)) {
        setMessage(error instanceof Error ? error.message : 'Something went wrong. Try again.');
      }
    } finally {
      setBusy(null);
    }
  };

  const restore = async () => {
    setBusy('restore');
    setMessage(null);
    try {
      const receipt = await restorePurchases();
      if (receipt) {
        subscribe(receipt);
        router.replace('/plus/success');
      } else {
        setMessage('We didn’t find a subscription to restore.');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(null);
    }
  };

  if (isPlus) {
    return (
      <ScreenShell background="surface" bottomEdge="content">
        <NavBar title="Ddobak Plus" closeIcon />
        <Screen contentStyle={styles.already}>
          <Text style={[type.section, styles.center]}>You already have Plus.</Text>
          <Button
            label="Manage"
            variant="tonal"
            onPress={() => router.replace('/my/subscription')}
          />
        </Screen>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell background="surface">
      <NavBar title="Ddobak Plus" closeIcon />

      <Screen scroll contentStyle={styles.content}>
        <LinearGradient
          colors={['#D8E7FF', '#FFF0EC']}
          locations={[0.08, 0.96]}
          start={{ x: 0, y: 0.35 }}
          end={{ x: 1, y: 0.65 }}
          style={styles.hero}
        >
          <PillLabel label="Plus" />
          <Text style={type.lead}>{headline.title}</Text>
          <Text style={type.secondary}>{headline.body}</Text>
        </LinearGradient>

        <View style={styles.benefits}>
          {plusBenefits.map((benefit) => (
            <View key={benefit.title} style={styles.benefit}>
              <View style={styles.tick}>
                <CheckIcon size={16} weight={2.4} color={colors.primary} />
              </View>
              <View style={styles.benefitText}>
                <Text style={type.listTitle}>{benefit.title}</Text>
                <Text style={type.caption}>{benefit.caption}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.plans}>
          {plans.map((option) => {
            const selected = option.id === planId;
            return (
              <Pressable
                key={option.id}
                onPress={() => setPlanId(option.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${option.label}, ${option.price} a ${option.period}`}
                style={[styles.plan, selected ? selectedOutline : hairline]}
              >
                <View style={styles.planText}>
                  <View style={styles.planTitleRow}>
                    <Text style={type.title}>{option.label}</Text>
                    {option.badge ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeLabel}>{option.badge}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={type.caption}>
                    {option.trialDays > 0 && receipts.length === 0
                      ? `${option.trialDays}-day free trial`
                      : 'Billed every ' + option.period}
                  </Text>
                </View>
                <View style={styles.planPrice}>
                  <Text style={styles.price}>{option.price}</Text>
                  <Text style={type.caption}>{option.perMonth ?? `per ${option.period}`}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Screen>

      <CtaDock paddingTop={12} gap={6}>
        {message ? <Text style={[styles.message, styles.center]}>{message}</Text> : null}
        <Button
          label={busy === 'buy' ? 'One moment…' : trial ? 'Start free trial' : 'Subscribe'}
          onPress={buy}
          disabled={busy !== null}
          glow
        />
        <Text style={[styles.fine, styles.center]}>
          {trial
            ? `${plan.trialDays} days free, then ${plan.price}/${plan.period}. `
            : `${plan.price}/${plan.period}. `}
          Renews automatically until you cancel. Cancel anytime in your
          {' '}
          {billingMode === 'sandbox' ? 'subscription settings' : 'store account settings'}.
        </Text>
        {billingMode === 'sandbox' ? (
          <Text style={[styles.sandbox, styles.center]}>Test mode: you won&apos;t be charged.</Text>
        ) : null}
        <View style={styles.links}>
          <Pressable onPress={restore} disabled={busy !== null} hitSlop={8}>
            <Text style={styles.link}>{busy === 'restore' ? 'Restoring…' : 'Restore'}</Text>
          </Pressable>
          <Text style={styles.dot}>·</Text>
          <Pressable onPress={() => router.push('/legal/terms')} hitSlop={8}>
            <Text style={styles.link}>Terms</Text>
          </Pressable>
          <Text style={styles.dot}>·</Text>
          <Pressable onPress={() => router.push('/legal/privacy')} hitSlop={8}>
            <Text style={styles.link}>Privacy</Text>
          </Pressable>
        </View>
      </CtaDock>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 24,
    paddingTop: 8,
    paddingBottom: spacing.xl,
  },
  hero: {
    borderRadius: radius.group,
    padding: 20,
    gap: 8,
  },
  benefits: {
    gap: 14,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tick: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
    gap: 1,
  },
  plans: {
    gap: 10,
  },
  plan: {
    minHeight: 72,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 12,
  },
  planText: {
    flex: 1,
    gap: 2,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    borderRadius: radius.chipBadge,
    backgroundColor: colors.primary100,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeLabel: {
    ...type.badgeSmall,
    color: colors.primary,
  },
  planPrice: {
    alignItems: 'flex-end',
    gap: 2,
  },
  price: numeral(17, 22, '700', colors.ink),
  message: text(13, 19, '500', colors.danger),
  fine: text(11, 16, '400', colors.textSecondary),
  sandbox: text(11, 16, '600', colors.info),
  links: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingTop: 2,
  },
  link: text(12, 16, '500', colors.textSecondary),
  dot: text(12, 16, '400', colors.textTertiary),
  center: {
    textAlign: 'center',
  },
  already: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
});
