import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ViewshedMessages } from './ViewshedMessages.js';

const sl: DeepPartialWithRequiredObjects<ViewshedMessages> = {
  pickViewpoint: 'Izberi na zemljevidu',
  locate: 'Vidnost z mojega položaja',
  pickViewpointPrompt: 'Kliknite na zemljevid tja, od koder želite gledati',
  detail: 'Kakovost / hitrost',
  details: {
    superfast: 'Najnižja / najhitrejša',
    fast: 'Nizka / hitra',
    standard: 'Standardna',
    detailed: 'Podrobna / počasna',
    finest: 'Najfinejša / najpočasnejša',
  },
  settings: 'Nastavitve vidnosti',
  targetHeight: 'Višina cilja',
  targetHeightHint:
    'Kako visoko je to, kar gledate — dvignite, da vidite, od kod bi bil viden stolp ali človek na grebenu.',
  color: 'Barva',
  strength: 'Izrazitost',
  strengthMeasured: 'Kakor izmerjeno',
  strengthHint:
    'Sloj je obarvan glede na to, koliko tal vidite, zato površine, gledane skoraj od strani, izpadejo zelo blede. Povečanje dvigne bledi konec, ne da bi poravnalo ostalo.',
  minOpacity: 'Najmanjša prekrivnost',
  minOpacityHint:
    'Kako močno je izrisano vidno površje, tudi če ga vidite skoraj od strani. Pri 100 % je sloj le šablona: vidno ali ne, nič vmes.',
  update: 'Posodobi',
  outdated: 'Sloj je s prejšnjega razgledišča.',
  queued: ({ ahead }) =>
    ahead === 0
      ? 'Čakanje na izrisovalnik…'
      : ahead === 1
        ? 'Čakanje — pred vami je 1 izračun.'
        : ahead < 5
          ? `Čakanje — pred vami so ${ahead} izračuni.`
          : `Čakanje — pred vami je ${ahead} izračunov.`,
  errors: {
    offline: 'Vidnost izračuna strežnik, vi pa ste brez povezave.',
    unreachable:
      'Izrisovalne storitve ni bilo mogoče doseči. Morda ne deluje ali pa nekaj med vami in njo zavrača zahtevo.',
    busy: 'Izrisovalna storitev trenutno ni na voljo. Poskusite čez trenutek.',
    tooMany:
      'V zadnjem času je bilo izračunov preveč. Poskusite pozneje ali si omislite premij.',
    noData:
      'Za to razgledišče ni podatkov o površju. Poskusite klikniti drugam.',
    failed: 'Vidnosti ni bilo mogoče izračunati.',
  },
};

export default sl;
