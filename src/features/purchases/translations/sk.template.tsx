import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PurchasesMessages } from './PurchasesMessages.js';

const sk: DeepPartialWithRequiredObjects<PurchasesMessages> = {
  purchases: 'Nákupy',
  premiumExpired: (at) => <>Váš prémiový prístup vypršal {at}</>,
  date: 'Dátum',
  item: 'Položka',
  notPremiumYet: 'Ešte nemáte prémiový prístup.',
  awaitingBankPayment:
    'Čakáme na potvrdenie bankového prevodu. Prémiový prístup bude aktivovaný po prijatí platby.',
  bankPaymentFailed:
    'Niektoré bankové prevody boli zamietnuté alebo vypršali. Ak si myslíte, že ide o omyl, kontaktujte podporu.',
  bankIntentStatus: {
    pending_settlement: 'Bankový prevod je vytvorený a čaká na vysporiadanie.',
    manual_review:
      'Bankový prevod vyžaduje manuálne overenie (napr. nesúlad sumy).',
    paid: 'Bankový prevod bol potvrdený ako zaplatený.',
    expired: 'Bankový prevod vypršal pred potvrdením.',
    failed: 'Bankový prevod zlyhal.',
    rejected: 'Bankový prevod bol zamietnutý.',
    created: 'Platobný zámer bol vytvorený a ešte nie je vysporiadaný.',
    unknown: 'Poskytovateľ nahlásil stav bankového prevodu: {}.',
  },
  noPurchases: 'Žiadne nákupy',
  premium: 'Prémium',
  credits: (amount) => <>Kredity ({amount})</>,
};

export default sk;
