import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { GalleryMessages } from './GalleryMessages.js';

const sk: DeepPartialWithRequiredObjects<GalleryMessages> = {
  sendGalleryEmails: 'Upozorniť emailom na komentáre k fotkám',
  stats: {
    leaderboard: 'Rebríček',
    country: 'Krajina',
    perUserPerCountry: 'Fotky na autora na krajinu',
    perUser: 'Fotky na autora',
    more: 'Viac',
    less: 'Menej',
    user: 'Autor',
    photos: 'Fotiek',
    numberOfPhotos: 'Počet fotiek',
    timePeriod: 'Časové obdobie',
    allTime: 'Celý čas',
    last3months: 'Posledné 3 mesiace',
    last30days: 'Posledných 30 dní',
  },
  legend: 'Legenda',
  recentTags: 'Nedávne tagy na priradenie:',
  filter: 'Filter',
  showPhotosFrom: 'Prezerať fotky',
  showLayer: 'Zobraziť vrstvu',
  upload: 'Nahrať',
  f: {
    '-createdAt': 'od poslednej nahranej',
    '-takenAt': 'od najnovšie odfotenej',
    '-rating': 'od najvyššieho hodnotenia',
    '-lastCommentedAt': 'od posledného komentára',
  },
  colorizeBy: 'Vyfarbiť podľa',
  showDirection: 'Zobraziť smer fotenia',
  c: {
    disable: 'Nevyfarbiť',
    mine: 'Odlíšiť moje',
    userId: 'Autor',
    rating: 'Hodnotenie',
    takenAt: 'Dátum odfotenia',
    createdAt: 'Dátum nahrania',
    season: 'Ročné obdobe',
    premium: 'Prémiové',
  },
  viewer: {
    title: 'Fotografia',
    comments: 'Komentáre',
    newComment: 'Nový komentár',
    addComment: 'Pridať',
    yourRating: 'Tvoje hodnotenie:',
    showOnTheMap: 'Ukázať na mape',
    openInNewWindow: 'Otvoriť v…',
    uploaded: ({ username, createdAt }) => (
      <>
        Nahral {username} dňa {createdAt}
      </>
    ),
    captured: (takenAt) => <>Odfotené dňa {takenAt}</>,
    deletePrompt: (title) =>
      title ? (
        <>
          Naozaj chcete zmazať obrázok <i>{title}</i>?
        </>
      ) : (
        <>Naozaj chcete zmazať tento obrázok?</>
      ),
    deleteTitle: 'Zmazanie obrázka',
    modify: 'Úprava',
    premiumOnly:
      'Túto fotografiu sprístupnil jej autor len používateľom s prémiovým prístupom.',
    noComments: 'Bez komentára',
  },
  editForm: {
    name: 'Názov',
    description: 'Popis',
    takenAt: {
      datetime: 'Dátum a čas fotenia',
      date: 'Dátum fotenia',
      time: 'Čas fotenia',
    },
    location: 'Pozícia',
    azimuth: 'Azimut',
    tags: 'Tagy',
    setLocation: 'Nastaviť pozíciu',
  },
  uploadModal: {
    title: 'Nahrať fotky',
    uploading: (n) => `Nahrávam (${n})`,
    upload: 'Nahrať',
    rules: `
      <p>Potiahnite sem fotky alebo kliknite sem pre ich výber.</p>
      <ul>
        <li>Nevkladajte príliš malé obrázky (miniatúry). Maximálny rozmer nie je obmedzený, je však obmedzená veľkosť súboru na max. 10 MB. Väčšie súbory server odmietne.</li>
        <li>Vkladajte len fotografie krajiny, vrátane dokumentačných fotografií. Portréty a makro-fotografie sú považované za nevhodný obsah a budú bez varovania odstránené.</li>
        <li>Nahrávajte len vlastné fotografie, alebo fotografie, pre ktoré máte udelený súhlas na zdieľanie.</li>
        <li>Popisky, alebo komentáre, ktoré sa priamo netýkajú obsahu načítaných fotografií, alebo odporujú všeobecne prijímaným zásadám civilizovaného spolužitia, budú odstránené. Porušovatelia tohoto pravidla budú varovaní a pri opakovanom porušovaní môže byť ich účet v aplikácii zrušený.</li>
        <li>Nahraté fotografie sú ďalej šírené pod licenciou CC BY-SA 4.0.</li>
        <li>Prevádzkovateľ Freemap.sk sa týmto zbavuje akejkoľvek zodpovednosti a nezodpovedá za priame ani nepriame škody vzniknuté uverejnením fotografie v galérii, za fotografiu nesie plnú zodpovednosť osoba, ktorá fotografiu na server uložila.</li>
        <li>Prevádzkovateľ si vyhradzuje právo upraviť popis, názov, pozíciu a tagy fotografie, alebo fotografiu odstrániť, ak je jej obsah nevhodný (porušuje tieto pravidlá).</li>
        <li>Prevádzkovateľ si vyhradzuje právo zrušiť konto v prípade, že používateľ opakovane porušuje pravidlá galérie uverejňovaním nevhodného obsahu.</li>
      </ul>
    `,
    success: 'Fotografie boli úspešne nahrané.',
    showPreview: 'Automaticky zobraziť náhľady (náročnejšie na výkon a pamäť)',
    loadPreview: 'Načítať náhľad',
    premium: 'Sprístupniť len používateľom s prémiovým prístupom',
  },
  locationPicking: {
    title: 'Zvoľte pozíciu fotografie',
  },
  deletingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri mazaní obrázka', err),
  tagsFetchingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri načítavaní tagov', err),
  pictureFetchingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri načítavaní fotky', err),
  picturesFetchingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri načítavaní fotiek', err),
  savingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri ukladaní fotky', err),
  commentAddingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri pridávaní komentára', err),
  ratingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri hodnotení', err),
  missingPositionError: 'Chýba pozícia.',
  invalidPositionError: 'Nesprávny formát súradníc.',
  invalidTakenAt: 'Neplatný dátum a čas fotenia.',
  filterModal: {
    title: 'Filter fotografií',
    tag: 'Tag',
    createdAt: 'Dátum nahratia',
    takenAt: 'Dátum fotenia',
    author: 'Autor',
    rating: 'Hodnotenie',
    noTags: 'bez tagov',
    pano: 'Panoráma',
    premium: 'Prémiové',
  },
  noPicturesFound: 'Na tomto mieste neboli nájdené žiadne fotky.',
  linkToWww: 'fotografia na www.freemap.sk',
  linkToImage: 'súbor fotografie',
  allMyPhotos: {
    title: 'Zmena prístupu',
    premium: 'Zaradiť všetky moje fotky do prémiového obsahu',
    free: 'Sprístupniť všetky moje fotky každému',
    confirmPremium:
      'Zaradiť všetky vaše fotky do prémiového obsahu? Uvidia ich iba používatelia s prémiovým prístupom.',
    confirmFree: 'Sprístupniť všetky vaše fotky každému?',
  },
};

export default sk;
