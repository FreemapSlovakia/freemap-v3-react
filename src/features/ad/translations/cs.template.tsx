import { RovasAd } from '@features/ad/components/RovasAd.js';
import { ZdilaAd } from '@features/ad/components/ZdilaAd.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { AdMessages } from './AdMessages.js';

const cs: DeepPartialWithRequiredObjects<AdMessages> = {
  self: {
    head: 'Zde může být vaše reklama',
    sub: 'Oslovte lidi, kteří si plánují čas v přírodě — přímo v mapě.',
    cta: 'Podívejte se na naši nabídku',
  },
  rovas: () => (
    <RovasAd name="Rováš" rovasDesc="ekonomika, která odměňuje práci">
      Zaznamenej svou dobrovolnickou činnost, nech ji ověřit komunitou a
      vydělávej chrony.
    </RovasAd>
  ),
  zdilaAuthorship: () => (
    <ZdilaAd
      kick="STOJÍME ZA FREEMAP.SK"
      head="Tuto mapu vyvíjíme my."
      sub="Senior full-stack vývoj — webové aplikace, mapy a data."
    />
  ),
  zdilaMapNative: () => (
    <ZdilaAd
      head="Mapy a software na zakázku."
      sub="Webové aplikace, full-stack a mapy — routing, dlaždice, PostGIS, OSM."
      meta="stojíme za freemap.sk"
    />
  ),
};

export default cs;
