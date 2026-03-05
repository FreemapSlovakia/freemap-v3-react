import { FaKey } from 'react-icons/fa';
import { DeepPartialWithRequiredObjects } from '../../../shared/types/deepPartial.js';
import { Messages } from './messagesInterface.js';

const messages: DeepPartialWithRequiredObjects<Messages> = {
  trackedDevices: {
    button: 'Beobachtet',
    modalTitle: 'Beobachtete Geräte',
    desc: 'Verwalte beobachtete Geräte, um die Position deiner Freunde zu sehen.',
    modifyTitle: (name) => (
      <>
        Beobachtetes Gerät bearbeiten <i>{name}</i>
      </>
    ),
    createTitle: (name) => (
      <>
        Gerät beobachten <i>{name}</i>
      </>
    ),
    storageWarning:
      'Bitte beachte, dass die Geräteliste nur in der Seiten-URL enthalten ist. Wenn du sie speichern möchtest, nutze die Funktion „Meine Karten“.',
  },

  accessToken: {
    token: 'Beobachtungs-Token',
    timeFrom: 'Von',
    timeTo: 'Bis',
    listingLabel: 'Gerätename',
    note: 'Notiz',
    delete: 'Zugriffstoken löschen?',
  },

  accessTokens: {
    modalTitle: (deviceName) => (
      <>
        Beobachtungs-Tokens für <i>{deviceName}</i>
      </>
    ),

    desc: (deviceName) => (
      <>
        Definieren Sie Beobachtungs-Tokens, um die Position Ihres Geräts{' '}
        <i>{deviceName}</i> mit Ihren Freunden zu teilen.
      </>
    ),

    createTitle: (deviceName) => (
      <>
        Beobachtungs-Token hinzufügen für <i>{deviceName}</i>
      </>
    ),

    modifyTitle: ({ token, deviceName }) => (
      <>
        Beobachtungs-Token <i>{token}</i> bearbeiten für <i>{deviceName}</i>
      </>
    ),
  },
  trackedDevice: {
    token: 'Beobachtungs-Token',
    label: 'Bezeichnung',
    fromTime: 'Seit',
    maxAge: 'Maximales Alter',
    maxCount: 'Maximale Anzahl',
    splitDistance: 'Distanzaufteilung',
    splitDuration: 'Zeitaufteilung',
    color: 'Farbe',
    width: 'Breite',
  },
  devices: {
    button: 'Meine Geräte',
    modalTitle: 'Meine verfolgten Geräte',
    createTitle: 'Verfolgungsgerät erstellen',
    watchTokens: 'Beobachtungstoken',
    watchPrivately: 'Privat beobachten',
    watch: 'Beobachten',
    delete: 'Gerät löschen?',
    modifyTitle: ({ name }) => (
      <>
        Verfolgungsgerät bearbeiten <i>{name}</i>
      </>
    ),
    desc: () => (
      <>
        <p>
          Verwalten Sie Ihre Geräte, damit andere Ihre Position sehen können,
          wenn Sie ihnen einen Beobachtungstoken geben (kann über das <FaKey />
          -Symbol erstellt werden).
        </p>
        <hr />
        <p>
          Geben Sie die folgende URL in Ihrem Tracker ein (z. B.{' '}
          <a href="https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking">
            Locus
          </a>{' '}
          oder OsmAnd):{' '}
          <code>
            {process.env['API_URL']}/tracking/track/<i>token</i>
          </code>{' '}
          wobei <i>token</i> in der untenstehenden Tabelle aufgelistet ist.
        </p>
        <p>
          Der Endpunkt unterstützt HTTP-Methoden <code>GET</code> oder{' '}
          <code>POST</code> mit URL-kodierten Parametern:
        </p>
        <ul>
          <li>
            <code>lat</code> – Breitengrad in Grad (erforderlich)
          </li>
          <li>
            <code>lon</code> – Längengrad in Grad (erforderlich)
          </li>
          <li>
            <code>time</code>, <code>timestamp</code> – in JavaScript
            parsierbares Datum oder Unix-Zeit in Sekunden oder Millisekunden
          </li>
          <li>
            <code>alt</code>, <code>altitude</code> – Höhe in Metern
          </li>
          <li>
            <code>speed</code> – Geschwindigkeit in m/s
          </li>
          <li>
            <code>speedKmh</code> – Geschwindigkeit in km/h
          </li>
          <li>
            <code>acc</code> – Genauigkeit in Metern
          </li>
          <li>
            <code>hdop</code> – horizontale Positionsgenauigkeit (HDOP)
          </li>
          <li>
            <code>bearing</code> – Richtung in Grad
          </li>
          <li>
            <code>battery</code> – Akkustand in Prozent
          </li>
          <li>
            <code>gsm_signal</code> – GSM-Signal in Prozent
          </li>
          <li>
            <code>message</code> – Nachricht (Notiz)
          </li>
        </ul>
        <hr />
        <p>
          Im Fall eines TK102B-Trackers konfigurieren Sie die Adresse auf:{' '}
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
    token: 'Tracking-Token',
    name: 'Name',
    maxAge: 'Maximales Alter',
    maxCount: 'Maximale Anzahl',
    generatedToken: 'wird beim Speichern generiert',
  },
  visual: {
    line: 'Linie',
    points: 'Punkte',
    'line+points': 'Linie + Punkte',
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
