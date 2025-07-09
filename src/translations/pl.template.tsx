import { AlertLink } from 'react-bootstrap';
import { FaGem, FaKey } from 'react-icons/fa';
import { Attribution } from '../components/Attribution.js';
import { ChangesetDetails } from '../components/ChangesetDetails.js';
import { CookieConsent } from '../components/CookieConsent.js';
import { ElevationInfo } from '../components/ElevationInfo.js';
import { Emoji } from '../components/Emoji.js';
import { MaptilerAttribution } from '../components/MaptilerAttribution.js';
import {
  ObjectDetailBasicProps,
  ObjectDetails,
} from '../components/ObjectDetails.js';
import { TrackViewerDetails } from '../components/TrackViewerDetails.js';
import { DeepPartialWithRequiredObjects } from '../deepPartial.js';
import { Messages, addError } from './messagesInterface.js';
import shared from './pl-shared.js';

const nf33 = new Intl.NumberFormat('pl', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

const nf00 = new Intl.NumberFormat('pl', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const masl = 'm\xa0n.p.m.'; // metry nad poziomem morza

const getErrorMarkup = (ticketId?: string) => `
<h1>Błąd aplikacji</h1>
<p>
  ${
    ticketId
      ? `Błąd został automatycznie zgłoszony pod identyfikatorem <b>${ticketId}</b>.`
      : ''
  }
  Błąd możesz zgłosić ${
    ticketId ? 'także ' : ''
  }na <a href="https://github.com/FreemapSlovakia/freemap-v3-react/issues/new" target="_blank" rel="noopener noreferrer">GitHubie</a>,
  lub wysłać nam szczegóły na adres <a href="mailto:freemap@freemap.sk?subject=Zgłoszenie%20błędu%20na%20www.freemap.sk">freemap@freemap.sk</a>.
</p>
<p>
  Dziękujemy.
</p>`;

const outdoorMap = 'Turystyka, Rower, Biegówki, Jazda konna';

const messages: DeepPartialWithRequiredObjects<Messages> = {
  general: {
    iso: 'pl_PL',
    elevationProfile: 'Profil wysokościowy',
    save: 'Zapisz',
    cancel: 'Anuluj',
    modify: 'Edytuj',
    delete: 'Usuń',
    remove: 'Usuń',
    close: 'Zamknij',
    apply: 'Zastosuj',
    exitFullscreen: 'Zamknij tryb pełnoekranowy',
    fullscreen: 'Pełny ekran',
    yes: 'Tak',
    no: 'Nie',
    masl,
    copyCode: 'Skopiuj kod',
    loading: 'Ładowanie…',
    ok: 'OK',
    preventShowingAgain: 'Nie pokazuj ponownie',
    closeWithoutSaving: 'Zamknąć okno bez zapisywania zmian?',
    back: 'Wstecz',
    internalError: ({ ticketId }) => `!HTML!${getErrorMarkup(ticketId)}`,
    processorError: ({ err }) => addError(messages, 'Błąd aplikacji', err),
    seconds: 'sekundy',
    minutes: 'minuty',
    meters: 'metry',
    createdAt: 'Utworzono',
    modifiedAt: 'Zmieniono',
    actions: 'Akcje',
    add: 'Dodaj nowy',
    clear: 'Wyczyść',
    convertToDrawing: 'Przekształć na rysunek',
    simplifyPrompt:
      'Wprowadź współczynnik uproszczenia. Wprowadź zero, aby pominąć uproszczenie.',
    copyUrl: 'Skopiuj URL',
    copyPageUrl: 'Skopiuj URL strony',
    savingError: ({ err }) => addError(messages, 'Błąd zapisu', err),
    loadError: ({ err }) => addError(messages, 'Błąd ładowania', err),
    deleteError: ({ err }) => addError(messages, 'Błąd usuwania', err),
    operationError: ({ err }) => addError(messages, 'Błąd operacji', err),
    deleted: 'Usunięto.',
    saved: 'Zapisano.',
    visual: 'Widok',
    copyOk: 'Skopiowano do schowka.',
    noCookies: 'Ta funkcja wymaga akceptacji plików cookies.',
    name: 'Nazwa',
    load: 'Wczytaj',
    unnamed: 'Bez nazwy',
    enablePopup: 'Włącz wyskakujące okna dla tej strony w swojej przeglądarce.',
    componentLoadingError:
      'Błąd ładowania komponentu. Sprawdź swoje połączenie z internetem.',
    offline: 'Brak połączenia z internetem.',
    connectionError: 'Błąd połączenia z serwerem.',
    experimentalFunction: 'Funkcja eksperymentalna',
    attribution: () => (
      <Attribution unknown="Licencja mapy nie została określona" />
    ),
    unauthenticatedError: 'Zaloguj się, aby uzyskać dostęp do tej funkcji.',
    areYouSure: 'Jesteś pewien?',
    export: 'Eksportuj',
    success: 'Gotowe!',
    expiration: 'Wygasa',
  },
  selections: {
    objects: 'Obiekt (POI)',
    drawPoints: 'Punkt',
    drawLines: 'Linia',
    drawPolygons: 'Wielokąt',
    tracking: 'Śledzenie',
    linePoint: 'Punkt linii',
    polygonPoint: 'Punkt wielokąta',
  },
  tools: {
    none: 'Zamknij narzędzie',
    tools: 'Narzędzia',
    routePlanner: 'Wyszukiwarka tras',
    objects: 'Obiekty (POI)',
    photos: 'Zdjęcia',
    measurement: 'Rysowanie i pomiar',
    drawPoints: 'Rysowanie punktów',
    drawLines: 'Rysowanie linii',
    drawPolygons: 'Rysowanie wielokątów',
    trackViewer: 'Przeglądarka śladów (GPX)',
    changesets: 'Zmiany na mapie',
    mapDetails: 'Szczegóły mapy',
    tracking: 'Śledzenie na żywo',
    maps: 'Moje mapy',
  },
  routePlanner: {
    ghParams: {
      tripParameters: 'Parametry wycieczki',
      seed: 'Ziarno losowości',
      distance: 'Przybliżony dystans',
      isochroneParameters: 'Parametry izochron',
      buckets: 'Segmenty',
      timeLimit: 'Limit czasu',
      distanceLimit: 'Limit dystansu',
    },
    point: {
      pick: 'Wybierz na mapie',
      current: 'Twoja pozycja',
      home: 'Pozycja domowa',
    },
    transportType: {
      car: 'Samochód',
      car4wd: 'Samochód (4x4)',
      bike: 'Rower',
      foot: 'Pieszo',
      hiking: 'Turystyka piesza',
      mtb: 'Rower górski',
      racingbike: 'Rower szosowy',
      motorcycle: 'Motocykl',
    },
    mode: {
      route: 'W ustalonej kolejności',
      trip: 'Odwiedzanie miejsc',
      roundtrip: 'Odwiedzanie miejsc (pętla)',
      'routndtrip-gh': 'Wycieczka (pętla)',
      isochrone: 'Izoliny czasu',
    },
    noHomeAlert: {
      msg: 'Najpierw musisz ustawić pozycję domową w ustawieniach.',
      setHome: 'Ustaw',
    },
    milestones: 'Słupki kilometrowe',
    start: 'Start',
    finish: 'Meta',
    swap: 'Zamień start i metę',
    development: 'w przygotowaniu',
    alternative: 'Alternatywa',
    distance: ({ value, diff }) => (
      <>
        Dystans:{' '}
        <b>
          {value}
          {diff ? ` (+ ${diff})` : ''}
        </b>
      </>
    ),
    duration: ({ h, m, diff }) => (
      <>
        Czas:{' '}
        <b>
          {h}h {m}m{diff && ` (+ ${diff.h} h ${diff.m} m)`}
        </b>
      </>
    ),
    summary: ({ distance, h, m }) => (
      <>
        Dystans: <b>{distance}</b>| Czas:{' '}
        <b>
          {h}h {m}m
        </b>
      </>
    ),
    showMidpointHint: 'Aby dodać punkt pośredni, przeciągnij odcinek trasy.',
    gpsError: 'Błąd podczas pobierania bieżącej lokalizacji.',
    routeNotFound:
      'Nie znaleziono trasy. Spróbuj zmienić parametry lub przesunąć punkty.',
    fetchingError: ({ err }) =>
      addError(messages, 'Błąd podczas wyszukiwania trasy', err),
  },
  mainMenu: {
    title: 'Menu główne',
    logOut: 'Wyloguj się',
    logIn: 'Zaloguj się',
    account: 'Konto',
    mapFeaturesExport: 'Eksport elementów mapy',
    mapExports: 'Mapa do urządzeń GPS',
    embedMap: 'Osadź mapę',
    supportUs: 'Wesprzyj Freemap',
    help: 'Pomoc',
    back: 'Wstecz',
    mapLegend: 'Legenda mapy',
    contacts: 'Kontakt',
    facebook: 'Freemap na Facebooku',
    twitter: 'Freemap na Twitterze',
    youtube: 'Freemap na YouTube',
    github: 'Freemap na GitHubie',
    automaticLanguage: 'Automatyczny',
    mapExport: 'Eksport mapy',
    osmWiki: 'Dokumentacja OpenStreetMap',
    wikiLink: 'https://wiki.openstreetmap.org/wiki/Pl:Main_Page',
  },
  main: {
    infoBars: {
      ua: () => (
        <>
          <Emoji>🇺🇦</Emoji>&ensp;Stoimy za Ukrainą.{' '}
          <AlertLink
            href="https://bank.gov.ua/en/about/support-the-armed-forces"
            target="_blank"
            rel="noopener"
          >
            Wesprzyj ukraińską armię ›
          </AlertLink>
          &ensp;
          <Emoji>🇺🇦</Emoji>
        </>
      ),
    },
    title: shared.title,
    description: shared.description,
    clearMap: 'Wyczyść elementy mapy',
    close: 'Zamknij',
    closeTool: 'Zamknij narzędzie',
    locateMe: 'Pokaż moją pozycję',
    locationError: 'Błąd pobierania pozycji.',
    zoomIn: 'Powiększ',
    zoomOut: 'Pomniejsz',
    devInfo: () => (
      <div>
        To jest wersja testowa Freemap Slovakia. Przejdź do wersji produkcyjnej
        na <a href="https://www.freemap.sk/">www.freemap.sk</a>.
      </div>
    ),
    copyright: 'Prawa autorskie',
    cookieConsent: () => (
      <CookieConsent
        prompt="Niektóre funkcje mogą wymagać plików cookies. Zaakceptować:"
        local="Cookies ustawień lokalnych i logowania przez sieci społecznościowe"
        analytics="Analityczne cookies"
      />
    ),
    ad: (email) => (
      <>
        Chcesz umieścić swoją reklamę w tym miejscu? Skontaktuj się z nami pod
        adresem {email}.
      </>
    ),
  },

  gallery: {
    f: {
      firstUploaded: 'od pierwszych przesłanych',
      lastUploaded: 'od ostatnich przesłanych',
      firstCaptured: 'od najstarszych',
      lastCaptured: 'od najnowszych',
      leastRated: 'od najniżej ocenianych',
      mostRated: 'od najwyżej ocenianych',
      lastComment: 'od ostatniego komentarza',
    },

    c: {
      disable: 'nie koloruj',
      mine: 'wyróżnij moje',
      author: 'autor',
      rating: 'ocena',
      takenAt: 'data wykonania',
      createdAt: 'data przesłania',
      season: 'pora roku',
      premium: 'premium',
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
      deletePrompt: 'Usunąć to zdjęcie?',
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
      showPreview: 'Pokaż podgląd (zwiększone zużycie procesora i pamięci)',
      premium: 'Udostępnij tylko użytkownikom z dostępem premium',
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
      premium: 'Uwzględnij wszystkie moje zdjęcia w treściach premium',
      free: 'Udostępnij wszystkie moje zdjęcia dla wszystkich',
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
      addError(messages, 'Błąd podczas usuwania zdjęcia', err),

    tagsFetchingError: ({ err }) =>
      addError(messages, 'Błąd podczas pobierania tagów', err),

    pictureFetchingError: ({ err }) =>
      addError(messages, 'Błąd podczas pobierania zdjęcia', err),

    picturesFetchingError: ({ err }) =>
      addError(messages, 'Błąd podczas pobierania zdjęć', err),

    savingError: ({ err }) =>
      addError(messages, 'Błąd podczas zapisywania zdjęcia', err),

    commentAddingError: ({ err }) =>
      addError(messages, 'Błąd podczas dodawania komentarza', err),

    ratingError: ({ err }) =>
      addError(messages, 'Błąd podczas oceniania zdjęcia', err),

    missingPositionError: 'Brak lokalizacji.',
    invalidPositionError: 'Nieprawidłowy format współrzędnych lokalizacji.',
    invalidTakenAt: 'Nieprawidłowa data i godzina wykonania zdjęcia.',
    noPicturesFound: 'Nie znaleziono żadnych zdjęć w tym miejscu.',
    linkToWww: 'zdjęcie na www.freemap.sk',
    linkToImage: 'plik obrazu zdjęcia',
  },
  measurement: {
    distance: 'Linia',
    elevation: 'Punkt',
    area: 'Wielokąt',
    elevationFetchError: ({ err }) =>
      addError(
        messages,
        'Wystąpił błąd podczas pobierania wysokości punktu',
        err,
      ),
    elevationInfo: (params) => (
      <ElevationInfo
        {...params}
        lang="pl"
        tileMessage="Kafel"
        maslMessage="Wysokość n.p.m."
      />
    ),
    areaInfo: ({ area }) => (
      <>
        Powierzchnia:
        <div>
          {nf33.format(area)}&nbsp;m<sup>2</sup>
        </div>
        <div>{nf33.format(area / 100)}&nbsp;a</div>
        <div>{nf33.format(area / 10000)}&nbsp;ha</div>
        <div>
          {nf33.format(area / 1000000)}&nbsp;km<sup>2</sup>
        </div>
      </>
    ),
    distanceInfo: ({ length }) => (
      <>
        Długość:
        <div>{nf33.format(length * 1000)}&nbsp;m</div>
        <div>{nf33.format(length)}&nbsp;km</div>
      </>
    ),
  },

  trackViewer: {
    colorizingMode: {
      none: 'Nieaktywne',
      elevation: 'Wysokość',
      steepness: 'Stromość',
    },
    details: {
      startTime: 'Czas rozpoczęcia',
      finishTime: 'Czas zakończenia',
      duration: 'Czas trwania',
      distance: 'Dystans',
      avgSpeed: 'Średnia prędkość',
      minEle: 'Min. wysokość',
      maxEle: 'Maks. wysokość',
      uphill: 'Całkowite podejście',
      downhill: 'Całkowite zejście',
      durationValue: ({ h, m }) => `${h} godz. ${m} min`,
    },
    uploadModal: {
      title: 'Prześlij trasę',
      drop: 'Upuść plik .gpx tutaj lub kliknij, aby go wybrać.',
    },
    upload: 'Prześlij',
    moreInfo: 'Więcej informacji',
    share: 'Zapisz na serwerze',
    shareToast:
      'Trasa została zapisana na serwerze i można ją udostępnić, kopiując adres URL strony.',
    fetchingError: ({ err }) =>
      addError(messages, 'Wystąpił błąd podczas pobierania danych trasy', err),
    savingError: ({ err }) =>
      addError(messages, 'Wystąpił błąd podczas zapisywania trasy', err),
    loadingError: 'Błąd podczas ładowania pliku.',
    onlyOne: 'Oczekiwany jest tylko jeden plik GPX.',
    wrongFormat: 'Plik musi mieć rozszerzenie .gpx.',
    info: () => <TrackViewerDetails />,
    tooBigError: 'Plik jest zbyt duży.',
  },

  drawing: {
    edit: {
      title: 'Właściwości',
      color: 'Kolor:',
      label: 'Etykieta:',
      width: 'Szerokość:',
      hint: 'Aby usunąć etykietę, pozostaw to pole puste.',
      type: 'Typ geometrii',
    },
    defProps: {
      menuItem: 'Ustawienia stylu',
      title: 'Domyślne ustawienia stylu rysowania',
      applyToAll: 'Zapisz i zastosuj do wszystkich',
    },
    projection: {
      projectPoint: 'Wyznacz punkt',
      azimuth: 'Azymut',
      distance: 'Dystans',
    },
    modify: 'Właściwości',
    continue: 'Kontynuuj',
    join: 'Połącz',
    split: 'Podziel',
    stopDrawing: 'Zakończ rysowanie',
    selectPointToJoin: 'Wybierz punkt do połączenia linii',
  },

  purchases: {
    purchases: 'Zakupy',
    premiumExpired: (at) => <>Twój dostęp premium wygasł {at}</>,
    date: 'Data',
    item: 'Pozycja',
    notPremiumYet: 'Nie masz jeszcze dostępu premium.',
    noPurchases: 'Brak zakupów',
    premium: 'Premium',
    credits: (amount) => <>Kredyty ({amount})</>,
  },

  settings: {
    map: {
      homeLocation: {
        label: 'Lokalizacja domowa:',
        select: 'Wybierz na mapie',
        undefined: 'nieokreślona',
      },
    },

    account: {
      name: 'Imię',
      email: 'Email',
      sendGalleryEmails: 'Powiadamiaj o komentarzach do zdjęć emailem',
      delete: 'Usuń konto',
      deleteWarning:
        'Czy na pewno chcesz usunąć swoje konto? Zostaną usunięte wszystkie Twoje zdjęcia, komentarze i oceny, własne mapy i śledzone urządzenia.',
      personalInfo: 'Dane osobowe',
      authProviders: 'Dostawcy logowania',
    },

    general: {
      tips: 'Pokaż porady przy otwarciu strony (tylko dla języka słowackiego lub czeskiego)',
    },

    layer: 'Mapa',
    overlayOpacity: 'Przezroczystość',
    showInMenu: 'Pokaż w menu',
    showInToolbar: 'Pokaż na pasku narzędzi',
    saveSuccess: 'Ustawienia zostały zapisane.',
    savingError: ({ err }) => addError(messages, 'Błąd zapisu ustawień', err),
    customLayersDef: 'Definicja własnych warstw mapy',
    customLayersDefError: 'Nieprawidłowa definicja własnych warstw mapy.',
  },

  changesets: {
    details: {
      author: 'Autor:',
      description: 'Opis:',
      noDescription: 'bez opisu',
      closedAt: 'Czas:',
      moreDetailsOn: ({ osmLink, achaviLink }) => (
        <p>
          Więcej szczegółów na {osmLink} lub {achaviLink}.
        </p>
      ),
    },
    allAuthors: 'Wszyscy autorzy',
    tooBig:
      'Żądanie changesetów może zwrócić zbyt wiele elementów. Spróbuj przybliżyć mapę, wybrać mniej dni lub podać konkretnego autora.',
    olderThan: ({ days }) => `${days} dni`,
    olderThanFull: ({ days }) => `Changesety z ostatnich ${days} dni`,
    notFound: 'Nie znaleziono żadnych changesetów.',
    fetchError: ({ err }) =>
      addError(messages, 'Błąd podczas pobierania changesetów', err),
    detail: ({ changeset }) => <ChangesetDetails changeset={changeset} />,
  },

  mapDetails: {
    notFound: 'Nic tu nie znaleziono.',
    fetchingError: ({ err }) =>
      addError(messages, 'Błąd podczas pobierania szczegółów', err),
    detail: (props: ObjectDetailBasicProps) => (
      <ObjectDetails
        {...props}
        openText="Otwórz na OpenStreetMap.org"
        historyText="historia"
        editInJosmText="Edytuj w JOSM"
      />
    ),
  },

  objects: {
    lowZoomAlert: {
      message: ({ minZoom }) =>
        `Aby zobaczyć obiekty według ich typu, powiększ co najmniej do poziomu ${minZoom}.`,
      zoom: 'Powiększ',
    },
    icon: {
      pin: 'Pinezka',
      ring: 'Pierścień',
      square: 'Kwadrat',
    },
    type: 'Typ',
    tooManyPoints: ({ limit }) =>
      `Wynik został ograniczony do ${limit} obiektów.`,
    fetchingError: ({ err }) =>
      addError(messages, 'Błąd podczas pobierania obiektów (POI)', err),
  },

  external: {
    openInExternal: 'Udostępnij / Otwórz w zewnętrznej aplikacji.',
    osm: 'OpenStreetMap',
    oma: 'OMA',
    googleMaps: 'Google Maps',
    hiking_sk: 'Hiking.sk',
    zbgis: 'ZBGIS',
    mapy_cz: 'Mapy.com',
    josm: 'Edytuj w JOSM',
    id: 'Edytuj w iD',
    window: 'Nowe okno',
    url: 'Udostępnij URL',
    image: 'Udostępnij zdjęcie',
  },

  search: {
    inProgress: 'Wyszukiwanie…',
    noResults: 'Brak wyników',
    prompt: 'Wprowadź miejsce',
    routeFrom: 'Trasa stąd',
    routeTo: 'Trasa tutaj',
    fetchingError: ({ err }) =>
      addError(messages, 'Błąd podczas wyszukiwania', err),
    buttonTitle: 'Szukaj',
    placeholder: 'Szukaj na mapie',
  },

  embed: {
    code: 'Umieść poniższy kod na swojej stronie HTML:',
    example: 'Wynik będzie wyglądał następująco:',
    dimensions: 'Wymiary:',
    height: 'Wysokość:',
    width: 'Szerokość:',
    enableFeatures: 'Włącz funkcje:',
    enableSearch: 'wyszukiwanie',
    enableMapSwitch: 'przełączanie warstw mapy',
    enableLocateMe: 'znajdź mnie',
  },

  documents: {
    errorLoading: 'Błąd podczas ładowania dokumentu.',
  },

  exportMapFeatures: {
    what: {
      plannedRoute: 'znaleziona trasa',
      plannedRouteWithStops: 'z przystankami',
      objects: 'obiekty (POI)',
      pictures: 'zdjęcia (w widocznym obszarze mapy)',
      drawingLines: 'rysowanie – linie',
      drawingAreas: 'rysowanie – poligony',
      drawingPoints: 'rysowanie – punkty',
      tracking: 'śledzenie na żywo',
      gpx: 'ścieżka GPX',
      search: 'wyróżniony obiekt mapy',
    },

    garmin: {
      at: {
        running: 'Bieganie',
        hiking: 'Turystyka piesza',
        other: 'Inne',
        mountain_biking: 'Kolarstwo górskie',
        trailRunning: 'Bieg terenowy',
        roadCycling: 'Kolarstwo szosowe',
        gravelCycling: 'Kolarstwo żwirowe',
      },

      courseName: 'Nazwa trasy',
      description: 'Opis',
      activityType: 'Typ aktywności',
      revoked: 'Eksport trasy do Garmin został anulowany.',
      connectPrompt:
        'Twoje konto Garmin nie jest jeszcze podłączone. Chcesz je teraz połączyć?',
      authPrompt:
        'Nie jesteś jeszcze zalogowany do Garmin. Chcesz się teraz zalogować?',
    },

    download: 'Pobierz',
    format: 'Format',
    target: 'Cel',
    exportError: ({ err }) => addError(messages, 'Błąd eksportu', err),
    disabledAlert:
      'Tylko pola wyboru, których obiekty są widoczne na mapie, są aktywne.',
    licenseAlert:
      'Do pliku mogą mieć zastosowanie różne licencje – np. OpenStreetMap. Pamiętaj o podaniu wymaganych informacji przy udostępnianiu.',
    exportedToDropbox: 'Plik został zapisany na Dropboxie.',
    exportedToGdrive: 'Plik został zapisany na Dysku Google.',
  },

  auth: {
    provider: {
      facebook: 'Facebook',
      google: 'Google',
      osm: 'OpenStreetMap',
      garmin: 'Garmin',
    },
    connect: {
      label: 'Połącz',
      success: 'Połączono',
    },
    disconnect: {
      label: 'Odłącz',
      success: 'Odłączono',
    },
    logIn: {
      with: 'Wybierz dostawcę logowania',
      success: 'Zalogowano pomyślnie.',
      logInError: ({ err }) => addError(messages, 'Błąd logowania', err),
      logInError2: 'Błąd logowania.',
      verifyError: ({ err }) =>
        addError(messages, 'Błąd weryfikacji logowania', err),
    },
    logOut: {
      success: 'Wylogowano pomyślnie.',
      error: ({ err }) => addError(messages, 'Błąd wylogowania', err),
    },
  },

  mapLayers: {
    letters: {
      A: 'Auto (starsza wersja)',
      T: 'Turystyka piesza (starsza wersja)',
      C: 'Rowerowa (starsza wersja)',
      K: 'Narciarstwo biegowe (starsza wersja)',
      S: 'Lotnicza',
      Z: 'Ortofoto ČR+SR (lotnicza, CZ+SK)',
      J: 'Stara ortofotomapa SR (lotnicza, SK)',
      O: 'OpenStreetMap',
      M: 'mtbmap.cz',
      d: 'Transport publiczny (ÖPNV)',
      X: outdoorMap,
      i: 'Interaktywna warstwa',
      I: 'Zdjęcia',
      l: 'Leśne drogi NLC (SK)',
      t: 'Szlaki piesze',
      c: 'Szlaki rowerowe',
      s0: 'Strava (wszystko)',
      s1: 'Strava (jazdy)',
      s2: 'Strava (biegi)',
      s3: 'Strava (sporty wodne)',
      s4: 'Strava (sporty zimowe)',
      w: 'Wikipedia',
      '4': 'Jasne cieniowanie terenu (SK)',
      '5': 'Cieniowanie terenu (SK)',
      '6': 'Cieniowanie powierzchni (SK)',
      '7': 'Szczegółowe cieniowanie powierzchni (SK)',
      '8': 'Szczegółowe cieniowanie powierzchni (CZ)',
      VO: 'OpenStreetMap Wektorowa',
      VS: 'Ulice Wektorowa',
      VD: 'Dataviz Wektorowa',
      VT: 'Outdoor Wektorowa',
      h: 'Parametryczne cieniowanie (SK)',
      z: 'Parametryczne cieniowanie (CZ)',
    },
    type: {
      map: 'mapa',
      data: 'dane',
      photos: 'zdjęcia',
    },
    attr: {
      freemap: '© Freemap Słowacja',
      osmData: '© współtwórcy OpenStreetMap',
      srtm: '© SRTM',
      outdoorShadingAttribution: 'dostawcy NMT…',
      maptiler: (
        <MaptilerAttribution
          tilesFrom="Wektory kafelków od"
          hostedBy="hostowane przez"
        />
      ),
    },
    showAll: 'Pokaż wszystkie mapy',
    settings: 'Ustawienia mapy',
    layers: 'Mapy',
    switch: 'Mapy',
    photoFilterWarning: 'Filtr zdjęć jest aktywny',
    interactiveLayerWarning: 'Interaktywna warstwa jest ukryta',
    minZoomWarning: (minZoom) => `Dostępne od poziomu powiększenia ${minZoom}`,
    layerSettings: 'Mapové vrstvy',
    customBase: 'Własna mapa',
    customOverlay: 'Własna nakładka mapy',
    customMaps: 'Mapy własne',
    base: 'Warstwy podstawowe',
    overlay: 'Warstwy nakładkowe',
    urlTemplate: 'Szablon URL',
    minZoom: 'Minimalne powiększenie',
    maxNativeZoom: 'Maksymalne natywne powiększenie',
    extraScales: 'Dodatkowe rozdzielczości',
    scaleWithDpi: 'Skaluj z DPI',
    zIndex: 'Z-indeks',
    generalSettings: 'Ustawienia ogólne',
    maxZoom: 'Maksymalne powiększenie',
  },

  elevationChart: {
    distance: 'Dystans [km]',
    ele: `Wysokość [${masl}]`,
    fetchError: ({ err }) =>
      addError(messages, 'Błąd podczas pobierania profilu wysokościowego', err),
  },

  errorCatcher: {
    html: (ticketId) => `${getErrorMarkup(ticketId)}
      <p>
        Możesz spróbować:
      </p>
      <ul>
        <li><a href="">ponownie załadować ostatnią stronę</a></li>
        <li><a href="/">załadować stronę startową</a></li>
        <li><a href="/#reset-local-storage">wyczyścić dane lokalne i załadować stronę startową</a></li>
      </ul>
    `,
  },

  osm: {
    fetchingError: ({ err }) =>
      addError(messages, 'Błąd podczas pobierania danych OSM', err),
  },

  tracking: {
    trackedDevices: {
      button: 'Obserwowane',
      modalTitle: 'Obserwowane urządzenia',
      desc: 'Zarządzaj obserwowanymi urządzeniami, aby zobaczyć pozycję swoich znajomych.',
      modifyTitle: (name) => (
        <>
          Edytuj obserwowane urządzenie <i>{name}</i>
        </>
      ),
      createTitle: (name) => (
        <>
          Obserwuj urządzenie <i>{name}</i>
        </>
      ),
      storageWarning:
        'Uwaga, lista urządzeń jest zawarta tylko w adresie URL strony. Aby ją zapisać, użyj funkcji „Moje mapy”.',
    },

    accessToken: {
      token: 'Token śledzenia',
      timeFrom: 'Od',
      timeTo: 'Do',
      listingLabel: 'Nazwa urządzenia',
      note: 'Notatka',
      delete: 'Usunąć token dostępu?',
    },

    accessTokens: {
      modalTitle: (deviceName) => (
        <>
          Tokeny śledzenia dla <i>{deviceName}</i>
        </>
      ),
      desc: (deviceName) => (
        <>
          Zdefiniuj tokeny śledzenia, aby udostępnić pozycję urządzenia{' '}
          <i>{deviceName}</i> swoim znajomym.
        </>
      ),
      createTitle: (deviceName) => (
        <>
          Dodaj token śledzenia dla <i>{deviceName}</i>
        </>
      ),
      modifyTitle: ({ token, deviceName }) => (
        <>
          Zmień token śledzenia <i>{token}</i> dla <i>{deviceName}</i>
        </>
      ),
    },

    trackedDevice: {
      token: 'Token śledzenia',
      label: 'Etykieta',
      fromTime: 'Od',
      maxAge: 'Maks. wiek',
      maxCount: 'Maks. liczba',
      splitDistance: 'Podział odległości',
      splitDuration: 'Podział czasu',
      color: 'Kolor',
      width: 'Szerokość',
    },

    devices: {
      button: 'Moje urządzenia',
      modalTitle: 'Moje śledzone urządzenia',
      createTitle: 'Utwórz urządzenie śledzące',
      watchTokens: 'Tokeny śledzenia',
      watchPrivately: 'Śledź prywatnie',
      watch: 'Śledź',
      delete: 'Usunąć urządzenie?',
      modifyTitle: ({ name }) => (
        <>
          Edytuj urządzenie śledzące <i>{name}</i>
        </>
      ),
      desc: () => (
        <>
          <p>
            Zarządzaj swoimi urządzeniami, aby inni mogli śledzić Twoją pozycję,
            jeśli przekażesz im token śledzenia (można go utworzyć za pomocą
            ikony <FaKey />
            ).
          </p>
          <hr />
          <p>
            Wprowadź poniższy adres URL w aplikacji śledzącej (np.{' '}
            <a href="https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking">
              Locus
            </a>{' '}
            lub OsmAnd):{' '}
            <code>
              {process.env['API_URL']}/tracking/track/<i>token</i>
            </code>{' '}
            gdzie <i>token</i> znajduje się w tabeli poniżej.
          </p>
          <p>
            Endpoint obsługuje metody HTTP <code>GET</code> lub{' '}
            <code>POST</code> z parametrami URL-encoded:
          </p>
          <ul>
            <li>
              <code>lat</code> – szerokość geograficzna (wymagane)
            </li>
            <li>
              <code>lon</code> – długość geograficzna (wymagane)
            </li>
            <li>
              <code>time</code>, <code>timestamp</code> – data parsowalna w
              JavaScript lub Unix time w sekundach/milisekundach
            </li>
            <li>
              <code>alt</code>, <code>altitude</code> – wysokość w metrach
            </li>
            <li>
              <code>speed</code> – prędkość w m/s
            </li>
            <li>
              <code>speedKmh</code> – prędkość w km/h
            </li>
            <li>
              <code>acc</code> – dokładność w metrach
            </li>
            <li>
              <code>hdop</code> – pozioma dokładność (HDOP)
            </li>
            <li>
              <code>bearing</code> – kierunek w stopniach
            </li>
            <li>
              <code>battery</code> – bateria w procentach
            </li>
            <li>
              <code>gsm_signal</code> – sygnał GSM w procentach
            </li>
            <li>
              <code>message</code> – wiadomość (notatka)
            </li>
          </ul>
          <hr />
          <p>
            W przypadku trackera TK102B skonfiguruj jego adres jako:{' '}
            <code>
              {process.env['API_URL']
                ?.replace(/https?:\/\//, '')
                ?.replace(/:\d+$/, '')}
              :3030
            </code>
          </p>
        </>
      ),
    },

    device: {
      token: 'Kod śledzenia',
      name: 'Nazwa',
      maxAge: 'Maksymalny wiek',
      maxCount: 'Maksymalna liczba',
      regenerateToken: 'Wygeneruj ponownie',
      generatedToken: 'zostanie wygenerowany po zapisaniu',
    },

    visual: {
      line: 'Linia',
      points: 'Punkty',
      'line+points': 'Linia + Punkty',
    },

    subscribeNotFound: ({ id }) => (
      <>
        Beobachtungstoken <i>{id}</i> existiert nicht.
      </>
    ),

    subscribeError: ({ id }) => (
      <>
        Fehler beim Beobachten mit Token <i>{id}</i>.
      </>
    ),
  },
  mapExport: {
    areas: {
      visible: 'Widoczny obszar mapy',
      pinned: 'Obszar zawierający zaznaczony wielokąt (rysunek)',
    },

    layers: {
      contours: 'Poziomice',
      shading: 'Cieniowanie rzeźby terenu',
      hikingTrails: 'Szlaki piesze',
      bicycleTrails: 'Trasy rowerowe',
      skiTrails: 'Trasy narciarskie',
      horseTrails: 'Szlaki konne',
      drawing: 'Rysunek',
      plannedRoute: 'Znaleziona trasa',
      track: 'Ślad GPX',
    },

    advancedSettings: 'Zaawansowane opcje',
    styles: 'Style warstwy interaktywnej',
    exportError: ({ err }) => addError(messages, 'Błąd eksportu mapy', err),
    exporting: 'Proszę czekać, trwa eksport mapy…',
    exported: ({ url }) => (
      <>
        Eksport mapy zakończony.{' '}
        <AlertLink href={url} target="_blank">
          Otwórz.
        </AlertLink>
      </>
    ),
    area: 'Obszar eksportu:',
    format: 'Format:',
    layersTitle: 'Opcjonalne warstwy:',
    mapScale: 'Rozdzielczość mapy:',
    alert: () => (
      <>
        Uwagi:
        <ul>
          <li>
            Eksportowana będzie mapa <i>{outdoorMap}</i>.
          </li>
          <li>Eksport mapy może potrwać kilkadziesiąt sekund.</li>
          <li>
            Udostępniając wyeksportowaną mapę, należy podać następującą
            licencję:
            <br />
            <em>
              mapa ©{' '}
              <AlertLink
                href="https://www.freemap.sk/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Freemap Slovakia
              </AlertLink>
              , dane{' '}
              <AlertLink
                href="https://osm.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
              >
                © współtwórcy OpenStreetMap
              </AlertLink>
              {', SRTM, '}
              <AlertLink
                href="https://www.geoportal.sk/sk/udaje/lls-dmr/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LLS: ÚGKK SR
              </AlertLink>
            </em>
          </li>
        </ul>
      </>
    ),
  },

  maps: {
    legacyMapWarning:
      'Wyświetlana mapa jest przestarzała. Przełączyć na nowoczesną mapę outdoorową?',
    noMapFound: 'Nie znaleziono mapy',
    save: 'Zapisz',
    delete: 'Usuń',
    disconnect: 'Odłącz',
    deleteConfirm: (name) => `Czy na pewno chcesz usunąć mapę ${name}?`,
    fetchError: ({ err }) =>
      addError(messages, 'Błąd podczas wczytywania mapy', err),
    fetchListError: ({ err }) =>
      addError(messages, 'Błąd podczas wczytywania map', err),
    deleteError: ({ err }) =>
      addError(messages, 'Błąd podczas usuwania mapy', err),
    renameError: ({ err }) =>
      addError(messages, 'Błąd podczas zmiany nazwy mapy', err),
    createError: ({ err }) =>
      addError(messages, 'Błąd podczas zapisywania mapy', err),
    saveError: ({ err }) =>
      addError(messages, 'Błąd podczas zapisywania mapy', err),
    loadToEmpty: 'Załaduj do pustej mapy',
    loadInclMapAndPosition: 'Załaduj wraz z zapisaną mapą tła i jej pozycją',
    savedMaps: 'Zapisane mapy',
    newMap: 'Nowa mapa',
    SomeMap: ({ name }) => (
      <>
        Mapa <i>{name}</i>
      </>
    ),
    writers: 'Edytorzy',
    conflictError: 'Mapa została w międzyczasie zmodyfikowana.',
  },

  mapCtxMenu: {
    centerMap: 'Wyśrodkuj mapę tutaj',
    measurePosition: 'Sprawdź współrzędne i wysokość',
    addPoint: 'Dodaj tutaj punkt',
    startLine: 'Zacznij rysować linię lub mierzyć stąd',
    queryFeatures: 'Szukaj obiektów w pobliżu',
    startRoute: 'Zaplanuj trasę stąd',
    finishRoute: 'Zaplanuj trasę tutaj',
    showPhotos: 'Pokaż zdjęcia w pobliżu',
  },

  legend: {
    body: (
      <>
        Legenda mapy dla <i>{outdoorMap}</i>:
      </>
    ),
  },

  contacts: {
    ngo: 'Stowarzyszenie ochotnicze',
    registered: 'Zarejestrowane w MV/VVS/1-900/90-34343 dnia 2009-10-02',
    bankAccount: 'Konto bankowe',
    generalContact: 'Kontakty ogólne',
    board: 'Zarząd',
    boardMemebers: 'Członkowie zarządu',
    president: 'Prezes',
    vicepresident: 'Wiceprezes',
    secretary: 'Sekretarz',
  },

  premium: {
    title: 'Uzyskaj dostęp premium',
    commonHeader: (
      <>
        <p>
          <strong>Wesprzyj wolontariuszy, którzy tworzą tę mapę!</strong>
        </p>
        <p className="mb-1">
          Za <b>8 godzin</b> swojej pracy wolontariackiej* lub <b>8 €</b>
          otrzymasz roczny dostęp obejmujący:
        </p>
        <ul>
          <li>usunięcie banera reklamowego</li>
          <li>
            dostęp do <FaGem />
            warstw map premium
          </li>
          <li>
            dostęp do <FaGem />
            zdjęć premium
          </li>
        </ul>
      </>
    ),
    stepsForAnonymous: (
      <>
        <div className="fw-bold">Procedura</div>
        <div className="mb-3">
          <p className="mb-1 ms-3">
            <span className="fw-semibold">Krok 1</span> – utwórz konto w Freemap
            (poniżej)
          </p>
          <p className="mb-1 ms-3">
            <span className="fw-semibold">Krok 2</span> – w aplikacji Rovas,
            gdzie zostaniesz przekierowany po rejestracji, prześlij nam
            płatność.
          </p>
        </div>
      </>
    ),
    commonFooter: (
      <p className="small">
        * Możesz potwierdzić swoją pracę wolontariacką, tworząc raporty pracy w
        aplikacji <a href="https://rovas.app/">Rovas</a>. Jeśli jesteś
        wolontariuszem projektu OSM i korzystasz z aplikacji JOSM, zalecamy
        włączenie{' '}
        <a href="https://josm.openstreetmap.de/wiki/Help/Plugin/RovasConnector">
          wtyczki Rovas Connector
        </a>
        , która może tworzyć raporty automatycznie. Po weryfikacji raportu przez
        dwóch użytkowników otrzymasz walutę społecznościową <i>Chron</i>, którą
        możesz wykorzystać do uzyskania dostępu premium na stronie
        www.freemap.sk lub do zakupu kredytów.
      </p>
    ),
    continue: 'Kontynuuj',
    success: 'Gratulacje, uzyskano dostęp premium!',
    becomePremium: 'Uzyskaj dostęp premium',
    youArePremium: (date) => (
      <>
        Masz dostęp premium do <b>{date}</b>.
      </>
    ),
    premiumOnly: 'Dostępne tylko z dostępem premium.',
    alreadyPremium: 'Masz już dostęp premium.',
  },

  credits: {
    purchase: {
      success: ({ amount }) => (
        <>Twój kredyt został zwiększony o {nf00.format(amount)}.</>
      ),
    },
    buyCredits: 'Kup kredyty',
    amount: 'Kredyty',
    credits: 'kredytów',
    buy: 'Kup',
    youHaveCredits: (amount) => <>Masz {amount} kredytów.</>,
  },

  offline: {
    offlineMode: 'Tryb offline',
    cachingActive: 'Buforowanie aktywne',
    clearCache: 'Wyczyść pamięć podręczną',
    dataSource: 'Źródło danych',
    networkOnly: 'Tylko sieć',
    networkFirst: 'Najpierw sieć',
    cacheFirst: 'Najpierw pamięć podręczna',
    cacheOnly: 'Tylko pamięć podręczna',
  },

  errorStatus: {
    100: 'Kontynuuj',
    101: 'Przełączanie protokołów',
    102: 'Przetwarzanie',
    103: 'Wstępne nagłówki',
    200: 'OK',
    201: 'Utworzono',
    202: 'Przyjęto',
    203: 'Niejawne informacje',
    204: 'Brak treści',
    205: 'Zresetuj treść',
    206: 'Częściowa treść',
    207: 'Wielostatusowy',
    208: 'Już zgłoszono',
    226: 'IM użyte',
    300: 'Wiele możliwości',
    301: 'Trwale przeniesiono',
    302: 'Znaleziono',
    303: 'Zobacz inne',
    304: 'Nie zmieniono',
    305: 'Użyj proxy',
    306: 'Zmień proxy',
    307: 'Tymczasowe przekierowanie',
    308: 'Trwałe przekierowanie',
    400: 'Błędne żądanie',
    401: 'Nieautoryzowany',
    402: 'Wymagana płatność',
    403: 'Zabronione',
    404: 'Nie znaleziono',
    405: 'Metoda niedozwolona',
    406: 'Nieakceptowalne',
    407: 'Wymagana autoryzacja proxy',
    408: 'Przekroczono czas żądania',
    409: 'Konflikt',
    410: 'Zniknęło',
    411: 'Wymagana długość',
    412: 'Warunek wstępny niepowodzenie',
    413: 'Zbyt duży ładunek',
    414: 'URI zbyt długie',
    415: 'Nieobsługiwany typ mediów',
    416: 'Zakres nieosiągalny',
    417: 'Oczekiwania niespełnione',
    418: 'Jestem imbrykiem',
    421: 'Błędnie skierowane żądanie',
    422: 'Nieprzetwarzalna jednostka',
    423: 'Zablokowane',
    424: 'Zależność nie powiodła się',
    425: 'Zbyt wcześnie',
    426: 'Wymagana aktualizacja',
    428: 'Wymagany warunek wstępny',
    429: 'Zbyt wiele żądań',
    431: 'Nagłówki żądania zbyt duże',
    451: 'Niedostępne z powodów prawnych',
    500: 'Wewnętrzny błąd serwera',
    501: 'Niezaimplementowane',
    502: 'Błędna brama',
    503: 'Usługa niedostępna',
    504: 'Przekroczono czas bramy',
    505: 'Nieobsługiwana wersja HTTP',
    506: 'Wariant również negocjuje',
    507: 'Niewystarczająca przestrzeń',
    508: 'Wykryto pętlę',
    510: 'Nie rozszerzono',
    511: 'Wymagana autoryzacja sieciowa',
  },

  gpu: {
    lost: 'Urządzenie GPU zostało utracone: ',
    noAdapter: 'Adapter WebGPU nie jest dostępny w tej przeglądarce.',
    notSupported: 'WebGPU nie jest obsługiwane w tej przeglądarce.',
    errorRequestingDevice: 'Nie udało się utworzyć urządzenia GPU: ',
    other: 'Błąd podczas renderowania: ',
  },

  downloadMap: {
    area: {
      visible: 'Widoczny obszar',
      byPolygon: 'Obszar pokryty wybranym wielokątem',
    },
    downloadMap: 'Pobierz mapę',
    format: 'Format',
    map: 'Mapa',
    downloadArea: 'Pobierz',
    name: 'Nazwa',
    zoomRange: 'Zakres powiększenia',
    scale: 'Skala',
    email: 'Twój adres e-mail',
    emailInfo: 'Twój e-mail zostanie użyty do przesłania linku do pobrania.',
    download: 'Pobierz',
    success:
      'Mapa jest przygotowywana. Po zakończeniu otrzymasz link do pobrania na podany e-mail.',
    summaryTiles: 'Płytki',
    summaryPrice: (amount) => <>Łączna cena: {amount} kredytów</>,
  },
};

export default messages;
