import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { GalleryMessages } from './GalleryMessages.js';

const hu: DeepPartialWithRequiredObjects<GalleryMessages> = {
  sendGalleryEmails: 'Értesítés fotómegjegyzésekről e-mailben',
  stats: {
    leaderboard: 'Ranglista',
    country: 'Ország',
    perUserPerCountry: 'Fotók szerző és ország szerint',
    perUser: 'Fotók szerző szerint',
    more: 'Több',
    less: 'Kevesebb',
    user: 'Szerző',
    photos: 'Fotók',
    numberOfPhotos: 'Fotók száma',
    timePeriod: 'Időszak',
    allTime: 'Teljes időszak',
    last3months: 'Utolsó 3 hónap',
    last30days: 'Utolsó 30 nap',
  },

  legend: 'Jelmagyarázat',
  filter: 'Szűrő',
  showPhotosFrom: 'Fényképek megtekintése',
  showLayer: 'Réteg megjelenítése',
  upload: 'Feltöltés',

  f: {
    '-createdAt': 'a legutóbb feltöltöttől',
    '-takenAt': 'a legutóbb készülttől',
    '-rating': 'a legjobbra értékelttől',
    '-lastCommentedAt': 'from last comment',
  },

  showDirection: 'Mutasd a fényképezés irányát',

  c: {
    disable: 'Ne színezd',
    mine: 'Különítsd el a sajátjaimat',
    userId: 'Szerző',
    rating: 'Értékelés',
    takenAt: 'Készítés dátuma',
    createdAt: 'Feltöltés dátuma',
    season: 'Évszak',
    premium: 'Prémium',
  },

  viewer: {
    title: 'Fénykép',
    comments: 'Hozzászólások',
    newComment: 'Új hozzászólás',
    addComment: 'Hozzáadás',
    yourRating: 'Az Ön értékelése:',
    showOnTheMap: 'Megjelenítés a térképen',
    openInNewWindow: 'Megnyitás…',
    uploaded: ({ username, createdAt }) => (
      <>
        {username} töltötte fel ekkor: {createdAt}
      </>
    ),
    captured: (takenAt) => <>Ekkor készült: {takenAt}</>,
    deletePrompt: (title) =>
      title ? (
        <>
          Biztosan törölni szeretné a(z) <i>{title}</i> képet?
        </>
      ) : (
        <>Biztosan törölni szeretné ezt a képet?</>
      ),
    deleteTitle: 'Kép törlése',
    modify: 'Módosítás',
    premiumOnly:
      'Ezt a fényképet a szerzője csak prémium hozzáféréssel rendelkező felhasználók számára tette elérhetővé.',
    noComments: 'Nincs hozzászólás',
  },

  editForm: {
    name: 'Név',
    description: 'Leírás',
    takenAt: {
      datetime: 'Felvétel napja és ideje',
      date: 'Felvétel napja',
      time: 'Felvétel időpontja',
    },
    location: 'Hely',
    azimuth: 'Azimut',
    tags: 'Címkék',
    setLocation: 'Hely megadása',
  },

  uploadModal: {
    title: 'Fényképek feltöltése',
    uploading: (n) => `Feltöltés folyamatban (${n})`,
    upload: 'Feltöltés',
    rules: `
      <p>Húzza ide a fényképeit vagy kattintson ide a kijelölésükhöz.</p>
      <ul>
        <li>Ne töltsön fel túl kicsi fényképeket (bélyegképek/thumbnails). A fénykép legnagyobb mérete nincs korlátozva. A legnagyobb fájlméret 10MB, a nagyobb fájlok elutasíttatnak.</li>
        <li>Csak tájak fényképeit vagy dokumentációs jellegű képeket töltsön fel. A portrék és a makrofényképek nem kívánatosak, és figyelmeztetés nélkül töröltetnek.</li>
        <li>Kérjük, csak a saját fényképeit töltse fel.</li>
        <li>Azok a feliratok vagy megjegyzések, amelyek nem kapcsolódnak közvetlenül a feltöltött fotók tartalmához, vagy ellentmondanak a civilizált együttélés általánosan elfogadott elveinek, eltávolításra kerülnek. A szabály megsértőit figyelmeztetjük, ismételt megsértése esetén az alkalmazásban lévő fiókjukat törölhetjük.</li>
        <li>A fényképek feltöltésével hozzájárul, hogy azokat a CC BY-SA 4.0 licenc alapján terjesszék.</li>
        <li>Az üzemeltető (Freemap.sk) minden kötelezettséget elhárít, és nem vállal felelősséget a fénykép galériában történő közzétételéből eredő közvetlen vagy közvetett károkért. A fényképért teljes mértékben az azt a kiszolgálóra feltöltő személy felel.</li>
        <li>Az üzemeltető fenntartja a jogot, hogy a fénykép leírását, nevét, pozíciójáőt és címkéit szerkesszt, illetve hogy a fényképet törölje, ha annak tartalma nem megfelelő (megszegi ezeket a szabályokat).</li>
        <li>Az üzemeltető fenntartja a jogot, hogy törölje azt a fiókot, amelynek felhasználója nem megfelelő tartalom közzétételével ismételten megsérti a galéria szabályzatát.</li>
      </ul>
    `,
    success: 'A képek sikeresen fel lettek töltve.',
    showPreview:
      'Előnézet automatikus megjelenítése (több processzorteljesítményt és memóriát használ)',
    premium:
      'Csak teljes hozzáféréssel rendelkező felhasználók számára elérhető',
    loadPreview: 'Előnézet betöltése',
  },

  locationPicking: {
    title: 'Fénykép helyének kijelölése',
  },

  deletingError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt a fénykép törlésénél', err),

  tagsFetchingError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt a címkék beolvasásánál', err),

  pictureFetchingError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt a fénykép beolvasásánál', err),

  picturesFetchingError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt a fényképek beolvasásánál', err),

  savingError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt a fénykép mentésénél', err),

  commentAddingError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt a hozzászólás hozzáadásánál', err),

  ratingError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt a fénykép értékelésénél', err),

  missingPositionError: 'Hiányzik a hely.',
  invalidPositionError: 'A hely koordinátáinak formátuma érvénytelen.',
  invalidTakenAt: 'A fénykép készítésének dátuma és időpontja érvénytelen.',

  filterModal: {
    title: 'Fényképek szűrése',
    tag: 'Címke',
    createdAt: 'Feltöltés dátuma',
    takenAt: 'Készítés dátuma',
    author: 'Szerző',
    rating: 'Értékelés',
    noTags: 'nincs címke',
    pano: 'Panoráma',
    premium: 'Prémium',
  },

  allMyPhotos: {
    title: 'Hozzáférés módosítása',
    premium: 'Minden fotóm felvétele a prémium tartalomba',
    free: 'Minden fotóm elérhetővé tétele mindenki számára',
    confirmPremium:
      'Felveszi minden fotóját a prémium tartalomba? Csak a prémium hozzáféréssel rendelkező felhasználók láthatják őket.',
    confirmFree: 'Elérhetővé teszi minden fotóját mindenki számára?',
  },

  recentTags: 'Legutóbbi címkék hozzárendeléshez:',
  colorizeBy: 'Színezés ez alapján',
  noPicturesFound: 'Ezen a helyen nem találhatók fotók.',
  linkToWww: 'fotó a www.freemap.sk oldalon',
  linkToImage: 'fotófájl',
};

export default hu;
