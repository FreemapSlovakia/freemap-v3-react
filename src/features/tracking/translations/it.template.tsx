import { FaKey } from 'react-icons/fa';
import { DeepPartialWithRequiredObjects } from '../../../shared/types/deepPartial.js';
import { Messages } from './messagesInterface.js';

const messages: DeepPartialWithRequiredObjects<Messages> = {
  trackedDevices: {
    button: 'Visto',
    modalTitle: 'Dispositivi visti',
    desc: 'Gestisci i dispositivi viti per vedere la posizione dei tuoi amici.',
    modifyTitle: (name) => (
      <>
        Modifica nome dispositivo <i>{name}</i>
      </>
    ),
    createTitle: (name) => (
      <>
        Vedi dispositivo <i>{name}</i>
      </>
    ),
    storageWarning:
      "Tieni presente che l'elenco dei dispositivi si riflette solo nell'URL della pagina. Se vuoi salvarlo, usa la funzione 'Le mie mappe'.",
  },
  accessToken: {
    token: 'Watch Token',
    timeFrom: 'Da',
    timeTo: 'A',
    listingLabel: 'Etichetta inserzione',
    note: 'Note',
    delete: 'Eliminare il token?',
  },
  accessTokens: {
    modalTitle: (deviceName) => (
      <>
        Watch Tokens per <i>{deviceName}</i>
      </>
    ),
    desc: (deviceName) => (
      <>
        Definisci gli watch token per condividere la posizione del tuo
        dispositivo <i>{deviceName}</i> con i tuoi amici.
      </>
    ),
    createTitle: (deviceName) => (
      <>
        Aggiungi Watch Token per <i>{deviceName}</i>
      </>
    ),
    modifyTitle: ({ token, deviceName }) => (
      <>
        Modifica Watch Token <i>{token}</i> per <i>{deviceName}</i>
      </>
    ),
  },
  trackedDevice: {
    token: 'Watch Token',
    label: 'Etichetta',
    fromTime: 'Da',
    maxAge: 'Durata Massima',
    maxCount: 'Conteggio massimo',
    splitDistance: 'Dividi distanza',
    splitDuration: 'Divita durata',
    color: 'Colore',
    width: 'Larghezza',
  },
  devices: {
    button: 'Miei dispositivi',
    modalTitle: 'Miei dispositivi tracciati',
    createTitle: 'Crea dispositivo di tracciamento',
    watchTokens: 'Watch token',
    watchPrivately: 'Guarda privatamente',
    watch: 'Guarda',
    delete: 'Eliminare dispositivo?',
    modifyTitle: ({ name }) => (
      <>
        Modifica dispositivo di tracciamento <i>{name}</i>
      </>
    ),
    desc: () => (
      <>
        <p>
          Gestisci i tuoi dispositivi in modo che gli altri possano vedere la
          tua posizione se loro il token (puoi crearlo tramite <FaKey /> ).
        </p>
        <hr />
        <p>
          Inserisci questo URL sul tuo tracker (eg.{' '}
          <a href="https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking">
            Locus
          </a>{' '}
          o OsmAnd):{' '}
          <code>
            {process.env['API_URL']}/tracking/track/<i>token</i>
          </code>{' '}
          dove <i>token</i> è elencato nella tabella sotto.
        </p>
        <p>
          L\'endpoint supporta HTTP<code>GET</code> o <code>POST</code>
          con i parametri codificati URL:
        </p>
        <ul>
          <li>
            <code>lat</code> - latitudine in gradi (obbligatoria)
          </li>
          <li>
            <code>lon</code> - longitudine in gradi (obbligatoria)
          </li>
          <li>
            <code>time</code>, <code>timestamp</code> - datetime parsabile in
            JavaScript o time Unix in s o ms
          </li>
          <li>
            <code>alt</code>, <code>altitude</code> - altitudine in metri
          </li>
          <li>
            <code>speed</code> - velocità in m/s
          </li>
          <li>
            <code>speedKmh</code> - velocità in km/h
          </li>
          <li>
            <code>acc</code> - precisione in metri
          </li>
          <li>
            <code>hdop</code> - DOP orizzontale
          </li>
          <li>
            <code>bearing</code> - gradi
          </li>
          <li>
            <code>battery</code> - batteria in percentuale
          </li>
          <li>
            <code>gsm_signal</code> - Segnale GSM in percentuale
          </li>
          <li>
            <code>message</code> - messagggio (note)
          </li>
        </ul>
        <hr />
        <p>
          In caso di dispositivo TK102B, configura il suo indirizzo come{' '}
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
    token: 'Token di traccia',
    name: 'Nome',
    maxAge: 'Durata massima',
    maxCount: 'Conteggio massimo',
    generatedToken: 'sarà rigenerato al salvataggio',
  },
  visual: {
    line: 'Linea',
    points: 'Punti',
    'line+points': 'Linea + Punti',
  },
  subscribeNotFound: ({ id }) => (
    <>
      Il token <i>{id}</i> non esiste.
    </>
  ),
  subscribeError: ({ id }) => (
    <>
      Errore nell'utilizzo del token <i>{id}</i>.
    </>
  ),
};

export default messages;
