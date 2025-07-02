import { DeepPartialWithRequiredObjects } from '../../../deepPartial.js';
import { SupportUsMessages } from './SupportUsMessages.js';

const cs: DeepPartialWithRequiredObjects<SupportUsMessages> = {
  explanation:
    'Mapový portál Freemap tvoří lidé bezplatně ve svém volném čase. Na fungování a provoz je však potřebný hardware a služby komerčních společností. ',
  account: 'Bankovní spojení',
  paypal: 'Přispět přes PayPal',
  thanks: 'Za každý příspěvek vám budeme velmi vděční.',
  registration: 'Registrované na MV / VVS / 1-900 / 90-34343 dne 2.10.2009',
  alert: {
    line1:
      '<b>Pozor!</b> Pro získání prémiového přístupu použijte toto tlačítko:',
    line2:
      'Platba na bankovní účet nebo přes PayPal slouží jako poděkování za základní služby, bez získání prémiového přístupu.',
  },
  team: 'Tým',
};

export default cs;
