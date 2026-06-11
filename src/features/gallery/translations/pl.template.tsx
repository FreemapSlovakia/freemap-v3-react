import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { GalleryMessages } from './GalleryMessages.js';

const pl: DeepPartialWithRequiredObjects<GalleryMessages> = {
  stats: {
    leaderboard: 'Ranking',
    country: 'Kraj',
    perUserPerCountry: 'Zdjęcia na autora i kraj',
    perUser: 'Zdjęcia na autora',
    more: 'Więcej',
    less: 'Mniej',
    user: 'Autor',
    photos: 'Zdjęć',
    numberOfPhotos: 'Liczba zdjęć',
    timePeriod: 'Okres czasu',
    allTime: 'Cały czas',
    last3months: 'Ostatnie 3 miesiące',
    last30days: 'Ostatnie 30 dni',
  },

  f: {
    '-createdAt': 'od ostatnich przesłanych',
    '-takenAt': 'od najnowszych',
    '-rating': 'od najwyżej ocenianych',
    '-lastCommentedAt': 'od ostatniego komentarza',
  },

  c: {
    disable: 'Nie koloruj',
    mine: 'Wyróżnij moje',
    userId: 'Autor',
    rating: 'Ocena',
    takenAt: 'Data wykonania',
    createdAt: 'Data przesłania',
    season: 'Sezon',
    premium: 'Premium',
  },

  viewer: {
    title: 'Zdjęcie',
    comments: 'Komentarze',
    newComment: 'Nowy komentarz',
    addComment: 'Dodaj',
    yourRating: 'Twoja ocena:',
    showOnTheMap: 'Pokaż na mapie',
    openInNewWindow: 'Otwórz w…',
    uploaded: ({ username, createdAt }) => (
      <>
        Przesłał {username} dnia {createdAt}
      </>
    ),
    captured: (takenAt) => <>Zrobione dnia {takenAt}</>,
    deletePrompt: (title) =>
      title ? (
        <>
          Czy na pewno chcesz usunąć zdjęcie <i>{title}</i>?
        </>
      ) : (
        <>Czy na pewno chcesz usunąć to zdjęcie?</>
      ),
    deleteTitle: 'Usunięcie zdjęcia',
    modify: 'Edytuj',
    premiumOnly:
      'To zdjęcie zostało udostępnione przez autora tylko użytkownikom z dostępem premium.',
    noComments: 'Brak komentarzy',
  },

  editForm: {
    takenAt: {
      datetime: 'Data i godzina wykonania',
      date: 'Data wykonania',
      time: 'Godzina wykonania',
    },
    name: 'Nazwa',
    description: 'Opis',
    location: 'Lokalizacja',
    azimuth: 'Azymut',
    tags: 'Tagi',
    setLocation: 'Ustaw lokalizację',
  },

  uploadModal: {
    title: 'Prześlij zdjęcia',
    uploading: (n) => `Przesyłanie (${n})`,
    upload: 'Prześlij',
    rules: `
      <p>Upuść tutaj swoje zdjęcia lub kliknij, aby je wybrać.</p>
      <ul>
        <li>Nie przesyłaj zbyt małych zdjęć (miniaturek). Maksymalne wymiary nie są ograniczone. Maksymalny rozmiar pliku to 10 MB. Większe pliki zostaną odrzucone.</li>
        <li>Przesyłaj tylko zdjęcia krajobrazów lub zdjęcia dokumentacyjne. Portrety i zdjęcia makro są niepożądane i będą usuwane bez ostrzeżenia.</li>
        <li>Przesyłaj tylko własne zdjęcia lub takie, do których posiadasz zgodę na udostępnienie.</li>
        <li>Podpisy lub komentarze, które nie odnoszą się bezpośrednio do treści przesłanych zdjęć lub są sprzeczne z ogólnie przyjętymi zasadami współżycia społecznego, będą usuwane. Osoby naruszające te zasady będą ostrzegane, a w przypadku powtórzenia – ich konto może zostać usunięte.</li>
        <li>Przesyłając zdjęcia, wyrażasz zgodę na ich rozpowszechnianie na licencji CC BY-SA 4.0.</li>
        <li>Operator (Freemap.sk) zrzeka się wszelkiej odpowiedzialności i nie odpowiada za szkody bezpośrednie ani pośrednie wynikające z publikacji zdjęcia w galerii. Pełną odpowiedzialność ponosi osoba, która przesłała zdjęcie na serwer.</li>
        <li>Operator zastrzega sobie prawo do edycji opisu, nazwy, lokalizacji i tagów zdjęcia lub jego usunięcia, jeśli jego treść jest nieodpowiednia (narusza te zasady).</li>
        <li>Operator zastrzega sobie prawo do usunięcia konta użytkownika, który wielokrotnie narusza zasady galerii publikując nieodpowiednie treści.</li>
      </ul>
    `,
    success: 'Zdjęcia zostały pomyślnie przesłane.',
    showPreview:
      'Automatyczne wyświetlanie podglądu (zwiększone zużycie procesora i pamięci)',
    premium: 'Udostępnij tylko użytkownikom z dostępem premium',
    loadPreview: 'Wczytaj podgląd',
  },

  locationPicking: {
    title: 'Wybierz lokalizację zdjęcia',
  },

  filterModal: {
    title: 'Filtrowanie zdjęć',
    tag: 'Tag',
    createdAt: 'Data przesłania',
    takenAt: 'Data wykonania',
    author: 'Autor',
    rating: 'Ocena',
    noTags: 'brak tagów',
    pano: 'Panorama',
    premium: 'Premium',
  },

  allMyPhotos: {
    title: 'Zmiana dostępu',
    premium: 'Uwzględnij wszystkie moje zdjęcia w treściach premium',
    free: 'Udostępnij wszystkie moje zdjęcia dla wszystkich',
    confirmPremium:
      'Uwzględnić wszystkie Twoje zdjęcia w treściach premium? Zobaczą je tylko użytkownicy z dostępem premium.',
    confirmFree: 'Udostępnić wszystkie Twoje zdjęcia dla wszystkich?',
  },

  legend: 'Legenda',
  recentTags: 'Ostatnie tagi do przypisania:',
  filter: 'Filtr',
  showPhotosFrom: 'Pokaż zdjęcia',
  showLayer: 'Pokaż warstwę',
  upload: 'Prześlij',
  colorizeBy: 'Pokoloruj według',
  showDirection: 'Pokaż kierunek fotografowania',

  deletingError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas usuwania zdjęcia', err),

  tagsFetchingError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas pobierania tagów', err),

  pictureFetchingError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas pobierania zdjęcia', err),

  picturesFetchingError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas pobierania zdjęć', err),

  savingError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas zapisywania zdjęcia', err),

  commentAddingError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas dodawania komentarza', err),

  ratingError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas oceniania zdjęcia', err),

  missingPositionError: 'Brak lokalizacji.',
  invalidPositionError: 'Nieprawidłowy format współrzędnych lokalizacji.',
  invalidTakenAt: 'Nieprawidłowa data i godzina wykonania zdjęcia.',
  noPicturesFound: 'Nie znaleziono żadnych zdjęć w tym miejscu.',
  linkToWww: 'zdjęcie na www.freemap.sk',
  linkToImage: 'plik obrazu zdjęcia',
  showLegend: 'Pokaż legendę kolorowania',
};

export default pl;
