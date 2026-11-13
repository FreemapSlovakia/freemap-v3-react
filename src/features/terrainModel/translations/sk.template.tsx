import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { TerrainModelMessages } from './TerrainModelMessages.js';

const sk: DeepPartialWithRequiredObjects<TerrainModelMessages> = {
  area: 'Oblasť',
  width: 'Šírka modelu',
  size: ({ scale, width, depth }) =>
    `Mierka 1 : ${scale}, ${width} × ${depth} mm`,
  grid: ({ step, cols, rows }) =>
    `Mriežka ${step} mm (${cols} × ${rows} bodov)`,
  elevation: ({ m }) => `Výškové dáta čítané po ${m} m`,
  limitedBySamples: 'Detail je obmedzený veľkosťou modelu.',
  premiumFiner: (premiumLink, { step, data, premiumStep, premiumData }) => (
    <>
      S {premiumLink('prémiovým prístupom')} je mriežka až {premiumStep} mm z
      dát po {premiumData} m tam, kde sú národné modely terénu také jemné,
      namiesto {step} mm z dát po {data} m.
    </>
  ),
  progressTiles: ({ done, total }) =>
    `Sťahujú sa výškové dáta (${done} / ${total})`,
  progressMesh: 'Vytvára sa model',
  limitedByData: 'Výškové dáta nie sú jemnejšie.',
  exaggeration: 'Prevýšenie',
  base: 'Hrúbka podstavy',
  simplification: 'Zjednodušenie siete: najväčšia odchýlka',
  simplificationOff: 'Vypnuté',
  simplificationTooLarge:
    'Tento model má priveľa bodov na zjednodušenie v prehliadači; vytvorí sa celý.',
  simplificationHint:
    'Spája trojuholníky, kým povrch zostáva v tejto výške od dát, pre menší súbor. Na miernom svahu sa tlačené obrysy posunú do strany niekoľkonásobne viac — 0,02 mm je na 10° svahu asi 0,1 mm — a spojené trojuholníky sa prejavia ako ploché fazety.',
  printer: 'Tlačiareň',
  bed: 'Tlačový priestor',
  layerHeight: 'Výška vrstvy',
  tooLarge: 'Model je väčší ako tlačový priestor.',
  areaTooLarge:
    'Oblasť je na model príliš veľká. Priblížte mapu alebo označte menšiu oblasť.',
  acrossAntimeridian:
    'Oblasť pretína 180. poludník. Označte oblasť na jednej jeho strane.',
  download: 'Stiahnuť STL',
  result: ({ height, layers, triangles, size }) =>
    `Výška modelu ${height} mm (${layers} vrstiev), ${triangles} trojuholníkov, ${size}.`,
  tooTall: 'Model je vyšší ako tlačový priestor.',
  premiumRefused: ({ m }) =>
    `Prémiové výškové dáta boli odmietnuté, model je preto vytvorený z dát po ${m} m. Pre jemnejší detail sa znova prihláste prémiovým účtom.`,
  partialData: ({ percent }) =>
    `${percent} oblasti nemá výškové dáta; je zarovnaná na najnižší bod.`,
  noData: 'V tejto oblasti nie sú výškové dáta.',
  error: ({ err }) => `Chyba pri tvorbe modelu: ${err}`,
  credits: 'Výškové dáta',
};

export default sk;
