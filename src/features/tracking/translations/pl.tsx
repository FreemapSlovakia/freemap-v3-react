import { FaKey } from 'react-icons/fa';
import { Messages } from './messagesInterface.js';

const messages: Messages = {
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
    delete: 'Usunąć token dostępu?',
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
    delete: 'Usunąć urządzenie?',
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
        <p>
          Wprowadź poniższy adres URL w aplikacji śledzącej (np.{' '}
          <a href="https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking">
            Locus
          </a>{' '}
          lub OsmAnd):{' '}
          <code>
            {process.env['API_URL']}/tracking/track/<i>token</i>
          </code>{' '}
          gdzie <i>token</i> znajduje się w tabeli poniżej.
        </p>
        <p>
          Endpoint obsługuje metody HTTP <code>GET</code> lub <code>POST</code>{' '}
          z parametrami URL-encoded:
        </p>
        <ul>
          <li>
            <code>lat</code> – szerokość geograficzna (wymagane)
          </li>
          <li>
            <code>lon</code> – długość geograficzna (wymagane)
          </li>
          <li>
            <code>time</code>, <code>timestamp</code> – data parsowalna w
            JavaScript lub Unix time w sekundach/milisekundach
          </li>
          <li>
            <code>alt</code>, <code>altitude</code> – wysokość w metrach
          </li>
          <li>
            <code>speed</code> – prędkość w m/s
          </li>
          <li>
            <code>speedKmh</code> – prędkość w km/h
          </li>
          <li>
            <code>acc</code> – dokładność w metrach
          </li>
          <li>
            <code>hdop</code> – pozioma dokładność (HDOP)
          </li>
          <li>
            <code>bearing</code> – kierunek w stopniach
          </li>
          <li>
            <code>battery</code> – bateria w procentach
          </li>
          <li>
            <code>gsm_signal</code> – sygnał GSM w procentach
          </li>
          <li>
            <code>message</code> – wiadomość (notatka)
          </li>
        </ul>
        <hr />
        <p>
          W przypadku trackera TK102B skonfiguruj jego adres jako:{' '}
          <code>
            {process.env['API_URL']
              ?.replace(/https?:\/\//, '')
              ?.replace(/:\d+$/, '')}
            :3030
          </code>
        </p>
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

  subscribeNotFound: ({ id }) => (
    <>
      Beobachtungstoken <i>{id}</i> existiert nicht.
    </>
  ),

  subscribeError: ({ id }) => (
    <>
      Fehler beim Beobachten mit Token <i>{id}</i>.
    </>
  ),
};

export default messages;
