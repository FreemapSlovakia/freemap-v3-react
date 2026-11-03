import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PurchasesMessages } from './PurchasesMessages.js';

const pl: DeepPartialWithRequiredObjects<PurchasesMessages> = {
  purchases: 'Zakupy',
  premiumExpired: (at) => <>Dostęp premium wygasł {at}</>,
  date: 'Data',
  item: 'Pozycja',
  notPremiumYet: 'Brak dostępu premium.',
  awaitingBankPayment:
    'Czekamy na potwierdzenie przelewu bankowego. Premium aktywuje się po otrzymaniu płatności.',
  bankPaymentFailed:
    'Niektóre przelewy bankowe zostały odrzucone lub wygasły. Jeśli to pomyłka, prosimy o kontakt z pomocą.',
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
  managePayments: 'Zarządzaj płatnościami',
  managePaymentsHint:
    'Otwiera portal klienta Polar, naszego dostawcy płatności, gdzie można anulować subskrypcję, zmienić metodę płatności i pobrać faktury. Dotyczy tylko tego, co zostało opłacone przez Polar, a nie przez Rovas.',
};

export default pl;
