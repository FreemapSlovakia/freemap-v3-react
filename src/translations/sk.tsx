/* eslint-disable */

import { ChangesetDetails } from 'fm3/components/ChangesetDetails';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { RoadDetails } from 'fm3/components/RoadDetails';
import { TrackViewerDetails } from 'fm3/components/TrackViewerDetails';
import { latLonToString } from 'fm3/geoutils';
import { Fragment } from 'react';
import Alert from 'react-bootstrap/Alert';
import { Messages } from './messagesInterface';

const nf01 = Intl.NumberFormat('sk', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const nf33 = Intl.NumberFormat('sk', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

const masl = 'm\xa0n.\xa0m.';

const getErrorMarkup = (ticketId?: string) => `<h1>Chyba aplikácie</h1>
<p>
  ${
    ticketId
      ? `Chyba nám bola automaticky reportovaná pod ID <b>${ticketId}</b>.`
      : ''
  }
  Chybu môžeš nahlásiť ${
    ticketId ? 'aj ' : ''
  }na <a href="https://github.com/FreemapSlovakia/freemap-v3-react/issues/new" target="_blank" rel="noopener noreferrer">GitHub</a>,
  prípadne nám poslať detaily na <a href="mailto:freemap@freemap.sk?subject=Nahlásenie%20chyby%20na%20www.freemap.sk">freemap@freemap.sk</a>.
</p>
<p>
  Ďakujeme.
</p>`;

const sk: Messages = {
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
    processorError: ({ err }) => `Chyba aplikácie: ${err}`,
    seconds: 'sekundy',
    minutes: 'minúty',
    meters: 'metre',
    createdAt: 'Vytvorené',
    actions: 'Akcie',
    add: 'Pridať nové',
    clear: 'Vyčistiť',
    convertToDrawing: 'Skonvertovať na kreslenie',
    simplifyPrompt:
      'Prosím zadajte faktor zjednodušenia. Zadajte nulu pre vynechanie zjednodušenia.',
    copyUrl: 'Kopírovať URL',
    savingError: ({ err }) => `Chyba ukladania: ${err}`,
    loadError: ({ err }) => `Chyba načítania: ${err}`,
    deleteError: ({ err }) => `Chyba mazania: ${err}`,
    deleted: 'Zmazané.',
    saved: 'Uložené.',
  },

  tools: {
    none: 'Zavrieť nástroj',
    tools: 'Nástroje',
    routePlanner: 'Vyhľadávač trás',
    objects: 'Objekty (POI)',
    photos: 'Fotografie',
    measurement: 'Kreslenie a meranie',
    trackViewer: 'Prehliadač trás (GPX)',
    changesets: 'Zmeny v mape',
    mapDetails: 'Detaily v mape',
    tracking: 'Sledovanie',
    maps: (
      <>
        Moje mapy <FontAwesomeIcon icon="flask" className="text-warning" />
      </>
    ),
  },

  routePlanner: {
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
      car: 'Auto, vrátane spoplatnených ciest',
      'car-free': 'Auto, mimo spoplatnených ciest',
      bikesharing: 'Bike sharing',
      imhd: 'MHD v Bratislave',
      'bike-osm': 'Bicykel',
      bike: 'Cykloturistika',
      'foot-stroller': 'S kočíkom / vozíčkom',
      nordic: 'Bežky',
      ski: 'Zjazdové lyžovanie',
      'foot-osm': 'Pešo',
      foot: 'Turistika',
    },
    development: 'vo vývoji',
    mode: {
      route: 'Po poradí',
      trip: 'Návšteva miest',
      roundtrip: 'Návšteva miest (okruh)',
    },
    alternative: 'Alternatíva',
    // eslint-disable-next-line
    distance: ({ value, diff }) => (
      <>
        Vzdialenosť:{' '}
        <b>
          {value} km{diff ? ` (+ ${diff} km)` : ''}
        </b>
      </>
    ),
    // eslint-disable-next-line
    duration: ({ h, m, diff }) => (
      <>
        Trvanie:{' '}
        <b>
          {h} h {m} m{diff && ` (+ ${diff.h} h ${diff.m} m)`}
        </b>
      </>
    ),
    // eslint-disable-next-line
    summary: ({ distance, h, m }) => (
      <>
        Vzdialenosť: <b>{distance} km</b> | Trvanie:{' '}
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
    fetchingError: ({ err }) => `Nastala chyba pri hľadaní trasy: ${err}`,
    maneuverWithName: ({ type, modifier, name }) =>
      `${type} ${modifier} na ${name}`,
    maneuverWithoutName: ({ type, modifier }) => `${type} ${modifier}`,

    maneuver: {
      types: {
        turn: 'odbočte',
        'new name': 'choďte',
        depart: 'začnite',
        arrive: 'ukončte',
        merge: 'pokračujte',
        // 'ramp':
        'on ramp': 'choďte na príjazdovú cestu',
        'off ramp': 'opusťte príjazdovú cestu',
        fork: 'zvoľte cestu',
        'end of road': 'pokračujte',
        // 'use lane':
        continue: 'pokračujte',
        roundabout: 'vojdite na kruhový objazd',
        rotary: 'vojdite na okružnú cestu',
        'roundabout turn': 'na kruhovom objazde odbočte',
        // 'notification':
        'exit rotary': 'opusťte okružnú cestu', // undocumented
        'exit roundabout': 'opusťte kruhový objazd', // undocumented
        notification: 'poznámka',
        'use lane': 'použi jazdný pruh',
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
        // eslint-disable-next-line
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
        // eslint-disable-next-line
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
        // eslint-disable-next-line
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
        // eslint-disable-next-line
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
        // eslint-disable-next-line
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
        // eslint-disable-next-line
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

  more: {
    more: 'Ďalšie',
    logOut: (name) => `Odhlásiť ${name}`,
    logIn: 'Prihlásenie',
    settings: 'Nastavenia',
    gpxExport: 'Exportovať do GPX',
    mapExports: 'Mapa pre GPS zariadenia',
    embedMap: 'Vložiť do webstránky',
    reportMapError: 'Nahlásiť chybu zobrazenia v mape',
    reportAppError: 'Nahlásiť chybu v portáli',
    supportUs: 'Podporiť Freemap',
    help: 'Pomoc',
    back: 'Naspäť',
    mapLegend: 'Legenda mapy',
    contacts: 'Kontakty',
    tips: 'Tipy',
    facebook: 'Freemap na Facebooku',
    twitter: 'Freemap na Twitteri',
    youtube: 'Freemap na YouTube',
    github: 'Freemap na GitHub-e',
    automaticLanguage: 'Automaticky',
    pdfExport: 'Exportovať mapu',
  },

  main: {
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
    copyright: 'Licencia',
    p2: () => (
      <>
        Podporiť prevádzku Freemap môžete aj Vašimi 2% z dane. Bližšie
        informácie a tlačivá nájdete na{' '}
        <a href="http://wiki.freemap.sk/dvepercenta">
          wiki.freemap.sk/dvepercenta
        </a>
        .
      </>
    ),
  },

  gallery: {
    filter: 'Filter',
    allPhotos: 'Všetky fotky',
    upload: 'Nahrať',
    f: {
      firstUploaded: 'od prvej nahranej',
      lastUploaded: 'od poslednej nahranej',
      firstCaptured: 'od najstaršie odfotenej',
      lastCaptured: 'od najnovšie odfotenej',
      leastRated: 'od najmenšieho hodnotenia',
      mostRated: 'od najväčšieho hodnotenia',
    },
    viewer: {
      title: 'Fotografia',
      comments: 'Komentáre',
      newComment: 'Nový komentár',
      addComment: 'Pridaj',
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
        <p>Potiahnite sem fotky, alebo sem kliknite pre ich výber.</p>
        <ul>
          <li>Nevkladajte príliš malé obrázky (miniatúry). Maximálny rozmer nie je obmedzený, je však obmedzená veľkosť súboru na max. 10MB. Väčšie súbory server odmietne.</li>
          <li>Vkladajte len fotografie krajiny, vrátane dokumentačných fotografií. Portréty a makro-fotografie sú považované za nevhodný obsah a budú bez varovania vymazané.</li>
          <li>Zvýšenú pozornosť venujte tomu, aby ste nahrávali výlučne vlastnú tvorbu.</li>
          <li>Nahraté fotografie sú ďalej šírené pod licenciou CC-BY-SA 2.0.</li>
          <li>Prevádzkovateľ Freemap.sk sa týmto zbavuje akejkoľvek zodpovednosti a nezodpovedá za priame ani nepriame škody vzniknuté uverejnením fotografie v galérii, za fotografiu nesie plnú zodpovednosť osoba, ktorá fotografiu na server uložila.</li>
          <li>Prevádzkovateľ si vyhradzuje právo upraviť popis, názov, pozíciu a tagy fotografie, alebo fotografiu vymazať, ak je jej obsah nevhodný (porušuje tieto pravidlá).</li>
          <li>Prevádzkovateľ si vyhradzuje právo zrušiť konto v prípade, že používateľ opakovane porušuje pravidlá galérie uverejňovaním nevhodného obsahu.</li>
        </ul>
      `,
      success: 'Fotografie boli úspešne nahrané.',
      showPreview: 'Zobraziť náhľady (náročnejšie na výkon a pamäť)',
    },
    locationPicking: {
      title: 'Zvoľte pozíciu fotografie',
    },
    layerHint:
      'Pre zapnutie vrstvy s fotografiami zvoľte Fotografie z ponuky vrstiev (alebo stlačte klávesy Shift+F).',
    deletingError: ({ err }) => `Nastala chyba pri mazaní obrázka: ${err}`,
    tagsFetchingError: ({ err }) =>
      `Nastala chyba pri načítavaní tagov: ${err}`,
    pictureFetchingError: ({ err }) =>
      `Nastala chyba pri načítavaní fotky: ${err}`,
    picturesFetchingError: ({ err }) =>
      `Nastala chyba pri načítavaní fotiek: ${err}`,
    savingError: ({ err }) => `Nastala chyba pri ukladaní fotky: ${err}`,
    commentAddingError: ({ err }) =>
      `Nastala chyba pri pridávaní komentára: ${err}`,
    ratingError: ({ err }) => `Nastala chyba pri hodnotení: ${err}`,
    unauthenticatedError:
      'Pre nahrávanie fotiek do galérie musíte byť prihlásený.',
    missingPositionError: 'Chýba pozícia.',
    invalidPositionError: 'Nesprávny formát súradníc.',
    invalidTakenAt: 'Nevalidný dátum a čas fotenia.',
    filterModal: {
      title: 'Filter fotografií',
      tag: 'Tag',
      createdAt: 'Dátum nahratia',
      takenAt: 'Dátum fotenia',
      author: 'Autor',
      rating: 'Hodnotenie',
      noTags: 'bez tagov',
    },
  },

  measurement: {
    distance: 'Čiara',
    elevation: 'Bod',
    area: 'Polygón',
    elevationFetchError: ({ err }) =>
      `Nastala chyba pri získavaní výšky bodu: ${err}`,
    elevationInfo: ({ elevation, point }) => (
      <>
        {(['D', 'DM', 'DMS'] as const).map((format) => (
          <div key={format}>{latLonToString(point, 'sk', format)}</div>
        ))}
        {elevation != null && (
          <div>
            Nadmorská výška: {nf01.format(elevation)}&nbsp;{masl}
          </div>
        )}
      </>
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
      drop: 'Potiahnite sem .gpx súbor, alebo sem kliknite pre jeho výber.',
    },
    shareToast: 'Trasa bola uložená na server a môžete ju zdieľať.',
    fetchingError: ({ err }) =>
      `Nastala chyba pri získavaní záznamu trasy: ${err}`,
    savingError: ({ err }) => `Nepodarilo sa uložiť trasu: ${err}`,
    loadingError: 'Súbor sa nepodarilo načítať.',
    onlyOne: 'Očakáva sa iba jeden GPX súbor.',
    wrongFormat: 'Nahraný súbor musí mať príponu .gpx',
    info: () => <TrackViewerDetails />,
    tooBigError: 'Nahraný súbor je príliš veľký.',
  },

  drawing: {
    modify: 'Zmeniť popis',
    edit: {
      title: 'Zmeniť popis',
      label: 'Popis:',
      hint: 'Ak chcete popis odstrániť, nechajte pole popisu prázdne.',
    },
  },

  settings: {
    tab: {
      map: 'Mapa',
      account: 'Účet',
      general: 'Všeobecné',
      expert: 'Expert',
    },
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
      noAuthInfo: 'Dostupné iba pre prihlásených používateľov.',
    },
    general: {
      tips: 'Zobrazovať tipy po otvorení stránky',
    },
    expertInfo: `
      <div style="text-align: left">
        V expertnom móde sú dostupné nástroje pre pokročilých používateľov, napríklad:
        <ul>
          <li>rozšírené nastavenia</li>
          <li>extra mapové vrstvy</li>
          <li>extra profily vyhľadávača trás</li>
        </ul>
      </div>
    `,
    expert: {
      switch: 'Expertný mód',
      overlayOpacity: 'Viditeľnosť vrstvy:',
      trackViewerEleSmoothing: {
        label: (value) =>
          `Úroveň vyhladzovania pri výpočte celkovej nastúpanej/naklesanej nadmorskej výšky v prehliadači trás: ${value}`,
        info:
          'Pri hodnote 1 sa berú do úvahy všetky nadmorské výšky samostatne. Vyššie hodnoty zodpovedajú šírke plávajúceho okna ktorým sa vyhladzujú nadmorské výšky.',
      },
    },
    saveSuccess: 'Zmeny boli uložené.',
    savingError: ({ err }) => `Nastala chyba pri ukladaní nastavení: ${err}`,
  },

  changesets: {
    allAuthors: 'Všetci autori',
    download: 'Stiahnuť zmeny',
    olderThan: ({ days }) => `${days} dn${days === 3 ? 'i' : 'í'}`,
    olderThanFull: ({ days }) =>
      `Zmeny novšie ako ${days} dn${days === 3 ? 'i' : 'í'}`,
    notFound: 'Neboli nájdené žiadne zmeny.',
    fetchError: ({ err }) => `Nastala chyba pri získavaní zmien: ${err}`,
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
    road: 'Info o ceste',
    notFound: 'Nebola nájdená žiadna cesta.',
    fetchingError: ({ err }) =>
      `Nastala chyba pri získavaní detailov o ceste: ${err}`,
    detail: ({ element }) => <RoadDetails way={element} />,
  },

  objects: {
    type: 'Typ',
    lowZoomAlert: {
      message: 'Vyhľadávanie miest je možné až od priblíženia úrovne 12.',
      zoom: 'Priblíž',
    },
    fetchingError: ({ err }) => `Nastala chyba pri získavaní objektov: ${err}`,
    categories: {
      1: 'Príroda',
      2: 'Služby',
      3: 'Doprava',
      4: 'Pamiatky',
      5: 'Zdravotníctvo',
      6: 'Obchody',
      7: 'Energetika',
      8: 'Ubytovanie a Stravovanie',
      9: 'Turizmus, turistika',
      10: 'Územné členenie',
      11: 'Ostatné',
      12: 'Voľný čas',
      13: 'Šport',
      14: 'Vzdelávanie',
      15: 'Bicyklovanie',
    },
    subcategories: {
      1: 'Jaskyňa',
      2: 'Vrch',
      3: 'Čerpacia stanica',
      4: 'Reštaurácia',
      5: 'Hotel',
      6: 'Parkovisko',
      7: 'Letisko',
      8: 'Železničná stanica',
      9: 'Autobusová stanica',
      10: 'Autobusová zastávka',
      11: 'Hrad',
      12: 'Zámok',
      13: 'Zrúcanina',
      14: 'Múzeum',
      15: 'Pomník',
      16: 'Pamätník',
      17: 'Lekáreň',
      18: 'Nemocnica',
      19: 'Ordinácia',
      20: 'Polícia',
      21: 'Poliklinika',
      22: 'Hraničný prechod',
      23: 'Nemocnica s pohotovosťou',
      24: 'Supermarket',
      26: 'Jadrová elektráreň',
      27: 'Tepelná elektráreň (uhlie)',
      28: 'Vodná elektráreň',
      29: 'Veterná elektráreň',
      30: 'Potraviny',
      31: 'Hasičská stanica',
      32: 'Kostol',
      33: 'Pohostinstvo',
      34: 'Banka',
      35: 'Bankomat',
      36: 'Rýchle občerstvenie',
      39: 'Banka',
      40: 'Výhľad',
      41: 'Kemping',
      42: 'Chránené stromy',
      43: 'Prameň',
      44: 'Rázcestník',
      45: 'Orientačná mapa',
      46: 'Útulňa',
      47: 'Prístrešok, altánok',
      48: 'Poštový úrad',
      49: 'Pamätník, bojisko',
      50: 'Poľovnícky posed',
      51: 'Vysielač',
      52: 'Rozhľadňa',
      53: 'Motel',
      54: 'Penzión',
      55: 'Privát',
      56: 'Regionálne mesto',
      57: 'Okresné mesto',
      58: 'Veľké mesto',
      59: 'Mesto',
      60: 'Obec',
      61: 'Osada',
      62: 'Mestský obvod',
      63: 'Horáreň',
      64: 'Zubár',
      65: 'Predajňa bicyklov',
      66: 'Stojan na bicykle',
      67: 'Prenájom bicyklov',
      68: 'Predaj alkoholu',
      69: 'Umenie',
      70: 'Pekáreň',
      71: 'Starostlivosť o krásu',
      72: 'Postele',
      73: 'Nápoje',
      74: 'Kníhkupectvo',
      75: 'Butik',
      76: 'Mäsiarstvo',
      77: 'Predaj áut',
      78: 'Autoservis',
      79: 'Charita',
      80: 'Drogéria',
      81: 'Oblečenie',
      82: 'Počítače',
      83: 'Cukrovinky',
      84: 'Kopírovanie',
      85: 'Záclony a závesy',
      86: 'Delikatesy',
      87: 'Obchodný dom',
      89: 'Čistiareň',
      90: 'Domáce výrobky',
      91: 'Elektronika',
      92: 'Erotika',
      93: 'Firemná predajňa',
      94: 'Farmárske produkty',
      95: 'Kvetinárstvo',
      96: 'Obrazy',
      98: 'funeral_directors',
      99: 'Nábytok',
      100: 'Záhradné centrum',
      101: 'Rozličný tovar',
      102: 'Darčeková predajňa',
      103: 'glaziery',
      104: 'Ovocie, zelenina',
      105: 'Kaderníctvo',
      106: 'Železiarstvo',
      107: 'Načúvacie pomôcky',
      108: 'HI-FI',
      109: 'Zmrzlina',
      110: 'interior_decoration',
      111: 'Zlatníctvo',
      112: 'Kiosk',
      113: 'Kuchynské potreby',
      114: 'Práčovňa',
      115: 'Nákupné centrum',
      116: 'Masáže',
      117: 'Mobilné telefóny',
      118: 'money_lender',
      119: 'Motocykle',
      120: 'Hudobné nástroje',
      121: 'Noviny',
      122: 'Optika',
      124: 'Outdoor',
      125: 'Farby',
      126: 'pawnbroker',
      127: 'Zvieratá',
      128: 'Plody mora',
      129: 'Second hand',
      130: 'Obuv',
      131: 'Športové potreby',
      132: 'Papiernictvo',
      133: 'Tetovanie',
      134: 'Hračkárstvo',
      135: 'Stavebniny',
      136: 'vacant',
      137: 'Vysávače',
      138: 'variety_store',
      139: 'Video/DVD',
      140: 'ZOO',
      141: 'Horská chata',
      142: 'Atrakcia',
      143: 'Toalety',
      144: 'Telefón',
      145: 'Miestny úrad',
      146: 'Väznica',
      147: 'Trhovisko',
      148: 'Bar',
      149: 'Kaviareň',
      150: 'Verejný gril',
      151: 'Pitná voda',
      152: 'Taxi',
      153: 'Knižnica',
      154: 'Umývačka áut',
      155: 'Veterinár',
      156: 'Semafor',
      157: 'Železničná zástavka',
      158: 'Železničné priecestie',
      159: 'Zástavka električky',
      160: 'Heliport',
      161: 'Vodárenská veža',
      162: 'Veterný mlyn',
      163: 'Sauna',
      164: 'Čerpacia stanica LPG',
      166: 'Park pre psov',
      167: 'Športové centrum',
      168: 'Kurzy golfu',
      169: 'Štadión',
      170: 'Ihrisko',
      171: 'Vodný park',
      172: 'Vypúšťanie lodí',
      173: 'Rybolov',
      174: 'Park',
      175: 'Detské ihrisko',
      176: 'Záhrada',
      177: 'Verejná plocha',
      178: 'Klzisko',
      179: 'Mini-golf',
      180: 'Tanec',
      181: 'Základná škola',
      182: '9pin',
      183: 'Bowling',
      184: 'Americký futbal',
      185: 'Lukostreľba',
      186: 'Atletika',
      187: 'australian_football',
      188: 'Baseball',
      189: 'Basketball',
      190: 'Plážový volejbal',
      191: 'Bmx',
      192: 'Boules',
      193: 'Bowls',
      194: 'canadian_football',
      195: 'Kanoe',
      196: 'Šach',
      197: 'Lezenie',
      198: 'Kriket',
      199: 'cricket_nets',
      200: 'croquet',
      201: 'Bicyklovanie',
      202: 'Potápanie',
      203: 'Preteky psov',
      204: 'Jazdenie na koni',
      205: 'Futbal',
      206: 'gaelic_football',
      207: 'Golf',
      208: 'Gymnastika',
      209: 'Hokej',
      210: 'horseshoes',
      211: 'Dostihy',
      212: 'ice_stock',
      213: 'korfball',
      214: 'Motorky',
      215: 'Multi',
      216: 'orienteering',
      217: 'paddle_tennis',
      218: 'Paragliding',
      219: 'pelota',
      220: 'racquet',
      221: 'rowing',
      222: 'rugby_league',
      223: 'rugby_union',
      224: 'Streľba',
      225: 'Korčuľovanie',
      226: 'Skateboard',
      227: 'Lyžovanie',
      228: 'Futbal',
      229: 'Plávanie',
      230: 'Stolný tenis',
      231: 'Hádzaná',
      232: 'Tenis',
      233: 'Tobogan',
      234: 'Volejbal',
      235: 'Vodné lyžovanie',
      236: 'Univerzita',
      237: 'Materská škola',
      238: 'Stredná škola',
      239: 'Autoškola',
      240: 'Kaplnka',
      241: 'Miesto na piknik',
      242: 'Miesto s ohniskom',
      243: 'Lokalita',
      244: 'Vodopád',
      245: 'Jazero',
      246: 'Priehrada',
      248: 'Prírodná rezervácia',
      249: 'Prírodná pamiatka',
      250: 'Chránený areál',
      251: 'Chránená krajinná oblasť',
      252: 'Národný park',
      253: 'Automat na mlieko',
      254: 'Významné mokriny (RAMSAR)',
      255: 'Adresné body',
      256: 'Banícka šachta',
      257: 'Štôlňa',
      258: 'Studňa',
      259: 'Kríž',
      260: 'Svätyňa',
      261: 'Posilňovňa',
      262: 'Paroplynová elektráreň',
      263: 'Kaštieľ',
      264: 'Geomorfologické členenie',
      265: 'Vojenský bunker',
      266: 'Príjazd/Výjazd z diaľnice',
      267: 'Sochy',
      268: 'Komín',
      269: 'Paragliding',
      270: 'Závesné lietanie',
      271: 'Krmelec',
      272: 'Ohnisko',
      273: 'Bedminton/Squash',
      274: 'Rázcestník',
      275: 'Nabíjacia stanica pre bicykle',
    },
  },

  external: {
    openInExternal: 'Zdieľať / otvoriť v ext. aplikácii',
    osm: 'OpenStreetMap',
    oma: 'OMA',
    googleMaps: 'Google Mapy',
    hiking_sk: 'Hiking.sk',
    zbgis: 'ZBGIS',
    of1950: 'Historick� ortofotomapa',
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
      `Nastala chyba pri spracovaní výsledkov vyhľadávania: ${err}`,
    buttonTitle: 'Hľadať',
  },

  embed: {
    code: 'Vložte na vašu stránku tento html kód:',
    example: 'Výsledok bude vyzerať následovne:',
    dimensions: 'Veľkosť:',
    height: 'Výška:',
    width: 'Šírka:',
    enableFeatures: 'Povoliť funkcie:',
    enableSearch: 'vyhľadávanie',
    enableMapSwitch: 'prepínanie vrstiev mapy',
    enableLocateMe: 'nájdenie vlastnej pozície',
  },

  tips: {
    previous: 'Predošlý tip',
    next: 'Ďalší tip',
    prevent: 'Nabudúce nezobrazovať',
    errorLoading: 'Tip sa nepodarilo načítať.',
  },

  supportUs: {
    explanation:
      'Mapový portál Freemap tvoria ľudia bezodplatne vo svojom voľnom čase. Na fungovanie a prevádzku je však potrebný hardware a služby komerčných spoločností.',
    account: 'Bankové spojenie:',
    paypal: 'Prispieť cez PayPal',
    thanks: 'Za každý príspevok vám budeme veľmi vďační.',
    registration: 'Registrované na MV/VVS/1-900/90-34343 dňa 2.10.2009',
  },

  gpxExport: {
    export: 'Stiahnuť',
    exportToDrive: 'Uložiť do Google Drive',
    exportToDropbox: 'Uložit do Dropboxu',
    exportError: ({ err }) => `Chyba exportovania GPX: ${err}`,
    what: {
      plannedRoute: 'vyhľadanú trasu',
      plannedRouteWithStops: 'vyhľadanú trasu so zastávkami',
      objects: 'objekty (POI)',
      pictures: 'fotografie (vo viditeľnej časti mapy)',
      drawingLines: 'kreslenie - čiary',
      areaMeasurement: 'kreslenie - polygóny',
      drawingPoints: 'kreslenie - body',
      tracking: 'sledovanie',
      gpx: 'GPX trasu',
    },
    disabledAlert:
      'Aktívne sú iba voľby, ktorých objekty sa nachádzajú na mape.',
    blockedPopup: 'Prehliadač zablokoval otvorenie okna.',
    exportedToDropbox: 'GPX súbor bol uložený do Dropboxu.',
    exportedToGdrive: 'GPX súbor bol uložený do Google Drive.',
  },

  logIn: {
    with: {
      facebook: 'Prihlásiť sa pomocou Facebooku',
      google: 'Prihlásiť sa pomocou Googlu',
      osm: 'Prihlásiť sa pomocou OpenStreetMap',
    },
    enablePopup:
      'Prosím, povoľte vo vašom prehliadači pop-up okná pre túto stránku.',
    success: 'Boli ste úspešne prihlásený.',
    logInError: ({ err }) => `Nepodarilo sa prihlásiť: ${err}`,
    logInError2: 'Nepodarilo sa prihlásiť.',
    logOutError: ({ err }) => `Nepodarilo sa odhlásiť: ${err}`,
    verifyError: ({ err }) => `Nepodarilo sa overiť prihlásenie: ${err}`,
  },

  logOut: {
    success: 'Boli ste úspešne odhlásený.',
  },

  mapLayers: {
    layers: 'Vrstvy',
    photoFilterWarning: 'Filter fotografií je aktívny',
    minZoomWarning: (minZoom) => `Dostupné až od priblíženia ${minZoom}`,
    letters: {
      A: 'Automapa',
      T: 'Turistická',
      C: 'Cyklomapa',
      K: 'Bežkárska',
      S: 'Z lietadla',
      Z: 'Ortofotomozaika SR',
      O: 'OpenStreetMap',
      M: 'mtbmap.cz',
      p: 'OpenTopoMap',
      d: 'Verejná doprava (ÖPNV)',
      h: 'Historická',
      X: 'Turistika + Cyklo + Bežky',
      i: 'Interaktívna vrstva',
      I: 'Fotografie',
      l: 'Lesné cesty NLC (SK)',
      n1: 'Názvy (auto)',
      n2: 'Názvy (turistika)',
      n3: 'Názvy (cyklo)',
      g: 'OSM GPS stopy',
      t: 'Turistické trasy',
      c: 'Cyklotrasy',
      q: 'OpenSnowMap',
      r: 'Render. klienti',
      s0: 'Strava (Všetko)',
      s1: 'Strava (Cyklojazdy)',
      s2: 'Strava (Beh)',
      s3: 'Strava (Vodné aktivity)',
      s4: 'Strava (Zimné aktivity)',
      w: 'Wikipedia',
      e: 'Tieňovanie DMR5.0 (SK)',
    },
    type: {
      map: 'mapa',
      data: 'dáta',
      photos: 'fotografie',
    },
    attr: {
      freemap: '©\xa0Freemap Slovakia',
      osmData: '©\xa0prispievatelia OpenStreetMap',
      srtm: '©\xa0SRTM',
      hot: '©\xa0Humanitárny tím OpenStreetMap',
    },
  },

  elevationChart: {
    distance: 'Vzdialenosť [km]',
    ele: `Nadm. výška [${masl}]`,
    fetchError: ({ err }) =>
      `Nastala chyba pri získavaní výškového profilu: ${err}`,
  },

  errorCatcher: {
    html: (ticketId) => `${getErrorMarkup(ticketId)}
      <p>
        Akcie:
      </p>
      <ul>
        <li><a href="">znovu načítať poslednú stránku</a></li>
        <li><a href="/">znovu načítať úvodnú stránku</a></li>
        <li><a href="/?reset-local-storage">zmazať lokálne dáta a znovunačítať úvodnú stránku</a></li>
      </ul>
    `,
  },

  osm: {
    fetchingError: ({ err }) => `Nastala chyba pri získavaní OSM dát: ${err}`,
  },

  roadDetails: {
    roadType: 'Typ cesty:',
    surface: 'Povrch:',
    suitableBikeType: 'Vhodný typ bicykla:',
    lastChange: 'Posledná zmena:',
    showDetails: 'Zobraziť detaily na osm.org',
    surfaces: {
      asphalt: 'asfalt',
      gravel: 'štrk',
      fine_gravel: 'jemný štrk',
      dirt: 'hlina',
      ground: 'hlina',
      cobblestone: 'dlažba',
      compacted: 'spevnený',
      paved: 'spevnený',
      unknown: 'neznámy',
      unpaved: 'nespevnený',
      'concrete:plates': 'betónové platne',
      concrete: 'betón',
      grass: 'trávnatý',
    },
    trackClasses: {
      motorway: 'diaľnica',
      trunk: 'rýchlostná cesta',
      primary: 'cesta I. triedy',
      secondary: 'cesta II. triedy',
      tertiary: 'cesta III. triedy',
      service: 'prístupová',
      unclassified: 'prístupová',
      residential: 'prístupová',
      grade1: 'kvalitná spevnená cesta (1. stupeň)',
      grade2: 'udržiavaná spevnená cesta  (2. stupeň)',
      grade3: 'spevnená cesta  (3. stupeň)',
      grade4: 'poľná cesta/zvážnica (4. stupeň)',
      grade5: 'ťažko priechodná/zarastená cesta (5. stupeň)',
      path: 'chodník',
      footway: 'chodník',
      pedestrian: 'pešia zóna',
      unknown: 'neznámy',
      living_street: 'Obytná zóna',
      construction: 'Vo výstavbe',
    },
    bicycleTypes: {
      'road-bike': 'cestný',
      'trekking-bike': 'trekkingový',
      'mtb-bike': 'horský',
      'no-bike': 'vjazd na bicykli zakázaný',
      unknown: 'neznámy',
    },
  },

  tracking: {
    unauthenticatedError:
      'Prosím, prihláste sa, aby ste mohli spravovať vaše zariadenia.',
    trackedDevices: {
      button: 'Sledované zariadenia',
      modalTitle: 'Sledované zariadenia',
      desc:
        'Tu môžete spravovať sledované zariadenia, aby ste videli pozíciu svojich priateľov.',
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
        <p>
          Zadefinujte tokeny sledovania, aby ste mohli zdieľať pozíciu vášho
          zariadenia <i>{deviceName}</i> s vašimi priateľmi.
        </p>
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
      delete: 'Zmazať zariadenie?',
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
            <FontAwesomeIcon icon="key" />.
          </p>
          <hr />
          <p>
            Do vášho trackera (napríklad{' '}
            <a href="https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking">
              Locus
            </a>{' '}
            alebo OsmAnd) vložte nasledujúcu URL:{' '}
            <code>
              {process.env.API_URL}/tracking/track/<i>token</i>
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
            V prípade trackera TK102B, nakonfigurujte ho na adresu{' '}
            <code>
              {process.env?.API_URL?.replace(/https?:\/\//, '')?.replace(
                /:\d+$/,
                '',
              )}
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
  pdfExport: {
    export: 'Exportovať',
    exportError: ({ err }) => `Chyba exportovania mapy: ${err}`,
    exporting: 'Prosím počkajte, mapa sa exportuje…',
    exported: ({ url }) => (
      <>
        Export mapy je dokončený.{' '}
        <Alert.Link href={url} target="_blank">
          Otvoriť.
        </Alert.Link>
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
      skiTrails: 'Lyžiarské trasy',
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
          <li>Exportuje sa nová outdoorova mapa.</li>
          <li>Export mapy môže trvať aj desiatky sekúnd.</li>
          <li>
            Pri publikovaní mapy je nutné uviesť jej licenciu:
            <br />
            <em>
              mapa ©{' '}
              <Alert.Link
                href="https://www.freemap.sk/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Freemap Slovakia
              </Alert.Link>
              , dáta{' '}
              <Alert.Link
                href="https://osm.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
              >
                © prispievatelia OpenStreetMap
              </Alert.Link>
              , © SRTM
            </em>
          </li>
        </ul>{' '}
      </>
    ),
  },

  maps: {
    noMap: 'Žiadna mapa',
    create: 'Uložiť ako…',
    save: 'Uložiť',
    rename: 'Premenovať',
    delete: 'Zmazať',
    namePrompt: 'Názov mapy:',
    deleteConfirm: 'Naozaj si prajete vymazať túto mapu?',
    fetchError: ({ err }) => `Nastala chyba pri načítavani mapy: ${err}`,
    fetchListError: ({ err }) => `Nastala chyba pri načítavani máp: ${err}`,
    deleteError: ({ err }) => `Nastala chyba pri mazaní mapy: ${err}`,
    renameError: ({ err }) => `Nastala chyba pri premenovávani mapy: ${err}`,
    createError: ({ err }) => `Nastala chyba pri ukladaní mapy: ${err}`,
    saveError: ({ err }) => `Nastala chyba pri ukladaní mapy: ${err}`,
  },

  legend: {
    body: () => (
      <>
        Legenda k mape <i>Turistika + Cyklo + Bežky</i>:
      </>
    ),
  },

  contacts: {
    ngo: 'Občianske združenie',
    registered: 'Registrované na MV/VVS/1-900/90-34343 dňa 2.10.2009',
    bankAccount: 'Bankové spojenie',
    generalContact: 'Všeobecné kontakty',
    board: 'Predstavenstvo',
    boardMemebers: 'Členovia predstavenstva',
    president: 'Predseda',
    vicepresident: 'Podpredseda',
    secretary: 'Tajomník',
  },
};

function numberize(n: number, words: [string, string, string]) {
  return n < 1 ? words[0] : n < 2 ? words[1] : n < 5 ? words[2] : words[0];
}

export default sk;
