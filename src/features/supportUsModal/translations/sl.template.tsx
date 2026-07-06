import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { SupportUsMessages } from './SupportUsMessages.js';

const sl: DeepPartialWithRequiredObjects<SupportUsMessages> = {
  explanation:
    'Zemljevidni portal Freemap ustvarjajo prostovoljci brezplačno v svojem prostem času. Za delovanje in obratovanje pa sta potrebna strojna oprema in storitve komercialnih podjetij, kar nas stane denar.',
  account: 'Bančni račun',
  paypal: 'Prispevajte prek PayPala',
  thanks: 'Za vsak prispevek vam bomo zelo hvaležni. Hvala!',
  registration: 'Registrirano pod MV/VVS/1-900/90-34343 dne 2. 10. 2009',
  alert: {
    line1: '<b>Pozor!</b> Za pridobitev premijskega dostopa uporabite ta gumb:',
    line2:
      'Plačilo z bančnim nakazilom ali prek PayPala je način, kako se zahvaliti za osnovne storitve, brez pridobitve premijskega dostopa.',
  },
  team: 'Ekipa',
};

export default sl;
