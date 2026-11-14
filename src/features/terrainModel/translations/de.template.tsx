import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { TerrainModelMessages } from './TerrainModelMessages.js';

const de: DeepPartialWithRequiredObjects<TerrainModelMessages> = {
  area: 'Gebiet',
  texture: 'Karte auf der Vorschau',
  texturePlain: 'Ohne Karte',
  textureFailed: 'Die Karte konnte für dieses Gebiet nicht geladen werden.',
  previewUnavailable: 'Die 3D-Vorschau ist hier nicht verfügbar.',
  viewArea:
    'Eine geglättete Vorschau des Gebiets. Nach dem Erstellen wird das Modell so angezeigt, wie es in der Datei steht, samt Vereinfachung.',
  viewModel: 'Getreue Vorschau des erstellten Modells.',
  modelTooLargeToShow:
    'Das Modell ist für eine getreue Vorschau zu detailliert, daher wird eine geglättete Vorschau des Gebiets angezeigt.',
  build: 'Modell erstellen',
  dimensions: 'Modellmaße',
  scale: 'Maßstab',
  detail: ({ detail }) => `Horizontale Auflösung: ${detail} m`,
  premiumFiner: (premiumLink, { detail, premiumDetail }) => (
    <>
      Mit {premiumLink('Premium-Zugang')} reicht die horizontale Auflösung bis{' '}
      {premiumDetail} m, wo nationale Geländemodelle so fein sind, statt{' '}
      {detail} m.
    </>
  ),
  progressTiles: ({ done, total }) =>
    `Höhendaten werden geladen (${done} / ${total})`,
  progressMesh: 'Das Modell wird erstellt',
  exaggeration: 'Überhöhung',
  exaggerationHint:
    'Die Höhen werden damit multipliziert: über 1 wird das Relief steiler, als es ist.',
  base: 'Sockelstärke',
  simplification: 'Modellvereinfachung – maximale vertikale Abweichung',
  simplificationOff: 'Aus',
  areaTooLarge:
    'Das Gebiet ist für ein Modell zu groß. Zoomen Sie hinein oder wählen Sie ein kleineres Gebiet.',
  acrossAntimeridian:
    'Das Gebiet überquert den 180. Längengrad. Wählen Sie ein Gebiet auf einer Seite davon.',
  download: 'STL herunterladen',
  result: ({ height, triangles, size }) =>
    `Modellhöhe ${height} mm, ${triangles} Dreiecke, ${size}.`,
  premiumRefused: ({ m }) =>
    `Die Premium-Höhendaten wurden abgelehnt, daher wird das Modell aus Daten im Abstand von ${m} m erstellt. Für feinere Details melden Sie sich erneut mit einem Premium-Konto an.`,
  partialData: ({ percent }) =>
    `${percent} des Gebiets hat keine Höhendaten; dort liegt es auf dem tiefsten Punkt.`,
  noData: 'In diesem Gebiet gibt es keine Höhendaten.',
  error: ({ err }) => `Fehler beim Erstellen des Modells: ${err}`,
  shareCredits:
    'Geben Sie beim Veröffentlichen oder Teilen des Modells diese Quellen an:',
  creditsNone:
    'Die Höhendaten haben nicht gemeldet, aus welchen Quellen sie stammen.',
  unknownSources: 'Quellen, die nicht benannt werden konnten:',
};

export default de;
