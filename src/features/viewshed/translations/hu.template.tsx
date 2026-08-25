import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ViewshedMessages } from './ViewshedMessages.js';

const hu: DeepPartialWithRequiredObjects<ViewshedMessages> = {
  pickViewpoint: 'Kijelölés a térképen',
  locate: 'Láthatóság a helyzetemből',
  pickViewpointPrompt: 'Kattintson a térképre oda, ahonnan nézni szeretne',
  detail: 'Minőség / sebesség',
  details: {
    superfast: 'Legalacsonyabb / leggyorsabb',
    fast: 'Alacsony / gyors',
    standard: 'Normál',
    detailed: 'Részletes / lassú',
    finest: 'Legfinomabb / leglassabb',
  },
  settings: 'Láthatóság beállításai',
  targetHeight: 'A cél magassága',
  targetHeightHint:
    'Milyen magas az, amit néz — emelje meg, hogy lássa, honnan látszana egy torony vagy egy ember a gerincen.',
  color: 'Szín',
  strength: 'Erősség',
  strengthMeasured: 'Mérés szerint',
  strengthHint:
    'A réteget az árnyalja, hogy a talajból mennyit lát, ezért a szinte élből látott felületek nagyon halványak lesznek. A növelése a halvány végét emeli meg anélkül, hogy a többit ellaposítaná.',
  minOpacity: 'Legkisebb átlátszatlanság',
  minOpacityHint:
    'Milyen erősen jelenik meg a látható terep, akkor is, ha szinte élből látszik. 100%-on a réteg egyszerű sablon: látszik vagy nem, semmi közte.',
  update: 'Frissítés',
  outdated: 'A réteg az előző nézőpontból készült.',
  queued: ({ ahead }) =>
    ahead === 0
      ? 'Várakozás a renderelőre…'
      : ahead === 1
        ? 'Várakozás — egy számítás van előtte.'
        : `Várakozás — ${ahead} számítás van előtte.`,
  errors: {
    offline: 'A láthatóságot a kiszolgáló számítja, Ön pedig offline van.',
    unreachable:
      'A renderelő szolgáltatás nem érhető el. Lehet, hogy leállt, vagy valami az Ön és a szolgáltatás között blokkolja a kérést.',
    busy: 'A renderelő szolgáltatás jelenleg nem érhető el. Próbálja meg kis idő múlva.',
    tooMany:
      'Az utóbbi időben túl sok számítás készült. Próbálja meg később, vagy váltson prémiumra.',
    noData:
      'Ehhez a nézőponthoz nincs domborzati adat. Próbáljon máshová kattintani.',
    failed: 'A láthatóságot nem sikerült kiszámítani.',
  },
};

export default hu;
