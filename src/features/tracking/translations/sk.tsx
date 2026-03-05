import { FaKey } from 'react-icons/fa';
import { Messages } from './messagesInterface.js';

const messages: Messages = {
  trackedDevices: {
    button: 'Sledované zariadenia',
    modalTitle: 'Sledované zariadenia',
    desc: 'Tu môžete spravovať sledované zariadenia, aby ste videli pozíciu svojich priateľov.',
    modifyTitle: (name) => (
      <>
        Upraviť sledované zariadenie <i>{name}</i>
      </>
    ),
    createTitle: (name) => (
      <>
        Sledovať zariadenie <i>{name}</i>
      </>
    ),
    storageWarning:
      'Pozor, zoznam zariadení je premietnutý len do URL stránky. Ak si ho prajete uložiť, využite funkciu "Moje mapy".',
  },
  accessToken: {
    token: 'Token sledovania',
    timeFrom: 'Od',
    timeTo: 'Do',
    listingLabel: 'Popisok v zozname',
    note: 'Poznámka',
    delete: 'Zmazať token sledovania?',
  },
  accessTokens: {
    modalTitle: (deviceName) => (
      <>
        Tokeny sledovania pre <i>{deviceName}</i>
      </>
    ),
    desc: (deviceName) => (
      <>
        Zadefinujte tokeny sledovania, aby ste mohli zdieľať pozíciu vášho
        zariadenia <i>{deviceName}</i> s vašimi priateľmi.
      </>
    ),
    createTitle: (deviceName) => (
      <>
        Pridať token sledovania pre <i>{deviceName}</i>
      </>
    ),
    modifyTitle: ({ token, deviceName }) => (
      <>
        Upraviť token sledovania <i>{token}</i> pre <i>{deviceName}</i>
      </>
    ),
  },
  trackedDevice: {
    token: 'Token sledovania',
    label: 'Popisok',
    fromTime: 'Pozície od',
    maxAge: 'Najstaršia pozícia',
    maxCount: 'Maximálny počet pozícií',
    splitDistance: 'Vzdialenosť na rozdelenie',
    splitDuration: 'Pauza na rozdelenie',
    color: 'Farba',
    width: 'Šírka',
  },
  devices: {
    button: 'Moje zariadenia',
    modalTitle: 'Moje zariadenia',
    createTitle: 'Pridať zariadenie',
    watchTokens: 'Sledovacie tokeny',
    watchPrivately: 'Sledovať privátne',
    watch: 'Sledovať',
    delete: 'Odstrániť zariadenie?',
    modifyTitle: ({ name }) => (
      <>
        Upraviť zariadenie <i>{name}</i>
      </>
    ),
    desc: () => (
      <>
        <p>
          Tu môžete spravovať svoje zariadenia. Ostatní môžu sledovať ich
          pozíciu, ak k nim vytvoríte sledovacie tokeny, pomocou tlačidla{' '}
          <FaKey />.
        </p>
        <hr />
        <p>
          Do vášho trackera (napríklad{' '}
          <a href="https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking">
            Locus
          </a>{' '}
          alebo OsmAnd) vložte nasledujúcu URL:{' '}
          <code>
            {process.env['API_URL']}/tracking/track/<i>token</i>
          </code>{' '}
          kde <i>token</i> je vypísaný v tabuľke nižšie.
        </p>
        <p>
          Server podporuje HTTP <code>GET</code> alebo <code>POST</code> s URL
          parametrami:
        </p>
        <ul>
          <li>
            <code>lat</code> - zemepisná dĺžka v stupňoch (povinné)
          </li>
          <li>
            <code>lon</code> - zemepisná šírka v stupňoch (povinné)
          </li>
          <li>
            <code>time</code>, <code>timestamp</code> - dátum a čas parsovateľný
            JavaScript-om alebo Unixový čas v sekundách alebo milisekundách
          </li>
          <li>
            <code>alt</code>, <code>altitude</code> - nadmorská výška v metroch
          </li>
          <li>
            <code>speed</code> - rýchlosť v ㎧
          </li>
          <li>
            <code>speedKmh</code> - rýchlosť v km/h
          </li>
          <li>
            <code>acc</code> - presnosť v metroch
          </li>
          <li>
            <code>hdop</code> - horizontálna DOP
          </li>
          <li>
            <code>bearing</code> - smer v stupňoch
          </li>
          <li>
            <code>battery</code> - batéria v percentách
          </li>
          <li>
            <code>gsm_signal</code> - GSM signál v percentách
          </li>
          <li>
            <code>message</code> - správa (poznámka)
          </li>
        </ul>
        <hr />
        <p>
          V prípade trackera TK102B ho nakonfigurujte na adresu{' '}
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
    token: 'Token zaznamenávania',
    name: 'Názov',
    maxAge: 'Najstaršia pozícia',
    maxCount: 'Maximálny počet pozícií',
    generatedToken: 'bude vygenerovaný po uložení',
  },
  visual: {
    line: 'Spojnica',
    points: 'Pozície',
    'line+points': 'Spojnica + Pozície',
  },
  subscribeNotFound: ({ id }) => (
    <>
      Token sledovania <i>{id}</i> neexistuje.
    </>
  ),
  subscribeError: ({ id }) => (
    <>
      Chyba sledovania pomocou sledovacieho tokenu <i>{id}</i>.
    </>
  ),
};

export default messages;
