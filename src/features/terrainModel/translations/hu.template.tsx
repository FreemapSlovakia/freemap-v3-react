import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { TerrainModelMessages } from './TerrainModelMessages.js';

const hu: DeepPartialWithRequiredObjects<TerrainModelMessages> = {
  area: 'Terület',
  width: 'Modell szélessége',
  size: ({ scale, width, depth }) =>
    `Méretarány 1 : ${scale}, ${width} × ${depth} mm`,
  grid: ({ step, cols, rows }) => `Rács ${step} mm (${cols} × ${rows} pont)`,
  elevation: ({ m }) => `Magassági adatok ${m} m-es felbontásban`,
  limitedBySamples: 'A részletességet a modell mérete korlátozza.',
  premiumFiner: (premiumLink, { step, data, premiumStep, premiumData }) => (
    <>
      {premiumLink('Prémium hozzáféréssel')} a rács akár {premiumStep} mm-es,{' '}
      {premiumData} m-es adatokból ott, ahol a nemzeti terepmodellek ilyen
      finomak, {step} mm és {data} m helyett.
    </>
  ),
  progressTiles: ({ done, total }) =>
    `Magassági adatok letöltése (${done} / ${total})`,
  progressMesh: 'A modell elkészítése',
  limitedByData: 'A magassági adatok ennél nem finomabbak.',
  exaggeration: 'Magassági torzítás',
  base: 'Talapzat vastagsága',
  simplification: 'Hálóegyszerűsítés: legnagyobb eltérés',
  simplificationOff: 'Ki',
  simplificationTooLarge:
    'Ennek a modellnek túl sok pontja van a böngészőben történő egyszerűsítéshez; teljes egészében készül el.',
  simplificationHint:
    'Összevonja a háromszögeket, amíg a felület ezen a magasságon belül marad az adatoktól, kisebb fájlért. Enyhe lejtőn a nyomtatott körvonalak ennek többszörösével tolódnak oldalra — 10°-os lejtőn 0,02 mm kb. 0,1 mm —, az összevont háromszögek pedig sík lapokként látszanak.',
  printer: 'Nyomtató',
  bed: 'Nyomtatási tér',
  layerHeight: 'Rétegvastagság',
  tooLarge: 'A modell nagyobb a nyomtatási térnél.',
  areaTooLarge:
    'A terület túl nagy egy modellhez. Nagyítson rá, vagy jelöljön ki kisebb területet.',
  acrossAntimeridian:
    'A terület átlépi a 180. hosszúsági kört. Jelöljön ki területet annak egyik oldalán.',
  download: 'STL letöltése',
  result: ({ height, layers, triangles, size }) =>
    `Modellmagasság ${height} mm (${layers} réteg), ${triangles} háromszög, ${size}.`,
  tooTall: 'A modell magasabb a nyomtatási térnél.',
  premiumRefused: ({ m }) =>
    `A prémium magassági adatokat elutasították, ezért a modell ${m} m-es adatokból készül. Finomabb részletekhez jelentkezzen be újra prémium fiókkal.`,
  partialData: ({ percent }) =>
    `A terület ${percent}-ához nincs magassági adat; ott a legalacsonyabb pont szintjén van.`,
  noData: 'Ezen a területen nincsenek magassági adatok.',
  error: ({ err }) => `Hiba a modell létrehozásakor: ${err}`,
  credits: 'Magassági adatok',
};

export default hu;
