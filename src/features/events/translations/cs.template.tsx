import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { EventsMessages } from './EventsMessages.js';

const cs: DeepPartialWithRequiredObjects<EventsMessages> = {
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Chyba při načítání akcí', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Chyba při ukládání akce', err),
  coverError: ({ err }) =>
    addError(
      getMessages()!,
      'Akce je uložena, ale její titulní obrázek ne',
      err,
    ),
  newMapError: ({ err }) =>
    addError(
      getMessages()!,
      'Chyba při ukládání nové mapy, akce proto není uložena',
      err,
    ),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Chyba při mazání akce', err),
  difficulty: {
    easy: 'Lehká',
    moderate: 'Střední',
    demanding: 'Náročná',
    expert: 'Expertní',
  },
  form: {
    newEvent: 'Nová akce',
    editEvent: 'Úprava akce',
    organizer: 'Organizátor',
    organizerPlaceholder: 'Vy — nebo zadejte jméno uživatele',
    organizerHint:
      'Akci zadáte za jejího organizátora: existující účet, nebo nové jméno, ze kterého vznikne organizátor bez přihlášení.',
    onlyOrganizer: 'Akci může měnit pouze její organizátor.',
    unavailable: 'Akci se nepodařilo načíst — možná byla smazána.',
    title: 'Název',
    description: 'Popis',
    contactHint:
      'Uveďte, jak vás zastihnout — telefon, e-mail nebo skupinu v chatu: akce zatím nemají diskusi.',
    cover: 'Titulní obrázek',
    coverTooLarge: 'Obrázek je větší než 20 MB.',
    start: 'Začátek',
    end: 'Konec',
    endHint: 'Nezadaný konec znamená do konce dne.',
    endBeforeStart: 'Konec je před začátkem.',
    dateOnly: 'Pouze data, bez času',
    linkedMap: 'Propojená mapa',
    noMap: 'Žádná',
    newMapFromContent: 'Nová mapa z aktuálního obsahu',
    noTripStats:
      'Mapa nemá trasu ani čáry, ze kterých by se daly vzít údaje o túře.',
    unsavedTitle: 'Neuložené změny',
    unsavedMessage: ({ name }) =>
      `Otevřená mapa „${name}“ má neuložené změny. Uložit je a propojit ji, nebo uložit obsah jako novou mapu?`,
    saveOpenMap: ({ name }) => `Uložit „${name}“`,
    newMap: 'Nová mapa',
    startPoint: 'Místo začátku',
    setLocation: 'Nastavit polohu',
    transport: 'Doprava',
    difficulty: 'Náročnost',
    dogs: 'Psi',
    dogsWelcome: 'Vítáni',
    dogsNotAllowed: 'Nepovoleni',
    children: 'Děti',
    childrenSuitable: 'Vhodné',
    childrenNotSuitable: 'Nevhodné',
    length: 'Délka',
    duration: 'Trvání',
    ascent: 'Stoupání',
    descent: 'Klesání',
  },
  filter: {
    title: 'Filtr akcí',
    date: 'Datum',
    dateHint: 'Bez data začátku se zobrazí pouze akce, které ještě neskončily.',
    near: 'V okolí',
    anywhere: 'Kdekoli',
    within: 'do',
    myLocation: 'Moje poloha',
    homePosition: 'Domovská poloha',
    dogsWelcome: 'Psi vítáni',
    childrenSuitable: 'Vhodné pro děti',
    from: 'od',
    to: 'do',
    unsaid: 'Včetně akcí, které to nemají uvedeno',
    unsaidHint:
      'Doprava, náročnost, délka, trvání a stoupání: akce, které je neuvádějí, se zobrazí také.',
    origin: 'Původ',
    originHint:
      'Převzaté akce se automaticky přebírají z kalendářů organizací, například turistických klubů. Jejich pořadatelé je zde nesledují; podrobnosti a změny najdete ve zdroji uvedeném v popisu. Akce zadané zde přidávají sami jejich pořadatelé.',
    own: 'Zadané zde',
    imported: 'Převzaté',
  },
  card: {
    dogsWelcome: 'Psi vítáni',
    noDogs: 'Bez psů',
    children: 'Vhodné pro děti',
    noChildren: 'Nevhodné pro děti',
    importedNote: ({ source }) => (
      <>
        Akce je převzatá z kalendáře {source}; její pořadatel ani většina
        účastníků ji tu nesledují.
      </>
    ),
  },
  list: {
    search: 'Hledat v názvech',
    inView: 'Jen v aktuálním zobrazení',
    noMatch: 'Žádná akce neodpovídá kritériím.',
    sorts: {
      date: 'Podle data',
      title: 'Podle názvu',
      lengthAsc: 'Od nejkratší',
      lengthDesc: 'Od nejdelší',
      ascentAsc: 'Od nejmenšího stoupání',
      ascentDesc: 'Od největšího stoupání',
      durationAsc: 'Od nejkratšího trvání',
      durationDesc: 'Od nejdelšího trvání',
      nearMap: 'Nejblíže ke středu mapy',
      nearHome: 'Nejblíže k domovu',
      nearPlace: 'Nejblíže k místu z filtru',
      interestedDesc: 'Od největšího zájmu',
      goingDesc: 'Od největší účasti',
    },
    show: 'Zobrazeno v řádcích',
    interestedCount: 'Mají zájem',
    goingCount: 'Zúčastní se',
    distanceFrom: {
      nearMap: 'Vzdálenost od středu mapy',
      nearHome: 'Vzdálenost od domova',
      nearPlace: 'Vzdálenost od místa z filtru',
    },
  },
  selection: {
    backToEvents: 'Zpět na akce',
    interested: 'Mám zájem',
    going: 'Přijdu',
    openInNewTab: 'Otevřít na nové kartě',
    loadHere: 'Načíst sem',
    deleteTitle: 'Smazat akci',
    deleteMessage: ({ title }) =>
      `Smazat akci „${title}“? Propojená mapa zůstane.`,
  },
  picking: {
    startPoint: 'Vyberte místo začátku',
    place: 'Vyberte místo',
  },
  menu: {
    filter: 'Filtr',
    newEvent: 'Nová akce',
  },
  colorize: {
    modes: {
      when: 'Termín',
      mine: 'Moje a ostatní',
      transport: 'Doprava',
      distance: 'Délka',
      duration: 'Trvání',
      ascent: 'Stoupání',
      difficulty: 'Náročnost',
      dogs: 'Psi',
      children: 'Děti',
    },
    mine: {
      mine: 'Moje',
      going: 'Přijdu',
      interested: 'Mám zájem',
      others: 'Ostatní',
    },
    by: 'Vybarvit podle',
    none: 'Žádné',
    legend: 'Legenda',
    ended: 'Skončené',
    happening: 'Probíhá',
    several: 'Několik',
    days: 'dny',
    yes: 'Ano',
    no: 'Ne',
  },
  noEvents: 'Nenašly se žádné akce',
  participationError: ({ err }) =>
    addError(getMessages()!, 'Chyba při ukládání vaší účasti', err),
  loginToParticipate:
    'Chcete-li dát vědět, že máte zájem nebo přijdete, přihlaste se.',
  notSaid: 'Neuvedeno',
  any: 'Jakékoli',
};

export default cs;
