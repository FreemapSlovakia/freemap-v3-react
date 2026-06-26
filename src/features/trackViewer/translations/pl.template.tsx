import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { TrackViewerDetails } from '../components/TrackViewerDetails.js';
import { TrackViewerMessages } from './TrackViewerMessages.js';

const pl: DeepPartialWithRequiredObjects<TrackViewerMessages> = {
  info: () => <TrackViewerDetails />,
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
    sourceFilledGaps: 'zarejestrowana, luki uzupełnione (NASA SRTM)',
    sourceFilled: 'model terenu NASA SRTM',
  },
  uploadModal: {
    title: 'Importuj plik',
    drop: 'Upuść plik GPX, KML, KMZ, TCX lub GeoJSON tutaj lub kliknij, aby go wybrać.',
  },
  elevationFill: {
    title: 'Dane wysokości',
    introNone: 'Ten ślad nie zawiera danych o wysokości.',
    introPartial: 'W niektórych punktach tego śladu brakuje wysokości.',
    introFull:
      'Ten ślad ma już dane wysokości, ale model NASA SRTM (~30 m) jest ' +
      'często dokładniejszy.',
    question: 'Co chcesz zrobić?',
    overrideAll: 'Zastąp wszystkie',
    overrideAllDesc: 'zastąp każdy punkt modelem SRTM — gładki, spójny profil',
    fillMissing: 'Uzupełnij brakujące',
    fillMissingDesc:
      'zachowaj zarejestrowane wartości i uzupełnij tylko luki (na styku obu ' +
      'źródeł mogą wystąpić skoki)',
    keep: 'Nie zmieniaj',
    keepDesc: 'użyj wysokości zapisanej w śladzie',
    add: 'Dodaj wysokość',
    update: 'Zaktualizuj wysokość',
    updateConfirm: 'Zastąpić wysokość śladu modelem NASA SRTM (~30 m)?',
    updatedToast: ({ mode }) =>
      mode === 'missing'
        ? 'Brakująca wysokość została uzupełniona.'
        : 'Wysokość została nadpisana.',
  },
  upload: 'Prześlij',
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
};

export default pl;
