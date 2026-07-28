import type { JSX, ReactNode } from 'react';

export type PremiumMessages = {
  title: string;
  /** `dtmCountries` is the localized country list of the elevation bullet. */
  commonHeader: (price: number, dtmCountries: string) => ReactNode;
  stepsForAnonymous: ReactNode;
  success: string;
  becomePremium: string;
  youArePremium: (date: string) => JSX.Element;
  premiumOnly: string;
  noPremium: string;
  clickToActivate: string;
  higherPrecisionElevation: string;
  alreadyPremium: string;
  alreadySubscribed: string;
  premiumUser: string;
  payOnce: string;
  paySubscription: string;
  /**
   * Short call to action for the price-increase info bar; the modal's buy
   * button uses the fuller `paySubscription`.
   */
  subscribe: string;
  payWithChrons: string;
  chronsHint: ReactNode;
  priceIncrease: (params: {
    date: string;
    oldPrice: number;
    newPrice: number;
  }) => string;
  /** Shorter variant of `priceIncrease` for the info bar. */
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
  /** The modal offering that user the switch, while the current price lasts. */
  switchTitle: string;
  switchStatus: (params: { expiration: string }) => string;
  switchOffer: (params: {
    date: string;
    oldPrice: number;
    newPrice: number;
  }) => string;
  switchNoDoubleCharge: (params: { expiration: string }) => string;
  switchAction: string;
  /** Headline for the info bar on a phone, paired with `priceIncreaseMore`. */
  priceIncreaseMini: (params: { date: string; newPrice: number }) => string;
  /** Label of the link to the premium document. */
  priceIncreaseMore: string;
};
