/* eslint-disable no-template-curly-in-string */
import React, { Fragment } from 'react';

const errorMarkup = `<h1>Chyba aplikace</h1>
<p>
  Chyba nám byla automaticky reportována pod ID <b>{ticketId}</b>.
  Můžeš ji nahlásit i na <a href="https://github.com/FreemapSlovakia/freemap-v3-react/issues/new" target="_blank" rel="noopener noreferrer">GitHub</a>,
  případně nám poslat detaily na <a href="mailto:freemap@freemap.sk?subject=Nahlásenie%20chyby%20na%20www.freemap.sk">freemap@freemap.sk</a>.
</p>
<p>
  Děkujeme.
</p>
`;

export default {
  general: {
    elevationProfile: 'Výškový profil',
    save: 'Uložit',
    cancel: 'Zrušit',
    modify: 'Upravit',
    delete: 'Smazat',
    remove: 'Odstranit',
    close: 'Zavřít',
    exitFullscreen: 'Zrušit zobrazení na celou obrazovku',
    fullscreen: 'Na celou obrazovku',
    yes: 'Ano',
    no: 'Ne',
    masl: 'm.n.m.',
    copyCode: 'Zkopírovat kód',
    loading: 'Načítám…',
    ok: 'OK',
    preventShowingAgain: 'Už více nezobrazovat',
    closeWithoutSaving: 'Zavřít okno bez uložení změn?',
    back: 'Zpět',
    internalError: `!HTML!${errorMarkup}`,
    appUpdated: 'Je dostupná aktualizce. Obnovit stránku?',
  },

  tools: {
    tools: 'Nástroje',
    routePlanner: 'Vyhledávač tras',
    objects: 'Místa',
    gallery: 'Fotografie',
    measurement: 'Měření',
    trackViewer: 'Prohlížeč tras (GPX)',
    infoPoint: 'Body v mapě',
    changesets: 'Změny mapě',
    mapDetails: 'Detaily v mapě',
  },

  routePlanner: {
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
      bikesharing: 'Bike sharing (ve vývoji)',
      imhd: 'MHD (ve vývoji)',
      bike: 'Kolo',
      'foot-stroller': 'S kočárkem / vozíčkem',
      nordic: 'Běžky',
      ski: 'Sjezdové lyžování',
      foot: 'Pěšky',
    },
    mode: {
      route: 'Po pořadí',
      trip: 'Návštěva míst',
      roundtrip: 'Návštěva míst (okruh)',
    },
    alternative: 'Alternativa',
    // eslint-disable-next-line
    distance: ({ value }) => <Fragment>Vzdálenost: <b>{value} km</b></Fragment>,
    // eslint-disable-next-line
    duration: ({ h, m }) => <Fragment>Trvání: <b>{h} h {m} m</b></Fragment>,
    // eslint-disable-next-line
    summary: ({ distance, h, m }) => <Fragment>Vzdálenost: <b>{distance} km</b> | Trvání: <b>{h} h {m} m</b></Fragment>,
    noHomeAlert: 'Nejprve si musíte nastavit výchozí polohu.',
    showMidpointHint: 'Pro přidání průchozího bodu přetáhněte úsek silnice na zvolené místo.',
    gpsError: 'Nelze získat aktuální polohu.',
    routeNotFound: 'Přes zvolené body se nepodařilo vyhledat trasu. Zkuste změnit parametry nebo posunout body trasy. ',
    fetchingError: 'Nastala chyba při hledání trasy: {err}',
    maneuverWithName: '{type} {modifier} na {name}',
    maneuverWithoutName: '{type} {modifier}',

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
          <Fragment>
            Příchod: <b>{arrival}</b> | Cena: <b>{price} €</b> | Spoje: {numbers.map((n, i) => <Fragment key={n}>{i > 0 ? ', ' : ''}<b>{n}</b></Fragment>)}
          </Fragment>
        ),
        // eslint-disable-next-line
        full: ({ arrival, price, numbers, total, home, foot, bus, wait }) => (
          <Fragment>
            Příchod: <b>{arrival}</b> | Cena: <b>{price} €</b> | Spoje: {numbers.map((n, i) => <Fragment key={n}>{i > 0 ? ', ' : ''}<b>{n}</b></Fragment>)} | Trvání <b>{total} {numberize(total, ['minut', 'minúta', 'minuty'])}</b><br />Do odchodu: <b>{home}</b>, pěšky: <b>{foot}</b>, MHD: <b>{bus}</b>, čekaní: <b>{wait} {numberize(wait, ['minut', 'minúta', 'minuty'])}</b>
          </Fragment>
        ),
      },
      step: {
        // eslint-disable-next-line
        foot: ({ departure, duration, destination }) => (
          <Fragment>
            o <b>{departure}</b> pěšky <b>{duration} {numberize(duration, ['minut', 'minutu', 'minuty'])}</b> {destination === 'TARGET' ? <b>do cíle</b> : <Fragment>na <b>{destination}</b></Fragment>}
          </Fragment>
        ),
        // eslint-disable-next-line
        bus: ({ departure, type, number, destination }) => (
          <Fragment>
            o <b>{departure}</b> {type} <b>{number}</b> na <b>{destination}</b>
          </Fragment>
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
          <Fragment>
            pěšky <b>{duration} {numberize(duration, ['minut', 'minutu', 'minuty'])}</b> {destination === 'TARGET' ? <b>do cíle</b> : <Fragment>na <b>{destination}</b></Fragment>}
          </Fragment>
        ),
        // eslint-disable-next-line
        bicycle: ({ duration, destination }) => (
          <Fragment>
            kolem <b>{duration} {numberize(duration, ['minut', 'minutu', 'minuty'])}</b> na <b>{destination}</b>
          </Fragment>
        ),
      },
    },
    imhdAttribution: 'trasy linek MHD',
  },

  more: {
    more: 'Další',
    logOut: 'Odhlásit {name}',
    logIn: 'Přihlášení',
    settings: 'Nastavení',
    gpxExport: 'Exportovat do GPX',
    mapExports: 'Exporty mapy',
    shareMap: 'Sdílet mapu',
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
    github: 'Freemap na GitHub-u',
    automaticLanguage: 'Automaticky',
    pdfExport: 'Exportovat do PDF (pro tisk)',
  },

  main: {
    clearMap: 'Vyčistit mapu',
    close: 'Zavřít',
    closeTool: 'Zavřít nástroj',
    locateMe: 'Kde jsem?',
    zoomIn: 'Přiblížit mapu',
    zoomOut: 'Oddálit mapu',
    devInfo: () => <div>Toto je testovací verze portálu Freemap Slovakia. Pro ostrou verzi přejděte na <a href="https://www.freemap.sk/">www.freemap.sk</a>.</div>,
    copyright: 'Licence',
  },

  gallery: {
    filter: 'Filtr',
    allPhotos: 'Všechny fotky',
    upload: 'Nahrát',
    f: {
      firstUploaded: 'od první nahrané',
      lastUploaded: 'od poslední nahrané',
      firstCaptured: 'od nejstarší vyfocena',
      lastCaptured: 'od nejnovější vyfocena',
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
      openInNewWindow: 'Otevřít v novém okně',
      uploaded: 'Nahrál {username} dne {createdAt}',
      captured: 'Odfoceno dne {takenAt}',
      deletePrompt: 'Smazat obrázek?',
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
      uploading: 'Nahrávám ({n})',
      upload: 'Nahrát',
      rules: `
        <p>Zatáhněte sem fotky, nebo sem klikněte pro jejich výběr.</p>
        <ul>
          <li>Nevkládejte příliš malé obrázky (miniatury). Maximální rozměr není omezen, je ale omezena velikost souboru na max. 10MB. Větší soubory server odmítne.</li>
          <li>Vkládejte pouze fotografie krajiny včetně dokumentačních fotografií. Portréty a makro-fotografie jsou považovány za nevhodný obsah a budou bez varování smazány.</li>
          <li>Zvýšenou pozornost věnujte tomu, abyste nahrávali výlučně vlastní tvorbu.</li>
          <li>Zaznam fotografie jsou dále šířeny pod licencí CC-BY-SA 2.0.</li>
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
    layerHint: 'Pro zapnutí vrstvy s fotografiemi zvolte Fotografie z nabídky vrstev (nebo stiskněte klávesy Shift + F).',
    deletingError: 'Nastala chyba při mazání obrázku: {err}',
    tagsFetchingError: 'Nastala chyba při nahrávání tagů: {err}',
    pictureFetchingError: 'Nastala chyba při nahrávání fotky: {err}',
    picturesFetchingError: 'Nastala chyba při nahrávání fotek: {err}',
    savingError: 'Nastala chyba při ukládání fotky: {err}',
    commentAddingError: 'Nastala chyba při přidávání komentáře: {err}',
    ratingError: 'Nastala chyba při hodnocení {err}',
    unauthenticatedError: 'Pro nahrávání fotek do galerie musíte být přihlášen.',
  },

  measurement: {
    distance: 'Vzdálenost',
    elevation: 'Výška a poloha',
    area: 'Plocha',
    elevationLine: 'Nadmořská výška:',
    elevationFetchError: 'Nastala chyba při získávání výšky bodu: {err}',
  },

  trackViewer: {
    upload: 'Nahrát',
    moreInfo: 'Více info',
    share: 'Sdílet',
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
      durationValue: '{h} hodin {m} minut',
    },
    uploadModal: {
      title: 'Nahrát trasu',
      drop: 'Přetáhněte sem .gpx soubor, nebo sem klikněte pro jeho výběr.',
    },
    shareModal: {
      title: 'Sdílet trasu',
      description: 'Trasa je dostupná na následující adrese:',
    },
    fetchingError: 'Nastala chyba při získávání záznamu trasy: {err}',
    savingError: 'Nepodařilo se uložit trasu: {err}',
    tooBigError: 'Velikost nahraného souboru přesahuje limit {maxsize} MB.',
  },

  infoPoint: {
    modify: 'Změnit popis',
    edit: {
      title: 'Změnit popis infobodu',
      label: 'Popis infobodu:',
      example: 'Zde se setkáme',
      hint: 'Pokud nechcete aby měl infobod popis, nechte pole popisu prázdné.',
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
        label: 'Formát dlaždic pro automapu, turistickou a cyklistickou mapu:',
        hint: 'Mapové dlaždice vypadají lépe v PNG formátu, ale jsou asi 4x větší než JPEG dlaždice. '
          + 'Při pomalém internetu proto doporučujeme zvolit JPEG.',
      },
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
        label: 'Úroveň vyhlazování při výpočtu celkové nastoupaných / naklesaných nadmořské výšky v prohlížeči tras: {value}',
        info: 'Při hodnotě 1 se berou v úvahu všechny nadmořské výšky samostatně. Vyšší hodnoty odpovídají šířce plovoucího okna kterým se vyhlazují nadmořské výšky. ',
      },
    },
    saveSuccess: 'Změny byly uloženy.',
    savingError: 'Nastala chyba při ukládání nastavení: {err}',
  },

  changesets: {
    allAuthors: 'Všichni autoři',
    download: 'Stáhnout změny',
    olderThan: ({ days }) => `${days} dn ${days === 3 ? 'i' : 'í'}`,
    olderThanFull: ({ days }) => `Změny novější než ${days} dn ${days === 3 ? 'i' : 'í'}`,
    notFound: 'Nebyly nalezeny žádné změny.',
    fetchError: 'Nastala chyba při získávání změn: {err}',
  },

  mapDetails: {
    road: 'Info o cestě',
    notFound: 'Nebyla nalezena žádná cesta.',
    fetchingError: 'Nastala chyba při získávání detailů o cestě: {err}',
  },

  objects: {
    type: 'Typ',
    lowZoomAlert: {
      message: 'Vyhledávání míst je možné až od přiblížení úrovně 12.',
      zoom: 'Přiblíž',
    },
    fetchingError: 'Nastala chyba při získávání objektů: {err}',
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
      15: 'Pozoruhodnosti',
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
      88: 'Potápěčské potřeby',
      89: 'Čistírna',
      90: 'Domácí výrobky',
      91: 'Elektronika',
      92: 'Erotika',
      93: 'Firemní prodejna',
      94: 'Farmářské produkty',
      95: 'Květinářství',
      96: 'Obrazy',
      97: 'furnace',
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
      118: 'money_lender',
      119: 'Motocykly',
      120: 'Hudební nástroje',
      121: 'Noviny',
      122: 'Optika',
      123: 'Organické potraviny',
      124: 'Outdoor',
      125: 'Barvy',
      126: 'pawnbroker',
      127: 'Zvířata',
      128: 'Plody moře',
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
      187: 'australian_football',
      188: 'Baseball',
      189: 'Basketball',
      190: 'Plážový volejbal',
      191: 'Bmx',
      192: 'Boules',
      193: 'Bowls',
      194: 'canadian_football',
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
      216: 'Orienteering',
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
      266: 'Příchod / Výjezd z dálnice',
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
    openInExternal: 'Otevřít v externí aplikaci',
    osm: 'OpenStreetMap',
    oma: 'OMA',
    googleMaps: 'Google Mapy',
    hiking_sk: 'Hiking.sk',
    mojamapa_sk: 'mojamapa.sk',
    'mapy_cz-aerial': 'Mapy.cz Letecká',
    josm: 'Editor JOSM',
    id: 'Editor iD',
    'routing-debug': 'Ladění navigace',
  },

  search: {
    inProgress: 'Hledám…',
    noResults: 'Nebyly nalezeny žádné výsledky',
    prompt: 'Zadejte lokalitu',
    routeFrom: 'Navigovat odsud',
    routeTo: 'Navigovat sem',
    fetchingError: 'Nastala chyba při zpracování výsledků vyhledávání: {err}',
  },

  shareMap: {
    label: 'Zvolený pohled na mapu je dostupný na adrese:',
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
  },

  supportUs: {
    explanation: 'Mapový portál Freemap tvoří lidé bezplatně ve svém volném čase. Na fungování a provoz je však potřebný hardware a služby komerčních společností. ',
    account: 'Bankovní spojení:',
    paypal: 'Přispět přes PayPal',
    thanks: 'Za každý příspěvek vám budeme velmi vděční.',
    registration: 'Registrované na MV / VVS / 1-900 / 90-34343 dne 2.10.2009',
  },

  gpxExport: {
    export: 'Exportovat',
    what: {
      plannedRoute: 'vyhledanou trasu',
      objects: 'místa',
      pictures: 'fotografie (ve viditelné části mapy)',
      distanceMeasurement: 'měření vzdálenosti',
      areaMeasurement: 'měření plochy',
      elevationMeasurement: 'měření výšky a polohy',
      infoPoint: 'body v mapě',
    },
    disabledAlert: 'Aktivní jsou pouze volby jejichž objekty se nacházejí na mapě.',
  },

  logIn: {
    with: {
      facebook: 'Přihlásit se pomocí Facebooku',
      google: 'Přihlásit se pomocí Googlu',
      osm: 'Přihlásit se pomocí OpenStreetMap',
    },
    success: 'Byli jste úspěšně přihlášen.',
    logInError: 'Nepodařilo se přihlásit: {err}',
    logInError2: 'Nepodařilo se přihlásit.',
    logOutError: 'Nepodařilo se odhlásit: {err}',
    verifyError: 'Nepodařilo se ověřit přihlášení: {err}',
  },

  logOut: {
    success: 'Byli jste úspěšně odhlášen.',
  },

  mapLayers: {
    missingStravaAuth: 'Prosím přihlašte se nejprve na strava.com/heatmap a následně obnovte tuto stránku.',
    layers: 'Vrstvy',
    photoFilterWarning: 'Filtr fotografií je aktivní',
    minZoomWarning: 'Dostupné až od přiblížení {minZoom}',
    base: {
      A: 'Automapa',
      T: 'Turistická',
      C: 'Cyklomapy',
      K: 'Lyžařská',
      S: 'Satelitní',
      O: 'OpenStreetMap',
      M: 'mtbmap.cz',
      p: 'OpenTopoMap',
      d: 'Veřejná doprava (ÖPNV)',
      h: 'Historická',
      X: 'Nová Outdoorová',
    },
    overlay: {
      I: 'Fotografie',
      n: 'Lesní cesty NLC',
      1: 'Názvy (auto)',
      2: 'Názvy (turistika)',
      3: 'Názvy (cyklo)',
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
    fetchError: 'Nastala chyba při získávání výškového profilu: {err}',
  },

  errorCatcher: {
    html: `${errorMarkup}
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
    fetchingError: 'Nastala chyba při získávání OSM dat: {err}',
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
      'concrete: plates': 'betonové desky',
      concrete: 'beton',
      grass: 'travnatý',
    },
    trackClasses: {
      motorway: 'dálnice',
      trunk: 'rychlostní silnice',
      primary: 'silnice I. třídy',
      secondary: 'silnice II. třídy ',
      tertiary: 'silnice III. třídy ',
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
    },
    bicycleTypes: {
      'road-bike': 'silniční',
      'trekking-bike': 'trekové',
      'mtb-bike': 'horský',
      'no-bike': 'vjezd na kole zakázán',
      unknown: 'neznámý',
    },
  },
};

function numberize(n, words) {
  return n < 1 ? words[0] : n < 2 ? words[1] : n < 5 ? words[2] : words[0];
}
