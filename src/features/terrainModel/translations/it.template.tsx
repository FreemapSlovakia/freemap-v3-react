import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { TerrainModelMessages } from './TerrainModelMessages.js';

const it: DeepPartialWithRequiredObjects<TerrainModelMessages> = {
  area: 'Area',
  texture: "Mappa sull'anteprima",
  texturePlain: 'Senza mappa',
  textureFailed: 'Non è stato possibile caricare la mappa per questa area.',
  previewUnavailable: "L'anteprima 3D non è disponibile qui.",
  viewArea:
    "Un'anteprima smussata dell'area. Una volta creato, il modello viene mostrato come è nel file, semplificazione compresa.",
  viewModel: 'Anteprima fedele del modello creato.',
  modelTooLargeToShow:
    "Il modello è troppo dettagliato per un'anteprima fedele, quindi viene mostrata un'anteprima smussata dell'area.",
  build: 'Crea modello',
  dimensions: 'Dimensioni del modello',
  scale: 'Scala',
  detail: ({ detail }) => `Risoluzione orizzontale: ${detail} m`,
  premiumFiner: (premiumLink, { detail, premiumDetail }) => (
    <>
      Con {premiumLink("l'accesso Premium")} la risoluzione orizzontale arriva a{' '}
      {premiumDetail} m dove i modelli nazionali del terreno sono così fini,
      invece di {detail} m.
    </>
  ),
  progressTiles: ({ done, total }) =>
    `Download dei dati altimetrici (${done} / ${total})`,
  progressMesh: 'Creazione del modello',
  exaggeration: 'Esagerazione',
  exaggerationHint:
    'Le quote vengono moltiplicate per questo valore: sopra 1 il rilievo risulta più ripido di quanto sia.',
  base: 'Spessore della base',
  simplification: 'Semplificazione del modello – scostamento verticale massimo',
  simplificationOff: 'Disattivata',
  areaTooLarge:
    "L'area è troppo grande per un modello. Ingrandisca la mappa o selezioni un'area più piccola.",
  acrossAntimeridian:
    "L'area attraversa il 180° meridiano. Selezioni un'area da un solo lato.",
  download: 'Scarica STL',
  result: ({ height, triangles, size }) =>
    `Altezza del modello ${height} mm, ${triangles} triangoli, ${size}.`,
  premiumRefused: ({ m }) =>
    `I dati altimetrici Premium sono stati rifiutati, quindi il modello è creato da dati ogni ${m} m. Per un dettaglio più fine, acceda di nuovo con un account Premium.`,
  partialData: ({ percent }) =>
    `Il ${percent} dell'area non ha dati altimetrici; lì è appiattita al punto più basso.`,
  noData: 'In questa area non ci sono dati altimetrici.',
  error: ({ err }) => `Errore nella creazione del modello: ${err}`,
  shareCredits: 'Quando pubblica o condivide il modello, indichi queste fonti:',
  creditsNone:
    'I dati altimetrici non hanno indicato da quali fonti provengono.',
  unknownSources: 'Fonti che non è stato possibile identificare:',
};

export default it;
