import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { TerrainModelMessages } from './TerrainModelMessages.js';

const pl: DeepPartialWithRequiredObjects<TerrainModelMessages> = {
  area: 'Obszar',
  width: 'Szerokość modelu',
  size: ({ scale, width, depth }) =>
    `Skala 1 : ${scale}, ${width} × ${depth} mm`,
  grid: ({ step, cols, rows }) =>
    `Siatka ${step} mm (${cols} × ${rows} punktów)`,
  elevation: ({ m }) => `Dane wysokościowe odczytywane co ${m} m`,
  limitedBySamples: 'Szczegółowość jest ograniczona rozmiarem modelu.',
  limitedByZoom: 'Dokładniejsze dane wysokościowe są dostępne w Premium.',
  progressTiles: ({ done, total }) =>
    `Pobieranie danych wysokościowych (${done} / ${total})`,
  progressMesh: 'Tworzenie modelu',
  limitedByData: 'Dane wysokościowe nie są dokładniejsze.',
  exaggeration: 'Przewyższenie',
  base: 'Grubość podstawy',
  simplification: 'Uproszczenie siatki: największe odchylenie',
  simplificationOff: 'Wyłączone',
  simplificationTooLarge:
    'Ten model ma zbyt wiele punktów, by uprościć go w przeglądarce; zostanie utworzony w całości.',
  simplificationHint:
    'Łączy trójkąty, dopóki powierzchnia mieści się w tej wysokości od danych, dla mniejszego pliku. Na łagodnym stoku drukowane kontury przesuwają się na boki kilkakrotnie bardziej — 0,02 mm to na stoku 10° ok. 0,1 mm — a połączone trójkąty widać jako płaskie fasetki.',
  printer: 'Drukarka',
  bed: 'Obszar roboczy',
  layerHeight: 'Wysokość warstwy',
  tooLarge: 'Model jest większy niż obszar roboczy.',
  areaTooLarge:
    'Obszar jest zbyt duży na model. Należy przybliżyć mapę lub zaznaczyć mniejszy obszar.',
  acrossAntimeridian:
    'Obszar przecina 180. południk. Należy zaznaczyć obszar po jednej jego stronie.',
  download: 'Pobierz STL',
  result: ({ height, layers, triangles, size }) =>
    `Wysokość modelu ${height} mm (warstwy: ${layers}), trójkąty: ${triangles}, ${size}.`,
  tooTall: 'Model jest wyższy niż obszar roboczy.',
  premiumRefused: ({ m }) =>
    `Dane wysokościowe Premium zostały odrzucone, więc model korzysta z danych co ${m} m. Aby uzyskać większą szczegółowość, należy zalogować się ponownie kontem Premium.`,
  partialData: ({ percent }) =>
    `${percent} obszaru nie ma danych wysokościowych; jest tam spłaszczony do najniższego punktu.`,
  noData: 'Na tym obszarze nie ma danych wysokościowych.',
  error: ({ err }) => `Błąd podczas tworzenia modelu: ${err}`,
  credits: 'Dane wysokościowe',
};

export default pl;
