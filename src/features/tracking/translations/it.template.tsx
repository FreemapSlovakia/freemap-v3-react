import { DocumentLink } from '@features/documents/components/DocumentLink.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { FaKey } from 'react-icons/fa';
import type { TrackingMessages } from './TrackingMessages.js';

const it: DeepPartialWithRequiredObjects<TrackingMessages> = {
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
  trackedDevices: {
    button: 'Visto',
    modalTitle: 'Dispositivi visti',
    desc: 'Gestisca i dispositivi visti per vedere la posizione dei suoi amici.',
    modifyTitle: (name) => (
      <>
        Modifica dispositivo osservato <i>{name}</i>
      </>
    ),
    createTitle: (name) => (
      <>
        Nuovo dispositivo osservato <i>{name}</i>
      </>
    ),
    storageWarning:
      "Tenga presente che l'elenco dei dispositivi si riflette solo nell'URL della pagina. Se vuole salvarlo, usi la funzione 'Le mie mappe'.",
  },
  accessToken: {
    token: 'Watch Token',
    timeFrom: 'Da',
    timeTo: 'A',
    listingLabel: 'Etichetta inserzione',
    note: 'Note',
    delete: (token) => (
      <>
        Vuole davvero eliminare il token <i>{token}</i>?
      </>
    ),
    deleteTitle: 'Eliminazione del token',
  },
  accessTokens: {
    modalTitle: (deviceName) => (
      <>
        Watch Tokens per <i>{deviceName}</i>
      </>
    ),
    desc: (deviceName) => (
      <>
        Definisca gli watch token per condividere la posizione del suo
        dispositivo <i>{deviceName}</i> con i suoi amici.
      </>
    ),
    createTitle: (deviceName) => (
      <>
        Nuovo token di osservazione per <i>{deviceName}</i>
      </>
    ),
    modifyTitle: ({ token, deviceName }) => (
      <>
        Modifica token di osservazione <i>{token}</i> per <i>{deviceName}</i>
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
    traccarQrCode: 'Codice QR Traccar',
    button: 'Miei dispositivi',
    modalTitle: 'Miei dispositivi tracciati',
    createTitle: 'Nuovo dispositivo di tracciamento',
    watchTokens: 'Watch token',
    watchPrivately: 'Guarda privatamente',
    watch: 'Guarda',
    delete: (name) => (
      <>
        Vuole davvero eliminare il dispositivo <i>{name}</i>?
      </>
    ),
    deleteTitle: 'Eliminazione dispositivo',
    modifyTitle: ({ name }) => (
      <>
        Modifica dispositivo di tracciamento <i>{name}</i>
      </>
    ),
    desc: () => (
      <>
        <p>
          Gestisca i suoi dispositivi in modo che gli altri possano vedere la
          sua posizione se loro il token (può crearlo tramite <FaKey /> ).
        </p>
        <hr />
        <DocumentLink doc="tracking">
          Come configurare il dispositivo tracciato
        </DocumentLink>
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
};

export default it;
