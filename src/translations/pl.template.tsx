import { AreaInfo } from '@app/components/AreaInfo.js';
import { DistanceInfo } from '@app/components/DistanceInfo.js';
import { MaptilerAttribution } from '@app/components/MaptilerAttribution.js';
import { RovasAd } from '@features/ad/components/RovasAd.js';
import { CookieConsent } from '@features/cookieConsent/components/CookieConsent.js';
import { ElevationInfo } from '@features/elevationChart/components/ElevationInfo.js';
import { ObjectDetails } from '@features/objects/components/ObjectDetails.js';
import { Attribution } from '@shared/components/Attribution.js';
import { Emoji } from '@shared/components/Emoji.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { AlertLink } from 'react-bootstrap';
import { CookiesConsentText } from '@/features/auth/components/CookiesConsentText.js';
import { addError, Messages } from './messagesInterface.js';
import shared from './pl-shared.js';

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
    internalError: ({ ticketId }) => (
      <span dangerouslySetInnerHTML={{ __html: getErrorMarkup(ticketId) }} />
    ),
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
    noCookies: () => (
      <>
        Ta funkcja wymaga akceptacji{' '}
        <CookiesConsentText>plików cookies</CookiesConsentText>.
      </>
    ),
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
    confirmation: 'Potwierdzenie',
    export: 'Eksportuj',
    success: 'Gotowe!',
    expiration: 'Wygasa',
    privacyPolicy: 'Polityka prywatności',
    newOptionText: 'Dodaj %value%',
    deleteButtonText: 'Usuń %value% z listy',
    accept: 'Zaakceptować',
  },
  generic: {
    color: 'Kolor',
    size: 'Rozmiar',
    weight: 'Grubość',
    width: 'Szerokość',
  },
  theme: {
    light: 'Jasny tryb',
    dark: 'Ciemny tryb',
    auto: 'Tryb automatyczny',
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
    routePlanner: 'Wyszukiwarka tras',
    objects: 'Obiekty (POI)',
    photos: 'Zdjęcia',
    measurement: 'Rysowanie i pomiar',
    drawPoints: 'Rysowanie punktów',
    drawLines: 'Rysowanie linii',
    drawPolygons: 'Rysowanie wielokątów',
    trackViewer: 'Import pliku',
    changesets: 'Zmiany na mapie',
    mapDetails: 'Szczegóły mapy',
    tracking: 'Śledzenie na żywo',
    myMaps: 'Moje mapy',
  },
  mainMenu: {
    title: 'Menu główne',
    logOut: 'Wyloguj się',
    logIn: 'Zaloguj się',
    account: 'Konto',
    mapFeaturesExport: 'Eksport danych mapy',
    gpsDevicesMapExports: 'Mapy dla urządzeń GPS',
    embedMap: 'Osadź mapę',
    offlineMapExport: 'Eksport map offline',
    supportUs: 'Wesprzyj Freemap',
    help: 'Informacje i pomoc',
    back: 'Wstecz',
    mapLegend: 'Legenda mapy',
    contacts: 'Kontakt',
    facebook: 'Freemap na Facebooku',
    twitter: 'Freemap na Twitterze',
    youtube: 'Freemap na YouTube',
    github: 'Freemap na GitHubie',
    mastodon: 'Freemap na Mastodonie',
    googlePlay: 'Freemap w Google Play',
    appStore: 'Freemap w App Store',
    automaticLanguage: 'Automatyczny',
    mapToDocumentExport: 'Eksport mapy do obrazu/dokumentu',
    osmWiki: 'Dokumentacja OpenStreetMap',
    wikiLink: 'https://wiki.openstreetmap.org/wiki/Pl:Main_Page',
    status: 'Stan usług',
  },
  main: {
    infoBars: {
      ua: () => (
        <>
          <Emoji>🇺🇦</Emoji>&ensp;Stoimy za Ukrainą.{' '}
          <AlertLink href="https://u24.gov.ua/" target="_blank" rel="noopener">
            Wesprzyj Ukrainę ›
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
        prompt="Niektóre funkcje mogą wymagać plików cookies."
        local="Cookies ustawień lokalnych i logowania przez sieci społecznościowe"
        analytics="Analityczne cookies"
      />
    ),
  },

  ad: {
    self: (email) => (
      <>
        Chcesz umieścić swoją reklamę w tym miejscu? Skontaktuj się z nami pod
        adresem {email}.
      </>
    ),
    rovas: () => (
      <RovasAd rovasDesc="economic program for volunteers">
        <b>Freemap is created by volunteers.</b>{' '}
        <span className="text-danger">Reward them for their work</span>, with
        your own volunteer work or with money.
      </RovasAd>
    ),
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
    areaInfo: (props) => (
      <AreaInfo {...props} areaLabel="Powierzchnia" perimeterLabel="Obwód" />
    ),
    distanceInfo: (props) => <DistanceInfo {...props} lengthLabel="Długość" />,
  },

  purchases: {
    purchases: 'Zakupy',
    premiumExpired: (at) => <>Twój dostęp premium wygasł {at}</>,
    date: 'Data',
    item: 'Pozycja',
    notPremiumYet: 'Nie masz jeszcze dostępu premium.',
    awaitingBankPayment:
      'Czekamy na potwierdzenie przelewu bankowego. Premium aktywuje się po otrzymaniu płatności.',
    bankPaymentFailed:
      'Niektóre przelewy bankowe zostały odrzucone lub wygasły. Jeśli uważasz, że to pomyłka, skontaktuj się z pomocą.',
    bankIntentStatus: {
      pending_settlement:
        'Przelew bankowy został utworzony i oczekuje na rozliczenie.',
      manual_review:
        'Przelew bankowy wymaga ręcznej weryfikacji (np. niezgodność kwoty).',
      paid: 'Przelew bankowy został potwierdzony jako opłacony.',
      expired: 'Przelew bankowy wygasł przed potwierdzeniem.',
      failed: 'Przelew bankowy nie powiódł się.',
      rejected: 'Przelew bankowy został odrzucony.',
      created:
        'Intencja płatności została utworzona i nie została jeszcze rozliczona.',
      unknown: 'Status przelewu zgłoszony przez dostawcę: {}.',
    },
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
      picture: 'Zdjęcie profilowe',
      choosePicture: 'Wybierz zdjęcie',
      pictureTooLarge: 'Zdjęcie jest za duże. Maksymalny rozmiar to 5 MB.',
      description: 'O mnie',
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

  mapDetails: {
    notFound: 'Nic tu nie znaleziono.',
    fetchingError: ({ err }) =>
      addError(messages, 'Błąd podczas pobierania szczegółów', err),
    detail: ({ result }) => (
      <ObjectDetails
        result={result}
        openText="Otwórz na OpenStreetMap.org"
        historyText="historia"
        editInJosmText="Edytuj w JOSM"
      />
    ),
    sources: 'Źródła',
    source: 'Źródło',
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
    result: 'Wynik',
    sources: {
      'nominatim-reverse': 'Odwrotne geokodowanie',
      'overpass-nearby': 'Obiekty w pobliżu',
      'overpass-surrounding': 'Obiekty zawierające',
      bbox: 'Obszar ograniczający',
      geojson: 'GeoJSON',
      tile: 'Kafelek',
      coords: 'Współrzędne',
      'nominatim-forward': 'Geokodowanie',
      osm: 'OpenStreetMap',
      'wms:': 'WMS',
    },
  },

  documents: {
    errorLoading: 'Błąd podczas ładowania dokumentu.',
  },

  mapLayers: {
    letters: {
      S: 'Lotnicza',
      Z: 'Lotnicza',
      J1: 'Lotnicza (2017-2019)',
      J2: 'Lotnicza (2020-2022)',
      O: 'OpenStreetMap',
      d: 'Transport publiczny (ÖPNV)',
      X: outdoorMap,
      i: 'Warstwa danych',
      I: 'Zdjęcia',
      l1: 'Leśne drogi NLC (2017)',
      l2: 'Leśne drogi NLC',
      s0: 'Strava (wszystko)',
      s1: 'Strava (jazdy)',
      s2: 'Strava (biegi)',
      s3: 'Strava (sporty wodne)',
      s4: 'Strava (sporty zimowe)',
      w: 'Wikipedia',
      '5': 'Cieniowanie terenu',
      '6': 'Cieniowanie powierzchni',
      '7': 'Szczegółowe cieniowanie terenu',
      '8': 'Szczegółowe cieniowanie terenu',
      VO: 'OpenStreetMap Wektorowa',
      VS: 'Ulice Wektorowa',
      VD: 'Dataviz Wektorowa',
      VT: 'Outdoor Wektorowa',
      h: 'Parametryczne cieniowanie',
      z: 'Parametryczne cieniowanie',
      y: 'Parametryczne cieniowanie',
      M: 'Zdjęcia z Wikimedia Commons',
      WDZ: 'Skład gatunkowy drzewostanu',
      WLT: 'Typy lasów',
      WGE: 'Geologiczna',
      WKA: 'Kataster',
      wka: 'Kataster',
      WHC: 'Hydrochemiczna',
    },
    type: {
      map: 'mapa',
      data: 'dane',
      photos: 'zdjęcia',
    },
    attr: {
      osmData: '© współtwórcy OpenStreetMap',
      maptiler: (
        <MaptilerAttribution
          tilesFrom="Wektory kafelków od"
          hostedBy="hostowane przez"
        />
      ),
    },
    showAll: 'Pokaż wszystkie mapy',
    filterMaps: 'Filtruj mapy',
    noMapsFound: 'Nie znaleziono żadnych map',
    settings: 'Ustawienia mapy',
    layers: 'Mapy',
    switch: 'Mapy',
    photoFilterWarning: 'Filtr zdjęć jest aktywny',
    interactiveLayerWarning: 'Warstwa danych jest ukryta',
    minZoomWarning: (minZoom) => `Dostępne od poziomu powiększenia ${minZoom}`,
    customBase: 'Własna mapa',
    customMaps: 'Mapy własne',
    addCustomMap: 'Dodaj własną mapę',
    customMapsEmptyMessage:
      'Nie zdefiniowano jeszcze żadnych własnych map. Dodaj jedną, aby wyświetlić własne źródło mapy.',
    base: 'Warstwy podstawowe',
    overlay: 'Warstwy nakładkowe',
    url: 'Szablon URL',
    minZoom: 'Minimalne powiększenie',
    maxNativeZoom: 'Maksymalne natywne powiększenie',
    extraScales: 'Dodatkowe rozdzielczości',
    scaleWithDpi: 'Skaluj z DPI',
    zIndex: 'Z-indeks',
    preferences: 'Preferencje',
    maxZoom: 'Maksymalne powiększenie',
    forcedScale: 'Wymuszona rozdzielczość',
    resolutionScale: 'Skala rozdzielczości',
    resolutionScaleAuto: 'Automatycznie (domyślna urządzenia)',
    resolutionScaleHelp:
      'Symuluje gęstość pikseli wyświetlacza. Wpływa na to, który wariant kafelków jest pobierany. Jeśli warstwa nie oferuje żądanego wariantu, używany jest najwyższy dostępny.',
    featureScale: 'Rozmiar elementów',
    featureScaleHelp:
      'Powiększa renderowane etykiety i linie. Nie ma wpływu na warstwy satelitarne, cieniowania, WMS ani wektorowe (MapLibre).',
    stravaHeatmapColor: 'Kolor mapy ciepła Strava',
    stravaHeatmapColors: {
      hot: 'Gorący',
      blue: 'Niebieski',
      purple: 'Fioletowy',
      gray: 'Szary',
      bluered: 'Niebiesko-czerwony',
    },
    layer: {
      layer: 'Warstwa',
      base: 'Podstawowa',
      overlay: 'Nakładka',
    },
    showMore: 'Pokaż więcej map',
    countryWarning: (countries) =>
      `Obejmuje tylko następujące kraje: ${countries.join(', ')}`,
    configureLayers: 'Konfiguruj warstwy mapy',
    technologies: {
      tile: 'Płytki obrazów (TMS, XYZ)',
      maplibre: 'Wektor (MapLibre)',
      wms: 'WMS',
      parametricShading: 'Cieniowanie parametryczne',
    },
    technology: 'Typ',
    loadWmsLayers: 'Wczytaj warstwy',
    offlineMaps: 'Mapy offline',
    legacy: 'przestarzała',
    legacyMapWarning: ({ from, to }) => (
      <>
        Wyświetlana mapa <b>{messages.mapLayers.letters[from]}</b> jest
        przestarzała. Przełączyć na nowoczesną{' '}
        <b>{messages.mapLayers.letters[to]}</b>?
      </>
    ),
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

  premium: {
    title: 'Uzyskaj dostęp premium',
    commonHeader: (
      <>
        <p>
          <strong>Wesprzyj wolontariuszy, którzy tworzą tę mapę!</strong>
        </p>
        <p className="mb-1">
          Za <b>8 godzin</b> swojej{' '}
          <a
            href="https://rovas.app/freemap-web"
            target="_blank"
            rel="noopener noreferrer"
          >
            pracy wolontariackiej
          </a>{' '}
          lub <b>8 €</b>
          otrzymasz roczny dostęp obejmujący:
        </p>
        <ul>
          <li>usunięcie banera reklamowego</li>
          <li
            className="text-decoration-underline"
            title="szczegółowe cieniowanie Słowacji i Czech w wysokiej rozdzielczości, najwyższe poziomy powiększenia mapy Outdoor, najwyższe poziomy powiększenia map ortofoto Słowacji i Czech, różne mapy oparte na WMS"
          >
            warstw map premium
          </li>
          <li>zdjęć premium</li>
          <li>multimodalne wyznaczanie trasy</li>
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
    premiumUser: 'Użytkownik z dostępem premium',
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
};

export default messages;
