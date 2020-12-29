/* eslint-disable */

import { ChangesetDetails } from 'fm3/components/ChangesetDetails';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { RoadDetails } from 'fm3/components/RoadDetails';
import { TrackViewerDetails } from 'fm3/components/TrackViewerDetails';
import { latLonToString } from 'fm3/geoutils';
import { Fragment } from 'react';
import Alert from 'react-bootstrap/Alert';
import { Messages } from './messagesInterface';

const nf01 = Intl.NumberFormat('cs', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const nf33 = Intl.NumberFormat('cs', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

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

const cs: Messages = {
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
    internalError: ({ ticketId }) => `!HTML!${getErrorMarkup(ticketId)}`,
    processorError: ({ err }) => `Chyba aplikace: ${err}`,
    seconds: 'sekundy',
    minutes: 'minuty',
    meters: 'metre',
    createdAt: 'Vytvořeno',
    actions: 'Akce',
    add: 'Přidat nové',
    clear: 'Vyčistit',
    convertToDrawing: 'Zkonvertovat na kreslení',
    simplifyPrompt:
      'Prosím zadejte faktor zjednodušení. Zadejte nulu pro vynechání zjednodušení.',
    copyUrl: 'Kopírovat URL',
    savingError: ({ err }) => `Chyba ukládání: ${err}`,
    loadError: ({ err }) => `Chyba nahrávání: ${err}`,
    deleteError: ({ err }) => `Chyba pří mazání: ${err}`,
    deleted: 'Smazané.',
    saved: 'Uložené.',
  },

  tools: {
    none: 'Zavřít nástroj',
    tools: 'Nástroje',
    routePlanner: 'Vyhledávač tras',
    objects: 'Objekty (POI)',
    photos: 'Fotografie',
    measurement: 'Kreslení a měření',
    trackViewer: 'Prohlížeč tras (GPX)',
    changesets: 'Změny mapě',
    mapDetails: 'Detaily v mapě',
    tracking: 'Sledování',
    maps: (
      <>
        Moje mapy <FontAwesomeIcon icon="flask" className="text-warning" />
      </>
    ),
  },

  routePlanner: {
    milestones: 'Kilometrovník',
    start: 'Start',
    finish: 'Cíl',
    swap: 'Prohodit start a cíl',
    point: {
      pick: 'Vybrat na mapě',
      current: 'Tvá poloha',
      home: 'Domů',
    },
    transportType: {
      car: 'Auto, včetně zpoplatněných silnic',
      'car-free': 'Auto, mimo zpoplatněných silnic',
      bikesharing: 'Sdílené kolo',
      imhd: 'MHD v Bratislavě',
      'bike-osm': 'Kolo',
      bike: 'Cyklouristika',
      'foot-stroller': 'S kočárkem / Inv. vozík',
      nordic: 'Běžky',
      ski: 'Sjezdové lyžování',
      'foot-osm': 'Pěšky',
      foot: 'Turistika',
    },
    development: 've vývoji',
    mode: {
      route: 'Po pořadí',
      trip: 'Návštěva míst',
      roundtrip: 'Návštěva míst (okruh)',
    },
    alternative: 'Alternativa',
    // eslint-disable-next-line
    distance: ({ value, diff }) => (
      <>
        Vzdálenost:{' '}
        <b>
          {value} km{diff ? ` (+ ${diff} km)` : ''}
        </b>
      </>
    ),
    // eslint-disable-next-line
    duration: ({ h, m, diff }) => (
      <>
        Trvání:{' '}
        <b>
          {h} h {m} m{diff && ` (+ ${diff.h} h ${diff.m} m)`}
        </b>
      </>
    ),
    // eslint-disable-next-line
    summary: ({ distance, h, m }) => (
      <>
        Vzdálenost: <b>{distance} km</b> | Trvání:{' '}
        <b>
          {h} h {m} m
        </b>
      </>
    ),
    noHomeAlert: {
      msg: 'Nejprve si musíte nastavit výchozí polohu.',
      setHome: 'Nastavit',
    },
    showMidpointHint:
      'Pro přidání průchozího bodu přetáhněte úsek silnice na zvolené místo.',
    gpsError: 'Nelze získat aktuální polohu.',
    routeNotFound:
      'Přes zvolené body se nepodařilo vyhledat trasu. Zkuste změnit parametry nebo posunout body trasy. ',
    fetchingError: ({ err }) => `Nastala chyba při hledání trasy: ${err}`,
    maneuverWithName: ({ type, modifier, name }) =>
      `${type} ${modifier} na ${name}`,
    maneuverWithoutName: ({ type, modifier }) => `${type} ${modifier}`,

    maneuver: {
      types: {
        turn: 'odbočte',
        'new name': 'jděte',
        depart: 'začněte',
        arrive: 'ukončete',
        merge: 'pokračujte',
        // 'ramp':
        'on ramp': 'jděte na příjezdovou cestu',
        'off ramp': 'opusťte příjezdovou cestu',
        fork: 'zvolte cestu',
        'end of road': 'pokračujte',
        // 'use lane':
        continue: 'pokračujte',
        roundabout: 'vejděte na kruhový objezd',
        rotary: 'vjeďte na okružní cestu',
        'roundabout turn': 'na kruhovém objezdu odbočte',
        // 'notification':
        'exit rotary': 'opusťte okružní cestu', // undocumented
        'exit roundabout': 'opusťte kruhový objezd', // undocumented
        notification: 'poznámka',
        'use lane': 'použij jízdní pruh',
      },

      modifiers: {
        uturn: 'otočte se',
        'sharp right': 'prudce doprava',
        'slight right': 'mírně doprava',
        right: 'doprava',
        'sharp left': 'prudce doleva',
        'slight left': 'mírně doleva',
        left: 'doleva',
        straight: 'rovně',
      },
    },

    imhd: {
      total: {
        // eslint-disable-next-line
        short: ({ arrival, price, numbers }) => (
          <>
            Příjezd: <b>{arrival}</b> | Cena: <b>{price} €</b> | Spoje:{' '}
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
            Příjezd: <b>{arrival}</b> | Cena: <b>{price} €</b> | Spoje:{' '}
            {numbers?.map((n, i) => (
              <Fragment key={n}>
                {i > 0 ? ', ' : ''}
                <b>{n}</b>
              </Fragment>
            ))}{' '}
            | Trvání{' '}
            <b>
              {total} {numberize(total, ['minut', 'minúta', 'minuty'])}
            </b>
            <br />
            Do odjezdu: <b>{home}</b>, pěšky: <b>{foot}</b>, MHD: <b>{bus}</b>,
            čekaní:{' '}
            <b>
              {wait} {numberize(wait, ['minut', 'minúta', 'minuty'])}
            </b>
          </>
        ),
      },
      step: {
        // eslint-disable-next-line
        foot: ({ departure, duration, destination }) => (
          <>
            v <b>{departure}</b> pěšky{' '}
            {duration !== undefined && (
              <b>
                {duration} {numberize(duration, ['minut', 'minutu', 'minuty'])}
              </b>
            )}{' '}
            {destination === 'TARGET' ? (
              <b>do cíle</b>
            ) : (
              <>
                do <b>{destination}</b>
              </>
            )}
          </>
        ),
        // eslint-disable-next-line
        bus: ({ departure, type, number, destination }) => (
          <>
            v <b>{departure}</b> {type} <b>{number}</b> do <b>{destination}</b>
          </>
        ),
      },
      type: {
        bus: 'autobusem',
        tram: 'tramvají',
        trolleybus: 'trolejbusem',
        foot: 'pěšky',
      },
    },
    bikesharing: {
      step: {
        // eslint-disable-next-line
        foot: ({ duration, destination }) => (
          <>
            pěšky{' '}
            {duration !== undefined && (
              <b>
                {duration} {numberize(duration, ['minut', 'minutu', 'minuty'])}
              </b>
            )}{' '}
            {destination === 'TARGET' ? (
              <b>do cíle</b>
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
            kolem{' '}
            {duration !== undefined && (
              <b>
                {duration} {numberize(duration, ['minut', 'minutu', 'minuty'])}
              </b>
            )}{' '}
            na <b>{destination}</b>
          </>
        ),
      },
    },
    imhdAttribution: 'trasy linek MHD',
  },

  more: {
    more: 'Další',
    logOut: (name) => `Odhlásit ${name}`,
    logIn: 'Přihlášení',
    settings: 'Nastavení',
    gpxExport: 'Exportovat do GPX',
    mapExports: 'Mapa pro GPS zařízení',
    embedMap: 'Vložit do webstránky',
    reportMapError: 'Nahlásit chybu zobrazení v mapě',
    reportAppError: 'Nahlásit chybu v portálu',
    supportUs: 'Podpořit Freemap',
    help: 'Pomoc',
    back: 'Zpět',
    mapLegend: 'Legenda mapy',
    contacts: 'Kontakty',
    tips: 'Tipy',
    facebook: 'Freemap na Facebooku',
    twitter: 'Freemap na Twitteru',
    youtube: 'Freemap na YouTube',
    github: 'Freemap na GitHub-u',
    automaticLanguage: 'Automaticky',
    pdfExport: 'Exportovat mapu',
  },

  main: {
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
    copyright: 'Licence',
  },

  gallery: {
    filter: 'Filtr',
    allPhotos: 'Všechny fotky',
    upload: 'Nahrát',
    f: {
      firstUploaded: 'od první nahrané',
      lastUploaded: 'od poslední nahrané',
      firstCaptured: 'od nejstarší vyfocené',
      lastCaptured: 'od nejnovější vyfocené',
      leastRated: 'od nejmenšího hodnocení',
      mostRated: 'od největšího hodnocení',
    },
    viewer: {
      title: 'Fotografie',
      comments: 'Komentáře',
      newComment: 'Nový komentář',
      addComment: 'Přidej',
      yourRating: 'Tvé hodnocení:',
      showOnTheMap: 'Ukázat na mapě',
      openInNewWindow: 'Otevřít v…',
      uploaded: ({ username, createdAt }) => (
        <>
          Nahrál {username} dne {createdAt}
        </>
      ),
      captured: (takenAt) => <>Vyfoceno dne {takenAt}</>,
      deletePrompt: 'Smazat obrázek?',
      modify: 'Úprava',
    },
    editForm: {
      name: 'Název',
      description: 'Popis',
      takenAt: {
        datetime: 'Datum a čas focení',
        date: 'Datum focení',
        time: 'Čas focení',
      },
      location: 'Pozice',
      tags: 'Tagy',
      setLocation: 'Nastavit pozici',
    },
    uploadModal: {
      title: 'Nahrát fotky',
      uploading: (n) => `Nahrávám (${n})`,
      upload: 'Nahrát',
      rules: `
        <p>Zatáhněte sem fotky, nebo sem klikněte pro jejich výběr.</p>
        <ul>
          <li>Nevkládejte příliš malé obrázky (miniatury). Maximální rozměr není omezen, je ale omezena velikost souboru na 10MB. Větší soubory server odmítne.</li>
          <li>Vkládejte pouze fotografie krajiny včetně dokumentačních fotografií. Portréty a makro-fotografie jsou považovány za nevhodný obsah a budou bez varování smazány.</li>
          <li>Zvýšenou pozornost věnujte tomu, abyste nahrávali výlučně vlastní tvorbu.</li>
          <li>Fotografie jsou dále šířeny pod licencí CC-BY-SA 2.0.</li>
          <li>Provozovatel Freemap.sk se tímto zbavuje jakékoli odpovědnosti a neodpovídá za přímé ani nepřímé škody vzniklé zveřejněním fotografie v galerii. Za fotografii nese plnou odpovědnost osoba, která fotografii na server uložila.</li>
          <li>Provozovatel si vyhrazuje právo upravit popis, název, pozici a tagy fotografie nebo fotografii vymazat, pokud je její obsah nevhodný (porušuje tato pravidla).</li>
          <li>Provozovatel si vyhrazuje právo zrušit účet v případě, že uživatel opakovaně porušuje pravidla galerie zveřejňováním nevhodného obsahu.</li>
        </ul>
      `,
      success: 'Fotografie byly úspěšně nahrány.',
      showPreview: 'Zobrazit náhledy (náročnější na výkon a paměť)',
    },
    locationPicking: {
      title: 'Zvolte pozici fotografie',
    },
    layerHint:
      'Pro zapnutí vrstvy s fotografiemi zvolte Fotografie z nabídky vrstev (nebo stiskněte klávesy Shift + F).',
    deletingError: ({ err }) => `Nastala chyba při mazání obrázku: ${err}`,
    tagsFetchingError: ({ err }) => `Nastala chyba při nahrávání tagů: ${err}`,
    pictureFetchingError: ({ err }) =>
      `Nastala chyba při nahrávání fotky: ${err}`,
    picturesFetchingError: ({ err }) =>
      `Nastala chyba při nahrávání fotek: ${err}`,
    savingError: ({ err }) => `Nastala chyba při ukládání fotky: ${err}`,
    commentAddingError: ({ err }) =>
      `Nastala chyba při přidávání komentáře: ${err}`,
    ratingError: ({ err }) => `Nastala chyba při hodnocení ${err}`,
    unauthenticatedError:
      'Pro nahrávání fotek do galerie musíte být přihlášen.',
    missingPositionError: 'Chyba pozice.',
    invalidPositionError: 'Nesprávný formát souřadnic.',
    invalidTakenAt: 'Nevalidní datum a čas focení.',
    filterModal: {
      title: 'Filtr fotografií',
      tag: 'Tag',
      createdAt: 'Datum nahrání',
      takenAt: 'Datum focení',
      author: 'Autor',
      rating: 'Hodnocení',
      noTags: 'bez tagů',
    },
  },

  measurement: {
    distance: 'Čára',
    elevation: 'Bod',
    area: 'Polygon',
    elevationFetchError: ({ err }) =>
      `Nastala chyba při získávání výšky bodu: ${err}`,
    elevationInfo: ({ elevation, point }) => (
      <>
        {(['D', 'DM', 'DMS'] as const).map((format) => (
          <div key={format}>{latLonToString(point, 'cs', format)}</div>
        ))}
        {elevation != null && (
          <div>
            Nadmořská výška: {nf01.format(elevation)}&nbsp;{masl}
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
        Délka:
        <div>{nf33.format(length * 1000)}&nbsp;m</div>
        <div>{nf33.format(length)}&nbsp;km</div>
      </>
    ),
  },

  trackViewer: {
    upload: 'Nahrát',
    moreInfo: 'Více info',
    share: 'Uložit na server',
    colorizingMode: {
      none: 'Neaktivní',
      elevation: 'Nadmořská výška',
      steepness: 'Sklon',
    },
    details: {
      startTime: 'Čas startu',
      finishTime: 'Čas v cíli',
      duration: 'Trvání',
      distance: 'Vzdálenost',
      avgSpeed: 'Průměrná rychlost',
      minEle: 'Nejnižší bod',
      maxEle: 'Nejvyšší bod',
      uphill: 'Celkové stoupání',
      downhill: 'Celkové klesání',
      durationValue: ({ h, m }) => `${h} hodin ${m} minut`,
    },
    uploadModal: {
      title: 'Nahrát trasu',
      drop: 'Přetáhněte sem .gpx soubor, nebo sem klikněte pro jeho výběr.',
    },
    shareToast: 'Trasa byla uložena na server a můžete ji sdílet.',
    fetchingError: ({ err }) =>
      `Nastala chyba při získávání záznamu trasy: ${err}`,
    savingError: ({ err }) => `Nepodařilo se uložit trasu: ${err}`,
    loadingError: 'Soubor se nepodařilo načíst.',
    onlyOne: 'Očekává se pouze jeden GPX soubor.',
    wrongFormat: 'Nahraný soubor musí mít příponu .gpx',
    info: () => <TrackViewerDetails />,
    tooBigError: 'Nahraný soubor je příliš velký.',
  },

  drawing: {
    modify: 'Změnit popis',
    edit: {
      title: 'Změnit popis',
      label: 'Popis:',
      hint: 'Pokud chcete popis odstránit, nechte pole popisu prázdné.',
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
      overlayPaneOpacity: 'Viditelnost čar na mapě:',
      homeLocation: {
        label: 'Domovská poloha:',
        select: 'Vybrat na mapě',
        undefined: 'neurčená',
      },
    },
    account: {
      name: 'Jméno',
      email: 'E-Mail',
      noAuthInfo: 'Dostupné pouze pro přihlášené uživatele.',
    },
    general: {
      tips: 'Zobrazovat tipy po otevření stránky',
    },
    expertInfo: `
      <div style="text-align: left">
        V expertním módu jsou dostupné nástroje pro pokročilé uživatele, kupříkladu:
        <ul>
          <li>pokročilá nastavení</li>
          <li>extra mapové vrstvy</li>
          <li>extra profily vyhledávače tras</li>
        </ul>
      </div>
    `,
    expert: {
      switch: 'Expertní mód',
      overlayOpacity: 'Viditelnost vrstvy:',
      trackViewerEleSmoothing: {
        label: (value) =>
          `Úroveň vyhlazování při výpočtu celkové nastoupaných / naklesaných metrů v prohlížeči tras: ${value}`,
        info:
          'Při hodnotě 1 se berou v úvahu všechny nadmořské výšky samostatně. Vyšší hodnoty odpovídají šířce plovoucího okna kterým se vyhlazují nadmořské výšky. ',
      },
    },
    saveSuccess: 'Změny byly uloženy.',
    savingError: ({ err }) => `Nastala chyba při ukládání nastavení: ${err}`,
  },

  changesets: {
    allAuthors: 'Všichni autoři',
    download: 'Stáhnout změny',
    olderThan: ({ days }) => `${days} dn ${days === 3 ? 'i' : 'í'}`,
    olderThanFull: ({ days }) =>
      `Změny novější než ${days} dn ${days === 3 ? 'i' : 'í'}`,
    notFound: 'Nebyly nalezeny žádné změny.',
    fetchError: ({ err }) => `Nastala chyba při získávání změn: ${err}`,
    detail: ({ changeset }) => <ChangesetDetails changeset={changeset} />,
    details: {
      author: 'Autor:',
      description: 'Popis:',
      noDescription: 'bez popisu',
      closedAt: 'Čas:',
      moreDetailsOn: ({ osmLink, achaviLink }) => (
        <p>
          Více detailů na {osmLink}, nebo {achaviLink}.
        </p>
      ),
    },
  },

  mapDetails: {
    road: 'Info o cestě',
    notFound: 'Nebyla nalezena žádná cesta.',
    fetchingError: ({ err }) =>
      `Nastala chyba při získávání detailů o cestě: ${err}`,
    detail: ({ element }) => <RoadDetails way={element} />,
  },

  objects: {
    type: 'Typ',
    lowZoomAlert: {
      message: 'Vyhledávání míst je možné až od přiblížení úrovně 12.',
      zoom: 'Přiblíž',
    },
    fetchingError: ({ err }) => `Nastala chyba při získávání objektů: ${err}`,
    categories: {
      1: 'Příroda',
      2: 'Služby',
      3: 'Doprava',
      4: 'Památky',
      5: 'Zdravotnictví',
      6: 'Obchody',
      7: 'Energetika',
      8: 'Ubytování a Stravování',
      9: 'Turismus, turistika',
      10: 'Územní členění',
      11: 'Ostatní',
      12: 'Volný čas',
      13: 'Sport',
      14: 'Vzdělávání',
      15: 'Na kole',
    },
    subcategories: {
      1: 'Jeskyně',
      2: 'Vrch',
      3: 'Čerpací stanice',
      4: 'Restaurace',
      5: 'Hotel',
      6: 'Parkoviště',
      7: 'Letiště',
      8: 'Nádraží',
      9: 'Autobusové nádraží',
      10: 'Autobusová zastávka',
      11: 'Hrad',
      12: 'Zámek',
      13: 'Zřícenina',
      14: 'Muzeum',
      15: 'Pomník',
      16: 'Památník',
      17: 'Lékárna',
      18: 'Nemocnice',
      19: 'Ordinace',
      20: 'Policie',
      21: 'Poliklinika',
      22: 'Hraniční přechod',
      23: 'Nemocnice s pohotovostí',
      24: 'Supermarket',
      26: 'Jaderná elektrárna',
      27: 'Tepelná elektrárna (uhlí)',
      28: 'Vodní elektrárna',
      29: 'Větrná elektrárna',
      30: 'Potraviny',
      31: 'Hasičská stanice',
      32: 'Kostel',
      33: 'Pohostinství',
      34: 'Banka',
      35: 'Bankomat',
      36: 'Rychlé občerstvení',
      39: 'Banka',
      40: 'Výhled',
      41: 'Kemping',
      42: 'Chráněné stromy',
      43: 'Pramen',
      44: 'Rozcestník',
      45: 'Orientační mapa',
      46: 'Útulný',
      47: 'Přístřešek, altán',
      48: 'Poštovní úřad',
      49: 'Památník, bojiště',
      50: 'Myslivecký posed',
      51: 'Vysílač',
      52: 'Rozhledna',
      53: 'Motel',
      54: 'Penzion',
      55: 'Privát',
      56: 'Regionální město',
      57: 'Okresní město',
      58: 'Velké město',
      59: 'Město',
      60: 'Obec',
      61: 'Osada',
      62: 'Městský obvod',
      63: 'Horáreň',
      64: 'Zubař',
      65: 'Prodejna kol',
      66: 'Stojan na kola',
      67: 'Půjčovna kol',
      68: 'Prodej alkoholu',
      69: 'Umění',
      70: 'Pekárna',
      71: 'Péče o krásu',
      72: 'Postele',
      73: 'Nápoje',
      74: 'Knihkupectví',
      75: 'Butik',
      76: 'Řeznictví',
      77: 'Prodej aut',
      78: 'Autoservis',
      79: 'Charita',
      80: 'Drogerie',
      81: 'Oblečení',
      82: 'Počítače',
      83: 'Cukrovinky',
      84: 'Kopírování',
      85: 'Záclony a závěsy',
      86: 'Delikatesy',
      87: 'Obchodní dům',
      89: 'Čistírna',
      90: 'Domácí výrobky',
      91: 'Elektronika',
      92: 'Erotika',
      93: 'Firemní prodejna',
      94: 'Farmářské produkty',
      95: 'Květinářství',
      96: 'Obrazy',
      98: 'funeral_directors',
      99: 'Nábytek',
      100: 'Zahradní centrum',
      101: 'Různé zboží',
      102: 'Dárková prodejna',
      103: 'Glazier',
      104: 'Ovoce, zelenina',
      105: 'Kadeřnictví',
      106: 'Železářství',
      107: 'Naslouchácí pomůcky',
      108: 'HI-FI',
      109: 'Zmrzlina',
      110: 'interior_decoration',
      111: 'Zlatnictví',
      112: 'Kiosk',
      113: 'Kuchyňské potřeby',
      114: 'Prádelna',
      115: 'Nákupní centrum',
      116: 'Masáže',
      117: 'Mobilní telefony',
      118: 'Zastavárna',
      119: 'Motocykly',
      120: 'Hudební nástroje',
      121: 'Noviny',
      122: 'Optika',
      124: 'Outdoor',
      125: 'Barvy',
      126: 'pawnbroker',
      127: 'Zvířata',
      128: 'Mořské plody',
      129: 'Second hand',
      130: 'Obuv',
      131: 'Sportovní potřeby',
      132: 'Papírnictví',
      133: 'Tetování',
      134: 'Hračkářství',
      135: 'Stavebniny',
      136: 'vacant',
      137: 'Vysavače',
      138: 'variety_store',
      139: 'Video / DVD',
      140: 'ZOO',
      141: 'Horská chata',
      142: 'Atrakce',
      143: 'Toalety',
      144: 'Telefon',
      145: 'Místní úřad',
      146: 'Věznice',
      147: 'Tržiště',
      148: 'Bar',
      149: 'Kavárna',
      150: 'Veřejný gril',
      151: 'Pitná voda',
      152: 'Taxi',
      153: 'Knihovna',
      154: 'Myčka aut',
      155: 'Veterinář',
      156: 'Semafor',
      157: 'Železniční zastávka',
      158: 'Železniční přejezd',
      159: 'Praporek tramvaje',
      160: 'Heliport',
      161: 'Vodárenská věž',
      162: 'Větrný mlýn',
      163: 'Sauna',
      164: 'Čerpací stanice LPG',
      166: 'Park pro psy',
      167: 'Sportovní centrum',
      168: 'Kurzy golfu',
      169: 'Stadion',
      170: 'Hřiště',
      171: 'Vodní park',
      172: 'Vypouštění lodí',
      173: 'Rybolov',
      174: 'Park',
      175: 'Dětské hřiště',
      176: 'Zahrada',
      177: 'Veřejná plocha',
      178: 'Kluziště',
      179: 'Mini-golf',
      180: 'Tanec',
      181: 'Základní škola',
      182: '9pin',
      183: 'Bowling',
      184: 'Americký fotbal',
      185: 'Lukostřelba',
      186: 'Atletika',
      187: 'Australský fotbal',
      188: 'Baseball',
      189: 'Basketball',
      190: 'Plážový volejbal',
      191: 'Bmx',
      192: 'Boules',
      193: 'Bowls',
      194: 'Canadian football',
      195: 'Kanoe',
      196: 'Šachy',
      197: 'Lezení',
      198: 'Kriket',
      199: 'cricket_nets',
      200: 'croquet',
      201: 'Kolo',
      202: 'Potápění',
      203: 'Závody psů',
      204: 'Jízda na koni',
      205: 'Fotbal',
      206: 'Galský fotbal',
      207: 'Golf',
      208: 'Gymnastika',
      209: 'Hokej',
      210: 'horseshoes',
      211: 'Dostihy',
      212: 'Metaná',
      213: 'korfball',
      214: 'Motorky',
      215: 'Multi',
      216: 'Orientační běh',
      217: 'paddle_tennis',
      218: 'Paragliding',
      219: 'pelota',
      220: 'racquet',
      221: 'rowing',
      222: 'rugby_league',
      223: 'rugby_union',
      224: 'Střelba',
      225: 'Bruslení',
      226: 'Skateboard',
      227: 'Lyžování',
      228: 'Fotbal',
      229: 'Plavání',
      230: 'Stolní tenis',
      231: 'Házená',
      232: 'Tenis',
      233: 'Tobogan',
      234: 'Volejbal',
      235: 'Vodní lyžování',
      236: 'Univerzita',
      237: 'Mateřská škola',
      238: 'Střední škola',
      239: 'Autoškola',
      240: 'Kaple',
      241: 'Místo na piknik',
      242: 'Místo s ohništěm',
      243: 'Lokalita',
      244: 'Vodopád',
      245: 'Jezero',
      246: 'Přehrada',
      248: 'Přírodní rezervace',
      249: 'Přírodní památka',
      250: 'Chráněný areál',
      251: 'Chráněná krajinná oblast',
      252: 'Národní park',
      253: 'Automat na mléko',
      254: 'Významné mokřiny (Ramsar)',
      255: 'Adresní body',
      256: 'Hornická šachta',
      257: 'Štola',
      258: 'Studna',
      259: 'Kříž',
      260: 'Svatyně',
      261: 'Posilovna',
      262: 'Paroplynová elektrárna',
      263: 'Kaštěl',
      264: 'Geomorfologické členění',
      265: 'Vojenský bunkr',
      266: 'Dálniční nájezd / sjezd',
      267: 'Sochy',
      268: 'Komín',
      269: 'Paragliding',
      270: 'Závěsné létání',
      271: 'Krmelec',
      272: 'Ohniště',
      273: 'Bedminton / Squash',
      274: 'Rozcestník',
      275: 'Nabíjecí stanice pro kola',
    },
  },

  external: {
    openInExternal: 'Sdílet / otevřít v ext. aplikaci',
    osm: 'OpenStreetMap',
    oma: 'OMA',
    googleMaps: 'Google Mapy',
    hiking_sk: 'Hiking.sk',
    zbgis: 'ZBGIS',
    mapy_cz: 'Mapy.cz',
    josm: 'Editor JOSM',
    id: 'Editor iD',
    window: 'Nové okno',
    url: 'Sdílet URL',
    image: 'Sdílet fotografii',
  },

  search: {
    inProgress: 'Hledám…',
    noResults: 'Nebyly nalezeny žádné výsledky',
    prompt: 'Zadejte lokalitu',
    routeFrom: 'Navigovat odsud',
    routeTo: 'Navigovat sem',
    fetchingError: ({ err }) =>
      `Nastala chyba při zpracování výsledků vyhledávání: ${err}`,
    buttonTitle: 'Hledat',
  },

  embed: {
    code: 'Vložte na vaši stránku tento html kód:',
    example: 'Výsledek bude vypadat následovně:',
    dimensions: 'Velikost:',
    height: 'Výška:',
    width: 'Šířka:',
    enableFeatures: 'Povolit funkce:',
    enableSearch: 'vyhledávání',
    enableMapSwitch: 'přepínání vrstev mapy',
    enableLocateMe: 'nalezení vlastní pozice',
  },

  tips: {
    previous: 'Předešlý tip',
    next: 'Další tip',
    prevent: 'Příště nezobrazovat',
    errorLoading: 'Tip se nepodařilo načíst.',
  },

  supportUs: {
    explanation:
      'Mapový portál Freemap tvoří lidé bezplatně ve svém volném čase. Na fungování a provoz je však potřebný hardware a služby komerčních společností. ',
    account: 'Bankovní spojení:',
    paypal: 'Přispět přes PayPal',
    thanks: 'Za každý příspěvek vám budeme velmi vděční.',
    registration: 'Registrované na MV / VVS / 1-900 / 90-34343 dne 2.10.2009',
  },

  gpxExport: {
    export: 'Stáhnout',
    exportToDrive: 'Uložit do Google Drive',
    exportToDropbox: 'Uložit do Dropboxu',
    exportError: ({ err }) => `Chyba exportu GPX: ${err}`,
    what: {
      plannedRoute: 'vyhledanou trasu',
      plannedRouteWithStops: 'vyhledanou trasu se zastávkami',
      objects: 'objekty (POI)',
      pictures: 'fotografie (ve viditelné části mapy)',
      drawingLines: 'kreslení - čáry',
      areaMeasurement: 'kreslení - polygony',
      drawingPoints: 'kreslení - body',
      tracking: 'sledování',
      gpx: 'GPX trasu',
    },
    disabledAlert:
      'Aktivní jsou pouze volby jejichž objekty se nacházejí na mapě.',
    blockedPopup: 'Prohlížeč zablokoval otevření okna.',
    exportedToDropbox: 'GPX soubor byl uložen do Dropboxu.',
    exportedToGdrive: 'GPX soubor byl uložen do Google Drive.',
  },

  logIn: {
    with: {
      facebook: 'Přihlásit se pomocí Facebooku',
      google: 'Přihlásit se pomocí Googlu',
      osm: 'Přihlásit se pomocí OpenStreetMap',
    },
    enablePopup: 'Prosím, povolte v prohlížeči pop-up okna pro tuto stránku.',
    success: 'Byli jste úspěšně přihlášen.',
    logInError: ({ err }) => `Nepodařilo se přihlásit: ${err}`,
    logInError2: 'Nepodařilo se přihlásit.',
    logOutError: ({ err }) => `Nepodařilo se odhlásit: ${err}`,
    verifyError: ({ err }) => `Nepodařilo se ověřit přihlášení: ${err}`,
  },

  logOut: {
    success: 'Byli jste úspěšně odhlášen.',
  },

  mapLayers: {
    layers: 'Vrstvy',
    photoFilterWarning: 'Filtr fotografií je aktivní',
    minZoomWarning: (minZoom) => `Dostupné až od přiblížení ${minZoom}`,
    letters: {
      A: 'Automapa',
      T: 'Turistická',
      C: 'Cyklomapa',
      K: 'Běžkárska',
      S: 'Z letadla',
      Z: 'Ortofotomozaika SR (Z letadla, SK)',
      O: 'OpenStreetMap',
      M: 'mtbmap.cz',
      p: 'OpenTopoMap',
      d: 'Veřejná doprava (ÖPNV)',
      h: 'Historická',
      X: 'Turistika + Cyklo + Běžky',
      i: 'Interaktivní vrstva',
      I: 'Fotografie',
      l: 'Lesní cesty NLC (SK)',
      n1: 'Názvy (auto)',
      n2: 'Názvy (turistika)',
      n3: 'Názvy (cyklo)',
      g: 'OSM GPS stopy',
      t: 'Turistické trasy',
      c: 'Cyklotrasy',
      q: 'OpenSnowMap',
      r: 'Render. klienti ',
      s0: 'Strava (Vše)',
      s1: 'Strava (Cyklojízdy)',
      s2: 'Strava (Běh)',
      s3: 'Strava (Vodní aktivity)',
      s4: 'Strava (Zimní aktivity)',
      w: 'Wikipedia',
      e: 'Stínování DMR5.0 (SK)',
    },
    type: {
      map: 'mapa',
      data: 'data',
      photos: 'fotografie',
    },
    attr: {
      freemap: '©\xa0Freemap Slovakia',
      osmData: '©\xa0přispěvatelé OpenStreetMap',
      srtm: '©\xa0SRTM',
      hot: '©\xa0Humanitární tým OpenStreetMap',
    },
  },

  elevationChart: {
    distance: 'Vzdálenost [km]',
    ele: 'Nadm. výška [m.n.m.] ',
    fetchError: ({ err }) =>
      `Nastala chyba při získávání výškového profilu: ${err}`,
  },

  errorCatcher: {
    html: (ticketId) => `${getErrorMarkup(ticketId)}
      <p>
        Akce:
      </p>
      <ul>
        <li><a href="">znovu načíst poslední stránku</a></li>
        <li><a href="/">znovu načíst úvodní stránku</a></li>
        <li><a href="/?reset-local-storage">smazat lokální data a znovunačíst úvodní stránku</a></li>
      </ul>
    `,
  },
  osm: {
    fetchingError: ({ err }) => `Nastala chyba při získávání OSM dat: ${err}`,
  },

  roadDetails: {
    roadType: 'Typ cesty:',
    surface: 'Povrch:',
    suitableBikeType: 'Vhodný typ kola:',
    lastChange: 'Poslední změna:',
    showDetails: 'Zobrazit detaily na osm.org',
    surfaces: {
      asphalt: 'asfalt',
      gravel: 'štěrk',
      fine_gravel: 'jemný štěrk',
      dirt: 'hlína',
      ground: 'hlína',
      cobblestone: 'dlažba',
      compacted: 'zpevněný',
      paved: 'zpevněný',
      unknown: 'neznámý',
      unpaved: 'nezpevněný',
      'concrete:plates': 'betonové desky',
      concrete: 'beton',
      grass: 'travnatý',
    },
    trackClasses: {
      trunk: 'rychlostní silnice',
      primary: 'silnice I. třídy',
      secondary: 'silnice II. třídy ',
      tertiary: 'silnice III. třídy ',
      motorway: 'dálnice',
      service: 'přístupová',
      unclassified: 'přístupová',
      residential: 'přístupová',
      grade1: 'kvalitní zpevněná cesta (1. stupeň)',
      grade2: 'udržována zpevněná cesta (2. stupeň)',
      grade3: 'zpevněná cesta (3. stupeň)',
      grade4: 'polní cesta / zvážnice (4. stupeň)',
      grade5: 'těžko průchozí / zarostlá cesta (5. stupeň)',
      path: 'chodník',
      footway: 'chodník',
      pedestrian: 'pěší zóna',
      unknown: 'neznámý',
      living_street: 'Obytná zóna',
      construction: 'Ve výstavbě',
    },
    bicycleTypes: {
      'road-bike': 'silniční',
      'trekking-bike': 'trekové',
      'mtb-bike': 'horský',
      'no-bike': 'vjezd na kole zakázán',
      unknown: 'neznámý',
    },
  },

  tracking: {
    unauthenticatedError: 'Pro správu zařízení se musíte přihlásit.',
    trackedDevices: {
      button: 'Sledované',
      modalTitle: 'Sledovaná zařízení',
      desc: 'Nastavte sledovaná zařízení abyste mohli sledovat jejich polohu.',
      modifyTitle: (name) => (
        <>
          Upravit sledované zařízení <i>{name}</i>
        </>
      ),
      createTitle: (name) => (
        <>
          Sleduj zařízení <i>{name}</i>
        </>
      ),
    },
    accessToken: {
      token: 'Sledovací token',
      timeFrom: 'Od',
      timeTo: 'Do',
      listingLabel: 'Název zařízení',
      note: 'Poznámka',
      delete: 'Smasat sledovací token?',
    },
    accessTokens: {
      modalTitle: (deviceName) => (
        <>
          Sledovací tokeny pro <i>{deviceName}</i>
        </>
      ),
      desc: (deviceName) => (
        <p>
          Vytvořte sledovací tokeny, abyste mohli sdílet polohu{' '}
          <i>{deviceName}</i> s přáteli.
        </p>
      ),
      createTitle: (deviceName) => (
        <>
          Přidej sledovací token pro <i>{deviceName}</i>
        </>
      ),
      modifyTitle: ({ token, deviceName }) => (
        <>
          Uprav sledovací token <i>{token}</i> pro <i>{deviceName}</i>
        </>
      ),
    },
    trackedDevice: {
      token: 'Sledovací token',
      label: 'Název',
      fromTime: 'Od',
      maxAge: 'Maximální doba',
      maxCount: 'Maximální počet',
      splitDistance: 'Rozdělit po vzdálenosti',
      splitDuration: 'Rozdělení po době',
      color: 'Barva',
      width: 'Šířka',
    },
    devices: {
      button: 'Moje zařízení',
      modalTitle: 'Moje sledovaná zařízení',
      createTitle: 'Nové zařízení',
      watchTokens: 'Sledovací tokeny',
      watchPrivately: 'Sledovat soukromě',
      watch: 'Sledovat',
      delete: 'Smazat zařízení?',
      modifyTitle: ({ name }) => (
        <>
          Úprava zařízení <i>{name}</i>
        </>
      ),
      desc: () => (
        <>
          <p>
            Spravujte svá zařízení, aby vaši polohu mohli sledovat lidé, kterým
            dáte sledovací token (ten lze vygenerovat tlačítkem{' '}
            <FontAwesomeIcon icon="key" />
            ).
          </p>
          <hr />
          <p>
            Na svém zařízení navštivte toto URL (podporuje např.{' '}
            <a href="https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking">
              Locus
            </a>{' '}
            nebo OsmAnd):{' '}
            <code>
              {process.env.API_URL}/tracking/track/<i>token</i>
            </code>{' '}
            kde místo <i>token</i> doplňte svůj níže uvedený token.
          </p>
          <p>
            Jsou podporovány HTTP metody <code>GET</code> nebo <code>POST</code>{' '}
            s témito parametry (URL-encoded):
          </p>
          <ul>
            <li>
              <code>lat</code> - zeměpisná šířka (povinná)
            </li>
            <li>
              <code>lon</code> - zeměpisná délka (povinná)
            </li>
            <li>
              <code>time</code>, <code>timestamp</code> - čas parsovatelný v
              JavaScriptu nebo Unixový čas v sekunách nebo milisekundách
            </li>
            <li>
              <code>alt</code>, <code>altitude</code> - nadmořská výška v
              metrech
            </li>
            <li>
              <code>speed</code> - rychlost v m/s
            </li>
            <li>
              <code>speedKmh</code> - rychlost v km/h
            </li>
            <li>
              <code>acc</code> - přesnost v meterech
            </li>
            <li>
              <code>hdop</code> - horizontální nepřesnost (HDOP)
            </li>
            <li>
              <code>bearing</code> - azimut ve stupních
            </li>
            <li>
              <code>battery</code> - batterie v procentech
            </li>
            <li>
              <code>gsm_signal</code> - GSM signál v procentech
            </li>
            <li>
              <code>message</code> - zpráva (poznámka)
            </li>
          </ul>
          <hr />
          <p>
            V případě trackeru TK102B, nakonfigurujte jej na adresu{' '}
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
      token: 'Sledovací token',
      name: 'Název',
      maxAge: 'Maximální doba',
      maxCount: 'Maximální počet',
      regenerateToken: 'Obnovit',
      generatedToken: 'bude vygenerován po uložení',
    },
    visual: {
      line: 'Křivka',
      points: 'Body',
      'line+points': 'Křivka + body',
    },
    subscribeNotFound: ({ id }) => (
      <>
        Sledovací token <i>{id}</i> neexistuje.
      </>
    ),
    subscribeError: ({ id }) => (
      <>
        Chyba sledování s tokenem <i>{id}</i>.
      </>
    ),
  },
  pdfExport: {
    export: 'Exportovat',
    exportError: ({ err }) => `Chyba exportu mapy: ${err}`,
    exporting: 'Prosím počkejte, mapa se exportuje…',
    exported: ({ url }) => (
      <>
        Export mapy je dokončen.{' '}
        <Alert.Link href={url} target="_blank">
          Otevřít.
        </Alert.Link>
      </>
    ),
    area: 'Exportovat oblast:',
    areas: {
      visible: 'Viditelnou oblast mapy',
      pinned: 'Plochu obsahující označený polygon (kreslení)',
    },
    format: 'Formát:',
    layersTitle: 'Volitelné vrstvy:',
    layers: {
      contours: 'Vrstevnice',
      shading: 'Stínovaný reliéf',
      hikingTrails: 'Turistické trasy',
      bicycleTrails: 'Cyklotrasy',
      skiTrails: 'Lyžařské trasy',
      horseTrails: 'Jezdecké trasy',
      drawing: 'Kreslení',
      plannedRoute: 'Vyhledanou trasu',
      track: 'GPX trasu',
    },
    mapScale: 'Rozlišení mapy:',
    alert: () => (
      <>
        Upozornění:
        <ul>
          <li>Exportuje se nová outdoorová mapa.</li>
          <li>Export mapy může trvat i desítky sekund.</li>
          <li>
            Při publikované mapy je do ní nutno uvést její licenci:
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
                © přispěvatelé OpenStreetMap
              </Alert.Link>
              , © SRTM
            </em>
          </li>
        </ul>{' '}
      </>
    ),
  },

  maps: {
    noMap: 'Žádná mapa',
    create: 'Uložit jako…',
    save: 'Uložit',
    rename: 'Přejmenovat',
    delete: 'Smazat',
    namePrompt: 'Název mapy:',
    deleteConfirm: 'Opravdu si přejete smazat tuto mapu?',
    fetchError: ({ err }) => `Nastala chyba při nahrávání mapy: ${err}`,
    fetchListError: ({ err }) => `Nastala chyba při nahrávání map: ${err}`,
    deleteError: ({ err }) => `Nastala chyba při mazání mapy: ${err}`,
    renameError: ({ err }) => `Nastala chyba při přejmenování mapy: ${err}`,
    createError: ({ err }) => `Nastala chyba při ukládání mapy: ${err}`,
    saveError: ({ err }) => `Nastala chyba při ukládání mapy: ${err}`,
  },

  legend: {
    body: () => (
      <>
        Legenda k mapě <i>Turistika + Cyklo + Běžky</i>:
      </>
    ),
  },

  contacts: {
    ngo: 'Spolek',
    registered: 'Registrované na MV/VVS/1-900/90-34343 dne 2.10.2009',
    bankAccount: 'Bankovní spojení',
    generalContact: 'Všeobecné kontakty',
    board: 'Představenstvo',
    boardMemebers: 'Členové představenstva',
    president: 'Předseda',
    vicepresident: 'Místopředseda',
    secretary: 'Tajemník',
  },
};

function numberize(n: number, words: [string, string, string]) {
  return n < 1 ? words[0] : n < 2 ? words[1] : n < 5 ? words[2] : words[0];
}

export default cs;
