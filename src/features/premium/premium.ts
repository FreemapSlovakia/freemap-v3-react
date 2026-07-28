import type { User } from '@features/auth/model/types.js';
import { PREMIUM_MAX_TRIAL_DAYS } from '@shared/premiumPricing.js';

export function isPremium(
  user: Pick<User, 'premiumExpiration'> | null,
): boolean {
  return user?.premiumExpiration != null && user.premiumExpiration > new Date();
}

/** Premium held as a one-time year rather than as a subscription. */
export function isPremiumWithoutSubscription(
  user: Pick<User, 'premiumExpiration' | 'premiumSubscription'> | null,
): boolean {
  return isPremium(user) && !user?.premiumSubscription;
}

/**
 * Such a user is the one to tell about the price increase: subscribing before
 * it locks the current price, and the subscription only starts charging once
 * the year they already paid for runs out — as long as that year fits in the
 * trial the backend can ask for. Premium stacked beyond
 * `PREMIUM_MAX_TRIAL_DAYS` would be charged before it runs out, so switching is
 * not offered there; those users have years of premium at the old price anyway.
 */
export function canSwitchToSubscription(
  user: Pick<User, 'premiumExpiration' | 'premiumSubscription'> | null,
): boolean {
  return (
    isPremiumWithoutSubscription(user) &&
    user?.premiumExpiration != null &&
    user.premiumExpiration.getTime() - Date.now() <=
      PREMIUM_MAX_TRIAL_DAYS * 86_400_000
  );
}
