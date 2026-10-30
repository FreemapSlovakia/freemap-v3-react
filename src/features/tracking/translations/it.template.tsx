import { ManualLink } from '@features/documents/components/ManualLink.js';
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
    button: 'Seguiti',
    modalTitle: 'Dispositivi seguiti',
    desc: 'Gestisca i dispositivi seguiti per vedere la posizione dei suoi amici.',
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
    token: 'Token di osservazione',
    timeFrom: 'Da',
    timeTo: 'A',
    listingLabel: "Etichetta nell'elenco",
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
        Token di osservazione per <i>{deviceName}</i>
      </>
    ),
    desc: (deviceName) => (
      <>
        Definisca i token di osservazione per condividere la posizione del suo
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
    token: 'Token di osservazione',
    label: 'Etichetta',
    fromTime: 'Da',
    maxAge: 'Età massima',
    maxCount: 'Numero massimo',
    splitDistance: 'Distanza di divisione',
    splitDuration: 'Pausa di divisione',
    color: 'Colore',
    width: 'Larghezza',
  },
  devices: {
    traccarQrCode: 'Codice QR Traccar',
    button: 'I miei dispositivi',
    modalTitle: 'I miei dispositivi tracciati',
    createTitle: 'Nuovo dispositivo di tracciamento',
    watchTokens: 'Token di osservazione',
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
        <ManualLink chapter="tracking">
          Come configurare il dispositivo tracciato
        </ManualLink>
      </>
    ),
  },
  device: {
    token: 'Token di traccia',
    name: 'Nome',
    maxAge: 'Età massima',
    maxCount: 'Numero massimo',
    generatedToken: 'sarà rigenerato al salvataggio',
  },
  visual: {
    line: 'Linea',
    points: 'Punti',
    'line+points': 'Linea + Punti',
  },
};

export default it;
