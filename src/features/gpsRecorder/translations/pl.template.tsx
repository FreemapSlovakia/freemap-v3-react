import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { GpsRecorderMessages } from './GpsRecorderMessages.js';

const pl: DeepPartialWithRequiredObjects<GpsRecorderMessages> = {
  record: 'Nagrywaj',
  pause: 'Wstrzymaj',
  stop: 'Zakończ',
  connect: 'Połącz',
  install: 'Zainstaluj rejestrator',
  update: 'Zaktualizuj rejestrator',
  delete: 'Usuń nagranie',
  settings: 'Ustawienia nagrywania',
  details: 'Szczegóły nagrania',
  recordInBrowser: 'Nagrywaj w tej przeglądarce',
  browserBadge: 'W tej przeglądarce',
  browserWarning:
    'Nagrywanie w tej przeglądarce. Zatrzymuje się po zablokowaniu ekranu lub ' +
    'opuszczeniu tej strony, więc przez całą trasę zostaw ją otwartą, a ekran ' +
    'włączony.',
  browserNoStorage:
    'Nagrywanie w tej przeglądarce, ale nagranie nie zostanie w niej zapisane ' +
    '— odświeżenie lub zamknięcie tej strony je utraci. Aby je zachować, ' +
    'zakończ nagrywanie.',
  state: {
    recording: 'Nagrywanie',
    stopped: 'Zatrzymane',
    unknown: 'Niepołączony',
  },
  connection: {
    connecting: 'Łączenie z rejestratorem…',
    syncing: 'Pobieranie śladu…',
    live: 'Na żywo',
    reconnecting: 'Ponowne łączenie…',
    offline: 'Bez podglądu na żywo',
  },
  stats: {
    distance: 'Dystans',
    duration: 'Czas trwania',
    elevation: 'Wysokość',
    ascent: 'Podejście',
    speed: 'Prędkość',
    avgSpeed: 'Średnia prędkość',
    accuracy: 'Dokładność',
    satellites: 'Satelity',
    points: 'Punkty',
    segments: 'Segmenty',
    lastFix: 'Ostatni pomiar',
  },
  stopModal: {
    title: 'Zakończyć nagrywanie?',
    message: ({ tool }) => (
      <>
        Nagrywanie nadal trwa. Zakończenie zatrzyma je i przeniesie ślad do
        narzędzia <b>{tool}</b>. W rejestratorze nic nie pozostanie, więc
        następne nagrywanie zacznie nowy ślad.
      </>
    ),
    confirm: 'Zakończ',
  },
  deleteModal: {
    title: 'Usunąć nagranie?',
    message:
      'Rejestrator odrzuci cały swój ślad. Tej operacji nie można cofnąć. ' +
      'Jeśli chcesz zachować nagranie, zamiast tego je zakończ.',
    confirm: 'Usuń',
  },
  setup: {
    summary: ({ items }) => (
      <>
        Rejestrator może nie przetrwać długiego nagrywania:
        <ul className="mb-0 ps-4">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </>
    ),
    permissionFine: 'Dokładna lokalizacja nie jest dozwolona.',
    permissionBackground:
      'Lokalizacja w tle nie jest dozwolona, więc nagrywanie zatrzyma się, ' +
      'gdy aplikacja nie jest na pierwszym planie.',
    permissionNotifications:
      'Powiadomienia nie są dozwolone, więc Android może zatrzymać usługę nagrywania.',
    battery:
      'Rejestrator podlega optymalizacji baterii, więc Android może go zatrzymać.',
    oem: ({ vendor }) =>
      `Urządzenia ${vendor} ograniczają aplikacje działające w tle ponad ` +
      `zasady Androida, a odpowiedni krok w rejestratorze nie jest potwierdzony.`,
    open: 'Otwórz rejestrator',
  },
  errors: {
    unreachable:
      'Rejestrator nie odpowiedział — być może nie jest uruchomiony.',
    lnaDenied:
      'Przeglądarka odmówiła dostępu do sieci lokalnej, więc podgląd na żywo ' +
      'jest niedostępny. Nie ma to wpływu na samo nagrywanie.',
    setupNeeded:
      'Rejestrator nie może jeszcze nagrywać — otwórz go i przyznaj to, o co prosi.',
    recording: 'Przed usunięciem śladu zatrzymaj nagrywanie.',
    incomplete:
      'Część nagrania jeszcze nie dotarła na tę stronę, więc nic nie zostało ' +
      'przejęte ani usunięte. Połącz się ponownie i zakończ jeszcze raz.',
    notStored:
      'Nie udało się zapisać nagrania w tej przeglądarce, więc pozostało w ' +
      'rejestratorze. Masz je w śladach — stamtąd je wyeksportuj lub zapisz.',
    notPersisted:
      'Ta przeglądarka nie obiecała zachować swojej pamięci, więc nagranie ' +
      'pozostało w rejestratorze. Masz je w śladach — wyeksportuj lub zapisz ' +
      'je, a potem usuń nagranie.',
    needsForeground:
      'Android nie pozwolił rejestratorowi uruchomić się w tle. Otwórz go i ' +
      'zacznij nagrywanie w nim albo pozwól mu działać bez ograniczeń ' +
      'baterii, aby dało się go uruchomić stąd.',
    outdated: 'Rejestrator jest zbyt stary dla tej wersji mapy.',
    locationDenied:
      'Ta strona nie ma dostępu do Twojej lokalizacji. Zezwól na niego w ' +
      'ustawieniach przeglądarki i uruchom nagrywanie ponownie.',
    locationUnavailable:
      'Ta przeglądarka nie potrafi określić Twojej lokalizacji.',
    http: 'Rejestrator odpowiedział błędem.',
    protocol: 'Rejestrator odpowiedział czymś nieoczekiwanym.',
    unknown: 'Komunikacja z rejestratorem nie powiodła się.',
  },
  settingsModal: {
    title: 'Ustawienia nagrywania',
    backend: 'Nagrywaj za pomocą',
    backendApp: 'Aplikacji rejestratora',
    backendBrowser: 'Tej przeglądarki',
    backendHint:
      'Aplikacja nagrywa także przy wyłączonym ekranie i mierzy wysokość przy ' +
      'każdym pomiarze. Ta przeglądarka wymaga otwartej strony i włączonego ' +
      'ekranu, ale nie wymaga instalacji.',
    backendLockedHint:
      'Nie można zmienić podczas nagrywania. Najpierw je wstrzymaj lub zakończ.',
    recorderSection: 'Co jest rejestrowane',
    recorderIntro:
      'Rejestrator stosuje je przy rozpoczęciu nagrywania, więc ich zmiana ' +
      'nie wpływa na już trwające nagranie.',
    browserIntro:
      'Stosowane przy rozpoczęciu nagrywania, więc ich zmiana nie wpływa na ' +
      'już trwające nagranie. Przeglądarka sama decyduje, jak często podaje ' +
      'pozycję, więc są to raczej ograniczenia niż polecenia.',
    intervalMs: 'Czas między pomiarami',
    minDistanceM: 'Minimalna odległość między pomiarami',
    maxAccuracyM: 'Odrzuć pomiary mniej dokładne niż',
    maxAccuracyOff: 'Zachowaj wszystkie pomiary',
    source: 'Źródło pozycji',
    sourceGps: 'Odbiornik GPS',
    sourceFused: 'Łączone (GPS, wifi i czujniki)',
    sourceHint:
      'Odbiornik mierzy wysokość przy każdym pomiarze; źródło łączone lepiej ' +
      'umiejscawia cię wśród budynków i pod drzewami, ale powtarza tę samą ' +
      'wysokość nawet przez kilka sekund.',
    priority: 'Dokładność',
    priorityHigh: 'Najwyższa (GPS, największe zużycie baterii)',
    priorityBalanced: 'Zrównoważona',
    priorityLow: 'Niska (najmniejsze zużycie baterii)',
    priorityFusedOnly: 'Dotyczy tylko źródła łączonego.',
    displaySection: 'Wyświetlanie',
    splitGapS: 'Zacznij nowy segment po przerwie',
    splitGapOff: 'Nigdy nie dziel',
    splitGapHint:
      'Przerwa dłuższa niż ta jest rysowana i eksportowana jako luka, a nie ' +
      'jako prosta linia przez nią.',
    feedLocation: 'Używaj nagrania do „Pokaż moją pozycję”',
    feedLocationHint:
      'Podczas nagrywania „Pokaż moją pozycję” pokazuje zarejestrowane punkty ' +
      'zamiast tego, by przeglądarka śledziła GPS osobno.',
    keepScreenAwake: 'Nie wyłączaj ekranu podczas nagrywania',
  },
};

export default pl;
