import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { TerrainModelMessages } from './TerrainModelMessages.js';

const hu: DeepPartialWithRequiredObjects<TerrainModelMessages> = {
  area: 'Terület',
  texture: 'Térkép az előnézeten',
  texturePlain: 'Térkép nélkül',
  textureFailed: 'A térképet nem sikerült betölteni erre a területre.',
  previewUnavailable: 'A 3D előnézet itt nem érhető el.',
  viewArea:
    'A terület elsimított előnézete. A létrehozás után a modell úgy jelenik meg, ahogy a fájlban van, az egyszerűsítéssel együtt.',
  viewModel: 'A létrehozott modell hű előnézete.',
  modelTooLargeToShow:
    'A modell túl részletes a hű előnézethez, ezért a terület elsimított előnézete látható.',
  build: 'Modell létrehozása',
  dimensions: 'A modell méretei',
  scale: 'Méretarány',
  detail: ({ detail }) => `Vízszintes felbontás: ${detail} m`,
  premiumFiner: (premiumLink, { detail, premiumDetail }) => (
    <>
      {premiumLink('Prémium hozzáféréssel')} a vízszintes felbontás akár{' '}
      {premiumDetail} m ott, ahol a nemzeti terepmodellek ilyen finomak,{' '}
      {detail} m helyett.
    </>
  ),
  progressTiles: ({ done, total }) =>
    `Magassági adatok letöltése (${done} / ${total})`,
  progressMesh: 'A modell elkészítése',
  exaggeration: 'Túlzás',
  exaggerationHint:
    'A magasságok ezzel szorzódnak: 1 fölött a domborzat meredekebb lesz a valóságosnál.',
  base: 'Talapzat vastagsága',
  simplification: 'A modell egyszerűsítése – legnagyobb függőleges eltérés',
  simplificationOff: 'Ki',
  areaTooLarge:
    'A terület túl nagy egy modellhez. Nagyítson rá, vagy jelöljön ki kisebb területet.',
  acrossAntimeridian:
    'A terület átlépi a 180. hosszúsági kört. Jelöljön ki területet annak egyik oldalán.',
  download: 'STL letöltése',
  result: ({ height, triangles, size }) =>
    `Modellmagasság ${height} mm, ${triangles} háromszög, ${size}.`,
  premiumRefused: ({ m }) =>
    `A prémium magassági adatokat elutasították, ezért a modell ${m} m-es adatokból készül. Finomabb részletekhez jelentkezzen be újra prémium fiókkal.`,
  partialData: ({ percent }) =>
    `A terület ${percent}-ához nincs magassági adat; ott a legalacsonyabb pont szintjén van.`,
  noData: 'Ezen a területen nincsenek magassági adatok.',
  error: ({ err }) => `Hiba a modell létrehozásakor: ${err}`,
  credits: 'Magassági adatok',
};

export default hu;
