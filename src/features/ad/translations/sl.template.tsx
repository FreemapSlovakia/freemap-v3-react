import { RovasAd } from '@features/ad/components/RovasAd.js';
import { ZdilaAd } from '@features/ad/components/ZdilaAd.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { AdMessages } from './AdMessages.js';

const sl: DeepPartialWithRequiredObjects<AdMessages> = {
  self: (email) => (
    <>
      Vas zanima lastno oglaševanje na tem mestu? Brez oklevanja nas
      kontaktirajte na {email}.
    </>
  ),
  rovas: () => (
    <RovasAd name="Rováš" rovasDesc="gospodarstvo, ki nagrajuje delo">
      <b>Pustite se nagraditi za delo, ki ga opravljate.</b> Zabeležite poljubno
      prostovoljno dejavnost po lastni izbiri, jo dajte v preverjanje skupnosti
      in služite chrone.
    </RovasAd>
  ),
  zdilaAuthorship: () => (
    <ZdilaAd
      kick="STOJIMO ZA FREEMAP.EU"
      head="To karto razvijamo mi."
      sub="Senior full-stack razvoj — spletne aplikacije, zemljevidi in podatki."
    />
  ),
  zdilaMapNative: () => (
    <ZdilaAd
      head="Zemljevidi in programska oprema po meri."
      sub="Spletne aplikacije, full-stack in zemljevidi — usmerjanje, ploščice, PostGIS, OSM."
      meta="stojimo za freemap.eu"
    />
  ),
};

export default sl;
