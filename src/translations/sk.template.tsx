import { AreaInfo } from '@app/components/AreaInfo.js';
import { DistanceInfo } from '@app/components/DistanceInfo.js';
import { MaptilerAttribution } from '@app/components/MaptilerAttribution.js';
import { ChangesetDetails } from '@features/changesets/components/ChangesetDetails.js';
import { CookieConsent } from '@features/cookieConsent/components/CookieConsent.js';
import { CreditsText } from '@features/credits/components/CreditsText.js';
import { ElevationInfo } from '@features/elevationChart/components/ElevationInfo.js';
import { ObjectDetails } from '@features/objects/components/ObjectDetails.js';
import { TrackViewerDetails } from '@features/trackViewer/components/TrackViewerDetails.js';
import { Attribution } from '@shared/components/Attribution.js';
import { Emoji } from '@shared/components/Emoji.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { AlertLink } from 'react-bootstrap';
import { CookiesConsentText } from '@/features/auth/components/CookiesConsentText.js';
import { addError, Messages } from './messagesInterface.js';
import shared from './sk-shared.js';

const nf00 = new Intl.NumberFormat('sk', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

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
  changesets: {
    detail: ({ changeset }) => <ChangesetDetails changeset={changeset} />,
  },
  general: {
    iso: 'sk_SK',
    elevationProfile: 'Výškový profil',
    save: 'Uložiť',
    cancel: 'Zrušiť',
    modify: 'Upraviť',
    delete: 'Zmazať',
    remove: 'Odstrániť',
    close: 'Zavrieť',
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
    back: 'Späť',
    internalError: ({ ticketId }) => `!HTML!${getErrorMarkup(ticketId)}`,
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
    copyOk: 'Skopírované do schránky.',
    noCookies: () => (
      <>
        Táto funkcionalita vyžaduje prijatie{' '}
        <CookiesConsentText>súhlasu cookies</CookiesConsentText>.
      </>
    ),
    name: 'Názov',
    load: 'Načítať',
    unnamed: 'Bez názvu',
    enablePopup:
      'Prosím, povoľte vo vašom prehliadači vyskakovacie (pop-up) okná pre túto stránku.',
    componentLoadingError:
      'Komponent sa nepodarilo načítať. Skontrolujte svoje pripojenie k internetu.',
    offline: 'Nie ste pripojený k internetu.',
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
    trackViewer: 'Import súboru',
    changesets: 'Zmeny v mape',
    mapDetails: 'Detaily v mape',
    tracking: 'Sledovanie',
    myMaps: 'Moje mapy',
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
  },
  main: {
    title: shared.title,
    description: shared.description,
    clearMap: 'Vyčistiť mapu',
    close: 'Zavrieť',
    closeTool: 'Zavrieť nástroj',
    locateMe: 'Kde som?',
    locationError: 'Nepodarilo sa získať pozíciu.',
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
      ua: () => {
        return (
          <>
            <Emoji>🇺🇦</Emoji>&ensp;
            <AlertLink
              href="https://donio.sk/spolocne-pre-ukrajinu"
              target="_blank"
              rel="noopener"
            >
              Spoločne pre Ukrajinu ›
            </AlertLink>
            &ensp;
            <Emoji>🇺🇦</Emoji>
          </>
        );
      },
    },
  },

  ad: {
    self: (email) => (
      <>
        Máš záujem o vlastnú reklamu na tomto mieste? Neváhaj nás kontaktovať na{' '}
        {email}.
      </>
    ),
  },

  measurement: {
    distance: 'Čiara',
    elevation: 'Bod',
    area: 'Polygón',
    elevationFetchError: ({ err }) =>
      addError(messages, 'Nastala chyba pri získavaní výšky bodu', err),
    elevationInfo: (params) => (
      <ElevationInfo
        {...params}
        lang="sk"
        tileMessage="Dlaždica"
        maslMessage="Nadmorská výška"
      />
    ),
    areaInfo: (props) => (
      <AreaInfo {...props} areaLabel="Plocha" perimeterLabel="Obvod" />
    ),
    distanceInfo: (props) => <DistanceInfo {...props} lengthLabel="Dĺžka" />,
  },

  trackViewer: {
    info: () => <TrackViewerDetails />,
  },

  drawing: {
    modify: 'Vlastnosti',
    edit: {
      title: 'Vlastnosti',
      color: 'Farba',
      fillColor: 'Farba výplne',
      label: 'Popis',
      width: 'Šírka',
      hint: 'Ak chcete popis odstrániť, nechajte pole popisu prázdne.',
      shape: 'Tvar',
      icon: 'Ikona',
      iconChoose: 'Vybrať ikonu…',
      iconNone: 'Bez ikony',
      iconSearch: 'Hľadať ikony',
      text: 'Text',
      textHint: 'Ikona alebo najviac 2 znaky zobrazené v značke.',
      type: 'Typ geometrie',
      dashArray: 'Štýl prerušovania',
      lineCap: 'Koniec čiary',
      lineCapRound: 'Okrúhly',
      lineCapButt: 'Rovný',
      lineCapSquare: 'Štvorcový',
      lineJoin: 'Spoj čiar',
      lineJoinRound: 'Okrúhly',
      lineJoinMiter: 'Ostrý',
      lineJoinBevel: 'Skosený',
    },
    continue: 'Pokračovať',
    join: 'Spojiť',
    split: 'Rozdeliť',
    stopDrawing: 'Ukončiť kreslenie',
    selectPointToJoin: 'Zvoľte bod pre spojenie čiar',
    defProps: {
      menuItem: 'Nastaviť štýl',
      title: 'Nastavenie štýlu kreslenia',
      applyToAll: 'Uložiť a aplikovať na všetko',
    },
    projection: {
      projectPoint: 'Zamerať bod',
      distance: 'Vzdialenosť',
      azimuth: 'Azimut',
    },
    reverse: 'Obrátiť smer',
    simplify: 'Zjednodušiť',
  },

  purchases: {
    purchases: 'Nákupy',
    premiumExpired: (at) => <>Váš prémiový prístup vypršal {at}</>,
    date: 'Dátum',
    item: 'Položka',
    notPremiumYet: 'Ešte nemáte prémiový prístup.',
    awaitingBankPayment:
      'Čakáme na potvrdenie bankového prevodu. Prémiový prístup bude aktivovaný po prijatí platby.',
    bankPaymentFailed:
      'Niektoré bankové prevody boli zamietnuté alebo vypršali. Ak si myslíte, že ide o omyl, kontaktujte podporu.',
    bankIntentStatus: {
      pending_settlement:
        'Bankový prevod je vytvorený a čaká na vysporiadanie.',
      manual_review:
        'Bankový prevod vyžaduje manuálne overenie (napr. nesúlad sumy).',
      paid: 'Bankový prevod bol potvrdený ako zaplatený.',
      expired: 'Bankový prevod vypršal pred potvrdením.',
      failed: 'Bankový prevod zlyhal.',
      rejected: 'Bankový prevod bol zamietnutý.',
      created: 'Platobný zámer bol vytvorený a ešte nie je vysporiadaný.',
      unknown: 'Poskytovateľ nahlásil stav bankového prevodu: {}.',
    },
    noPurchases: 'Žiadne nákupy',
    premium: 'Prémium',
    credits: (amount) => <>Kredity ({amount})</>,
  },

  settings: {
    map: {
      homeLocation: {
        label: 'Domovská poloha:',
        select: 'Vybrať na mape',
        undefined: 'neurčená',
      },
    },
    account: {
      name: 'Meno',
      email: 'E-Mail',
      description: 'O mne',
      sendGalleryEmails: 'Upozorniť emailom na komentáre k fotkám',
      delete: 'Zmazať účet',
      deleteWarning:
        'Naozaj si prajete zmazať svoj účet? Spolu s ním sa odstránia všetky vaše fotografie, komentáre a hodnotenia fotografií, vlastné mapy a sledované zariadenia.',
      personalInfo: 'Osobné údaje',
      authProviders: 'Poskytovatelia prihlásenia',
      picture: 'Profilový obrázok',
      choosePicture: 'Vybrať obrázok',
      pictureTooLarge: 'Obrázok je príliš veľký. Maximálna veľkosť je 5 MB.',
    },
    general: {
      tips: 'Zobrazovať tipy po otvorení stránky',
    },
    layer: 'Mapa',
    overlayOpacity: 'Viditeľnosť',
    showInMenu: 'Zobraziť v menu',
    showInToolbar: 'Zobraziť v lište',
    saveSuccess: 'Zmeny boli uložené.',
    savingError: ({ err }) =>
      addError(messages, 'Nastala chyba pri ukladaní nastavení', err),
    customLayersDef: 'Definícia vlastných mapových vrstiev',
    customLayersDefError: 'Chybný formát definície vlasyných mapových vrstiev.',
  },

  mapDetails: {
    sources: 'Zdroje',
    source: 'Zdroj',
    notFound: 'Nič sa tu nenašlo.',
    fetchingError: ({ err }) =>
      addError(messages, 'Nastala chyba pri získavaní detailov', err),
    detail: ({ result }) => (
      <ObjectDetails
        result={result}
        openText="Otvoriť na OpenStreetMap.org"
        historyText="história"
        editInJosmText="Editovať v JOSM"
      />
    ),
  },

  external: {
    openInExternal: 'Zdieľať / otvoriť v ext. aplikácii',
    osm: 'OpenStreetMap',
    oma: 'OMA',
    googleMaps: 'Google Mapy',
    hiking_sk: 'Hiking.sk',
    zbgis: 'ZBGIS',
    mapy_cz: 'Mapy.com',
    josm: 'Editor JOSM',
    id: 'Editor iD',
    window: 'Nové okno',
    url: 'Zdieľať polohu',
    image: 'Zdieľať fotografiu',
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

  documents: {
    errorLoading: 'Dokument sa nepodarilo načítať.',
  },

  auth: {
    connect: {
      label: 'Pripojiť',
      success: 'Pripojené',
    },
    disconnect: {
      label: 'Odpojiť',
      success: 'Odpojené',
    },
    logIn: {
      with: 'Vyberte poskytovateľa prihlásenia',
      success: 'Boli ste úspešne prihlásený.',
      logInError: ({ err }) =>
        addError(messages, 'Nepodarilo sa prihlásiť', err),
      logInError2: 'Nepodarilo sa prihlásiť.',
      verifyError: ({ err }) =>
        addError(messages, 'Nepodarilo sa overiť prihlásenie', err),
    },
    logOut: {
      success: 'Boli ste úspešne odhlásený.',
      error: ({ err }) => addError(messages, 'Nepodarilo sa odhlásiť', err),
    },
  },

  mapLayers: {
    showMore: 'Ukázať viac máp',
    showAll: 'Ukázať všetky mapy',
    filterMaps: 'Filtrovať mapy',
    noMapsFound: 'Žiadne mapy nenájdené',
    settings: 'Nastavenia máp',
    layers: 'Mapy',
    switch: 'Mapy',
    photoFilterWarning: 'Filter fotografií je aktívny',
    interactiveLayerWarning: 'Dátová vrstva je skrytá',
    minZoomWarning: (minZoom) => `Dostupné až od priblíženia ${minZoom}`,
    countryWarning: (countries) =>
      `Pokrýva len tieto krajiny: ${countries.join(', ')}`,
    letters: {
      S: 'Letecká',
      Z: 'Letecká',
      J1: 'Letecká (2017-2019)',
      J2: 'Letecká (2020-2022)',
      O: 'OpenStreetMap',
      d: 'Verejná doprava (ÖPNV)',
      X: outdoorMap,
      i: 'Dátová vrstva',
      I: 'Fotografie',
      l1: 'Lesné cesty NLC (2017)',
      l2: 'Lesné cesty NLC',
      s0: 'Strava (Všetko)',
      s1: 'Strava (Cyklojazdy)',
      s2: 'Strava (Beh)',
      s3: 'Strava (Vodné aktivity)',
      s4: 'Strava (Zimné aktivity)',
      w: 'Wikipedia',
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
    },
    attr: {
      osmData: '©\xa0prispievatelia OpenStreetMap',
      maptiler: (
        <MaptilerAttribution
          tilesFrom="Vektorové dlaždice z"
          hostedBy="hostované na"
        />
      ),
    },
    configureLayers: 'Nastavenie mapových vrstiev',
    customMaps: 'Vlastné mapy',
    addCustomMap: 'Pridať vlastnú mapu',
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
    zIndex: 'Z-Index',
    preferences: 'Predvoľby',
    maxZoom: 'Maximálne priblíženie',
    forcedScale: 'Vynútené rozlíšenie',
    resolutionScale: 'Škála rozlíšenia',
    resolutionScaleAuto: 'Automaticky (podľa zariadenia)',
    resolutionScaleHelp:
      'Simuluje hustotu pixelov displeja. Ovplyvňuje, ktorý variant dlaždíc sa načíta. Ak vrstva neponúka požadovaný variant, použije sa najvyšší dostupný.',
    featureScale: 'Veľkosť prvkov',
    featureScaleHelp:
      'Zväčšuje vykreslené popisy a čiary. Nemá vplyv na satelitné, tieňované, WMS ani vektorové (MapLibre) vrstvy.',
    stravaHeatmapColor: 'Farba Strava heatmapy',
    stravaHeatmapColors: {
      hot: 'Horúca',
      blue: 'Modrá',
      purple: 'Fialová',
      gray: 'Sivá',
      bluered: 'Modro-červená',
    },
    layer: {
      layer: 'Vrstva',
      base: 'Základná',
      overlay: 'Prekryvná',
    },
    loadWmsLayers: 'Načítať vrstvy',
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

  osm: {
    fetchingError: ({ err }) =>
      addError(messages, 'Nastala chyba pri získavaní OSM dát', err),
  },

  tracking: {
    subscribeNotFound: ({ id }) => (
      <>
        Token sledovania <i>{id}</i> neexistuje.
      </>
    ),
    subscribeError: ({ id }) => (
      <>
        Chyba sledovania pomocou sledovacieho tokenu <i>{id}</i>.
      </>
    ),
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

  premium: {
    title: 'Získať prémiový prístup',
    commonHeader: (
      <>
        <p>
          <strong>Freemap Premium</strong> je voliteľné ročné predplatné, ktoré
          rozširuje aplikáciu.
        </p>
        <p className="mb-1">
          Za <b>8 €</b> ročne získate:
        </p>
        <ul>
          <li>odstránenie reklamného baneru</li>
          <li
            className="text-decoration-underline"
            title="Strava Heatmap, hi-res detailed shading of Slovakia and Czechia, highest zoom levels of Outdoor Map, highest zoom levels of ortophoto maps of Slovakia and Czechia, various WMS-based maps"
          >
            prémiové mapové vrstvy
          </li>
          <li>prémiové fotky</li>
          <li>multimodálne plánovanie trasy</li>
        </ul>
        <p className="mb-0">Freemap zostáva bezplatný a otvorený.</p>
      </>
    ),
    stepsForAnonymous: (
      <>
        <div className="fw-bold">Ako to funguje</div>
        <div className="mb-3">
          <p className="mb-1 ms-3">
            <span className="fw-semibold">Krok 1</span> - prihláste sa alebo si
            vytvorte bezplatný účet vo Freemape (nižšie).
          </p>
          <p className="mb-1 ms-3">
            <span className="fw-semibold">Krok 2</span> - budete presmerovaní na
            dokončenie platby.
          </p>
        </div>
      </>
    ),
    continue: 'Pokračovať',
    success: 'Gratulujeme, získali ste prémiový prístup!',
    becomePremium: 'Získať prémiový prístup',
    youArePremium: (date) => (
      <>
        Máte prémiový prístup do <b>{date}</b>.
      </>
    ),
    premiumOnly: 'Dostupné len s prémiovým prístupom.',
    alreadyPremium: 'Už máte prémiový prístup.',
    premiumUser: 'Používateľ s prémiovým prístupom',
  },

  credits: {
    buyCredits: 'Kúpiť kredity',
    amount: 'Kredity',
    credits: 'kreditov',
    buy: 'Kúpiť',
    purchase: {
      success: ({ amount }) => (
        <>Váš kredit bol navýšený o {nf00.format(amount)}.</>
      ),
    },
    youHaveCredits: (amount, explainCredits) => (
      <>
        Máte {amount}{' '}
        {explainCredits ? (
          <CreditsText
            credits="kreditov"
            help="Kredity môžete využiť na [export offline máp]."
          />
        ) : (
          'kreditov'
        )}
        .
      </>
    ),
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
