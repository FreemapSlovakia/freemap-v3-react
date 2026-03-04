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
import shared from './cs-shared.js';
import { addError, Messages } from './messagesInterface.js';

const nf00 = new Intl.NumberFormat('cs', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
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
    internalError: ({ ticketId }) => `!HTML!${getErrorMarkup(ticketId)}`,
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
    noCookies: 'Tato funkcionalita vyžaduje přijetí souhlasu cookies.',
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
    areYouSure: 'Jste si jisti?',
    export: 'Exportovat',
    success: 'Hotovo!',
    expiration: 'Expirace',
    privacyPolicy: 'Zásady ochrany osobních údajů',
    newOptionText: 'Přidat %value%',
    deleteButtonText: 'Odebrat %value% ze seznamu',
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
    trackViewer: 'Prohlížeč tras (GPX)',
    changesets: 'Změny v mapě',
    mapDetails: 'Detaily v mapě',
    tracking: 'Sledování',
    maps: 'Moje mapy',
  },

  routePlanner: {
    ghParams: {
      tripParameters: 'Parametry výletu',
      seed: 'Random seed',
      distance: 'Orientační vzdálenost',
      isochroneParameters: 'Parametry izochronů',
      buckets: 'Počet dělení',
      timeLimit: 'Časový limit',
      distanceLimit: 'Limit vzdálenosti',
    },
    milestones: 'Kilometrovník',
    start: 'Start',
    finish: 'Cíl',
    swap: 'Prohodit start a cíl',
    point: {
      pick: 'Vybrat na mapě',
      current: 'Tvá poloha',
      home: 'Domů',
      point: 'Bod trasy',
    },
    transportType: {
      car: 'Auto',
      car4wd: 'Auto 4x4',
      bike: 'Kolo',
      foot: 'Pěšky',
      hiking: 'Turistika',
      mtb: 'Horské kolo',
      racingbike: 'Silniční kolo',
      motorcycle: 'Motocykl',
      manual: 'Přímá čára',
    },
    development: 've vývoji',
    mode: {
      route: 'Po pořadí',
      trip: 'Návštěva míst',
      roundtrip: 'Návštěva míst (okruh)',
      'routndtrip-gh': 'Výlet',
      isochrone: 'Izochróny',
    },
    alternative: 'Alternativa',
    distance: ({ value, diff }) => (
      <>
        Vzdálenost:{' '}
        <b>
          {value}
          {diff ? ` (+ ${diff})` : ''}
        </b>
      </>
    ),
    duration: ({ h, m, diff }) => (
      <>
        Trvání:{' '}
        <b>
          {h} h {m} m{diff && ` (+ ${diff.h} h ${diff.m} m)`}
        </b>
      </>
    ),
    summary: ({ distance, h, m }) => (
      <>
        Vzdálenost: <b>{distance}</b> | Trvání:{' '}
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
    fetchingError: ({ err }) =>
      addError(messages, 'Nastala chyba při hledání trasy', err),
    manualTooltip: 'Propojit následující segment přímou čarou',
  },

  mainMenu: {
    title: 'Hlavní menu',
    logOut: 'Odhlásit',
    logIn: 'Přihlášení',
    account: 'Účet',
    mapFeaturesExport: 'Export mapových dat',
    mapExports: 'Mapy pro GPS zařízení',
    embedMap: 'Vložit do webstránky',
    supportUs: 'Podpořit Freemap',
    help: 'Pomoc',
    back: 'Zpět',
    mapLegend: 'Legenda mapy',
    contacts: 'Kontakty',
    facebook: 'Freemap na Facebooku',
    twitter: 'Freemap na Twitteru',
    youtube: 'Freemap na YouTube',
    github: 'Freemap na GitHub-u',
    automaticLanguage: 'Automaticky',
    mapExport: 'Export mapy do obrázku/dokumentu',
    osmWiki: 'Dokumentační projekt OpenStreetMap ',
    wikiLink: 'https://wiki.openstreetmap.org/wiki/Cs:Main_Page',
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
        prompt="Některé funkce mohou vyžadovat cookies. Přijmout:"
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

  gallery: {
    stats: {},

    legend: 'Legenda',
    recentTags: 'Nedávné tagy pro přiřazení:',
    filter: 'Filtr',
    showPhotosFrom: 'Prohlížet fotky',
    showLayer: 'Zobrazit vrstvu',
    upload: 'Nahrát',
    f: {
      '-createdAt': 'od poslední nahrané',
      '-takenAt': 'od nejnovější vyfocené',
      '-rating': 'od největšího hodnocení',
      '-lastCommentedAt': 'od posledního komentáře',
    },
    colorizeBy: 'Vybarvit podle',
    showDirection: 'Ukaž směr focení',
    c: {
      disable: 'Nevybarvit',
      mine: 'Odlišit moje',
      userId: 'Autor',
      rating: 'Hodnocení',
      takenAt: 'Datum vyfocení',
      createdAt: 'Datum nahrání',
      season: 'Roční období',
      premium: 'Prémiové',
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
      premiumOnly:
        'Tuto fotografii zpřístupnil její autor pouze uživatelům s prémiovým přístupem.',
      noComments: 'Bez komentáře',
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
      azimuth: 'Azimut',
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
          <li>Nahrávejte pouze vlastní fotografie nebo fotografie, pro které máte udělen souhlas ke sdílení.</li>
          <li>Popisky nebo komentáře, které se přímo netýkají obsahu načtených fotografií nebo odporují obecně přijímaným zásadám civilizovaného soužití, budou odstraněny. Porušovatelé tohoto pravidla budou varováni a při opakovaném porušování může být jejich účet v aplikaci zrušen.</li>
          <li>Fotografie jsou dále šířeny pod licencí CC BY-SA 4.0.</li>
          <li>Provozovatel Freemap.sk se tímto zbavuje jakékoli odpovědnosti a neodpovídá za přímé ani nepřímé škody vzniklé zveřejněním fotografie v galerii. Za fotografii nese plnou odpovědnost osoba, která fotografii na server uložila.</li>
          <li>Provozovatel si vyhrazuje právo upravit popis, název, pozici a tagy fotografie nebo fotografii vymazat, pokud je její obsah nevhodný (porušuje tato pravidla).</li>
          <li>Provozovatel si vyhrazuje právo zrušit účet v případě, že uživatel opakovaně porušuje pravidla galerie zveřejňováním nevhodného obsahu.</li>
        </ul>
      `,
      success: 'Fotografie byly úspěšně nahrány.',
      showPreview: 'Automaticky zobrazit náhledy (náročnější na výkon a paměť)',
      loadPreview: 'Načíst náhled',
      premium: 'Zpřístupnit pouze uživatelům s prémiovým přístupem',
    },
    locationPicking: {
      title: 'Zvolte pozici fotografie',
    },
    deletingError: ({ err }) =>
      addError(messages, 'Nastala chyba při mazání obrázku', err),
    tagsFetchingError: ({ err }) =>
      addError(messages, 'Nastala chyba při nahrávání tagů', err),
    pictureFetchingError: ({ err }) =>
      addError(messages, 'Nastala chyba při nahrávání fotky', err),
    picturesFetchingError: ({ err }) =>
      addError(messages, 'Nastala chyba při nahrávání fotek', err),
    savingError: ({ err }) =>
      addError(messages, 'Nastala chyba při ukládání fotky', err),
    commentAddingError: ({ err }) =>
      addError(messages, 'Nastala chyba při přidávání komentáře', err),
    ratingError: ({ err }) =>
      addError(messages, 'Nastala chyba při hodnocení', err),
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
      pano: 'Panoráma',
      premium: 'Prémiové',
    },
    noPicturesFound: 'Na tomto místě nebyly nalezeny žádné fotky.',
    linkToWww: 'fotografie na www.freemap.sk',
    linkToImage: 'soubor fotografie',
    allMyPhotos: {
      premium: 'Zařadit všechny mé fotky do prémiového obsahu',
      free: 'Zpřístupnit všechny mé fotky každému',
    },
    showLegend: 'Zobrazit legendu zabarvení',
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
    shareToast:
      'Trasa byla uložena na server a můžete ji sdílet zkopírovaním URL stránky.',
    fetchingError: ({ err }) =>
      addError(messages, 'Nastala chyba při získávání záznamu trasy', err),
    savingError: ({ err }) =>
      addError(messages, 'Nepodařilo se uložit trasu', err),
    loadingError: 'Soubor se nepodařilo načíst.',
    onlyOne: 'Očekává se pouze jeden GPX soubor.',
    wrongFormat: 'Nahraný soubor musí mít příponu .gpx',
    info: () => <TrackViewerDetails />,
    tooBigError: 'Nahraný soubor je příliš velký.',
  },

  drawing: {
    modify: 'Vlastnosti',
    edit: {
      title: 'Vlastnosti',
      color: 'Barva',
      label: 'Popis',
      width: 'Šířka',
      hint: 'Pokud chcete popis odstránit, nechte pole popisu prázdné.',
      type: 'Typ geometrie',
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
  },

  purchases: {
    purchases: 'Nákupy',
    premiumExpired: (at) => <>Váš prémiový přístup vypršel {at}</>,
    date: 'Datum',
    item: 'Položka',
    notPremiumYet: 'Ještě nemáte prémiový přístup.',
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
    },
    general: {
      tips: 'Zobrazovat tipy po otevření stránky',
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

  changesets: {
    allAuthors: 'Všichni autoři',
    tooBig:
      'Požadavek na získání změn může vrátit spoustu záznamů. Zkuste přiblížit mapu, zvolit méně dní, nebo zadat konkrétního autora.',
    olderThan: ({ days }) => `${days} dn ${days === 3 ? 'i' : 'í'}`,
    olderThanFull: ({ days }) =>
      `Změny novější než ${days} dn ${days === 3 ? 'i' : 'í'}`,
    notFound: 'Nebyly nalezeny žádné změny.',
    fetchError: ({ err }) =>
      addError(messages, 'Nastala chyba při získávání změn', err),
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
  },

  objects: {
    type: 'Typ',
    lowZoomAlert: {
      message: ({ minZoom }) =>
        `Vyhledávání míst je možné až od přiblížení úrovně ${minZoom}.`,
      zoom: 'Přiblíž',
    },
    tooManyPoints: ({ limit }) => `Výsledek byl omezen na ${limit} objektů.`,
    fetchingError: ({ err }) =>
      addError(messages, 'Nastala chyba při získávání objektů', err),
    icon: {
      pin: 'Špendlík',
      ring: 'Kruhová',
      square: 'Čtvercová',
    },
  },

  external: {
    openInExternal: 'Sdílet / otevřít v ext. aplikaci',
    osm: 'OpenStreetMap',
    oma: 'OMA',
    googleMaps: 'Google Mapy',
    hiking_sk: 'Hiking.sk',
    zbgis: 'ZBGIS',
    mapy_cz: 'Mapy.com',
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
    },
  },

  embed: {
    code: 'Vložte na vaši stránku tento html kód:',
    example: 'Výsledek bude vypadat následovně:',
    dimensions: 'Velikost',
    height: 'Výška',
    width: 'Šířka',
    enableFeatures: 'Povolit funkce',
    enableSearch: 'vyhledávání',
    enableMapSwitch: 'přepínání vrstev mapy',
    enableLocateMe: 'nalezení vlastní pozice',
  },

  documents: {
    errorLoading: 'Dokument se nepodařilo načíst.',
  },

  exportMapFeatures: {
    download: 'Stáhnout',
    format: 'Formát',
    target: 'Cíl',
    exportError: ({ err }) => addError(messages, 'Chyba exportu', err),
    what: {
      plannedRoute: 'vyhledanou trasu',
      plannedRouteWithStops: 'se zastávkami',
      objects: 'objekty (POI)',
      pictures: 'fotografie (ve viditelné části mapy)',
      drawingLines: 'kreslení - čáry',
      drawingAreas: 'kreslení - polygony',
      drawingPoints: 'kreslení - body',
      tracking: 'sledování',
      gpx: 'GPX trasu',
      search: 'zvýrazněný prvek mapy',
    },
    disabledAlert:
      'Aktivní jsou pouze volby jejichž objekty se nacházejí na mapě.',
    licenseAlert:
      'Exportovaný soubor může podléhat různým licencím, například licenci OpenStreetMap. Prosím dodržte podmínky těchto licencí při sdílení vyexportovaného souboru.',
    exportedToDropbox: 'Soubor byl uložen do Dropboxu.',
    exportedToGdrive: 'Soubor byl uložen do Google Drive.',
    garmin: {
      courseName: 'Název kurzu',
      description: 'Popis',
      activityType: 'Typ aktivity',
      at: {
        running: 'Běh',
        hiking: 'Turistika',
        other: 'Jiné',
        mountain_biking: 'Horská cyklistika',
        trailRunning: 'Trailový běh',
        roadCycling: 'Silniční cyklistika',
        gravelCycling: 'Štěrková cyklistika',
      },
      revoked: 'Export kurzu do Garminu byl zrušen.',
      connectPrompt:
        'Garmin účet ještě nemáte připojen. Chcete jej připojit nyní?',
      authPrompt:
        'Nejste ještě přihlášen Garminon. Přejete se přihlásit tetaz?',
    },
  },

  auth: {
    provider: {
      facebook: 'Facebook',
      google: 'Google',
      osm: 'OpenStreetMap',
      garmin: 'Garmin',
    },
    logIn: {
      with: 'Vyberte poskytovatele přihlášení',
      success: 'Byli jste úspěšně přihlášen.',
      logInError: ({ err }) =>
        addError(messages, 'Nepodařilo se přihlásit', err),
      logInError2: 'Nepodařilo se přihlásit.',
      verifyError: ({ err }) =>
        addError(messages, 'Nepodařilo se ověřit přihlášení', err),
    },
    logOut: {
      success: 'Byli jste úspěšně odhlášen.',
      error: ({ err }) => addError(messages, 'Nepodařilo se odhlásit', err),
    },
    connect: {
      label: 'Pripojit',
      success: 'Pripojené',
    },
    disconnect: {
      label: 'Odpojit',
      success: 'Odpojené',
    },
  },

  mapLayers: {
    showAll: 'Zobrazit všechny mapy',
    settings: 'Nastavení map',
    layers: 'Mapy',
    switch: 'Mapy',
    photoFilterWarning: 'Filtr fotografií je aktivní',
    interactiveLayerWarning: 'Datová vrstva je skryta',
    minZoomWarning: (minZoom) => `Dostupné až od přiblížení ${minZoom}`,
    letters: {
      A: 'Automapa',
      T: 'Turistická',
      C: 'Cyklomapa',
      K: 'Běžkárska',
      S: 'Letecká',
      Z: 'Letecká',
      J1: 'Ortofotomozaika SR (1. cyklus)',
      J2: 'Ortofotomozaika SR (2. cyklus)',
      O: 'OpenStreetMap',
      d: 'Veřejná doprava (ÖPNV)',
      X: outdoorMap,
      i: 'Datová vrstva',
      I: 'Fotografie',
      l1: 'Lesní cesty NLC (2017)',
      l2: 'Lesní cesty NLC',
      t: 'Turistické trasy',
      c: 'Cyklotrasy',
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
    layerSettings: 'Mapové vrstvy',
    customMaps: 'Vlastní mapy',
    base: 'Základní vrstvy',
    overlay: 'Překryvné vrstvy',
    url: 'Šablona URL',
    minZoom: 'Minimální přiblížení',
    maxNativeZoom: 'Maximální přirozené přiblížení',
    extraScales: 'Další rozlišení',
    scaleWithDpi: 'Škálovat podle DPI',
    zIndex: 'Z-Index',
    generalSettings: 'Obecná nastavení',
    maxZoom: 'Maximální přiblížení',
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

  tracking: {
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
      storageWarning:
        'Pozor, seznam zařízení je promítnut pouze do URL stránky. Pokud si ho přejete uložit, využijte funkci "Moje mapy".',
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
        <>
          Vytvořte sledovací tokeny, abyste mohli sdílet polohu{' '}
          <i>{deviceName}</i> s přáteli.
        </>
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
            dáte sledovací token (ten lze vygenerovat tlačítkem <FaKey />
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
              {process.env['API_URL']}/tracking/track/<i>token</i>
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
      token: 'Sledovací token',
      name: 'Název',
      maxAge: 'Maximální doba',
      maxCount: 'Maximální počet',
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
  mapExport: {
    advancedSettings: 'Rozšířená nastavení',
    styles: 'Styly datové vrstvy',
    exportError: ({ err }) => addError(messages, 'Chyba exportu mapy', err),
    exporting: 'Prosím počkejte, mapa se exportuje…',
    exported: ({ url }) => (
      <>
        Export mapy je dokončen.{' '}
        <AlertLink href={url} target="_blank">
          Otevřít.
        </AlertLink>
      </>
    ),
    area: 'Exportovat oblast',
    areas: {
      visible: 'Viditelnou oblast mapy',
      pinned: 'Plochu obsahující označený polygon (kreslení)',
    },
    format: 'Formát',
    layersTitle: 'Volitelné vrstvy',
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
    mapScale: 'Rozlišení mapy',
    alert: (licence) => (
      <>
        Upozornění:
        <ul>
          <li>
            Exportuje se mapa <i>{outdoorMap}</i>.
          </li>
          <li>Export mapy může trvat i desítky sekund.</li>
          <li>
            Při publikované mapy je do ní nutno uvést její licenci:
            <br />
            <em>{licence}</em>
          </li>
        </ul>{' '}
      </>
    ),
  },

  maps: {
    legacy: 'zastaralá',
    legacyMapWarning: ({ from, to }) => (
      <>
        Zobrazená mapa <b>{messages.mapLayers.letters[from]}</b> je zastaralá.
        Přepnout na moderní <b>{messages.mapLayers.letters[to]}</b>?
      </>
    ),
    noMapFound: 'Žádná mapa nenalezena',
    save: 'Uložit',
    delete: 'Smazat',
    disconnect: 'Odpojit',
    deleteConfirm: (name) => `Opravdu si přejete smazat mapu ${name}?`,
    fetchError: ({ err }) =>
      addError(messages, 'Nastala chyba při nahrávání mapy', err),
    fetchListError: ({ err }) =>
      addError(messages, 'Nastala chyba při nahrávání map', err),
    deleteError: ({ err }) =>
      addError(messages, 'Nastala chyba při mazání mapy', err),
    renameError: ({ err }) =>
      addError(messages, 'Nastala chyba při přejmenování mapy', err),
    createError: ({ err }) =>
      addError(messages, 'Nastala chyba při ukládání mapy', err),
    saveError: ({ err }) =>
      addError(messages, 'Nastala chyba při ukládání mapy', err),
    loadToEmpty: 'Načíst do čisté mapy',
    loadInclMapAndPosition:
      'Načíst včetně uložené podkladové mapy a její pozice',
    savedMaps: 'Uložené mapy',
    newMap: 'Nová mapa',
    SomeMap: ({ name }) => (
      <>
        Mapa <i>{name}</i>
      </>
    ),
    writers: 'Editori',
    conflictError: 'Mapa byla mezitím modifikována.',
    addWriter: 'Přidat editora',
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

  legend: {
    body: ({ name }) => (
      <>
        Legenda k mapě <i>{name}</i>
      </>
    ),
    outdoorMap: {
      accommodation: 'Ubytování',
      'gastro-poi': 'Jídlo a pití',
      institution: 'Instituce',
      sport: 'Sport',
      'natural-poi': 'Přírodní zajímavosti',
      poi: 'Ostatní zajímavosti',
      landcover: 'Krajinný pokryv',
      borders: 'Hranice',
      'roads-and-paths': 'Cesty a stezky',
      railway: 'Železnice',
      terrain: 'Terén',
      water: 'Voda',
      other: 'Ostatní',
    },
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
            title="Strava Heatmap, podrobné stínování Slovenska a Česka ve vysokém rozlišení, nejvyšší úrovně přiblížení Outdoor mapy, nejvyšší úrovně přiblížení ortofotomap Slovenska a Česka, různé mapy založené na WMS"
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
  },

  credits: {
    buyCredits: 'Koupit kredity',
    amount: 'Kredity',
    credits: 'kreditů',
    buy: 'Koupit',
    purchase: {
      success: ({ amount }) => (
        <>Váš kredit byl navýšen o {nf00.format(amount)}.</>
      ),
    },
    youHaveCredits: (amount, explainCredits) => (
      <>
        Máte {amount}{' '}
        {explainCredits ? (
          <CreditsText
            credits="kreditů"
            help="Kredity můžete využít ke [export offline map]."
          />
        ) : (
          'kreditů'
        )}
        .
      </>
    ),
  },

  offline: {
    offlineMode: 'Režim offline',
    cachingActive: 'Nahrávání do cache aktivní',
    clearCache: 'Smazat cache',
    dataSource: 'Zdroj dát',
    networkOnly: 'Pouze internet',
    networkFirst: 'Nejdřív internet',
    cacheFirst: 'Nejdřív cache',
    cacheOnly: 'Pouze cache',
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
  downloadMap: {
    downloadMap: 'Export offline máp',
    format: 'Formát',
    map: 'Mapa',
    downloadArea: 'Exportovat',
    area: {
      visible: 'Viditelná oblast',
      byPolygon: 'Oblast pokrytá vybraným polygonem',
    },
    name: 'Název',
    zoomRange: 'Rozsah přiblížení',
    scale: 'Měřítko',
    email: 'Vaše e-mailová adresa',
    emailInfo: 'Váš e-mail použijeme k zaslání odkazu ke stažení.',
    success:
      'Mapa se připravuje. Po dokončení vám bude e-mailem doručen odkaz ke stažení.',
    summaryTiles: 'Dlaždic',
    summaryPrice: (amount) => <>Celková cena: {amount} kreditů</>,
  },
};

export default messages;
