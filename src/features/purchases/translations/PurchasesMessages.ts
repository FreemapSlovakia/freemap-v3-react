import type { JSX, ReactNode } from 'react';

export type PurchasesMessages = {
  purchases: string;
  premiumExpired: (at: ReactNode) => JSX.Element;
  date: string;
  item: string;
  notPremiumYet: string;
  awaitingBankPayment: string;
  bankPaymentFailed: string;
  bankIntentStatus: {
    pending_settlement: string;
    manual_review: string;
    paid: string;
    expired: string;
    failed: string;
    rejected: string;
    created: string;
    unknown: string;
  };
  noPurchases: string;
  premium: string;
  credits: (amount: ReactNode) => JSX.Element;
};
