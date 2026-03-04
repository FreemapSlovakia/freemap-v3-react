import { AreaInfo } from '@app/components/AreaInfo.js';
import { DistanceInfo } from '@app/components/DistanceInfo.js';
import { MaptilerAttribution } from '@app/components/MaptilerAttribution.js';
import { RovasAd } from '@features/ad/components/RovasAd.js';
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
import { FaKey } from 'react-icons/fa';
import shared from './hu-shared.js';
import { addError, Messages } from './messagesInterface.js';

const nf00 = new Intl.NumberFormat('hu', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
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
    internalError: ({ ticketId }) => `!HTML!${getErrorMarkup(ticketId)}`,
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
    noCookies: 'Ez a funkció a sütik elfogadását igényli.',
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
    areYouSure: 'Biztos vagy benne?',
    success: 'Kész!',
    privacyPolicy: 'Adatvédelmi irányelvek',
    newOptionText: '%value% hozzáadása',
    deleteButtonText: '%value% eltávolítása a listáról',
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
    trackViewer: 'Nyomvonalmegtekintő (GPX)',
    changesets: 'Térkép változásai',
    mapDetails: 'Térképadatok',
    tracking: 'Élő követés',
    maps: 'Saját térképeim',
  },

  routePlanner: {
    ghParams: {
      tripParameters: 'Út paraméterei',
      seed: 'Véletlenszám mag',
      distance: 'Közelítő távolság',
      isochroneParameters: 'Izokron paraméterek',
      buckets: 'Vödrök',
      timeLimit: 'Időkorlát',
      distanceLimit: 'Távolságkorlát',
    },
    milestones: 'Távolságszelvények',
    start: 'Kiindulás',
    finish: 'Úti cél',
    swap: 'Kiindulási pont és cél felcserélése',
    point: {
      pick: 'Kijelölés a térképen',
      current: 'Az Ön pozíciója',
      home: 'Lakhely',
      point: 'Útpont',
    },
    transportType: {
      car: 'Gépkocsi',
      car4wd: 'Gépkocsi 4x4',
      bike: 'Kerékpár',
      foot: 'Gyaloglás',
      hiking: 'Túrázás',
      mtb: 'Hegyikerékpár',
      racingbike: 'Versenykerékpár',
      motorcycle: 'Motorkerékpár',
      manual: 'Egyenes vonal',
    },
    development: 'fejlesztés alatt',
    mode: {
      route: 'Megadott sorrendben',
      trip: 'Legrövidebb úton',
      roundtrip: 'Legrövidebb úton (körutazás)',
      'routndtrip-gh': 'Körút',
      isochrone: 'Izokron',
    },
    alternative: 'Alternatíva',
    distance: ({ value, diff }) => (
      <>
        Távolság:{' '}
        <b>
          {value}
          {diff ? ` (+ ${diff})` : ''}
        </b>
      </>
    ),
    duration: ({ h, m, diff }) => (
      <>
        Időtartam:{' '}
        <b>
          {h} óra {m} perc{diff && ` (+ ${diff.h} óra ${diff.m} perc)`}
        </b>
      </>
    ),
    summary: ({ distance, h, m }) => (
      <>
        Távolság: <b>{distance}</b> | Időtartam:{' '}
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
    fetchingError: ({ err }) =>
      addError(messages, 'Hiba történt az útvonaltervezésnél', err),
    manualTooltip: 'A következő szakasz összekötése egyenes vonallal',
  },

  mainMenu: {
    logOut: 'Kijelentkezés',
    logIn: 'Bejelentkezés',
    account: 'Fiók',
    mapFeaturesExport: 'Térképadatok exportja',
    mapExports: 'Térképek GPS-eszközökhöz',
    embedMap: 'Térkép beágyazása',
    supportUs: 'A Freemap támogatása',
    help: 'Információk és segítség',
    back: 'Vissza',
    mapLegend: 'Jelmagyarázat',
    contacts: 'Kapcsolat',
    facebook: 'Freemap a Facebookon',
    twitter: 'Freemap a Twitteren',
    youtube: 'Freemap a YouTubeon',
    github: 'Freemap a GitHubon',
    automaticLanguage: 'Automatikus',
    mapExport: 'Térkép exportja képként/dokumentumként',
    wikiLink: 'https://wiki.openstreetmap.org/wiki/Hu:Main_Page',
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
        prompt="Egyes funkciók sütiket igényelhetnek. Elfogadod:"
        local="Helyi beállítások és közösségi hálós bejelentkezés sütijei"
        analytics="Analitikus sütik"
      />
    ),
  },

  ad: {
    self: (email) => (
      <>
        Szeretnéd, ha a saját hirdetésed lenne itt? Ne habozz kapcsolatba lépni
        velünk a következő címen: {email}.
      </>
    ),
    rovas: () => (
      <RovasAd rovasDesc="economic program for volunteers">
        <b>Freemap is created by volunteers.</b>{' '}
        <span className="text-danger">Reward them for their work</span>, with
        your own volunteer work or with money.
      </RovasAd>
    ),
  },

  gallery: {
    stats: {},

    legend: 'Jelmagyarázat',
    filter: 'Szűrő',
    showPhotosFrom: 'Fényképek megtekintése',
    showLayer: 'Réteg megjelenítése',
    upload: 'Feltöltés',

    f: {
      '-createdAt': 'a legutóbb feltöltöttől',
      '-takenAt': 'a legutóbb készülttől',
      '-rating': 'a legjobbra értékelttől',
      '-lastCommentedAt': 'from last comment',
    },

    showDirection: 'Mutasd a fényképezés irányát',

    c: {
      disable: 'Ne színezd',
      mine: 'Különítsd el a sajátjaimat',
      userId: 'Szerző',
      rating: 'Értékelés',
      takenAt: 'Készítés dátuma',
      createdAt: 'Feltöltés dátuma',
      season: 'Évszak',
      premium: 'Prémium',
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
      premiumOnly:
        'Ezt a fényképet a szerzője csak prémium hozzáféréssel rendelkező felhasználók számára tette elérhetővé.',
      noComments: 'Nincs hozzászólás',
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
      azimuth: 'Azimut',
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
          <li>Azok a feliratok vagy megjegyzések, amelyek nem kapcsolódnak közvetlenül a feltöltött fotók tartalmához, vagy ellentmondanak a civilizált együttélés általánosan elfogadott elveinek, eltávolításra kerülnek. A szabály megsértőit figyelmeztetjük, ismételt megsértése esetén az alkalmazásban lévő fiókjukat törölhetjük.</li>
          <li>A fényképek feltöltésével hozzájárul, hogy azokat a CC BY-SA 4.0 licenc alapján terjesszék.</li>
          <li>Az üzemeltető (Freemap.sk) minden kötelezettséget elhárít, és nem vállal felelősséget a fénykép galériában történő közzétételéből eredő közvetlen vagy közvetett károkért. A fényképért teljes mértékben az azt a kiszolgálóra feltöltő személy felel.</li>
          <li>Az üzemeltető fenntartja a jogot, hogy a fénykép leírását, nevét, pozíciójáőt és címkéit szerkesszt, illetve hogy a fényképet törölje, ha annak tartalma nem megfelelő (megszegi ezeket a szabályokat).</li>
          <li>Az üzemeltető fenntartja a jogot, hogy törölje azt a fiókot, amelynek felhasználója nem megfelelő tartalom közzétételével ismételten megsérti a galéria szabályzatát.</li>
        </ul>
      `,
      success: 'A képek sikeresen fel lettek töltve.',
      showPreview:
        'Előnézet automatikus megjelenítése (több processzorteljesítményt és memóriát használ)',
      premium:
        'Csak teljes hozzáféréssel rendelkező felhasználók számára elérhető',
      loadPreview: 'Előnézet betöltése',
    },

    locationPicking: {
      title: 'Fénykép helyének kijelölése',
    },

    deletingError: ({ err }) =>
      addError(messages, 'Hiba történt a fénykép törlésénél', err),

    tagsFetchingError: ({ err }) =>
      addError(messages, 'Hiba történt a címkék beolvasásánál', err),

    pictureFetchingError: ({ err }) =>
      addError(messages, 'Hiba történt a fénykép beolvasásánál', err),

    picturesFetchingError: ({ err }) =>
      addError(messages, 'Hiba történt a fényképek beolvasásánál', err),

    savingError: ({ err }) =>
      addError(messages, 'Hiba történt a fénykép mentésénél', err),

    commentAddingError: ({ err }) =>
      addError(messages, 'Hiba történt a hozzászólás hozzáadásánál', err),

    ratingError: ({ err }) =>
      addError(messages, 'Hiba történt a fénykép értékelésénél', err),

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
      pano: 'Panoráma',
      premium: 'Prémium',
    },

    allMyPhotos: {
      premium: 'Minden fotóm felvétele a prémium tartalomba',
      free: 'Minden fotóm elérhetővé tétele mindenki számára',
    },

    recentTags: 'Legutóbbi címkék hozzárendeléshez:',
    colorizeBy: 'Színezés ez alapján',
    noPicturesFound: 'Ezen a helyen nem találhatók fotók.',
    linkToWww: 'fotó a www.freemap.sk oldalon',
    linkToImage: 'fotófájl',
    showLegend: 'Színezési jelmagyarázat megjelenítése',
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
    shareToast:
      'Az útvonal el lett mentve a kiszolgálóra, és az oldal URL-jének másolásával megosztható.',
    fetchingError: ({ err }) =>
      addError(
        messages,
        'Hiba történt a nyomvonal adatainak beolvasásakor',
        err,
      ),
    savingError: ({ err }) =>
      addError(messages, 'Hiba történt a nyomvonal mentésekor', err),
    loadingError: 'Hiba történt a fájl betöltésekor.',
    onlyOne: 'Csak egyetlen GPX-fájl tölthető be.',
    wrongFormat: 'A fájlnak GPX kiterjesztésűnek kell lennie.',
    info: () => <TrackViewerDetails />,
    tooBigError: 'Túl nagy a fájl.',
  },

  drawing: {
    modify: 'Tulajdonságok',
    edit: {
      title: 'Tulajdonságok',
      color: 'Szín',
      label: 'Felirat',
      width: 'Szélesség',
      hint: 'A felirat eltávolításához hagyja üresen ezt a mezőt.',
      type: 'Geometria típusa',
    },
    continue: 'Folytatás',
    join: 'Összekapcsolás',
    split: 'Felosztás',
    stopDrawing: 'Rajzolás befejezése',
    selectPointToJoin: 'Válasszon pontot a vonalak összekapcsolásához',
    defProps: {
      menuItem: 'Stílusbeállítások',
      title: 'Rajzolási stílus beállításai',
      applyToAll: 'Mentés és alkalmazás mindegyikre',
    },

    projection: {
      projectPoint: 'Pont vetítése',
      distance: 'Távolság',
      azimuth: 'Azimut',
    },
  },

  purchases: {
    purchases: 'Vásárlások',
    premiumExpired: (at) => <>A prémium hozzáférésed lejárt ekkor: {at}</>,
    date: 'Dátum',
    item: 'Tétel',
    notPremiumYet: 'Még nincs prémium hozzáférésed.',
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
    },
    general: {
      tips: 'Megnyitáskor jelenjenek meg tippek (csak szolvák és cseh nyelvnél)',
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

  changesets: {
    allAuthors: 'Minden szerző',
    tooBig:
      'A változáskérések túl sok elemet adhatnak vissza. Kérlek, nagyíts rá, válassz kevesebb napot, vagy adj meg egy konkrét szerzőt.',

    olderThan: ({ days }) => `${days} nap`,
    olderThanFull: ({ days }) => `Az elmúlt ${days} nap módosításkészletei`,
    notFound: 'Nincs módosításkészlet.',
    fetchError: ({ err }) =>
      addError(
        messages,
        'Hiba történt a módosításkészletek beolvasásánál',
        err,
      ),
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
  },

  objects: {
    type: 'Típus',

    lowZoomAlert: {
      message: ({ minZoom }) =>
        `Ahhoz, hogy az objektumok típusok szerint látsszanak, legalább a ${minZoom}. szintre kell nagyítani.`,
      zoom: 'Nagyítás',
    },

    fetchingError: ({ err }) =>
      addError(
        messages,
        'Hiba történt az objektumok (POI-k) beolvasásánál',
        err,
      ),

    icon: {
      pin: 'Tű',
      ring: 'Gyűrű',
      square: 'Négyzet',
    },

    tooManyPoints: ({ limit }) =>
      `Az eredmény ${limit} objektumra lett korlátozva.`,
  },

  external: {
    openInExternal: 'Megosztás / megnyitás külső alkalmazásban',
    osm: 'OpenStreetMap',
    oma: 'OMA',
    googleMaps: 'Google térkép',
    hiking_sk: 'hiking.sk',
    zbgis: 'ZBGIS',
    mapy_cz: 'mapy.com',
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
    fetchingError: ({ err }) => addError(messages, 'Keresési hiba', err),
    buttonTitle: 'Keresés',
    placeholder: 'Keresés a térképen',
    result: 'Találat',
    sources: {
      'nominatim-reverse': 'Fordított geokódolás',
      'overpass-nearby': 'Közeli objektumok',
      'overpass-surrounding': 'Tartalmazó objektumok',
    },
  },

  embed: {
    code: 'A következő kódot írja be HTML-oldalába:',
    example: 'Az eredmény így fog kinézni:',
    dimensions: 'Méretek',
    height: 'Magasság',
    width: 'Szélesség',
    enableFeatures: 'Funkciók engedélyezése',
    enableSearch: 'keresés',
    enableMapSwitch: 'térképréteg-kapcsoló',
    enableLocateMe: 'saját hely megtalálása',
  },

  documents: {
    errorLoading: 'Hiba történt a dokumentum betöltésekor.',
  },

  exportMapFeatures: {
    download: 'Letöltés',
    exportError: ({ err }) => addError(messages, 'Hiba a exportálásakor', err),

    what: {
      plannedRoute: 'útvonal',
      plannedRouteWithStops: 'megállásokkal',
      objects: 'érdekes pontok (POI-k)',
      pictures: 'fényképek (a látható térképterületen)',
      drawingLines: 'rajzolás - vonalak',
      drawingAreas: 'rajzolás - sokszögek',
      drawingPoints: 'rajzolás - pontok',
      tracking: 'élő nyomkövetés',
      gpx: 'GPX-nyomvonal',
      search: 'kiemelt térképelem',
    },

    disabledAlert:
      'Csak az a jelölőnégyzet jelölhető be exportálásra, amelyhez a térképen tartozik tartalom.',

    licenseAlert:
      'Különféle licencek vonatkozhatnak - például az OpenStreetMap. Kérjük, adja hozzá a hiányzó forrásokat az exportált fájl megosztásakor.',

    exportedToDropbox: 'Fájl elmentve a Dropboxba.',
    exportedToGdrive: 'Fájl elmentve a Google Drive-ra.',

    garmin: {
      courseName: 'Tanfolyam neve',
      description: 'Leírás',
      activityType: 'Tevékenység típusa',
      at: {
        running: 'Futás',
        hiking: 'Túrázás',
        other: 'Egyéb',
        mountain_biking: 'Hegyi kerékpározás',
        trailRunning: 'Terepfutás',
        roadCycling: 'Országúti kerékpározás',
        gravelCycling: 'Murvás kerékpározás',
      },
      revoked: 'A kurzus Garmin-ba való exportálása vissza lett vonva.',
      connectPrompt:
        'Még nincs csatlakoztatva Garmin fiókod. Szeretné most csatlakoztatni?',
      authPrompt:
        'Még nem vagy bejelentkezve a Garminonba. Szeretnél ez alkalommal bejelentkezni?',
    },
    format: 'Formátum',
    target: 'Cél',
  },

  auth: {
    provider: {
      facebook: 'Facebook',
      google: 'Google',
      osm: 'OpenStreetMap',
      garmin: 'Garmin',
    },
    connect: {
      label: 'Csatlakozás',
      success: 'Csatlakoztatva',
    },
    disconnect: {
      label: 'Kapcsolat bontása',
      success: 'Lecsatlakoztatva',
    },
    logIn: {
      with: 'Válasszon bejelentkezési szolgáltatót',
      success: 'Sikeresen bejelentkezett.',
      logInError: ({ err }) =>
        addError(messages, 'Hiba történt a bejelentkezésnél', err),
      logInError2: 'Hiba történt a bejelentkezésnél.',
      verifyError: ({ err }) =>
        addError(messages, 'Hiba történt a hitelesítés ellenőrzésénél', err),
    },
    logOut: {
      success: 'Sikeresen kijelentkezett.',
      error: ({ err }) =>
        addError(messages, 'Hiba történt a kijelentkezésnél', err),
    },
  },

  mapLayers: {
    layers: 'Térképrétegek',
    photoFilterWarning: 'A fényképszűrés aktív',
    minZoomWarning: (minZoom) => `A ${minZoom} nagyítási szinttől látható`,

    letters: {
      A: 'Autó',
      T: 'Túrázás',
      C: 'Kerékpározás',
      K: 'Síelés',
      S: 'Légifelvétel',
      Z: 'Légifelvétel',
      J1: 'Ortofotomozaika SR (1. ciklus)',
      J2: 'Ortofotomozaika SR (2. ciklus)',
      O: 'OpenStreetMap',
      d: 'Tömegközlekedés',
      X: outdoorMap,
      i: 'Adatréteg',
      I: 'Fényképek',
      l1: 'Erdészeti utak NLC (2017)',
      l2: 'Erdészeti utak NLC',
      t: 'Turistautak',
      c: 'Kerékpáros útvonalak',
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
    settings: 'Térkép beállítások',
    switch: 'Térképek',
    interactiveLayerWarning: 'Az adatréteg rejtve van',
    customBase: 'Egyéni térkép',
    customMaps: 'Egyéni térképek',
    base: 'Alaprétegek',
    overlay: 'Fedőrétegek',
    url: 'URL sablon',
    minZoom: 'Minimális nagyítás',
    maxNativeZoom: 'Maximális natív nagyítás',
    extraScales: 'Extra felbontások',
    scaleWithDpi: 'Méretezés DPI alapján',
    zIndex: 'Z-index',
    generalSettings: 'Általános beállítások',
    maxZoom: 'Maximális nagyítás',
    layer: {
      layer: 'Réteg',
      base: 'Alap',
      overlay: 'Átfedő',
    },
    showMore: 'További térképek megjelenítése',
    countryWarning: (countries) =>
      `Csak a következő országokat fedi le: ${countries.join(', ')}`,
    layerSettings: 'Térképrétegek',
    technologies: {
      tile: 'Képcsempék (TMS, XYZ)',
      maplibre: 'Vektor (MapLibre)',
      wms: 'WMS',
      parametricShading: 'Paraméteres árnyékolás',
    },
    technology: 'Típus',
    loadWmsLayers: 'Rétegek betöltése',
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

  osm: {
    fetchingError: ({ err }) =>
      addError(messages, 'Hiba történt az OSM-adatok lekérésénél', err),
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
        'Figyelem, az eszközök listája csak az oldal URL-jében jelenik meg. Ha el szeretnéd menteni, használd a „Saját térképek” funkciót.',
    },
    accessToken: {
      token: 'Figyelőkód',
      timeFrom: 'Ettől',
      timeTo: 'Eddig',
      listingLabel: 'Felsorolási felirat',
      note: 'Megjegyzés',
      delete: 'Törlöd a hozzáférési tokent?',
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
  mapExport: {
    exportError: ({ err }) =>
      addError(messages, 'Hiba történt a térkép exportálásakor', err),

    exporting: 'Kérjük várjon, a térkép exportálása folyamatban van…',

    exported: ({ url }) => (
      <>
        A térkép exportálása befelyeződött.{' '}
        <AlertLink href={url} target="_blank">
          Open.
        </AlertLink>
      </>
    ),
    area: 'Exportálandó terület',
    areas: {
      visible: 'A térkép látható területe',
      pinned: 'A kijelölt sokszöget (rajzot) tartalmazó terület',
    },
    format: 'Formátum',
    layersTitle: 'Választható rétegek',
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
    mapScale: 'Térkép felbontása',
    alert: (licence) => (
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
            <em>{licence}</em>
          </li>
        </ul>{' '}
      </>
    ),
    advancedSettings: 'Speciális beállítások',
    styles: 'Az adatréteg stílusai',
  },

  maps: {
    noMapFound: 'Nem található térkép',
    save: 'Mentés',
    delete: 'Törlés',
    deleteConfirm: (name) => `Biztosan törli ezt a térképet? ${name}`,

    fetchError: ({ err }) =>
      addError(messages, 'Hiba történt a térkép betöltéskor', err),

    fetchListError: ({ err }) =>
      addError(messages, 'Hiba történt a térképek betöltéskor', err),

    deleteError: ({ err }) =>
      addError(messages, 'Hiba történt a térkép törlésekor', err),

    renameError: ({ err }) =>
      addError(messages, 'Hiba történt a térkép átnevezésekor', err),

    createError: ({ err }) =>
      addError(messages, 'Hiba történt a térkép mentésekor', err),

    saveError: ({ err }) =>
      addError(messages, 'Hiba történt a térkép mentésekor', err),

    legacy: 'elavult',
    legacyMapWarning: ({ from, to }) => (
      <>
        A megjelenített térkép <b>{messages.mapLayers.letters[from]}</b>{' '}
        elavult. Átváltasz a modern <b>{messages.mapLayers.letters[to]}</b>?
      </>
    ),
    disconnect: 'Leválasztás',
    loadToEmpty: 'Betöltés üres térképre',
    loadInclMapAndPosition:
      'Betöltés a mentett alaptérképpel és annak pozíciójával együtt',
    savedMaps: 'Mentett térképek',
    newMap: 'Új térkép',
    SomeMap: ({ name }) => (
      <>
        Térkép <i>{name}</i>
      </>
    ),
    writers: 'Szerkesztők',
    conflictError: 'A térképet időközben módosították.',
    addWriter: 'Szerkesztő hozzáadása',
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

  legend: {
    body: ({ name }) => (
      <>
        Jelmagyarázat: <i>{name}</i>
      </>
    ),
    outdoorMap: {
      accommodation: 'Szállás',
      'gastro-poi': 'Étel és ital',
      institution: 'Intézmények',
      sport: 'Sport',
      'natural-poi': 'Természeti látnivalók',
      poi: 'Egyéb látnivalók',
      landcover: 'Felszínborítás',
      borders: 'Határok',
      'roads-and-paths': 'Utak és ösvények',
      railway: 'Vasút',
      terrain: 'Domborzat',
      water: 'Víz',
      other: 'Egyéb',
    },
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
            title="Strava Heatmap, Szlovákia és Csehország nagy felbontású részletes domborzatárnyékolása, az Outdoor Map túratérkép legnagyobb nagyítási szintjei, Szlovákia és Csehország ortofotóinak legnagyobb nagyítási szintjei, különféle WMS-alapú térképek"
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
  },

  credits: {
    buyCredits: 'Kredit vásárlása',
    amount: 'Kreditek',
    credits: 'kredit',
    buy: 'Vásárlás',
    purchase: {
      success: ({ amount }) => (
        <>A kreditje {nf00.format(amount)} összeggel növekedett.</>
      ),
    },
    youHaveCredits: (amount, explainCredits) => (
      <>
        Van {amount}{' '}
        {explainCredits ? (
          <CreditsText
            credits="kreditjeid"
            help="A krediteket felhasználhatod [offline térképek exportjára]."
          />
        ) : (
          'kredited'
        )}
        .
      </>
    ),
  },

  offline: {
    offlineMode: 'Offline mód',
    cachingActive: 'Aktív gyorsítótárazás',
    clearCache: 'Gyorsítótár törlése',
    dataSource: 'Adatforrás',
    networkOnly: 'Csak hálózat',
    networkFirst: 'Először hálózat',
    cacheFirst: 'Először gyorsítótár',
    cacheOnly: 'Csak gyorsítótár',
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
  downloadMap: {
    downloadMap: 'Offline térképek exportja',
    format: 'Formátum',
    map: 'Térkép',
    downloadArea: 'Exportálni',
    area: {
      visible: 'Látható terület',
      byPolygon: 'A kijelölt sokszöggel lefedett terület',
    },
    name: 'Név',
    zoomRange: 'Nagyítási tartomány',
    scale: 'Lépték',
    email: 'E-mail címed',
    emailInfo:
      'Az e-mail címedet a letöltési hivatkozás elküldésére használjuk.',
    success:
      'A térkép előkészítése folyamatban van. A letöltési hivatkozást e-mailben kapja meg, miután elkészült.',
    summaryTiles: 'Csempe',
    summaryPrice: (amount) => <>Teljes ár: {amount} kredit</>,
  },
};

export default messages;
