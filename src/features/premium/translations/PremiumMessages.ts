import type { JSX, ReactNode } from 'react';

export type PremiumMessages = {
  title: string;
  commonHeader: ReactNode;
  stepsForAnonymous: ReactNode;
  success: string;
  becomePremium: string;
  youArePremium: (date: string) => JSX.Element;
  premiumOnly: string;
  alreadyPremium: string;
  premiumUser: string;
  payOnce: string;
  paySubscription: string;
  payWithChrons: string;
  chronsHint: ReactNode;
};
