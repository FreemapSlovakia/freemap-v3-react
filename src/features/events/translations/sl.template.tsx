import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { EventsMessages } from './EventsMessages.js';

const sl: DeepPartialWithRequiredObjects<EventsMessages> = {
  noEvents: 'Ni najdenih dogodkov',
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri nalaganju dogodkov', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri shranjevanju dogodka', err),
  coverError: ({ err }) =>
    addError(
      getMessages()!,
      'Dogodek je shranjen, njegova naslovna slika pa ne',
      err,
    ),
  newMapError: ({ err }) =>
    addError(
      getMessages()!,
      'Napaka pri shranjevanju novega zemljevida, zato tudi dogodek ni shranjen',
      err,
    ),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri brisanju dogodka', err),
  participationError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri shranjevanju vaše udeležbe', err),
  loginToParticipate:
    'Če želite sporočiti, da vas dogodek zanima ali da se ga boste udeležili, se prijavite.',
  difficulty: {
    easy: 'Lahka',
    moderate: 'Srednja',
    demanding: 'Zahtevna',
    expert: 'Zelo zahtevna',
  },
  notSaid: 'Ni navedeno',
  any: 'Katero koli',
  form: {
    newEvent: 'Nov dogodek',
    editEvent: 'Urejanje dogodka',
    organizer: 'Organizator',
    organizerPlaceholder: 'Vi — ali vnesite ime uporabnika',
    organizerHint:
      'Dogodek vnesete v imenu njegovega organizatorja: obstoječi račun ali novo ime, iz katerega nastane organizator brez prijave.',
    onlyOrganizer: 'Dogodek lahko spreminja le njegov organizator.',
    unavailable: 'Dogodka ni bilo mogoče naložiti — morda je bil izbrisan.',
    title: 'Naslov',
    description: 'Opis',
    contactHint:
      'Navedite, kako vas je mogoče doseči — telefon, e-pošto ali skupino v klepetu: dogodki zaenkrat nimajo razprave.',
    cover: 'Naslovna slika',
    coverTooLarge: 'Slika je večja od 20 MB.',
    start: 'Začetek',
    end: 'Konec',
    linkedMap: 'Povezan zemljevid',
    noMap: 'Brez',
    newMapFromContent: 'Nov zemljevid iz trenutne vsebine',
    noTripStats:
      'Zemljevid nima poti ali črt, iz katerih bi bilo mogoče vzeti podatke o izletu.',
    unsavedTitle: 'Neshranjene spremembe',
    unsavedMessage: ({ name }) =>
      `Odprti zemljevid »${name}« ima neshranjene spremembe. Jih želite shraniti in zemljevid povezati ali vsebino shraniti kot nov zemljevid?`,
    saveOpenMap: ({ name }) => `Shrani »${name}«`,
    newMap: 'Nov zemljevid',
    startPoint: 'Mesto začetka',
    setLocation: 'Nastavi položaj',
    transport: 'Prevoz',
    difficulty: 'Zahtevnost',
    dogs: 'Psi',
    dogsWelcome: 'Dobrodošli',
    dogsNotAllowed: 'Niso dovoljeni',
    children: 'Otroci',
    childrenSuitable: 'Primerno',
    childrenNotSuitable: 'Ni primerno',
    length: 'Dolžina',
    duration: 'Trajanje',
    ascent: 'Vzpon',
    descent: 'Spust',
    visibility: 'Vidnost',
    public: 'Javen',
    unlisted: 'Neobjavljen (le prek povezave)',
  },
  filter: {
    title: 'Filter dogodkov',
    date: 'Datum',
    dateHint:
      'Brez datuma začetka so prikazani le dogodki, ki se še niso končali.',
    near: 'V bližini',
    anywhere: 'Kjer koli',
    within: 'do',
    myLocation: 'Moj položaj',
    homePosition: 'Domači položaj',
    dogsWelcome: 'Psi dobrodošli',
    childrenSuitable: 'Primerno za otroke',
    from: 'od',
    to: 'do',
    unsaid: 'Vključno z dogodki, ki tega ne navajajo',
    unsaidHint:
      'Prevoz, zahtevnost, dolžina, trajanje in vzpon: prikazani so tudi dogodki, ki jih ne navajajo.',
    origin: 'Izvor',
    originHint:
      'Prevzeti dogodki se samodejno prevzemajo iz koledarjev organizacij, na primer planinskih društev. Njihovi organizatorji jih tukaj ne spremljajo; podrobnosti in spremembe najdete v viru, navedenem v opisu. Dogodke, vnesene tukaj, dodajajo njihovi organizatorji sami.',
    own: 'Vneseni tukaj',
    imported: 'Prevzeti',
  },
  card: {
    unlisted: 'Neobjavljen',
    dogsWelcome: 'Psi dobrodošli',
    noDogs: 'Brez psov',
    children: 'Primerno za otroke',
    noChildren: 'Ni primerno za otroke',
    importedNote: ({ source }) => (
      <>
        Dogodek je prevzet iz koledarja {source}; niti njegov organizator niti
        večina udeležencev ga tukaj ne spremlja.
      </>
    ),
  },
  list: {
    search: 'Iskanje v naslovih',
    inView: 'Samo v trenutnem pogledu',
    noMatch: 'Noben dogodek ne ustreza merilom.',
    sorts: {
      date: 'Po datumu',
      title: 'Po naslovu',
      lengthAsc: 'Od najkrajšega',
      lengthDesc: 'Od najdaljšega',
      ascentAsc: 'Od najmanjšega vzpona',
      ascentDesc: 'Od največjega vzpona',
      durationAsc: 'Od najkrajšega trajanja',
      durationDesc: 'Od najdaljšega trajanja',
      nearMap: 'Najbližje središču zemljevida',
      nearHome: 'Najbližje domu',
      nearPlace: 'Najbližje kraju iz filtra',
    },
  },
  selection: {
    backToEvents: 'Nazaj na dogodke',
    interested: 'Zanima me',
    going: 'Pridem',
    openInNewTab: 'Odpri v novem zavihku',
    loadHere: 'Naloži sem',
    deleteTitle: 'Izbriši dogodek',
    deleteMessage: ({ title }) =>
      `Želite izbrisati dogodek »${title}«? Povezan zemljevid ostane.`,
  },
  picking: {
    startPoint: 'Izberite mesto začetka',
    place: 'Izberite mesto',
  },
  menu: {
    filter: 'Filter',
    newEvent: 'Nov dogodek',
  },
  colorize: {
    by: 'Obarvaj po',
    none: 'Brez',
    legend: 'Legenda',
    modes: {
      when: 'Termin',
      mine: 'Moji in drugi',
      transport: 'Prevoz',
      distance: 'Dolžina',
      duration: 'Trajanje',
      ascent: 'Vzpon',
      difficulty: 'Zahtevnost',
      dogs: 'Psi',
      children: 'Otroci',
    },
    ended: 'Končani',
    happening: 'Poteka',
    several: 'Več',
    days: 'dni',
    mine: {
      mine: 'Moji',
      going: 'Pridem',
      interested: 'Zanima me',
      others: 'Drugi',
    },
    yes: 'Da',
    no: 'Ne',
  },
};

export default sl;
