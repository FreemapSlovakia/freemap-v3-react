/* eslint-disable no-template-curly-in-string */

export default {
  general: {
    elevationProfile: 'Výškovy profil',
    save: 'Uložiť',
    cancel: 'Zrušiť',
    modify: 'Upraviť',
    delete: 'Zmazať',
    remove: 'Odstrániť',
    close: 'Zavrieť',
    exitFullscreen: 'Zrušiť zobrazenie na celú obrazovku',
    fullscreen: 'Na celú obrazovku',
    yes: 'Áno',
    no: 'Nie',
    masl: 'm.n.m.',
    copyCode: 'Skopírovať kód',
    loading: 'Načítavam…',
    ok: 'OK',
    preventShowingAgain: 'Už viac nezobrazovať',
    closeWithoutSaving: 'Zavrieť okno bez uloženia zmien?',
    back: 'Späť',
  },

  tools: {
    tools: 'Nástroje',
    routePlanner: 'Vyhľadávač trás',
    objects: 'Miesta',
    gallery: 'Fotografie',
    measurement: 'Meranie',
    trackViewer: 'Prehliadač trás (GPX)',
    infoPoint: 'Bod v mape',
    changesets: 'Zmeny v mape',
    mapDetails: 'Detaily v mape',
  },

  routePlanner: {
    start: 'Štart',
    finish: 'Cieľ',
    point: {
      pick: 'Vybrať na mape',
      current: 'Tvoja poloha',
      home: 'Domov',
    },
    transportType: {
      car: 'Auto, vrátane spoplatnených ciest',
      'car-free': 'Auto, mimo spoplatnených ciest',
      imhd: 'MHD (vo vývoji)',
      bike: 'Bicykel',
      'foot-stroller': 'S kočíkom / vozíčkom',
      nordic: 'Bežky',
      ski: 'Zjazdové lyžovanie',
      foot: 'Pešo',
    },
    alternative: 'Alternatíva',
    distance: 'Vzdialenosť: {value} km',
    duration: 'Čas: {h} h {m} m',
    removeMidpoint: 'Odstrániť zastávku?',
    noHomeAlert: 'Najprv si musíte nastaviť domovskú polohu.',
    showMidpointHint: 'Pre pridanie medzizastávky potiahnite úsek cesty na zvolené miesto.',
    gpsError: 'Nepodarilo sa získať aktuálnu polohu.',
    routeNotFound: 'Cez zvolené body sa nepodarilo vyhľadať trasu. Skúste zmeniť parametre alebo posunúť body trasy.',
    fetchingError: 'Nastala chyba pri hľadaní trasy: {err}',
  },

  more: {
    more: 'Ďalšie',
    logOut: 'Odhlásiť {name}',
    logIn: 'Prihlásenie',
    settings: 'Nastavenia',
    gpxExport: 'Exportovať do GPX',
    mapExports: 'Exporty mapy',
    shareMap: 'Zdieľať mapu',
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
    github: 'Freemap na GitHub-e',
    automaticLanguage: 'Automaticky',
  },

  main: {
    clearMap: 'Vyčistiť mapu',
    close: 'Zavrieť',
    closeTool: 'Zavrieť nástroj',
    locateMe: 'Kde som?',
    zoomIn: 'Priblížiť mapu',
    zoomOut: 'Oddialiť mapu',
    devInfo: 'Toto je testovacia verzia portálu Freemap Slovakia. Pre ostrú verziu prejdite na <a href="https://www.freemap.sk/">www.freemap.sk</a>.',
  },

  gallery: {
    filter: 'Filter',
    allPhotos: 'Všetky fotky',
    upload: 'Nahrať',
    f: {
      firstUploaded: 'od prvej nahranej',
      lastUploaded: 'od posledne nahranej',
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
      openInNewWindow: 'Otvoriť v novom okne',
      uploaded: 'Nahral {username} dňa {createdAt}',
      captured: 'Odfotené dňa {takenAt}',
      deletePrompt: 'Zmazať obrázok?',
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
      uploading: 'Nahrávam ({n})',
      upload: 'Nahrať',
      rules: `
        <p>Potiahnite sem fotky, alebo sem kliknite pre ich výber.</p>
        <ul>
          <li>Nevkladajte príliš malé obrázky (miniatúry). Maximálny rozmer nie je obmedzený, je však obmedzená veľkosť súboru na max. 10MB. Väčšie súbory server odmietne.</li>
          <li>Vkladajte len fotografie krajiny, vrátane dokumentačných fotografií. Portréty a makro-fotografie sú považované za nevhodný obsah a budú bez varovania vymazané.</li>
          <li>Zvýšenú pozornosť venujte tomu, aby ste nahrávali výlučne vlastnú tvorbu.</li>
          <li>Nahraté fotografie sú ďaľej šírené pod licenciou CC-BY-SA 2.0.</li>
          <li>Prevádzkovateľ Freemap.sk sa týmto zbavuje akejkoľvek zodpovednosti a nezodpovedá za priame ani nepriame škody vzniknuté uverejnením fotografie v galérii, za fotografiu nesie plnú zodpovednosť osoba, ktorá fotografiu na server uložila.</li>
          <li>Prevádzkovateľ si vyhradzuje právo upraviť popis, názov, pozíciu a tagy fotografie, alebo fotografiu vymazať, ak je jej obsah nevhodný (porušuje tieto pravidlá).</li>
          <li>Prevádzkovateľ si vyhradzuje právo zrušiť konto v prípade, že používateľ opakovane porušuje pravidlá galérie uverejňovaním nevhodného obsahu.</li>
        </ul>
      `,
      success: 'Fotografie boli úspešne nahrané.',
    },
    locationPicking: {
      title: 'Zvoľte pozíciu fotografie',
    },
    layerHint: 'Pre zapnutie vrstvy s fotografiami zvoľte Fotografie z ponuky vrstiev (alebo stlačte klávesy Shift+F).',
    deletingError: 'Nastala chyba pri mazaní obrázka: {err}',
    tagsFetchingError: 'Nastala chyba pri načítavaní tagov: {err}',
    pictureFetchingError: 'Nastala chyba pri načítavaní fotky: {err}',
    picturesFetchingError: 'Nastala chyba pri načítavaní fotiek: {err}',
    savingError: 'Nastala chyba pri ukladaní fotky: {err}',
    commentAddingError: 'Nastala chyba pri pridávani komentára: {err}',
    ratingError: 'Nastala chyba pri hodnotení: {err}',
    unauthenticatedError: 'Pre nahrávanie fotiek do galérie musíte byť prihlásený.',
  },

  measurement: {
    distance: 'Vzdialenosť',
    elevation: 'Výška a poloha',
    area: 'Plocha',
    elevationLine: 'Nadmorská výška:',
    removePoint: 'Odstrániť bod?',
    elevationFetchError: 'Nastala chyba pri získavani výšky bodu: {err}',
  },

  trackViewer: {
    upload: 'Nahrať',
    moreInfo: 'Viac info',
    share: 'Zdieľať',
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
      durationValue: '{h} hodín {m} minút',
    },
    uploadModal: {
      title: 'Nahrať trasu',
      drop: 'Potiahnite sem .gpx súbor, alebo sem kliknite pre jeho výber.',
    },
    shareModal: {
      title: 'Zdieľať trasu',
      description: 'Trasa je dostupná na následovnej adrese:',
    },
    fetchingError: 'Nastala chyba pri získavaní záznamu trasy: {err}',
    savingError: 'Nepodarilo sa uložiť trasu: {err}',
    tooBigError: 'Veľkosť nahraného súboru prevyšuje limit {maxSize} MB.',
  },

  infoPoint: {
    modify: 'Zmeniť popis',
    edit: {
      title: 'Zmeniť popis infobodu',
      label: 'Popis infobodu:',
      example: 'Tu sa stretneme',
      hint: 'Ak nechcete aby mal infobod popis, nechajte pole popisu prázdne.',
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
      imgFormat: {
        label: 'Formát dlaždíc pre automapu, turistickú a cyklistickú mapu:',
        hint: 'Mapové dlaždice vyzerajú lepšie v PNG formáte, ale sú asi 4x väčšie než JPEG dlaždice. '
          + 'Pri pomalom internete preto odporúčame zvoliť JPEG.',
      },
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
      noAuthInfo: 'Dostupné iba pre prihásených používateľov.',
    },
    general: {
      tips: 'Zobrazovať tipy po otvorení stránky',
    },
    expert: {
      switch: 'Expertný mód:',
      off: 'Vypnutý',
      on: 'Zapnutý',
      offInfo: 'V expertnom móde sú dostupné nástroje pre pokročilých používateľov.',
      overlayOpacity: 'Viditeľnosť vrstvy:',
      trackViewerEleSmoothing: {
        label: 'Úroveň vyhladzovania pri výpočte celkovej nastúpanej/naklesanej nadmorskej výšky v prehliadači trás: {value}',
        info: 'Pri hodnote 1 sa berú do úvahy všetky nadmorské výšky samostatne. Vyššie hodnoty zodpovedajú šírke plávajúceho okna ktorým sa vyhladzujú nadmorské výšky.',
      },
    },
    saveSuccess: 'Zmeny boli uložené.',
    savingError: 'Nastala chyba pri ukladani nastavení: {err}',
  },

  changesets: {
    allAuthors: 'Všetci autori',
    download: 'Stiahnuť zmeny',
    olderThan: "return `${days} dn${days === 3 ? 'i' : 'í'}`",
    olderThanFull: "return `Zmeny novšie ako ${days} dn${days === 3 ? 'i' : 'í'}`",
    notFound: 'Neboli nájdené žiadne zmeny.',
    fetchError: 'Nastala chyba pri získavaní zmien: {err}',
  },

  mapDetails: {
    road: 'Info o ceste',
    notFound: 'Nebola nájdená žiadna cesta.',
    fetchingError: 'Nastala chyba pri získavaní detailov o ceste: {err}',
  },

  objects: {
    type: 'Typ',
    lowZoomAlert: 'Vyhľadávanie miest je možné až od priblíženia úrovne 12.',
    fetchingError: 'Nastala chyba pri získavani objektov: {err}',
  },

  external: {
    openInExternal: 'Otvoriť v externej aplikácii',
    osm: 'OpenStreetMap',
    oma: 'OMA',
    googleMaps: 'Google Mapy',
    hiking_sk: 'Hiking.sk',
    'mapy_cz-aerial': 'Mapy.cz Letecká',
    josm: 'Editor JOSM',
    id: 'Editor iD',
    'routing-debug': 'Ladenie navigácie',
  },

  search: {
    inProgress: 'Hľadám…',
    noResults: 'Nenašli sa žiadne výsledky',
    prompt: 'Zadajte lokalitu',
    routeFrom: 'Navigovať odtiaľto',
    routeTo: 'Navigovať sem',
    fetchingError: 'Nastala chyba pri spracovaní výsledkov vyhľadávania: {err}',
  },

  shareMap: {
    label: 'Zvolený pohľad na mapu je dostupný na tejto adrese:',
  },

  embed: {
    code: 'Vložte na vašu stránku tento html kód:',
    example: 'Výsledok bude vyzerať následovne:',
  },

  tips: {
    previous: 'Predošlý tip',
    next: 'Ďalši tip',
    prevent: 'Nabudúce nezobrazovať',
  },

  supportUs: {
    explanation: 'Mapový portál Freemap tvoria ľudia bezodplatne vo svojom voľnom čase. Na fungovanie a prevádzku je však potrebný hardware a služby komerčných spoločností.',
    account: 'Bankové spojenie:',
    paypal: 'Prispieť cez PayPal',
    thanks: 'Za každý príspevok vám budeme veľmi vďační.',
    registration: 'Registrované na MV/VVS/1-900/90-34343 dňa 2.10.2009',
  },

  gpxExport: {
    export: 'Exportovať',
    what: {
      plannedRoute: 'vyhľadanú trasu',
      objects: 'miesta',
      pictures: 'fotografie (vo viditeľnej časti mapy)',
      distanceMeasurement: 'meranie vzdialenosti',
      areaMeasurement: 'meranie plochy',
      elevationMeasurement: 'meranie výšky a polohy',
      infoPoint: 'bod v mape',
    },
  },

  logIn: {
    with: {
      facebook: 'Prihlásiť sa pomocou Facebooku',
      google: 'Prihlásiť sa pomocou Googlu',
      osm: 'Prihlásiť sa pomocou OpenStreetMap',
    },
    success: 'Boli ste úspešne prihlásený.',
    logInError: 'Nepodarilo sa prihlásiť: {err}',
    logInError2: 'Nepodarilo sa prihlásiť.',
    logOutError: 'Nepodarilo sa odhlásiť: {err}',
    verifyError: 'Nepodarilo sa overiť prihlásenie: {err}',
  },

  logOut: {
    success: 'Boli ste úspešne odhlásený.',
  },

  mapLayers: {
    layers: 'Vrstvy',
    photoFilterWarning: 'Filter fotografií je aktívny',
    minZoomWarning: 'Dostupné až od priblíženia {minZoom}',
    base: {
      A: 'Automapa',
      T: 'Turistická',
      C: 'Cyklomapa',
      K: 'Lyžiarska',
      S: 'Satelitná',
      O: 'OpenStreetMap',
      M: 'mtbmap.cz',
      p: 'OpenTopoMap',
      b: 'Humanitárna',
      d: 'Verejná doprava (ÖPNV)',
      i: 'Infomapa',
      j: 'Infomapa ČB',
      h: 'Historická',
    },
    overlay: {
      I: 'Fotografie',
      n: 'Lesné cesty NLC 2016',
      l: 'Lesné cesty NLC',
      g: 'OSM GPS stopy',
      t: 'Turistické trasy',
      c: 'Cyklotrasy',
      q: 'OpenSnowMap',
      r: 'Render. klienti',
      s0: 'Všetko',
      s1: 'Cyklojazdy',
      s2: 'Beh',
      s3: 'Vodné aktivity',
      s4: 'Zimné aktivity',
    },
    type: {
      map: 'mapa',
      data: 'dáta',
      photos: 'fotografie',
    },
    attr: {
      freemap: '© Freemap Slovakia',
      osmData: '© prispievatelia OpenStreetMap',
      srtm: '© SRTM',
      hot: '© Humanitárny tím OpenStreetMap',
    },
  },

  elevationChart: {
    distance: 'Vzdialenosť [km]',
    ele: 'Nadm. výška [m.n.m.]',
    fetchError: 'Nastala chyba pri získavani výškoveho profilu: {err}',
  },

  errorCatcher: {
    html: `
      <h1>Ups!</h1>
      <p>
        Voľačo nedobre sa udialo.
      </p>
      <p>
        Prosíme Ťa, <a href="https://github.com/FreemapSlovakia/freemap-v3-react/issues/new" target="_blank" rel="noopener noreferrer">nahlás nám túto chybu</a>,
        prípadne nám ju pošli na <a href="mailto:freemap@freemap.sk?subject=Nahlásenie%20chyby%20na%20www.freemap.sk">freemap@freemap.sk</a>.
        Nezabudni, prosím, priložiť krátky popis, ako sa ti podarilo vyvolať chybu a nižšieuvedené dáta pre ladenie.
      </p>
      <p>
        Ďakujeme.
      </p>
      Akcie:
      <ul>
        <li><a href="">znovunačítať poslednú stránku</a></li>
        <li><a href="/">znovunačítať úvodnú stránku</a></li>
        <li><a href="/?reset-local-storage">zmazať lokálne dáta a znovunačítať úvodnú stránku</a></li>
      </ul>
      <h2>Dáta pre ladenie</h2>
    `,
  },

  osm: {
    fetchingError: 'Nastala chyba pri získavaní OSM dát: {err}',
  },

  roadDetails: {
    roadType: 'Typ cesty:',
    surface: 'Povrch:',
    suitableBikeType: 'Vhodný typ bicykla:',
    lastChange: 'Posledná zmena:',
    edit: 'Upraviť v editore {id}, alebo {josm}.',
  },
};
