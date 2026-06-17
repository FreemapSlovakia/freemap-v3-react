import { DocumentLink } from '@features/documents/components/DocumentLink.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { FaKey } from 'react-icons/fa';
import { TrackingMessages } from './TrackingMessages.js';

const hu: DeepPartialWithRequiredObjects<TrackingMessages> = {
  subscribeNotFound: ({ id }) => (
    <>
      A(z) <i>{id}</i> figyelőkód nem létezik.
    </>
  ),
  subscribeError: ({ id }) => (
    <>
      Hiba történt a(z) <i>{id}</i> kód használatának követésekor.
    </>
  ),
  trackedDevices: {
    button: 'Figyelt',
    modalTitle: 'Figyelt eszközök',
    desc: 'Figyelt eszközök kezelése ismerősei pozíciójának megismeréséhez.',
    modifyTitle: (name) => (
      <>
        Figyelt eszköz módosításaí <i>{name}</i>
      </>
    ),
    createTitle: (name) => (
      <>
        <i>{name}</i> készülék figyelése
      </>
    ),
    storageWarning:
      'Figyelem, az eszközök listája csak az oldal URL-jében jelenik meg. Ha el szeretnéd menteni, használd a „Saját térképek” funkciót.',
  },
  accessToken: {
    token: 'Figyelőkód',
    timeFrom: 'Ettől',
    timeTo: 'Eddig',
    listingLabel: 'Felsorolási felirat',
    note: 'Megjegyzés',
    delete: (token) => (
      <>
        Biztosan törölni szeretné a(z) <i>{token}</i> hozzáférési tokent?
      </>
    ),
    deleteTitle: 'Hozzáférési token törlése',
  },
  accessTokens: {
    modalTitle: (deviceName) => (
      <>
        <i>{deviceName}</i> készülék figyelőkódjai
      </>
    ),
    desc: (deviceName) => (
      <>
        Határozzon meg figyelőkódokat, hogy <i>{deviceName}</i> készüléke
        pozícióját megoszthassa ismerőseivel.
      </>
    ),
    createTitle: (deviceName) => (
      <>
        Figyelőkód hozzáadása a(z) <i>{deviceName}</i> készülékhez
      </>
    ),
    modifyTitle: ({ token, deviceName }) => (
      <>
        A(z) <i>{deviceName}</i> készülék <i>{token}</i> figyelőkódjának
        módosítása
      </>
    ),
  },
  trackedDevice: {
    token: 'Figyelőkód',
    label: 'Felirat',
    fromTime: 'Kezdő időpont',
    maxAge: 'Legmagasabb életkor',
    maxCount: 'Legmagasabb szám',
    splitDistance: 'Távolság felosztása',
    splitDuration: 'Időtartam felosztása',
    color: 'Szín',
    width: 'Szélesség',
  },
  devices: {
    traccarQrCode: 'Traccar QR-kód',
    button: 'Készülékeim',
    modalTitle: 'Követett készülékeim',
    createTitle: 'Követendő készülék létrehozása',
    watchTokens: 'Kódok megtekintése',
    watchPrivately: 'Privát figyelés',
    watch: 'Figyelés',
    delete: (name) => (
      <>
        Biztosan törölni szeretné a(z) <i>{name}</i> készüléket?
      </>
    ),
    deleteTitle: 'Készülék törlése',
    modifyTitle: ({ name }) => (
      <>
        A(z) <i>{name}</i> készülék követésének módosítása
      </>
    ),
    desc: () => (
      <>
        <p>
          Kezelje készülékeit, hogy mások is láthassák pozícióját, ha megad
          nekik egy figyelőkódot (amelyet a <FaKey /> ikonnal hozhat létre).
        </p>
        <hr />
        <DocumentLink doc="tracking">A követett eszköz beállítása</DocumentLink>
      </>
    ),
  },
  device: {
    token: 'Követési kód',
    name: 'Név',
    maxAge: 'Legmagasabb kor',
    maxCount: 'Legmagasabb szám',
    generatedToken: 'mentéskor fog generálódni',
  },
  visual: {
    line: 'Vonal',
    points: 'Pontok',
    'line+points': 'Vonal + pontok',
  },
};

export default hu;
