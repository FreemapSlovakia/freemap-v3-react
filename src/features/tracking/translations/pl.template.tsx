import { DocumentLink } from '@features/documents/components/DocumentLink.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { FaKey } from 'react-icons/fa';
import { TrackingMessages } from './TrackingMessages.js';

const pl: DeepPartialWithRequiredObjects<TrackingMessages> = {
  trackedDevices: {
    button: 'Obserwowane',
    modalTitle: 'Obserwowane urządzenia',
    desc: 'Zarządzaj obserwowanymi urządzeniami, aby zobaczyć pozycję swoich znajomych.',
    modifyTitle: (name) => (
      <>
        Edytuj obserwowane urządzenie <i>{name}</i>
      </>
    ),
    createTitle: (name) => (
      <>
        Obserwuj urządzenie <i>{name}</i>
      </>
    ),
    storageWarning:
      'Uwaga, lista urządzeń jest zawarta tylko w adresie URL strony. Aby ją zapisać, użyj funkcji „Moje mapy”.',
  },
  accessToken: {
    token: 'Token śledzenia',
    timeFrom: 'Od',
    timeTo: 'Do',
    listingLabel: 'Nazwa urządzenia',
    note: 'Notatka',
    delete: (token) => (
      <>
        Czy na pewno chcesz usunąć token dostępu <i>{token}</i>?
      </>
    ),
    deleteTitle: 'Usunięcie tokenu dostępu',
  },
  accessTokens: {
    modalTitle: (deviceName) => (
      <>
        Tokeny śledzenia dla <i>{deviceName}</i>
      </>
    ),
    desc: (deviceName) => (
      <>
        Zdefiniuj tokeny śledzenia, aby udostępnić pozycję urządzenia{' '}
        <i>{deviceName}</i> swoim znajomym.
      </>
    ),
    createTitle: (deviceName) => (
      <>
        Dodaj token śledzenia dla <i>{deviceName}</i>
      </>
    ),
    modifyTitle: ({ token, deviceName }) => (
      <>
        Zmień token śledzenia <i>{token}</i> dla <i>{deviceName}</i>
      </>
    ),
  },
  trackedDevice: {
    token: 'Token śledzenia',
    label: 'Etykieta',
    fromTime: 'Od',
    maxAge: 'Maks. wiek',
    maxCount: 'Maks. liczba',
    splitDistance: 'Podział odległości',
    splitDuration: 'Podział czasu',
    color: 'Kolor',
    width: 'Szerokość',
  },
  devices: {
    button: 'Moje urządzenia',
    modalTitle: 'Moje śledzone urządzenia',
    createTitle: 'Utwórz urządzenie śledzące',
    watchTokens: 'Tokeny śledzenia',
    watchPrivately: 'Śledź prywatnie',
    watch: 'Śledź',
    delete: (name) => (
      <>
        Czy na pewno chcesz usunąć urządzenie <i>{name}</i>?
      </>
    ),
    deleteTitle: 'Usunięcie urządzenia',
    modifyTitle: ({ name }) => (
      <>
        Edytuj urządzenie śledzące <i>{name}</i>
      </>
    ),
    desc: () => (
      <>
        <p>
          Zarządzaj swoimi urządzeniami, aby inni mogli śledzić Twoją pozycję,
          jeśli przekażesz im token śledzenia (można go utworzyć za pomocą ikony{' '}
          <FaKey />
          ).
        </p>
        <hr />
        <DocumentLink doc="tracking">
          Jak skonfigurować śledzone urządzenie
        </DocumentLink>
      </>
    ),
  },
  device: {
    token: 'Kod śledzenia',
    name: 'Nazwa',
    maxAge: 'Maksymalny wiek',
    maxCount: 'Maksymalna liczba',
    generatedToken: 'zostanie wygenerowany po zapisaniu',
  },
  visual: {
    line: 'Linia',
    points: 'Punkty',
    'line+points': 'Linia + Punkty',
  },
};

export default pl;
