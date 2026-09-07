import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { GpsRecorderMessages } from './GpsRecorderMessages.js';

const sl: DeepPartialWithRequiredObjects<GpsRecorderMessages> = {
  record: 'Snemaj',
  pause: 'Začasno ustavi',
  stop: 'Končaj',
  connect: 'Poveži',
  install: 'Namesti snemalnik',
  update: 'Posodobi snemalnik',
  delete: 'Izbriši posnetek',
  settings: 'Nastavitve snemanja',
  details: 'Podrobnosti posnetka',
  pinHint: 'Označene vrednosti se prikažejo tudi v orodni vrstici.',
  state: {
    recording: 'Snemanje',
    stopped: 'Ustavljeno',
    unknown: 'Ni povezave',
  },
  connection: {
    connecting: 'Povezovanje s snemalnikom…',
    syncing: 'Nalaganje sledi…',
    live: 'V živo',
    reconnecting: 'Ponovno povezovanje…',
    offline: 'Brez pogleda v živo',
  },
  stats: {
    distance: 'Razdalja',
    duration: 'Trajanje',
    elevation: 'Nadmorska višina',
    ascent: 'Vzpon',
    speed: 'Hitrost',
    avgSpeed: 'Povprečna hitrost',
    accuracy: 'Natančnost',
    satellites: 'Sateliti',
    points: 'Točke',
    segments: 'Odseki',
    lastFix: 'Zadnja meritev',
  },
  stopModal: {
    title: 'Končati snemanje?',
    runningMessage: ({ tool }) => (
      <>
        Snemanje še vedno teče. Z zaključkom se ustavi in sled se prenese v
        orodje <b>{tool}</b>. V snemalniku ne ostane nič, zato bo naslednje
        snemanje začelo novo sled.
      </>
    ),
    stoppedMessage: ({ tool }) => (
      <>
        Sled se prenese v orodje <b>{tool}</b> in v snemalniku ne ostane nič,
        zato bo naslednje snemanje začelo novo sled.
      </>
    ),
    confirm: 'Končaj',
  },
  deleteModal: {
    title: 'Izbrisati posnetek?',
    message:
      'Snemalnik zavrže celotno svojo sled. Tega dejanja ni mogoče ' +
      'razveljaviti. Če želite posnetek obdržati, ga raje končajte.',
    confirm: 'Izbriši',
  },
  setup: {
    summary: ({ items }) => (
      <>
        Snemalnik morda ne bo preživel dolgega snemanja:
        <ul className="mb-0 ps-4">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </>
    ),
    permissionFine: 'Natančna lokacija ni dovoljena.',
    permissionBackground:
      'Lokacija v ozadju ni dovoljena, zato se snemanje ustavi, ko ' +
      'aplikacija ni v ospredju.',
    permissionNotifications:
      'Obvestila niso dovoljena, zato lahko Android ustavi storitev snemanja.',
    battery:
      'Snemalnik je podvržen optimizaciji baterije, zato ga lahko Android ustavi.',
    oem: ({ vendor }) =>
      `Naprave ${vendor} omejujejo aplikacije v ozadju bolj, kot zahtevajo ` +
      `Androidova pravila, ustrezen korak v snemalniku pa ni potrjen.`,
    open: 'Odpri snemalnik',
  },
  errors: {
    unreachable: 'Snemalnik se ni odzval — morda ne teče.',
    lnaDenied:
      'Brskalnik je zavrnil dostop do lokalnega omrežja, zato pogled v živo ' +
      'ni na voljo. Na samo snemanje to ne vpliva.',
    setupNeeded:
      'Snemalnik še ne more snemati — odprite ga in dovolite, kar zahteva.',
    recording: 'Pred brisanjem sledi ustavite snemanje.',
    incomplete:
      'Del posnetka še ni prispel na to stran, zato ni bilo nič prevzeto in ' +
      'nič izbrisano. Znova se povežite in poskusite končati.',
    notStored:
      'Posnetka ni bilo mogoče shraniti v tem brskalniku, zato je ostal v ' +
      'snemalniku. Imate ga med sledmi — od tam ga izvozite ali shranite.',
    notPersisted:
      'Ta brskalnik ni zagotovil, da bo ohranil svojo shrambo, zato je ' +
      'posnetek ostal v snemalniku. Imate ga med sledmi — izvozite ali ' +
      'shranite ga, nato pa posnetek izbrišite.',
    needsForeground:
      'Android snemalniku ni dovolil zagona iz ozadja. Odprite ga in snemanje ' +
      'začnite v njem ali pa mu dovolite delovanje brez omejitev baterije, da ' +
      'ga bo mogoče zagnati od tu.',
    outdated: 'Snemalnik je za to različico zemljevida prestar.',
    http: 'Snemalnik je odgovoril z napako.',
    protocol: 'Snemalnik je odgovoril z nečim nepričakovanim.',
    unknown: 'Komunikacija s snemalnikom je spodletela.',
  },
  settingsModal: {
    title: 'Nastavitve snemanja',
    recorderSection: 'Kaj se snema',
    recorderIntro:
      'Snemalnik jih uporabi ob začetku snemanja, zato njihova sprememba ne ' +
      'vpliva na že tekoči posnetek.',
    intervalMs: 'Čas med meritvami',
    minDistanceM: 'Najmanjša razdalja med meritvami',
    maxAccuracyM: 'Zavrzi meritve, manj natančne od',
    maxAccuracyOff: 'Ohrani vse meritve',
    source: 'Vir položaja',
    sourceGps: 'Sprejemnik GPS',
    sourceFused: 'Združeni (GPS, wifi in senzorji)',
    sourceHint:
      'Sprejemnik izmeri nadmorsko višino pri vsaki meritvi; združeni vir vas ' +
      'bolje umesti med stavbami in pod drevesi, a isto višino ponavlja tudi ' +
      'po več sekund.',
    priority: 'Natančnost',
    priorityHigh: 'Najvišja (GPS, največ baterije)',
    priorityBalanced: 'Uravnotežena',
    priorityLow: 'Nizka (najmanj baterije)',
    priorityFusedOnly: 'Velja samo za združeni vir.',
    displaySection: 'Prikaz',
    splitGapS: 'Začni nov odsek po premoru',
    splitGapOff: 'Nikoli ne deli',
    splitGapHint:
      'Premor, daljši od tega, se nariše in izvozi kot vrzel, ne kot ravna ' +
      'črta čez njo.',
    feedLocation: 'Uporabi posnetek za »Kje sem?«',
    feedLocationHint:
      'Med snemanjem »Kje sem?« prikazuje zabeležene točke, namesto da bi ' +
      'brskalnik GPS spremljal ločeno.',
    keepScreenAwake: 'Med snemanjem naj zaslon ostane prižgan',
  },
};

export default sl;
