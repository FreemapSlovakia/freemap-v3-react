import type { JSX, ReactNode } from 'react';

export type CreditsMessages = {
  buyCredits: string;
  amount: string;
  credits: string;
  buy: string;
  payWithChrons: string;
  chronsHint: string;
  purchase: {
    success: ({ amount }: { amount: number }) => JSX.Element;
  };
  youHaveCredits: (amount: ReactNode, explainCredits: boolean) => JSX.Element;
};
