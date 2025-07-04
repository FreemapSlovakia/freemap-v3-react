import { DeepPartialWithRequiredObjects } from '../../../deepPartial.js';
import { SupportUsMessages } from './SupportUsMessages.js';

const pl: DeepPartialWithRequiredObjects<SupportUsMessages> = {
  alert: {
    line1: '<b>Uwaga!</b> Użyj tego przycisku, aby uzyskać dostęp premium:',
    line2:
      'Płatność przelewem bankowym lub przez PayPal to forma podziękowania za podstawowe usługi – nie zapewnia dostępu premium.',
  },
  explanation:
    'Portal mapowy Freemap jest tworzony przez wolontariuszy za darmo w ich wolnym czasie. Do działania potrzebny jest jednak sprzęt i usługi firm komercyjnych, co generuje koszty.',
  account: 'Konto bankowe',
  paypal: 'Wesprzyj przez PayPal',
  thanks: 'Będziemy wdzięczni za każdą darowiznę. Dziękujemy!',
  registration:
    'Zarejestrowano w MV/VVS/1-900/90-34343 dnia 2 października 2009',
  team: 'Zespół',
};

export default pl;
