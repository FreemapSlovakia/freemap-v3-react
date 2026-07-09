import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { CachedMapsMessages } from './CachedMapsMessages.js';

const sl: DeepPartialWithRequiredObjects<CachedMapsMessages> = {
  cacheOfflineMap: 'Shrani zemljevid za uporabo brez povezave',
  addOfflineMap: 'Dodaj zemljevid brez povezave',
  emptyMessage:
    'Zaenkrat ni shranjenih zemljevidov brez povezave. Dodajte enega za uporabo zemljevidov brez internetne povezave.',
  zoom: 'Približava',
  tiles: 'Ploščice',
  size: 'Velikost',
  ready: 'Pripravljen',
  incomplete: ({ pct }) => <>Nepopoln ({pct} %)</>,
  pause: 'Zaustavi',
  resume: 'Nadaljuj',
  total: 'Skupaj',
  largeDownload: ({ tiles, size }) => (
    <>
      Veliko prenašanje: {tiles} ploščic (~{size}). To lahko traja nekaj časa.
    </>
  ),
  estSize: 'Ocenjena velikost',
  startCaching: 'Začni prenašanje',
  cachedSuccess: ({ name }) => `Zemljevid »${name}« je bil uspešno prenesen.`,
  activate: 'Aktiviraj',
  focus: 'Približaj na območje',
  namePrefix: 'Brez povezave',
};

export default sl;
