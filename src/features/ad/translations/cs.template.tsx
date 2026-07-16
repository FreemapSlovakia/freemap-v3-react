import { RovasAd } from '@features/ad/components/RovasAd.js';
import { ZdilaAd } from '@features/ad/components/ZdilaAd.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { AdMessages } from './AdMessages.js';

const cs: DeepPartialWithRequiredObjects<AdMessages> = {
  self: (email) => (
    <>
      Máte zájem o vlastní reklamu na tomto místě? Neváhejte nás kontaktovat na{' '}
      {email}.
    </>
  ),
  rovas: () => (
    <RovasAd name="Rováš" rovasDesc="ekonomika, která odměňuje práci">
      <b>Nech se odměnit za práci, kterou děláš.</b> Zaznamenej libovolnou
      dobrovolnickou činnost dle vlastního výběru, nech ji ověřit komunitou a
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
