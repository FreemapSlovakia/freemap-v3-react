import type { JSX, ReactNode } from 'react';

export type PremiumMessages = {
  title: string;
  commonHeader: (price: number) => ReactNode;
  stepsForAnonymous: ReactNode;
  success: string;
  becomePremium: string;
  youArePremium: (date: string) => JSX.Element;
  premiumOnly: string;
  noPremium: string;
  clickToActivate: string;
  higherPrecisionElevation: string;
  alreadyPremium: string;
  premiumUser: string;
  payOnce: string;
  paySubscription: string;
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
  /** Headline for the info bar on a phone, paired with `priceIncreaseMore`. */
  priceIncreaseMini: (params: { date: string; newPrice: number }) => string;
  /** Label of the link to the premium document. */
  priceIncreaseMore: string;
  winbackOffer: (params: { price: number; expiredAt: string }) => string;
  winbackAccept: (params: { price: number }) => string;
};
