import { MaptilerAttribution } from '@app/components/MaptilerAttribution.js';
import { CookieConsent } from '@features/cookieConsent/components/CookieConsent.js';
import { Attribution } from '@shared/components/Attribution.js';
import { Emoji } from '@shared/components/Emoji.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { AlertLink } from 'react-bootstrap';
import { CookiesConsentText } from '@/features/auth/components/CookiesConsentText.js';
import { addError, type Messages } from './messagesInterface.js';
import shared from './sl-shared.js';

const masl = 'm\xa0n.\xa0v.';

const getErrorMarkup = (ticketId?: string) => `<h1>Napaka aplikacije</h1>
<p>
  ${
    ticketId
      ? `Napaka nam je bila samodejno prijavljena pod ID <b>${ticketId}</b>.`
      : ''
  }
  Napako lahko prijavite ${
    ticketId ? 'tudi ' : ''
  }na <a href="https://github.com/FreemapSlovakia/freemap-v3-react/issues/new" target="_blank" rel="noopener noreferrer">GitHubu</a>,
  lahko pa nam podrobnosti pošljete na <a href="mailto:freemap@freemap.sk?subject=Nahlásenie%20chyby%20na%20www.freemap.sk">freemap@freemap.sk</a>.
</p>
<p>
  Hvala.
</p>`;

const outdoorMap = 'Pohodništvo, Kolesarjenje, Smučanje, Jahanje';

const messages: DeepPartialWithRequiredObjects<Messages> = {
  general: {
    iso: 'sl_SI',
    elevationProfile: 'Višinski profil',
    save: 'Shrani',
    cancel: 'Prekliči',
    modify: 'Uredi',
    delete: 'Izbriši',
    remove: 'Odstrani',
    close: 'Zapri',
    collapse: 'Strni',
    expand: 'Razširi',
    apply: 'Uporabi',
    exitFullscreen: 'Izhod iz celozaslonskega načina',
    fullscreen: 'Celozaslonski način',
    yes: 'Da',
    no: 'Ne',
    masl,
    copyCode: 'Kopiraj kodo',
    loading: 'Nalaganje…',
    ok: 'V redu',
    preventShowingAgain: 'Ne prikaži več',
    closeWithoutSaving: 'Zaprem okno brez shranjevanja sprememb?',
    resetToDefaults: 'Ponastavi na privzeto',
    back: 'Nazaj',
    internalError: ({ ticketId }) => (
      <span dangerouslySetInnerHTML={{ __html: getErrorMarkup(ticketId) }} />
    ),
    processorError: ({ err }) => addError(messages, 'Napaka aplikacije', err),
    seconds: 'sekunde',
    minutes: 'minute',
    meters: 'metri',
    createdAt: 'Ustvarjeno',
    modifiedAt: 'Spremenjeno',
    actions: 'Dejanja',
    add: 'Dodaj novo',
    clear: 'Počisti',
    convertToDrawing: 'Pretvori v risbo',
    simplifyPrompt:
      'Vnesite faktor poenostavitve. Za brez poenostavitve vnesite nič.',
    copyUrl: 'Kopiraj URL',
    copyPageUrl: 'Kopiraj URL strani',
    savingError: ({ err }) =>
      addError(messages, 'Napaka pri shranjevanju', err),
    loadError: ({ err }) => addError(messages, 'Napaka pri nalaganju', err),
    deleteError: ({ err }) => addError(messages, 'Napaka pri brisanju', err),
    operationError: ({ err }) =>
      addError(messages, 'Napaka pri operaciji', err),
    deleted: 'Izbrisano.',
    saved: 'Shranjeno.',
    visual: 'Prikaz',
    drawingTool: 'Orodje za risanje',
    copyOk: 'Kopirano v odložišče.',
    noCookies: () => (
      <>
        Ta funkcionalnost zahteva sprejem{' '}
        <CookiesConsentText>soglasja za piškotke</CookiesConsentText>.
      </>
    ),
    name: 'Ime',
    load: 'Naloži',
    unnamed: 'Brez imena',
    enablePopup:
      'V brskalniku omogočite pojavna (pop-up) okna za to spletno mesto.',
    broadcastChannelUnsupported:
      'To dejanje v vašem brskalniku ni podprto (BroadcastChannel ni na voljo, npr. v zasebnem načinu ali v brskalniku, vgrajenem v aplikacijo). Uporabite standardno okno v sodobnem brskalniku.',
    componentLoadingError:
      'Komponente ni bilo mogoče naložiti. Preverite svojo internetno povezavo.',
    offline: 'Niste povezani z internetom.',
    connectionError: 'Napaka pri povezovanju s strežnikom.',
    experimentalFunction: 'Poskusna funkcija',
    attribution: () => <Attribution unknown="Licenca zemljevida ni določena" />,
    unauthenticatedError: 'Za dostop do te funkcije se najprej prijavite.',
    confirmation: 'Potrditev',
    export: 'Izvozi',
    success: 'Opravljeno!',
    expiration: 'Potek veljavnosti',
    privacyPolicy: 'Pravilnik o zasebnosti',
    termsOfService: 'Pogoji uporabe',
    refundPolicy: 'Pravilnik o vračilu denarja',
    infoAndLegal: 'Informacije o zemljevidu in pravni pogoji',
    newOptionText: 'Dodaj %value%',
    deleteButtonText: 'Odstrani %value% s seznama',
    accept: 'Sprejmi',
  },

  generic: {
    color: 'Barva',
    size: 'Velikost',
    weight: 'Debelina',
    width: 'Širina',
  },

  theme: {
    light: 'Svetli način',
    dark: 'Temni način',
    auto: 'Samodejni način',
  },

  selections: {
    objects: 'Objekt (POI)',
    drawPoints: 'Točka',
    drawLines: 'Črta',
    drawPolygons: 'Poligon',
    tracking: 'Sledenje',
    linePoint: 'Točka črte',
    polygonPoint: 'Točka poligona',
  },

  tools: {
    none: 'Zapri orodje',
    routePlanner: 'Iskalnik poti',
    objects: 'Objekti (POI)',
    photos: 'Fotografije',
    measurement: 'Risanje in merjenje',
    drawPoints: 'Risanje točk',
    drawLines: 'Risanje črt',
    drawPolygons: 'Risanje poligonov',
    trackViewer: 'Uvoz datoteke',
    changesets: 'Spremembe v zemljevidu',
    mapDetails: 'Podrobnosti zemljevida',
    tracking: 'Sledenje v živo',
    myMaps: 'Moji zemljevidi',
    myMap: 'Moj zemljevid',
  },

  mainMenu: {
    title: 'Glavni meni',
    logOut: 'Odjava',
    logIn: 'Prijava',
    account: 'Račun',
    mapFeaturesExport: 'Izvoz podatkov zemljevida',
    gpsDevicesMapExports: 'Zemljevidi za naprave GPS',
    embedMap: 'Vgradi zemljevid',
    offlineMapExport: 'Izvoz zemljevidov brez povezave',
    supportUs: 'Podprite Freemap',
    help: 'Informacije in pomoč',
    back: 'Nazaj',
    mapLegend: 'Legenda zemljevida',
    contacts: 'Kontakti',
    facebook: 'Freemap na Facebooku',
    twitter: 'Freemap na Twitterju',
    youtube: 'Freemap na YouTube',
    github: 'Freemap na GitHubu',
    mastodon: 'Freemap na Mastodonu',
    googlePlay: 'Freemap na Google Play',
    appStore: 'Freemap na App Store',
    automaticLanguage: 'Samodejno',
    mapToDocumentExport: 'Izvoz zemljevida v sliko/dokument',
    osmWiki: 'Dokumentacija OpenStreetMap',
    wikiLink: 'https://wiki.openstreetmap.org/wiki/Main_Page',
    status: 'Stanje storitev',
  },

  main: {
    title: shared.title,
    description: shared.description,
    clearMap: 'Počisti elemente zemljevida',
    close: 'Zapri',
    closeTool: 'Zapri orodje',
    locateMe: 'Kje sem?',
    locationError: 'Napaka pri pridobivanju lokacije.',
    zoomIn: 'Približaj',
    zoomOut: 'Oddalji',
    devInfo: () => (
      <div>
        To je preizkusna različica Freemap Slovakia. Za produkcijsko različico
        obiščite <a href="https://www.freemap.sk/">www.freemap.sk</a>.
      </div>
    ),
    copyright: 'Licenca zemljevida',
    cookieConsent: () => (
      <CookieConsent
        prompt="Nekatere funkcije lahko zahtevajo piškotke."
        local="Piškotki lokalnih nastavitev in prijave prek družbenih omrežij"
        analytics="Analitični piškotki"
      />
    ),
    infoBars: {
      ua: () => (
        <>
          <Emoji>🇺🇦</Emoji> Stojimo ob Ukrajini.{' '}
          <AlertLink href="https://u24.gov.ua/" target="_blank" rel="noopener">
            Podprite Ukrajino ›
          </AlertLink>{' '}
          <Emoji>🇺🇦</Emoji>
        </>
      ),
    },
  },

  search: {
    inProgress: 'Iščem…',
    noResults: 'Ni najdenih rezultatov',
    prompt: 'Vnesite kraj',
    routeFrom: 'Pot od tukaj',
    routeTo: 'Pot do sem',
    fetchingError: ({ err }) => addError(messages, 'Napaka pri iskanju', err),
    buttonTitle: 'Išči',
    placeholder: 'Iskanje po zemljevidu',
    result: 'Zadetek',
    sources: {
      bbox: 'Omejevalni okvir',
      geojson: 'GeoJSON',
      tile: 'Ploščica',
      coords: 'Koordinate',
      'overpass-nearby': 'Bližnji objekti',
      'overpass-surrounding': 'Objekti, ki vsebujejo',
      'nominatim-forward': 'Geokodiranje',
      'nominatim-reverse': 'Obratno geokodiranje',
      osm: 'OpenStreetMap',
      'wms:': 'WMS',
    },
  },

  mapLayers: {
    showMore: 'Pokaži več zemljevidov',
    showAll: 'Pokaži vse zemljevide',
    filterMaps: 'Filtriraj zemljevide',
    noMapsFound: 'Ni najdenih zemljevidov',
    settings: 'Nastavitve zemljevidov',
    layers: 'Zemljevidi',
    switch: 'Zemljevidi',
    photoFilterWarning: 'Filter fotografij je aktiven',
    interactiveLayerWarning: 'Podatkovni sloj je skrit',
    minZoomWarning: (minZoom) => `Dostopno od povečave ${minZoom}`,
    outsideViewWarning: 'Trenutni pogled je zunaj tega zemljevida',
    letters: {
      S: 'Letalska',
      Z: 'Letalska',
      J1: 'Letalska (2017-2019)',
      J2: 'Letalska (2020-2022)',
      O: 'OpenStreetMap',
      d: 'Javni prevoz (ÖPNV)',
      X: outdoorMap,
      i: 'Podatkovni sloj',
      I: 'Fotografije',
      l1: 'Gozdne poti NLC (2017)',
      l2: 'Gozdne poti NLC',
      w: 'Wikipedia',
      M: 'Fotografije iz Wikimedia Commons',
      '5': 'Senčenje terena',
      '6': 'Senčenje površja',
      '7': 'Podrobno senčenje terena',
      '8': 'Podrobno senčenje terena',
      VO: 'OpenStreetMap vektorska',
      VS: 'Streets vektorska',
      VD: 'Dataviz vektorska',
      VT: 'Outdoor vektorska',
      h: 'Parametrično senčenje',
      z: 'Parametrično senčenje',
      y: 'Parametrično senčenje',
      WDZ: 'Sestava drevja',
      WLT: 'Gozdni tipi',
      WGE: 'Geološka',
      WKA: 'Kataster',
      wka: 'Kataster',
      WHC: 'Hidrokemična',
    },
    customBase: 'Zemljevid po meri',
    type: {
      map: 'zemljevid',
      data: 'podatki',
      photos: 'slike',
    },
    attr: {
      osmData: '©\xa0sodelavci OpenStreetMap',
      maptiler: (
        <MaptilerAttribution
          tilesFrom="Vektorske ploščice od"
          hostedBy="gostuje"
        />
      ),
    },
    configureLayers: 'Nastavitev slojev zemljevida',
    customMaps: 'Zemljevidi po meri',
    addCustomMap: 'Dodaj zemljevid po meri',
    activate: 'Aktiviraj',
    customMapsEmptyMessage:
      'Zaenkrat ni določenih zemljevidov po meri. Dodajte enega za prikaz lastnega vira zemljevida.',
    base: 'Osnovni sloji',
    overlay: 'Prekrivni sloji',
    technology: 'Tip',
    technologies: {
      tile: 'Slikovne ploščice (TMS, XYZ)',
      maplibre: 'Vektor (MapLibre)',
      wms: 'WMS',
      parametricShading: 'Parametrično senčenje',
    },
    url: 'URL',
    minZoom: 'Najmanjša povečava',
    maxNativeZoom: 'Največja naravna povečava',
    extraScales: 'Dodatne ločljivosti',
    scaleWithDpi: 'Prilagodi z DPI',
    layer: {
      layer: 'Sloj',
      base: 'Osnovni',
      overlay: 'Prekrivni',
    },
    zIndex: 'Z-Index',
    preferences: 'Nastavitve',
    maxZoom: 'Največja povečava',
    forcedScale: 'Vsiljena ločljivost',
    resolutionScale: 'Lestvica ločljivosti',
    resolutionScaleAuto: 'Samodejno (privzeto za napravo)',
    resolutionScaleHelp:
      'Simulira gostoto pikslov zaslona. Vpliva na to, kateri variant ploščic se naloži. Če sloj ne ponuja zahtevanega varianta, se uporabi najvišji razpoložljivi.',
    featureScale: 'Velikost elementov',
    featureScaleHelp:
      'Poveča izrisane oznake in črte. Ne vpliva na satelitske, senčene, WMS ali vektorske (MapLibre) sloje.',
    searchResultStyle: 'Slog rezultata iskanja',
    resetApp: 'Ponastavi aplikacijo',
    resetAppConfirm:
      'Ponastavim vse nastavitve aplikacije na privzete in znova naložim stran? Odjavljeni boste.',
    loadWmsLayers: 'Naloži sloje',
    offlineMaps: 'Zemljevidi brez povezave',
    legacy: 'zastarela',
    legacyMapWarning: ({ from, to }) => (
      <>
        Prikazani zemljevid <b>{messages.mapLayers.letters[from]}</b> je
        zastarel. Preklopim na sodobnega <b>{messages.mapLayers.letters[to]}</b>
        ?
      </>
    ),
  },

  elevationChart: {
    distance: 'Razdalja [km]',
    ele: `Nadm. višina [${masl}]`,
    fetchError: ({ err }) =>
      addError(
        messages,
        'Napaka pri pridobivanju podatkov višinskega profila',
        err,
      ),
  },

  errorCatcher: {
    html: (ticketId) => `${getErrorMarkup(ticketId)}
      <p>
        Poskusite lahko:
      </p>
      <ul>
        <li><a href="">znova naložite zadnjo stran</a></li>
        <li><a href="/">naložite začetno stran</a></li>
        <li><a href="/#reset-local-storage">počistite lokalne podatke in naložite začetno stran</a></li>
      </ul>
    `,
  },

  mapCtxMenu: {
    centerMap: 'Centriraj zemljevid sem',
    measurePosition: 'Poišči koordinate in nadmorsko višino',
    addPoint: 'Dodaj sem točko',
    startLine: 'Začni tukaj risati črto ali meriti',
    queryFeatures: 'Poizvedi po bližnjih objektih',
    startRoute: 'Načrtuj pot od tukaj',
    finishRoute: 'Načrtuj pot do sem',
    showPhotos: 'Pokaži bližnje fotografije',
  },

  errorStatus: {
    100: 'Nadaljuj',
    101: 'Preklapljanje protokolov',
    102: 'Obdelava',
    103: 'Zgodnji namigi',
    200: 'OK',
    201: 'Ustvarjeno',
    202: 'Sprejeto',
    203: 'Neavtoritativne informacije',
    204: 'Brez vsebine',
    205: 'Ponastavi vsebino',
    206: 'Delna vsebina',
    207: 'Več stanj',
    208: 'Že poročano',
    226: 'IM uporabljen',
    300: 'Več možnosti',
    301: 'Trajno premaknjeno',
    302: 'Najdeno',
    303: 'Glej drugo',
    304: 'Ni spremenjeno',
    305: 'Uporabi proxy',
    306: 'Zamenjaj proxy',
    307: 'Začasna preusmeritev',
    308: 'Trajna preusmeritev',
    400: 'Napačna zahteva',
    401: 'Nepooblaščeno',
    402: 'Zahtevano plačilo',
    403: 'Prepovedano',
    404: 'Ni najdeno',
    405: 'Metoda ni dovoljena',
    406: 'Nesprejemljivo',
    407: 'Zahtevana avtentikacija proxyja',
    408: 'Časovna omejitev zahteve',
    409: 'Konflikt',
    410: 'Odstranjeno',
    411: 'Zahtevana dolžina',
    412: 'Predpogoj ni izpolnjen',
    413: 'Prevelika vsebina',
    414: 'URI predolg',
    415: 'Nepodprt tip medija',
    416: 'Obsega ni mogoče izpolniti',
    417: 'Pričakovanje ni izpolnjeno',
    418: 'Sem čajnik',
    421: 'Napačno usmerjena zahteva',
    422: 'Neobdelljiva entiteta',
    423: 'Zaklenjeno',
    424: 'Odvisnost ni uspela',
    425: 'Prezgodaj',
    426: 'Zahtevana nadgradnja',
    428: 'Zahtevan predpogoj',
    429: 'Preveč zahtev',
    431: 'Polja glave zahteve so prevelika',
    451: 'Nedostopno iz pravnih razlogov',
    500: 'Notranja napaka strežnika',
    501: 'Ni implementirano',
    502: 'Napačen prehod',
    503: 'Storitev ni na voljo',
    504: 'Časovna omejitev prehoda',
    505: 'Različica HTTP ni podprta',
    506: 'Variant se tudi pogaja',
    507: 'Nezadostno shranjevanje',
    508: 'Zaznana zanka',
    510: 'Ni razširjeno',
    511: 'Zahtevana omrežna avtentikacija',
  },
  gpu: {
    lost: 'Naprava GPU je bila izgubljena: ',
    noAdapter: 'Adapter WebGPU v tem brskalniku ni na voljo.',
    notSupported: 'WebGPU v tem brskalniku ni podprt.',
    errorRequestingDevice: 'Naprave GPU ni bilo mogoče ustvariti: ',
    other: 'Napaka pri izrisu: ',
  },
};

export default messages;
