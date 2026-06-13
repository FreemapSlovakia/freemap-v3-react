import { PurchasesMessages } from './PurchasesMessages.js';

const en: PurchasesMessages = {
  purchases: 'Purchases',
  premiumExpired: (at) => <>Your premium access expired at {at}</>,
  date: 'Date',
  item: 'Item',
  notPremiumYet: 'You are not premium yet.',
  awaitingBankPayment:
    'We are awaiting confirmation of the bank transfer. Premium will activate once the payment is received.',
  bankPaymentFailed:
    'Some bank transfers were rejected or expired. If you believe this is a mistake, please contact support.',
  bankIntentStatus: {
    pending_settlement: 'Bank transfer was placed and is awaiting settlement.',
    manual_review:
      'Bank transfer requires manual review (for example amount mismatch).',
    paid: 'Bank transfer has been confirmed as paid.',
    expired: 'Bank transfer expired before confirmation.',
    failed: 'Bank transfer failed.',
    rejected: 'Bank transfer was rejected.',
    created: 'Bank transfer intent was created and is not yet settled.',
    unknown: 'Bank transfer status reported by provider: {}.',
  },
  noPurchases: 'No purchases',
  premium: 'Premium',
  credits: (amount) => <>Credits (${amount})</>,
};

export default en;
