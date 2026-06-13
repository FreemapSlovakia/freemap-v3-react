import { AreaInfo } from '@app/components/AreaInfo.js';
import { DistanceInfo } from '@app/components/DistanceInfo.js';
import { MaptilerAttribution } from '@app/components/MaptilerAttribution.js';
import { CookieConsent } from '@features/cookieConsent/components/CookieConsent.js';
import { ElevationInfo } from '@features/elevationChart/components/ElevationInfo.js';
import { ObjectDetails } from '@features/objects/components/ObjectDetails.js';
import { Attribution } from '@shared/components/Attribution.js';
import { Emoji } from '@shared/components/Emoji.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { AlertLink } from 'react-bootstrap';
import { CookiesConsentText } from '@/features/auth/components/CookiesConsentText.js';
import shared from './hu-shared.js';
import { addError, Messages } from './messagesInterface.js';

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
    enablePopup:
      'Kérjük, engedélyezze a böngészőben az előugró ablakokat ehhez a webhelyhez.',
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
    load: 'Betöltés',
    unnamed: 'Névtelen',
    componentLoadingError:
      'Nem sikerült betölteni a komponenst. Kérlek, ellenőrizd az internetkapcsolatodat.',
    offline: 'Nincs internetkapcsolatod.',
    connectionError: 'Hiba a szerverhez való csatlakozáskor.',
    experimentalFunction: 'Kísérleti funkció',
    attribution: () => (
      <Attribution unknown="A térkép licence nincs megadva." />
    ),
    unauthenticatedError: 'A funkció használatához előbb jelentkezz be.',
    confirmation: 'Megerősítés',
    success: 'Kész!',
    privacyPolicy: 'Adatvédelmi irányelvek',
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
    trackViewer: 'Fájlimportálás',
    changesets: 'Térkép változásai',
    mapDetails: 'Térképadatok',
    tracking: 'Élő követés',
    myMaps: 'Saját térképeim',
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
    zoomIn: 'Nagyítás',
    zoomOut: 'Kicsinyítés',

    devInfo: () => (
      <div>
        Ez a Freemap Slovakia tesztverziója. A felhasználói verziót itt találja:{' '}
        <a href="https://www.freemap.sk/">www.freemap.sk</a>.
      </div>
    ),

    copyright: 'Szerzői jog',

    infoBars: {
      ua: () => (
        <>
          <Emoji>🇺🇦</Emoji>&ensp;Ukrajna mellett állunk.{' '}
          <AlertLink href="https://u24.gov.ua/" target="_blank" rel="noopener">
            Ukrajna támogatása ›
          </AlertLink>
          &ensp;
          <Emoji>🇺🇦</Emoji>
        </>
      ),
    },

    cookieConsent: () => (
      <CookieConsent
        prompt="Egyes funkciók sütiket igényelhetnek."
        local="Helyi beállítások és közösségi hálós bejelentkezés sütijei"
        analytics="Analitikus sütik"
      />
    ),
  },

  measurement: {
    distance: 'Távolság',
    elevation: 'Magasság',
    area: 'Terület',
    elevationFetchError: ({ err }) =>
      addError(messages, 'Hiba történt a pont magasságának beolvasásakor', err),
    elevationInfo: (params) => (
      <ElevationInfo
        {...params}
        lang="hu"
        tileMessage="Térképcsempe"
        maslMessage="Magasság"
      />
    ),
    areaInfo: (props) => (
      <AreaInfo {...props} areaLabel="Terület" perimeterLabel="Kerület" />
    ),
    distanceInfo: (props) => <DistanceInfo {...props} lengthLabel="Távolság" />,
  },

  purchases: {
    purchases: 'Vásárlások',
    premiumExpired: (at) => <>A prémium hozzáférésed lejárt ekkor: {at}</>,
    date: 'Dátum',
    item: 'Tétel',
    notPremiumYet: 'Még nincs prémium hozzáférésed.',
    awaitingBankPayment:
      'Várjuk a banki átutalás visszaigazolását. A prémium a fizetés beérkezése után aktiválódik.',
    bankPaymentFailed:
      'Néhány banki átutalás elutasításra került vagy lejárt. Ha úgy gondolod, hogy ez tévedés, vedd fel a kapcsolatot az ügyfélszolgálattal.',
    bankIntentStatus: {
      pending_settlement: 'A banki átutalás létrejött, és elszámolásra vár.',
      manual_review:
        'A banki átutalás kézi ellenőrzést igényel (pl. összegeltérés).',
      paid: 'A banki átutalás fizetettként megerősítve.',
      expired: 'A banki átutalás a megerősítés előtt lejárt.',
      failed: 'A banki átutalás sikertelen volt.',
      rejected: 'A banki átutalás elutasítva.',
      created: 'A fizetési szándék létrejött, de még nincs elszámolva.',
      unknown: 'A szolgáltató által jelentett banki státusz: {}.',
    },
    noPurchases: 'Nincsenek vásárlások',
    premium: 'Prémium',
    credits: (amount) => <>Kreditek ({amount})</>,
  },

  settings: {
    map: {
      homeLocation: {
        label: 'Lakóhely:',
        select: 'Kijelölés a térképen',
        undefined: 'meghatározatlan',
      },
    },
    account: {
      name: 'Név',
      email: 'E-mail',
      sendGalleryEmails: 'Értesítés fotómegjegyzésekről e-mailben',
      delete: 'Fiók törlése',
      deleteWarning:
        'Biztosan törölni szeretnéd a fiókodat? Ez eltávolítja az összes fotódat, fotómegjegyzésedet és értékelésedet, a térképeidet és a követett eszközeidet.',
      personalInfo: 'Személyes adatok',
      authProviders: 'Bejelentkezési szolgáltatók',
      picture: 'Profilkép',
      choosePicture: 'Kép kiválasztása',
      pictureTooLarge: 'A kép túl nagy. Maximális méret 5 MB.',
      description: 'Rólam',
    },
    layer: 'Térkép',
    overlayOpacity: 'Átlátszóság',
    showInMenu: 'Megjelenítés a menüben',
    showInToolbar: 'Megjelenítés az eszköztáron',
    saveSuccess: 'A beállítások el lettek mentve.',
    savingError: ({ err }) =>
      addError(messages, 'Hiba történt a beállítások mentésénél', err),
    customLayersDef: 'Egyéni térképrétegek meghatározása',
    customLayersDefError: 'Érvénytelen egyéni térképréteg-meghatározás.',
  },

  mapDetails: {
    notFound: 'Itt nem találtunk semmit.',

    fetchingError: ({ err }) =>
      addError(messages, 'Hiba történt a részletek lekérésekor', err),

    detail: ({ result }) => (
      <ObjectDetails
        result={result}
        openText="Megnyitás az OpenStreetMap.org oldalon"
        historyText="előzmények"
        editInJosmText="Szerkesztés JOSM-ben"
      />
    ),

    sources: 'Források',
    source: 'Forrás',
  },

  search: {
    inProgress: 'Keresés…',
    noResults: 'Nincs találat',
    prompt: 'Adja meg a helyet',
    routeFrom: 'Útvonal innen',
    routeTo: 'Útvonal ide',
    fetchingError: ({ err }) => addError(messages, 'Keresési hiba', err),
    buttonTitle: 'Keresés',
    placeholder: 'Keresés a térképen',
    result: 'Találat',
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
    layers: 'Térképrétegek',
    photoFilterWarning: 'A fényképszűrés aktív',
    minZoomWarning: (minZoom) => `A ${minZoom} nagyítási szinttől látható`,

    letters: {
      S: 'Légifelvétel',
      Z: 'Légifelvétel',
      J1: 'Légifelvétel (2017-2019)',
      J2: 'Légifelvétel (2020-2022)',
      O: 'OpenStreetMap',
      d: 'Tömegközlekedés',
      X: outdoorMap,
      i: 'Adatréteg',
      I: 'Fényképek',
      l1: 'Erdészeti utak NLC (2017)',
      l2: 'Erdészeti utak NLC',
      s0: 'Strava (minden)',
      s1: 'Strava (lovaglás)',
      s2: 'Strava (futás)',
      s3: 'Strava (vízi tevékenységek)',
      s4: 'Strava (téli tevékenységek)',
      w: 'Wikipedia',
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
    },

    attr: {
      osmData: '©\xa0OpenStreetMap közreműködők',
      maptiler: (
        <MaptilerAttribution
          tilesFrom="Vektorcsempék innen:"
          hostedBy="hosztolva:"
        />
      ),
    },
    showAll: 'Összes térkép megjelenítése',
    filterMaps: 'Térképek szűrése',
    noMapsFound: 'Nem található térkép',
    settings: 'Térkép beállítások',
    switch: 'Térképek',
    interactiveLayerWarning: 'Az adatréteg rejtve van',
    customBase: 'Egyéni térkép',
    customMaps: 'Egyéni térképek',
    addCustomMap: 'Egyéni térkép hozzáadása',
    customMapsEmptyMessage:
      'Még nincsenek egyéni térképek megadva. Adjon hozzá egyet a saját térképforrás megjelenítéséhez.',
    base: 'Alaprétegek',
    overlay: 'Fedőrétegek',
    url: 'URL sablon',
    minZoom: 'Minimális nagyítás',
    maxNativeZoom: 'Maximális natív nagyítás',
    extraScales: 'Extra felbontások',
    scaleWithDpi: 'Méretezés DPI alapján',
    zIndex: 'Z-index',
    preferences: 'Beállítások',
    maxZoom: 'Maximális nagyítás',
    forcedScale: 'Kényszerített felbontás',
    resolutionScale: 'Felbontás skála',
    resolutionScaleAuto: 'Automatikus (eszköz alapértelmezett)',
    resolutionScaleHelp:
      'Szimulálja a kijelző pixelsűrűségét. Befolyásolja, hogy melyik csempe-változat töltődik be. Ha egy réteg nem kínálja a kért változatot, helyette a legmagasabb elérhető kerül felhasználásra.',
    featureScale: 'Elemek mérete',
    featureScaleHelp:
      'Megnöveli a megjelenített feliratokat és vonalakat. Nincs hatással a műholdas, árnyékolt, WMS és vektoros (MapLibre) rétegekre.',
    stravaHeatmapColor: 'Strava hőtérkép színe',
    stravaHeatmapColors: {
      hot: 'Forró',
      blue: 'Kék',
      purple: 'Lila',
      gray: 'Szürke',
      bluered: 'Kék-piros',
    },
    layer: {
      layer: 'Réteg',
      base: 'Alap',
      overlay: 'Átfedő',
    },
    showMore: 'További térképek megjelenítése',
    countryWarning: (countries) =>
      `Csak a következő országokat fedi le: ${countries.join(', ')}`,
    configureLayers: 'Térképrétegek beállítása',
    technologies: {
      tile: 'Képcsempék (TMS, XYZ)',
      maplibre: 'Vektor (MapLibre)',
      wms: 'WMS',
      parametricShading: 'Paraméteres árnyékolás',
    },
    technology: 'Típus',
    loadWmsLayers: 'Rétegek betöltése',
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

  premium: {
    title: 'Prémium hozzáférés megszerzése',
    commonHeader: (
      <>
        <p>
          <strong>
            Támogasd az önkénteseket, akik ezt a térképet készítik!
          </strong>
        </p>
        <p className="mb-1">
          <b>8 óra</b>{' '}
          <a
            href="https://rovas.app/freemap-web"
            target="_blank"
            rel="noopener noreferrer"
          >
            önkéntes munkáért
          </a>{' '}
          vagy <b>8 €</b> összegért a következőket kaphatod egy évre:
        </p>
        <ul>
          <li>reklámszalag eltávolítása</li>
          <li
            className="text-decoration-underline"
            title="Szlovákia és Csehország nagy felbontású részletes domborzatárnyékolása, az Outdoor Map túratérkép legnagyobb nagyítási szintjei, Szlovákia és Csehország ortofotóinak legnagyobb nagyítási szintjei, különféle WMS-alapú térképek"
          >
            prémium térképrétegek
          </li>
          <li>prémium fényképek</li>
          <li>multimodális útvonaltervezés</li>
        </ul>
      </>
    ),
    stepsForAnonymous: (
      <>
        <div className="fw-bold">Eljárás</div>
        <div className="mb-3">
          <p className="mb-1 ms-3">
            <span className="fw-semibold">1. lépés</span> - hozzon létre fiókot
            itt a Freemapben (lent)
          </p>
          <p className="mb-1 ms-3">
            <span className="fw-semibold">2. lépés</span> - a Rovas
            alkalmazásban, ahová a regisztráció után irányítjuk, küldje el
            nekünk a fizetést.
          </p>
        </div>
      </>
    ),
    continue: 'Folytatás',
    success: 'Gratulálunk, megszerezted a prémium hozzáférést!',
    becomePremium: 'Prémium hozzáférés megszerzése',
    youArePremium: (date) => (
      <>
        Prémium hozzáférésed érvényes eddig: <b>{date}</b>.
      </>
    ),
    premiumOnly: 'Csak prémium hozzáféréssel érhető el.',
    alreadyPremium: 'Már rendelkezel prémium hozzáféréssel.',
    premiumUser: 'Prémium hozzáféréssel rendelkező felhasználó',
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
