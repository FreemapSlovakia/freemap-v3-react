import { RovasAd } from '@features/ad/components/RovasAd.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { AdMessages } from './AdMessages.js';

const hu: DeepPartialWithRequiredObjects<AdMessages> = {
  self: (email) => (
    <>
      Szeretnéd, ha a saját hirdetésed lenne itt? Ne habozz kapcsolatba lépni
      velünk a következő címen: {email}.
    </>
  ),
  rovas: () => (
    <RovasAd rovasDesc="gazdaság, amely jutalmazza a munkát">
      <b>Kapj jutalmat az elvégzett munkádért.</b> Rögzíts bármilyen önkéntes
      tevékenységet, amit választasz, ellenőriztesd a közösséggel, és keress
      chronokat.
    </RovasAd>
  ),
};

export default hu;
