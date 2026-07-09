import { DocumentLink } from '@features/documents/components/DocumentLink.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { FaKey } from 'react-icons/fa';
import type { TrackingMessages } from './TrackingMessages.js';

const fr: DeepPartialWithRequiredObjects<TrackingMessages> = {
  subscribeNotFound: ({ id }) => (
    <>
      Le jeton de suivi <i>{id}</i> n’existe pas.
    </>
  ),
  subscribeError: ({ id }) => (
    <>
      Erreur de suivi avec le jeton <i>{id}</i>.
    </>
  ),
  trackedDevices: {
    button: 'Suivis',
    modalTitle: 'Appareils suivis',
    desc: 'Gérez les appareils suivis pour voir la position de vos amis.',
    modifyTitle: (name) => (
      <>
        Modifier l’appareil suivi <i>{name}</i>
      </>
    ),
    createTitle: (name) => (
      <>
        Suivre l’appareil <i>{name}</i>
      </>
    ),
    storageWarning:
      'Veuillez noter que la liste des appareils n’est enregistrée que dans l’URL de la page. Si vous souhaitez la conserver, utilisez la fonction « Mes cartes ».',
  },
  accessToken: {
    token: 'Jeton de suivi',
    timeFrom: 'De',
    timeTo: 'À',
    listingLabel: 'Libellé dans la liste',
    note: 'Note',
    delete: (token) => (
      <>
        Voulez-vous vraiment supprimer le jeton d’accès <i>{token}</i> ?
      </>
    ),
    deleteTitle: 'Suppression du jeton d’accès',
  },
  accessTokens: {
    modalTitle: (deviceName) => (
      <>
        Jetons de suivi pour <i>{deviceName}</i>
      </>
    ),
    desc: (deviceName) => (
      <>
        Définissez des jetons de suivi pour partager la position de votre
        appareil <i>{deviceName}</i> avec vos amis.
      </>
    ),
    createTitle: (deviceName) => (
      <>
        Ajouter un jeton de suivi pour <i>{deviceName}</i>
      </>
    ),
    modifyTitle: ({ token, deviceName }) => (
      <>
        Modifier le jeton de suivi <i>{token}</i> pour <i>{deviceName}</i>
      </>
    ),
  },
  trackedDevice: {
    token: 'Jeton de suivi',
    label: 'Libellé',
    fromTime: 'Positions depuis',
    maxAge: 'Position la plus ancienne',
    maxCount: 'Nombre maximal de positions',
    splitDistance: 'Distance de fractionnement',
    splitDuration: 'Pause de fractionnement',
    color: 'Couleur',
    width: 'Largeur',
  },
  devices: {
    traccarQrCode: 'Code QR Traccar',
    button: 'Mes appareils',
    modalTitle: 'Mes appareils suivis',
    createTitle: 'Créer un appareil de suivi',
    watchTokens: 'Jetons de suivi',
    watchPrivately: 'Suivre en privé',
    watch: 'Suivre',
    delete: (name) => (
      <>
        Voulez-vous vraiment supprimer l’appareil <i>{name}</i> ?
      </>
    ),
    deleteTitle: 'Suppression de l’appareil',
    modifyTitle: ({ name }) => (
      <>
        Modifier l’appareil de suivi <i>{name}</i>
      </>
    ),
    desc: () => (
      <>
        <p>
          Gérez vos appareils afin que d’autres puissent suivre votre position
          si vous leur communiquez un jeton de suivi (vous pouvez le créer via
          l’icône <FaKey />
          ).
        </p>

        <hr />

        <DocumentLink doc="tracking">
          Comment configurer votre appareil suivi
        </DocumentLink>
      </>
    ),
  },
  device: {
    token: 'Jeton d’enregistrement',
    name: 'Nom',
    maxAge: 'Position la plus ancienne',
    maxCount: 'Nombre maximal de positions',
    generatedToken: 'sera généré à l’enregistrement',
  },
  visual: {
    line: 'Ligne',
    points: 'Positions',
    'line+points': 'Ligne + Positions',
  },
};

export default fr;
