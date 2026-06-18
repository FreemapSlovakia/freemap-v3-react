import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { TrackViewerDetails } from '../components/TrackViewerDetails.js';
import { TrackViewerMessages } from './TrackViewerMessages.js';

const pl: DeepPartialWithRequiredObjects<TrackViewerMessages> = {
  info: () => <TrackViewerDetails />,
  colorizingMode: {
    none: 'Nieaktywne',
    elevation: 'Wysokość',
    steepness: 'Stromość',
    speed: 'Prędkość',
    heartRate: 'Tętno',
    cadence: 'Kadencja',
    power: 'Moc',
    temperature: 'Temperatura',
    time: 'Czas',
    heading: 'Kierunek',
  },
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
  },
  uploadModal: {
    title: 'Importuj plik',
    drop: 'Upuść plik GPX lub GeoJSON tutaj lub kliknij, aby go wybrać.',
  },
  upload: 'Prześlij',
  moreInfo: 'Więcej informacji',
  share: 'Zapisz na serwerze',
  shareToast:
    'Trasa została zapisana na serwerze i można ją udostępnić, kopiując adres URL strony.',
  fetchingError: ({ err }) =>
    addError(
      getMessages()!,
      'Wystąpił błąd podczas pobierania danych trasy',
      err,
    ),
  savingError: ({ err }) =>
    addError(getMessages()!, 'Wystąpił błąd podczas zapisywania trasy', err),
  loadingError: 'Błąd podczas ładowania pliku.',
  onlyOne: 'Oczekiwany jest tylko jeden plik.',
  invalidFormat:
    'Plik nie jest w obsługiwanym formacie lub jest nieprawidłowy.',
  tooBigError: 'Plik jest zbyt duży.',
};

export default pl;
