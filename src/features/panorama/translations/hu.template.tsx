import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PanoramaMessages } from './PanoramaMessages.js';

const hu: DeepPartialWithRequiredObjects<PanoramaMessages> = {
  pickHint: ({ icon }) => (
    <>A nézőpontot az alábbi {icon} gombbal válassza ki.</>
  ),
  rendering: 'Panoráma renderelése…',
  queued: ({ ahead }) =>
    ahead === 0
      ? 'Várakozás a renderelőre…'
      : ahead === 1
        ? 'Várakozás — egy panoráma van előtte.'
        : `Várakozás — ${ahead} panoráma van előtte.`,
  cancel: 'Mégse',
  update: 'Frissítés',
  outdated: 'A kép az előző nézőpontból készült.',
  locate: 'Kilátás a helyzetemből',
  pickViewpoint: 'Kijelölés a térképen',
  pickViewpointPrompt: 'Kattintson a térképre oda, ahonnan nézni szeretne',
  lookAt: 'Nézzen meg egy helyet a térképen',
  pickTargetPrompt: 'Kattintson a térképre oda, ahová nézni szeretne',
  createToposcope: 'Panorámatábla készítése ebből a kilátásból',
  toposcopeMergeModal: {
    title: 'A térkép nem üres',
    message:
      'A térképen már vannak megrajzolt pontok. Hozzáadja ehhez a kilátáshoz tartozó csúcsokat, vagy lecseréli őket? A tábla középpontja mindkét esetben erre a nézőpontra kerül.',
    append: 'Hozzáadás',
    replace: 'Csere',
  },
  settings: {
    title: 'Panoráma beállításai',
    tiltHint:
      'Mennyi égbolt és talaj fér a képbe — a horizont feletti és alatti szög.',
    custom: 'Pontos szögek',
    depthLift: 'Távolság kibontása',
    depthLiftOff: 'Hű kilátás',
    depthLiftHint:
      'Megemeli a távoli terepet, így a messzi hegyláncok elválnak az előttük álló gerincektől — ahogy a kézzel rajzolt panorámákon. Ezzel olyan csúcsok is a képre kerülnek, amelyeket innen valójában nem látna; a nevük meg van jelölve.',
    rangeHint:
      'A 300 km-en túli terep a prémiumé. Minden további kilométert a kép minden sugara mentén be kell járni, így a távolabbi kilátás arányosan többe kerül a renderelőnek.',
    look: 'Megjelenés',
    looks: {
      natural: 'Természetes',
      relief: 'Árnyékolt domborzat',
      drawn: 'Rajzolt',
      engraved: 'Metszet',
      custom: 'Egyéni',
    },
    ridgeStrength: 'Gerincvonalak erőssége',
    ridgeWidth: 'Gerincvonalak vastagsága',
    ridgeColor: 'Gerincek színe',
    ground: 'Terep',
    groundHint:
      'Egyetlen szín, amelyet a beépített pára a távolsággal az ég színe felé mos — vagy egy színátmenet, amely a terepet a távolsága szerint festi, és a párát teljesen kiváltja.',
    groundSolid: 'Szín',
    groundGradient: 'Színátmenet',
    gradientFar: 'A színátmenet vége',
    gradientFarAuto: 'Automatikus',
    gradientFarHint:
      'Az a távolság, ahol az utolsó szín elérkezik; a sáv közepe ennek a harmadánál van. Az automatikus a képen ténylegesen látható terepből méri, így a teljes paletta arra jut, amit a kép mutat.',
    gradientSky: 'Olvadjon az égbe',
    gradientSkyHint:
      'Az utolsó szín maga az ég, így a távoli hegyláncok beleolvadnak a horizontba ahelyett, hogy elütnének tőle. Kikapcsolva a kemény gerincvonalat adja, amit egy plakát kíván.',
    gradientClip: 'Az azon túli terep elrejtése',
    gradientClipHint:
      'A távolságon túli terep kimarad ahelyett, hogy laposan az utolsó színnel lenne kitöltve, így az egész színátmenet arra jut, amit a kép mutat. Az ott álló csúcsok nem kapnak nevet.',
  },
  preview: 'Előnézet',
  quality: {
    label: 'Minőség / sebesség',
    superfast: 'Legalacsonyabb / leggyorsabb',
    fast: 'Alacsony / gyors',
    standard: 'Normál',
    detailed: 'Részletes / lassú',
    finest: 'Legfinomabb / leglassabb',
  },
  tilt: {
    label: 'Függőleges tartomány',
    standard: 'Normál',
    wide: 'Magas',
    flat: 'Alacsony',
  },
  labels: {
    title: 'Csúcsnevek',
    density: 'Nevek száma',
    none: 'Egy sem',
    few: 'Kevesebb',
    normal: 'Normál',
    many: 'Több',
    weight: 'Csúcsok rangsorolása',
    weightHint:
      'A méret szerint a nagy hegyek kapnak nevet, bármilyen messze legyenek, a középső állásban az, ami kitölti a képet, a közelség szerint pedig az, ami közel van, bárhogy is fest.',
    weights: [
      'Méret',
      'Inkább méret',
      'Méret és közelség',
      'Inkább közelség',
      'Közelség',
    ],
    prominence: 'Valódi hegyek előnyben',
    prominenceOff: 'Kikapcsolva',
    prominenceHint:
      'A csúcs azért kap nevet, mert önmagában is hegy, nem csak azért, mennyire emelkedik ki onnan, ahol éppen áll — így a magasabb szomszédok közé szorult híres csúcs is kiérdemli a nevét. Sok csúcsnál ismeretlen, azokat a korábbiak szerint ítéli meg.',
    haze: 'Meddig érnek el a nevek',
    hazeOff: 'Tiszta levegő',
    hazeHint:
      'Milyen messze kell lennie egy csúcsnak, hogy a pára többet nyomjon a latban, mint maga a csúcs. Ennek háromszorosán túl semmi sem kap nevet.',
    showEle: 'Magasságok megjelenítése',
    showEleHint:
      'Minden csúcs neve alá odaírja a magasságát. A felirat így kétsoros, ezért kevesebb fér el belőlük a képen.',
    showRevealed: 'Feltárt csúcsok elnevezése',
    showRevealedHint:
      'Csúcsok, amelyeket a távolság kibontása húzott elő egy közelebbi gerinc mögül: meg vannak rajzolva, de innen valójában nem látszanak. A nevük halványabb, és ha nincs hely mindkettőnek, a látható csúcs kapja meg.',
  },
  dominance: {
    label: 'Legkisebb dominancia',
    all: 'Bármekkora',
  },
  autoPan: 'Forgás az eszközzel vagy magától',
  peak: {
    title: ({ name, ele }) => (
      <>
        <b>{name}</b>
        {ele === null ? null : ` (${ele})`}
      </>
    ),
    figures: ({ distance, azimuth }) => `${distance}\xa0· ${azimuth}`,
  },
  errors: {
    offline: 'A panorámát a kiszolgáló rendereli, Ön pedig offline van.',
    unreachable:
      'A renderelő szolgáltatás nem érhető el. Lehet, hogy leállt, vagy valami az Ön és a szolgáltatás között blokkolja a kérést.',
    busy: 'A renderelő szolgáltatás jelenleg nem érhető el. Próbálja meg kis idő múlva.',
    tooMany:
      'Az utóbbi időben túl sok panoráma készült. Próbálja meg később, vagy váltson prémiumra.',
    noData:
      'Ehhez a nézőponthoz nincs domborzati adat. Próbáljon máshová kattintani.',
    failed: 'A panorámát nem sikerült renderelni.',
  },
  caveats: {
    title: 'Mit mutat a kép, és mit nem',
    bareEarth:
      'A domborzatmodell csupasz föld: erdők és épületek nincsenek benne, így az a kilátás, amelyet egy erdő eltakarna, szabadként van megrajzolva. Messze ez a legnagyobb hibaforrás.',
    coverage:
      'A részletesség országonként eltér. Ahol van országos lézerszkennelt modell, ott a közeli terep éles; máshol egy globális, 30 m-es modell felel.',
    viewpoint:
      'A szem a kattintástól számított néhány méteren belüli legmagasabb pontra kerül, hogy a csúcsról nyíló kilátást ne rontsa el a mellette álló szikla.',
    depthLift:
      'A távolság ki van bontva, így ez a kép rajz, nem fénykép: a halványabb nevű csúcsokat valójában eltakarja egy előttük álló gerinc, a képről leolvasott távolság pedig már nem jelent szabad rálátást.',
  },
  terrainSource: 'Domborzat',
  peakSource: 'Csúcsnevek',
};

export default hu;
