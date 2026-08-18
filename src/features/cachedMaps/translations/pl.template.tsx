import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { CachedMapsMessages } from './CachedMapsMessages.js';

const pl: DeepPartialWithRequiredObjects<CachedMapsMessages> = {
  cacheOfflineMap: 'Zapisz mapę do użycia offline',
  modifyOfflineMap: 'Edytuj mapę offline',
  toDownload: 'Do pobrania',
  addOfflineMap: 'Dodaj mapę offline',
  emptyMessage:
    'Nie zapisano jeszcze żadnych map offline. Dodaj jedną, aby używać map bez połączenia z internetem.',
  zoom: 'Powiększenie',
  tiles: 'Płytki',
  size: 'Rozmiar',
  ready: 'Gotowa',
  incomplete: ({ pct }) => <>Niekompletna ({pct} %)</>,
  resume: 'Wznów',
  stop: 'Zatrzymaj',
  total: 'Łącznie',
  largeDownload: ({ tiles, size }) => (
    <>
      Duże pobieranie: {tiles} płytek (~{size}). Może to chwilę potrwać.
    </>
  ),
  notEnoughSpace: ({ size, free }) => (
    <>
      Za mało miejsca: pobieranie wymaga około {size}, a w tej przeglądarce
      dostępne jest tylko {free}. Zatrzymałoby się w połowie.
    </>
  ),
  estSize: 'Szacowany rozmiar',
  startCaching: 'Rozpocznij pobieranie',
  cachedSuccess: ({ name }) => `Mapa „${name}” została pomyślnie pobrana.`,
  activate: 'Aktywuj',
  focus: 'Przybliż do obszaru',
  namePrefix: 'Offline',
  offlineWiden:
    'Bez połączenia tę mapę można zmniejszyć, ale nie powiększyć — powiększenie wymagałoby pobrania kafelków, których nie zawiera.',
  premiumZoomHint:
    'Najbardziej szczegółowe poziomy powiększenia tej warstwy są premium. Mapa offline zachowuje kafelki na stałe i pokazuje je bez połączenia, więc ich pobranie wymaga dostępu premium.',
  premiumWiden:
    'Ta mapa sięga poziomów powiększenia premium. Bez dostępu premium można ją zmniejszyć, ale nie powiększyć — powiększenie pobrałoby kafelki premium na nowo.',
  premiumSkipped:
    'Najbardziej szczegółowe poziomy powiększenia tej mapy są premium i nie zostały pobrane, więc pozostaje oznaczona jako niekompletna.',
};

export default pl;
