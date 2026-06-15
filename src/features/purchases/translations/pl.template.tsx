import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { PurchasesMessages } from './PurchasesMessages.js';

const pl: DeepPartialWithRequiredObjects<PurchasesMessages> = {
  purchases: 'Zakupy',
  premiumExpired: (at) => <>Twój dostęp premium wygasł {at}</>,
  date: 'Data',
  item: 'Pozycja',
  notPremiumYet: 'Nie masz jeszcze dostępu premium.',
  awaitingBankPayment:
    'Czekamy na potwierdzenie przelewu bankowego. Premium aktywuje się po otrzymaniu płatności.',
  bankPaymentFailed:
    'Niektóre przelewy bankowe zostały odrzucone lub wygasły. Jeśli uważasz, że to pomyłka, skontaktuj się z pomocą.',
  bankIntentStatus: {
    pending_settlement:
      'Przelew bankowy został utworzony i oczekuje na rozliczenie.',
    manual_review:
      'Przelew bankowy wymaga ręcznej weryfikacji (np. niezgodność kwoty).',
    paid: 'Przelew bankowy został potwierdzony jako opłacony.',
    expired: 'Przelew bankowy wygasł przed potwierdzeniem.',
    failed: 'Przelew bankowy nie powiódł się.',
    rejected: 'Przelew bankowy został odrzucony.',
    created:
      'Intencja płatności została utworzona i nie została jeszcze rozliczona.',
    unknown: 'Status przelewu zgłoszony przez dostawcę: {}.',
  },
  noPurchases: 'Brak zakupów',
  premium: 'Premium',
  credits: (amount) => <>Kredyty ({amount})</>,
};

export default pl;
