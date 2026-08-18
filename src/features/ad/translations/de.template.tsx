import { RovasAd } from '@features/ad/components/RovasAd.js';
import { ZdilaAd } from '@features/ad/components/ZdilaAd.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { AdMessages } from './AdMessages.js';

const de: DeepPartialWithRequiredObjects<AdMessages> = {
  self: {
    head: 'Hier könnte Ihre Werbung stehen',
    sub: 'Erreichen Sie Menschen, die ihre Zeit in der Natur planen — direkt in der Karte.',
    cta: 'Sehen Sie unser Angebot',
  },
  rovas: () => (
    <RovasAd rovasDesc="eine Wirtschaft, die Arbeit belohnt">
      Erfasse deine freiwillige Tätigkeit, lass sie von der Community bestätigen
      und verdiene Chrons.
    </RovasAd>
  ),
  zdilaAuthorship: () => (
    <ZdilaAd
      kick="WIR STEHEN HINTER FREEMAP.EU"
      head="Diese Karte entwickeln wir."
      sub="Senior-Full-Stack-Entwicklung — Web-Apps, Karten und Daten."
    />
  ),
  zdilaMapNative: () => (
    <ZdilaAd
      head="Karten & Software nach Maß."
      sub="Web-Apps, Full-Stack und Karten — Routing, Kacheln, PostGIS, OSM."
      meta="wir stehen hinter freemap.eu"
    />
  ),
};

export default de;
