import { RovasAd } from '@features/ad/components/RovasAd.js';
import { ZdilaAd } from '@features/ad/components/ZdilaAd.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { AdMessages } from './AdMessages.js';

const it: DeepPartialWithRequiredObjects<AdMessages> = {
  self: {
    head: 'Qui può esserci la tua pubblicità',
    sub: "Raggiungi chi sta programmando il proprio tempo all'aria aperta — direttamente nella mappa.",
    cta: 'Scopri la nostra offerta',
  },
  rovas: () => (
    <RovasAd rovasDesc="un’economia che premia il lavoro">
      Registra la tua attività di volontariato, falla verificare dalla community
      e guadagna chron.
    </RovasAd>
  ),
  zdilaAuthorship: () => (
    <ZdilaAd
      kick="DIETRO FREEMAP.EU"
      head="Questa mappa la sviluppiamo noi."
      sub="Sviluppo full-stack senior — app web, mappe e dati."
    />
  ),
  zdilaMapNative: () => (
    <ZdilaAd
      head="Mappe e software su misura."
      sub="App web, full-stack e mappe — routing, tile, PostGIS, OSM."
      meta="dietro freemap.eu"
    />
  ),
};

export default it;
