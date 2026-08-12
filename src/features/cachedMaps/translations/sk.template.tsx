import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { CachedMapsMessages } from './CachedMapsMessages.js';

const sk: DeepPartialWithRequiredObjects<CachedMapsMessages> = {
  cacheOfflineMap: 'Uložiť mapu pre offline použitie',
  modifyOfflineMap: 'Upraviť offline mapu',
  toDownload: 'Na stiahnutie',
  addOfflineMap: 'Pridať offline mapu',
  emptyMessage:
    'Zatiaľ nie sú uložené žiadne offline mapy. Pridajte si jednu na používanie máp bez pripojenia k internetu.',
  zoom: 'Priblíženie',
  tiles: 'Dlaždice',
  size: 'Veľkosť',
  ready: 'Pripravená',
  incomplete: ({ pct }) => <>Nekompletná ({pct} %)</>,
  resume: 'Pokračovať',
  stop: 'Zastaviť',
  total: 'Spolu',
  largeDownload: ({ tiles, size }) => (
    <>
      Veľké sťahovanie: {tiles} dlaždíc (~{size}). Môže to chvíľu trvať.
    </>
  ),
  notEnoughSpace: ({ size, free }) => (
    <>
      Nedostatok miesta: sťahovanie potrebuje približne {size}, no v tomto
      prehliadači je dostupných len {free}. Zastavilo by sa v polovici.
    </>
  ),
  estSize: 'Odhadovaná veľkosť',
  startCaching: 'Spustiť sťahovanie',
  cachedSuccess: ({ name }) => `Mapa „${name}“ bola úspešne stiahnutá.`,
  activate: 'Aktivovať',
  focus: 'Priblížiť na oblasť',
  namePrefix: 'Offline',
};

export default sk;
