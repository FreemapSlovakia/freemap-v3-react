import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PurchasesMessages } from './PurchasesMessages.js';

const cs: DeepPartialWithRequiredObjects<PurchasesMessages> = {
  purchases: 'Nákupy',
  premiumExpired: (at) => <>Váš prémiový přístup vypršel {at}</>,
  date: 'Datum',
  item: 'Položka',
  notPremiumYet: 'Ještě nemáte prémiový přístup.',
  awaitingBankPayment:
    'Čekáme na potvrzení bankovního převodu. Prémiový přístup bude aktivovaný po přijetí platby.',
  bankPaymentFailed:
    'Některé bankovní převody byly zamítnuty nebo vypršely. Pokud si myslíte, že jde o omyl, kontaktujte prosím podporu.',
  bankIntentStatus: {
    pending_settlement: 'Bankovní převod je vytvořen a čeká na vypořádání.',
    manual_review:
      'Bankovní převod vyžaduje ruční kontrolu (např. nesoulad částky).',
    paid: 'Bankovní převod byl potvrzen jako zaplacený.',
    expired: 'Bankovní převod vypršel před potvrzením.',
    failed: 'Bankovní převod selhal.',
    rejected: 'Bankovní převod byl zamítnut.',
    created: 'Platební záměr byl vytvořen a ještě není vypořádán.',
    unknown: 'Poskytovatel nahlásil stav bankovního převodu: {}.',
  },
  noPurchases: 'Žádné nákupy',
  premium: 'Premium',
  credits: (amount) => <>Kredity ({amount})</>,
};

export default cs;
