import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { CachedMapsMessages } from './CachedMapsMessages.js';

const sl: DeepPartialWithRequiredObjects<CachedMapsMessages> = {
  cacheOfflineMap: 'Shrani zemljevid za uporabo brez povezave',
  modifyOfflineMap: 'Uredi zemljevid brez povezave',
  toDownload: 'Za prenos',
  addOfflineMap: 'Dodaj zemljevid brez povezave',
  emptyMessage:
    'Zaenkrat ni shranjenih zemljevidov brez povezave. Dodajte enega za uporabo zemljevidov brez internetne povezave.',
  zoom: 'Približava',
  tiles: 'Ploščice',
  size: 'Velikost',
  ready: 'Pripravljen',
  incomplete: ({ pct }) => <>Nepopoln ({pct} %)</>,
  resume: 'Nadaljuj',
  stop: 'Ustavi',
  total: 'Skupaj',
  largeDownload: ({ tiles, size }) => (
    <>
      Veliko prenašanje: {tiles} ploščic (~{size}). To lahko traja nekaj časa.
    </>
  ),
  notEnoughSpace: ({ size, free }) => (
    <>
      Premalo prostora: prenos potrebuje približno {size}, v tem brskalniku pa
      je na voljo le {free}. Ustavil bi se na pol poti.
    </>
  ),
  estSize: 'Ocenjena velikost',
  startCaching: 'Začni prenašanje',
  cachedSuccess: ({ name }) => `Zemljevid »${name}« je bil uspešno prenesen.`,
  activate: 'Aktiviraj',
  focus: 'Približaj na območje',
  namePrefix: 'Brez povezave',
  offlineWiden:
    'Brez povezave je ta zemljevid mogoče le zmanjšati, ne pa povečati — pri povečanju bi bilo treba prenesti ploščice, ki jih ne vsebuje.',
  premiumZoomHint:
    'Najpodrobnejše ravni povečave te plasti so premium. Zemljevid brez povezave ploščice obdrži trajno in jih prikazuje tudi brez povezave, zato je za njihov prenos potreben premium dostop.',
  premiumWiden:
    'Ta zemljevid sega v premium ravni povečave. Brez premium dostopa ga je mogoče pomanjšati, ne pa povečati — s povečavo bi se premium ploščice prenesle znova.',
  premiumSkipped:
    'Najpodrobnejše ravni povečave tega zemljevida so premium in se niso prenesle, zato ostaja označen kot nepopoln.',
  networkFallback: 'Manjkajoče ploščice prenesi iz interneta',
  networkFallbackHint:
    'Vklopljeno: ob premiku zunaj prenesenega območja ali večji približavi se prikažejo žive ploščice, dokler je internetna povezava. Izklopljeno: zemljevid prikaže le tisto, kar je bilo preneseno.',
  deleteTitle: 'Izbriši zemljevid brez povezave',
  deleteConfirm: ({ name }) => (
    <>
      Res izbrisati zemljevid brez povezave <b>{name}</b> z vsemi njegovimi
      ploščicami?
    </>
  ),
  browse: {
    intro:
      'Ploščice, na katere naletite na zemljevidu, je mogoče shraniti za pozneje, da se že obiskana območja naložijo tudi brez interneta. To velja za vse ploščične sloje in je neodvisno od prenesenih zemljevidov brez povezave.',
    mode: 'Vir ploščic',
    modes: {
      networkOnly: 'Samo internet',
      networkFirst: 'Internet, nato predpomnilnik',
      cacheFirst: 'Predpomnilnik, nato internet',
      cacheOnly: 'Samo predpomnilnik',
    },
    store: 'Shranjuj ploščice, prenesene iz interneta',
    maxAge: 'Hrani ploščice',
    maxSize: 'Omejitev velikosti',
    days: ({ days }) => <>{days} dni</>,
    keepForever: 'Dokler je prostor',
    noSizeLimit: 'Brez omejitve',
    retentionHint:
      'Ploščice po pretečenem času se zavržejo, ob preseženi omejitvi velikosti pa gredo najdlje neprikazane.',
    cached: ({ tiles, size }) => (
      <>
        Shranjeno: <strong>{tiles}</strong> ploščic ({size})
      </>
    ),
    clear: 'Počisti predpomnilnik',
    clearConfirm:
      'Res zavreči vse ploščice, shranjene med brskanjem? Nastavitve ostanejo.',
  },
};

export default sl;
