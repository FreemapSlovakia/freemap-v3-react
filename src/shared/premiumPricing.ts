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
 * What the win-back offer is sold for. Pinned to the unlisted 8 € product in
 * Polar (`POLAR_PREMIUM_WINBACK_PRODUCT_ID`), so it does *not* follow
 * `PREMIUM_PRICE_EUR` when that goes up.
 */
export const PREMIUM_WINBACK_PRICE_EUR = 8;

/**
 * Only used to render the date in the announcement — midday, so that every
 * timezone formats it as 1 September.
 */
export const PREMIUM_PRICE_INCREASE_AT = Date.parse(
  '2026-09-01T12:00:00+02:00',
);
