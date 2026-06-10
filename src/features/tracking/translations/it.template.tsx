import { DocumentLink } from '@features/documents/components/DocumentLink.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { FaKey } from 'react-icons/fa';
import { TrackingMessages } from './TrackingMessages.js';

const it: DeepPartialWithRequiredObjects<TrackingMessages> = {
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
    delete: (token) => (
      <>
        Vuoi davvero eliminare il token <i>{token}</i>?
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
    delete: (name) => (
      <>
        Vuoi davvero eliminare il dispositivo <i>{name}</i>?
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
          Gestisci i tuoi dispositivi in modo che gli altri possano vedere la
          tua posizione se loro il token (puoi crearlo tramite <FaKey /> ).
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
