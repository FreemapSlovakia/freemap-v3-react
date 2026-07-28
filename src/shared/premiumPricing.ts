// Freemap Premium costs 8 €/year; on 1 September 2026 the price rises to
// 15 €/year for new customers. An auto-renewing subscription started before
// then keeps its price for as long as it stays active (the payment provider
// grandfathers it), while a one-time purchase locks the price for the bought
// year only.
//
// Nothing here switches by itself. On that day set `PREMIUM_PRICE_EUR` to 15,
// drop the announcement, and repoint the product IDs in the backend env — see
// TODO.md; all three have to happen together.

/** What premium is sold for right now. */
export const PREMIUM_PRICE_EUR = 8;

/**
 * A subscription starts as a trial covering the premium the user already has,
 * so that switching early costs nothing — but Polar validates the trial length
 * as at most 1000 days, which the backend clamps to (`MAX_TRIAL_DAYS` in
 * `polarCheckoutHandler`). Premium reaching beyond that can't be moved without
 * paying twice, so the switch isn't offered. Keep the two in sync.
 */
export const PREMIUM_MAX_TRIAL_DAYS = 1000;

/**
 * Only used to render the date in the announcement — midday, so that every
 * timezone formats it as 1 September.
 */
export const PREMIUM_PRICE_INCREASE_AT = Date.parse(
  '2026-09-01T12:00:00+02:00',
);
