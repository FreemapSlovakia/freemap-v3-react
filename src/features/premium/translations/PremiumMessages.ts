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
  /** Why the finer quality tiers of a render are premium's. */
  higherDetail: string;
  alreadyPremium: string;
  alreadySubscribed: string;
  premiumUser: string;
  payOnce: string;
  paySubscription: string;
  payWithChrons: string;
  chronsHint: ReactNode;
  /** Answers the two fears about subscribing: the price and the lock-in. */
  subscriptionReassurance: (params: { price: number }) => string;
};
