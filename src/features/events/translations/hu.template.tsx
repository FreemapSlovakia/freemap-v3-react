import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { EventsMessages } from './EventsMessages.js';

const hu: DeepPartialWithRequiredObjects<EventsMessages> = {
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Hiba az események betöltésekor', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Hiba az esemény mentésekor', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Hiba az esemény törlésekor', err),
  difficulty: {
    easy: 'Könnyű',
    moderate: 'Közepes',
    demanding: 'Nehéz',
    expert: 'Szakértői',
  },
  form: {
    newEvent: 'Új esemény',
    editEvent: 'Esemény szerkesztése',
    organizer: 'Szervező',
    organizerPlaceholder: 'Ön — vagy írja be egy felhasználó nevét',
    organizerHint:
      'Az eseményt a szervezője nevében adja meg: egy meglévő fiókot, vagy egy új nevet, amelyből bejelentkezés nélküli szervező lesz.',
    onlyOrganizer: 'Az eseményt csak a szervezője módosíthatja.',
    unavailable: 'Az esemény nem tölthető be — lehet, hogy törölték.',
    title: 'Cím',
    description: 'Leírás',
    contactHint:
      'Adja meg, hogyan lehet elérni Önt — telefonszám, e-mail vagy csevegőcsoport.',
    cover: 'Borítókép',
    coverTooLarge: 'A kép nagyobb 20 MB-nál.',
    start: 'Kezdés',
    end: 'Befejezés',
    linkedMap: 'Kapcsolt térkép',
    noMap: 'Nincs',
    newMapFromContent: 'Új térkép a jelenlegi tartalomból',
    replaceMapFromContent: 'A térkép cseréje a jelenlegi tartalomra',
    noTripStats:
      'A térképen nincs útvonal vagy vonal, amelyből a túra adatai kinyerhetők lennének.',
    unsavedTitle: 'Nem mentett változtatások',
    unsavedMessage: ({ name }) =>
      `A megnyitott „${name}” térképen nem mentett változtatások vannak. Menti őket és kapcsolja a térképet, vagy a tartalmat új térképként menti?`,
    saveOpenMap: ({ name }) => `„${name}” mentése`,
    newMap: 'Új térkép',
    startPoint: 'Kiindulópont',
    setLocation: 'Hely beállítása',
    transport: 'Közlekedés',
    difficulty: 'Nehézség',
    dogs: 'Kutyák',
    dogsWelcome: 'Szívesen látottak',
    dogsNotAllowed: 'Nem engedélyezettek',
    children: 'Gyerekek',
    childrenSuitable: 'Alkalmas',
    childrenNotSuitable: 'Nem alkalmas',
    length: 'Hossz',
    duration: 'Időtartam',
    ascent: 'Emelkedés',
    descent: 'Ereszkedés',
  },
  filter: {
    title: 'Eseményszűrő',
    date: 'Dátum',
    dateHint:
      'Kezdő dátum nélkül csak a még be nem fejeződött események jelennek meg.',
    periods: {
      dates: 'Dátumok',
      '1w': '1 hét',
      '2w': '2 hét',
      '1m': '1 hónap',
      '3m': '3 hónap',
    },
    near: 'A közelben',
    anywhere: 'Bárhol',
    within: 'legfeljebb',
    myLocation: 'Saját hely',
    dogsWelcome: 'Kutyával is',
    childrenSuitable: 'Gyerekeknek is alkalmas',
    from: 'ettől:',
    to: 'eddig:',
    unsaid: 'Azokkal az eseményekkel együtt, amelyek ezt nem adják meg',
    unsaidHint:
      'Közlekedés, nehézség, hossz, időtartam és emelkedés: azok az események is megjelennek, amelyek ezeket nem adják meg.',
    origin: 'Eredet',
    originHint:
      'Az átvett eseményeket automatikusan vesszük át szervezetek, például túraegyesületek naptáraiból. Szervezőik itt nem követik őket; a részletek és a változások a leírásban megadott forrásban találhatók. Az itt rögzített eseményeket maguk a szervezőik adják hozzá.',
    own: 'Itt rögzített',
    imported: 'Átvett',
  },
  card: {
    dogsWelcome: 'Kutyával is',
    noDogs: 'Kutya nélkül',
    children: 'Gyerekeknek is alkalmas',
    noChildren: 'Gyerekeknek nem alkalmas',
    importedNote: ({ source }) => (
      <>
        Ez az esemény a(z) {source} naptárából származik; sem a szervezője, sem
        a résztvevők többsége nem követi itt, és a hozzászólásokat sem olvassák.
        Elérhetőséget a leírás végén hivatkozott forrásoldalon talál.
      </>
    ),
  },
  list: {
    search: 'Keresés a címekben',
    inView: 'Csak az aktuális nézetben',
    noMatch: 'Nincs a feltételeknek megfelelő esemény.',
    sorts: {
      date: 'Dátum szerint',
      title: 'Cím szerint',
      lengthAsc: 'A legrövidebbtől',
      lengthDesc: 'A leghosszabbtól',
      ascentAsc: 'A legkisebb emelkedéstől',
      ascentDesc: 'A legnagyobb emelkedéstől',
      durationAsc: 'A legrövidebb időtartamtól',
      durationDesc: 'A leghosszabb időtartamtól',
      nearMap: 'A térkép közepéhez legközelebb',
      nearHome: 'A saját helyeimhez legközelebb',
      nearPlace: 'A szűrő helyéhez legközelebb',
      interestedDesc: 'Legtöbb érdeklődő elöl',
      goingDesc: 'Legtöbb résztvevő elöl',
    },
    show: 'A sorokban látható',
    interestedCount: 'Érdeklődők',
    goingCount: 'Résztvevők',
    distanceFrom: {
      nearMap: 'Távolság a térkép közepétől',
      nearHome: 'Távolság a legközelebbi saját helytől',
      nearPlace: 'Távolság a szűrő helyétől',
    },
  },
  selection: {
    backToEvents: 'Vissza az eseményekhez',
    interested: 'Érdekel',
    going: 'Részt veszek',
    openInNewTab: 'Megnyitás új lapon',
    loadHere: 'Betöltés ide',
    deleteTitle: 'Esemény törlése',
    deleteMessage: ({ title }) =>
      `Törli a(z) „${title}” eseményt? A kapcsolt térkép megmarad.`,
  },
  picking: {
    startPoint: 'Válassza ki a kiindulópontot',
    place: 'Válassza ki a helyet',
  },
  savedFilters: {
    savedFilter: 'Mentett szűrő',
    dontSave: '— nincs mentés',
    newFilter: 'Új mentett szűrő',
    name: 'Név',
    notify: 'A szűrőnek megfelelő események küldése e-mailben',
    saveAndApply: 'Mentés és alkalmazás',
    datesWarning:
      'A rögzített dátumok nem kerülnek mentésre: a mentett szűrő minden közelgő eseményre vonatkozik. A tartomány megtartásához válasszon inkább időszakot.',
    delete: 'Törlés',
    deleteTitle: 'Mentett szűrő törlése',
    deleteMessage: ({ name }) => `Törli a(z) „${name}” mentett szűrőt?`,
  },
  menu: {
    filter: 'Szűrő',
    clearFilter: 'Szűrés megszüntetése',
    newEvent: 'Új esemény',
  },
  colorize: {
    modes: {
      when: 'Időpont',
      mine: 'Saját és egyéb',
      transport: 'Közlekedés',
      distance: 'Hossz',
      duration: 'Időtartam',
      ascent: 'Emelkedés',
      difficulty: 'Nehézség',
      dogs: 'Kutyák',
      children: 'Gyerekek',
    },
    mine: {
      mine: 'Saját',
      going: 'Részt veszek',
      interested: 'Érdekel',
      others: 'Egyéb',
    },
    by: 'Színezés eszerint',
    none: 'Nincs',
    legend: 'Jelmagyarázat',
    ended: 'Befejeződött',
    happening: 'Folyamatban',
    several: 'Több',
    days: 'nap',
    yes: 'Igen',
    no: 'Nem',
  },
  noEvents: 'Nincsenek események',
  mapEvents: 'Események ezzel a térképpel',
  coverError: ({ err }) =>
    addError(
      getMessages()!,
      'Az esemény mentése sikerült, a borítóképé azonban nem',
      err,
    ),
  replaceMapError: ({ err }) =>
    addError(
      getMessages()!,
      'Hiba az esemény térképének cseréjekor, ezért az esemény sincs mentve',
      err,
    ),
  newMapError: ({ err }) =>
    addError(
      getMessages()!,
      'Hiba az új térkép mentésekor, ezért az esemény sincs mentve',
      err,
    ),
  participationError: ({ err }) =>
    addError(getMessages()!, 'Hiba a részvétel mentésekor', err),
  savedFilterError: ({ err }) =>
    addError(getMessages()!, 'Hiba a szűrő mentésekor', err),
  savedFiltersFull: () => 'Legfeljebb 20 szűrő menthető.',
  loginToParticipate:
    'Jelentkezzen be, ha jelezni szeretné, hogy érdekli az esemény vagy részt vesz rajta.',
  notSaid: 'Nincs megadva',
  any: 'Bármilyen',
};

export default hu;
