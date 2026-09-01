import type { User } from '@features/auth/model/types.js';

export function isPremium(
  user: Pick<User, 'premiumExpiration'> | null,
): boolean {
  return user?.premiumExpiration != null && user.premiumExpiration > new Date();
}

/** Any live Polar subscription, whether or not it's set to auto-renew. */
export function hasSubscription(
  user: Pick<User, 'premiumSubscriptionStatus'> | null,
): boolean {
  return user != null && user.premiumSubscriptionStatus !== 'none';
}

/** Live subscription still set to auto-renew (nothing will end it by itself). */
export function subscriptionAutoRenews(
  user: Pick<User, 'premiumSubscriptionStatus'> | null,
): boolean {
  return user?.premiumSubscriptionStatus === 'active';
}
