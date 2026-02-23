import { DeepPartialWithRequiredObjects } from '../../../deepPartial.js';
import { SupportUsMessages } from './SupportUsMessages.js';

const hu: DeepPartialWithRequiredObjects<SupportUsMessages> = {
  explanation:
    'A Freemap térképportált önkéntesek szerkesztik szabad idejükben. A működéshez azonban szükség van hardverre és kereskedelmi vállalatok szolgáltatásaira, ami bizony pénzbe kerül.',
  account: 'Bankszámlaszám',
  paypal: 'Adományozás PayPallal',
  thanks: 'Minden adományért hálásak vagyunk. Köszönjük!',
  registration: 'Bejegyzés: 2009. október 2. (MV/VVS/1-900/90-34343)',
  alert: {
    line1: '<b>Figyelem!</b> A premium hozzáféréshez használd ezt a gombot:',
    line2:
      'A banki átutalás vagy PayPal fizetés a köszönetnyilvánításra szolgál az alapvető szolgáltatásokért, de nem biztosít premium hozzáférést.',
  },
  team: 'Csapat',
};

export default hu;
