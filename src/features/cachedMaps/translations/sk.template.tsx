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
  offlineWiden:
    'Bez pripojenia možno túto mapu zmenšiť, nie však zväčšiť — zväčšením by bolo treba stiahnuť dlaždice, ktoré nemá.',
  premiumSkipped:
    'Najpodrobnejšie priblíženia tejto mapy sú prémiové a nestiahli sa, takže mapa zostáva označená ako nekompletná.',
  networkFallback: 'Chýbajúce dlaždice sťahovať z internetu',
  networkFallbackHint:
    'Zapnuté: pri posune mimo stiahnutej oblasti alebo pri väčšom priblížení sa zobrazia živé dlaždice, pokiaľ je pripojenie na internet. Vypnuté: mapa ukáže len to, čo bolo stiahnuté.',
  deleteTitle: 'Zmazať offline mapu',
  deleteConfirm: ({ name }) => (
    <>
      Naozaj zmazať offline mapu <b>{name}</b> aj so všetkými jej dlaždicami?
    </>
  ),
  browse: {
    intro:
      'Dlaždice, na ktoré na mape natrafíte, sa dajú uchovať na neskôr, aby sa už navštívené oblasti načítali aj bez internetu. Týka sa to všetkých dlaždicových vrstiev a je to nezávislé od stiahnutých offline máp.',
    mode: 'Zdroj dlaždíc',
    modes: {
      networkOnly: 'Iba internet',
      networkFirst: 'Internet, potom vyrovnávacia pamäť',
      cacheFirst: 'Vyrovnávacia pamäť, potom internet',
      cacheOnly: 'Iba vyrovnávacia pamäť',
    },
    store: 'Ukladať dlaždice stiahnuté z internetu',
    maxAge: 'Uchovávať dlaždice',
    maxSize: 'Limit veľkosti',
    days: ({ days }) => <>{days} dní</>,
    keepForever: 'Kým je miesto',
    noSizeLimit: 'Bez limitu',
    retentionHint:
      'Dlaždice po uplynutí doby sa zahodia a po prekročení limitu veľkosti odídu najdlhšie nezobrazené.',
    cached: ({ tiles, size }) => (
      <>
        Uložené: <strong>{tiles}</strong> dlaždíc ({size})
      </>
    ),
    clear: 'Vymazať pamäť',
    clearConfirm:
      'Naozaj zahodiť všetky dlaždice uložené pri prehliadaní? Nastavenia zostanú.',
  },
};

export default sk;
