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
  networkFallback: 'Pobieraj brakujące kafelki z internetu',
  networkFallbackHint:
    'Włączone: przesunięcie poza pobrany obszar lub większe przybliżenie pokaże kafelki na żywo, o ile jest połączenie z internetem. Wyłączone: mapa pokaże tylko to, co zostało pobrane.',
  deleteTitle: 'Usuń mapę offline',
  deleteConfirm: ({ name }) => (
    <>
      Na pewno usunąć mapę offline <b>{name}</b> wraz ze wszystkimi jej
      kafelkami?
    </>
  ),
  browse: {
    intro:
      'Kafelki napotkane na mapie można zachować na później, aby ponownie odwiedzane obszary wczytywały się bez internetu. Dotyczy to wszystkich warstw kafelkowych i jest niezależne od pobranych map offline.',
    mode: 'Źródło kafelków',
    modes: {
      networkOnly: 'Tylko internet',
      networkFirst: 'Internet, potem pamięć podręczna',
      cacheFirst: 'Pamięć podręczna, potem internet',
      cacheOnly: 'Tylko pamięć podręczna',
    },
    store: 'Zapisuj kafelki pobrane z internetu',
    maxAge: 'Przechowuj kafelki przez',
    maxSize: 'Limit rozmiaru',
    days: ({ days }) => <>{days} dni</>,
    keepForever: 'Dopóki jest miejsce',
    noSizeLimit: 'Bez limitu',
    retentionHint:
      'Kafelki po upływie czasu są usuwane, a po przekroczeniu limitu rozmiaru odchodzą najdawniej wyświetlane.',
    cached: ({ tiles, size }) => (
      <>
        Zapisano: <strong>{tiles}</strong> kafelków ({size})
      </>
    ),
    clear: 'Wyczyść pamięć',
    clearConfirm:
      'Na pewno usunąć wszystkie kafelki zapisane podczas przeglądania? Ustawienia zostaną zachowane.',
  },
};

export default pl;
