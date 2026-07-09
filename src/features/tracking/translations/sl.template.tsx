import { DocumentLink } from '@features/documents/components/DocumentLink.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { FaKey } from 'react-icons/fa';
import type { TrackingMessages } from './TrackingMessages.js';

const sl: DeepPartialWithRequiredObjects<TrackingMessages> = {
  subscribeNotFound: ({ id }) => (
    <>
      Žeton za sledenje <i>{id}</i> ne obstaja.
    </>
  ),
  subscribeError: ({ id }) => (
    <>
      Napaka pri sledenju z žetonom <i>{id}</i>.
    </>
  ),
  trackedDevices: {
    button: 'Sledene naprave',
    modalTitle: 'Sledene naprave',
    desc: 'Tu lahko upravljate sledene naprave, da vidite položaj svojih prijateljev.',
    modifyTitle: (name) => (
      <>
        Uredi sledeno napravo <i>{name}</i>
      </>
    ),
    createTitle: (name) => (
      <>
        Sledi napravi <i>{name}</i>
      </>
    ),
    storageWarning:
      'Bodite pozorni, da se seznam naprav odraža le v naslovu URL strani. Če ga želite shraniti, uporabite funkcijo "Moji zemljevidi".',
  },
  accessToken: {
    token: 'Žeton za sledenje',
    timeFrom: 'Od',
    timeTo: 'Do',
    listingLabel: 'Oznaka v seznamu',
    note: 'Opomba',
    delete: (token) => (
      <>
        Ali res želite izbrisati žeton za sledenje <i>{token}</i>?
      </>
    ),
    deleteTitle: 'Izbris žetona za sledenje',
  },
  accessTokens: {
    modalTitle: (deviceName) => (
      <>
        Žetoni za sledenje za <i>{deviceName}</i>
      </>
    ),
    desc: (deviceName) => (
      <>
        Določite žetone za sledenje, da lahko delite položaj svoje naprave{' '}
        <i>{deviceName}</i> s svojimi prijatelji.
      </>
    ),
    createTitle: (deviceName) => (
      <>
        Dodaj žeton za sledenje za <i>{deviceName}</i>
      </>
    ),
    modifyTitle: ({ token, deviceName }) => (
      <>
        Uredi žeton za sledenje <i>{token}</i> za <i>{deviceName}</i>
      </>
    ),
  },
  trackedDevice: {
    token: 'Žeton za sledenje',
    label: 'Oznaka',
    fromTime: 'Položaji od',
    maxAge: 'Najstarejši položaj',
    maxCount: 'Največje število položajev',
    splitDistance: 'Razdalja za razdelitev',
    splitDuration: 'Premor za razdelitev',
    color: 'Barva',
    width: 'Širina',
  },
  devices: {
    button: 'Moje naprave',
    modalTitle: 'Moje naprave',
    createTitle: 'Dodaj napravo',
    watchTokens: 'Žetoni za sledenje',
    traccarQrCode: 'Traccar QR koda',
    watchPrivately: 'Sledi zasebno',
    watch: 'Sledi',
    delete: (name) => (
      <>
        Ali res želite odstraniti napravo <i>{name}</i>?
      </>
    ),
    deleteTitle: 'Odstranitev naprave',
    modifyTitle: ({ name }) => (
      <>
        Uredi napravo <i>{name}</i>
      </>
    ),
    desc: () => (
      <>
        <p>
          Tu lahko upravljate svoje naprave. Drugi lahko spremljajo vaš položaj,
          če jim ustvarite žeton za sledenje (ustvarite ga lahko z gumbom{' '}
          <FaKey />
          ).
        </p>

        <hr />

        <DocumentLink doc="tracking">
          Kako nastaviti sledeno napravo
        </DocumentLink>
      </>
    ),
  },
  device: {
    token: 'Žeton za zapisovanje',
    name: 'Ime',
    maxAge: 'Najstarejši položaj',
    maxCount: 'Največje število položajev',
    generatedToken: 'bo ustvarjen ob shranjevanju',
  },
  visual: {
    line: 'Črta',
    points: 'Položaji',
    'line+points': 'Črta + Položaji',
  },
};

export default sl;
