import type { JSX, ReactNode } from 'react';

export type PremiumMessages = {
  title: string;
  /** `dtmCountries` is the localized country list of the elevation bullet. */
  commonHeader: (price: number, dtmCountries: string) => ReactNode;
  /**
   * What that list says instead of the country's own name where the model
   * covers only part of it, keyed by the code the coverage is reported under.
   * `Intl.DisplayNames` names countries alone, so these are translated by hand.
   */
  dtmAreaNames: { gb: string };
  stepsForAnonymous: ReactNode;
  success: string;
  becomePremium: string;
  youArePremium: (date: string) => JSX.Element;
  /** Live subscription that auto-renews, so there's no end date to show. */
  youArePremiumRenews: JSX.Element;
  premiumOnly: string;
  noPremium: string;
  clickToActivate: string;
  higherPrecisionElevation: string;
  alreadyPremium: string;
  alreadySubscribed: string;
  premiumUser: string;
  /** Plain label; during the price lock the buy menu uses `payOnceWithPrices`. */
  payOnce: string;
  /** `payOnce` while the old price still lasts — the option carries its own cost. */
  payOnceWithPrices: (params: { oldPrice: number; newPrice: number }) => string;
  paySubscription: string;
  payWithChrons: string;
  chronsHint: ReactNode;
  /** Heads the price comparison; the comparison itself says what to do about it. */
  priceIncreaseHeading: (params: { date: string; newPrice: number }) => string;
  /** Column headings of the price comparison. */
  compareNow: string;
  compareNextYear: string;
  /** Row labels of the price comparison. */
  compareSubscription: string;
  compareOnce: string;
  /** The do-nothing row, for a user who already holds a one-time year. */
  compareNoSwitch: string;
  /** Answers the two fears about subscribing: the price and the lock-in. */
  subscriptionReassurance: (params: { oldPrice: number }) => string;
  /** Shown when the one-time option is picked while subscribing is the better deal. */
  payOnceConfirmTitle: string;
  payOnceConfirmBody: (params: {
    date: string;
    oldPrice: number;
    newPrice: number;
  }) => string;
  payOnceConfirmSubscribe: string;
  payOnceConfirmContinue: string;
  /** Announcement for the info bar. */
  priceIncreaseShort: (params: {
    date: string;
    oldPrice: number;
    newPrice: number;
  }) => string;
  /** For a user whose premium is a one-time year, not a subscription. */
  priceIncreaseSwitch: (params: {
    date: string;
    oldPrice: number;
    newPrice: number;
  }) => string;
  /**
   * The modal offering that user the switch, while the current price lasts;
   * also the info bar's link to it, so it names the outcome, not the action.
   */
  switchTitle: string;
  switchStatus: (params: { expiration: string }) => string;
  switchNoDoubleCharge: (params: { expiration: string }) => string;
  switchAction: string;
  /** Headline for the info bar on a phone, paired with `priceIncreaseMore`. */
  priceIncreaseMini: (params: { date: string; newPrice: number }) => string;
  /** Label of the link to the premium document. */
  priceIncreaseMore: string;
};
