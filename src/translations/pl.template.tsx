import { MaptilerAttribution } from '@app/components/MaptilerAttribution.js';
import { CookieConsent } from '@features/cookieConsent/components/CookieConsent.js';
import { Attribution } from '@shared/components/Attribution.js';
import { Emoji } from '@shared/components/Emoji.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { AlertLink } from 'react-bootstrap';
import { CookiesConsentText } from '@/features/auth/components/CookiesConsentText.js';
import { addError, type Messages } from './messagesInterface.js';
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
    collapse: 'Zwiń',
    expand: 'Rozwiń',
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
    drawingTool: 'Narzędzie rysowania',
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
    broadcastChannelUnsupported:
      'Ta czynność nie jest obsługiwana w Twojej przeglądarce (BroadcastChannel jest niedostępny, np. w trybie prywatnym lub w przeglądarce wbudowanej w aplikację). Użyj zwykłego okna w nowoczesnej przeglądarce.',
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
    termsOfService: 'Warunki korzystania z usługi',
    refundPolicy: 'Zasady zwrotu pieniędzy',
    infoAndLegal: 'Informacje o mapie i kwestie prawne',
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
    myMap: 'Moja mapa',
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

  mapLayers: {
    searchResultStyle: 'Styl wyniku wyszukiwania',
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
    activate: 'Aktywuj',
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
    layer: {
      layer: 'Warstwa',
      base: 'Podstawowa',
      overlay: 'Nakładka',
    },
    showMore: 'Pokaż więcej map',
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
