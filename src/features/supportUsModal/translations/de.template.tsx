import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { SupportUsMessages } from './SupportUsMessages.js';

const de: DeepPartialWithRequiredObjects<SupportUsMessages> = {
  explanation:
    'Das Kartenportal Freemap wird von Freiwilligen in ihrer Freizeit unentgeltlich erstellt. Für den Betrieb sind jedoch Hardware und kommerzielle Dienstleistungen erforderlich.',
  account: 'Bankverbindung',
  paypal: 'Mit PayPal beitragen',
  thanks: 'Für jeden Beitrag sind wir sehr dankbar.',
  registration: 'Registriert bei MV/VVS/1-900/90-34343 am 2.10.2009',
  alert: {
    line1:
      '<b>Achtung!</b> Um Premium-Zugang zu erhalten, verwenden Sie bitte diese Schaltfläche:',
    line2:
      'Eine Zahlung auf das Bankkonto oder über PayPal dient als Dank für die Basisdienste, ohne Premium-Zugang zu erhalten.',
  },
  team: 'Team',
};

export default de;
