import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { TerrainModelMessages } from './TerrainModelMessages.js';

const cs: DeepPartialWithRequiredObjects<TerrainModelMessages> = {
  area: 'Oblast',
  texture: 'Mapa na náhledu',
  texturePlain: 'Bez mapy',
  textureFailed: 'Mapu se pro toto území nepodařilo načíst.',
  previewUnavailable: '3D náhled zde není dostupný.',
  viewArea:
    'Vyhlazený náhled území. Po vytvoření se model zobrazí tak, jak bude ve výsledném souboru, i se zjednodušením.',
  viewModel: 'Věrný náhled vytvořeného modelu.',
  modelTooLargeToShow:
    'Vytvořený model je na zobrazení příliš velký, proto náhled ukazuje území. Stáhnout jej lze i tak.',
  build: 'Vytvořit model',
  dimensions: 'Rozměry modelu',
  scale: 'Měřítko',
  detail: ({ detail }) => `Horizontální rozlišení: ${detail} m`,
  premiumFiner: (premiumLink, { detail, premiumDetail }) => (
    <>
      S {premiumLink('prémiovým přístupem')} je horizontální rozlišení až{' '}
      {premiumDetail} m tam, kde jsou národní modely terénu tak jemné, místo{' '}
      {detail} m.
    </>
  ),
  progressTiles: ({ done, total }) =>
    `Stahují se výšková data (${done} / ${total})`,
  progressMesh: 'Vytváří se model',
  exaggeration: 'Zvýraznění výšek',
  exaggerationHint:
    'Výšky se jím násobí: nad 1 vyjde reliéf strmější, než ve skutečnosti je.',
  base: 'Tloušťka podstavy',
  simplification: 'Zjednodušení modelu – maximální vertikální odchylka',
  simplificationOff: 'Vypnuto',
  areaTooLarge:
    'Oblast je na model příliš velká. Přibližte mapu nebo označte menší oblast.',
  acrossAntimeridian:
    'Oblast protíná 180. poledník. Označte oblast na jedné jeho straně.',
  download: 'Stáhnout STL',
  result: ({ height, triangles, size }) =>
    `Výška modelu ${height} mm, ${triangles} trojúhelníků, ${size}.`,
  premiumRefused: ({ m }) =>
    `Prémiová výšková data byla odmítnuta, model je proto vytvořen z dat po ${m} m. Pro jemnější detail se znovu přihlaste prémiovým účtem.`,
  partialData: ({ percent }) =>
    `${percent} oblasti nemá výšková data; je zarovnána na nejnižší bod.`,
  noData: 'V této oblasti nejsou výšková data.',
  error: ({ err }) => `Chyba při tvorbě modelu: ${err}`,
  credits: 'Výšková data',
};

export default cs;
