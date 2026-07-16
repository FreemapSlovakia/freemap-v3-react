import { RovasAd } from '@features/ad/components/RovasAd.js';
import { ZdilaAd } from '@features/ad/components/ZdilaAd.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { AdMessages } from './AdMessages.js';

const de: DeepPartialWithRequiredObjects<AdMessages> = {
  self: (email) => (
    <>
      Möchten Sie hier Ihre eigene Werbung platzieren? Kontaktieren Sie uns
      gerne unter {email}.
    </>
  ),
  rovas: () => (
    <RovasAd rovasDesc="eine Wirtschaft, die Arbeit belohnt">
      <b>Lass dich für deine Arbeit belohnen.</b> Erfasse eine beliebige
      freiwillige Tätigkeit deiner Wahl, lass sie von der Community bestätigen
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
