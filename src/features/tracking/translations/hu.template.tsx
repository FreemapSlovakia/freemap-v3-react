import { FaKey } from 'react-icons/fa';
import { DeepPartialWithRequiredObjects } from '../../../shared/types/deepPartial.js';
import { Messages } from './messagesInterface.js';

const messages: DeepPartialWithRequiredObjects<Messages> = {
  trackedDevices: {
    button: 'Figyelt',
    modalTitle: 'Figyelt eszközök',
    desc: 'Figyelt eszközök kezelése ismerősei pozíciójának megismeréséhez.',

    modifyTitle: (name) => (
      <>
        Figyelt eszköz módosításaí <i>{name}</i>
      </>
    ),

    createTitle: (name) => (
      <>
        <i>{name}</i> készülék figyelése
      </>
    ),

    storageWarning:
      'Figyelem, az eszközök listája csak az oldal URL-jében jelenik meg. Ha el szeretnéd menteni, használd a „Saját térképek” funkciót.',
  },
  accessToken: {
    token: 'Figyelőkód',
    timeFrom: 'Ettől',
    timeTo: 'Eddig',
    listingLabel: 'Felsorolási felirat',
    note: 'Megjegyzés',
    delete: 'Törlöd a hozzáférési tokent?',
  },
  accessTokens: {
    modalTitle: (deviceName) => (
      <>
        <i>{deviceName}</i> készülék figyelőkódjai
      </>
    ),
    desc: (deviceName) => (
      <>
        Határozzon meg figyelőkódokat, hogy <i>{deviceName}</i> készüléke
        pozícióját megoszthassa ismerőseivel.
      </>
    ),
    createTitle: (deviceName) => (
      <>
        Figyelőkód hozzáadása a(z) <i>{deviceName}</i> készülékhez
      </>
    ),
    modifyTitle: ({ token, deviceName }) => (
      <>
        A(z) <i>{deviceName}</i> készülék <i>{token}</i> figyelőkódjának
        módosítása
      </>
    ),
  },
  trackedDevice: {
    token: 'Figyelőkód',
    label: 'Felirat',
    fromTime: 'Kezdő időpont',
    maxAge: 'Legmagasabb életkor',
    maxCount: 'Legmagasabb szám',
    splitDistance: 'Távolság felosztása',
    splitDuration: 'Időtartam felosztása',
    color: 'Szín',
    width: 'Szélesség',
  },
  devices: {
    button: 'Készülékeim',
    modalTitle: 'Követett készülékeim',
    createTitle: 'Követendő készülék létrehozása',
    watchTokens: 'Kódok megtekintése',
    watchPrivately: 'Privát figyelés',
    watch: 'Figyelés',
    delete: 'Törli a készüléket?',
    modifyTitle: ({ name }) => (
      <>
        A(z) <i>{name}</i> készülék követésének módosítása
      </>
    ),
    desc: () => (
      <>
        <p>
          Kezelje készülékeit, hogy mások is láthassák pozícióját, ha megad
          nekik egy figyelőkódot (amelyet a <FaKey /> ikonnal hozhat létre).
        </p>
        <hr />
        <p>
          Adja meg az alábbi webcímet a nyomon követő alkalmazásában (pl.{' '}
          <a href="https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking">
            Locus
          </a>{' '}
          vagy OsmAnd):{' '}
          <code>
            {process.env['API_URL']}/tracking/track/<i>kód</i>
          </code>{' '}
          ahol a <i>kód</i> az alábbi táblázatban található.
        </p>
        <p>
          A végpont támogatja a HTTP <code>GET</code> és <code>POST</code>
          módszert az URL-ben kódolt alábbi paraméterekkel:
        </p>
        <ul>
          <li>
            <code>lat</code> - hosszúság fokban (kötelező)
          </li>
          <li>
            <code>lon</code> - szélesség fokban (kötelező)
          </li>
          <li>
            <code>time</code>, <code>timestamp</code> - JavaScripttel elemezhető
            parsable dátumés idő vagy Unix idő másodpercben vagy
            milliszekundumban
          </li>
          <li>
            <code>alt</code>, <code>altitude</code> - magasság (méter)
          </li>
          <li>
            <code>speed</code> - sebeeség (m/s)
          </li>
          <li>
            <code>speedKmh</code> - sebesség (km/h)
          </li>
          <li>
            <code>acc</code> - pontosság (méter)
          </li>
          <li>
            <code>hdop</code> - vízszintes pontossághígulás (dilution of
            precision / DOP)
          </li>
          <li>
            <code>bearing</code> - irányszög (fok)
          </li>
          <li>
            <code>battery</code> - akkumulátor (százalék)
          </li>
          <li>
            <code>gsm_signal</code> - GSM-jel (százalék)
          </li>
          <li>
            <code>message</code> - üzenet (megjegyzés)
          </li>
        </ul>
        <hr />
        <p>
          TK102B GPS tracker nyomvonalrögzítő készülék esetén a következőre
          állítsa be a címét:{' '}
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
    token: 'Követési kód',
    name: 'Név',
    maxAge: 'Legmagasabb kor',
    maxCount: 'Legmagasabb szám',
    generatedToken: 'mentéskor fog generálódni',
  },
  visual: {
    line: 'Vonal',
    points: 'Pontok',
    'line+points': 'Vonal + pontok',
  },
  subscribeNotFound: ({ id }) => (
    <>
      A(z) <i>{id}</i> figyelőkód nem létezik.
    </>
  ),
  subscribeError: ({ id }) => (
    <>
      Hiba történt a(z) <i>{id}</i> kód használatának követésekor.
    </>
  ),
};

export default messages;
