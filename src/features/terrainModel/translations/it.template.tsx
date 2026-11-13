import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { TerrainModelMessages } from './TerrainModelMessages.js';

const it: DeepPartialWithRequiredObjects<TerrainModelMessages> = {
  area: 'Area',
  width: 'Larghezza del modello',
  size: ({ scale, width, depth }) =>
    `Scala 1 : ${scale}, ${width} × ${depth} mm`,
  grid: ({ step, cols, rows }) =>
    `Griglia ${step} mm (${cols} × ${rows} punti)`,
  elevation: ({ m }) => `Dati altimetrici letti ogni ${m} m`,
  limitedBySamples: 'Il dettaglio è limitato dalle dimensioni del modello.',
  premiumFiner: (premiumLink, { step, data, premiumStep, premiumData }) => (
    <>
      Con {premiumLink("l'accesso Premium")} la griglia arriva a {premiumStep}{' '}
      mm, da dati ogni {premiumData} m dove i modelli nazionali del terreno sono
      così fini, invece di {step} mm da dati ogni {data} m.
    </>
  ),
  progressTiles: ({ done, total }) =>
    `Download dei dati altimetrici (${done} / ${total})`,
  progressMesh: 'Creazione del modello',
  limitedByData: 'I dati altimetrici non sono più fini di così.',
  exaggeration: 'Esagerazione verticale',
  base: 'Spessore della base',
  simplification: 'Semplificazione della mesh: scostamento massimo',
  simplificationOff: 'Disattivata',
  simplificationTooLarge:
    'Questo modello ha troppi punti per essere semplificato nel browser; viene creato per intero.',
  simplificationHint:
    'Unisce i triangoli finché la superficie resta entro questa altezza dai dati, per un file più piccolo. Su un pendio dolce i contorni stampati si spostano lateralmente di molte volte tanto — 0,02 mm sono circa 0,1 mm su un pendio di 10° — e i triangoli uniti appaiono come facce piatte.',
  printer: 'Stampante',
  bed: 'Volume di stampa',
  layerHeight: 'Altezza dello strato',
  tooLarge: 'Il modello è più grande del volume di stampa.',
  areaTooLarge:
    "L'area è troppo grande per un modello. Ingrandisca la mappa o selezioni un'area più piccola.",
  acrossAntimeridian:
    "L'area attraversa il 180° meridiano. Selezioni un'area da un solo lato.",
  download: 'Scarica STL',
  result: ({ height, layers, triangles, size }) =>
    `Altezza del modello ${height} mm (${layers} strati), ${triangles} triangoli, ${size}.`,
  tooTall: 'Il modello è più alto del volume di stampa.',
  premiumRefused: ({ m }) =>
    `I dati altimetrici Premium sono stati rifiutati, quindi il modello è creato da dati ogni ${m} m. Per un dettaglio più fine, acceda di nuovo con un account Premium.`,
  partialData: ({ percent }) =>
    `Il ${percent} dell'area non ha dati altimetrici; lì è appiattita al punto più basso.`,
  noData: 'In questa area non ci sono dati altimetrici.',
  error: ({ err }) => `Errore nella creazione del modello: ${err}`,
  credits: 'Dati altimetrici',
};

export default it;
