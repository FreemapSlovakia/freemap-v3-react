import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PurchasesMessages } from './PurchasesMessages.js';

const fr: DeepPartialWithRequiredObjects<PurchasesMessages> = {
  premiumExpired: (at) => <>Votre accès premium a expiré le {at}</>,
  bankIntentStatus: {
    pending_settlement:
      'Le virement bancaire a été effectué et est en attente de règlement.',
    manual_review:
      'Le virement bancaire nécessite une vérification manuelle (par exemple un montant incohérent).',
    paid: 'Le virement bancaire a été confirmé comme payé.',
    expired: 'Le virement bancaire a expiré avant la confirmation.',
    failed: 'Le virement bancaire a échoué.',
    rejected: 'Le virement bancaire a été rejeté.',
    created:
      'L’intention de virement bancaire a été créée et n’est pas encore réglée.',
    unknown: 'État du virement bancaire signalé par le fournisseur : {}.',
  },
  credits: (amount) => <>Crédits ({amount})</>,
  purchases: 'Achats',
  date: 'Date',
  item: 'Article',
  notPremiumYet: 'Vous n’avez pas encore l’accès premium.',
  awaitingBankPayment:
    'Nous attendons la confirmation du virement bancaire. Le premium sera activé dès réception du paiement.',
  bankPaymentFailed:
    'Certains virements bancaires ont été rejetés ou ont expiré. Si vous pensez qu’il s’agit d’une erreur, veuillez contacter le support.',
  noPurchases: 'Aucun achat',
  premium: 'Premium',
};

export default fr;
