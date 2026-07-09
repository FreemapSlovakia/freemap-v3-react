import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { GalleryMessages } from './GalleryMessages.js';

const cs: DeepPartialWithRequiredObjects<GalleryMessages> = {
  sendGalleryEmails: 'Upozornit emailem na komentáře k fotkám',
  stats: {
    leaderboard: 'Žebříček',
    country: 'Země',
    perUserPerCountry: 'Fotky na autora na zemi',
    perUser: 'Fotky na autora',
    more: 'Více',
    less: 'Méně',
    user: 'Autor',
    photos: 'Fotek',
    numberOfPhotos: 'Počet fotek',
    timePeriod: 'Časové období',
    allTime: 'Celý čas',
    last3months: 'Poslední 3 měsíce',
    last30days: 'Posledních 30 dní',
  },

  legend: 'Legenda',
  recentTags: 'Nedávné tagy pro přiřazení:',
  filter: 'Filtr',
  showPhotosFrom: 'Prohlížet fotky',
  showLayer: 'Zobrazit vrstvu',
  upload: 'Nahrát',
  f: {
    '-createdAt': 'od poslední nahrané',
    '-takenAt': 'od nejnovější vyfocené',
    '-rating': 'od největšího hodnocení',
    '-lastCommentedAt': 'od posledního komentáře',
  },
  colorizeBy: 'Vybarvit podle',
  showDirection: 'Ukaž směr focení',
  c: {
    disable: 'Nevybarvit',
    mine: 'Odlišit moje',
    userId: 'Autor',
    rating: 'Hodnocení',
    takenAt: 'Datum vyfocení',
    createdAt: 'Datum nahrání',
    season: 'Roční období',
    premium: 'Prémiové',
    license: 'Licence',
  },
  viewer: {
    title: 'Fotografie',
    comments: 'Komentáře',
    newComment: 'Nový komentář',
    addComment: 'Přidej',
    yourRating: 'Tvé hodnocení:',
    showOnTheMap: 'Ukázat na mapě',
    openInNewWindow: 'Otevřít v…',
    uploaded: ({ username, createdAt }) => (
      <>
        Nahrál {username} dne {createdAt}
      </>
    ),
    captured: (takenAt) => <>Vyfoceno dne {takenAt}</>,
    deletePrompt: (title) =>
      title ? (
        <>
          Opravdu chcete smazat obrázek <i>{title}</i>?
        </>
      ) : (
        <>Opravdu chcete smazat tento obrázek?</>
      ),
    deleteTitle: 'Smazání obrázku',
    modify: 'Úprava',
    premiumOnly:
      'Tuto fotografii zpřístupnil její autor pouze uživatelům s prémiovým přístupem.',
    noComments: 'Bez komentáře',
  },
  editForm: {
    name: 'Název',
    description: 'Popis',
    takenAt: {
      datetime: 'Datum a čas focení',
      date: 'Datum focení',
      time: 'Čas focení',
    },
    location: 'Pozice',
    azimuth: 'Azimut',
    tags: 'Tagy',
    setLocation: 'Nastavit pozici',
  },
  uploadModal: {
    title: 'Nahrát fotky',
    uploading: (n) => `Nahrávám (${n})`,
    upload: 'Nahrát',
    rules: `
      <p>Zatáhněte sem fotky, nebo sem klikněte pro jejich výběr.</p>
      <ul>
        <li>Nevkládejte příliš malé obrázky (miniatury). Maximální rozměr není omezen, je ale omezena velikost souboru na 10MB. Větší soubory server odmítne.</li>
        <li>Vkládejte pouze fotografie krajiny včetně dokumentačních fotografií. Portréty a makro-fotografie jsou považovány za nevhodný obsah a budou bez varování smazány.</li>
        <li>Nahrávejte pouze vlastní fotografie nebo fotografie, pro které máte udělen souhlas ke sdílení.</li>
        <li>Popisky nebo komentáře, které se přímo netýkají obsahu načtených fotografií nebo odporují obecně přijímaným zásadám civilizovaného soužití, budou odstraněny. Porušovatelé tohoto pravidla budou varováni a při opakovaném porušování může být jejich účet v aplikaci zrušen.</li>
        <li>Fotografie jsou dále šířeny pod licencí, kterou si pro každou z nich zvolíte (výchozí je CC BY-SA 4.0).</li>
        <li>Provozovatel Freemap.sk se tímto zbavuje jakékoli odpovědnosti a neodpovídá za přímé ani nepřímé škody vzniklé zveřejněním fotografie v galerii. Za fotografii nese plnou odpovědnost osoba, která fotografii na server uložila.</li>
        <li>Provozovatel si vyhrazuje právo upravit popis, název, pozici a tagy fotografie nebo fotografii vymazat, pokud je její obsah nevhodný (porušuje tato pravidla).</li>
        <li>Provozovatel si vyhrazuje právo zrušit účet v případě, že uživatel opakovaně porušuje pravidla galerie zveřejňováním nevhodného obsahu.</li>
      </ul>
    `,
    success: 'Fotografie byly úspěšně nahrány.',
    showPreview: 'Automaticky zobrazit náhledy (náročnější na výkon a paměť)',
    loadPreview: 'Načíst náhled',
    premium: 'Zpřístupnit pouze uživatelům s prémiovým přístupem',
  },
  license: {
    label: 'Licence',
    chooseForAll: 'Nastavit licenci všech mých fotek',
    changeNote:
      'Změna licence platí pouze pro budoucí použití; kopie získané dříve si ponechávají licenci, pod kterou byly poskytnuty.',
    since: 'Od',
    names: {
      'CC0-1.0': 'CC0 1.0 (volné dílo)',
      'CC-BY-4.0': 'CC BY 4.0',
      'CC-BY-SA-4.0': 'CC BY-SA 4.0',
      'CC-BY-NC-4.0': 'CC BY-NC 4.0',
      'CC-BY-NC-SA-4.0': 'CC BY-NC-SA 4.0',
    },
    descriptions: {
      'CC0-1.0':
        'Vzdáváte se všech práv a uvolňujete fotku jako volné dílo — kdokoli ji může použít k čemukoli bez uvedení autora.',
      'CC-BY-4.0':
        'Ostatní mohou fotku sdílet a upravovat, i komerčně, pokud uvedou autora.',
      'CC-BY-SA-4.0':
        'Ostatní mohou fotku sdílet a upravovat, i komerčně, pokud uvedou autora a své dílo šíří pod stejnou licencí.',
      'CC-BY-NC-4.0':
        'Ostatní mohou fotku sdílet a upravovat pro nekomerční účely, pokud uvedou autora.',
      'CC-BY-NC-SA-4.0':
        'Ostatní mohou fotku sdílet a upravovat pro nekomerční účely, pokud uvedou autora a své dílo šíří pod stejnou licencí.',
    },
  },
  locationPicking: {
    title: 'Zvolte pozici fotografie',
  },
  deletingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při mazání obrázku', err),
  tagsFetchingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při nahrávání tagů', err),
  pictureFetchingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při nahrávání fotky', err),
  picturesFetchingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při nahrávání fotek', err),
  savingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při ukládání fotky', err),
  commentAddingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při přidávání komentáře', err),
  ratingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při hodnocení', err),
  missingPositionError: 'Chyba pozice.',
  invalidPositionError: 'Nesprávný formát souřadnic.',
  invalidTakenAt: 'Nevalidní datum a čas focení.',
  filterModal: {
    title: 'Filtr fotografií',
    tag: 'Tag',
    createdAt: 'Datum nahrání',
    takenAt: 'Datum focení',
    author: 'Autor',
    rating: 'Hodnocení',
    noTags: 'bez tagů',
    pano: 'Panoráma',
    premium: 'Prémiové',
  },
  noPicturesFound: 'Na tomto místě nebyly nalezeny žádné fotky.',
  linkToWww: 'fotografie na www.freemap.sk',
  linkToImage: 'soubor fotografie',
  allMyPhotos: {
    title: 'Změna přístupu',
    premium: 'Zařadit všechny mé fotky do prémiového obsahu',
    free: 'Zpřístupnit všechny mé fotky každému',
    confirmPremium:
      'Zařadit všechny vaše fotky do prémiového obsahu? Uvidí je pouze uživatelé s prémiovým přístupem.',
    confirmFree: 'Zpřístupnit všechny vaše fotky každému?',
    confirmLicense: (license) =>
      `Nastavit licenci všech vašich fotek na ${license}? Fotky, které již používají jinou licenci, budou od nynějška přelicencovány.`,
  },
};

export default cs;
