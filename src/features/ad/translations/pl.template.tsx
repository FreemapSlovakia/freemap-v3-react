import { RovasAd } from '@features/ad/components/RovasAd.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { AdMessages } from './AdMessages.js';

const pl: DeepPartialWithRequiredObjects<AdMessages> = {
  self: (email) => (
    <>
      Chcesz umieścić swoją reklamę w tym miejscu? Skontaktuj się z nami pod
      adresem {email}.
    </>
  ),
  rovas: () => (
    <RovasAd rovasDesc="gospodarka, która nagradza pracę">
      <b>Otrzymuj nagrodę za swoją pracę.</b> Rejestruj dowolnie wybraną
      aktywność wolontariacką, zweryfikuj ją w społeczności i zarabiaj chrony.
    </RovasAd>
  ),
};

export default pl;
