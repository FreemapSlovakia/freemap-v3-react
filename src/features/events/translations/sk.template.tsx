import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { EventDetails } from '../components/EventDetails.js';
import type { EventsMessages } from './EventsMessages.js';

const sk: DeepPartialWithRequiredObjects<EventsMessages> = {
  noEvents: 'Nenašli sa žiadne akcie',
  details: ({ event }) => <EventDetails event={event} />,
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
    addError(getMessages()!, 'Chyba pri rušení akcie', err),
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
    onlyOrganizer: 'Akciu môže meniť iba jej organizátor.',
    unavailable: 'Akciu sa nepodarilo načítať — možno bola zrušená.',
    title: 'Názov',
    description: 'Popis',
    contactHint:
      'Uveďte, ako vás zastihnúť — telefón, e-mail alebo skupinu v chate: akcie zatiaľ nemajú diskusiu.',
    cover: 'Titulný obrázok',
    coverTooLarge: 'Obrázok je väčší ako 20 MB.',
    start: 'Začiatok',
    end: 'Koniec',
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
    visibility: 'Viditeľnosť',
    public: 'Verejná',
    unlisted: 'Nezverejnená (iba cez odkaz)',
  },
  filter: {
    title: 'Filter akcií',
    date: 'Dátum',
    dateHint:
      'Bez dátumu začiatku sa zobrazia iba akcie, ktoré ešte neskončili; pre minulé akcie ho nastavte.',
    near: 'V okolí',
    anywhere: 'Kdekoľvek',
    within: 'do',
    myLocation: 'Moja poloha',
    homePosition: 'Domovská poloha',
    dogsWelcome: 'Psy vítané',
    childrenSuitable: 'Vhodné pre deti',
    from: 'od',
    to: 'do',
    unsaid: 'Vrátane akcií, ktoré to neuvádzajú',
    unsaidHint:
      'Doprava, náročnosť, dĺžka, trvanie a stúpanie: akcia, ktorá ich neuvádza, sa tiež zobrazí. Psy a deti sa filtrujú presne.',
  },
  card: {
    unlisted: 'Nezverejnená',
    dogsWelcome: 'Psy vítané',
    noDogs: 'Bez psov',
    children: 'Vhodné pre deti',
    noChildren: 'Nevhodné pre deti',
  },
  selection: {
    backToEvents: 'Späť na akcie',
    interested: 'Mám záujem',
    going: 'Prídem',
    openInNewTab: 'Otvoriť na novej karte',
    loadHere: 'Načítať sem',
    deleteTitle: 'Zrušiť akciu',
    deleteMessage: ({ title }) =>
      `Zrušiť akciu „${title}“? Prepojená mapa zostane.`,
  },
  picking: {
    startPoint: 'Vyberte miesto začiatku',
    place: 'Vyberte miesto',
  },
  menu: {
    filter: 'Filter',
    newEvent: 'Nová akcia',
  },
};

export default sk;
