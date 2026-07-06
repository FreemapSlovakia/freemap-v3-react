import { DocumentLink } from '@features/documents/components/DocumentLink.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { FaKey } from 'react-icons/fa';
import type { TrackingMessages } from './TrackingMessages.js';

const cs: DeepPartialWithRequiredObjects<TrackingMessages> = {
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
    delete: (token) => (
      <>
        Opravdu chcete smazat sledovací token <i>{token}</i>?
      </>
    ),
    deleteTitle: 'Smazání sledovacího tokenu',
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
    traccarQrCode: 'Traccar QR kód',
    button: 'Moje zařízení',
    modalTitle: 'Moje sledovaná zařízení',
    createTitle: 'Nové zařízení',
    watchTokens: 'Sledovací tokeny',
    watchPrivately: 'Sledovat soukromě',
    watch: 'Sledovat',
    delete: (name) => (
      <>
        Opravdu chcete smazat zařízení <i>{name}</i>?
      </>
    ),
    deleteTitle: 'Smazání zařízení',
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
        <DocumentLink doc="tracking">
          Jak nastavit sledované zařízení
        </DocumentLink>
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
};

export default cs;
