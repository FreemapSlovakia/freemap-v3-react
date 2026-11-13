import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { TerrainModelMessages } from './TerrainModelMessages.js';

const cs: DeepPartialWithRequiredObjects<TerrainModelMessages> = {
  area: 'Oblast',
  width: 'Šířka modelu',
  size: ({ scale, width, depth }) =>
    `Měřítko 1 : ${scale}, ${width} × ${depth} mm`,
  grid: ({ step, cols, rows }) => `Mřížka ${step} mm (${cols} × ${rows} bodů)`,
  elevation: ({ m }) => `Výšková data čtená po ${m} m`,
  limitedBySamples: 'Detail je omezen velikostí modelu.',
  premiumFiner: (premiumLink, { step, data, premiumStep, premiumData }) => (
    <>
      S {premiumLink('prémiovým přístupem')} je mřížka až {premiumStep} mm z dat
      po {premiumData} m tam, kde jsou národní modely terénu tak jemné, místo{' '}
      {step} mm z dat po {data} m.
    </>
  ),
  progressTiles: ({ done, total }) =>
    `Stahují se výšková data (${done} / ${total})`,
  progressMesh: 'Vytváří se model',
  limitedByData: 'Výšková data nejsou jemnější.',
  exaggeration: 'Převýšení',
  base: 'Tloušťka podstavy',
  simplification: 'Zjednodušení sítě: největší odchylka',
  simplificationOff: 'Vypnuto',
  simplificationTooLarge:
    'Tento model má příliš mnoho bodů na zjednodušení v prohlížeči; vytvoří se celý.',
  simplificationHint:
    'Spojuje trojúhelníky, dokud povrch zůstává v této výšce od dat, pro menší soubor. Na mírném svahu se tištěné obrysy posunou do strany několikanásobně víc — 0,02 mm je na 10° svahu asi 0,1 mm — a spojené trojúhelníky se projeví jako ploché fazety.',
  printer: 'Tiskárna',
  bed: 'Tiskový prostor',
  layerHeight: 'Výška vrstvy',
  tooLarge: 'Model je větší než tiskový prostor.',
  areaTooLarge:
    'Oblast je na model příliš velká. Přibližte mapu nebo označte menší oblast.',
  acrossAntimeridian:
    'Oblast protíná 180. poledník. Označte oblast na jedné jeho straně.',
  download: 'Stáhnout STL',
  result: ({ height, layers, triangles, size }) =>
    `Výška modelu ${height} mm (${layers} vrstev), ${triangles} trojúhelníků, ${size}.`,
  tooTall: 'Model je vyšší než tiskový prostor.',
  premiumRefused: ({ m }) =>
    `Prémiová výšková data byla odmítnuta, model je proto vytvořen z dat po ${m} m. Pro jemnější detail se znovu přihlaste prémiovým účtem.`,
  partialData: ({ percent }) =>
    `${percent} oblasti nemá výšková data; je zarovnána na nejnižší bod.`,
  noData: 'V této oblasti nejsou výšková data.',
  error: ({ err }) => `Chyba při tvorbě modelu: ${err}`,
  credits: 'Výšková data',
};

export default cs;
