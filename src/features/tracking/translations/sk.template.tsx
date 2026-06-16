import { DocumentLink } from '@features/documents/components/DocumentLink.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { FaKey } from 'react-icons/fa';
import { TrackingMessages } from './TrackingMessages.js';

const sk: DeepPartialWithRequiredObjects<TrackingMessages> = {
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
    delete: (token) => (
      <>
        Naozaj chcete zmazať token sledovania <i>{token}</i>?
      </>
    ),
    deleteTitle: 'Zmazanie tokenu sledovania',
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
    traccarQrCode: 'Traccar QR kód',
    button: 'Moje zariadenia',
    modalTitle: 'Moje zariadenia',
    createTitle: 'Pridať zariadenie',
    watchTokens: 'Sledovacie tokeny',
    watchPrivately: 'Sledovať privátne',
    watch: 'Sledovať',
    delete: (name) => (
      <>
        Naozaj chcete odstrániť zariadenie <i>{name}</i>?
      </>
    ),
    deleteTitle: 'Odstránenie zariadenia',
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
        <DocumentLink doc="tracking">
          Ako nastaviť sledované zariadenie
        </DocumentLink>
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
};

export default sk;
