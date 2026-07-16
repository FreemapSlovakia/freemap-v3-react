import { RovasAd } from '@features/ad/components/RovasAd.js';
import { ZdilaAd } from '@features/ad/components/ZdilaAd.js';
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
  zdilaAuthorship: () => (
    <ZdilaAd
      kick="A FREEMAP.EU MÖGÖTT"
      head="Ezt a térképet mi fejlesztjük."
      sub="Senior full-stack fejlesztés — webalkalmazások, térképek és adatok."
    />
  ),
  zdilaMapNative: () => (
    <ZdilaAd
      head="Egyedi térképek és szoftver."
      sub="Webalkalmazások, full-stack és térképek — útvonaltervezés, csempék, PostGIS, OSM."
      meta="a freemap.eu mögött"
    />
  ),
};

export default hu;
