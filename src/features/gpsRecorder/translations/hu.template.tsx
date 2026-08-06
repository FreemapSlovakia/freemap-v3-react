import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { GpsRecorderMessages } from './GpsRecorderMessages.js';

const hu: DeepPartialWithRequiredObjects<GpsRecorderMessages> = {
  record: 'Rögzítés',
  pause: 'Szünet',
  stop: 'Befejezés',
  connect: 'Csatlakozás',
  install: 'Rögzítő telepítése',
  update: 'Rögzítő frissítése',
  delete: 'Felvétel törlése',
  settings: 'Rögzítési beállítások',
  details: 'Felvétel részletei',
  recordInBrowser: 'Rögzítés ebben a böngészőben',
  browserBadge: 'Ebben a böngészőben',
  browserWarning:
    'A rögzítés ebben a böngészőben történik. Leáll, ha a képernyő lezáródik ' +
    'vagy elhagyja ezt az oldalt, ezért az egész út alatt hagyja nyitva az ' +
    'oldalt és bekapcsolva a képernyőt.',
  browserNoStorage:
    'A rögzítés ebben a böngészőben történik, de a felvételt nem menti el — ' +
    'az oldal újratöltésével vagy bezárásával elveszíti. Ha meg szeretné ' +
    'tartani, fejezze be a rögzítést.',
  state: {
    recording: 'Rögzítés folyamatban',
    stopped: 'Leállítva',
    unknown: 'Nincs csatlakoztatva',
  },
  connection: {
    connecting: 'Csatlakozás a rögzítőhöz…',
    syncing: 'Nyomvonal betöltése…',
    live: 'Élő',
    reconnecting: 'Újracsatlakozás…',
    offline: 'Nincs élő nézet',
  },
  stats: {
    distance: 'Távolság',
    duration: 'Időtartam',
    elevation: 'Magasság',
    ascent: 'Emelkedés',
    speed: 'Sebesség',
    avgSpeed: 'Átlagsebesség',
    accuracy: 'Pontosság',
    satellites: 'Műholdak',
    points: 'Pontok',
    segments: 'Szakaszok',
    lastFix: 'Utolsó mérés',
  },
  stopModal: {
    title: 'Befejezi a felvételt?',
    message: ({ tool }) => (
      <>
        A rögzítés még fut. A befejezés leállítja, a nyomvonal pedig átkerül
        a(z) <b>{tool}</b> eszközbe. A rögzítőben semmi sem marad, így a
        következő felvétel új nyomvonalat kezd.
      </>
    ),
    confirm: 'Befejezés',
  },
  deleteModal: {
    title: 'Törli a felvételt?',
    message:
      'A rögzítő eldobja a teljes nyomvonalát. Ezt a műveletet nem lehet ' +
      'visszavonni. Ha meg szeretné tartani a felvételt, inkább fejezze be.',
    confirm: 'Törlés',
  },
  setup: {
    summary: ({ items }) => (
      <>
        Előfordulhat, hogy a rögzítő nem éli túl a hosszú felvételt:
        <ul className="mb-0 ps-4">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </>
    ),
    permissionFine: 'A pontos helymeghatározás nincs engedélyezve.',
    permissionBackground:
      'A háttérben történő helymeghatározás nincs engedélyezve, ezért a ' +
      'rögzítés leáll, amikor az alkalmazás nincs előtérben.',
    permissionNotifications:
      'Az értesítések nincsenek engedélyezve, ezért az Android leállíthatja a rögzítési szolgáltatást.',
    battery:
      'A rögzítőre vonatkozik az akkumulátoroptimalizálás, ezért az Android leállíthatja.',
    oem: ({ vendor }) =>
      `A(z) ${vendor} készülékek az Android saját szabályain túl is ` +
      `korlátozzák a háttéralkalmazásokat, és a rögzítő erre vonatkozó lépése nincs megerősítve.`,
    open: 'Rögzítő megnyitása',
  },
  errors: {
    unreachable: 'A rögzítő nem válaszolt — lehet, hogy nem fut.',
    lnaDenied:
      'A böngésző megtagadta a helyi hálózat elérését, ezért az élő nézet nem ' +
      'érhető el. Magát a rögzítést ez nem érinti.',
    setupNeeded:
      'A rögzítő még nem tud rögzíteni — nyissa meg, és adja meg neki, amit kér.',
    recording: 'A nyomvonal törlése előtt állítsa le a rögzítést.',
    incomplete:
      'A felvétel egy része még nem érkezett meg erre az oldalra, ezért semmi ' +
      'sem került át és semmi sem törlődött. Csatlakozzon újra, és fejezze be ismét.',
    notStored:
      'A felvételt nem sikerült elmenteni ebben a böngészőben, ezért a ' +
      'rögzítőn maradt. Megtalálja a nyomvonalai között — onnan exportálja ' +
      'vagy mentse el.',
    notPersisted:
      'Ez a böngésző nem ígérte meg, hogy megőrzi a tárhelyét, ezért a ' +
      'felvétel a rögzítőn maradt. Megtalálja a nyomvonalai között — ' +
      'exportálja vagy mentse el, majd törölje a felvételt.',
    needsForeground:
      'Az Android nem engedte, hogy a rögzítő a háttérből induljon el. Nyissa ' +
      'meg, és ott indítsa el a rögzítést, vagy engedélyezze neki az ' +
      'akkumulátoros korlátozások nélküli működést, hogy innen is elindítható legyen.',
    outdated: 'A rögzítő túl régi a térkép ehhez a verziójához.',
    locationDenied:
      'Ez az oldal nem használhatja a helyzetét. Engedélyezze a böngésző ' +
      'beállításaiban ehhez az oldalhoz, majd indítsa újra a rögzítést.',
    locationUnavailable: 'Ez a böngésző nem tudja megállapítani a helyzetét.',
    http: 'A rögzítő hibával válaszolt.',
    protocol: 'A rögzítő valami váratlannal válaszolt.',
    unknown: 'A rögzítővel való kommunikáció sikertelen volt.',
  },
  settingsModal: {
    title: 'Rögzítési beállítások',
    backend: 'Mi rögzítsen',
    backendApp: 'A rögzítő alkalmazás',
    backendBrowser: 'Ez a böngésző',
    backendHint:
      'Az alkalmazás kikapcsolt képernyő mellett is rögzít, és minden ' +
      'mérésnél megméri a magasságot. Ez a böngésző nyitott oldalt és ' +
      'bekapcsolt képernyőt igényel, de nem kell telepíteni.',
    backendLockedHint:
      'Futó rögzítés közben nem módosítható. Előbb szüneteltesse vagy fejezze be.',
    recorderSection: 'Mi kerül rögzítésre',
    recorderIntro:
      'A rögzítő a felvétel indításakor alkalmazza őket, ezért módosításuk ' +
      'nem érinti a már futó felvételt.',
    browserIntro:
      'A felvétel indításakor lépnek életbe, ezért módosításuk nem érinti a ' +
      'már futó felvételt. A böngésző maga dönti el, milyen gyakran jelenti a ' +
      'pozíciót, így ezek inkább korlátok, mint utasítások.',
    intervalMs: 'Mérések közötti idő',
    minDistanceM: 'Mérések közötti legkisebb távolság',
    maxAccuracyM: 'Mérések eldobása, ha pontatlanabbak mint',
    maxAccuracyOff: 'Minden mérés megtartása',
    source: 'Pozíció forrása',
    sourceGps: 'GPS-vevő',
    sourceFused: 'Kombinált (GPS, wifi és érzékelők)',
    sourceHint:
      'A vevő minden mérésnél megméri a magasságot; a kombinált forrás ' +
      'épületek között és fák alatt pontosabban helyezi el Önt, de ugyanazt a ' +
      'magasságot akár másodpercekig ismétli.',
    priority: 'Pontosság',
    priorityHigh: 'Legnagyobb (GPS, legtöbb akkumulátor)',
    priorityBalanced: 'Kiegyensúlyozott',
    priorityLow: 'Alacsony (legkevesebb akkumulátor)',
    priorityFusedOnly: 'Csak a kombinált forrásra vonatkozik.',
    displaySection: 'Megjelenítés',
    splitGapS: 'Új szakasz kezdése ekkora szünet után',
    splitGapOff: 'Soha ne ossza fel',
    splitGapHint:
      'Az ennél hosszabb szünet hézagként jelenik meg és úgy is exportálódik, ' +
      'nem pedig rajta átvezető egyenes vonalként.',
    feedLocation: 'A felvétel használata a „Saját pozícióm” funkcióhoz',
    feedLocationHint:
      'Rögzítés közben a „Saját pozícióm” a rögzített pontokat mutatja ' +
      'ahelyett, hogy a böngésző külön követné a GPS-t.',
    keepScreenAwake: 'A képernyő maradjon bekapcsolva rögzítés közben',
  },
};

export default hu;
