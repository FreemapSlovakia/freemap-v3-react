import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { TerrainModelMessages } from './TerrainModelMessages.js';

const pl: DeepPartialWithRequiredObjects<TerrainModelMessages> = {
  area: 'Obszar',
  texture: 'Mapa na podglądzie',
  texturePlain: 'Bez mapy',
  textureFailed: 'Nie udało się wczytać mapy dla tego obszaru.',
  previewUnavailable: 'Podgląd 3D nie jest tu dostępny.',
  viewArea:
    'Wygładzony podgląd obszaru. Po utworzeniu model jest wyświetlany tak, jak jest w pliku, wraz z uproszczeniem.',
  viewModel: 'Wierny podgląd utworzonego modelu.',
  modelTooLargeToShow:
    'Model jest zbyt szczegółowy na wierny podgląd, dlatego wyświetlany jest wygładzony podgląd obszaru.',
  build: 'Utwórz model',
  dimensions: 'Wymiary modelu',
  scale: 'Skala',
  detail: ({ detail }) => `Rozdzielczość pozioma: ${detail} m`,
  premiumFiner: (premiumLink, { detail, premiumDetail }) => (
    <>
      Z {premiumLink('dostępem Premium')} rozdzielczość pozioma sięga{' '}
      {premiumDetail} m tam, gdzie krajowe modele terenu są tak dokładne,
      zamiast {detail} m.
    </>
  ),
  progressTiles: ({ done, total }) =>
    `Pobieranie danych wysokościowych (${done} / ${total})`,
  progressMesh: 'Tworzenie modelu',
  exaggeration: 'Przewyższenie',
  exaggerationHint:
    'Wysokości są przez nie mnożone: powyżej 1 rzeźba wychodzi bardziej stroma niż w rzeczywistości.',
  base: 'Grubość podstawy',
  simplification: 'Uproszczenie modelu – maksymalne odchylenie pionowe',
  simplificationOff: 'Wyłączone',
  areaTooLarge:
    'Obszar jest zbyt duży na model. Należy przybliżyć mapę lub zaznaczyć mniejszy obszar.',
  acrossAntimeridian:
    'Obszar przecina 180. południk. Należy zaznaczyć obszar po jednej jego stronie.',
  download: 'Pobierz STL',
  result: ({ height, triangles, size }) =>
    `Wysokość modelu ${height} mm, trójkąty: ${triangles}, ${size}.`,
  premiumRefused: ({ m }) =>
    `Dane wysokościowe Premium zostały odrzucone, więc model jest tworzony z danych co ${m} m. Aby uzyskać większą szczegółowość, należy zalogować się ponownie kontem Premium.`,
  partialData: ({ percent }) =>
    `${percent} obszaru nie ma danych wysokościowych; jest tam spłaszczony do najniższego punktu.`,
  noData: 'Na tym obszarze nie ma danych wysokościowych.',
  error: ({ err }) => `Błąd podczas tworzenia modelu: ${err}`,
  shareCredits:
    'Przy publikowaniu lub udostępnianiu modelu należy podać następujące źródła:',
  creditsNone: 'Dane wysokościowe nie podały, z jakich źródeł pochodzą.',
  unknownSources: 'Źródła, których nie udało się nazwać:',
};

export default pl;
