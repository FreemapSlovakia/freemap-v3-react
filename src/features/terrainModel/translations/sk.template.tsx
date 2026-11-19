import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { TerrainModelMessages } from './TerrainModelMessages.js';

const sk: DeepPartialWithRequiredObjects<TerrainModelMessages> = {
  area: 'Oblasť',
  texture: 'Mapa na náhľade',
  texturePlain: 'Bez mapy',
  textureFailed: 'Mapu sa pre toto územie nepodarilo načítať.',
  previewUnavailable: '3D náhľad tu nie je dostupný.',
  viewArea:
    'Vyhladený náhľad územia. Po vytvorení sa model zobrazí tak, ako bude vo výslednom súbore, aj so zjednodušením.',
  viewModel: 'Verný náhľad vytvoreného modelu.',
  build: 'Vytvoriť model',
  sizeAndShape: 'Rozmery a tvar',
  dimensions: 'Rozmery modelu',
  scale: 'Mierka',
  detail: ({ detail }) => `Horizontálne rozlíšenie: ${detail} m`,
  premiumFiner: (premiumLink, { detail, premiumDetail }) => (
    <>
      S {premiumLink('prémiovým prístupom')} je horizontálne rozlíšenie až{' '}
      {premiumDetail} m tam, kde sú národné modely terénu také jemné, namiesto{' '}
      {detail} m.
    </>
  ),
  progressTiles: ({ done, total }) =>
    `Sťahujú sa výškové dáta (${done} / ${total})`,
  progressMesh: 'Vytvára sa model',
  progressFile: 'Zapisuje sa 3MF',
  exaggeration: 'Zvýraznenie výšok',
  exaggerationHint:
    'Výšky sa ním násobia: nad 1 vyjde reliéf strmší, než v skutočnosti je.',
  base: 'Hrúbka podstavy',
  simplification: 'Zjednodušenie modelu – maximálna vertikálna odchýlka',
  simplificationOff: 'Vypnuté',
  areaTooLarge:
    'Oblasť je na model príliš veľká. Priblížte mapu alebo označte menšiu oblasť.',
  acrossAntimeridian:
    'Oblasť pretína 180. poludník. Označte oblasť na jednej jeho strane.',
  download: 'Stiahnuť STL',
  result: ({ height, triangles, size }) =>
    `Výška modelu ${height} mm, ${triangles} trojuholníkov, ${size}.`,
  colourFeatures: 'Prvky mapy vo farbe',
  colourFeaturesHint:
    'Vybrané prvky sa na modeli vyfarbia farbami z mapy a model sa stiahne ako 3MF na viacfarebnú tlač: každá farba jeden filament. Plocha sa vyplní, ak je jej výplň na mape aspoň z polovice nepriehľadná, inak sa vyznačí len jej obrys.',
  lineWidth: 'Šírka čiary',
  pointSize: 'Veľkosť bodu',
  landcover: 'Krajinná pokrývka',
  landcoverFailed: 'Krajinnú pokrývku sa nepodarilo načítať.',
  landcoverDetail: 'Najmenší detail pokrývky',
  landcoverClasses: {
    farmland: 'Polia a sady',
    meadow: 'Lúky a tráva',
    builtUp: 'Zastavané územie',
    forest: 'Les',
    rock: 'Skaly a sutiny',
    glacier: 'Ľadovce',
    water: 'Voda',
  },
  colours: 'Farby filamentov',
  ground: 'Terén',
  download3mf: 'Stiahnuť 3MF',
  premiumRefused: ({ m }) =>
    `Prémiové výškové dáta boli odmietnuté, model je preto vytvorený z dát po ${m} m. Pre jemnejší detail sa znova prihláste prémiovým účtom.`,
  partialData: ({ percent }) =>
    `${percent} oblasti nemá výškové dáta; je zarovnaná na najnižší bod.`,
  noData: 'V tejto oblasti nie sú výškové dáta.',
  error: ({ err }) => `Chyba pri tvorbe modelu: ${err}`,
  shareCredits: 'Pri publikovaní alebo zdieľaní modelu uveďte tieto zdroje:',
  creditsNone: 'Výškové dáta neoznámili, z ktorých zdrojov pochádzajú.',
  unknownSources: 'Zdroje, ktoré sa nepodarilo pomenovať:',
  mentionFreemap: 'Potešíme sa, ak pri zdieľaní uvediete aj:',
  discardModelTitle: 'Zahodiť model',
  discardModelQuestion: 'Model ešte nebol stiahnutý. Chcete ho zahodiť?',
};

export default sk;
