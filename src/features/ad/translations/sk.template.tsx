import { RovasAd } from '@features/ad/components/RovasAd.js';
import { ZdilaAd } from '@features/ad/components/ZdilaAd.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { AdMessages } from './AdMessages.js';

const sk: DeepPartialWithRequiredObjects<AdMessages> = {
  self: (email) => (
    <>
      Máš záujem o vlastnú reklamu na tomto mieste? Neváhaj nás kontaktovať na{' '}
      {email}.
    </>
  ),
  rovas: () => (
    <RovasAd name="Rováš" rovasDesc="ekonomika, ktorá odmeňuje prácu">
      <b>Nechaj sa odmeniť za prácu, ktorú robíš.</b> Zaznamenaj ľubovoľnú
      dobrovoľnícku činnosť podľa vlastného výberu, nechaj ju overiť komunitou a
      zarábaj chrony.
    </RovasAd>
  ),
  zdilaAuthorship: () => (
    <ZdilaAd
      kick="STOJÍME ZA FREEMAP.SK"
      head="Túto mapu vyvíjame my."
      sub="Senior full-stack vývoj — webové aplikácie, mapy a dáta."
    />
  ),
  zdilaMapNative: () => (
    <ZdilaAd
      head="Mapy a softvér na zákazku."
      sub="Webové aplikácie, full-stack a mapy — routing, dlaždice, PostGIS, OSM."
      meta="stojíme za freemap.sk"
    />
  ),
};

export default sk;
