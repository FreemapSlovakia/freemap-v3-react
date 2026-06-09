import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { CachedMapsMessages } from './CachedMapsMessages.js';

const pl: DeepPartialWithRequiredObjects<CachedMapsMessages> = {
  cacheOfflineMap: 'Zapisz mapę do użycia offline',
  addOfflineMap: 'Dodaj mapę offline',
  emptyMessage:
    'Nie zapisano jeszcze żadnych map offline. Dodaj jedną, aby używać map bez połączenia z internetem.',
  zoom: 'Powiększenie',
  tiles: 'Płytki',
  size: 'Rozmiar',
  ready: 'Gotowa',
  incomplete: ({ pct }) => <>Niekompletna ({pct} %)</>,
  pause: 'Wstrzymaj',
  resume: 'Wznów',
  total: 'Łącznie',
  largeDownload: ({ tiles, size }) => (
    <>
      Duże pobieranie: {tiles} płytek (~{size}). Może to chwilę potrwać.
    </>
  ),
  estSize: 'Szacowany rozmiar',
  startCaching: 'Rozpocznij pobieranie',
  cachedSuccess: ({ name }) => `Mapa „${name}” została pomyślnie pobrana.`,
  activate: 'Aktywuj',
  namePrefix: 'Offline',
};

export default pl;
