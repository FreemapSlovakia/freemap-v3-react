import type { JSX, ReactNode } from 'react';

export type PremiumMessages = {
  title: string;
  commonHeader: ReactNode;
  stepsForAnonymous: ReactNode;
  continue: string;
  success: string;
  becomePremium: string;
  youArePremium: (date: string) => JSX.Element;
  premiumOnly: string;
  alreadyPremium: string;
  premiumUser: string;
};
