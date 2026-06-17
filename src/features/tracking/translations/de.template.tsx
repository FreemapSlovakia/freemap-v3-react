import { DocumentLink } from '@features/documents/components/DocumentLink.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { FaKey } from 'react-icons/fa';
import { TrackingMessages } from './TrackingMessages.js';

const de: DeepPartialWithRequiredObjects<TrackingMessages> = {
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
    delete: (token) => (
      <>
        Möchten Sie den Zugriffstoken <i>{token}</i> wirklich löschen?
      </>
    ),
    deleteTitle: 'Löschen des Zugriffstokens',
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
    traccarQrCode: 'Traccar-QR-Code',
    button: 'Meine Geräte',
    modalTitle: 'Meine verfolgten Geräte',
    createTitle: 'Verfolgungsgerät erstellen',
    watchTokens: 'Beobachtungstoken',
    watchPrivately: 'Privat beobachten',
    watch: 'Beobachten',
    delete: (name) => (
      <>
        Möchten Sie das Gerät <i>{name}</i> wirklich löschen?
      </>
    ),
    deleteTitle: 'Löschen des Geräts',
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
        <DocumentLink doc="tracking">
          So richten Sie Ihr verfolgtes Gerät ein
        </DocumentLink>
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
};

export default de;
