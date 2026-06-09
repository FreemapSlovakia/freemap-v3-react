import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { CachedMapsMessages } from './CachedMapsMessages.js';

const cs: DeepPartialWithRequiredObjects<CachedMapsMessages> = {
  cacheOfflineMap: 'Uložit mapu pro offline použití',
  addOfflineMap: 'Přidat offline mapu',
  emptyMessage:
    'Zatím nejsou uloženy žádné offline mapy. Přidejte si jednu pro používání map bez připojení k internetu.',
  zoom: 'Přiblížení',
  tiles: 'Dlaždice',
  size: 'Velikost',
  ready: 'Připravena',
  incomplete: ({ pct }) => <>Nekompletní ({pct} %)</>,
  pause: 'Pozastavit',
  resume: 'Pokračovat',
  total: 'Celkem',
  largeDownload: ({ tiles, size }) => (
    <>
      Velké stahování: {tiles} dlaždic (~{size}). Může to chvíli trvat.
    </>
  ),
  estSize: 'Odhadovaná velikost',
  startCaching: 'Spustit stahování',
  cachedSuccess: ({ name }) => `Mapa „${name}“ byla úspěšně stažena.`,
  activate: 'Aktivovat',
  namePrefix: 'Offline',
};

export default cs;
