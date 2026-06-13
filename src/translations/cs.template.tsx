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
import shared from './cs-shared.js';
import { addError, Messages } from './messagesInterface.js';

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

  ad: {
    self: (email) => (
      <>
        Máte zájem o vlastní reklamu na tomto místě? Neváhejte nás kontaktovat
        na {email}.
      </>
    ),
    rovas: () => (
      <RovasAd rovasDesc="ekonomický software pro dobrovolníky">
        <b>Freemap vytvářejí dobrovolníci.</b>{' '}
        <span className="text-danger">Odměňte je za jejich práci</span>, svou
        vlastní dobrovolnickou prací nebo penězi.
      </RovasAd>
    ),
  },

  measurement: {
    distance: 'Čára',
    elevation: 'Bod',
    area: 'Polygon',
    elevationFetchError: ({ err }) =>
      addError(messages, 'Nastala chyba při získávání výšky bodu', err),
    elevationInfo: (params) => (
      <ElevationInfo
        {...params}
        lang="cs"
        tileMessage="Dlaždice"
        maslMessage="Nadmořská výška"
      />
    ),
    areaInfo: (props) => (
      <AreaInfo {...props} areaLabel="Plocha" perimeterLabel="Obvod" />
    ),
    distanceInfo: (props) => <DistanceInfo {...props} lengthLabel="Délka" />,
  },

  drawing: {
    modify: 'Vlastnosti',
    edit: {
      title: 'Vlastnosti',
      color: 'Barva',
      fillColor: 'Barva výplně',
      label: 'Popis',
      width: 'Šířka',
      hint: 'Pokud chcete popis odstránit, nechte pole popisu prázdné.',
      shape: 'Tvar',
      icon: 'Ikona',
      iconChoose: 'Vybrat ikonu…',
      iconNone: 'Bez ikony',
      iconSearch: 'Hledat ikony',
      text: 'Text',
      textHint: 'Ikona nebo nejvýše 2 znaky zobrazené ve značce.',
      type: 'Typ geometrie',
      dashArray: 'Styl čárkování',
      lineCap: 'Konec čáry',
      lineCapRound: 'Kulatý',
      lineCapButt: 'Rovný',
      lineCapSquare: 'Čtvercový',
      lineJoin: 'Spoj čar',
      lineJoinRound: 'Kulatý',
      lineJoinMiter: 'Ostrý',
      lineJoinBevel: 'Zkosený',
    },
    continue: 'Pokračovat',
    join: 'Spojit',
    split: 'Rozdělit',
    stopDrawing: 'Ukončit kreslení',
    selectPointToJoin: 'Zvolte bod pro spojení čar',
    defProps: {
      menuItem: 'Nastavit styl',
      title: 'Nastavení stylu kreslení',
      applyToAll: 'Uložit a aplikovat na všechno',
    },
    projection: {
      projectPoint: 'Zaměřit bod',
      distance: 'Vzdálenost',
      azimuth: 'Azimut',
    },
    reverse: 'Obrátit směr',
    simplify: 'Zjednodušit',
  },

  purchases: {
    purchases: 'Nákupy',
    premiumExpired: (at) => <>Váš prémiový přístup vypršel {at}</>,
    date: 'Datum',
    item: 'Položka',
    notPremiumYet: 'Ještě nemáte prémiový přístup.',
    awaitingBankPayment:
      'Čekáme na potvrzení bankovního převodu. Prémiový přístup bude aktivovaný po přijetí platby.',
    bankPaymentFailed:
      'Některé bankovní převody byly zamítnuty nebo vypršely. Pokud si myslíte, že jde o omyl, kontaktujte prosím podporu.',
    bankIntentStatus: {
      pending_settlement: 'Bankovní převod je vytvořen a čeká na vypořádání.',
      manual_review:
        'Bankovní převod vyžaduje ruční kontrolu (např. nesoulad částky).',
      paid: 'Bankovní převod byl potvrzen jako zaplacený.',
      expired: 'Bankovní převod vypršel před potvrzením.',
      failed: 'Bankovní převod selhal.',
      rejected: 'Bankovní převod byl zamítnut.',
      created: 'Platební záměr byl vytvořen a ještě není vypořádán.',
      unknown: 'Poskytovatel nahlásil stav bankovního převodu: {}.',
    },
    noPurchases: 'Žádné nákupy',
    premium: 'Premium',
    credits: (amount) => <>Kredity ({amount})</>,
  },

  settings: {
    map: {
      homeLocation: {
        label: 'Domovská poloha:',
        select: 'Vybrat na mapě',
        undefined: 'neurčená',
      },
    },
    account: {
      name: 'Jméno',
      email: 'E-Mail',
      sendGalleryEmails: 'Upozornit emailem na komentáře k fotkám',
      delete: 'Smazat účet',
      deleteWarning:
        'Opravdu si přejete smazat svůj účet? Spolu s ním se odstraní všechny vaše fotografie, komentáře a hodnocení fotografií, vlastní mapy a sledovaná zařízení.',
      personalInfo: 'Osobní údaje',
      authProviders: 'Poskytovatelé přihlášení',
      picture: 'Profilový obrázek',
      choosePicture: 'Vybrat obrázek',
      pictureTooLarge: 'Obrázek je příliš velký. Maximální velikost je 5 MB.',
      description: 'O mně',
    },
    layer: 'Mapa',
    overlayOpacity: 'Viditelnost',
    showInMenu: 'Zobrazit v menu',
    showInToolbar: 'Zobrazit v liště',
    saveSuccess: 'Změny byly uloženy.',
    savingError: ({ err }) =>
      addError(messages, 'Nastala chyba při ukládání nastavení', err),
    customLayersDef: 'Definice vlastních mapových vrstev',
    customLayersDefError: 'Chybný formát definice vlasových mapových vrstev.',
  },

  mapDetails: {
    notFound: 'Nic se zde nenašlo.',
    fetchingError: ({ err }) =>
      addError(messages, 'Nastala chyba při získávání detailů', err),
    detail: ({ result }) => (
      <ObjectDetails
        result={result}
        openText="Otevřít na OpenStreetMap.org"
        historyText="historie"
        editInJosmText="Editovat v JOSM"
      />
    ),
    sources: 'Zdroje',
    source: 'Zdroj',
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

  documents: {
    errorLoading: 'Dokument se nepodařilo načíst.',
  },

  mapLayers: {
    showAll: 'Zobrazit všechny mapy',
    filterMaps: 'Filtrovat mapy',
    noMapsFound: 'Žádné mapy nenalezeny',
    settings: 'Nastavení map',
    layers: 'Mapy',
    switch: 'Mapy',
    photoFilterWarning: 'Filtr fotografií je aktivní',
    interactiveLayerWarning: 'Datová vrstva je skryta',
    minZoomWarning: (minZoom) => `Dostupné až od přiblížení ${minZoom}`,
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
      s0: 'Strava (Vše)',
      s1: 'Strava (Cyklojízdy)',
      s2: 'Strava (Běh)',
      s3: 'Strava (Vodní aktivity)',
      s4: 'Strava (Zimní aktivity)',
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
    stravaHeatmapColor: 'Barva Strava heatmapy',
    stravaHeatmapColors: {
      hot: 'Horká',
      blue: 'Modrá',
      purple: 'Fialová',
      gray: 'Šedá',
      bluered: 'Modro-červená',
    },
    layer: {
      layer: 'Vrstva',
      base: 'Základní',
      overlay: 'Překryvná',
    },
    showMore: 'Ukázat více map',
    countryWarning: (countries) =>
      `Pokrývá pouze tyto země: ${countries.join(', ')}`,
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
  osm: {
    fetchingError: ({ err }) =>
      addError(messages, 'Nastala chyba při získávání OSM dat', err),
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

  premium: {
    title: 'Získat prémiový přístup',
    commonHeader: (
      <>
        <p>
          <strong>Podpořte dobrovolníky, kteří vytvářejí tuto mapu!</strong>
        </p>
        <p className="mb-1">
          Za <b>8 hodin</b> vaší{' '}
          <a
            href="https://rovas.app/freemap-web"
            target="_blank"
            rel="noopener noreferrer"
          >
            dobrovolnické práce
          </a>{' '}
          nebo <b>8 €</b> získáte na rok:
        </p>
        <ul>
          <li>odstranění reklamního baneru</li>
          <li
            className="text-decoration-underline"
            title="podrobné stínování Slovenska a Česka ve vysokém rozlišení, nejvyšší úrovně přiblížení Outdoor mapy, nejvyšší úrovně přiblížení ortofotomap Slovenska a Česka, různé mapy založené na WMS"
          >
            prémiovým mapovým vrstvám
          </li>
          <li>prémiovým fotkám</li>
          <li>multimodální vyhledávání trasy</li>
        </ul>
      </>
    ),
    stepsForAnonymous: (
      <>
        <div className="fw-bold">Postup</div>
        <div className="mb-3">
          <p className="mb-1 ms-3">
            <span className="fw-semibold">Krok 1</span> - vytvořte si účet zde
            ve Freemapu (níže)
          </p>
          <p className="mb-1 ms-3">
            <span className="fw-semibold">Krok 2</span> - v aplikaci Rováš, kam
            vás nasměrujeme po registraci, nám pošlete platbu.
          </p>
        </div>
      </>
    ),
    continue: 'Pokračovat',
    success: 'Gratulujeme, získali jste prémiový přístup!',
    becomePremium: 'Získat prémiový přístup',
    youArePremium: (date) => (
      <>
        Máte prémiový přístup do <b>{date}</b>.
      </>
    ),
    premiumOnly: 'Dostupné pouze s prémiovým přístupem.',
    alreadyPremium: 'Máte již prémiový přístup.',
    premiumUser: 'Uživatel s prémiovým přístupem',
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
