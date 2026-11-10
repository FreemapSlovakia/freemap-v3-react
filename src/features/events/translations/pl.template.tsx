import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { EventsMessages } from './EventsMessages.js';

const pl: DeepPartialWithRequiredObjects<EventsMessages> = {
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas ładowania wydarzeń', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas zapisywania wydarzenia', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas usuwania wydarzenia', err),
  difficulty: {
    easy: 'Łatwa',
    moderate: 'Średnia',
    demanding: 'Wymagająca',
    expert: 'Ekspercka',
  },
  form: {
    newEvent: 'Nowe wydarzenie',
    editEvent: 'Edycja wydarzenia',
    organizer: 'Organizator',
    organizerPlaceholder: 'Ja — lub wpisz nazwę użytkownika',
    organizerHint:
      'Wydarzenie dodaje się w imieniu organizatora: istniejącego konta lub nowej nazwy, z której powstanie organizator bez logowania.',
    onlyOrganizer: 'Wydarzenie może zmieniać tylko jego organizator.',
    unavailable: 'Nie udało się wczytać wydarzenia — mogło zostać usunięte.',
    title: 'Tytuł',
    description: 'Opis',
    contactHint:
      'Warto podać sposób kontaktu — telefon, e-mail lub grupę na czacie: wydarzenia nie mają jeszcze dyskusji.',
    cover: 'Obraz tytułowy',
    coverTooLarge: 'Obraz jest większy niż 20 MB.',
    start: 'Początek',
    end: 'Koniec',
    linkedMap: 'Powiązana mapa',
    noMap: 'Brak',
    newMapFromContent: 'Nowa mapa z bieżącej zawartości',
    noTripStats:
      'Mapa nie zawiera trasy ani linii, z których można by pobrać dane o wycieczce.',
    unsavedTitle: 'Niezapisane zmiany',
    unsavedMessage: ({ name }) =>
      `Otwarta mapa „${name}” ma niezapisane zmiany. Zapisać je i powiązać mapę, czy zapisać zawartość jako nową mapę?`,
    saveOpenMap: ({ name }) => `Zapisz „${name}”`,
    newMap: 'Nowa mapa',
    startPoint: 'Miejsce startu',
    setLocation: 'Ustaw pozycję',
    transport: 'Transport',
    difficulty: 'Trudność',
    dogs: 'Psy',
    dogsWelcome: 'Mile widziane',
    dogsNotAllowed: 'Niedozwolone',
    children: 'Dzieci',
    childrenSuitable: 'Odpowiednie',
    childrenNotSuitable: 'Nieodpowiednie',
    length: 'Długość',
    duration: 'Czas trwania',
    ascent: 'Podejście',
    descent: 'Zejście',
  },
  filter: {
    title: 'Filtr wydarzeń',
    date: 'Data',
    dateHint:
      'Bez daty początkowej wyświetlane są tylko wydarzenia, które jeszcze się nie zakończyły.',
    near: 'W pobliżu',
    anywhere: 'Gdziekolwiek',
    within: 'do',
    myLocation: 'Moja lokalizacja',
    homePosition: 'Pozycja domowa',
    dogsWelcome: 'Psy mile widziane',
    childrenSuitable: 'Odpowiednie dla dzieci',
    from: 'od',
    to: 'do',
    unsaid: 'Także wydarzenia, które tego nie podają',
    unsaidHint:
      'Transport, trudność, długość, czas trwania i podejście: wydarzenia, które ich nie podają, również zostaną wyświetlone.',
    origin: 'Pochodzenie',
    originHint:
      'Zaimportowane wydarzenia są przejmowane automatycznie z kalendarzy organizacji, np. klubów turystycznych. Ich organizatorzy nie śledzą ich tutaj; szczegóły i zmiany są dostępne w źródle podanym w opisie. Wydarzenia dodane tutaj dodają sami ich organizatorzy.',
    own: 'Dodane tutaj',
    imported: 'Zaimportowane',
  },
  card: {
    dogsWelcome: 'Psy mile widziane',
    noDogs: 'Bez psów',
    children: 'Odpowiednie dla dzieci',
    noChildren: 'Nie dla dzieci',
    importedNote: ({ source }) => (
      <>
        To wydarzenie pochodzi z kalendarza {source}; ani jego organizator, ani
        większość uczestników nie śledzą go tutaj.
      </>
    ),
  },
  list: {
    search: 'Szukaj w tytułach',
    inView: 'Tylko w bieżącym widoku',
    noMatch: 'Żadne wydarzenie nie spełnia kryteriów.',
    sorts: {
      date: 'Według daty',
      title: 'Według tytułu',
      lengthAsc: 'Od najkrótszych',
      lengthDesc: 'Od najdłuższych',
      ascentAsc: 'Od najmniejszego podejścia',
      ascentDesc: 'Od największego podejścia',
      durationAsc: 'Od najkrótszego czasu trwania',
      durationDesc: 'Od najdłuższego czasu trwania',
      nearMap: 'Najbliżej środka mapy',
      nearHome: 'Najbliżej domu',
      nearPlace: 'Najbliżej miejsca z filtra',
      interestedDesc: 'Od największego zainteresowania',
      goingDesc: 'Od największej liczby uczestników',
    },
    show: 'Widoczne w wierszach',
    interestedCount: 'Zainteresowani',
    goingCount: 'Uczestnicy',
    distanceFrom: {
      nearMap: 'Odległość od środka mapy',
      nearHome: 'Odległość od domu',
      nearPlace: 'Odległość od miejsca z filtra',
    },
  },
  selection: {
    backToEvents: 'Wróć do wydarzeń',
    interested: 'Interesuje mnie',
    going: 'Wezmę udział',
    openInNewTab: 'Otwórz w nowej karcie',
    loadHere: 'Wczytaj tutaj',
    deleteTitle: 'Usuń wydarzenie',
    deleteMessage: ({ title }) =>
      `Usunąć wydarzenie „${title}”? Powiązana mapa pozostanie.`,
  },
  picking: {
    startPoint: 'Wybierz miejsce startu',
    place: 'Wybierz miejsce',
  },
  menu: {
    filter: 'Filtr',
    newEvent: 'Nowe wydarzenie',
  },
  colorize: {
    modes: {
      when: 'Termin',
      mine: 'Moje i pozostałe',
      transport: 'Transport',
      distance: 'Długość',
      duration: 'Czas trwania',
      ascent: 'Podejście',
      difficulty: 'Trudność',
      dogs: 'Psy',
      children: 'Dzieci',
    },
    mine: {
      mine: 'Moje',
      going: 'Wezmę udział',
      interested: 'Interesuje mnie',
      others: 'Pozostałe',
    },
    by: 'Koloruj według',
    none: 'Brak',
    legend: 'Legenda',
    ended: 'Zakończone',
    happening: 'Trwa',
    several: 'Kilka',
    days: 'dni',
    yes: 'Tak',
    no: 'Nie',
  },
  noEvents: 'Nie znaleziono wydarzeń',
  coverError: ({ err }) =>
    addError(
      getMessages()!,
      'Wydarzenie zostało zapisane, ale jego obraz tytułowy nie',
      err,
    ),
  newMapError: ({ err }) =>
    addError(
      getMessages()!,
      'Błąd podczas zapisywania nowej mapy, dlatego wydarzenie nie zostało zapisane',
      err,
    ),
  participationError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas zapisywania udziału', err),
  loginToParticipate:
    'Aby zgłosić zainteresowanie lub udział, należy się zalogować.',
  notSaid: 'Nie podano',
  any: 'Dowolne',
};

export default pl;
