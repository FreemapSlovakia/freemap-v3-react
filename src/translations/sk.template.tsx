import { AreaInfo } from '@app/components/AreaInfo.js';
import { DistanceInfo } from '@app/components/DistanceInfo.js';
import { MaptilerAttribution } from '@app/components/MaptilerAttribution.js';
import { RovasAd } from '@features/ad/components/RovasAd.js';
import { ChangesetDetails } from '@features/changesets/components/ChangesetDetails.js';
import { CookieConsent } from '@features/cookieConsent/components/CookieConsent.js';
import { CreditsText } from '@features/credits/components/CreditsText.js';
import { documentShow } from '@features/documents/model/actions.js';
import { ElevationInfo } from '@features/elevationChart/components/ElevationInfo.js';
import { ObjectDetails } from '@features/objects/components/ObjectDetails.js';
import { TrackViewerDetails } from '@features/trackViewer/components/TrackViewerDetails.js';
import { Attribution } from '@shared/components/Attribution.js';
import { Emoji } from '@shared/components/Emoji.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { AlertLink } from 'react-bootstrap';
import { FaKey } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
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
  Chybu môžeš nahlásiť ${
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
    noCookies: 'Táto funkcionalita vyžaduje prijatie súhlasu cookies.',
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
    areYouSure: 'Ste si istý/á?',
    export: 'Exportovať',
    success: 'Hotovo!',
    expiration: 'Exspirácia',
    privacyPolicy: 'Zásady ochrany osobných údajov',
    newOptionText: 'Pridať %value%',
    deleteButtonText: 'Odobrať %value% zo zoznamu',
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
    trackViewer: 'Prehliadač trás (GPX)',
    changesets: 'Zmeny v mape',
    mapDetails: 'Detaily v mape',
    tracking: 'Sledovanie',
    maps: 'Moje mapy',
  },

  routePlanner: {
    default: 'Predvolený',
    leg: 'Úsek trasy',
    manualTooltip: 'Prepoj nasledujúci segment priamou čiarou',
    ghParams: {
      tripParameters: 'Parametre výletu',
      seed: 'Random seed',
      distance: 'Orientačná vzdialenosť',
      isochroneParameters: 'Parametre izochrónov',
      buckets: 'Počet delení',
      timeLimit: 'Časový limit',
      distanceLimit: 'Limit vzdialenosti',
    },
    milestones: 'Kilometrovník',
    start: 'Štart',
    finish: 'Cieľ',
    stop: 'Zasávka',
    swap: 'Prehodiť štart a cieľ',
    point: {
      point: 'Bod trasy',
      pick: 'Vybrať na mape',
      current: 'Tvoja poloha',
      home: 'Domov',
    },
    transportType: {
      car: 'Auto',
      car4wd: 'Auto 4x4',
      bike: 'Bicykel',
      foot: 'Pešo',
      hiking: 'Turistika',
      mtb: 'Horský bicykel',
      racingbike: 'Cestný bicykel',
      motorcycle: 'Motocykel',
      manual: 'Priama čiara',
    },
    development: 'vo vývoji',
    mode: {
      route: 'V určenom poradí',
      trip: 'Návšteva miest',
      roundtrip: 'Návšteva miest (okruh)',
      'routndtrip-gh': 'Výlet',
      isochrone: 'Izochróny',
    },
    alternative: 'Alternatíva',
    distance: ({ value, diff }) => (
      <>
        Vzdialenosť:{' '}
        <b>
          {value}
          {diff ? ` (+ ${diff})` : ''}
        </b>
      </>
    ),
    duration: ({ h, m, diff }) => (
      <>
        Trvanie:{' '}
        <b>
          {h} h {m} m{diff && ` (+ ${diff.h} h ${diff.m} m)`}
        </b>
      </>
    ),
    summary: ({ distance, h, m }) => (
      <>
        Vzdialenosť: <b>{distance}</b> | Trvanie:{' '}
        <b>
          {h} h {m} m
        </b>
      </>
    ),
    noHomeAlert: {
      msg: 'Najprv si musíte nastaviť domovskú polohu.',
      setHome: 'Nastaviť',
    },
    showMidpointHint:
      'Pre pridanie prechodného bodu potiahnite úsek cesty na zvolené miesto.',
    gpsError: 'Nepodarilo sa získať aktuálnu polohu.',
    routeNotFound:
      'Cez zvolené body sa nepodarilo vyhľadať trasu. Skúste zmeniť parametre alebo posunúť body trasy.',
    fetchingError: ({ err }) =>
      addError(messages, 'Nastala chyba pri hľadaní trasy', err),
  },

  mainMenu: {
    title: 'Hlavné menu',
    logOut: 'Odhlásiť',
    logIn: 'Prihlásenie',
    account: 'Účet',
    mapFeaturesExport: 'Export mapových dát',
    mapExports: 'Mapy pre GPS zariadenia',
    embedMap: 'Vložiť do webstránky',
    supportUs: 'Podporiť Freemap',
    help: 'Info a pomoc',
    back: 'Naspäť',
    mapLegend: 'Legenda mapy',
    contacts: 'Kontakty',
    facebook: 'Freemap na Facebooku',
    twitter: 'Freemap na Twitteri',
    youtube: 'Freemap na YouTube',
    github: 'Freemap na GitHub-e',
    automaticLanguage: 'Automaticky',
    mapExport: 'Export mapy do obrázka/dokumentu',
    osmWiki: 'Dokumentačný projekt OpenStreetMap',
    wikiLink: 'https://wiki.openstreetmap.org/wiki/Sk:WikiProjekt_Slovensko',
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
        prompt="Niektoré funkcie môžu vyžadovať cookies. Prijať:"
        local="Cookies lokálnych nastavení a prihlásenia pomocou sociálnych sietí"
        analytics="Analytické cookies"
      />
    ),
    infoBars: {
      dp: () => {
        const dispatch = useDispatch();
        return (
          <>
            <span className="d-sm-none">Podporte prevádzku freemap.sk cez</span>
            <span className="d-none d-sm-inline d-xl-none">
              Podporte prevádzku freemap.sk cez
            </span>
            <span className="d-none d-xl-inline">
              Podporte prevádzku freemap.sk cez
            </span>{' '}
            <AlertLink
              href="/#document=dvePercenta"
              onClick={(e) => {
                e.preventDefault();
                dispatch(documentShow('dvePercenta'));
              }}
            >
              2% z vašej dane
            </AlertLink>
            .
          </>
        );
      },
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
    rovas: () => (
      <RovasAd rovasDesc="ekonomický softvér pre dobrovoľnikov">
        <b>Freemap je tvorený dobrovoľníkmi.</b>{' '}
        <span className="text-danger">Odmeňte ich za ich prácu</span>, vašou
        vlastnou dobrovoľníckou prácou alebo peniazmi.
      </RovasAd>
    ),
  },

  gallery: {
    stats: {
      leaderboard: 'Rebríček',
      country: 'Krajina',
      perUserPerCountry: 'Fotky na autora na krajinu',
      perUser: 'Fotky na autora',
      more: 'Viac',
      less: 'Menej',
      user: 'Autor',
      photos: 'Fotiek',
      numberOfPhotos: 'Počet fotiek',
      timePeriod: 'Časové obdobie',
      allTime: 'Celý čas',
      last3months: 'Posledné 3 mesiace',
      last30days: 'Posledných 30 dní',
    },
    legend: 'Legenda',
    recentTags: 'Nedávne tagy na priradenie:',
    filter: 'Filter',
    showPhotosFrom: 'Prezerať fotky',
    showLayer: 'Zobraziť vrstvu',
    upload: 'Nahrať',
    f: {
      '-createdAt': 'od poslednej nahranej',
      '-takenAt': 'od najnovšie odfotenej',
      '-rating': 'od najvyššieho hodnotenia',
      '-lastCommentedAt': 'od posledného komentára',
    },
    colorizeBy: 'Vyfarbiť podľa',
    showDirection: 'Zobraziť smer fotenia',
    c: {
      disable: 'Nevyfarbiť',
      mine: 'Odlíšiť moje',
      userId: 'Autor',
      rating: 'Hodnotenie',
      takenAt: 'Dátum odfotenia',
      createdAt: 'Dátum nahrania',
      season: 'Ročné obdobe',
      premium: 'Prémiové',
    },
    viewer: {
      title: 'Fotografia',
      comments: 'Komentáre',
      newComment: 'Nový komentár',
      addComment: 'Pridať',
      yourRating: 'Tvoje hodnotenie:',
      showOnTheMap: 'Ukázať na mape',
      openInNewWindow: 'Otvoriť v…',
      uploaded: ({ username, createdAt }) => (
        <>
          Nahral {username} dňa {createdAt}
        </>
      ),
      captured: (takenAt) => <>Odfotené dňa {takenAt}</>,
      deletePrompt: 'Zmazať obrázok?',
      modify: 'Úprava',
      premiumOnly:
        'Túto fotografiu sprístupnil jej autor len používateľom s prémiovým prístupom.',
      noComments: 'Bez komentára',
    },
    editForm: {
      name: 'Názov',
      description: 'Popis',
      takenAt: {
        datetime: 'Dátum a čas fotenia',
        date: 'Dátum fotenia',
        time: 'Čas fotenia',
      },
      location: 'Pozícia',
      azimuth: 'Azimut',
      tags: 'Tagy',
      setLocation: 'Nastaviť pozíciu',
    },
    uploadModal: {
      title: 'Nahrať fotky',
      uploading: (n) => `Nahrávam (${n})`,
      upload: 'Nahrať',
      rules: `
        <p>Potiahnite sem fotky alebo kliknite sem pre ich výber.</p>
        <ul>
          <li>Nevkladajte príliš malé obrázky (miniatúry). Maximálny rozmer nie je obmedzený, je však obmedzená veľkosť súboru na max. 10 MB. Väčšie súbory server odmietne.</li>
          <li>Vkladajte len fotografie krajiny, vrátane dokumentačných fotografií. Portréty a makro-fotografie sú považované za nevhodný obsah a budú bez varovania odstránené.</li>
          <li>Nahrávajte len vlastné fotografie, alebo fotografie, pre ktoré máte udelený súhlas na zdieľanie.</li>
          <li>Popisky, alebo komentáre, ktoré sa priamo netýkajú obsahu načítaných fotografií, alebo odporujú všeobecne prijímaným zásadám civilizovaného spolužitia, budú odstránené. Porušovatelia tohoto pravidla budú varovaní a pri opakovanom porušovaní môže byť ich účet v aplikácii zrušený.</li>
          <li>Nahraté fotografie sú ďalej šírené pod licenciou CC BY-SA 4.0.</li>
          <li>Prevádzkovateľ Freemap.sk sa týmto zbavuje akejkoľvek zodpovednosti a nezodpovedá za priame ani nepriame škody vzniknuté uverejnením fotografie v galérii, za fotografiu nesie plnú zodpovednosť osoba, ktorá fotografiu na server uložila.</li>
          <li>Prevádzkovateľ si vyhradzuje právo upraviť popis, názov, pozíciu a tagy fotografie, alebo fotografiu odstrániť, ak je jej obsah nevhodný (porušuje tieto pravidlá).</li>
          <li>Prevádzkovateľ si vyhradzuje právo zrušiť konto v prípade, že používateľ opakovane porušuje pravidlá galérie uverejňovaním nevhodného obsahu.</li>
        </ul>
      `,
      success: 'Fotografie boli úspešne nahrané.',
      showPreview:
        'Automaticky zobraziť náhľady (náročnejšie na výkon a pamäť)',
      loadPreview: 'Načítať náhľad',
      premium: 'Sprístupniť len používateľom s prémiovým prístupom',
    },
    locationPicking: {
      title: 'Zvoľte pozíciu fotografie',
    },
    deletingError: ({ err }) =>
      addError(messages, 'Nastala chyba pri mazaní obrázka', err),
    tagsFetchingError: ({ err }) =>
      addError(messages, 'Nastala chyba pri načítavaní tagov', err),
    pictureFetchingError: ({ err }) =>
      addError(messages, 'Nastala chyba pri načítavaní fotky', err),
    picturesFetchingError: ({ err }) =>
      addError(messages, 'Nastala chyba pri načítavaní fotiek', err),
    savingError: ({ err }) =>
      addError(messages, 'Nastala chyba pri ukladaní fotky', err),
    commentAddingError: ({ err }) =>
      addError(messages, 'Nastala chyba pri pridávaní komentára', err),
    ratingError: ({ err }) =>
      addError(messages, 'Nastala chyba pri hodnotení', err),
    missingPositionError: 'Chýba pozícia.',
    invalidPositionError: 'Nesprávny formát súradníc.',
    invalidTakenAt: 'Neplatný dátum a čas fotenia.',
    filterModal: {
      title: 'Filter fotografií',
      tag: 'Tag',
      createdAt: 'Dátum nahratia',
      takenAt: 'Dátum fotenia',
      author: 'Autor',
      rating: 'Hodnotenie',
      noTags: 'bez tagov',
      pano: 'Panoráma',
      premium: 'Prémiové',
    },
    noPicturesFound: 'Na tomto mieste neboli nájdené žiadne fotky.',
    linkToWww: 'fotografia na www.freemap.sk',
    linkToImage: 'súbor fotografie',
    allMyPhotos: {
      premium: 'Zaradiť všetky moje fotky do prémiového obsahu',
      free: 'Sprístupniť všetky moje fotky každému',
    },
    showLegend: 'Zobraziť legendu vyfarbenia',
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
    upload: 'Nahrať',
    moreInfo: 'Viac info',
    share: 'Uložiť na server',
    colorizingMode: {
      none: 'Neaktívne',
      elevation: 'Nadmorská výška',
      steepness: 'Sklon',
    },
    details: {
      startTime: 'Čas štartu',
      finishTime: 'Čas v cieli',
      duration: 'Trvanie',
      distance: 'Vzdialenosť',
      avgSpeed: 'Priemerná rýchlosť',
      minEle: 'Najnižší bod',
      maxEle: 'Najvyšší bod',
      uphill: 'Celkové stúpanie',
      downhill: 'Celkové klesanie',
      durationValue: ({ h, m }) => `${h} hodín ${m} minút`,
    },
    uploadModal: {
      title: 'Nahrať trasu',
      drop: 'Potiahnite sem .gpx súbor alebo kliknite sem pre jeho výber.',
    },
    shareToast:
      'Trasa bola uložená na server a môžete ju zdieľať skopirovaním URL stránky.',
    fetchingError: ({ err }) =>
      addError(messages, 'Nastala chyba pri získavaní záznamu trasy', err),
    savingError: ({ err }) =>
      addError(messages, 'Nepodarilo sa uložiť trasu', err),
    loadingError: 'Súbor sa nepodarilo načítať.',
    onlyOne: 'Očakáva sa iba jeden GPX súbor.',
    wrongFormat: 'Nahraný súbor musí mať príponu .gpx',
    info: () => <TrackViewerDetails />,
    tooBigError: 'Nahraný súbor je príliš veľký.',
  },

  drawing: {
    modify: 'Vlastnosti',
    edit: {
      title: 'Vlastnosti',
      color: 'Farba',
      label: 'Popis',
      width: 'Šírka',
      hint: 'Ak chcete popis odstrániť, nechajte pole popisu prázdne.',
      type: 'Typ geometrie',
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
  },

  purchases: {
    purchases: 'Nákupy',
    premiumExpired: (at) => <>Váš prémiový prístup vypršal {at}</>,
    date: 'Dátum',
    item: 'Položka',
    notPremiumYet: 'Ešte nemáte prémiový prístup.',
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
      sendGalleryEmails: 'Upozorniť emailom na komentáre k fotkám',
      delete: 'Zmazať účet',
      deleteWarning:
        'Naozaj si prajete zmazať svoj účet? Spolu s ním sa odstránia všetky vaše fotografie, komentáre a hodnotenia fotografií, vlastné mapy a sledované zariadenia.',
      personalInfo: 'Osobné údaje',
      authProviders: 'Poskytovatelia prihlásenia',
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

  changesets: {
    allAuthors: 'Všetci autori',
    tooBig:
      'Požiadavka na získanie zmien môže vrátiť veľa záznamov. Skúste priblížiť mapu, zvoliť menej dní, alebo zadať konkrétneho autora.',
    olderThan: ({ days }) => `${days} dn${days === 3 ? 'i' : 'í'}`,
    olderThanFull: ({ days }) =>
      `Zmeny novšie ako ${days} dn${days === 3 ? 'i' : 'í'}`,
    notFound: 'Neboli nájdené žiadne zmeny.',
    fetchError: ({ err }) =>
      addError(messages, 'Nastala chyba pri získavaní zmien', err),
    detail: ({ changeset }) => <ChangesetDetails changeset={changeset} />,
    details: {
      author: 'Autor:',
      description: 'Popis:',
      noDescription: 'bez popisu',
      closedAt: 'Čas:',
      moreDetailsOn: ({ osmLink, achaviLink }) => (
        <p>
          Viac detailov na {osmLink}, alebo {achaviLink}.
        </p>
      ),
    },
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

  objects: {
    type: 'Typ',
    lowZoomAlert: {
      message: ({ minZoom }) =>
        `Vyhľadávanie miest je možné až od priblíženia úrovne ${minZoom}.`,
      zoom: 'Priblíž',
    },
    tooManyPoints: ({ limit }) =>
      `Výsledok bol obmedzený na ${limit} objektov.`,
    fetchingError: ({ err }) =>
      addError(messages, 'Nastala chyba pri získavaní objektov', err),
    icon: {
      pin: 'Špendlík',
      ring: 'Okrúhla',
      square: 'Štvorcová',
    },
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
    url: 'Zdieľať URL',
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
      'overpass-objects': 'Blízke prvky',
      'nominatim-forward': 'Geokódovanie',
      osm: 'OpenStreetMap',
      'wms:': 'WMS',
    },
  },

  embed: {
    code: 'Vložte na vašu stránku tento html kód:',
    example: 'Výsledok bude vyzerať nasledovne:',
    dimensions: 'Veľkosť',
    height: 'Výška',
    width: 'Šírka',
    enableFeatures: 'Povoliť funkcie',
    enableSearch: 'vyhľadávanie',
    enableMapSwitch: 'prepínanie vrstiev mapy',
    enableLocateMe: 'nájdenie vlastnej pozície',
  },

  documents: {
    errorLoading: 'Dokument sa nepodarilo načítať.',
  },

  exportMapFeatures: {
    download: 'Stiahnuť',
    format: 'Formát',
    target: 'Cieľ',
    exportError: ({ err }) => addError(messages, 'Chyba exportovania', err),
    what: {
      plannedRoute: 'vyhľadanú trasu',
      plannedRouteWithStops: 'so zastávkami',
      objects: 'objekty (POI)',
      pictures: 'fotografie (vo viditeľnej časti mapy)',
      drawingLines: 'kreslenie - čiary',
      drawingAreas: 'kreslenie - polygóny',
      drawingPoints: 'kreslenie - body',
      tracking: 'sledovanie',
      gpx: 'GPX trasu',
      search: 'zvýraznený prvok mapy',
    },
    disabledAlert:
      'Aktívne sú iba voľby, ktorých objekty sa nachádzajú na mape.',
    licenseAlert:
      'Exportovaný súbor môže podliehať rôznym licenciám, ako napríklad licencii OpenStreetMap. Prosím dodržte podmienky týchto licencií pri zdieľaní vyexportovaného súboru.',
    exportedToDropbox: 'Súbor bol uložený do Dropboxu.',
    exportedToGdrive: 'Súbor bol uložený do Google Drive.',
    garmin: {
      courseName: 'Názov kurzu',
      description: 'Popis',
      activityType: 'Typ aktivity',
      at: {
        running: 'Beh',
        hiking: 'Turistika',
        other: 'Iné',
        mountain_biking: 'Horská cyklistika',
        trailRunning: 'Trailový beh',
        roadCycling: 'Cestná cyklistika',
        gravelCycling: 'Štrková cyklistika',
      },
      revoked: 'Exportovanie kurzu do Garminu bolo zrušené.',
      connectPrompt:
        'Garmin účet ešte nemáte pripojený. Chcete ho pripojiť teraz?',
      authPrompt:
        'Nie ste ešte prihlásený Garminon. Prajete sa prihlásiť tetaz?',
    },
  },

  auth: {
    provider: {
      facebook: 'Facebook',
      google: 'Google',
      osm: 'OpenStreetMap',
      garmin: 'Garmin',
    },
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
    settings: 'Nastavenia máp',
    layers: 'Mapy',
    switch: 'Mapy',
    photoFilterWarning: 'Filter fotografií je aktívny',
    interactiveLayerWarning: 'Dátová vrstva je skrytá',
    minZoomWarning: (minZoom) => `Dostupné až od priblíženia ${minZoom}`,
    countryWarning: (countries) =>
      `Pokrýva len tieto krajiny: ${countries.join(', ')}`,
    letters: {
      A: 'Automapa',
      T: 'Turistická',
      C: 'Cyklomapa',
      K: 'Bežkárska',
      S: 'Letecká',
      Z: 'Letecká',
      J1: 'Ortofotomozaika SR (1. cyklus)',
      J2: 'Ortofotomozaika SR (2. cyklus)',
      O: 'OpenStreetMap',
      d: 'Verejná doprava (ÖPNV)',
      X: outdoorMap,
      i: 'Dátová vrstva',
      I: 'Fotografie',
      l1: 'Lesné cesty NLC (2017)',
      l2: 'Lesné cesty NLC',
      t: 'Turistické trasy',
      c: 'Cyklotrasy',
      s0: 'Strava (Všetko)',
      s1: 'Strava (Cyklojazdy)',
      s2: 'Strava (Beh)',
      s3: 'Strava (Vodné aktivity)',
      s4: 'Strava (Zimné aktivity)',
      w: 'Wikipedia',
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
    layerSettings: 'Mapové vrstvy',
    customMaps: 'Vlastné mapy',
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
    generalSettings: 'Všeobecné nastavenia',
    maxZoom: 'Maximálne priblíženie',
    layer: {
      layer: 'Vrstva',
      base: 'Základná',
      overlay: 'Prekryvná',
    },
    loadWmsLayers: 'Načítať vrstvy',
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
    trackedDevices: {
      button: 'Sledované zariadenia',
      modalTitle: 'Sledované zariadenia',
      desc: 'Tu môžete spravovať sledované zariadenia, aby ste videli pozíciu svojich priateľov.',
      modifyTitle: (name) => (
        <>
          Upraviť sledované zariadenie <i>{name}</i>
        </>
      ),
      createTitle: (name) => (
        <>
          Sledovať zariadenie <i>{name}</i>
        </>
      ),
      storageWarning:
        'Pozor, zoznam zariadení je premietnutý len do URL stránky. Ak si ho prajete uložiť, využite funkciu "Moje mapy".',
    },
    accessToken: {
      token: 'Token sledovania',
      timeFrom: 'Od',
      timeTo: 'Do',
      listingLabel: 'Popisok v zozname',
      note: 'Poznámka',
      delete: 'Zmazať token sledovania?',
    },
    accessTokens: {
      modalTitle: (deviceName) => (
        <>
          Tokeny sledovania pre <i>{deviceName}</i>
        </>
      ),
      desc: (deviceName) => (
        <>
          Zadefinujte tokeny sledovania, aby ste mohli zdieľať pozíciu vášho
          zariadenia <i>{deviceName}</i> s vašimi priateľmi.
        </>
      ),
      createTitle: (deviceName) => (
        <>
          Pridať token sledovania pre <i>{deviceName}</i>
        </>
      ),
      modifyTitle: ({ token, deviceName }) => (
        <>
          Upraviť token sledovania <i>{token}</i> pre <i>{deviceName}</i>
        </>
      ),
    },
    trackedDevice: {
      token: 'Token sledovania',
      label: 'Popisok',
      fromTime: 'Pozície od',
      maxAge: 'Najstaršia pozícia',
      maxCount: 'Maximálny počet pozícií',
      splitDistance: 'Vzdialenosť na rozdelenie',
      splitDuration: 'Pauza na rozdelenie',
      color: 'Farba',
      width: 'Šírka',
    },
    devices: {
      button: 'Moje zariadenia',
      modalTitle: 'Moje zariadenia',
      createTitle: 'Pridať zariadenie',
      watchTokens: 'Sledovacie tokeny',
      watchPrivately: 'Sledovať privátne',
      watch: 'Sledovať',
      delete: 'Odstrániť zariadenie?',
      modifyTitle: ({ name }) => (
        <>
          Upraviť zariadenie <i>{name}</i>
        </>
      ),
      desc: () => (
        <>
          <p>
            Tu môžete spravovať svoje zariadenia. Ostatní môžu sledovať ich
            pozíciu, ak k nim vytvoríte sledovacie tokeny, pomocou tlačidla{' '}
            <FaKey />.
          </p>
          <hr />
          <p>
            Do vášho trackera (napríklad{' '}
            <a href="https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking">
              Locus
            </a>{' '}
            alebo OsmAnd) vložte nasledujúcu URL:{' '}
            <code>
              {process.env['API_URL']}/tracking/track/<i>token</i>
            </code>{' '}
            kde <i>token</i> je vypísaný v tabuľke nižšie.
          </p>
          <p>
            Server podporuje HTTP <code>GET</code> alebo <code>POST</code> s URL
            parametrami:
          </p>
          <ul>
            <li>
              <code>lat</code> - zemepisná dĺžka v stupňoch (povinné)
            </li>
            <li>
              <code>lon</code> - zemepisná šírka v stupňoch (povinné)
            </li>
            <li>
              <code>time</code>, <code>timestamp</code> - dátum a čas
              parsovateľný JavaScript-om alebo Unixový čas v sekundách alebo
              milisekundách
            </li>
            <li>
              <code>alt</code>, <code>altitude</code> - nadmorská výška v
              metroch
            </li>
            <li>
              <code>speed</code> - rýchlosť v ㎧
            </li>
            <li>
              <code>speedKmh</code> - rýchlosť v km/h
            </li>
            <li>
              <code>acc</code> - presnosť v metroch
            </li>
            <li>
              <code>hdop</code> - horizontálna DOP
            </li>
            <li>
              <code>bearing</code> - smer v stupňoch
            </li>
            <li>
              <code>battery</code> - batéria v percentách
            </li>
            <li>
              <code>gsm_signal</code> - GSM signál v percentách
            </li>
            <li>
              <code>message</code> - správa (poznámka)
            </li>
          </ul>
          <hr />
          <p>
            V prípade trackera TK102B ho nakonfigurujte na adresu{' '}
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
      token: 'Token zaznamenávania',
      name: 'Názov',
      maxAge: 'Najstaršia pozícia',
      maxCount: 'Maximálny počet pozícií',
      generatedToken: 'bude vygenerovaný po uložení',
    },
    visual: {
      line: 'Spojnica',
      points: 'Pozície',
      'line+points': 'Spojnica + Pozície',
    },
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
  mapExport: {
    advancedSettings: 'Rozšírené nastavenia',
    styles: 'Štýly dátovej vrstvy',
    exportError: ({ err }) =>
      addError(messages, 'Chyba exportovania mapy', err),
    exporting: 'Prosím počkajte, mapa sa exportuje…',
    exported: ({ url }) => (
      <>
        Export mapy je dokončený.{' '}
        <AlertLink href={url} target="_blank">
          Otvoriť.
        </AlertLink>
      </>
    ),
    area: 'Exportovať oblasť',
    areas: {
      visible: 'Viditeľnú oblasť mapy',
      pinned: 'Plochu obsahujúcu označený polygón (kreslenie)',
    },
    format: 'Formát',
    layersTitle: 'Voliteľné vrstvy',
    layers: {
      contours: 'Vrstevnice',
      shading: 'Tieňovaný reliéf',
      hikingTrails: 'Turistické trasy',
      bicycleTrails: 'Cyklotrasy',
      skiTrails: 'Lyžiarske trasy',
      horseTrails: 'Jazdecké trasy',
      drawing: 'Kreslenie',
      plannedRoute: 'Vyhľadanú trasu',
      track: 'GPX trasu',
    },
    mapScale: 'Rozlíšenie mapy',
    alert: (licence) => (
      <>
        Upozornenia:
        <ul>
          <li>
            Exportuje sa mapa <i>{outdoorMap}</i>.
          </li>
          <li>Export mapy môže trvať aj desiatky sekúnd.</li>
          <li>
            Pri publikovaní mapy je nutné uviesť jej licenciu:
            <br />
            <em>{licence}</em>
          </li>
        </ul>
      </>
    ),
  },

  maps: {
    legacy: 'zastaralá',
    legacyMapWarning: ({ from, to }) => (
      <>
        Zobrazená mapa <b>{messages.mapLayers.letters[from]}</b> je zastaraná.
        Prepnúť na modernú <b>{messages.mapLayers.letters[to]}</b>?
      </>
    ),
    noMapFound: 'Žiadna mapa nenájdená',
    save: 'Uložiť',
    delete: 'Zmazať',
    disconnect: 'Odpojiť',
    disconnectAndClear: 'Odpojiť a vyčistiť',
    deleteConfirm: (name) => `Naozaj si prajete vymazať mapu ${name}?`,
    fetchError: ({ err }) =>
      addError(messages, 'Nastala chyba pri načítavaní mapy', err),
    fetchListError: ({ err }) =>
      addError(messages, 'Nastala chyba pri načítavaní máp', err),
    deleteError: ({ err }) =>
      addError(messages, 'Nastala chyba pri mazaní mapy', err),
    renameError: ({ err }) =>
      addError(messages, 'Nastala chyba pri premenovávaní mapy', err),
    createError: ({ err }) =>
      addError(messages, 'Nastala chyba pri ukladaní mapy', err),
    saveError: ({ err }) =>
      addError(messages, 'Nastala chyba pri ukladaní mapy', err),
    loadToEmpty: 'Načítať do čistej mapy',
    loadInclMapAndPosition:
      'Načítať vrátane uloženej podkladovej mapy a jej pozície',
    savedMaps: 'Uložené mapy',
    newMap: 'Nová mapa',
    SomeMap: ({ name }) => (
      <>
        Mapa <i>{name}</i>
      </>
    ),
    writers: 'Editori',
    addWriter: 'Pridať editora',
    conflictError: 'Mapa bola medzičasom modifikovaná.',
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

  legend: {
    body: ({ name }) => (
      <>
        Legenda k mape <i>{name}</i>
      </>
    ),

    outdoorMap: {
      accommodation: 'Ubytovanie',
      'gastro-poi': 'Gastronómia',
      institution: 'Inštitúcie',
      sport: 'Šport',
      'natural-poi': 'Prírodné prvky',
      poi: 'Ostatné body záujmu',
      landcover: 'Krajinný pokryv',
      water: 'Voda',
      'roads-and-paths': 'Cesty a chodníky',
      railway: 'Železnice',
      terrain: 'Reliéf',
      borders: 'Hranice',
      other: 'Ostatné',
    },
  },

  contacts: {
    ngo: 'Občianske združenie',
    registered: 'Registrované na MV/VVS/1-900/90-34343 dňa 2. 10. 2009',
    bankAccount: 'Bankové spojenie',
    generalContact: 'Všeobecné kontakty',
    board: 'Predstavenstvo',
    boardMemebers: 'Členovia predstavenstva',
    president: 'Predseda',
    vicepresident: 'Podpredseda',
    secretary: 'Tajomník',
  },

  premium: {
    title: 'Získať prémiový prístup',
    commonHeader: (
      <>
        <p>
          <strong>Podporte dobrovoľníkov vytvárajúcich túto mapu!</strong>
        </p>
        <p className="mb-1">
          Za <b>8 hodín</b> vašej{' '}
          <a
            href="https://rovas.app/freemap-web"
            target="_blank"
            rel="noopener noreferrer"
          >
            dobrovoľníckej práce
          </a>{' '}
          alebo <b>8 €</b> získate na rok:
        </p>
        <ul>
          <li>odstránenie reklamného baneru</li>
          <li
            className="text-decoration-underline"
            title="Strava Heatmap, hi-res detailed shading of Slovakia and Czechia, highest zoom levels of Outdoor Map, highest zoom levels of ortophoto maps of Slovakia and Czechia, various WMS-based maps"
          >
            prémiovým mapovým vrstvám
          </li>
          <li>prémiovým fotkám</li>
          <li>multimodálne vyhľadávanie trasy</li>
        </ul>
      </>
    ),
    stepsForAnonymous: (
      <>
        <div className="fw-bold">Postup</div>
        <div className="mb-3">
          <p className="mb-1 ms-3">
            <span className="fw-semibold">Krok 1</span> - vytvorte si účet tu vo
            Freemape (nižšie)
          </p>
          <p className="mb-1 ms-3">
            <span className="fw-semibold">Krok 2</span> - v aplikácii Rováš, kam
            vás usmerníme po registrácii, nám pošlite platbu.
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

  offline: {
    offlineMode: 'Režim offline',
    cachingActive: 'Nahrávanie do cache aktívne',
    clearCache: 'Vymazať cache',
    dataSource: 'Zdroj dát',
    networkOnly: 'Iba internet',
    networkFirst: 'Najprv internet',
    cacheFirst: 'Najprv cache',
    cacheOnly: 'Iba cache',
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
  downloadMap: {
    downloadMap: 'Export offline máp',
    format: 'Formát',
    map: 'Mapa',
    downloadArea: 'Exportovať',
    area: {
      visible: 'Viditeľnú oblasť',
      byPolygon: 'Oblasť pokrytú označeným polygónom',
    },
    name: 'Názov',
    zoomRange: 'Rozsah priblíženia',
    scale: 'Mierka',
    email: 'Vaša e-mailová adresa',
    emailInfo: 'Váš e-mail použijeme na zaslanie odkazu na stiahnutie.',
    success:
      'Mapa sa pripravuje. Po dokončení vám bude emailom doručený odkaz na jej stiahnutie.',
    summaryTiles: 'Dlaždíc',
    summaryPrice: (amount) => <>Celková cena: {amount} kreditov</>,
  },
};

export default messages;
