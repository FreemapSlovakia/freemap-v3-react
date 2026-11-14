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
  modelTooLargeToShow:
    'Model je na verný náhľad príliš podrobný, preto je zobrazený vyhladený náhľad územia.',
  build: 'Vytvoriť model',
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
  premiumRefused: ({ m }) =>
    `Prémiové výškové dáta boli odmietnuté, model je preto vytvorený z dát po ${m} m. Pre jemnejší detail sa znova prihláste prémiovým účtom.`,
  partialData: ({ percent }) =>
    `${percent} oblasti nemá výškové dáta; je zarovnaná na najnižší bod.`,
  noData: 'V tejto oblasti nie sú výškové dáta.',
  error: ({ err }) => `Chyba pri tvorbe modelu: ${err}`,
  shareCredits: 'Pri publikovaní alebo zdieľaní modelu uveďte tieto zdroje:',
  creditsNone: 'Výškové dáta neoznámili, z ktorých zdrojov pochádzajú.',
  unknownSources: 'Zdroje, ktoré sa nepodarilo pomenovať:',
};

export default sk;
