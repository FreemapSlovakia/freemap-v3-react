import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { TerrainModelMessages } from './TerrainModelMessages.js';

const sl: DeepPartialWithRequiredObjects<TerrainModelMessages> = {
  area: 'Območje',
  width: 'Širina modela',
  size: ({ scale, width, depth }) =>
    `Merilo 1 : ${scale}, ${width} × ${depth} mm`,
  grid: ({ step, cols, rows }) => `Mreža ${step} mm (${cols} × ${rows} točk)`,
  elevation: ({ m }) => `Višinski podatki, brani na ${m} m`,
  limitedBySamples: 'Podrobnost je omejena z velikostjo modela.',
  limitedByZoom: 'Podrobnejši višinski podatki so na voljo s Premium.',
  progressTiles: ({ done, total }) =>
    `Prenašanje višinskih podatkov (${done} / ${total})`,
  progressMesh: 'Izdelava modela',
  limitedByData: 'Višinski podatki niso podrobnejši.',
  exaggeration: 'Višinsko pretiravanje',
  base: 'Debelina podstavka',
  simplification: 'Poenostavitev mreže: največje odstopanje',
  simplificationOff: 'Izklopljeno',
  simplificationTooLarge:
    'Ta model ima preveč točk za poenostavitev v brskalniku; izdela se v celoti.',
  simplificationHint:
    'Združuje trikotnike, dokler površina ostaja znotraj te višine od podatkov, za manjšo datoteko. Na položnem pobočju se natisnjeni obrisi premaknejo vstran za večkratnik tega — 0,02 mm je na 10° pobočju približno 0,1 mm — združeni trikotniki pa se pokažejo kot ravne ploskve.',
  printer: 'Tiskalnik',
  bed: 'Tiskalni prostor',
  layerHeight: 'Višina sloja',
  tooLarge: 'Model je večji od tiskalnega prostora.',
  areaTooLarge:
    'Območje je za model preveliko. Povečajte zemljevid ali izberite manjše območje.',
  acrossAntimeridian:
    'Območje seka 180. poldnevnik. Izberite območje na eni njegovi strani.',
  download: 'Prenesi STL',
  result: ({ height, layers, triangles, size }) =>
    `Višina modela ${height} mm (slojev: ${layers}), trikotnikov: ${triangles}, ${size}.`,
  tooTall: 'Model je višji od tiskalnega prostora.',
  premiumRefused: ({ m }) =>
    `Višinski podatki Premium so bili zavrnjeni, zato model uporablja podatke na ${m} m. Za podrobnejši model se znova prijavite z računom Premium.`,
  partialData: ({ percent }) =>
    `${percent} območja nima višinskih podatkov; tam je poravnano na najnižjo točko.`,
  noData: 'Na tem območju ni višinskih podatkov.',
  error: ({ err }) => `Napaka pri izdelavi modela: ${err}`,
  credits: 'Višinski podatki',
};

export default sl;
