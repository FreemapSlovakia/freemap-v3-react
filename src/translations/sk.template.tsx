import { MaptilerAttribution } from '@app/components/MaptilerAttribution.js';
import { CookiesConsentText } from '@features/auth/components/CookiesConsentText.js';
import { CookieConsent } from '@features/cookieConsent/components/CookieConsent.js';
import { Attribution } from '@shared/components/Attribution.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError, type Messages } from './messagesInterface.js';
import shared from './sk-shared.js';

const masl = 'm\xa0n.\xa0m.';

const getErrorMarkup = (ticketId?: string) => `<h1>Chyba aplikácie</h1>
<p>
  ${
    ticketId
      ? `Chyba nám bola automaticky nahlásená pod ID <b>${ticketId}</b>.`
      : ''
  }
  Chybu môžete nahlásiť ${
    ticketId ? 'aj ' : ''
  }na <a href="https://github.com/FreemapSlovakia/freemap-v3-react/issues/new" target="_blank" rel="noopener noreferrer">GitHub</a>,
  prípadne nám môžete poslať podrobnosti na <a href="mailto:freemap@freemap.sk?subject=Nahlásenie%20chyby%20na%20www.freemap.sk">freemap@freemap.sk</a>.
</p>
<p>
  Ďakujeme.
</p>`;

const outdoorMap = 'Turistika, Cyklo, Bežky, Jazdenie';

const messages: DeepPartialWithRequiredObjects<Messages> = {
  general: {
    iso: 'sk_SK',
    elevationProfile: 'Výškový profil',
    save: 'Uložiť',
    cancel: 'Zrušiť',
    modify: 'Upraviť',
    delete: 'Zmazať',
    remove: 'Odstrániť',
    close: 'Zavrieť',
    collapse: 'Zbaliť',
    expand: 'Rozbaliť',
    apply: 'Použiť',
    exitFullscreen: 'Zrušiť zobrazenie na celú obrazovku',
    fullscreen: 'Na celú obrazovku',
    yes: 'Áno',
    no: 'Nie',
    masl,
    copyCode: 'Skopírovať kód',
    loading: 'Načítavam…',
    ok: 'OK',
    preventShowingAgain: 'Už viac nezobrazovať',
    closeWithoutSaving: 'Zavrieť okno bez uloženia zmien?',
    resetToDefaults: 'Obnoviť predvolené',
    back: 'Späť',
    internalError: ({ ticketId }) => (
      <span dangerouslySetInnerHTML={{ __html: getErrorMarkup(ticketId) }} />
    ),
    processorError: ({ err }) => addError(messages, 'Chyba aplikácie', err),
    seconds: 'sekundy',
    minutes: 'minúty',
    meters: 'metre',
    createdAt: 'Vytvorené',
    modifiedAt: 'Zmenené',
    actions: 'Akcie',
    add: 'Pridať nové',
    clear: 'Vyčistiť',
    convertToDrawing: 'Skonvertovať na kreslenie',
    copyToDrawing: 'Kopírovať do kreslenia',
    copyTo: ({ tool }) => <>Kopírovať do {tool}</>,
    simplifyPrompt:
      'Prosím, zadajte faktor zjednodušenia. Zadajte nulu pre vynechanie zjednodušenia.',
    copyUrl: 'Kopírovať URL',
    copyPageUrl: 'Kopírovať URL stránky',
    savingError: ({ err }) => addError(messages, 'Chyba ukladania', err),
    loadError: ({ err }) => addError(messages, 'Chyba načítania', err),
    deleteError: ({ err }) => addError(messages, 'Chyba mazania', err),
    operationError: ({ err }) => addError(messages, 'Chyba operácie', err),
    deleted: 'Zmazané.',
    saved: 'Uložené.',
    visual: 'Zobrazenie',
    drawingTool: 'Kresliaci nástroj',
    copyOk: 'Skopírované do schránky.',
    noCookies: () => (
      <>
        Táto funkcionalita vyžaduje prijatie{' '}
        <CookiesConsentText>súhlasu cookies</CookiesConsentText>.
      </>
    ),
    name: 'Názov',
    icon: 'Ikona',
    iconChoose: 'Vybrať ikonu…',
    iconNone: 'Bez ikony',
    iconSearch: 'Hľadať ikony',
    load: 'Načítať',
    unknown: 'Neznáme',
    enablePopup:
      'Prosím, povoľte vo vašom prehliadači vyskakovacie (pop-up) okná pre túto stránku.',
    broadcastChannelUnsupported:
      'Táto akcia nie je vo vašom prehliadači podporovaná (BroadcastChannel nie je k dispozícii, napr. v anonymnom režime alebo v prehliadači vstavanom v aplikácii). Použite štandardné okno v modernom prehliadači.',
    componentLoadingError:
      'Komponent sa nepodarilo načítať. Skontrolujte svoje pripojenie k internetu.',
    offline: 'Nie ste pripojený k internetu.',
    offlineUnavailable: 'Nedostupné bez pripojenia na internet.',
    offlineToolUnavailable:
      'Tento nástroj nedokáže bez pripojenia na internet nič načítať.',
    offlineNotice:
      'Nie ste pripojený k internetu, takže tu nemožno nič načítať ani odoslať.',
    connectionError: 'Chyba spojenia so serverom.',
    experimentalFunction: 'Experimentálna funkcia',
    attribution: () => (
      <Attribution unknown="Licencia mapy nie je špecifikovaná" />
    ),
    unauthenticatedError:
      'Pre prístup k tejto funkcii sa najprv prihláste, prosím.',
    confirmation: 'Potvrdenie',
    export: 'Exportovať',
    success: 'Hotovo!',
    expiration: 'Exspirácia',
    privacyPolicy: 'Zásady ochrany osobných údajov',
    termsOfService: 'Obchodné podmienky',
    refundPolicy: 'Zásady vrátenia peňazí',
    infoAndLegal: 'Informácie o mape a právne podmienky',
    newOptionText: 'Pridať %value%',
    deleteButtonText: 'Odobrať %value% zo zoznamu',
    accept: 'Prijať',
  },

  generic: {
    color: 'Farba',
    size: 'Veľkosť',
    weight: 'Hrúbka',
    width: 'Šírka',
  },

  theme: {
    light: 'Svetlý režim',
    dark: 'Tmavý režim',
    auto: 'Automatický režim',
  },

  selections: {
    objects: 'Objekt (POI)',
    drawPoints: 'Bod',
    drawLines: 'Čiara',
    drawPolygons: 'Polygón',
    drawPolygonHole: 'Diera v polygóne',
    tracking: 'Sledovanie',
    linePoint: 'Bod čiary',
    polygonPoint: 'Bod polygónu',
  },

  tools: {
    none: 'Zavrieť nástroj',
    routePlanner: 'Vyhľadávač trás',
    objects: 'Objekty (POI)',
    photos: 'Fotografie',
    measurement: 'Kreslenie a meranie',
    drawPoints: 'Kreslenie bodov',
    drawLines: 'Kreslenie čiar',
    drawPolygons: 'Kreslenie polygónov',
    dataViewer: 'Trasy a dáta',
    changesets: 'Zmeny v mape',
    mapDetails: 'Detaily v mape',
    tracking: 'Sledovanie',
    myMaps: 'Moje mapy',
    myMap: 'Moja mapa',
    gpsRecorder: 'GPS zaznamenávač',
  },

  mainMenu: {
    title: 'Hlavné menu',
    logOut: 'Odhlásiť',
    logIn: 'Prihlásenie',
    account: 'Účet',
    mapFeaturesExport: 'Export mapových dát',
    gpsDevicesMapExports: 'Mapy pre GPS zariadenia',
    embedMap: 'Vložiť do webstránky',
    offlineMapExport: 'Export offline máp',
    supportUs: 'Podporiť Freemap',
    help: 'Info a pomoc',
    back: 'Naspäť',
    mapLegend: 'Legenda mapy',
    contacts: 'Kontakty',
    facebook: 'Freemap na Facebooku',
    twitter: 'Freemap na Twitteri',
    youtube: 'Freemap na YouTube',
    github: 'Freemap na GitHub-e',
    mastodon: 'Freemap na Mastodone',
    googlePlay: 'Freemap na Google Play',
    appStore: 'Freemap na App Store',
    automaticLanguage: 'Automaticky',
    mapToDocumentExport: 'Export mapy do obrázka/dokumentu',
    osmWiki: 'Dokumentačný projekt OpenStreetMap',
    wikiLink: 'https://wiki.openstreetmap.org/wiki/Sk:WikiProjekt_Slovensko',
    status: 'Stav služieb',
    language: 'Jazyk',
  },
  main: {
    title: shared.title,
    description: shared.description,
    clearMap: 'Vyčistiť mapu',
    close: 'Zavrieť',
    closeTool: 'Zavrieť nástroj',
    locateMe: 'Kde som?',
    locationError: 'Nepodarilo sa získať pozíciu.',
    locationNoSignal: 'Zatiaľ bez signálu GPS.',
    headingSource: 'Ukazovateľ smeru',
    headingSources: {
      none: 'Skrytý',
      gps: 'Smer pohybu',
      compass: 'Kompas zariadenia',
    },
    headingSourceHelp:
      'Smer pohybu pochádza z GPS a zobrazuje sa iba počas pohybu. Kompas zariadenia funguje aj v stoji, vyžaduje však povolenie a môže byť nepresný.',
    bearingLine: 'Vzdialenosť a azimut',
    bearingLineHelp:
      'Počas lokalizácie vykreslí čiaru medzi vašou polohou a zameriavacím krížom v strede mapy, s popisom vzdialenosti a azimutu z vašej polohy ku krížu. Zobrazí sa, keď mapu posuniete mimo svojej polohy.',
    compassPermissionDenied: 'Prístup ku kompasu bol zamietnutý.',
    compassUnavailable:
      'Žiadne údaje z kompasu. Vaše zariadenie ho nemusí mať, alebo je prístup k nemu zablokovaný.',
    zoomIn: 'Priblížiť mapu',
    zoomOut: 'Oddialiť mapu',
    devInfo: () => (
      <div>
        Toto je testovacia verzia portálu Freemap Slovakia. Pre ostrú verziu
        prejdite na <a href="https://www.freemap.sk/">www.freemap.sk</a>.
      </div>
    ),
    copyright: 'Licencia mapy',
    cookieConsent: () => (
      <CookieConsent
        prompt="Niektoré funkcie môžu vyžadovať cookies."
        local="Cookies lokálnych nastavení a prihlásenia pomocou sociálnych sietí"
        analytics="Analytické cookies"
      />
    ),
    infoBars: {
      // dp: () => {
      //   const dispatch = useDispatch();
      //   return (
      //     <>
      //       <span className="d-sm-none">Podporte nás prosím</span>
      //       <span className="d-none d-sm-inline d-xl-none">
      //         Podporte prosím prevádzku služieb Freemap.sk vašimi
      //       </span>
      //       <span className="d-none d-xl-inline">
      //         Freemap.sk je nekomerčný projekt a preto na svoju prevádzku
      //         potrebuje podporu dobrovoľníkov. Pomôžte mu prosím vašimi
      //       </span>{' '}
      //       <AlertLink
      //         href="/#document=dvePercenta"
      //         onClick={(e) => {
      //           e.preventDefault();
      //           dispatch(documentShow('dvePercenta'));
      //         }}
      //       >
      //         2 % z dane
      //       </AlertLink>
      //       .
      //     </>
      //   );
      // },
    },
  },

  search: {
    inProgress: 'Hľadám…',
    noResults: 'Nenašli sa žiadne výsledky',
    prompt: 'Zadajte lokalitu',
    routeFrom: 'Navigovať odtiaľto',
    routeTo: 'Navigovať sem',
    fetchingError: ({ err }) =>
      addError(
        messages,
        'Nastala chyba pri spracovaní výsledkov vyhľadávania',
        err,
      ),
    buttonTitle: 'Hľadať',
    placeholder: 'Hľadať v mape',
    result: 'Nález',
    showMore: 'Zobraziť viac…',
    keepOnMap: 'Ponechať na mape',
    offlineHint:
      'Bez pripojenia na internet možno nájsť iba súradnice, ohraničujúci box, čísla dlaždíc (z/x/y) alebo vložený GeoJSON.',
    sources: {
      'nominatim-reverse': 'Reverzné geokódovanie',
      'overpass-nearby': 'Blízke objekty',
      'overpass-surrounding': 'Obsahujúce objekty',
      bbox: 'Ohraničujúci box',
      geojson: 'GeoJSON',
      tile: 'Dlaždica',
      coords: 'Súradnice',
      'nominatim-forward': 'Geokódovanie',
      osm: 'OpenStreetMap',
      'wms:': 'WMS',
    },
  },

  mapLayers: {
    showMore: 'Ukázať viac máp',
    showAll: 'Ukázať všetky mapy',
    filterMaps: 'Filtrovať mapy',
    noMapsFound: 'Žiadne mapy nenájdené',
    settings: 'Správa máp',
    layers: 'Mapy',
    switch: 'Mapy',
    photoFilterWarning: 'Filter fotografií je aktívny',
    interactiveLayerWarning: 'Dátová vrstva je skrytá',
    minZoomWarning: (minZoom) => `Dostupné až od priblíženia ${minZoom}`,
    outsideViewWarning: 'Aktuálny výrez je mimo tejto mapy',
    offlineWarning: 'Táto mapa nie je uložená pre offline použitie',
    letters: {
      S: 'Letecká',
      Z: 'Letecká',
      J1: 'Letecká (2017-2019)',
      J2: 'Letecká (2020-2022)',
      O: 'OpenStreetMap',
      d: 'Verejná doprava (ÖPNV)',
      X: outdoorMap,
      XK: 'Turistické trasy KST',
      i: 'Dátová vrstva',
      I: 'Fotografie',
      l1: 'Lesné cesty NLC (2017)',
      l2: 'Lesné cesty NLC',
      w: 'Wikipedia',
      R: 'Meteoradar',
      M: 'Fotografie z Wikimedia Commons',
      '5': 'Tieňovanie terénu',
      '6': 'Tieňovanie povrchu',
      '7': 'Detailné tieňovanie terénu',
      '8': 'Detailné tieňovanie terénu',
      VO: 'OpenStreetMap Vektorová',
      VS: 'Streets Vektorová',
      VD: 'Dataviz Vektorová',
      VT: 'Outdoor Vektorová',
      h: 'Parametrické tieňovanie',
      z: 'Parametrické tieňovanie',
      y: 'Parametrické tieňovanie',
      WDZ: 'Drevinové zloženie',
      WLT: 'Lesné typy',
      WGE: 'Geologická',
      WKA: 'Kataster',
      wka: 'Kataster',
      WHC: 'Hydrochemická',
    },
    customBase: 'Vlastná mapa',
    type: {
      map: 'mapa',
      data: 'dáta',
      photos: 'fotografie',
      routing: 'vyhľadávanie trás',
    },
    attr: {
      osmData: '©\xa0prispievatelia OpenStreetMap',
      maptiler: (
        <MaptilerAttribution
          tilesFrom="Vektorové dlaždice z"
          hostedBy="hostované na"
        />
      ),
      photosCc: 'rôzne licencie Creative Commons',
    },
    configureLayers: 'Nastavenie vrstiev',
    customMaps: 'Vlastné mapy',
    addCustomMap: 'Pridať vlastnú mapu',
    activate: 'Aktivovať',
    customMapsEmptyMessage:
      'Zatiaľ nie sú definované žiadne vlastné mapy. Pridajte jednu na zobrazenie vlastného zdroja máp.',
    base: 'Základné vrstvy',
    overlay: 'Prekryvné vrstvy',
    technology: 'Typ',
    technologies: {
      tile: 'Dlaždice obrázkov (TMS, XYZ)',
      maplibre: 'Vektor (MapLibre)',
      wms: 'WMS',
      parametricShading: 'Parametrické tieňovanie',
    },
    url: 'URL',
    minZoom: 'Minimálne priblíženie',
    maxNativeZoom: 'Maximálne prirodzené priblíženie',
    extraScales: 'Extra rozlíšenia máp',
    scaleWithDpi: 'Škálovať s DPI',
    tiled: 'Načítať po dlaždiciach',
    tiledHelp:
      'WMS sa štandardne vyžiada ako jeden obrázok celého výrezu: jedna požiadavka namiesto desiatok a názvy neprerezané na hraniciach dlaždíc. Dlaždice zapnite pre server, ktorý obmedzuje veľkosť obrázka alebo ktorý dlaždice kešuje — za cenu dávky požiadaviek na každý výrez.',
    zIndex: 'Z-Index',
    preferences: 'Predvoľby',
    mapSection: 'Mapa',
    maxZoom: 'Maximálne priblíženie',
    zoomSnap: 'Krok priblíženia',
    zoomSnapFree: 'Voľne',
    zoomSnapHelp:
      'Najmenšia zmena priblíženia, na ktorej môže skončiť priblíženie kolieskom, gestom a výberom obdĺžnika. 1 drží mapu na celých úrovniach, zlomok jej dovolí zastaviť aj medzi nimi a Voľne kdekoľvek. Tlačidlá a klávesy + a – idú vždy na najbližšiu celú úroveň.',
    forcedScale: 'Vynútené rozlíšenie',
    resolutionScale: 'Škála rozlíšenia',
    resolutionScaleAuto: 'Automaticky (podľa zariadenia)',
    resolutionScaleHelp:
      'Simuluje hustotu pixelov displeja. Ovplyvňuje, ktorý variant dlaždíc sa načíta. Ak vrstva neponúka požadovaný variant, použije sa najvyšší dostupný.',
    featureScale: 'Veľkosť prvkov',
    featureScaleHelp:
      'Zväčšuje vykreslené popisy a čiary. Nemá vplyv na satelitné, tieňované, WMS ani vektorové (MapLibre) vrstvy.',
    lookupStyle: 'Štýl nálezu',
    resetApp: 'Obnoviť aplikáciu',
    resetAppConfirm:
      'Obnoviť všetky nastavenia aplikácie na predvolené a znovu načítať stránku? Budete odhlásení.',
    layer: {
      layer: 'Vrstva',
      base: 'Základná',
      overlay: 'Prekryvná',
    },
    loadWmsLayers: 'Načítať vrstvy',
    serverNotResponding: ({ name }) => (
      <>
        Server mapy <b>{name}</b> neodpovedá.
      </>
    ),
    offlineMaps: 'Offline mapy',
    legacy: 'zastaralá',
    legacyMapWarning: ({ from, to }) => (
      <>
        Zobrazená mapa <b>{messages.mapLayers.letters[from]}</b> je zastaraná.
        Prepnúť na modernú <b>{messages.mapLayers.letters[to]}</b>?
      </>
    ),
  },

  elevationChart: {
    distance: 'Vzdialenosť [km]',
    ele: `Nadm. výška [${masl}]`,
    fetchError: ({ err }) =>
      addError(messages, 'Nastala chyba pri získavaní výškového profilu', err),
    settings: 'Nadmorská výška',
    settingsHelp:
      'Prvé dve nastavenia opravujú model terénu, takže platia všade, kde sa výška číta z neho: pri plánovaných trasách, nakreslených líniách a meraniach a pri importovaných trasách, ktorým ste výšku nahradili zo servera. Zaznamenaná nadmorská výška — živé sledovanie alebo trasa, ktorú ste ponechali tak, ako bola zaznamenaná — zostáva nedotknutá. Exportované súbory si vždy zachovajú vlastnú výšku.',
    windowOff: 'vypnuté',
    windowWholeLine: 'celá trasa',
    despike: 'Odstrániť špice',
    despikeHelp:
      'Keď je cesta nakreslená pár metrov vedľa vozovky, ktorú opisuje, model terénu vráti výšku svahu alebo skalnej steny vedľa nej. Špice užšie ako polovica tejto hodnoty sa odstránia a profil sa mierne zaoblí; širšie sa zachovajú, keďže ide o skutočný terén. Nula funkciu vypne.',
    ditchFill: 'Zaplniť priekopy modelu terénu',
    ditchFillHelp:
      'Detailné národné modely terénu, dostupné v niektorých krajinách, bývajú upravené pre hydrológiu: pri každom priepuste vyrežú cez cestu priekopu. Preliačiny užšie ako táto hodnota sa zaplnia; širšie sa zachovajú, keďže ide o skutočný terén. Nula funkciu vypne a tam, kde sa používa globálny model, nemení nič.',
    gradeWindow: 'Okno pre sklon',
    gradeWindowHelp:
      'Keď ukážete na výškový profil, miesto sa vyznačí na mape spolu s tým, aký je tam sklon. Sklon sa priemeruje na úseku tejto dĺžky okolo daného bodu, aby pár metrov nepresnosti GPS nevyzeralo ako stena. Nula ho meria len na tom úseku, na ktorom dané miesto stojí; druhý koniec stupnice ho meria naraz cez celú trasu, čiže udáva jej prevýšenie na celej jej dĺžke — pri rovnej meracej línii je to uhol, pod akým je jeden koniec vidieť z druhého.',
  },

  errorCatcher: {
    html: (ticketId) => `${getErrorMarkup(ticketId)}
      <p>
        Akcie:
      </p>
      <ul>
        <li><a href="">znovu načítať poslednú stránku</a></li>
        <li><a href="/">znovu načítať úvodnú stránku</a></li>
        <li><a href="/#reset-local-storage">zmazať lokálne dáta a znovunačítať úvodnú stránku</a></li>
      </ul>
    `,
  },

  mapCtxMenu: {
    centerMap: 'Vycentrovať sem mapu',
    measurePosition: 'Zistiť súradnice a výšku bodu',
    addPoint: 'Pridať sem bod',
    startLine: 'Začať tu kresliť čiaru, merať dĺžku',
    queryFeatures: 'Zistiť detaily v okolí',
    startRoute: 'Plánovať odtiaľ trasu',
    finishRoute: 'Plánovať sem trasu',
    showPhotos: 'Ukázať fotky v okolí',
  },

  errorStatus: {
    100: 'Pokračuj',
    101: 'Prepínanie Protokolov',
    102: 'Spracováva sa',
    103: 'Predbežné hlavičky',
    200: 'OK',
    201: 'Vytvorené',
    202: 'Prijaté',
    203: 'Neautorizované informácie',
    204: 'Žiadny obsah',
    205: 'Resetovať obsah',
    206: 'Čiastočný obsah',
    207: 'Multi-Status',
    208: 'Už oznámené',
    226: 'IM použité',
    300: 'Viacero možností',
    301: 'Trvalo presunuté',
    302: 'Nájdené',
    303: 'Pozri iné',
    304: 'Nezmenené',
    305: 'Použi Proxy',
    306: 'Zmeniť Proxy',
    307: 'Dočasné presmerovanie',
    308: 'Trvalé presmerovanie',
    400: 'Zlá požiadavka',
    401: 'Neautorizovaný',
    402: 'Platba vyžadovaná',
    403: 'Zakázané',
    404: 'Nenájdené',
    405: 'Metóda nie je povolená',
    406: 'Neprijateľné',
    407: 'Vyžaduje sa autentifikácia proxy',
    408: 'Čas požiadavky vypršal',
    409: 'Konflikt',
    410: 'Preč',
    411: 'Vyžaduje sa dĺžka',
    412: 'Predpoklad zlyhal',
    413: 'Príliš veľké bremeno',
    414: 'URI príliš dlhé',
    415: 'Médium nie je podporované',
    416: 'Rozsah nemožno splniť',
    417: 'Očakávania zlyhali',
    418: 'Som čajník',
    421: 'Nesprávne nasmerovaná požiadavka',
    422: 'Nespracovateľná entita',
    423: 'Zamknuté',
    424: 'Závislosť zlyhala',
    425: 'Príliš skoro',
    426: 'Vyžaduje sa upgrade',
    428: 'Vyžaduje sa predpoklad',
    429: 'Príliš veľa požiadaviek',
    431: 'Hlavičky požiadavky sú príliš veľké',
    451: 'Nedostupné z právnych dôvodov',
    500: 'Interná chyba servera',
    501: 'Nie je implementované',
    502: 'Zlá brána',
    503: 'Služba nedostupná',
    504: 'Čas brány vypršal',
    505: 'Verzia HTTP nie je podporovaná',
    506: 'Variant taktiež vyjednáva',
    507: 'Nedostatočné úložisko',
    508: 'Zistená slučka',
    510: 'Nerozšírené',
    511: 'Vyžaduje sa sieťové overenie',
  },
  gpu: {
    lost: 'GPU zariadenie bolo stratené: ',
    noAdapter: 'V tomto prehliadači nie je dostupný WebGPU adaptér.',
    notSupported: 'WebGPU nie je v tomto prehliadači podporovaný.',
    errorRequestingDevice: 'Nepodarilo sa vytvoriť GPU zariadenie: ',
    other: 'Chyba pri vykresľovaní: ',
  },
};

export default messages;
