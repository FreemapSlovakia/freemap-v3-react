import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PurchasesMessages } from './PurchasesMessages.js';

const hu: DeepPartialWithRequiredObjects<PurchasesMessages> = {
  purchases: 'Vásárlások',
  premiumExpired: (at) => <>A prémium hozzáférésed lejárt ekkor: {at}</>,
  date: 'Dátum',
  item: 'Tétel',
  notPremiumYet: 'Még nincs prémium hozzáférésed.',
  awaitingBankPayment:
    'Várjuk a banki átutalás visszaigazolását. A prémium a fizetés beérkezése után aktiválódik.',
  bankPaymentFailed:
    'Néhány banki átutalás elutasításra került vagy lejárt. Ha úgy gondolod, hogy ez tévedés, vedd fel a kapcsolatot az ügyfélszolgálattal.',
  bankIntentStatus: {
    pending_settlement: 'A banki átutalás létrejött, és elszámolásra vár.',
    manual_review:
      'A banki átutalás kézi ellenőrzést igényel (pl. összegeltérés).',
    paid: 'A banki átutalás fizetettként megerősítve.',
    expired: 'A banki átutalás a megerősítés előtt lejárt.',
    failed: 'A banki átutalás sikertelen volt.',
    rejected: 'A banki átutalás elutasítva.',
    created: 'A fizetési szándék létrejött, de még nincs elszámolva.',
    unknown: 'A szolgáltató által jelentett banki státusz: {}.',
  },
  noPurchases: 'Nincsenek vásárlások',
  premium: 'Prémium',
  credits: (amount) => <>Kreditek ({amount})</>,
  managePayments: 'Fizetések kezelése',
  managePaymentsHint:
    'Megnyitja a Polar fizetési szolgáltatónk ügyfélportálját, ahol lemondhatod az előfizetést, módosíthatod a fizetési módot és letöltheted a számlákat. Csak arra vonatkozik, amit a Polaron keresztül fizettél, a Rovason keresztül nem.',
};

export default hu;
