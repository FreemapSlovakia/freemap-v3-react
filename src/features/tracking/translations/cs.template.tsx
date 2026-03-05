import { FaKey } from 'react-icons/fa';
import { DeepPartialWithRequiredObjects } from '../../../shared/types/deepPartial.js';
import { Messages } from './messagesInterface.js';

const messages: DeepPartialWithRequiredObjects<Messages> = {
  trackedDevices: {
    button: 'Sledované',
    modalTitle: 'Sledovaná zařízení',
    desc: 'Nastavte sledovaná zařízení abyste mohli sledovat jejich polohu.',
    modifyTitle: (name) => (
      <>
        Upravit sledované zařízení <i>{name}</i>
      </>
    ),
    createTitle: (name) => (
      <>
        Sleduj zařízení <i>{name}</i>
      </>
    ),
    storageWarning:
      'Pozor, seznam zařízení je promítnut pouze do URL stránky. Pokud si ho přejete uložit, využijte funkci "Moje mapy".',
  },
  accessToken: {
    token: 'Sledovací token',
    timeFrom: 'Od',
    timeTo: 'Do',
    listingLabel: 'Název zařízení',
    note: 'Poznámka',
    delete: 'Smasat sledovací token?',
  },
  accessTokens: {
    modalTitle: (deviceName) => (
      <>
        Sledovací tokeny pro <i>{deviceName}</i>
      </>
    ),
    desc: (deviceName) => (
      <>
        Vytvořte sledovací tokeny, abyste mohli sdílet polohu{' '}
        <i>{deviceName}</i> s přáteli.
      </>
    ),
    createTitle: (deviceName) => (
      <>
        Přidej sledovací token pro <i>{deviceName}</i>
      </>
    ),
    modifyTitle: ({ token, deviceName }) => (
      <>
        Uprav sledovací token <i>{token}</i> pro <i>{deviceName}</i>
      </>
    ),
  },
  trackedDevice: {
    token: 'Sledovací token',
    label: 'Název',
    fromTime: 'Od',
    maxAge: 'Maximální doba',
    maxCount: 'Maximální počet',
    splitDistance: 'Rozdělit po vzdálenosti',
    splitDuration: 'Rozdělení po době',
    color: 'Barva',
    width: 'Šířka',
  },
  devices: {
    button: 'Moje zařízení',
    modalTitle: 'Moje sledovaná zařízení',
    createTitle: 'Nové zařízení',
    watchTokens: 'Sledovací tokeny',
    watchPrivately: 'Sledovat soukromě',
    watch: 'Sledovat',
    delete: 'Smazat zařízení?',
    modifyTitle: ({ name }) => (
      <>
        Úprava zařízení <i>{name}</i>
      </>
    ),
    desc: () => (
      <>
        <p>
          Spravujte svá zařízení, aby vaši polohu mohli sledovat lidé, kterým
          dáte sledovací token (ten lze vygenerovat tlačítkem <FaKey />
          ).
        </p>
        <hr />
        <p>
          Na svém zařízení navštivte toto URL (podporuje např.{' '}
          <a href="https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking">
            Locus
          </a>{' '}
          nebo OsmAnd):{' '}
          <code>
            {process.env['API_URL']}/tracking/track/<i>token</i>
          </code>{' '}
          kde místo <i>token</i> doplňte svůj níže uvedený token.
        </p>
        <p>
          Jsou podporovány HTTP metody <code>GET</code> nebo <code>POST</code> s
          témito parametry (URL-encoded):
        </p>
        <ul>
          <li>
            <code>lat</code> - zeměpisná šířka (povinná)
          </li>
          <li>
            <code>lon</code> - zeměpisná délka (povinná)
          </li>
          <li>
            <code>time</code>, <code>timestamp</code> - čas parsovatelný v
            JavaScriptu nebo Unixový čas v sekunách nebo milisekundách
          </li>
          <li>
            <code>alt</code>, <code>altitude</code> - nadmořská výška v metrech
          </li>
          <li>
            <code>speed</code> - rychlost v m/s
          </li>
          <li>
            <code>speedKmh</code> - rychlost v km/h
          </li>
          <li>
            <code>acc</code> - přesnost v meterech
          </li>
          <li>
            <code>hdop</code> - horizontální nepřesnost (HDOP)
          </li>
          <li>
            <code>bearing</code> - azimut ve stupních
          </li>
          <li>
            <code>battery</code> - batterie v procentech
          </li>
          <li>
            <code>gsm_signal</code> - GSM signál v procentech
          </li>
          <li>
            <code>message</code> - zpráva (poznámka)
          </li>
        </ul>
        <hr />
        <p>
          V případě trackeru TK102B, nakonfigurujte jej na adresu{' '}
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
    token: 'Sledovací token',
    name: 'Název',
    maxAge: 'Maximální doba',
    maxCount: 'Maximální počet',
    generatedToken: 'bude vygenerován po uložení',
  },
  visual: {
    line: 'Křivka',
    points: 'Body',
    'line+points': 'Křivka + body',
  },
  subscribeNotFound: ({ id }) => (
    <>
      Sledovací token <i>{id}</i> neexistuje.
    </>
  ),
  subscribeError: ({ id }) => (
    <>
      Chyba sledování s tokenem <i>{id}</i>.
    </>
  ),
};

export default messages;
