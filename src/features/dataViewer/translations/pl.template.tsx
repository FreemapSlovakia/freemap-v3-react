import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { DataViewerDetails } from '../components/DataViewerDetails.js';
import type { DataViewerMessages } from './DataViewerMessages.js';

const pl: DeepPartialWithRequiredObjects<DataViewerMessages> = {
  style: {
    title: 'Domyślny styl',
  },
  split: {
    action: 'Podziel',
    here: 'Podziel tutaj',
    segments: 'Podziel na odcinki',
  },
  match: {
    menuItem: 'Dopasuj do dróg',
    title: 'Dopasuj do dróg',
    help: 'Przyciąga ślad do sieci zmapowanych dróg i ścieżek, co usuwa rozrzut GPS i — co najważniejsze — ustala, po czym ślad prowadzi, dzięki czemu można go pokolorować według nawierzchni, rodzaju drogi, jakości drogi leśnej czy trudności.',
    transport: 'Środek transportu',
    dataLoss:
      'Dopasowana linia ma własne punkty, więc znaczniki czasu i zapisane dane z czujników (tętno, kadencja, prędkość) zostaną utracone.',
    run: 'Dopasuj',
    tooLong: 'Ten ślad ma zbyt wiele punktów, aby go dopasować.',
    tooShort: 'Ślad jest zbyt krótki, aby go dopasować.',
    brokenSequence:
      'Ślad gdzieś opuszcza sieć zmapowanych dróg, więc nie można go dopasować. Spróbuj innego środka transportu albo zostaw ślad bez zmian.',
    offNetwork:
      'Dopasowana trasa wyszła znacznie dłuższa niż ślad, co oznacza, że ślad nie prowadził po zmapowanych drogach — na przykład przez łąkę. Dopasowanie może odpowiedzieć tylko istniejącymi drogami, więc wynik nie byłby tam, gdzie szedłeś. Ślad pozostaje bez zmian.',
    partial:
      'Niektórych części śladu nie udało się dopasować — pozostają takie, jakie zostały zapisane. Ślad zmieniający środek transportu w połowie (wędrówka, a potem powrót samochodem) trzeba najpierw podzielić.',
  },
  info: () => <DataViewerDetails />,
  details: {
    startTime: 'Czas rozpoczęcia',
    finishTime: 'Czas zakończenia',
    duration: 'Czas trwania',
    distance: 'Dystans',
    avgSpeed: 'Średnia prędkość',
    minEle: 'Min. wysokość',
    maxEle: 'Maks. wysokość',
    uphill: 'Całkowite podejście',
    downhill: 'Całkowite zejście',
    durationValue: ({ h, m }) => `${h} godz. ${m} min`,
    source: 'Źródło wysokości',
    sourceOriginal: 'zarejestrowana',
    sourcePartial: 'zarejestrowana, niepełna',
    sourceFilledGaps: 'zarejestrowana, luki uzupełnione (model terenu)',
    sourceFilled: 'model terenu',
  },
  uploadModal: {
    title: 'Importuj plik',
    drop: 'Upuść plik GPX, KML, KMZ, TCX lub GeoJSON tutaj lub kliknij, aby go wybrać.',
    mergeTitle: 'Dane są już wczytane',
    mergeMessage:
      'Niektóre geodane są już wyświetlane. Dołączyć do nich zaimportowane dane, czy je zastąpić?',
    append: 'Dołącz',
    replace: 'Zastąp',
  },
  elevationFill: {
    title: 'Dane wysokości',
    introNone: 'Ten ślad nie zawiera danych o wysokości.',
    introPartial: 'W niektórych punktach tego śladu brakuje wysokości.',
    introFull:
      'Ten ślad ma już dane wysokości, ale model terenu jest często ' +
      'dokładniejszy.',
    premiumHiRes: (premiumLink) => (
      <>
        Z {premiumLink('dostępem premium')} wysokość w obsługiwanych krajach
        jest próbkowana z krajowego modelu w wysokiej rozdzielczości — na razie
        Słowacja (DMR 5.0: ÚGKK SR), kolejne wkrótce.
      </>
    ),
    question: 'Co chcesz zrobić?',
    overrideAll: 'Zastąp wszystkie',
    overrideAllDesc:
      'zastąp każdy punkt modelem terenu — gładki, spójny profil',
    fillMissing: 'Uzupełnij brakujące',
    fillMissingDesc:
      'zachowaj zarejestrowane wartości i uzupełnij tylko luki (na styku obu ' +
      'źródeł mogą wystąpić skoki)',
    keep: 'Nie zmieniaj',
    keepDesc: 'użyj wysokości zapisanej w śladzie',
    add: 'Dodaj wysokość',
    update: 'Zaktualizuj wysokość',
    updateConfirm: 'Zastąpić wysokość śladu modelem terenu?',
    updatedToast: ({ mode }) =>
      mode === 'missing'
        ? 'Brakująca wysokość została uzupełniona.'
        : 'Wysokość została nadpisana.',
  },
  upload: 'Prześlij',
  unnamedTrack: ({ n }) => `Ślad ${n}`,
  convertLossWarning:
    'Konwersja na rysunek zastępuje ślad i odrzuca jego zarejestrowane dane (wysokość, tętno, prędkość, czas).',
  convertAllToDrawing: 'Przekształć wszystko na rysunek',
  simplifyAll: 'Uprość wszystko',
  moreInfo: 'Więcej informacji',
  saveAsMap: 'Zapisz w moich mapach',
  loginToSaveMap: 'Zaloguj się, aby zapisać trasę w swoich mapach.',
  fetchingError: ({ err }) =>
    addError(
      getMessages()!,
      'Wystąpił błąd podczas pobierania danych trasy',
      err,
    ),
  loadingError: 'Błąd podczas ładowania pliku.',
  onlyOne: 'Oczekiwany jest tylko jeden plik.',
  invalidFormat:
    'Plik nie jest w obsługiwanym formacie lub jest nieprawidłowy.',
  someFilesFailed: ({ names }) =>
    `Nie udało się wczytać niektórych plików: ${names}.`,
  unsaved: 'Niezapisane',
  unsavedTooltip:
    'Ten ślad nie znajduje się w żadnej zapisanej mapie ani nie jest częścią odnośnika – pozostaje tylko w tej przeglądarce, więc udostępnienie odnośnika go nie udostępni. Zapisz go w swoich mapach, aby go zachować.',
};

export default pl;
