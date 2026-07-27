import type { User } from '@features/auth/model/types.js';

export function isPremium(
  user: Pick<User, 'premiumExpiration'> | null,
): boolean {
  return user?.premiumExpiration != null && user.premiumExpiration > new Date();
}

/**
 * Premium held as a one-time year rather than as a subscription. Such a user is
 * the one to tell about the price increase: subscribing before it locks the
 * current price, and the subscription only starts charging once the year they
 * already paid for runs out.
 */
export function isPremiumWithoutSubscription(
  user: Pick<User, 'premiumExpiration' | 'premiumSubscription'> | null,
): boolean {
  return isPremium(user) && !user?.premiumSubscription;
}
