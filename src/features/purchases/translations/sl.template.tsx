import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PurchasesMessages } from './PurchasesMessages.js';

const sl: DeepPartialWithRequiredObjects<PurchasesMessages> = {
  purchases: 'Nakupi',
  premiumExpired: (at) => <>Vaš dostop premium je potekel {at}</>,
  date: 'Datum',
  item: 'Postavka',
  notPremiumYet: 'Še nimate dostopa premium.',
  awaitingBankPayment:
    'Čakamo na potrditev bančnega nakazila. Dostop premium bo aktiviran po prejemu plačila.',
  bankPaymentFailed:
    'Nekatera bančna nakazila so bila zavrnjena ali so potekla. Če menite, da gre za pomoto, se obrnite na podporo.',
  bankIntentStatus: {
    pending_settlement: 'Bančno nakazilo je ustvarjeno in čaka na poravnavo.',
    manual_review:
      'Bančno nakazilo zahteva ročno preverjanje (npr. neujemanje zneska).',
    paid: 'Bančno nakazilo je bilo potrjeno kot plačano.',
    expired: 'Bančno nakazilo je poteklo pred potrditvijo.',
    failed: 'Bančno nakazilo ni uspelo.',
    rejected: 'Bančno nakazilo je bilo zavrnjeno.',
    created: 'Plačilni namen je bil ustvarjen in še ni poravnan.',
    unknown: 'Ponudnik je sporočil stanje bančnega nakazila: {}.',
  },
  noPurchases: 'Ni nakupov',
  premium: 'Premium',
  credits: (amount) => <>Krediti ({amount})</>,
};

export default sl;
