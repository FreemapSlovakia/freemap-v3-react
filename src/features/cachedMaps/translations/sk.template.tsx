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
  premiumZoomHint:
    'Najpodrobnejšie priblíženia tejto vrstvy sú prémiové. Offline mapa si dlaždice ponecháva natrvalo a zobrazuje ich aj bez pripojenia, takže na ich stiahnutie je potrebný prémiový prístup.',
  premiumWiden:
    'Táto mapa siaha do prémiových priblížení. Bez prémiového prístupu ju možno zmenšiť, nie však zväčšiť — zväčšením by sa nanovo stiahli prémiové dlaždice.',
  premiumSkipped:
    'Najpodrobnejšie priblíženia tejto mapy sú prémiové a nestiahli sa, takže mapa zostáva označená ako nekompletná.',
};

export default sk;
