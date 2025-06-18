import { Fragment } from 'react';
import { AlertLink } from 'react-bootstrap';
import { FaGem, FaKey } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { documentShow } from '../actions/mainActions.js';
import { Attribution } from '../components/Attribution.js';
import { ChangesetDetails } from '../components/ChangesetDetails.js';
import { CookieConsent } from '../components/CookieConsent.js';
import { ElevationInfo } from '../components/ElevationInfo.js';
import { Emoji } from '../components/Emoji.js';
import { MaptilerAttribution } from '../components/MaptilerAttribution.js';
import {
  ObjectDetailBasicProps,
  ObjectDetails,
} from '../components/ObjectDetails.js';
import { TrackViewerDetails } from '../components/TrackViewerDetails.js';
import { Messages, addError } from './messagesInterface.js';
import shared from './sk-shared.js';

const nf33 = new Intl.NumberFormat('sk', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
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

const messages: Messages = {
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
    areYouSure: 'Ste si istí?',
    export: 'Exportovať',
    success: 'Hotovo!',
    expiration: 'Exspirácia',
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
    tools: 'Nástroje',
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
    swap: 'Prehodiť štart a cieľ',
    point: {
      pick: 'Vybrať na mape',
      current: 'Tvoja poloha',
      home: 'Domov',
    },
    transportType: {
      car: 'Auto',
      // 'car-toll': 'Auto, vrátane spoplatnených ciest',
      // 'car-free': 'Auto, mimo spoplatnených ciest',
      // bikesharing: 'Bike sharing',
      // imhd: 'MHD v Bratislave',
      bike: 'Bicykel',
      bicycle_touring: 'Cykloturistika',
      'foot-stroller': 'S kočíkom / vozíčkom',
      nordic: 'Bežky',
      // ski: 'Zjazdové lyžovanie',
      foot: 'Pešo',
      hiking: 'Turistika',
      mtb: 'Horský bicykel',
      racingbike: 'Cestný bicykel',
      motorcycle: 'Motocykel',
    },
    development: 'vo vývoji',
    mode: {
      route: 'V určenom poradí',
      trip: 'Návšteva miest',
      roundtrip: 'Návšteva miest (okruh)',
      'routndtrip-gh': 'Výlet',
      isochrone: 'Izochróny',
    },
    weighting: {
      fastest: 'Najrýchlejšia',
      short_fastest: 'Rýchla, krátka',
      shortest: 'Najkratšia',
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
    maneuverWithName: ({ type, modifier, name }) =>
      `${type} ${modifier} na ${name}`,
    maneuverWithoutName: ({ type, modifier }) => `${type} ${modifier}`,

    maneuver: {
      types: {
        turn: 'odbočte',
        'new name': 'choďte',
        depart: 'začnite',
        arrive: 'ukončite',
        merge: 'pokračujte',
        // 'ramp':
        'on ramp': 'choďte na príjazdovú cestu',
        'off ramp': 'opustite príjazdovú cestu',
        fork: 'zvoľte cestu',
        'end of road': 'pokračujte',
        // 'use lane':
        continue: 'pokračujte',
        roundabout: 'vojdite na kruhový objazd',
        rotary: 'vojdite na okružnú cestu',
        'roundabout turn': 'na kruhovom objazde odbočte',
        // 'notification':
        'exit rotary': 'opustite okružnú cestu', // undocumented
        'exit roundabout': 'opustite kruhový objazd', // undocumented
        notification: 'poznámka',
        'use lane': 'použite jazdný pruh',
      },

      modifiers: {
        uturn: 'otočte sa',
        'sharp right': 'prudko doprava',
        'slight right': 'mierne doprava',
        right: 'doprava',
        'sharp left': 'prudko doľava',
        'slight left': 'mierne doľava',
        left: 'doľava',
        straight: 'priamo',
      },
    },

    imhd: {
      total: {
        short: ({ arrival, price, numbers }) => (
          <>
            Príchod: <b>{arrival}</b> | Cena: <b>{price} €</b> | Spoje:{' '}
            {numbers?.map((n, i) => (
              <Fragment key={n}>
                {i > 0 ? ', ' : ''}
                <b>{n}</b>
              </Fragment>
            ))}
          </>
        ),
        full: ({ arrival, price, numbers, total, home, foot, bus, wait }) => (
          <>
            Príchod: <b>{arrival}</b> | Cena: <b>{price} €</b> | Spoje:{' '}
            {numbers?.map((n, i) => (
              <Fragment key={n}>
                {i > 0 ? ', ' : ''}
                <b>{n}</b>
              </Fragment>
            ))}{' '}
            | Trvanie{' '}
            <b>
              {total} {numberize(total, ['minút', 'minúta', 'minúty'])}
            </b>
            <br />
            Do odchodu: <b>{home}</b>, pešo: <b>{foot}</b>, MHD: <b>{bus}</b>,
            čakanie:{' '}
            <b>
              {wait} {numberize(wait, ['minút', 'minúta', 'minúty'])}
            </b>
          </>
        ),
      },
      step: {
        foot: ({ departure, duration, destination }) => (
          <>
            o <b>{departure}</b> pešo{' '}
            {duration !== undefined && (
              <b>
                {duration} {numberize(duration, ['minút', 'minútu', 'minúty'])}
              </b>
            )}{' '}
            {destination === 'TARGET' ? (
              <b>do cieľa</b>
            ) : (
              <>
                na <b>{destination}</b>
              </>
            )}
          </>
        ),
        bus: ({ departure, type, number, destination }) => (
          <>
            o <b>{departure}</b> {type} <b>{number}</b> na <b>{destination}</b>
          </>
        ),
      },
      type: {
        bus: 'autobusom',
        tram: 'električkou',
        trolleybus: 'trolejbusom',
        foot: 'pešo',
      },
    },
    bikesharing: {
      step: {
        foot: ({ duration, destination }) => (
          <>
            pešo{' '}
            {duration !== undefined && (
              <b>
                {duration} {numberize(duration, ['minút', 'minútu', 'minúty'])}
              </b>
            )}{' '}
            {destination === 'TARGET' ? (
              <b>do cieľa</b>
            ) : (
              <>
                na <b>{destination}</b>
              </>
            )}
          </>
        ),
        bicycle: ({ duration, destination }) => (
          <>
            bicyklom{' '}
            {duration !== undefined && (
              <b>
                {duration} {numberize(duration, ['minút', 'minútu', 'minúty'])}
              </b>
            )}{' '}
            na <b>{destination}</b>
          </>
        ),
      },
    },
    imhdAttribution: 'trasy liniek MHD',
  },

  mainMenu: {
    title: 'Hlavné menu',
    logOut: 'Odhlásiť',
    logIn: 'Prihlásenie',
    account: 'Účet',
    mapFeaturesExport: 'Exportovať mapové prvky',
    mapExports: 'Mapa pre GPS zariadenia',
    embedMap: 'Vložiť do webstránky',
    supportUs: 'Podporiť Freemap',
    help: 'Pomoc',
    back: 'Naspäť',
    mapLegend: 'Legenda mapy',
    contacts: 'Kontakty',
    facebook: 'Freemap na Facebooku',
    twitter: 'Freemap na Twitteri',
    youtube: 'Freemap na YouTube',
    github: 'Freemap na GitHub-e',
    automaticLanguage: 'Automaticky',
    mapExport: 'Exportovať mapu',
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
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const dispatch = useDispatch();

        return (
          <>
            <span className="d-sm-none">Podporte nás prosím</span>
            <span className="d-none d-sm-inline d-xl-none">
              Podporte prosím prevádzku služieb Freemap.sk vašimi
            </span>
            <span className="d-none d-xl-inline">
              Freemap.sk je nekomerčný projekt a preto na svoju prevádzku
              potrebuje podporu dobrovoľníkov. Pomôžte mu prosím vašimi
            </span>{' '}
            <AlertLink
              href="/#document=dvePercenta"
              onClick={(e) => {
                e.preventDefault();

                dispatch(documentShow('dvePercenta'));
              }}
            >
              2% z dane
            </AlertLink>
            .
          </>
        );
      },
      ua: () => {
        return (
          <>
            <Emoji>🇺🇦</Emoji>&ensp;
            <a
              href="https://donio.sk/spolocne-pre-ukrajinu"
              target="_blank"
              rel="noopener"
            >
              Spoločne pre Ukrajinu ›
            </a>
            &ensp;
            <Emoji>🇺🇦</Emoji>
          </>
        );
      },
    },
  },

  gallery: {
    recentTags: 'Nedávne tagy na priradenie:',
    filter: 'Filter',
    showPhotosFrom: 'Prezerať fotky',
    showLayer: 'Zobraziť vrstvu',
    upload: 'Nahrať',
    f: {
      firstUploaded: 'od prvej nahranej',
      lastUploaded: 'od poslednej nahranej',
      firstCaptured: 'od najstaršie odfotenej',
      lastCaptured: 'od najnovšie odfotenej',
      leastRated: 'od najnižšieho hodnotenia',
      mostRated: 'od najvyššieho hodnotenia',
      lastComment: 'od posledného komentára',
    },
    colorizeBy: 'Vyfarbiť podľa',
    c: {
      disable: 'nevyfarbiť',
      mine: 'odlíšiť moje',
      author: 'autora',
      rating: 'hodnotenia',
      takenAt: 'dátumu odfotenia',
      createdAt: 'dátumu nahrania',
      season: 'ročného obdobia',
      premium: 'prémiové',
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
        'Túto fotografiu sprístupnil jej autor len používateľom s plným prístupom.',
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
      showPreview: 'Zobraziť náhľady (náročnejšie na výkon a pamäť)',
      premium: 'Sprístupniť len používateľom s plným prístupom',
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
    areaInfo: ({ area }) => (
      <>
        Plocha:
        <div>
          {nf33.format(area)}&nbsp;m<sup>2</sup>
        </div>
        <div>{nf33.format(area / 100)}&nbsp;a</div>
        <div>{nf33.format(area / 10000)}&nbsp;ha</div>
        <div>
          {nf33.format(area / 1000000)}&nbsp;km<sup>2</sup>
        </div>
      </>
    ),
    distanceInfo: ({ length }) => (
      <>
        Dĺžka:
        <div>{nf33.format(length * 1000)}&nbsp;m</div>
        <div>{nf33.format(length)}&nbsp;km</div>
      </>
    ),
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
      label: 'Popis:',
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

  settings: {
    map: {
      overlayPaneOpacity: 'Viditeľnosť čiar na mape:',
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
    notFound: 'Nič sa tu nenašlo.',
    fetchingError: ({ err }) =>
      addError(messages, 'Nastala chyba pri získavaní detailov', err),
    detail: (props: ObjectDetailBasicProps) => (
      <ObjectDetails
        {...props}
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
    // categories: {
    //   1: 'Príroda',
    //   2: 'Služby',
    //   3: 'Doprava',
    //   4: 'Pamiatky',
    //   5: 'Zdravotníctvo',
    //   6: 'Obchody',
    //   7: 'Energetika',
    //   8: 'Ubytovanie a stravovanie',
    //   9: 'Turizmus, turistika',
    //   10: 'Územné členenie',
    //   11: 'Ostatné',
    //   12: 'Voľný čas',
    //   13: 'Šport',
    //   14: 'Vzdelávanie',
    //   15: 'Bicyklovanie',
    // },
    // subcategories: {
    //   1: 'Jaskyňa',
    //   2: 'Vrch',
    //   3: 'Čerpacia stanica',
    //   4: 'Reštaurácia',
    //   5: 'Hotel',
    //   6: 'Parkovisko',
    //   7: 'Letisko',
    //   8: 'Železničná stanica',
    //   9: 'Autobusová stanica',
    //   10: 'Autobusová zastávka',
    //   11: 'Hrad',
    //   12: 'Zámok',
    //   13: 'Zrúcanina',
    //   14: 'Múzeum',
    //   15: 'Pomník',
    //   16: 'Pamätník',
    //   17: 'Lekáreň',
    //   18: 'Nemocnica',
    //   19: 'Ordinácia',
    //   20: 'Polícia',
    //   21: 'Poliklinika',
    //   22: 'Hraničný prechod',
    //   23: 'Nemocnica s pohotovosťou',
    //   24: 'Supermarket',
    //   26: 'Jadrová elektráreň',
    //   27: 'Tepelná elektráreň (uhlie)',
    //   28: 'Vodná elektráreň',
    //   29: 'Veterná elektráreň',
    //   30: 'Potraviny',
    //   31: 'Hasičská stanica',
    //   32: 'Kostol',
    //   33: 'Pohostinstvo',
    //   34: 'Banka',
    //   35: 'Bankomat',
    //   36: 'Rýchle občerstvenie',
    //   39: 'Banka',
    //   40: 'Výhľad',
    //   41: 'Kemping',
    //   42: 'Chránené stromy',
    //   43: 'Prameň',
    //   44: 'Rázcestník',
    //   45: 'Orientačná mapa',
    //   46: 'Útulňa',
    //   47: 'Prístrešok, altánok',
    //   48: 'Poštový úrad',
    //   49: 'Pamätník, bojisko',
    //   50: 'Poľovnícky posed',
    //   51: 'Vysielač',
    //   52: 'Rozhľadňa',
    //   53: 'Motel',
    //   54: 'Penzión',
    //   55: 'Privát',
    //   56: 'Regionálne mesto',
    //   57: 'Okresné mesto',
    //   58: 'Veľké mesto',
    //   59: 'Mesto',
    //   60: 'Obec',
    //   61: 'Osada',
    //   62: 'Mestský obvod',
    //   63: 'Horáreň',
    //   64: 'Zubár',
    //   65: 'Predajňa bicyklov',
    //   66: 'Stojan na bicykle',
    //   67: 'Prenájom bicyklov',
    //   68: 'Predaj alkoholu',
    //   69: 'Umenie',
    //   70: 'Pekáreň',
    //   71: 'Starostlivosť o krásu',
    //   72: 'Postele',
    //   73: 'Nápoje',
    //   74: 'Kníhkupectvo',
    //   75: 'Butik',
    //   76: 'Mäsiarstvo',
    //   77: 'Predaj áut',
    //   78: 'Autoservis',
    //   79: 'Charita',
    //   80: 'Drogéria',
    //   81: 'Oblečenie',
    //   82: 'Počítače',
    //   83: 'Cukrovinky',
    //   84: 'Kopírovanie',
    //   85: 'Záclony a závesy',
    //   86: 'Delikatesy',
    //   87: 'Obchodný dom',
    //   89: 'Čistiareň',
    //   90: 'Domáce výrobky',
    //   91: 'Elektronika',
    //   92: 'Erotika',
    //   93: 'Firemná predajňa',
    //   94: 'Farmárske produkty',
    //   95: 'Kvetinárstvo',
    //   96: 'Obrazy',
    //   98: 'Pohrebný ústav',
    //   99: 'Nábytok',
    //   100: 'Záhradné centrum',
    //   101: 'Rozličný tovar',
    //   102: 'Darčeková predajňa',
    //   103: 'Sklenárstvo',
    //   104: 'Ovocie, zelenina',
    //   105: 'Kaderníctvo',
    //   106: 'Železiarstvo',
    //   107: 'Načúvacie pomôcky',
    //   108: 'HI-FI',
    //   109: 'Zmrzlina',
    //   110: 'Bytové doplnky',
    //   111: 'Zlatníctvo',
    //   112: 'Kiosk',
    //   113: 'Kuchynské potreby',
    //   114: 'Práčovňa',
    //   115: 'Nákupné centrum',
    //   116: 'Masáže',
    //   117: 'Mobilné telefóny',
    //   118: 'Pôžičky',
    //   119: 'Motocykle',
    //   120: 'Hudobné nástroje',
    //   121: 'Noviny',
    //   122: 'Optika',
    //   124: 'Outdoor',
    //   125: 'Farby',
    //   126: 'Záložňa',
    //   127: 'Zvieratá',
    //   128: 'Plody mora',
    //   129: 'Second hand',
    //   130: 'Obuv',
    //   131: 'Športové potreby',
    //   132: 'Papiernictvo',
    //   133: 'Tetovanie',
    //   134: 'Hračkárstvo',
    //   135: 'Stavebniny',
    //   136: 'Prázdne priestory',
    //   137: 'Vysávače',
    //   138: 'Zmiešaný tovar',
    //   139: 'Video/DVD',
    //   140: 'ZOO',
    //   141: 'Horská chata',
    //   142: 'Atrakcia',
    //   143: 'Toalety',
    //   144: 'Telefón',
    //   145: 'Miestny úrad',
    //   146: 'Väznica',
    //   147: 'Trhovisko',
    //   148: 'Bar',
    //   149: 'Kaviareň',
    //   150: 'Verejný gril',
    //   151: 'Pitná voda',
    //   152: 'Taxi',
    //   153: 'Knižnica',
    //   154: 'Umývačka áut',
    //   155: 'Veterinár',
    //   156: 'Semafor',
    //   157: 'Železničná zástavka',
    //   158: 'Železničné priecestie',
    //   159: 'Zástavka električky',
    //   160: 'Heliport',
    //   161: 'Vodárenská veža',
    //   162: 'Veterný mlyn',
    //   163: 'Sauna',
    //   164: 'Čerpacia stanica LPG',
    //   166: 'Park pre psov',
    //   167: 'Športové centrum',
    //   168: 'Kurzy golfu',
    //   169: 'Štadión',
    //   170: 'Ihrisko',
    //   171: 'Vodný park',
    //   172: 'Vypúšťanie lodí',
    //   173: 'Rybolov',
    //   174: 'Park',
    //   175: 'Detské ihrisko',
    //   176: 'Záhrada',
    //   177: 'Verejná plocha',
    //   178: 'Klzisko',
    //   179: 'Mini-golf',
    //   180: 'Tanec',
    //   181: 'Základná škola',
    //   182: 'Kužeľky',
    //   183: 'Bowling',
    //   184: 'Americký futbal (ragby)',
    //   185: 'Lukostreľba',
    //   186: 'Atletika',
    //   187: 'Austrálsky futbal (ragby)',
    //   188: 'Baseball',
    //   189: 'Basketbal',
    //   190: 'Plážový volejbal',
    //   191: 'Bmx',
    //   192: 'Guľové športy',
    //   193: 'Bowls',
    //   194: 'Kanadský futbal (ragby)',
    //   195: 'Kanoe',
    //   196: 'Šach',
    //   197: 'Lezenie',
    //   198: 'Kriket',
    //   199: 'Tréning kriketu',
    //   200: 'Kroket',
    //   201: 'Bicyklovanie',
    //   202: 'Potápanie',
    //   203: 'Preteky psov',
    //   204: 'Jazdenie na koni',
    //   205: 'Futbal',
    //   206: 'Írske ragby',
    //   207: 'Golf',
    //   208: 'Gymnastika',
    //   209: 'Hokej',
    //   210: 'horseshoes',
    //   211: 'Dostihy',
    //   212: 'ice_stock',
    //   213: 'korfball',
    //   214: 'Motorky',
    //   215: 'Multi',
    //   216: 'Orientačné preteky',
    //   217: 'Padel',
    //   218: 'Paragliding',
    //   219: 'Pelota',
    //   220: 'Raketbal',
    //   221: 'Veslovanie',
    //   222: 'Ligové ragby',
    //   223: 'Európske ragby',
    //   224: 'Streľba',
    //   225: 'Korčuľovanie',
    //   226: 'Skateboard',
    //   227: 'Lyžovanie',
    //   228: 'Futbal',
    //   229: 'Plávanie',
    //   230: 'Stolný tenis',
    //   231: 'Hádzaná',
    //   232: 'Tenis',
    //   233: 'Tobogan',
    //   234: 'Volejbal',
    //   235: 'Vodné lyžovanie',
    //   236: 'Univerzita',
    //   237: 'Materská škola',
    //   238: 'Stredná škola',
    //   239: 'Autoškola',
    //   240: 'Kaplnka',
    //   241: 'Miesto na piknik',
    //   242: 'Miesto s ohniskom',
    //   243: 'Lokalita',
    //   244: 'Vodopád',
    //   245: 'Jazero',
    //   246: 'Priehrada',
    //   248: 'Prírodná rezervácia',
    //   249: 'Prírodná pamiatka',
    //   250: 'Chránený areál',
    //   251: 'Chránená krajinná oblasť',
    //   252: 'Národný park',
    //   253: 'Automat na mlieko',
    //   254: 'Významné mokriny (RAMSAR)',
    //   255: 'Adresné body',
    //   256: 'Banícka šachta',
    //   257: 'Štôlňa',
    //   258: 'Studňa',
    //   259: 'Kríž',
    //   260: 'Svätyňa',
    //   261: 'Posilňovňa',
    //   262: 'Paroplynová elektráreň',
    //   263: 'Kaštieľ',
    //   264: 'Geomorfologické členenie',
    //   265: 'Vojenský bunker',
    //   266: 'Príjazd/Výjazd z diaľnice',
    //   267: 'Sochy',
    //   268: 'Komín',
    //   269: 'Paragliding',
    //   270: 'Závesné lietanie',
    //   271: 'Krmelec',
    //   272: 'Ohnisko',
    //   273: 'Bedminton/Squash',
    //   274: 'Rázcestník',
    //   275: 'Nabíjacia stanica pre bicykle',
    // },
  },

  external: {
    openInExternal: 'Zdieľať / otvoriť v ext. aplikácii',
    osm: 'OpenStreetMap',
    oma: 'OMA',
    googleMaps: 'Google Mapy',
    hiking_sk: 'Hiking.sk',
    zbgis: 'ZBGIS',
    mapy_cz: 'Mapy.cz',
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
  },

  embed: {
    code: 'Vložte na vašu stránku tento html kód:',
    example: 'Výsledok bude vyzerať nasledovne:',
    dimensions: 'Veľkosť:',
    height: 'Výška:',
    width: 'Šírka:',
    enableFeatures: 'Povoliť funkcie:',
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
    showAll: 'Ukázať všetky mapy',
    settings: 'Nastavenia máp',
    layers: 'Mapy',
    switch: 'Mapy',
    photoFilterWarning: 'Filter fotografií je aktívny',
    interactiveLayerWarning: 'Interaktívna vrstva je skrytá',
    minZoomWarning: (minZoom) => `Dostupné až od priblíženia ${minZoom}`,
    letters: {
      A: 'Automapa (zastaraná)',
      T: 'Turistická (zastaraná)',
      C: 'Cyklomapa (zastaraná)',
      K: 'Bežkárska (zastaraná)',
      S: 'Z lietadla',
      Z: 'Ortofoto ČR+SR',
      J: 'Stará Ortofotomozaika SR',
      O: 'OpenStreetMap',
      M: 'mtbmap.cz',
      d: 'Verejná doprava (ÖPNV)',
      X: outdoorMap,
      i: 'Interaktívna vrstva',
      I: 'Fotografie',
      l: 'Lesné cesty NLC (SK)',
      t: 'Turistické trasy',
      c: 'Cyklotrasy',
      s0: 'Strava (Všetko)',
      s1: 'Strava (Cyklojazdy)',
      s2: 'Strava (Beh)',
      s3: 'Strava (Vodné aktivity)',
      s4: 'Strava (Zimné aktivity)',
      w: 'Wikipedia',
      '4': 'Svetlé tieňovanie terénu (SK)',
      '5': 'Tieňovanie terénu (SK)',
      '6': 'Tieňovanie povrchu (SK)',
      '7': 'Detailné tieňovanie povrchu (SK)',
      '8': 'Detailné tieňovanie povrchu (CZ)',
      VO: 'OpenStreetMap Vektorová',
      VS: 'Streets Vektorová',
      VD: 'Dataviz Vektorová',
      VT: 'Outdoor Vektorová',
      h: 'Parametrické tieňovanie (SK)',
      z: 'Parametrické tieňovanie (CZ)',
    },
    customBase: 'Vlastná mapa',
    customOverlay: 'Vlastné prekrytie mapy',
    type: {
      map: 'mapa',
      data: 'dáta',
      photos: 'fotografie',
    },
    attr: {
      freemap: '©\xa0Freemap Slovakia',
      osmData: '©\xa0prispievatelia OpenStreetMap',
      srtm: '©\xa0SRTM',
      outdoorShadingAttribution: 'poskytovatelia DMR…',
      maptiler: (
        <MaptilerAttribution
          tilesFrom="Vektorové dlaždice z"
          hostedBy="hostované na"
        />
      ),
    },
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
      regenerateToken: 'Obnoviť',
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
    styles: 'Štýly interaktívnej vrstvy',
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
    area: 'Exportovať oblasť:',
    areas: {
      visible: 'Viditeľnú oblasť mapy',
      pinned: 'Plochu obsahujúcu označený polygón (kreslenie)',
    },
    format: 'Formát:',
    layersTitle: 'Voliteľné vrstvy:',
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
    mapScale: 'Rozlíšenie mapy:',
    alert: () => (
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
            <em>
              mapa ©{' '}
              <AlertLink
                href="https://www.freemap.sk/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Freemap Slovakia
              </AlertLink>
              , dáta{' '}
              <AlertLink
                href="https://osm.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
              >
                © prispievatelia OpenStreetMap
              </AlertLink>
              {', SRTM, '}
              <AlertLink
                href="https://www.geoportal.sk/sk/udaje/lls-dmr/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LLS: ÚGKK SR
              </AlertLink>
            </em>
          </li>
        </ul>{' '}
      </>
    ),
  },

  maps: {
    legacyMapWarning:
      'Zobrazená mapa je zastaralá. Prepnúť na modernú outdoorovú mapu?',
    noMapFound: 'Žiadna mapa nenájdená',
    save: 'Uložiť',
    delete: 'Zmazať',
    disconnect: 'Odpojiť',
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
    body: (
      <>
        Legenda k mape <i>{outdoorMap}</i>:
      </>
    ),
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
    title: 'Získať plný prístup',
    commonHeader: (
      <>
        <p>
          <strong>Podporte dobrovoľníkov vytvárajúcich túto mapu!</strong>
        </p>
        <p className="mb-1">
          Za <b>5 hodín</b> vašej dobrovoľníckej práce* alebo <b>5 €</b> získate
          na rok:
        </p>
        <ul>
          <li>odstránenie reklamného baneru</li>
          <li>
            prístup k <FaGem /> prémiovým mapovým vrstvám
          </li>
          <li>
            prístup k <FaGem /> prémiovým fotkám
          </li>
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
    commonFooter: (
      <p className="small">
        * Svoju dobrovoľnícku prácu dokážete vytvorením pracovných výkazov v
        aplikácii{' '}
        <a href="https://rovas.app/" target="rovas">
          Rováš
        </a>
        . Ak ste dobrovoľníkom v projekte OSM a používate aplikáciu JOSM,
        odporúčame zapnúť{' '}
        <a
          href="https://josm.openstreetmap.de/wiki/Sk%3AHelp/Plugin/RovasConnector"
          target="rovas_connector"
        >
          doplnok Rovas Connector
        </a>
        , ktorý výkazy vytvorí za vás. Po overení výkazu dvoma používateľmi
        získate odmenu v komunitnej mene <i>chron</i> a tú môžte použiť na
        odstránenie reklám na www.freemap.sk.
      </p>
    ),
    continue: 'Pokračovať',
    success: 'Gratulujeme, získali ste prístup ku všetkým funkciám!',
    becomePremium: 'Získať plný prístup',
    youArePremium: 'Máte prístup k všetkým funkciám',
    premiumOnly: 'Dostupné len s plným prístupom.',
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
};

function numberize(n: number, words: [string, string, string]) {
  return n < 1 ? words[0] : n < 2 ? words[1] : n < 5 ? words[2] : words[0];
}

export default messages;
