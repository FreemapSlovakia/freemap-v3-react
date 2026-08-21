import { MaptilerAttribution } from '@app/components/MaptilerAttribution.js';
import { CookiesConsentText } from '@features/auth/components/CookiesConsentText.js';
import { CookieConsent } from '@features/cookieConsent/components/CookieConsent.js';
import { Attribution } from '@shared/components/Attribution.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import shared from './cs-shared.js';
import { addError, type Messages } from './messagesInterface.js';

const masl = 'm\xa0n.\xa0m.';

const getErrorMarkup = (ticketId?: string) => `<h1>Chyba aplikace</h1>
<p>
  ${
    ticketId
      ? `Chyba nám byla automaticky reportována pod ID <b>${ticketId}</b>.`
      : ''
  }
  Chybu můžeš nahlásit ${
    ticketId ? 'i ' : ''
  }na <a href="https://github.com/FreemapSlovakia/freemap-v3-react/issues/new" target="_blank" rel="noopener noreferrer">GitHub</a>,
  případně nám poslat detaily na <a href="mailto:freemap@freemap.sk?subject=Nahlásenie%20chyby%20na%20www.freemap.sk">freemap@freemap.sk</a>.
</p>
<p>
  Děkujeme.
</p>
`;

const outdoorMap = 'Turistika, Cyklo, Běžky, Jízda';

const messages: DeepPartialWithRequiredObjects<Messages> = {
  general: {
    cancelAutoClose: 'Zrušit automatické zavření',
    iso: 'cs_CZ',
    elevationProfile: 'Výškový profil',
    save: 'Uložit',
    cancel: 'Zrušit',
    modify: 'Upravit',
    delete: 'Smazat',
    remove: 'Odstranit',
    close: 'Zavřít',
    collapse: 'Sbalit',
    expand: 'Rozbalit',
    apply: 'Použiť',
    exitFullscreen: 'Zrušit zobrazení na celou obrazovku',
    fullscreen: 'Na celou obrazovku',
    yes: 'Ano',
    no: 'Ne',
    masl,
    copyCode: 'Zkopírovat kód',
    loading: 'Načítám…',
    ok: 'OK',
    preventShowingAgain: 'Už více nezobrazovat',
    closeWithoutSaving: 'Zavřít okno bez uložení změn?',
    resetToDefaults: 'Obnovit výchozí',
    back: 'Zpět',
    internalError: ({ ticketId }) => (
      <span dangerouslySetInnerHTML={{ __html: getErrorMarkup(ticketId) }} />
    ),
    processorError: ({ err }) => addError(messages, 'Chyba aplikace', err),
    seconds: 'sekundy',
    minutes: 'minuty',
    meters: 'metre',
    createdAt: 'Vytvořeno',
    modifiedAt: 'Změněno',
    actions: 'Akce',
    add: 'Přidat nové',
    clear: 'Vyčistit',
    convertToDrawing: 'Zkonvertovat na kreslení',
    copyToDrawing: 'Kopírovat do kresby',
    copyTo: ({ tool }) => <>Kopírovat do {tool}</>,
    simplifyPrompt:
      'Prosím zadejte faktor zjednodušení. Zadejte nulu pro vynechání zjednodušení.',
    copyUrl: 'Kopírovat URL',
    copyPageUrl: 'Kopírovat URL stránky',
    savingError: ({ err }) => addError(messages, 'Chyba ukládání', err),
    loadError: ({ err }) => addError(messages, 'Chyba nahrávání', err),
    deleteError: ({ err }) => addError(messages, 'Chyba pří mazání', err),
    operationError: ({ err }) => addError(messages, 'Operation error', err),
    deleted: 'Smazané.',
    saved: 'Uložené.',
    visual: 'Zobrazení',
    drawingTool: 'Kreslicí nástroj',
    copyOk: 'Zkopírováno do schránky.',
    noCookies: () => (
      <>
        Tato funkcionalita vyžaduje přijetí{' '}
        <CookiesConsentText>souhlasu cookies</CookiesConsentText>.
      </>
    ),
    name: 'Název',
    icon: 'Ikona',
    iconChoose: 'Vybrat ikonu…',
    iconNone: 'Bez ikony',
    iconSearch: 'Hledat ikony',
    load: 'Načíst',
    unknown: 'Neznámé',
    enablePopup: 'Prosím, povolte v prohlížeči pop-up okna pro tuto stránku.',
    broadcastChannelUnsupported:
      'Tato akce není ve vašem prohlížeči podporována (BroadcastChannel není k dispozici, např. v anonymním režimu nebo v prohlížeči vestavěném v aplikaci). Použijte standardní okno v moderním prohlížeči.',
    componentLoadingError:
      'Komponent se nepodařilo načíst. Zkontrolujte své připonění na internet.',
    offline: 'Nejste připojen k internetu.',
    offlineUnavailable: 'Nedostupné bez připojení k internetu.',
    offlineToolUnavailable:
      'Tento nástroj nedokáže bez připojení k internetu nic načíst.',
    offlineNotice:
      'Nejste připojen k internetu, takže zde nelze nic načíst ani odeslat.',
    connectionError: 'Chyba spojení se serverem.',
    experimentalFunction: 'Experimentální funkce',
    attribution: () => (
      <Attribution unknown="Licence mapy není specifikována" />
    ),
    unauthenticatedError:
      'Pro přístup k této funkci se nejprve prosím přihlašte.',
    confirmation: 'Potvrzení',
    export: 'Exportovat',
    success: 'Hotovo!',
    expiration: 'Expirace',
    privacyPolicy: 'Zásady ochrany osobních údajů',
    termsOfService: 'Obchodní podmínky',
    refundPolicy: 'Zásady vrácení peněz',
    infoAndLegal: 'Informace o mapě a právní podmínky',
    newOptionText: 'Přidat %value%',
    deleteButtonText: 'Odebrat %value% ze seznamu',
    accept: 'Přijmout',
  },

  generic: {
    color: 'Barva',
    size: 'Velikost',
    weight: 'Tloušťka',
    width: 'Šířka',
  },

  theme: {
    light: 'Světlý režim',
    dark: 'Tmavý režim',
    auto: 'Automatický režim',
  },

  cardinals: {
    n: 'S',
    ne: 'SV',
    e: 'V',
    se: 'JV',
    s: 'J',
    sw: 'JZ',
    w: 'Z',
    nw: 'SZ',
  },

  selections: {
    objects: 'Objekt (POI)',
    drawPoints: 'Bod',
    drawLines: 'Čára',
    drawPolygons: 'Polygón',
    drawPolygonHole: 'Díra v polygonu',
    tracking: 'Sledování',
    linePoint: 'Bod čáry',
    polygonPoint: 'Bod polygonu',
  },

  tools: {
    none: 'Zavřít nástroj',
    routePlanner: 'Vyhledávač tras',
    objects: 'Objekty (POI)',
    photos: 'Fotografie',
    measurement: 'Kreslení a měření',
    drawPoints: 'Kreslení bodů',
    drawLines: 'Kreslení čar',
    drawPolygons: 'Kreslení polygonů',
    dataViewer: 'Trasy a data',
    changesets: 'Změny v mapě',
    mapDetails: 'Detaily v mapě',
    tracking: 'Sledování',
    myMaps: 'Moje mapy',
    myMap: 'Moje mapa',
    gpsRecorder: 'GPS záznamník',
    toposcope: 'Orientační růžice',
    panorama: 'Panorama',
  },

  mainMenu: {
    title: 'Hlavní menu',
    logOut: 'Odhlásit',
    logIn: 'Přihlášení',
    account: 'Účet',
    mapFeaturesExport: 'Export mapových dat',
    gpsDevicesMapExports: 'Mapy pro GPS zařízení',
    embedMap: 'Vložit do webstránky',
    offlineMapExport: 'Export offline máp',
    supportUs: 'Podpořit Freemap',
    help: 'Pomoc',
    back: 'Zpět',
    mapLegend: 'Legenda mapy',
    contacts: 'Kontakty',
    facebook: 'Freemap na Facebooku',
    twitter: 'Freemap na Twitteru',
    youtube: 'Freemap na YouTube',
    github: 'Freemap na GitHub-u',
    mastodon: 'Freemap na Mastodonu',
    googlePlay: 'Freemap na Google Play',
    appStore: 'Freemap na App Store',
    automaticLanguage: 'Automaticky',
    mapToDocumentExport: 'Export mapy do obrázku/dokumentu',
    osmWiki: 'Dokumentační projekt OpenStreetMap ',
    wikiLink: 'https://wiki.openstreetmap.org/wiki/Cs:Main_Page',
    status: 'Stav služeb',
    language: 'Jazyk',
  },

  main: {
    title: shared.title,
    description: shared.description,
    clearMap: 'Vyčistit mapu',
    close: 'Zavřít',
    closeTool: 'Zavřít nástroj',
    locateMe: 'Kde jsem?',
    locationError: 'Nepodařilo se získat pozici.',
    locationNoSignal: 'Zatím bez signálu GPS.',
    headingSource: 'Ukazatel směru',
    headingSources: {
      none: 'Skrytý',
      gps: 'Směr pohybu',
      compass: 'Kompas zařízení',
    },
    headingSourceHelp:
      'Směr pohybu pochází z GPS a zobrazuje se pouze při pohybu. Kompas zařízení funguje i vestoje, vyžaduje však oprávnění a může být nepřesný.',
    bearingLine: 'Vzdálenost a azimut',
    bearingLineHelp:
      'Během lokalizace vykreslí čáru mezi vaší polohou a zaměřovacím křížem uprostřed mapy, s popisem vzdálenosti a azimutu z vaší polohy ke kříži. Zobrazí se, jakmile mapu posunete mimo vaši polohu.',
    compassPermissionDenied: 'Přístup ke kompasu byl zamítnut.',
    compassUnavailable:
      'Žádná data z kompasu. Vaše zařízení ho nemusí mít, nebo je přístup k němu zablokován.',
    zoomIn: 'Přiblížit mapu',
    zoomOut: 'Oddálit mapu',
    devInfo: () => (
      <div>
        Toto je testovací verze portálu Freemap Slovakia. Pro ostrou verzi
        přejděte na <a href="https://www.freemap.sk/">www.freemap.sk</a>.
      </div>
    ),
    copyright: 'Licence mapy',
    cookieConsent: () => (
      <CookieConsent
        prompt="Některé funkce mohou vyžadovat cookies."
        local="Cookies lokálních nastavení a přihlášení pomocí sociálních sítí"
        analytics="Analytické cookies"
      />
    ),
    infoBars: {},
  },

  search: {
    showMore: 'Zobrazit více…',
    inProgress: 'Hledám…',
    noResults: 'Nebyly nalezeny žádné výsledky',
    prompt: 'Zadejte lokalitu',
    routeFrom: 'Navigovat odsud',
    routeTo: 'Navigovat sem',
    fetchingError: ({ err }) =>
      addError(
        messages,
        'Nastala chyba při zpracování výsledků vyhledávání:',
        err,
      ),
    buttonTitle: 'Hledat',
    placeholder: 'Hledat v mapě',
    result: 'Nález',
    keepOnMap: 'Ponechat v mapě',
    offlineHint:
      'Bez připojení k internetu lze najít pouze souřadnice, ohraničující box, čísla dlaždic (z/x/y) nebo vložený GeoJSON.',
    sources: {
      'nominatim-reverse': 'Reverzní geokódování',
      'overpass-nearby': 'Blízké objekty',
      'overpass-surrounding': 'Obsahující objekty',
      bbox: 'Ohraničující box',
      geojson: 'GeoJSON',
      tile: 'Dlaždice',
      coords: 'Souřadnice',
      'nominatim-forward': 'Geokódování',
      osm: 'OpenStreetMap',
      'wms:': 'WMS',
    },
  },

  mapLayers: {
    lookupStyle: 'Styl nálezu',
    resetApp: 'Obnovit aplikaci',
    resetAppConfirm:
      'Obnovit všechna nastavení aplikace na výchozí a znovu načíst stránku? Budete odhlášeni.',
    showAll: 'Zobrazit všechny mapy',
    filterMaps: 'Filtrovat mapy',
    noMapsFound: 'Žádné mapy nenalezeny',
    settings: 'Správa map',
    layers: 'Mapy',
    switch: 'Mapy',
    photoFilterWarning: 'Filtr fotografií je aktivní',
    interactiveLayerWarning: 'Datová vrstva je skryta',
    minZoomWarning: (minZoom) => `Dostupné až od přiblížení ${minZoom}`,
    outsideViewWarning: 'Aktuální výřez je mimo tuto mapu',
    offlineWarning: 'Tato mapa není uložena pro offline použití',
    letters: {
      S: 'Letecká',
      Z: 'Letecká',
      J1: 'Letecká (2017-2019)',
      J2: 'Letecká (2020-2022)',
      O: 'OpenStreetMap',
      d: 'Veřejná doprava (ÖPNV)',
      X: outdoorMap,
      XK: 'Turistické trasy KST',
      i: 'Datová vrstva',
      I: 'Fotografie',
      l1: 'Lesní cesty NLC (2017)',
      l2: 'Lesní cesty NLC',
      w: 'Wikipedia',
      R: 'Meteoradar',
      '5': 'Stínování terénu',
      '6': 'Stínování povrchu',
      '7': 'Detailní stínování terénu',
      '8': 'Detailní stínování terénu',
      VO: 'OpenStreetMap Vektorová',
      VS: 'Streets Vektorová',
      VD: 'Dataviz Vektorová',
      VT: 'Outdoor Vektorová',
      h: ' Parametrické stínování',
      z: ' Parametrické stínování',
      y: ' Parametrické stínování',
      M: 'Fotografie z Wikimedia Commons',
      WDZ: 'Dřevinné složení',
      WLT: 'Lesní typy',
      WGE: 'Geologická',
      WKA: 'Katastr',
      wka: 'Katastr',
      WHC: 'Hydrochemická',
    },
    customBase: 'Vlastní mapa',
    type: {
      map: 'mapa',
      data: 'data',
      photos: 'fotografie',
      routing: 'vyhledávání tras',
    },
    attr: {
      osmData: '©\xa0přispěvatelé OpenStreetMap',
      maptiler: (
        <MaptilerAttribution
          tilesFrom="Vektorové dlaždice z"
          hostedBy="hostované na"
        />
      ),
      photosCc: 'různé licence Creative Commons',
    },
    layersConfiguration: 'Nastavení vrstev',
    customMaps: 'Vlastní mapy',
    addCustomMap: 'Přidat vlastní mapu',
    activate: 'Aktivovat',
    customMapsEmptyMessage:
      'Zatím nejsou definovány žádné vlastní mapy. Přidejte jednu pro zobrazení vlastního zdroje map.',
    base: 'Základní vrstvy',
    overlay: 'Překryvné vrstvy',
    url: 'Šablona URL',
    minZoom: 'Minimální přiblížení',
    maxNativeZoom: 'Maximální přirozené přiblížení',
    extraScales: 'Další rozlišení',
    scaleWithDpi: 'Škálovat podle DPI',
    tiled: 'Načítat po dlaždicích',
    tiledHelp:
      'WMS se ve výchozím nastavení vyžádá jako jeden obrázek celého výřezu: jeden požadavek místo desítek a popisky nepřeříznuté na hranicích dlaždic. Dlaždice zapněte pro server, který omezuje velikost obrázku nebo který dlaždice ukládá do mezipaměti — za cenu dávky požadavků na každý výřez.',
    zIndex: 'Z-Index',
    preferences: 'Předvolby mapy',
    maxZoom: 'Maximální přiblížení',
    zoomSnap: 'Krok přiblížení',
    zoomSnapFree: 'Volně',
    zoomSnapHelp:
      'Nejmenší změna přiblížení, na které může skončit přiblížení kolečkem, gestem a výběrem obdélníku. 1 drží mapu na celých úrovních, zlomek jí dovolí zastavit i mezi nimi a Volně kdekoli. Tlačítka a klávesy + a – jdou vždy na nejbližší celou úroveň.',
    forcedScale: 'Vynucené rozlišení',
    resolutionScale: 'Škála rozlišení',
    resolutionScaleAuto: 'Automaticky (podle zařízení)',
    resolutionScaleHelp:
      'Simuluje hustotu pixelů displeje. Ovlivňuje, který variant dlaždic se načte. Pokud vrstva nenabízí požadovaný variant, použije se nejvyšší dostupný.',
    featureScale: 'Velikost prvků',
    featureScaleHelp:
      'Zvětšuje vykreslené popisky a čáry. Nemá vliv na satelitní, stínované, WMS ani vektorové (MapLibre) vrstvy.',
    layer: {
      layer: 'Vrstva',
      base: 'Základní',
      overlay: 'Překryvná',
    },
    showMore: 'Ukázat více map',
    technology: 'Typ',
    technologies: {
      tile: 'Obrázkové dlaždice (TMS, XYZ)',
      maplibre: 'Vektor (MapLibre)',
      wms: 'WMS',
      parametricShading: 'Parametrické stínování',
    },
    loadWmsLayers: 'Načíst vrstvy',
    serverNotResponding: ({ name }) => (
      <>
        Server mapy <b>{name}</b> neodpovídá.
      </>
    ),
    offlineMaps: 'Offline mapy',
    browseCache: 'Ukládání při prohlížení',
    legacy: 'zastaralá',
    legacyMapWarning: ({ from, to }) => (
      <>
        Zobrazená mapa <b>{messages.mapLayers.letters[from]}</b> je zastaralá.
        Přepnout na moderní <b>{messages.mapLayers.letters[to]}</b>?
      </>
    ),
  },

  elevationChart: {
    distance: 'Vzdálenost [km]',
    ele: 'Nadm. výška [m.n.m.] ',
    fetchError: ({ err }) =>
      addError(messages, 'Nastala chyba při získávání výškového profilu', err),
    settings: 'Předvolby nadmořské výšky',
    settingsHelp:
      'První dvě nastavení opravují model terénu, takže platí všude, kde se výška čte z něj: u plánovaných tras, nakreslených linií a měření a u importovaných tras, kterým jste výšku nahradili ze serveru. Zaznamenaná nadmořská výška — živé sledování nebo trasa, kterou jste ponechali tak, jak byla zaznamenána — zůstává nedotčená. Exportované soubory si vždy zachovají vlastní výšku.',
    windowOff: 'vypnuto',
    windowWholeLine: 'celá trasa',
    despike: 'Odstranit špice',
    despikeHelp:
      'Když je cesta nakreslená pár metrů vedle vozovky, kterou popisuje, model terénu vrátí výšku svahu nebo skalní stěny vedle ní. Špice užší než polovina této hodnoty se odstraní a profil se mírně zaoblí; širší se zachovají, protože jde o skutečný terén. Nula funkci vypne.',
    ditchFill: 'Zaplnit příkopy modelu terénu',
    ditchFillHelp:
      'Detailní národní modely terénu, dostupné v některých zemích, bývají upraveny pro hydrologii: u každého propustku vyřežou přes cestu příkop. Prohlubně užší než tato hodnota se zaplní; širší se zachovají, protože jde o skutečný terén. Nula funkci vypne a tam, kde se používá globální model, nemění nic.',
    gradeWindow: 'Okno pro sklon',
    gradeWindowHelp:
      'Když ukážete na výškový profil, místo se vyznačí na mapě spolu s tím, jaký je tam sklon. Sklon se průměruje na úseku této délky kolem daného bodu, aby pár metrů nepřesnosti GPS nevypadalo jako stěna. Nula jej měří jen na tom úseku, na kterém dané místo stojí; druhý konec stupnice jej měří najednou přes celou trasu, tedy udává její převýšení na celé její délce — u rovné měřicí linie je to úhel, pod kterým je jeden konec vidět z druhého.',
  },

  errorCatcher: {
    html: (ticketId) => `${getErrorMarkup(ticketId)}
      <p>
        Akce:
      </p>
      <ul>
        <li><a href="">znovu načíst poslední stránku</a></li>
        <li><a href="/">znovu načíst úvodní stránku</a></li>
        <li><a href="/#reset-local-storage">smazat lokální data a znovunačíst úvodní stránku</a></li>
      </ul>
    `,
  },

  // check/improve translation
  mapCtxMenu: {
    centerMap: 'Zde centrovat mapu',
    measurePosition: 'Zjistit souřadnice a výšku bodu',
    addPoint: 'Zde přidat bod',
    startLine: 'Zde začít křeslit/měřit vzdálenost',
    queryFeatures: 'Zjistit detaily v okolí',
    startRoute: 'Zde začít trasu',
    finishRoute: 'Zde ukončit trasu',
    showPhotos: 'Zobrazit fotky v okolí',
  },

  errorStatus: {
    100: 'Pokračovat',
    101: 'Přepínání protokolů',
    102: 'Zpracovává se',
    103: 'Předběžné hlavičky',
    200: 'OK',
    201: 'Vytvořeno',
    202: 'Přijato',
    203: 'Neoficiální informace',
    204: 'Žádný obsah',
    205: 'Reset obsahu',
    206: 'Částečný obsah',
    207: 'Vícestavový',
    208: 'Již oznámeno',
    226: 'IM použito',
    300: 'Více možností',
    301: 'Trvale přesunuto',
    302: 'Nalezeno',
    303: 'Přesměruj jinam',
    304: 'Neměněno',
    305: 'Použij proxy',
    306: 'Přepněte proxy',
    307: 'Dočasné přesměrování',
    308: 'Trvalé přesměrování',
    400: 'Špatný požadavek',
    401: 'Neautorizováno',
    402: 'Platba vyžadována',
    403: 'Zakázáno',
    404: 'Nenalezeno',
    405: 'Metoda není povolena',
    406: 'Nepřijatelné',
    407: 'Požadována proxy autentizace',
    408: 'Vypršel čas požadavku',
    409: 'Konflikt',
    410: 'Zánik',
    411: 'Vyžadována délka',
    412: 'Předpoklad selhal',
    413: 'Náklad příliš velký',
    414: 'URI příliš dlouhé',
    415: 'Nepodporovaný typ média',
    416: 'Požadovaný rozsah není dostupný',
    417: 'Očekávání selhalo',
    418: 'Jsem čajová konvice',
    421: 'Nesprávně směrovaná požadavka',
    422: 'Nezpracovatelná entita',
    423: 'Uzamčeno',
    424: 'Selhání závislosti',
    425: 'Příliš brzy',
    426: 'Vyžaduje upgrade',
    428: 'Vyžadován předpoklad',
    429: 'Příliš mnoho požadavků',
    431: 'Pole hlavičky požadavku jsou příliš velká',
    451: 'Nedostupné z právních důvodů',
    500: 'Interní chyba serveru',
    501: 'Není implementováno',
    502: 'Špatná brána',
    503: 'Služba není dostupná',
    504: 'Vypršel čas brány',
    505: 'HTTP verze není podporována',
    506: 'Varianty se vyjednávají',
    507: 'Nedostatečné úložiště',
    508: 'Zjištěná smyčka',
    510: 'Nerozšířeno',
    511: 'Vyžadována síťová autentizace',
  },
  gpu: {
    lost: 'Zařízení GPU bylo ztraceno: ',
    noAdapter: 'V tomto prohlížeči není dostupný WebGPU adaptér.',
    notSupported: 'WebGPU není v tomto prohlížeči podporováno.',
    errorRequestingDevice: 'Nepodařilo se vytvořit GPU zařízení: ',
    other: 'Chyba při vykreslování: ',
  },
};

export default messages;
