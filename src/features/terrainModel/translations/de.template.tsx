import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { TerrainModelMessages } from './TerrainModelMessages.js';

const de: DeepPartialWithRequiredObjects<TerrainModelMessages> = {
  area: 'Gebiet',
  width: 'Modellbreite',
  size: ({ scale, width, depth }) =>
    `Maßstab 1 : ${scale}, ${width} × ${depth} mm`,
  grid: ({ step, cols, rows }) =>
    `Raster ${step} mm (${cols} × ${rows} Punkte)`,
  elevation: ({ m }) => `Höhendaten im Abstand von ${m} m gelesen`,
  limitedBySamples: 'Der Detailgrad ist durch die Modellgröße begrenzt.',
  limitedByZoom: 'Feinere Höhendaten sind mit Premium verfügbar.',
  progressTiles: ({ done, total }) =>
    `Höhendaten werden geladen (${done} / ${total})`,
  progressMesh: 'Das Modell wird erstellt',
  limitedByData: 'Feiner sind die Höhendaten nicht.',
  exaggeration: 'Überhöhung',
  base: 'Sockelstärke',
  simplification: 'Netzvereinfachung: größte Abweichung',
  simplificationOff: 'Aus',
  simplificationTooLarge:
    'Dieses Modell hat zu viele Punkte, um es im Browser zu vereinfachen; es wird vollständig erstellt.',
  simplificationHint:
    'Fasst Dreiecke zusammen, solange die Oberfläche innerhalb dieser Höhe von den Daten bleibt, für eine kleinere Datei. An einem flachen Hang verschieben sich die gedruckten Umrisse seitlich um ein Vielfaches — 0,02 mm sind an einem 10°-Hang etwa 0,1 mm — und zusammengefasste Dreiecke zeigen sich als flache Facetten.',
  printer: 'Drucker',
  bed: 'Bauraum',
  layerHeight: 'Schichthöhe',
  tooLarge: 'Das Modell ist größer als der Bauraum.',
  areaTooLarge:
    'Das Gebiet ist für ein Modell zu groß. Zoomen Sie hinein oder wählen Sie ein kleineres Gebiet.',
  acrossAntimeridian:
    'Das Gebiet überquert den 180. Längengrad. Wählen Sie ein Gebiet auf einer Seite davon.',
  download: 'STL herunterladen',
  result: ({ height, layers, triangles, size }) =>
    `Modellhöhe ${height} mm (${layers} Schichten), ${triangles} Dreiecke, ${size}.`,
  tooTall: 'Das Modell ist höher als der Bauraum.',
  premiumRefused: ({ m }) =>
    `Die Premium-Höhendaten wurden abgelehnt, daher verwendet das Modell Daten im Abstand von ${m} m. Für feinere Details melden Sie sich erneut mit einem Premium-Konto an.`,
  partialData: ({ percent }) =>
    `${percent} des Gebiets hat keine Höhendaten; dort liegt es auf dem tiefsten Punkt.`,
  noData: 'In diesem Gebiet gibt es keine Höhendaten.',
  error: ({ err }) => `Fehler beim Erstellen des Modells: ${err}`,
  credits: 'Höhendaten',
};

export default de;
