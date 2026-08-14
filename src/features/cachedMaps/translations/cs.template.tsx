import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { CachedMapsMessages } from './CachedMapsMessages.js';

const cs: DeepPartialWithRequiredObjects<CachedMapsMessages> = {
  cacheOfflineMap: 'Uložit mapu pro offline použití',
  modifyOfflineMap: 'Upravit offline mapu',
  toDownload: 'Ke stažení',
  addOfflineMap: 'Přidat offline mapu',
  emptyMessage:
    'Zatím nejsou uloženy žádné offline mapy. Přidejte si jednu pro používání map bez připojení k internetu.',
  zoom: 'Přiblížení',
  tiles: 'Dlaždice',
  size: 'Velikost',
  ready: 'Připravena',
  incomplete: ({ pct }) => <>Nekompletní ({pct} %)</>,
  resume: 'Pokračovat',
  stop: 'Zastavit',
  total: 'Celkem',
  largeDownload: ({ tiles, size }) => (
    <>
      Velké stahování: {tiles} dlaždic (~{size}). Může to chvíli trvat.
    </>
  ),
  notEnoughSpace: ({ size, free }) => (
    <>
      Nedostatek místa: stahování potřebuje přibližně {size}, ale v tomto
      prohlížeči je dostupných jen {free}. Zastavilo by se v polovině.
    </>
  ),
  estSize: 'Odhadovaná velikost',
  startCaching: 'Spustit stahování',
  cachedSuccess: ({ name }) => `Mapa „${name}“ byla úspěšně stažena.`,
  activate: 'Aktivovat',
  focus: 'Přiblížit na oblast',
  namePrefix: 'Offline',
  offlineWiden:
    'Bez připojení lze tuto mapu jen zmenšit, nikoli zvětšit — zvětšením by bylo potřeba stáhnout dlaždice, které neobsahuje.',
};

export default cs;
