import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { TerrainModelMessages } from './TerrainModelMessages.js';

const sl: DeepPartialWithRequiredObjects<TerrainModelMessages> = {
  area: 'Območje',
  texture: 'Zemljevid na predogledu',
  texturePlain: 'Brez zemljevida',
  textureFailed: 'Zemljevida za to območje ni bilo mogoče naložiti.',
  previewUnavailable: '3D predogled tukaj ni na voljo.',
  viewArea:
    'Zglajen predogled območja. Po ustvarjanju je model prikazan tako, kot je v datoteki, skupaj s poenostavitvijo.',
  viewModel: 'Zvest predogled ustvarjenega modela.',
  modelTooLargeToShow:
    'Model je za zvest predogled preveč podroben, zato je prikazan zglajen predogled območja.',
  build: 'Ustvari model',
  dimensions: 'Mere modela',
  scale: 'Merilo',
  detail: ({ detail }) => `Vodoravna ločljivost: ${detail} m`,
  premiumFiner: (premiumLink, { detail, premiumDetail }) => (
    <>
      S {premiumLink('dostopom Premium')} je vodoravna ločljivost do{' '}
      {premiumDetail} m, kjer so nacionalni modeli terena tako podrobni, namesto{' '}
      {detail} m.
    </>
  ),
  progressTiles: ({ done, total }) =>
    `Prenašanje višinskih podatkov (${done} / ${total})`,
  progressMesh: 'Izdelava modela',
  exaggeration: 'Povečanje višin',
  exaggerationHint:
    'Višine se pomnožijo s tem številom: nad 1 je relief strmejši kot v resnici.',
  base: 'Debelina podstavka',
  simplification: 'Poenostavitev modela – največje navpično odstopanje',
  simplificationOff: 'Izklopljeno',
  areaTooLarge:
    'Območje je za model preveliko. Povečajte zemljevid ali izberite manjše območje.',
  acrossAntimeridian:
    'Območje seka 180. poldnevnik. Izberite območje na eni njegovi strani.',
  download: 'Prenesi STL',
  result: ({ height, triangles, size }) =>
    `Višina modela ${height} mm, trikotnikov: ${triangles}, ${size}.`,
  premiumRefused: ({ m }) =>
    `Višinski podatki Premium so bili zavrnjeni, zato je model izdelan iz podatkov na ${m} m. Za podrobnejši model se znova prijavite z računom Premium.`,
  partialData: ({ percent }) =>
    `${percent} območja nima višinskih podatkov; tam je poravnano na najnižjo točko.`,
  noData: 'Na tem območju ni višinskih podatkov.',
  error: ({ err }) => `Napaka pri izdelavi modela: ${err}`,
  credits: 'Višinski podatki',
};

export default sl;
