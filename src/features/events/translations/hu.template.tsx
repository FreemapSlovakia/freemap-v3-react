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
      'Adja meg, hogyan lehet elérni Önt — telefonszám, e-mail vagy csevegőcsoport: az eseményekhez egyelőre nincs hozzászólási lehetőség.',
    cover: 'Borítókép',
    coverTooLarge: 'A kép nagyobb 20 MB-nál.',
    start: 'Kezdés',
    end: 'Befejezés',
    linkedMap: 'Kapcsolt térkép',
    noMap: 'Nincs',
    newMapFromContent: 'Új térkép a jelenlegi tartalomból',
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
    visibility: 'Láthatóság',
    public: 'Nyilvános',
    unlisted: 'Nem listázott (csak a hivatkozásával)',
  },
  filter: {
    title: 'Eseményszűrő',
    date: 'Dátum',
    dateHint:
      'Kezdő dátum nélkül csak a még be nem fejeződött események jelennek meg.',
    near: 'A közelben',
    anywhere: 'Bárhol',
    within: 'legfeljebb',
    myLocation: 'Saját hely',
    homePosition: 'Otthoni hely',
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
    unlisted: 'Nem listázott',
    dogsWelcome: 'Kutyával is',
    noDogs: 'Kutya nélkül',
    children: 'Gyerekeknek is alkalmas',
    noChildren: 'Gyerekeknek nem alkalmas',
    importedNote: ({ source }) => (
      <>
        Ez az esemény a(z) {source} naptárából származik; sem a szervezője, sem
        a résztvevők többsége nem követi itt.
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
      nearHome: 'Az otthonhoz legközelebb',
      nearPlace: 'A szűrő helyéhez legközelebb',
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
  menu: {
    filter: 'Szűrő',
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
  coverError: ({ err }) =>
    addError(
      getMessages()!,
      'Az esemény mentése sikerült, a borítóképé azonban nem',
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
  loginToParticipate:
    'Jelentkezzen be, ha jelezni szeretné, hogy érdekli az esemény vagy részt vesz rajta.',
  notSaid: 'Nincs megadva',
  any: 'Bármilyen',
};

export default hu;
