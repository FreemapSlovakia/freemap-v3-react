import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { SupportUsMessages } from './SupportUsMessages.js';

const it: DeepPartialWithRequiredObjects<SupportUsMessages> = {
  explanation:
    'Il portale di mappe Freemap è creato da volontari che lavorano gratuitamente nel loro tempo libero. Tuttavia per il suo funzionamento ha bisogno di hardware e di servizi di società commerciali che hanno un costo.',
  account: 'Conto bancario',
  paypal: 'Fai una donazione con PayPal',
  thanks: 'Apprezzeremo ogni donazione. Grazie!',
  registration: 'Registrato nel MV/VVS/1-900/90-34343 il 2 Ottobre 2009',
  alert: {
    line1:
      '<b>Attenzione!</b> Usa questo pulsante per ottenere l’accesso premium:',
    line2:
      'Il pagamento tramite bonifico bancario o PayPal è un ringraziamento per i servizi di base, senza ottenere l’accesso premium.',
  },
  team: 'Squadra',
};

export default it;
