import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PurchasesMessages } from './PurchasesMessages.js';

const de: DeepPartialWithRequiredObjects<PurchasesMessages> = {
  purchases: 'Einkäufe',
  premiumExpired: (at) => <>Ihr Premium-Zugang ist am {at} abgelaufen</>,
  date: 'Datum',
  item: 'Artikel',
  notPremiumYet: 'Sie haben noch keinen Premium-Zugang.',
  awaitingBankPayment:
    'Wir warten auf die Bestätigung der Banküberweisung. Premium wird nach Zahlungseingang aktiviert.',
  bankPaymentFailed:
    'Einige Banküberweisungen wurden abgelehnt oder sind abgelaufen. Wenn Sie glauben, dass dies ein Fehler ist, kontaktieren Sie bitte den Support.',
  bankIntentStatus: {
    pending_settlement:
      'Die Banküberweisung wurde angelegt und wartet auf Abwicklung.',
    manual_review:
      'Die Banküberweisung erfordert eine manuelle Prüfung (z. B. Betragsabweichung).',
    paid: 'Die Banküberweisung wurde als bezahlt bestätigt.',
    expired: 'Die Banküberweisung ist vor der Bestätigung abgelaufen.',
    failed: 'Die Banküberweisung ist fehlgeschlagen.',
    rejected: 'Die Banküberweisung wurde abgelehnt.',
    created:
      'Die Zahlungsabsicht wurde erstellt und ist noch nicht abgewickelt.',
    unknown: 'Vom Anbieter gemeldeter Banküberweisungsstatus: {}.',
  },
  noPurchases: 'Keine Einkäufe',
  premium: 'Premium',
  credits: (amount) => <>Credits ({amount})</>,
};

export default de;
