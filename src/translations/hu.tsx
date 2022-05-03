/* eslint-disable */

import { Attribution } from 'fm3/components/Attribution';
import { ChangesetDetails } from 'fm3/components/ChangesetDetails';
import { CookieConsent } from 'fm3/components/CookieConsent';
import { ElevationInfo } from 'fm3/components/ElevationInfo';
import {
  ObjectDetailBasicProps,
  ObjectDetails,
} from 'fm3/components/ObjectDetails';
import { TrackViewerDetails } from 'fm3/components/TrackViewerDetails';
import { Fragment } from 'react';
import Alert from 'react-bootstrap/Alert';
import { FaKey } from 'react-icons/fa';
import shared from './hu-shared.json';
import { Messages } from './messagesInterface';

const nf33 = new Intl.NumberFormat('hu', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

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

const hu: Messages = {
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
    internalError: ({ ticketId }) => `!HTML!${getErrorMarkup(ticketId)}`,
    processorError: ({ err }) => `Alkalmazáshiba: ${err}`,
    seconds: 'másodperc',
    minutes: 'perc',
    meters: 'méter',
    createdAt: 'Létrehozva',
    modifiedAt: 'Modified At', // TODO translate
    actions: 'Műveletek',
    add: 'Új hozzáadása',
    clear: 'Törlés',
    convertToDrawing: 'Átalakítás rajzzá',
    simplifyPrompt:
      'Adja meg az egyszerűsítés mértékét. Az egyszerűsítés mellőzéséhez írjon be nullát.',
    copyUrl: 'URL másolása',
    copyPageUrl: 'URL másolása', // TODO update
    savingError: ({ err }) => `Mentési hiba: ${err}`,
    loadError: ({ err }) => `Betöltési hiba: ${err}`,
    deleteError: ({ err }) => `Törlési hiba: ${err}`,
    operationError: ({ err }) => `Operation error: ${err}`, // TODO translate
    deleted: 'Törölve.',
    saved: 'Elmentve.',
    visual: 'Megjelenítés',
    copyOk: 'Copied to clipboard.', // TODO translate
    noCookies: 'This functionality requires accepting the cookies consent.', // TODO translate
    name: 'Name', // TODO translate
    load: 'Load', // TODO translate
    unnamed: 'No name', // TODO translate
    enablePopup:
      'Kérjük, engedélyezze a böngészőben az előugró ablakokat ehhez a webhelyhez.',
    componentLoadingError:
      'Component loading error. Please check your internet connection.', // TODO translate
    offline: 'You are not connected to the internet.', // TODO translate
    connectionError: 'Error connecting the server.', // TODO translate
    experimentalFunction: 'Experimental function', // TODO translate
    attribution: () => <Attribution unknown="Map licence is not specified" />, // TODO translate
    unauthenticatedError: 'Please log-in to access this feature.', // TODO translate
  },

  selections: {
    objects: 'Objektum (érdekes pont, POI)',
    drawPoints: 'Pont',
    drawLines: 'Vonal',
    drawPolygons: 'Sokszög',
    tracking: 'Követés',
    linePoint: 'Line point', // TODO translate
    polygonPoint: 'Polygon point', // TODO translate
  },

  tools: {
    none: 'Eszköz bezárása',
    tools: 'Eszközök',
    routePlanner: 'Útvonaltervező',
    objects: 'Objektumok (érdekes pontok, POI-k)',
    photos: 'Fényképek',
    measurement: 'Rajzolás és mérés',
    drawPoints: 'Pont rajzolása',
    drawLines: 'Vonal rajzolása',
    drawPolygons: 'Sokszög rajzolása',
    trackViewer: 'Nyomvonalmegtekintő (GPX)',
    changesets: 'Térkép változásai',
    mapDetails: 'Térképadatok',
    tracking: 'Élő követés',
    maps: 'Saját térképeim',
  },

  routePlanner: {
    // TODO translate
    ghParams: {
      tripParameters: 'Trip parameters',
      seed: 'Random seed',
      distance: 'Approximate distance',
      isochroneParameters: 'Isochrone parameters',
      buckets: 'Buckets',
      timeLimit: 'Time limit',
      distanceLimit: 'Distance limit',
    },
    milestones: 'Távolságszelvények',
    start: 'Kiindulás',
    finish: 'Úti cél',
    swap: 'Kiindulási pont és cél felcserélése',
    point: {
      pick: 'Kijelölés a térképen',
      current: 'Az Ön pozíciója',
      home: 'Lakhely',
    },
    transportType: {
      car: 'Gépkocsi',
      // 'car-free': 'Gépkocsi (útdíj nélkül)',
      // bikesharing: 'Kerékpármegosztás',
      // imhd: 'Tömegközlekedés (Pozsony)',
      bike: 'Bicycle', // TODO translate
      bicycle_touring: 'Kerékpártúrázás',
      'foot-stroller': 'Babakocsi / kerekesszék',
      nordic: 'Sífutás',
      // ski: 'Alpesi sí',
      foot: 'Gyaloglás',
      hiking: 'Turisztika', // TODO translate
      mtb: 'Mountain bike', // TODO translate
      racingbike: 'Racing bike', // TODO translate
      motorcycle: 'Motorcycle', // TODO translate
    },
    development: 'fejlesztés alatt',
    mode: {
      route: 'Megadott sorrendben',
      trip: 'Legrövidebb úton',
      roundtrip: 'Legrövidebb úton (körutazás)',
      'routndtrip-gh': 'Roundtrip', // TODO translate
      isochrone: 'Isochrones', // TODO translate
    },
    // TODO translate
    weighting: {
      fastest: 'Fastest',
      short_fastest: 'Fast, short',
      shortest: 'Shortest',
    },
    alternative: 'Alternatíva',
    // eslint-disable-next-line
    distance: ({ value, diff }) => (
      <>
        Távolság:{' '}
        <b>
          {value} km{diff ? ` (+ ${diff} km)` : ''}
        </b>
      </>
    ),
    // eslint-disable-next-line
    duration: ({ h, m, diff }) => (
      <>
        Időtartam:{' '}
        <b>
          {h} óra {m} perc{diff && ` (+ ${diff.h} óra ${diff.m} perc)`}
        </b>
      </>
    ),
    // eslint-disable-next-line
    summary: ({ distance, h, m }) => (
      <>
        Távolság: <b>{distance} km</b> | Időtartam:{' '}
        <b>
          {h} óra {m} perc
        </b>
      </>
    ),
    noHomeAlert: {
      msg: 'Először meg kell adnia a lakóhelyét a beállításoknál.',
      setHome: 'Megadás',
    },
    showMidpointHint: 'Köztes pont megadásához húzzon el egy útszakaszt.',
    gpsError: 'Hiba történt jelenlegi pozíciójának meghatározásakor.',
    routeNotFound:
      'Nem sikerült útvonalat találni. Próbálja meg módosítani a paramétereket vagy áthelyezni az út pontjait.',
    fetchingError: ({ err }) => `Hiba történt az útvonaltervezésnél: ${err}`,
    maneuverWithName: ({ type, modifier, name }) =>
      `${type} ${modifier} itt: ${name}`,
    maneuverWithoutName: ({ type, modifier }) => `${type} ${modifier}`,

    maneuver: {
      types: {
        turn: 'forduljon',
        'new name': 'menjen',
        depart: 'indulás',
        arrive: 'megérkezés',
        merge: 'menjen tovább',
        // 'ramp':
        'on ramp': 'hajtson fel',
        'off ramp': 'hajtson le',
        fork: 'válasszon utat',
        'end of road': 'menjen tovább',
        // 'use lane':
        continue: 'menjen tovább',
        roundabout: 'hajtson be a körforgalomba',
        rotary: 'hajtson be a körforgalomba',
        'roundabout turn': 'a körforgalomban forduljon',
        // 'notification':
        'exit rotary': 'hajtson ki a körforgalomból', // undocumented
        'exit roundabout': 'hajtson ki a körforgalomból', // undocumented
        notification: 'értesítés',
        'use lane': 'ezt a sávot használja:',
      },

      modifiers: {
        uturn: 'forduljon meg',
        'sharp right': 'élesen jobbra',
        'slight right': 'enyhén jobbra',
        right: 'jobbra',
        'sharp left': 'élesen balra',
        'slight left': 'enyhén balra',
        left: 'balra',
        straight: 'egyenesen',
      },
    },
    imhd: {
      total: {
        // eslint-disable-next-line
        short: ({ arrival, price, numbers }) => (
          <>
            Érkezés: <b>{arrival}</b> | Ár: <b>{price} €</b> | Járat:{' '}
            {numbers?.map((n, i) => (
              <Fragment key={n}>
                {i > 0 ? ', ' : ''}
                <b>{n}</b>
              </Fragment>
            ))}
          </>
        ),
        // eslint-disable-next-line
        full: ({ arrival, price, numbers, total, home, foot, bus, wait }) => (
          <>
            Érkezés: <b>{arrival}</b> | Ár: <b>{price} €</b> | Járat:{' '}
            {numbers?.map((n, i) => (
              <Fragment key={n}>
                {i > 0 ? ', ' : ''}
                <b>{n}</b>
              </Fragment>
            ))}{' '}
            | Időtartam{' '}
            <b>
              {total} {numberize(total, ['perc', 'perc'])}
            </b>
            <br />
            Az indulásig van: <b>{home}</b>, séta: <b>{foot}</b>,
            tömegközlekedés: <b>{bus}</b>, várakozás :{' '}
            <b>
              {wait} {numberize(wait, ['perc', 'perc'])}
            </b>
          </>
        ),
      },
      step: {
        // eslint-disable-next-line
        foot: ({ departure, duration, destination }) => (
          <>
            <b>{departure}</b> sétáljon{' '}
            {duration !== undefined && (
              <b>
                {duration} {numberize(duration, ['perc', 'perc'])}
              </b>
            )}{' '}
            {destination === 'TARGET' ? (
              <b>ide:</b>
            ) : (
              <>
                ide: <b>{destination}</b>
              </>
            )}
          </>
        ),
        // eslint-disable-next-line
        bus: ({ departure, type, number, destination }) => (
          <>
            <b>{departure}</b> {type} <b>{number}</b> erre: <b>{destination}</b>
          </>
        ),
      },
      type: {
        bus: 'szálljon fel erre a buszra:',
        tram: 'szálljon fel erre a villamosra:',
        trolleybus: 'szálljon fel erre a torlibuszra:',
        foot: 'sétáljon',
      },
    },
    bikesharing: {
      step: {
        // eslint-disable-next-line
        foot: ({ duration, destination }) => (
          <>
            sétáljon{' '}
            {duration !== undefined && (
              <b>
                {duration} {numberize(duration, ['perc', 'perc'])}
              </b>
            )}{' '}
            {destination === 'TARGET' ? (
              <b>a célponthoz</b>
            ) : (
              <>
                ide: <b>{destination}</b>
              </>
            )}
          </>
        ),
        // eslint-disable-next-line
        bicycle: ({ duration, destination }) => (
          <>
            kerékpározzon{' '}
            {duration !== undefined && (
              <b>
                {duration} {numberize(duration, ['perc', 'perc'])}
              </b>
            )}{' '}
            ide: <b>{destination}</b>
          </>
        ),
      },
    },
    imhdAttribution: 'tömegközlekedési útvonalak',
  },

  mainMenu: {
    title: 'Main menu', // TODO translate
    logOut: 'Kijelentkezés',
    logIn: 'Bejelentkezés',
    account: 'Fiók',
    gpxExport: 'Exportálás GPX / GeoJSON-be',
    mapExports: 'Térkép GPS-készülékekhez',
    embedMap: 'Térkép beágyazása',
    supportUs: 'A Freemap támogatása',
    help: 'Súgó',
    back: 'Vissza',
    mapLegend: 'Jelmagyarázat',
    contacts: 'Kapcsolat',
    tips: 'Tippek',
    facebook: 'Freemap a Facebookon',
    twitter: 'Freemap a Twitteren',
    youtube: 'Freemap a YouTubeon',
    github: 'Freemap a GitHubon',
    automaticLanguage: 'Automatikus',
    pdfExport: 'Térkép exportálása',
    osmWiki: 'OpenStreetMap documentation', // TODO translate
    wikiLink: 'https://wiki.openstreetmap.org/wiki/Hu:Main_Page',
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
    // TODO translate
    cookieConsent: () => (
      <CookieConsent
        prompt="Some features may require cookies. Accept:"
        local="Cookies of local settings and login via social networks"
        analytics="Analytics cookies"
      />
    ),
    // TODO translate
    infoBars: {
      ua: () => (
        <>
          🇺🇦 Ukrajnával állunk.{' '}
          <a
            href="https://bank.gov.ua/en/about/support-the-armed-forces"
            target="_blank"
            rel="noopener"
          >
            Adományozás az ukrán hadseregnek ›
          </a>{' '}
          🇺🇦
        </>
      ),
    },
  },

  gallery: {
    recentTags: 'Recent tags to assign:', // TODO translate
    filter: 'Szűrő',
    showPhotosFrom: 'Fényképek megtekintése',
    showLayer: 'Réteg megjelenítése',
    upload: 'Feltöltés',
    f: {
      firstUploaded: 'az először feltöltöttől',
      lastUploaded: 'a legutóbb feltöltöttől',
      firstCaptured: 'a legrégebben készülttől',
      lastCaptured: 'a legutóbb készülttől',
      leastRated: 'a leggyöngébbre értékelttől',
      mostRated: 'a legjobbra értékelttől',
      lastComment: 'from last comment',
    },
    colorizeBy: 'Colorize by', // TODO translate
    c: {
      disable: "don't colorize", // TODO translate
      mine: 'differ mine', // TODO translate
      author: 'author', // TODO translate
      rating: 'rating', // TODO translate
      takenAt: 'taken date', // TODO translate
      createdAt: 'upload date', // TODO translate
      season: 'season', // TODO translate
    },
    viewer: {
      title: 'Fénykép',
      comments: 'Hozzászólások',
      newComment: 'Új hozzászólás',
      addComment: 'Hozzáadás',
      yourRating: 'Az Ön értékelése:',
      showOnTheMap: 'Megjelenítés a térképen',
      openInNewWindow: 'Megnyitás…',
      uploaded: ({ username, createdAt }) => (
        <>
          {username} töltötte fel ekkor: {createdAt}
        </>
      ),
      captured: (takenAt) => <>Ekkor készült: {takenAt}</>,
      deletePrompt: 'Kép törlése?',
      modify: 'Módosítás',
    },
    editForm: {
      name: 'Név',
      description: 'Leírás',
      takenAt: {
        datetime: 'Felvétel napja és ideje',
        date: 'Felvétel napja',
        time: 'Felvétel időpontja',
      },
      location: 'Hely',
      tags: 'Címkék',
      setLocation: 'Hely megadása',
    },
    uploadModal: {
      title: 'Fényképek feltöltése',
      uploading: (n) => `Feltöltés folyamatban (${n})`,
      upload: 'Feltöltés',
      rules: `
        <p>Húzza ide a fényképeit vagy kattintson ide a kijelölésükhöz.</p>
        <ul>
          <li>Ne töltsön fel túl kicsi fényképeket (bélyegképek/thumbnails). A fénykép legnagyobb mérete nincs korlátozva. A legnagyobb fájlméret 10MB, a nagyobb fájlok elutasíttatnak.</li>
          <li>Csak tájak fényképeit vagy dokumentációs jellegű képeket töltsön fel. A portrék és a makrofényképek nem kívánatosak, és figyelmeztetés nélkül töröltetnek.</li>
          <li>Kérjük, csak a saját fényképeit töltse fel.</li>
          <li>A fényképek feltöltésével hozzájárul, hogy azokat a CC-BY-SA 4.0 licenc alapján terjesszék.</li>
          <li>Az üzemeltető (Freemap.sk) minden kötelezettséget elhárít, és nem vállal felelősséget a fénykép galériában történő közzétételéből eredő közvetlen vagy közvetett károkért. A fényképért teljes mértékben az azt a kiszolgálóra feltöltő személy felel.</li>
          <li>Az üzemeltető fenntartja a jogot, hogy a fénykép leírását, nevét, pozíciójáőt és címkéit szerkesszt, illetve hogy a fényképet törölje, ha annak tartalma nem megfelelő (megszegi ezeket a szabályokat).</li>
          <li>Az üzemeltető fenntartja a jogot, hogy törölje azt a fiókot, amelynek felhasználója nem megfelelő tartalom közzétételével ismételten megsérti a galéria szabályzatát.</li>
        </ul>
      `,
      success: 'A képek sikeresen fel lettek töltve.',
      showPreview:
        'Előnézetek megjelenítése (több processzorteljesítményt és memóriát használ)',
    },
    locationPicking: {
      title: 'Fénykép helyének kijelölése',
    },
    deletingError: ({ err }) => `Hiba történt a fénykép törlésénél: ${err}`,
    tagsFetchingError: ({ err }) =>
      `Hiba történt a címkék beolvasásánál: ${err}`,
    pictureFetchingError: ({ err }) =>
      `Hiba történt a fénykép beolvasásánál: ${err}`,
    picturesFetchingError: ({ err }) =>
      `Hiba történt a fényképek beolvasásánál: ${err}`,
    savingError: ({ err }) => `Hiba történt a fénykép mentésénél: ${err}`,
    commentAddingError: ({ err }) =>
      `Hiba történt a hozzászólás hozzáadásánál: ${err}`,
    ratingError: ({ err }) => `Hiba történt a fénykép értékelésénél: ${err}`,
    missingPositionError: 'Hiányzik a hely.',
    invalidPositionError: 'A hely koordinátáinak formátuma érvénytelen.',
    invalidTakenAt: 'A fénykép készítésének dátuma és időpontja érvénytelen.',
    filterModal: {
      title: 'Fényképek szűrése',
      tag: 'Címke',
      createdAt: 'Feltöltés dátuma',
      takenAt: 'Készítés dátuma',
      author: 'Szerző',
      rating: 'Értékelés',
      noTags: 'nincs címke',
      pano: 'Panoráma', // TODO translate
    },
    noPicturesFound: 'There were no photos found on this place.', // TODO translate
    linkToWww: 'photo at www.freemap.sk', // TODO translate
    linkToImage: 'photo image file', // TODO translate
  },

  measurement: {
    distance: 'Távolság',
    elevation: 'Magasság',
    area: 'Terület',
    elevationFetchError: ({ err }) =>
      `Hiba történt a pont magasságának beolvasásakor: ${err}`,
    elevationInfo: (params) => (
      <ElevationInfo
        {...params}
        lang="hu"
        tileMessage="Tile" // TODO translate
        maslMessage="Magasság"
      />
    ),
    areaInfo: ({ area }) => (
      <>
        Terület:
        <div>
          {nf33.format(area)}&nbsp;m<sup>2</sup>
        </div>
        <div>{nf33.format(area / 100)}&nbsp;ár</div>
        <div>{nf33.format(area / 10000)}&nbsp;ha</div>
        <div>
          {nf33.format(area / 1000000)}&nbsp;km<sup>2</sup>
        </div>
      </>
    ),
    distanceInfo: ({ length }) => (
      <>
        Távolság:
        <div>{nf33.format(length * 1000)}&nbsp;m</div>
        <div>{nf33.format(length)}&nbsp;km</div>
      </>
    ),
  },

  trackViewer: {
    upload: 'Feltöltés',
    moreInfo: 'További információ',
    share: 'Mentés a kiszolgálóra',
    colorizingMode: {
      none: 'Inaktív',
      elevation: 'Magasság',
      steepness: 'Meredekség',
    },
    details: {
      startTime: 'Indulási idő',
      finishTime: 'Érkezési idő',
      duration: 'Időtartam',
      distance: 'Távolság',
      avgSpeed: 'Átlagsebesség',
      minEle: 'Legkisebb magasság',
      maxEle: 'Legnagyobb magasság',
      uphill: 'Összes emelkedés',
      downhill: 'Összes lejtés',
      durationValue: ({ h, m }) => `${h} óra ${m} perc`,
    },
    uploadModal: {
      title: 'A nyomvonal feltöltése',
      drop: 'Húzza ide a .gpx fájlt vagy kattintson ide a kijelöléséhez.',
    },
    shareToast: 'Az útvonal elmentődött a kiszolgálóra, és megosztható.', // TODO update translation
    fetchingError: ({ err }) =>
      `Hiba történt a nyomvonal adatainak beolvasásakor: ${err}`,
    savingError: ({ err }) => `Hiba történt a nyomvonal mentésekor: ${err}`,
    loadingError: 'Hiba történt a fájl betöltésekor.',
    onlyOne: 'Csak egyetlen GPX-fájl tölthető be.',
    wrongFormat: 'A fájlnak GPX kiterjesztésűnek kell lennie.',
    info: () => <TrackViewerDetails />,
    tooBigError: 'Túl nagy a fájl.',
  },

  drawing: {
    modify: 'Properties', // TODO translate
    edit: {
      title: 'Properties', // TODO translate
      color: 'Color', // TODO translate
      label: 'Felirat:',
      hint: 'Felirat eltávolításához hagyja üresen ezt a mezőt.',
    },
    continue: 'Continue', // TODO translate
    join: 'Join', // TODO translate
    split: 'Split', // TODO translate
    stopDrawing: 'Stop drawing', // TODO translate
    selectPointToJoin: 'Select point to join lines', // TODO translate
  },

  settings: {
    map: {
      overlayPaneOpacity: 'Saját vonalak átlátszatlansága:',
      homeLocation: {
        label: 'Lakóhely:',
        select: 'Kijelölés a térképen',
        undefined: 'meghatározatlan',
      },
    },
    account: {
      name: 'Név',
      email: 'E-mail',
      sendGalleryEmails: 'Notify photo comments via email', // TODO translate
      delete: 'Delete account', // TODO translate
      deleteWarning:
        'Are you sure to delete your account? It will remove all your photos, photo comments and ratings, your maps, and tracked devices.', // TODO translate
    },
    general: {
      tips: 'Megnyitáskor jelenjenek meg tippek (csak szolvák és cseh nyelvnél)',
    },
    layer: 'Térkép',
    overlayOpacity: 'Opacity', // TODO translate
    showInMenu: 'Show in menu', // TODO translate
    showInToolbar: 'Show in toolbar', // TODO translate
    saveSuccess: 'A beállítások el lettek mentve.',
    savingError: ({ err }) => `Hiba történt a beállítások mentésénél: ${err}`,
    customLayersDef: 'Custom map layers definition', // TODO translate
    customLayersDefError: 'Invalid definition of custom map layers.', // TODO translate
  },

  changesets: {
    allAuthors: 'Minden szerző',
    tooBig:
      'Changesets request may return too many items. Please try zoom in, choose fewer days or enter the specific author.', // TODO translate
    olderThan: ({ days }) => `${days} nap`,
    olderThanFull: ({ days }) => `Az elmúlt ${days} nap módosításkészletei`,
    notFound: 'Nincs módosításkészlet.',
    fetchError: ({ err }) =>
      `Hiba történt a módosításkészletek beolvasásánál: ${err}`,
    detail: ({ changeset }) => <ChangesetDetails changeset={changeset} />,
    details: {
      author: 'Szerző:',
      description: 'Leírás:',
      noDescription: 'leírás nélküli',
      closedAt: 'Idő:',
      moreDetailsOn: ({ osmLink, achaviLink }) => (
        <p>
          További részletek itt: {osmLink} vagy itt: {achaviLink}.
        </p>
      ),
    },
  },

  mapDetails: {
    notFound: 'Itt nincs út.',
    fetchingError: ({ err }) =>
      `Hiba történt az út adatainak beolvasásakor: ${err}`,
    detail: (props: ObjectDetailBasicProps) => (
      <ObjectDetails
        {...props}
        openText="Open at OpenStreetMap.org" // TODO translate
        historyText="history" // TODO translate
        editInJosmText="Edit in JOSM" // TODO translate
      />
    ),
  },

  objects: {
    type: 'Típus',
    lowZoomAlert: {
      message: ({ minZoom }) =>
        `Ahhoz, hogy az objektumok típusok szerint látsszanak, legalább a ${minZoom}. szintre kell nagyítani.`,
      zoom: 'Nagyítás',
    },
    tooManyPoints: ({ limit }) => `Result was limited to ${limit} objects.`, // TODO translate
    fetchingError: ({ err }) =>
      `Hiba történt az objektumok (POI-k) beolvasásánál: ${err}`,
    // categories: {
    //   1: 'Természet',
    //   2: 'Szolgáltatások',
    //   3: 'Közlekedés',
    //   4: 'Történelmi objektumok',
    //   5: 'Egészségügy',
    //   6: 'Üzletek',
    //   7: 'Energia',
    //   8: 'Szállás & étkezés',
    //   9: 'Turizmus',
    //   10: 'Közigazgatási beosztás',
    //   11: 'Egyéb',
    //   12: 'Szabadidő',
    //   13: 'Sport',
    //   14: 'Oktatás',
    //   15: 'Kerékpározás',
    // },
    // subcategories: {
    //   1: 'Barlangbejárat',
    //   2: 'Hegycsúcs',
    //   3: 'Benzinkút',
    //   4: 'Étterem',
    //   5: 'Szálloda',
    //   6: 'Parkoló',
    //   7: 'Repülőtér',
    //   8: 'Vasútállomás',
    //   9: 'Buszállomás',
    //   10: 'Buszmegálló',
    //   11: 'Vár',
    //   12: 'Kastély',
    //   13: 'Rom',
    //   14: 'Múzeum',
    //   15: 'Monumentális, épületszerű emlékmű',
    //   16: 'Emlékmű',
    //   17: 'Gyógyszertár',
    //   18: 'Kórház',
    //   19: 'Orvosi rendelő',
    //   20: 'Rendőrség',
    //   21: 'Rendelőintézet',
    //   22: 'Határátkelő',
    //   23: 'Kórház sürgősségi osztállyal',
    //   24: 'Szupermarket',
    //   26: 'Atomerőmű',
    //   27: 'Hőerőmű',
    //   28: 'Vízerőmű',
    //   29: 'Szélerőmű',
    //   30: 'Kis élelmiszerbolt',
    //   31: 'Tűzoltóság',
    //   32: 'Templom',
    //   33: 'Kocsma',
    //   34: 'Bank ATM nélkül',
    //   35: 'Bankautomata (ATM)',
    //   36: 'Büfé, gyorsétterem',
    //   39: 'Bank ATM-mel',
    //   40: 'Kilátóhely',
    //   41: 'Kemping',
    //   42: 'Védett fa',
    //   43: 'Forrás',
    //   44: 'Útirányjelző tábla (gyalogos)',
    //   45: 'Tájékoztató térkép (gyalogos)',
    //   46: 'Menedékház (személyzet nélkül)',
    //   47: 'Esőbeálló',
    //   48: 'Posta',
    //   49: 'Történelmi csatatér',
    //   50: 'Magasles',
    //   51: 'Távközlési torony',
    //   52: 'Kilátótorony',
    //   53: 'Motel',
    //   54: 'Vendégház',
    //   55: 'Turistaszálló',
    //   56: 'Kerületszékhely (Szlovákia)',
    //   57: 'Járásszékhely (Szlovákia)',
    //   58: 'Nagyváros',
    //   59: 'Kisváros',
    //   60: 'Község',
    //   61: 'Falucska',
    //   62: 'Városrész',
    //   63: 'Vadőrház',
    //   64: 'Fogorvos',
    //   65: 'Kerékpárbolt',
    //   66: 'Kerékpártároló',
    //   67: 'Kerékpárkölcsönző',
    //   68: 'Alkoholbolt',
    //   69: 'Műalkotásbolt',
    //   70: 'Pékség',
    //   71: 'Szépségszalon',
    //   72: 'Ágy, hálószoba-felszerelés',
    //   73: 'Italt árusító bolt',
    //   74: 'Könyvesbolt',
    //   75: 'Butik',
    //   76: 'Hentes',
    //   77: 'Autókereskedés',
    //   78: 'Autószerelő',
    //   79: 'Jótékonysági bolt',
    //   80: 'Drogéria',
    //   81: 'Ruházati bolt',
    //   82: 'Számítógépüzlet',
    //   83: 'Édességbolt',
    //   84: 'Fénymásoló',
    //   85: 'Függönybolt',
    //   86: 'Csemegés',
    //   87: 'Nagyáruház',
    //   89: 'Vegytisztító',
    //   90: 'Barkácsbolt',
    //   91: 'Szórakoztató elektronikai bolt',
    //   92: 'Erotikus bolt',
    //   93: 'Méteráru',
    //   94: 'Termelői bolt',
    //   95: 'Virágüzlet',
    //   96: 'Képkeretbolt',
    //   98: 'Temetkezési iroda',
    //   99: 'Bútorbolt',
    //   100: 'Kertészet',
    //   101: 'Vegyesbolt',
    //   102: 'Ajándékbolt, souvenir',
    //   103: 'Üveges',
    //   104: 'Zöldség-gyümölcs',
    //   105: 'Fodrász',
    //   106: 'Vas-műszaki kereskedés',
    //   107: 'Hallókészülékbolt',
    //   108: 'Hi-Fi üzlet',
    //   109: 'Fagylaltozó',
    //   110: 'Lakberendezési bolt',
    //   111: 'Ékszerüzlet',
    //   112: 'Trafik',
    //   113: 'Konyhafelszerelés',
    //   114: 'Mosoda',
    //   115: 'Bevásárlóközpont',
    //   116: 'Masszázsszalon',
    //   117: 'Mobiltelefon-üzlet',
    //   118: 'Pénzkölcsönző',
    //   119: 'Motorkerékpár-kereskedés',
    //   120: 'Hangszerüzlet',
    //   121: 'Újságárus',
    //   122: 'Optika',
    //   124: 'Túrafelszerelés-bolt',
    //   125: 'Festékbolt',
    //   126: 'Zálogház',
    //   127: 'Kisállat-kereskedés',
    //   128: 'Tengerihalbolt',
    //   129: 'Használtáru-kereskedés',
    //   130: 'Cipőbolt',
    //   131: 'Sportfelszerelés-bolt',
    //   132: 'Papírbolt',
    //   133: 'Tetoválás',
    //   134: 'Játékbolt',
    //   135: 'Építőanyag-áruház',
    //   136: 'Üres üzlethelyiség',
    //   137: 'Porszívóüzlet',
    //   138: '100 forintos bolt',
    //   139: 'Videófilmbolt vagy -kölcsönző',
    //   140: 'Állatkert',
    //   141: 'Menedékház (személyzettel)',
    //   142: 'Látványosság',
    //   143: 'WC',
    //   144: 'Telefon',
    //   145: 'Városháza, községháza',
    //   146: 'Börtön',
    //   147: 'Piac',
    //   148: 'Bár',
    //   149: 'Kávézó',
    //   150: 'Grillezőhely',
    //   151: 'Ivóvíz',
    //   152: 'Taxi',
    //   153: 'Könyvtár',
    //   154: 'Autómosó',
    //   155: 'Állatorvos',
    //   156: 'Jelzőlámpa',
    //   157: 'Vasúti megállóhely',
    //   158: 'Vasúti átjáró',
    //   159: 'Villamosmegálló',
    //   160: 'Helikopter-leszállóhely',
    //   161: 'Víztorony',
    //   162: 'Szélmalom',
    //   163: 'Szauna',
    //   164: 'Benzinkút (LPG)',
    //   166: 'Kutyafuttató',
    //   167: 'Sportközpont',
    //   168: 'Golfpálya',
    //   169: 'Stadion',
    //   170: 'Sportpálya',
    //   171: 'Strand, élményfürdő',
    //   172: 'Sólya',
    //   173: 'Horgászat',
    //   174: 'Park',
    //   175: 'Játszótér',
    //   176: 'Kert',
    //   177: 'Szabadidős tevékenységre használható közös föld (UK)',
    //   178: 'Műjégpálya',
    //   179: 'Minigolf',
    //   180: 'Tánctér',
    //   181: 'Iskola',
    //   182: 'Teke',
    //   183: 'Bowling',
    //   184: 'Amerikai futball',
    //   185: 'Íjászat',
    //   186: 'Atlétika',
    //   187: 'Ausztrál futball',
    //   188: 'Baseball',
    //   189: 'Kosárlabda',
    //   190: 'Strandröplabda',
    //   191: 'BMX-kerékpár',
    //   192: 'Pétanque',
    //   193: 'Gyepteke',
    //   194: 'Kanadai futball',
    //   195: 'Kenu',
    //   196: 'Sakk',
    //   197: 'Hegymászás',
    //   198: 'Krikett',
    //   199: 'Krikettháló',
    //   200: 'Krokett',
    //   201: 'Kerékpározás',
    //   202: 'Búvárkodás',
    //   203: 'Kutyaverseny',
    //   204: 'Lovaglás',
    //   205: 'Valamilyen futball',
    //   206: 'Kelta futball',
    //   207: 'Golf',
    //   208: 'Torna',
    //   209: 'Hoki',
    //   210: 'Patkódobás',
    //   211: 'Lóverseny',
    //   212: 'Bajor curling',
    //   213: 'Korfball',
    //   214: 'Motorverseny',
    //   215: 'Több sport',
    //   216: 'Tájékozódási futás',
    //   217: 'Kispályás tenisz',
    //   218: 'Siklóernyőzés',
    //   219: 'Pelota',
    //   220: 'Raketball',
    //   221: 'Evezés',
    //   222: 'Ligarögbi',
    //   223: 'Uniós rögbe',
    //   224: 'Lövészet',
    //   225: 'Jégkorcsolya',
    //   226: 'Gördeszka',
    //   227: 'Síelés',
    //   228: 'Labdarúgás',
    //   229: 'Úszás',
    //   230: 'Asztalitenisz',
    //   231: 'Kézilabda',
    //   232: 'Tenisz',
    //   233: 'Szánkó',
    //   234: 'Röplabda',
    //   235: 'Vízisí',
    //   236: 'Egyetem',
    //   237: 'Óvoda',
    //   238: 'Főiskola',
    //   239: 'Autósiskola',
    //   240: 'Kápolna',
    //   241: 'Piknikezőhely',
    //   242: 'Beltéri tűzrakóhely',
    //   243: 'Lakatlan hely, dűlő',
    //   244: 'Vízesés',
    //   245: 'Tó',
    //   246: 'Víztározó',
    //   248: 'Természetvédelmi terület (fokozottan védett)',
    //   249: 'Természetvédelmi terület (természeti emlék)',
    //   250: 'Természetvédelmi terület (védett)',
    //   251: 'Természetvédelmi terület (tájvédelmi körzet)',
    //   252: 'Természetvédelmi terület (nemzeti park)',
    //   253: 'Tejautomata („vastehén”)',
    //   254: 'Természetvédelmi terület (RAMSAR vizes élőhely)',
    //   255: 'Házszám',
    //   256: 'Bányaakna (függőlege)',
    //   257: 'Bányatárna (vízszintes)',
    //   258: 'Kút',
    //   259: 'Út menti kereszt',
    //   260: 'Út menti kegyhely',
    //   261: 'Fitness',
    //   262: 'Gázturbina',
    //   263: 'Udvarház, kúria',
    //   264: 'Felszínalaktani (geomorfológiai) egység, táj határa',
    //   265: 'Katonai bunker',
    //   266: 'Autópályacsomópont',
    //   267: 'Szobor',
    //   268: 'Kémény',
    //   269: 'Siklóernyőzés',
    //   270: 'Sárkányrepülés',
    //   271: 'Állatetető',
    //   272: 'Tűzrakó hely',
    //   273: 'Tollaslabda, fallabda',
    //   274: 'Útirányjelző tábla (kerékpáros)',
    //   275: 'Kerékpártöltő állomás',
    // },
  },

  external: {
    openInExternal: 'Megosztás / megnyitás külső alkalmazásban',
    osm: 'OpenStreetMap',
    oma: 'OMA',
    googleMaps: 'Google térkép',
    hiking_sk: 'hiking.sk',
    zbgis: 'ZBGIS',
    mapy_cz: 'mapy.cz',
    josm: 'Szerkesztés JOSM-mal',
    id: 'Szerkesztés iD-vel',
    window: 'Új ablakban',
    url: 'URL megosztása',
    image: 'Fénykép megosztása',
  },

  search: {
    inProgress: 'Keresés…',
    noResults: 'Nincs találat',
    prompt: 'Adja meg a helyet',
    routeFrom: 'Útvonal innen',
    routeTo: 'Útvonal ide',
    fetchingError: ({ err }) => `Keresési hiba: ${err}`,
    buttonTitle: 'Keresés',
    placeholder: 'Keresés a térképen',
  },

  embed: {
    code: 'A következő kódot írja be HTML-oldalába:',
    example: 'Az eredmény így fog kinézni:',
    dimensions: 'Méretek:',
    height: 'Magasság:',
    width: 'Szélesség:',
    enableFeatures: 'Funkciók engedélyezése:',
    enableSearch: 'keresés',
    enableMapSwitch: 'térképréteg-kapcsoló',
    enableLocateMe: 'saját hely megtalálása',
  },

  tips: {
    errorLoading: 'Hiba történt a tipp betöltésekor.',
  },

  gpxExport: {
    export: 'Letöltés',
    format: 'Type', // TODO translate
    exportToDrive: 'Mentés Google Drive-ra',
    exportToDropbox: 'Mentés Dropbox-ba',
    exportError: ({ err }) => `Hiba a exportálásakor: ${err}`,
    what: {
      plannedRoute: 'útvonal',
      plannedRouteWithStops: 'útvonal (megállásokkal)',
      objects: 'érdekes pontok (POI-k)',
      pictures: 'fényképek (a látható térképterületen)',
      drawingLines: 'rajzolás – vonalak',
      drawingAreas: 'rajzolás – sokszögek',
      drawingPoints: 'rajzolás – pontok',
      tracking: 'élő nyomkövetés',
      gpx: 'GPX-nyomvonal',
    },
    disabledAlert:
      'Csak az a jelölőnégyzet jelölhető be exportálásra, amelyhez a térképen tartozik tartalom.',
    licenseAlert:
      'Various licenses may apply - like OpenStreetMap. Please add missing attributions upon sharing exported file.', // TODO translate
    exportedToDropbox: 'Fájl elmentve a Dropboxba.',
    exportedToGdrive: 'Fájl elmentve a Google Drive-ra.',
  },

  logIn: {
    with: {
      facebook: 'Belépés Facebook-fiókkal',
      google: 'Belépés Google-fiókkal',
      osm: 'Belépés OpenStreetMap-fiókkal',
    },
    success: 'Sikeresen bejelentkezett.',
    logInError: ({ err }) => `Hiba történt a bejelentkezésnél: ${err}`,
    logInError2: 'Hiba történt a bejelentkezésnél.',
    logOutError: ({ err }) => `Hiba történt a kijelentkezésnél: ${err}`,
    verifyError: ({ err }) =>
      `Hiba történt a hitelesítés ellenőrzésénél: ${err}`,
  },

  logOut: {
    success: 'Sikeresen kijelentkezett.',
  },

  mapLayers: {
    showAll: 'Show all maps', // TODO translate
    settings: 'Map settings', // TODO translate
    layers: 'Térképrétegek',
    switch: 'Térképrétegek', // TODO translate
    photoFilterWarning: 'A fényképszűrés aktív',
    interactiveLayerWarning: 'Interactive layer is hidden', // TODO translate
    minZoomWarning: (minZoom) => `A ${minZoom} nagyítási szinttől látható`,
    letters: {
      A: 'Autó',
      T: 'Túrázás',
      C: 'Kerékpározás',
      K: 'Síelés',
      S: 'Légifelvétel',
      Z: 'Ortofotó (Szlovákia)',
      O: 'OpenStreetMap',
      M: 'mtbmap.cz',
      p: 'OpenTopoMap',
      d: 'Tömegközlekedés',
      h: 'Történelmi térkép',
      X: outdoorMap,
      i: 'Interaktív réteg',
      I: 'Fényképek',
      l: 'Erdészeti utak (Szlovákia)',
      n1: 'Nevek (autó)',
      n2: 'Nevek (túrázás)',
      n3: 'Nevek (kerékpározás)',
      g: 'OSM GPS nyomvonalak',
      t: 'Turistautak',
      c: 'Kerékpáros útvonalak',
      q: 'OpenSnowMap',
      r: 'Megjelenítőkliensek',
      s0: 'Strava (minden)',
      s1: 'Strava (lovaglás)',
      s2: 'Strava (futás)',
      s3: 'Strava (vízi tevékenységek)',
      s4: 'Strava (téli tevékenységek)',
      w: 'Wikipedia',
      '4': 'Light Hillshading DMR 5.0', // TODO translate
      '5': 'Gray Hillshading DMR 5.0', // TODO translate
    },
    customBase: 'Custom map', // TODO translate
    customOverlay: 'Custom map overlay', // TODO translate
    type: {
      map: 'térkép',
      data: 'adatok',
      photos: 'képek',
    },
    attr: {
      freemap: '©\xa0Freemap Szlovákia',
      osmData: '©\xa0OpenStreetMap közreműködők',
      srtm: '©\xa0SRTM',
      hot: '©\xa0Humanitárius OpenStreetMap Team',
    },
  },

  elevationChart: {
    distance: 'Távolság [km]',
    ele: `Magasság [${masl}]`,
    fetchError: ({ err }) =>
      `Hiba történt a magasságiprofil-adatok lekérésénél: ${err}`,
  },

  errorCatcher: {
    html: (ticketId) => `${getErrorMarkup(ticketId)}
      <p>
        Megpróbálhatja a következőket:
      </p>
      <ul>
        <li><a href="">újra betölti a legutóbbi oldalt</a></li>
        <li><a href="/">betölti a kezdőoldalt</a></li>
        <li><a href="/?reset-local-storage">törli a helyi adatokat és betölti a kezdőoldalt</a></li>
      </ul>
    `,
  },

  osm: {
    fetchingError: ({ err }) =>
      `Hiba történt az OSM-adatok lekérésénél: ${err}`,
  },

  tracking: {
    trackedDevices: {
      button: 'Figyelt',
      modalTitle: 'Figyelt eszközök',
      desc: 'Figyelt eszközök kezelése ismerősei pozíciójának megismeréséhez.',
      modifyTitle: (name) => (
        <>
          Figyelt eszköz módosításaí <i>{name}</i>
        </>
      ),
      createTitle: (name) => (
        <>
          <i>{name}</i> készülék figyelése
        </>
      ),
      storageWarning:
        'Please note that the list of devices is only reflected in the page URL. If you want to save it, use the "My Maps" function.', // TODO translate
    },
    accessToken: {
      token: 'Figyelőkód',
      timeFrom: 'Ettől',
      timeTo: 'Eddig',
      listingLabel: 'Felsorolási felirat',
      note: 'Megjegyzés',
      delete: 'Delete access token?',
    },
    accessTokens: {
      modalTitle: (deviceName) => (
        <>
          <i>{deviceName}</i> készülék figyelőkódjai
        </>
      ),
      desc: (deviceName) => (
        <>
          Határozzon meg figyelőkódokat, hogy <i>{deviceName}</i> készüléke
          pozícióját megoszthassa ismerőseivel.
        </>
      ),
      createTitle: (deviceName) => (
        <>
          Figyelőkód hozzáadása a(z) <i>{deviceName}</i> készülékhez
        </>
      ),
      modifyTitle: ({ token, deviceName }) => (
        <>
          A(z) <i>{deviceName}</i> készülék <i>{token}</i> figyelőkódjának
          módosítása
        </>
      ),
    },
    trackedDevice: {
      token: 'Figyelőkód',
      label: 'Felirat',
      fromTime: 'Kezdő időpont',
      maxAge: 'Legmagasabb életkor',
      maxCount: 'Legmagasabb szám',
      splitDistance: 'Távolság felosztása',
      splitDuration: 'Időtartam felosztása',
      color: 'Szín',
      width: 'Szélesség',
    },
    devices: {
      button: 'Készülékeim',
      modalTitle: 'Követett készülékeim',
      createTitle: 'Követendő készülék létrehozása',
      watchTokens: 'Kódok megtekintése',
      watchPrivately: 'Privát figyelés',
      watch: 'Figyelés',
      delete: 'Törli a készüléket?',
      modifyTitle: ({ name }) => (
        <>
          A(z) <i>{name}</i> készülék követésének módosítása
        </>
      ),
      desc: () => (
        <>
          <p>
            Kezelje készülékeit, hogy mások is láthassák pozícióját, ha megad
            nekik egy figyelőkódot (amelyet a <FaKey /> ikonnal hozhat létre).
          </p>
          <hr />
          <p>
            Adja meg az alábbi webcímet a nyomon követő alkalmazásában (pl.{' '}
            <a href="https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking">
              Locus
            </a>{' '}
            vagy OsmAnd):{' '}
            <code>
              {process.env['API_URL']}/tracking/track/<i>kód</i>
            </code>{' '}
            ahol a <i>kód</i> az alábbi táblázatban található.
          </p>
          <p>
            A végpont támogatja a HTTP <code>GET</code> és <code>POST</code>
            módszert az URL-ben kódolt alábbi paraméterekkel:
          </p>
          <ul>
            <li>
              <code>lat</code> - hosszúság fokban (kötelező)
            </li>
            <li>
              <code>lon</code> - szélesség fokban (kötelező)
            </li>
            <li>
              <code>time</code>, <code>timestamp</code> - JavaScripttel
              elemezhető parsable dátumés idő vagy Unix idő másodpercben vagy
              milliszekundumban
            </li>
            <li>
              <code>alt</code>, <code>altitude</code> - magasság (méter)
            </li>
            <li>
              <code>speed</code> - sebeeség (m/s)
            </li>
            <li>
              <code>speedKmh</code> - sebesség (km/h)
            </li>
            <li>
              <code>acc</code> - pontosság (méter)
            </li>
            <li>
              <code>hdop</code> - vízszintes pontossághígulás (dilution of
              precision / DOP)
            </li>
            <li>
              <code>bearing</code> - irányszög (fok)
            </li>
            <li>
              <code>battery</code> - akkumulátor (százalék)
            </li>
            <li>
              <code>gsm_signal</code> - GSM-jel (százalék)
            </li>
            <li>
              <code>message</code> - üzenet (megjegyzés)
            </li>
          </ul>
          <hr />
          <p>
            TK102B GPS tracker nyomvonalrögzítő készülék esetén a következőre
            állítsa be a címét:{' '}
            <code>
              {process.env['API_URL']
                ?.replace(/https?:\/\//, '')
                ?.replace(/:\d+$/, '')}
              :3030
            </code>
          </p>
        </>
      ),
    },
    device: {
      token: 'Követési kód',
      name: 'Név',
      maxAge: 'Legmagasabb kor',
      maxCount: 'Legmagasabb szám',
      regenerateToken: 'Újragenerálás',
      generatedToken: 'mentéskor fog generálódni',
    },
    visual: {
      line: 'Vonal',
      points: 'Pontok',
      'line+points': 'Vonal + pontok',
    },
    subscribeNotFound: ({ id }) => (
      <>
        A(z) <i>{id}</i> figyelőkód nem létezik.
      </>
    ),
    subscribeError: ({ id }) => (
      <>
        Hiba történt a(z) <i>{id}</i> kód használatának követésekor.
      </>
    ),
  },
  pdfExport: {
    advancedSettings: 'Advanced options', // TODO translate
    styles: 'Interactive layer styles', // TODO translate
    export: 'Exportálás',
    exportError: ({ err }) => `Hiba történt a térkép exportálásakor: ${err}`,
    exporting: 'Kérjük várjon, a térkép exportálása folyamatban van…',
    exported: ({ url }) => (
      <>
        A térkép exportálása befelyeződött.{' '}
        <Alert.Link href={url} target="_blank">
          Open.
        </Alert.Link>
      </>
    ),
    area: 'Exportálandó terület:',
    areas: {
      visible: 'A térkép látható területe',
      pinned: 'A kijelölt sokszöget (rajzot) tartalmazó terület',
    },
    format: 'Formátum:',
    layersTitle: 'Választható rétegek:',
    layers: {
      contours: 'Szintvonalak',
      shading: 'Domborzatárnyékolás',
      hikingTrails: 'Turistautak',
      bicycleTrails: 'Kerékpáros útvonalak',
      skiTrails: 'Síútvonalak',
      horseTrails: 'Lovaglóútvonalak',
      drawing: 'Rajz',
      plannedRoute: 'Tervezett útvonal',
      track: 'GPX-nyomvonal',
    },
    mapScale: 'Térkép felbontása:',
    alert: () => (
      <>
        Megjegyzések:
        <ul>
          <li>
            A <i>{outdoorMap}</i> fog exportáltatni.
          </li>
          <li>A térkép exportálása több tucat másodpercet is igénybe vehet.</li>
          <li>
            Megosztás előtt a térképet lássa el a következő szerzői jogi
            közleménnyel:
            <br />
            <em>
              térkép ©{' '}
              <Alert.Link
                href="https://www.freemap.sk/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Freemap Szlovákia
              </Alert.Link>
              , adatok{' '}
              <Alert.Link
                href="https://osm.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
              >
                © OpenStreetMap közreműködők
              </Alert.Link>
              {', SRTM, '}
              <Alert.Link
                href="https://www.geoportal.sk/sk/udaje/lls-dmr/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LLS: ÚGKK SR
              </Alert.Link>
            </em>
          </li>
        </ul>{' '}
      </>
    ),
  },

  maps: {
    legacyMapWarning:
      'Displayed map is a legacy one. Switch to modern outdoor map?', // TODO translate
    noMapFound: 'Nincs térkép', // TODO No map found
    save: 'Mentés',
    delete: 'Törlés',
    disconnect: 'Disconnect', // TODO translate
    deleteConfirm: (name) => `Biztosan törli ezt a térképet? ${name}`, // TODO translate
    fetchError: ({ err }) => `Hiba történt a térkép betöltéskor: ${err}`,
    fetchListError: ({ err }) => `Hiba történt a térképek betöltéskor: ${err}`,
    deleteError: ({ err }) => `Hiba történt a térkép törlésekor: ${err}`,
    renameError: ({ err }) => `Hiba történt a térkép átnevezésekor: ${err}`,
    createError: ({ err }) => `Hiba történt a térkép mentésekor: ${err}`,
    saveError: ({ err }) => `Hiba történt a térkép mentésekor: ${err}`,
    loadToEmpty: 'Load to empty map',
    loadInclMapAndPosition:
      'Load including saved background map and its position',
    savedMaps: 'Saved maps',
    newMap: 'New map',
    SomeMap: ({ name }) => (
      <>
        Map <i>{name}</i>
      </>
    ),
    writers: 'Editors', // TODO translate
    conflictError: 'The map has been modified in the meantime.', // TODO translate
  },

  // TODO translate
  mapCtxMenu: {
    centerMap: 'Center a map here',
    measurePosition: 'Find coordinates and elevation',
    addPoint: 'Add here a point',
    startLine: 'Start here drawing a line or measurement',
    queryFeatures: 'Query nearby features',
    startRoute: 'Plan a route from here',
    finishRoute: 'Plan a route to here',
    showPhotos: 'Show nearby photos',
  },

  legend: {
    body: (
      <>
        Jelmagyarázat: <i>{outdoorMap}</i>:
      </>
    ),
  },

  contacts: {
    ngo: 'Önkéntes egyesület',
    registered:
      'Nyilvántartásba véve 2009. október 2-án, MV/VVS/1-900/90-34343 számmal',
    bankAccount: 'Bankszámlaszám',
    generalContact: 'Általános elérhetőség',
    board: 'Elnökség',
    boardMemebers: 'Elnökségi tagok',
    president: 'Elnök',
    vicepresident: 'Alelnök',
    secretary: 'Titkár',
  },

  removeAds: {
    title: 'Remove ads', // TODO translate
    // TODO translate
    info: (
      <>
        <p>
          <strong>Support the volunteers who create this map!</strong>
        </p>
        <p>
          For <b>5 hours</b> of your volunteer work or <b>5 €</b>, we will{' '}
          <b>remove ads</b> from freemap for a year.
        </p>
        <p>
          You can prove your volunteer work by creating work reports in the{' '}
          <a href="https://rovas.app/">Rovas</a> application. If you are a
          volunteer in the OSM project and are using the JOSM application, we
          recommend enabling the{' '}
          <a href="https://josm.openstreetmap.de/wiki/Help/Plugin/RovasConnector">
            Rovas Connector plugin
          </a>
          , which can create reports for you. After a report is verified by two
          users, you will receive community currency <i>Chron</i>, which you can
          use to remove ads from www.freemap.sk.
        </p>
      </>
    ), // TODO translate
    continue: 'Continue', // TODO translate
    success: 'Congratulations, you have become a premium member!', // TODO translate
  },

  // TODO translate
  offline: {
    offlineMode: 'Offline mode',
    cachingActive: 'Caching active',
    clearCache: 'Clear cache',
    dataSource: 'Data source',
    networkOnly: 'Network only',
    networkFirst: 'Network first',
    cacheFirst: 'Cache first',
    cacheOnly: 'Cache only',
  },
};

function numberize(n: number, words: [string, string]) {
  return n < 1 ? words[0] : n < 2 ? words[1] : words[0];
}

export default hu;

/*
// TODO translate elsewhere in the code:

English: Freemap Photos
Translation: ...

English: Photo comment at ${webUrl}
Hungarian: ...

English: User ${ctx.state.user.name} commented ${own ? 'your' : 'a'} photo ${picTitle} at ${picUrl}:
Hungarian: ...

English: If you no longer wish to be notified about photo comments, configure it at ${unsubscribeUrl} in the Account tab.
Hungarian: ...

English: You are offline.
Hungarian: ...

English: Please go online to use Freemap application.
Hungarian: ...

*/
