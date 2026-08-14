import { MaptilerAttribution } from '@app/components/MaptilerAttribution.js';
import { CookiesConsentText } from '@features/auth/components/CookiesConsentText.js';
import { CookieConsent } from '@features/cookieConsent/components/CookieConsent.js';
import { Attribution } from '@shared/components/Attribution.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import shared from './hu-shared.js';
import { addError, type Messages } from './messagesInterface.js';

const masl = 'm\xa0tszf.'; // méter a tengerszint fölött;

const getErrorMarkup = (ticketId?: string) => `
<h1>Alkalmazáshiba</h1>
<p>
  ${
    ticketId
      ? `A hiba automatikusan be lett jelentve, és a következő jegyazonosítót (Ticked ID) kapta: <b>${ticketId}</b>.`
      : ''
  }
  A hibát Ön is bejelentheti a <a href="https://github.com/FreemapSlovakia/freemap-v3-react/issues/new" target="_blank" rel="noopener noreferrer">GitHubon</a>,
  vagy végső esetben elküldheti nekünk az adatokat e-mailen: <a href="mailto:freemap@freemap.sk?subject=Nahlásenie%20chyby%20na%20www.freemap.sk">freemap@freemap.sk</a>.
</p>
<p>
  Köszönjük!
</p>`;

const outdoorMap = 'Túrázás, Kerékpár, Síelés, Lovaglás';

const messages: DeepPartialWithRequiredObjects<Messages> = {
  general: {
    iso: 'hu_HU',
    elevationProfile: 'Magassági profil',
    save: 'Mentés',
    cancel: 'Mégse',
    modify: 'Módosítás',
    delete: 'Törlés',
    remove: 'Eltávolítás',
    close: 'Bezárás',
    collapse: 'Összecsukás',
    expand: 'Kibontás',
    apply: 'Alkalmaz',
    exitFullscreen: 'Kilépés a teljes képernyős módból',
    fullscreen: 'Teljes képernyő',
    yes: 'Igen',
    no: 'Nem',
    masl,
    copyCode: 'Kód másolása',
    loading: 'Töltés…',
    ok: 'OK',
    preventShowingAgain: 'Következő alkalommal ne jelenjék meg',
    closeWithoutSaving:
      'Az ablak nem mentett módosításokat tartalmaz. Bezárja?',
    resetToDefaults: 'Alapértékek visszaállítása',
    back: 'Vissza',
    internalError: ({ ticketId }) => (
      <span dangerouslySetInnerHTML={{ __html: getErrorMarkup(ticketId) }} />
    ),
    processorError: ({ err }) => addError(messages, 'Alkalmazáshiba', err),
    seconds: 'másodperc',
    minutes: 'perc',
    meters: 'méter',
    createdAt: 'Létrehozva',
    actions: 'Műveletek',
    add: 'Új hozzáadása',
    clear: 'Törlés',
    convertToDrawing: 'Átalakítás rajzzá',
    simplifyPrompt:
      'Adja meg az egyszerűsítés mértékét. Az egyszerűsítés mellőzéséhez írjon be nullát.',
    copyUrl: 'URL másolása',
    copyPageUrl: 'Oldal URL-jének másolása',
    savingError: ({ err }) => addError(messages, 'Mentési hiba', err),
    loadError: ({ err }) => addError(messages, 'Betöltési hiba', err),
    deleteError: ({ err }) => addError(messages, 'Törlési hiba', err),
    deleted: 'Törölve.',
    saved: 'Elmentve.',
    visual: 'Megjelenítés',
    drawingTool: 'Rajzeszköz',
    enablePopup:
      'Kérjük, engedélyezze a böngészőben az előugró ablakokat ehhez a webhelyhez.',
    broadcastChannelUnsupported:
      'Ezt a műveletet a böngészője nem támogatja (a BroadcastChannel nem érhető el, pl. privát módban vagy alkalmazásba ágyazott böngészőben). Használjon normál ablakot egy modern böngészőben.',
    export: 'Exportálás',
    expiration: 'Lejárat',
    modifiedAt: 'Módosítva',
    operationError: ({ err }) => addError(messages, 'Műveleti hiba', err),
    copyOk: 'Vágólapra másolva.',
    noCookies: () => (
      <>
        Ez a funkció a{' '}
        <CookiesConsentText>sütik elfogadását</CookiesConsentText> igényli.
      </>
    ),
    name: 'Név',
    icon: 'Ikon',
    iconChoose: 'Ikon kiválasztása…',
    iconNone: 'Nincs ikon',
    iconSearch: 'Ikonok keresése',
    load: 'Betöltés',
    unnamed: 'Névtelen',
    componentLoadingError:
      'Nem sikerült betölteni a komponenst. Kérlek, ellenőrizd az internetkapcsolatodat.',
    offline: 'Nincs internetkapcsolatod.',
    offlineUnavailable: 'Internetkapcsolat nélkül nem érhető el.',
    offlineToolUnavailable:
      'Ez az eszköz internetkapcsolat nélkül semmit sem tud betölteni.',
    offlineNotice:
      'Nincs internetkapcsolatod, ezért itt semmit sem lehet betölteni vagy elküldeni.',
    connectionError: 'Hiba a szerverhez való csatlakozáskor.',
    experimentalFunction: 'Kísérleti funkció',
    attribution: () => (
      <Attribution unknown="A térkép licence nincs megadva." />
    ),
    unauthenticatedError: 'A funkció használatához előbb jelentkezz be.',
    confirmation: 'Megerősítés',
    success: 'Kész!',
    privacyPolicy: 'Adatvédelmi irányelvek',
    termsOfService: 'Felhasználási feltételek',
    refundPolicy: 'Visszatérítési szabályzat',
    infoAndLegal: 'Térképinformációk és jogi tudnivalók',
    newOptionText: '%value% hozzáadása',
    deleteButtonText: '%value% eltávolítása a listáról',
    accept: 'Elfogadod',
  },

  generic: {
    color: 'Szín',
    size: 'Méret',
    weight: 'Vastagság',
    width: 'Szélesség',
  },

  theme: {
    light: 'Világos mód',
    dark: 'Sötét mód',
    auto: 'Automatikus mód',
  },

  selections: {
    objects: 'Objektum (érdekes pont, POI)',
    drawPoints: 'Pont',
    drawLines: 'Vonal',
    drawPolygons: 'Sokszög',
    drawPolygonHole: 'Lyuk a sokszögben',
    tracking: 'Követés',

    linePoint: 'Vonal pontja',

    polygonPoint: 'Poligon pontja',
  },

  tools: {
    none: 'Eszköz bezárása',
    routePlanner: 'Útvonaltervező',
    objects: 'Objektumok (érdekes pontok, POI-k)',
    photos: 'Fényképek',
    measurement: 'Rajzolás és mérés',
    drawPoints: 'Pont rajzolása',
    drawLines: 'Vonal rajzolása',
    drawPolygons: 'Sokszög rajzolása',
    dataViewer: 'Nyomvonalak és adatok',
    changesets: 'Térkép változásai',
    mapDetails: 'Térképadatok',
    tracking: 'Élő követés',
    myMaps: 'Saját térképeim',
    myMap: 'Térképem',
    gpsRecorder: 'GPS-rögzítő',
  },

  mainMenu: {
    logOut: 'Kijelentkezés',
    logIn: 'Bejelentkezés',
    account: 'Fiók',
    mapFeaturesExport: 'Térképadatok exportja',
    gpsDevicesMapExports: 'Térképek GPS-eszközökhöz',
    embedMap: 'Térkép beágyazása',
    offlineMapExport: 'Offline térképek exportja',
    supportUs: 'A Freemap támogatása',
    help: 'Információk és segítség',
    back: 'Vissza',
    mapLegend: 'Jelmagyarázat',
    contacts: 'Kapcsolat',
    facebook: 'Freemap a Facebookon',
    twitter: 'Freemap a Twitteren',
    youtube: 'Freemap a YouTubeon',
    github: 'Freemap a GitHubon',
    mastodon: 'Freemap a Mastodonon',
    googlePlay: 'Freemap a Google Playen',
    appStore: 'Freemap az App Store-ban',
    automaticLanguage: 'Automatikus',
    mapToDocumentExport: 'Térkép exportja képként/dokumentumként',
    wikiLink: 'https://wiki.openstreetmap.org/wiki/Hu:Main_Page',
    status: 'Szolgáltatások állapota',
    language: 'Nyelv',
    title: 'Főmenü',
    osmWiki: 'OpenStreetMap dokumentáció',
  },

  main: {
    title: shared.title,
    description: shared.description,
    clearMap: 'Térképelemek törlése',
    close: 'Bezárás',
    closeTool: 'Eszköz bezárása',
    locateMe: 'Saját pozícióm',
    locationError: 'Nem sikerült megtalálni a helyzetét.',
    locationNoSignal: 'Még nincs GPS-jel.',
    headingSource: 'Irányjelző',
    headingSources: {
      none: 'Rejtett',
      gps: 'Haladási irány',
      compass: 'Az eszköz iránytűje',
    },
    headingSourceHelp:
      'A haladási irány a GPS-ből származik, és csak mozgás közben látszik. Az eszköz iránytűje állva is működik, de engedélyt igényel, és pontatlan lehet.',
    bearingLine: 'Távolság és irányszög',
    bearingLineHelp:
      'Helymeghatározás közben vonalat rajzol az Ön helyzete és a térkép közepén lévő célkereszt között, a távolság és a helyzetétől a célkeresztig mért irányszög feltüntetésével. Akkor jelenik meg, ha a térképet elhúzza a helyzetétől.',
    compassPermissionDenied: 'Az iránytűhöz való hozzáférés megtagadva.',
    compassUnavailable:
      'Nincsenek iránytűadatok. Lehet, hogy az eszközén nincs iránytű, vagy a hozzáférés blokkolva van.',
    zoomIn: 'Nagyítás',
    zoomOut: 'Kicsinyítés',

    devInfo: () => (
      <div>
        Ez a Freemap Slovakia tesztverziója. A felhasználói verziót itt találja:{' '}
        <a href="https://www.freemap.sk/">www.freemap.sk</a>.
      </div>
    ),

    copyright: 'Szerzői jog',

    infoBars: {},

    cookieConsent: () => (
      <CookieConsent
        prompt="Egyes funkciók sütiket igényelhetnek."
        local="Helyi beállítások és közösségi hálós bejelentkezés sütijei"
        analytics="Analitikus sütik"
      />
    ),
  },

  search: {
    offlineHint: 'Internetkapcsolat nélkül csak koordináták találhatók meg.',
    inProgress: 'Keresés…',
    noResults: 'Nincs találat',
    prompt: 'Adja meg a helyet',
    routeFrom: 'Útvonal innen',
    routeTo: 'Útvonal ide',
    fetchingError: ({ err }) => addError(messages, 'Keresési hiba', err),
    buttonTitle: 'Keresés',
    placeholder: 'Keresés a térképen',
    result: 'Találat',
    keepOnMap: 'Megtartás a térképen',
    sources: {
      'nominatim-reverse': 'Fordított geokódolás',
      'overpass-nearby': 'Közeli objektumok',
      'overpass-surrounding': 'Tartalmazó objektumok',
      bbox: 'Határoló keret',
      geojson: 'GeoJSON',
      tile: 'Csempe',
      coords: 'Koordináták',
      'nominatim-forward': 'Geokódolás',
      osm: 'OpenStreetMap',
      'wms:': 'WMS',
    },
  },

  mapLayers: {
    lookupStyle: 'Találat stílusa',
    resetApp: 'Alkalmazás visszaállítása',
    resetAppConfirm:
      'Visszaállítja az alkalmazás összes beállítását az alapértékekre és újratölti az oldalt? Ki lesz jelentkeztetve.',
    layers: 'Térképrétegek',
    photoFilterWarning: 'A fényképszűrés aktív',
    minZoomWarning: (minZoom) => `A ${minZoom} nagyítási szinttől látható`,
    outsideViewWarning: 'A jelenlegi nézet ezen a térképen kívül esik',
    offlineWarning: 'Ez a térkép nincs elmentve offline használatra',

    letters: {
      S: 'Légifelvétel',
      Z: 'Légifelvétel',
      J1: 'Légifelvétel (2017-2019)',
      J2: 'Légifelvétel (2020-2022)',
      O: 'OpenStreetMap',
      d: 'Tömegközlekedés',
      X: outdoorMap,
      XK: 'KST turistautak',
      i: 'Adatréteg',
      I: 'Fényképek',
      l1: 'Erdészeti utak NLC (2017)',
      l2: 'Erdészeti utak NLC',
      w: 'Wikipedia',
      R: 'Csapadékradar',
      '5': 'Terepárnyékolás',
      '6': 'Felszínárnyékolás',
      '7': 'Részletes terepárnyékolás',
      '8': 'Részletes terepárnyékolás',

      VO: 'OpenStreetMap vektoros',
      VS: 'Utcák vektoros',
      VD: 'Dataviz vektoros',
      VT: 'Outdoor vektoros',

      h: 'Paraméteres árnyékolás',
      z: 'Paraméteres árnyékolás',
      y: 'Paraméteres árnyékolás',
      M: 'Wikimedia Commons fotók',
      WDZ: 'Faállomány-összetétel',
      WLT: 'Erdőtípusok',
      WGE: 'Geológiai',
      WKA: 'Kataszter',
      wka: 'Kataszter',
      WHC: 'Hidrokémiai',
    },

    type: {
      map: 'térkép',
      data: 'adatok',
      photos: 'képek',
      routing: 'útvonaltervezés',
    },

    attr: {
      osmData: '©\xa0OpenStreetMap közreműködők',
      maptiler: (
        <MaptilerAttribution
          tilesFrom="Vektorcsempék innen:"
          hostedBy="hosztolva:"
        />
      ),
      photosCc: 'különböző Creative Commons licencek',
    },
    showAll: 'Összes térkép megjelenítése',
    filterMaps: 'Térképek szűrése',
    noMapsFound: 'Nem található térkép',
    settings: 'Térképek kezelése',
    switch: 'Térképek',
    interactiveLayerWarning: 'Az adatréteg rejtve van',
    customBase: 'Egyéni térkép',
    customMaps: 'Egyéni térképek',
    addCustomMap: 'Egyéni térkép hozzáadása',
    activate: 'Aktiválás',
    customMapsEmptyMessage:
      'Még nincsenek egyéni térképek megadva. Adjon hozzá egyet a saját térképforrás megjelenítéséhez.',
    base: 'Alaprétegek',
    overlay: 'Fedőrétegek',
    url: 'URL sablon',
    minZoom: 'Minimális nagyítás',
    maxNativeZoom: 'Maximális natív nagyítás',
    extraScales: 'Extra felbontások',
    scaleWithDpi: 'Méretezés DPI alapján',
    tiled: 'Betöltés csempékben',
    tiledHelp:
      'A WMS alapértelmezés szerint a teljes nézetről egyetlen képként töltődik be: egy kérés több tucat helyett, és a feliratokat nem vágja el a csempék határa. A csempéket olyan kiszolgálóhoz kapcsolja be, amely korlátozza a kép méretét vagy gyorsítótárazza a csempéket — cserébe nézetenként sok kérés indul.',
    zIndex: 'Z-index',
    preferences: 'Beállítások',
    mapSection: 'Térkép',
    maxZoom: 'Maximális nagyítás',
    zoomSnap: 'Nagyítási lépték',
    zoomSnapFree: 'Szabad',
    zoomSnapHelp:
      'A legkisebb nagyításváltozás, amelyen az egérgörgővel, csippentéssel és területkijelöléssel végzett nagyítás megállhat. Az 1 egész nagyítási szinteken tartja a térképet, a törtérték engedi köztük is megállni, a Szabad pedig bárhol. A + és – gombok és billentyűk mindig a következő egész szintre lépnek.',
    forcedScale: 'Kényszerített felbontás',
    resolutionScale: 'Felbontás skála',
    resolutionScaleAuto: 'Automatikus (eszköz alapértelmezett)',
    resolutionScaleHelp:
      'Szimulálja a kijelző pixelsűrűségét. Befolyásolja, hogy melyik csempe-változat töltődik be. Ha egy réteg nem kínálja a kért változatot, helyette a legmagasabb elérhető kerül felhasználásra.',
    featureScale: 'Elemek mérete',
    featureScaleHelp:
      'Megnöveli a megjelenített feliratokat és vonalakat. Nincs hatással a műholdas, árnyékolt, WMS és vektoros (MapLibre) rétegekre.',
    layer: {
      layer: 'Réteg',
      base: 'Alap',
      overlay: 'Átfedő',
    },
    showMore: 'További térképek megjelenítése',
    configureLayers: 'Rétegek beállítása',
    technologies: {
      tile: 'Képcsempék (TMS, XYZ)',
      maplibre: 'Vektor (MapLibre)',
      wms: 'WMS',
      parametricShading: 'Paraméteres árnyékolás',
    },
    technology: 'Típus',
    loadWmsLayers: 'Rétegek betöltése',
    serverNotResponding: ({ name }) => (
      <>
        A(z) <b>{name}</b> térkép kiszolgálója nem válaszol.
      </>
    ),
    offlineMaps: 'Offline térképek',
    legacy: 'elavult',
    legacyMapWarning: ({ from, to }) => (
      <>
        A megjelenített térkép <b>{messages.mapLayers.letters[from]}</b>{' '}
        elavult. Átváltasz a modern <b>{messages.mapLayers.letters[to]}</b>?
      </>
    ),
  },

  elevationChart: {
    distance: 'Távolság [km]',
    ele: `Magasság [${masl}]`,
    fetchError: ({ err }) =>
      addError(
        messages,
        'Hiba történt a magasságiprofil-adatok lekérésénél',
        err,
      ),
    settings: 'Magasság',
    settingsHelp:
      'Az első két beállítás a terepmodellt korrigálja, ezért mindenhol érvényes, ahol a magasság abból származik: tervezett útvonalaknál, rajzolt vonalaknál és méréseknél, valamint olyan importált nyomvonalaknál, amelyek magasságát a kiszolgálóról cserélte le. A rögzített tengerszint feletti magasság — élő nyomkövetés, vagy rögzített formában megtartott nyomvonal — érintetlen marad. Az exportált fájlok mindig megtartják a saját magasságukat.',
    windowOff: 'ki',
    windowWholeLine: 'teljes vonal',
    despike: 'Tüskék eltávolítása',
    despikeHelp:
      'Ha egy utat néhány méterrel az általa leírt úttest mellé rajzoltak, a terepmodell a mellette lévő rézsű vagy sziklafal magasságát adja vissza. Az ennek felénél keskenyebb tüskék eltűnnek, a profil pedig enyhén lekerekedik; a szélesebbek megmaradnak, mert valódi terepet jelentenek. A nulla kikapcsolja.',
    ditchFill: 'Terepmodell-árkok feltöltése',
    ditchFillHelp:
      'A részletes nemzeti terepmodellek, amelyek egyes országokban érhetők el, rendszerint hidrológiai szempontból vannak igazítva: minden áteresznél árkot vágnak az úton keresztül. Az ennél keskenyebb mélyedések feltöltődnek; a szélesebbek megmaradnak, mert valódi terepet jelentenek. A nulla kikapcsolja, és ott, ahol a globális modell van használatban, semmit sem változtat.',
    gradeWindow: 'Meredekség ablaka',
    gradeWindowHelp:
      'Ha a magassági profilra mutat, a hely megjelenik a térképen, az ottani meredekséggel együtt. A meredekség az adott pont körüli, ilyen hosszú szakaszra átlagolódik, hogy néhány méternyi GPS-zaj ne tűnjön falnak. A nulla a profil szomszédos pontjai között méri.',
  },

  errorCatcher: {
    html: (ticketId) => `${getErrorMarkup(ticketId)}
      <p>
        Megpróbálhatja a következőket:
      </p>
      <ul>
        <li><a href="">újra betölti a legutóbbi oldalt</a></li>
        <li><a href="/">betölti a kezdőoldalt</a></li>
        <li><a href="/#reset-local-storage">törli a helyi adatokat és betölti a kezdőoldalt</a></li>
      </ul>
    `,
  },

  mapCtxMenu: {
    centerMap: 'Térkép középre helyezése ide',
    measurePosition: 'Koordináták és magasság lekérdezése',
    addPoint: 'Pont hozzáadása ide',
    startLine: 'Vonal vagy mérés indítása innen',
    queryFeatures: 'Részletek lekérdezése a közelben',
    startRoute: 'Útvonal tervezése innen',
    finishRoute: 'Útvonal tervezése idáig',
    showPhotos: 'Közeli fotók megjelenítése',
  },

  errorStatus: {
    100: 'Folytatás',
    101: 'Protokollok váltása',
    102: 'Feldolgozás',
    103: 'Előzetes válasz',
    200: 'OK',
    201: 'Létrehozva',
    202: 'Elfogadva',
    203: 'Nem hitelesített információ',
    204: 'Nincs tartalom',
    205: 'Tartalom visszaállítása',
    206: 'Részleges tartalom',
    207: 'Több állapotú',
    208: 'Már jelentett',
    226: 'IM használt',
    300: 'Több választás',
    301: 'Állandóan átirányítva',
    302: 'Találat',
    303: 'Másikra mutat',
    304: 'Nem módosult',
    305: 'Proxy használata szükséges',
    306: 'Proxy váltás',
    307: 'Ideiglenes átirányítás',
    308: 'Végleges átirányítás',
    400: 'Rossz kérés',
    401: 'Hitelesítés szükséges',
    402: 'Fizetés szükséges',
    403: 'Tiltott',
    404: 'Nem található',
    405: 'Nem engedélyezett módszer',
    406: 'Nem elfogadható',
    407: 'Proxy hitelesítés szükséges',
    408: 'Kérés időtúllépése',
    409: 'Ütközés',
    410: 'Elveszett',
    411: 'Hossz szükséges',
    412: 'Előfeltétel sikertelen',
    413: 'Túl nagy terhelés',
    414: 'URI túl hosszú',
    415: 'Nem támogatott médium típus',
    416: 'Kérelmezett tartomány nem elérhető',
    417: 'Elvárás sikertelen',
    418: 'Én egy teáskanna vagyok',
    421: 'Rosszul irányított kérés',
    422: 'Feldolgozhatatlan entitás',
    423: 'Zárolva',
    424: 'Függőség hibája',
    425: 'Túl korai',
    426: 'Frissítés szükséges',
    428: 'Előfeltétel szükséges',
    429: 'Túl sok kérés',
    431: 'Túl nagy kérés fejléc',
    451: 'Jogi okok miatt nem elérhető',
    500: 'Szerver belső hibája',
    501: 'Nem implementált',
    502: 'Rossz átjáró',
    503: 'Szolgáltatás nem elérhető',
    504: 'Átjáró időtúllépése',
    505: 'HTTP verzió nem támogatott',
    506: 'Változat tárgyalás',
    507: 'Nem elegendő tárolókapacitás',
    508: 'Végtelen hurok észlelve',
    510: 'Nem bővített',
    511: 'Hálózati hitelesítés szükséges',
  },
  gpu: {
    lost: 'A GPU eszköz elveszett: ',
    noAdapter: 'A WebGPU adapter nem érhető el ebben a böngészőben.',
    notSupported: 'A WebGPU nem támogatott ebben a böngészőben.',
    errorRequestingDevice: 'Nem sikerült létrehozni a GPU eszközt: ',
    other: 'Hiba a megjelenítés során: ',
  },
};

export default messages;
