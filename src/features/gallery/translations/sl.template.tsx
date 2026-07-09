import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { GalleryMessages } from './GalleryMessages.js';

const sl: DeepPartialWithRequiredObjects<GalleryMessages> = {
  sendGalleryEmails: 'Obveščaj o komentarjih k fotografijam po e-pošti',
  stats: {
    leaderboard: 'Lestvica',
    country: 'Država',
    perUserPerCountry: 'Fotografije na avtorja na državo',
    perUser: 'Fotografije na avtorja',
    more: 'Več',
    less: 'Manj',
    user: 'Avtor',
    photos: 'Fotografij',
    numberOfPhotos: 'Število fotografij',
    timePeriod: 'Časovno obdobje',
    allTime: 'Ves čas',
    last3months: 'Zadnji 3 meseci',
    last30days: 'Zadnjih 30 dni',
  },
  legend: 'Legenda',
  recentTags: 'Nedavne oznake za dodelitev:',
  filter: 'Filter',
  showPhotosFrom: 'Prikaži fotografije',
  showLayer: 'Prikaži sloj',
  upload: 'Naloži',
  f: {
    '-createdAt': 'od nazadnje naložene',
    '-takenAt': 'od najnovejše',
    '-rating': 'od najbolje ocenjene',
    '-lastCommentedAt': 'od zadnjega komentarja',
  },
  colorizeBy: 'Obarvaj po',
  showDirection: 'Prikaži smer fotografiranja',
  c: {
    disable: 'Ne obarvaj',
    mine: 'Razlikuj moje',
    userId: 'Avtor',
    rating: 'Ocena',
    takenAt: 'Datum fotografiranja',
    createdAt: 'Datum nalaganja',
    season: 'Letni čas',
    premium: 'Premium',
    license: 'Licenca',
  },
  viewer: {
    title: 'Fotografija',
    comments: 'Komentarji',
    newComment: 'Nov komentar',
    addComment: 'Dodaj',
    yourRating: 'Tvoja ocena:',
    showOnTheMap: 'Prikaži na zemljevidu',
    openInNewWindow: 'Odpri v…',
    uploaded: ({ username, createdAt }) => (
      <>
        Naložil {username} dne {createdAt}
      </>
    ),
    captured: (takenAt) => <>Posneto dne {takenAt}</>,
    deletePrompt: (title) =>
      title ? (
        <>
          Ali res želite izbrisati sliko <i>{title}</i>?
        </>
      ) : (
        <>Ali res želite izbrisati to sliko?</>
      ),
    deleteTitle: 'Brisanje slike',
    modify: 'Uredi',
    premiumOnly:
      'To fotografijo je avtor dal na voljo samo uporabnikom s premium dostopom.',
    noComments: 'Ni komentarjev',
  },
  editForm: {
    name: 'Ime',
    description: 'Opis',
    takenAt: {
      datetime: 'Datum in čas fotografiranja',
      date: 'Datum fotografiranja',
      time: 'Čas fotografiranja',
    },
    location: 'Lokacija',
    azimuth: 'Azimut',
    tags: 'Oznake',
    setLocation: 'Nastavi lokacijo',
  },
  uploadModal: {
    title: 'Naloži fotografije',
    uploading: (n) => `Nalaganje (${n})`,
    upload: 'Naloži',
    rules: `
      <p>Povlecite fotografije sem ali kliknite tukaj za njihovo izbiro.</p>
      <ul>
        <li>Ne nalagajte premajhnih fotografij (sličic). Največje mere niso omejene. Največja velikost datoteke je omejena na 10 MB. Večje datoteke bodo zavrnjene.</li>
        <li>Nalagajte samo fotografije krajine ali dokumentacijske slike. Portreti in makro fotografije so nezaželeni in bodo izbrisani brez opozorila.</li>
        <li>Nalagajte samo lastne fotografije.</li>
        <li>Napisi ali komentarji, ki se ne nanašajo neposredno na vsebino naloženih fotografij ali nasprotujejo splošno sprejetim načelom civiliziranega sobivanja, bodo odstranjeni. Kršitelji tega pravila bodo opozorjeni, ob ponavljajočih se kršitvah pa je njihov račun v aplikaciji lahko ukinjen.</li>
        <li>Z nalaganjem fotografij se strinjate, da bodo razširjane pod pogoji licence, ki jo izberete za vsako od njih (privzeto CC BY-SA 4.0).</li>
        <li>Upravljavec (Freemap.sk) se s tem odreka vsakršni odgovornosti in ne odgovarja za neposredno ali posredno škodo, nastalo z objavo fotografije v galeriji. Za fotografijo je v celoti odgovorna oseba, ki je sliko naložila na strežnik.</li>
        <li>Upravljavec si pridržuje pravico do urejanja opisa, imena, položaja in oznak fotografije ali do izbrisa fotografije, če je vsebina neprimerna (krši ta pravila).</li>
        <li>Upravljavec si pridržuje pravico do izbrisa računa v primeru, da uporabnik ponavljajoče krši pravila galerije z objavljanjem neprimerne vsebine.</li>
      </ul>
    `,
    success: 'Fotografije so bile uspešno naložene.',
    showPreview:
      'Samodejno prikaži predoglede (porabi več procesorske moči in pomnilnika)',
    loadPreview: 'Naloži predogled',
    premium: 'Daj na voljo samo uporabnikom s premium dostopom',
  },
  license: {
    label: 'Licenca',
    chooseForAll: 'Nastavi licenco vseh mojih fotografij',
    changeNote:
      'Sprememba licence velja le za prihodnjo uporabo; prej pridobljene kopije obdržijo licenco, pod katero so bile dane.',
    since: 'Od',
    names: {
      'CC0-1.0': 'CC0 1.0 (javna domena)',
      'CC-BY-4.0': 'CC BY 4.0',
      'CC-BY-SA-4.0': 'CC BY-SA 4.0',
      'CC-BY-NC-4.0': 'CC BY-NC 4.0',
      'CC-BY-NC-SA-4.0': 'CC BY-NC-SA 4.0',
    },
    descriptions: {
      'CC0-1.0':
        'Odpoveste se vsem pravicam in fotografijo objavite kot javno domeno — vsakdo jo lahko uporabi za karkoli brez navedbe avtorja.',
      'CC-BY-4.0':
        'Drugi lahko fotografijo delijo in predelujejo, tudi komercialno, če navedejo avtorja.',
      'CC-BY-SA-4.0':
        'Drugi lahko fotografijo delijo in predelujejo, tudi komercialno, če navedejo avtorja in svoje delo delijo pod isto licenco.',
      'CC-BY-NC-4.0':
        'Drugi lahko fotografijo delijo in predelujejo za nekomercialne namene, če navedejo avtorja.',
      'CC-BY-NC-SA-4.0':
        'Drugi lahko fotografijo delijo in predelujejo za nekomercialne namene, če navedejo avtorja in svoje delo delijo pod isto licenco.',
    },
  },
  locationPicking: {
    title: 'Izberite lokacijo fotografije',
  },
  deletingError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri brisanju fotografije', err),
  tagsFetchingError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri nalaganju oznak', err),
  pictureFetchingError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri nalaganju fotografije', err),
  picturesFetchingError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri nalaganju fotografij', err),
  savingError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri shranjevanju fotografije', err),
  commentAddingError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri dodajanju komentarja', err),
  ratingError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri ocenjevanju fotografije', err),
  missingPositionError: 'Manjka lokacija.',
  invalidPositionError: 'Neveljaven format koordinat lokacije.',
  invalidTakenAt: 'Neveljaven datum in čas fotografiranja.',
  filterModal: {
    title: 'Filtriranje fotografij',
    tag: 'Oznaka',
    createdAt: 'Datum nalaganja',
    takenAt: 'Datum fotografiranja',
    author: 'Avtor',
    rating: 'Ocena',
    noTags: 'brez oznak',
    pano: 'Panorama',
    premium: 'Premium',
  },
  noPicturesFound: 'Na tem mestu ni bilo najdenih nobenih fotografij.',
  linkToWww: 'fotografija na www.freemap.sk',
  linkToImage: 'slikovna datoteka fotografije',
  allMyPhotos: {
    title: 'Sprememba dostopa',
    premium: 'Vključi vse moje fotografije v premium vsebino',
    free: 'Daj vse moje fotografije na voljo vsem',
    confirmPremium:
      'Vključim vse vaše fotografije v premium vsebino? Videli jih bodo lahko samo uporabniki s premium dostopom.',
    confirmFree: 'Dam vse vaše fotografije na voljo vsem?',
    confirmLicense: (license) =>
      `Nastavim licenco vseh vaših fotografij na ${license}? Fotografije, ki že uporabljajo drugo licenco, bodo odslej ponovno licencirane.`,
  },
};

export default sl;
