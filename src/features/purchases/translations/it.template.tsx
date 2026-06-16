import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { PurchasesMessages } from './PurchasesMessages.js';

const it: DeepPartialWithRequiredObjects<PurchasesMessages> = {
  purchases: 'Acquisti',
  premiumExpired: (at) => <>Il tuo accesso premium è scaduto il {at}</>,
  date: 'Data',
  item: 'Elemento',
  notPremiumYet: 'Non hai ancora un accesso premium.',
  awaitingBankPayment:
    'Siamo in attesa della conferma del bonifico bancario. Il premium si attiverà dopo la ricezione del pagamento.',
  bankPaymentFailed:
    'Alcuni bonifici bancari sono stati rifiutati o sono scaduti. Se pensi che sia un errore, contatta il supporto.',
  bankIntentStatus: {
    pending_settlement:
      'Il bonifico bancario è stato creato ed è in attesa di regolamento.',
    manual_review:
      'Il bonifico bancario richiede una revisione manuale (ad es. importo non corrispondente).',
    paid: 'Il bonifico bancario è stato confermato come pagato.',
    expired: 'Il bonifico bancario è scaduto prima della conferma.',
    failed: 'Il bonifico bancario è fallito.',
    rejected: 'Il bonifico bancario è stato rifiutato.',
    created: "L'intento di pagamento è stato creato e non è ancora regolato.",
    unknown: 'Stato bonifico segnalato dal provider: {}.',
  },
  noPurchases: 'Nessun acquisto',
  premium: 'Premium',
  credits: (amount) => <>Crediti ({amount})</>,
};

export default it;
