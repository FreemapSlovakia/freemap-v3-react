import { MaptilerAttribution } from '@app/components/MaptilerAttribution.js';
import { CookiesConsentText } from '@features/auth/components/CookiesConsentText.js';
import { CookieConsent } from '@features/cookieConsent/components/CookieConsent.js';
import { Attribution } from '@shared/components/Attribution.js';
import { Emoji } from '@shared/components/Emoji.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { AlertLink } from 'react-bootstrap';
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
    load: 'Načíst',
    unnamed: 'Bez názvu',
    enablePopup: 'Prosím, povolte v prohlížeči pop-up okna pro tuto stránku.',
    broadcastChannelUnsupported:
      'Tato akce není ve vašem prohlížeči podporována (BroadcastChannel není k dispozici, např. v anonymním režimu nebo v prohlížeči vestavěném v aplikaci). Použijte standardní okno v moderním prohlížeči.',
    componentLoadingError:
      'Komponent se nepodařilo načíst. Zkontrolujte své připonění na internet.',
    offline: 'Nejste připojen k internetu.',
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

  selections: {
    objects: 'Objekt (POI)',
    drawPoints: 'Bod',
    drawLines: 'Čára',
    drawPolygons: 'Polygón',
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
    trackViewer: 'Import souboru',
    changesets: 'Změny v mapě',
    mapDetails: 'Detaily v mapě',
    tracking: 'Sledování',
    myMaps: 'Moje mapy',
    myMap: 'Moje mapa',
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
    infoBars: {
      ua: () => (
        <>
          <Emoji>🇺🇦</Emoji>&ensp;Stojíme za Ukrajinou.{' '}
          <AlertLink
            href="https://donio.cz/pomocukrajine"
            target="_blank"
            rel="noopener"
          >
            Pomozte Ukrajině ›
          </AlertLink>
          &ensp;
          <Emoji>🇺🇦</Emoji>
        </>
      ),
    },
  },

  search: {
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
    searchResultStyle: 'Styl výsledku hledání',
    resetApp: 'Obnovit aplikaci',
    resetAppConfirm:
      'Obnovit všechna nastavení aplikace na výchozí a znovu načíst stránku? Budete odhlášeni.',
    showAll: 'Zobrazit všechny mapy',
    filterMaps: 'Filtrovat mapy',
    noMapsFound: 'Žádné mapy nenalezeny',
    settings: 'Nastavení map',
    layers: 'Mapy',
    switch: 'Mapy',
    photoFilterWarning: 'Filtr fotografií je aktivní',
    interactiveLayerWarning: 'Datová vrstva je skryta',
    minZoomWarning: (minZoom) => `Dostupné až od přiblížení ${minZoom}`,
    outsideViewWarning: 'Aktuální výřez je mimo tuto mapu',
    letters: {
      S: 'Letecká',
      Z: 'Letecká',
      J1: 'Letecká (2017-2019)',
      J2: 'Letecká (2020-2022)',
      O: 'OpenStreetMap',
      d: 'Veřejná doprava (ÖPNV)',
      X: outdoorMap,
      i: 'Datová vrstva',
      I: 'Fotografie',
      l1: 'Lesní cesty NLC (2017)',
      l2: 'Lesní cesty NLC',
      w: 'Wikipedia',
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
    },
    attr: {
      osmData: '©\xa0přispěvatelé OpenStreetMap',
      maptiler: (
        <MaptilerAttribution
          tilesFrom="Vektorové dlaždice z"
          hostedBy="hostované na"
        />
      ),
    },
    configureLayers: 'Nastavení mapových vrstev',
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
    zIndex: 'Z-Index',
    preferences: 'Předvolby',
    maxZoom: 'Maximální přiblížení',
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
    offlineMaps: 'Offline mapy',
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
