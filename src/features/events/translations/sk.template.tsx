import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { EventsMessages } from './EventsMessages.js';

const sk: DeepPartialWithRequiredObjects<EventsMessages> = {
  noEvents: 'Nenašli sa žiadne akcie',
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Chyba pri načítavaní akcií', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Chyba pri ukladaní akcie', err),
  coverError: ({ err }) =>
    addError(
      getMessages()!,
      'Akcia je uložená, ale jej titulný obrázok nie',
      err,
    ),
  newMapError: ({ err }) =>
    addError(
      getMessages()!,
      'Chyba pri ukladaní novej mapy, akcia preto nie je uložená',
      err,
    ),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Chyba pri mazaní akcie', err),
  participationError: ({ err }) =>
    addError(getMessages()!, 'Chyba pri ukladaní vašej účasti', err),
  loginToParticipate:
    'Ak chcete dať vedieť, že máte záujem alebo prídete, prihláste sa.',
  difficulty: {
    easy: 'Ľahká',
    moderate: 'Stredná',
    demanding: 'Náročná',
    expert: 'Expertná',
  },
  notSaid: 'Neuvedené',
  any: 'Akékoľvek',
  form: {
    newEvent: 'Nová akcia',
    editEvent: 'Úprava akcie',
    organizer: 'Organizátor',
    organizerPlaceholder: 'Vy — alebo zadajte meno používateľa',
    organizerHint:
      'Akciu zadáte za jej organizátora: existujúci účet, alebo nové meno, z ktorého vznikne organizátor bez prihlásenia.',
    onlyOrganizer: 'Akciu môže meniť iba jej organizátor.',
    unavailable: 'Akciu sa nepodarilo načítať — možno bola zmazaná.',
    title: 'Názov',
    description: 'Popis',
    contactHint:
      'Uveďte, ako vás zastihnúť — telefón, e-mail alebo skupinu v chate: akcie zatiaľ nemajú diskusiu.',
    cover: 'Titulný obrázok',
    coverTooLarge: 'Obrázok je väčší ako 20 MB.',
    start: 'Začiatok',
    end: 'Koniec',
    endHint: 'Nezadaný koniec znamená do konca dňa.',
    endBeforeStart: 'Koniec je pred začiatkom.',
    dateOnly: 'Iba dátumy, bez času',
    linkedMap: 'Prepojená mapa',
    noMap: 'Žiadna',
    newMapFromContent: 'Nová mapa z aktuálneho obsahu',
    noTripStats:
      'Mapa nemá trasu ani čiary, z ktorých by sa dali vziať údaje o túre.',
    unsavedTitle: 'Neuložené zmeny',
    unsavedMessage: ({ name }) =>
      `Otvorená mapa „${name}“ má neuložené zmeny. Uložiť ich a prepojiť ju, alebo uložiť obsah ako novú mapu?`,
    saveOpenMap: ({ name }) => `Uložiť „${name}“`,
    newMap: 'Nová mapa',
    startPoint: 'Miesto začiatku',
    setLocation: 'Nastaviť pozíciu',
    transport: 'Doprava',
    difficulty: 'Náročnosť',
    dogs: 'Psy',
    dogsWelcome: 'Vítané',
    dogsNotAllowed: 'Nepovolené',
    children: 'Deti',
    childrenSuitable: 'Vhodné',
    childrenNotSuitable: 'Nevhodné',
    length: 'Dĺžka',
    duration: 'Trvanie',
    ascent: 'Stúpanie',
    descent: 'Klesanie',
  },
  filter: {
    title: 'Filter akcií',
    date: 'Dátum',
    dateHint:
      'Bez dátumu začiatku sa zobrazia iba akcie, ktoré ešte neskončili.',
    near: 'V okolí',
    anywhere: 'Kdekoľvek',
    within: 'do',
    myLocation: 'Moja poloha',
    homePosition: 'Domovská poloha',
    dogsWelcome: 'Psy vítané',
    childrenSuitable: 'Vhodné pre deti',
    from: 'od',
    to: 'do',
    unsaid: 'Vrátane akcií, ktoré to nemajú uvedené',
    unsaidHint:
      'Doprava, náročnosť, dĺžka, trvanie a stúpanie: akcie, ktoré ich neuvádzajú, budú tiež zobrazené.',
    origin: 'Pôvod',
    originHint:
      'Prevzaté akcie sa automaticky preberajú z kalendárov organizácií, napríklad turistických klubov. Ich organizátori ich tu nesledujú; podrobnosti a zmeny nájdete v zdroji uvedenom v popise. Akcie zadané tu pridávajú sami ich organizátori.',
    own: 'Zadané tu',
    imported: 'Prevzaté',
  },
  card: {
    dogsWelcome: 'Psy vítané',
    noDogs: 'Bez psov',
    children: 'Vhodné pre deti',
    noChildren: 'Nevhodné pre deti',
    importedNote: ({ source }) => (
      <>
        Akcia je prevzatá z kalendára {source}; jej organizátor ani väčšina
        účastníkov ju tu nesledujú.
      </>
    ),
  },
  list: {
    search: 'Hľadať v názvoch',
    inView: 'Len v aktuálnom zobrazení',
    noMatch: 'Žiadna akcia nezodpovedá kritériám.',
    sorts: {
      date: 'Podľa dátumu',
      title: 'Podľa názvu',
      lengthAsc: 'Od najkratšej',
      lengthDesc: 'Od najdlhšej',
      ascentAsc: 'Od najmenšieho stúpania',
      ascentDesc: 'Od najväčšieho stúpania',
      durationAsc: 'Od najkratšieho trvania',
      durationDesc: 'Od najdlhšieho trvania',
      nearMap: 'Najbližšie k stredu mapy',
      nearHome: 'Najbližšie k domovu',
      nearPlace: 'Najbližšie k miestu z filtra',
      interestedDesc: 'Od najväčšieho záujmu',
      goingDesc: 'Od najväčšej účasti',
    },
    show: 'Zobrazené v riadkoch',
    interestedCount: 'Majú záujem',
    goingCount: 'Zúčastnia sa',
    distanceFrom: {
      nearMap: 'Vzdialenosť od stredu mapy',
      nearHome: 'Vzdialenosť od domova',
      nearPlace: 'Vzdialenosť od miesta z filtra',
    },
  },
  selection: {
    backToEvents: 'Späť na akcie',
    interested: 'Mám záujem',
    going: 'Prídem',
    openInNewTab: 'Otvoriť na novej karte',
    loadHere: 'Načítať sem',
    deleteTitle: 'Zmazať akciu',
    deleteMessage: ({ title }) =>
      `Zmazať akciu „${title}“? Prepojená mapa zostane.`,
  },
  picking: {
    startPoint: 'Vyberte miesto začiatku',
    place: 'Vyberte miesto',
  },
  menu: {
    filter: 'Filter',
    newEvent: 'Nová akcia',
  },
  colorize: {
    by: 'Vyfarbiť podľa',
    none: 'Žiadne',
    legend: 'Legenda',
    modes: {
      when: 'Termín',
      mine: 'Moje a ostatné',
      transport: 'Doprava',
      distance: 'Dĺžka',
      duration: 'Trvanie',
      ascent: 'Stúpanie',
      difficulty: 'Náročnosť',
      dogs: 'Psy',
      children: 'Deti',
    },
    ended: 'Skončené',
    happening: 'Prebieha',
    several: 'Viacero',
    days: 'dni',
    mine: {
      mine: 'Moje',
      going: 'Prídem',
      interested: 'Mám záujem',
      others: 'Ostatné',
    },
    yes: 'Áno',
    no: 'Nie',
  },
};

export default sk;
