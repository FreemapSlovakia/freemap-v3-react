/* eslint-disable no-template-curly-in-string */

export default {
  general: {
    elevationProfile: 'Elevation profile',
    save: 'Save',
    cancel: 'Cancel',
    modify: 'Modify',
    delete: 'Delete',
    remove: 'Remove',
    close: 'Close',
    exitFullscreen: 'Exit fullscreen mode',
    fullscreen: 'Fullscreen',
    yes: 'Yes',
    no: 'No',
    masl: 'm.a.s.l.',
    copyCode: 'Copy code',
    loading: 'Loading…',
    ok: 'OK',
    preventShowingAgain: "Don't show next time",
    closeWithoutSaving: 'Close the window with unsaved changes?',
    back: 'Back',
  },

  tools: {
    tools: 'Tools',
    routePlanner: 'Route finder',
    objects: 'Objects (POIs)',
    gallery: 'Photos',
    measurement: 'Measurement',
    trackViewer: 'Track viewer (GPX)',
    infoPoint: 'Pin',
    changesets: 'Map changes',
    mapDetails: 'Map details',
  },

  routePlanner: {
    start: 'Start',
    finish: 'Finish',
    swap: 'Swap start and finish',
    point: {
      pick: 'Select on the map',
      current: 'Your position',
      home: 'Home position',
    },
    transportType: {
      car: 'Car',
      'car-free': 'Car (toll free)',
      imhd: 'Public transport (in devel.)',
      bike: 'Bicycle',
      'foot-stroller': 'Stroller / Wheelchair',
      nordic: 'Nordic skiing',
      ski: 'Downhill skiing',
      foot: 'Foot',
    },
    alternative: 'Alternatíva',
    distance: 'Distance: {value} km',
    duration: 'Duration: {h} h {m} m',
    removeMidpoint: 'Remove this midpoint?',
    noHomeAlert: 'You must first set your home position in settings.',
    showMidpointHint: 'To add a midpoint drag route segment to the desired position.',
    gpsError: 'Error getting your current location.',
    routeNotFound: 'No route found. Try to change parameters or move the route points.',
    fetchingError: 'Error finding the route: {err}',
    maneuverWithName: '{type} {modifier} on {name}',
    maneuverWithoutName: '{type} {modifier}',

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
  },

  more: {
    more: 'More',
    logOut: 'Log out {name}',
    logIn: 'Log in',
    settings: 'Settings',
    gpxExport: 'Export to GPX',
    mapExports: 'Map exports',
    shareMap: 'Share map',
    embedMap: 'Embed map',
    reportMapError: 'Report map problem',
    reportAppError: 'Report application problem',
    supportUs: 'Support Freemap',
    help: 'Help',
    back: 'Back',
    mapLegend: 'Map legend',
    contacts: 'Contacts',
    tips: 'Tips',
    facebook: 'Freemap on Facebook',
    twitter: 'Freemap on Twitter',
    github: 'Freemap on GitHub',
    automaticLanguage: 'Automatic',
  },

  main: {
    clearMap: 'Clear map elements',
    close: 'Close',
    closeTool: 'Close tool',
    locateMe: 'Locate me',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    devInfo: 'This is a testing version of Freemap Slovakia. For production version navigate to <a href="https://www.freemap.sk/">www.freemap.sk</a>.',
  },

  gallery: {
    filter: 'Filter',
    allPhotos: 'All photos',
    upload: 'Upload',
    f: {
      firstUploaded: 'from first uploaded',
      lastUploaded: 'from last uploaded',
      firstCaptured: 'from oldest',
      lastCaptured: 'from newest',
      leastRated: 'from least rated',
      mostRated: 'from most rated',
    },
    viewer: {
      title: 'Photo',
      comments: 'Comments',
      newComment: 'New comment',
      addComment: 'Add',
      yourRating: 'Your rating:',
      showOnTheMap: 'Show in the map',
      openInNewWindow: 'Open in new window',
      uploaded: 'Uploaded by {username} on {createdAt}',
      captured: 'Captured on {takenAt}',
      deletePrompt: 'Delete this picture?',
    },
    editForm: {
      name: 'Name',
      description: 'Description',
      takenAt: {
        datetime: 'Capturing date and time',
        date: 'Capturing date',
        time: 'Capturing time',
      },
      location: 'Location',
      tags: 'Tags',
      setLocation: 'Set the location',
    },
    uploadModal: {
      title: 'Upload photos',
      uploading: 'Uploading ({n})',
      upload: 'Upload',
      rules: `
        <p>Drop your photos here or click here to select them.</p>
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
      success: 'Pictures has been successfuly uploaded.',
    },
    locationPicking: {
      title: 'Select photo location',
    },
    layerHint: 'To show map photo overlay please select Photos from Map layers menu (or press keys Shift+F).',
    deletingError: 'Error deleting photo: {err}',
    tagsFetchingError: 'Error fetching tags: {err}',
    pictureFetchingError: 'Error fetching photo: {err}',
    picturesFetchingError: 'Error fetching photos: {err}',
    savingError: 'Error saving photo: {err}',
    commentAddingError: 'Error adding comment: {err}',
    ratingError: 'Error rating photo: {err}',
    unauthenticatedError: 'Pre nahrávanie fotiek do galérie musíte byť prihlásený.',
  },

  measurement: {
    distance: 'Distance',
    elevation: 'Elevation and position',
    area: 'Area',
    elevationLine: 'Elevation:',
    removePoint: 'Remove point?',
    elevationFetchError: 'Error fetching point elevation: {err}',
  },

  trackViewer: {
    upload: 'Upload',
    moreInfo: 'More info',
    share: 'Share',
    colorizingMode: {
      none: 'Inactive',
      elevation: 'Elevation',
      steepness: 'Steepness',
    },
    details: {
      startTime: 'Start time',
      finishTime: 'Finish time',
      duration: 'Duration',
      distance: 'Distance',
      avgSpeed: 'Average speed',
      minEle: 'Min. elevation',
      maxEle: 'Max. elevation',
      uphill: 'Total climb',
      downhill: 'Total descend',
      durationValue: '{h} hours {m} minutes',
    },
    uploadModal: {
      title: 'Upload the track',
      drop: 'Drop your .gpx file here or click here to select it.',
    },
    shareModal: {
      title: 'Share the track',
      description: 'Track is available at the following address:',
    },
    fetchingError: 'Error fetching track data: {err}',
    savingError: 'Error saving the track: {err}',
    tooBigError: 'Size of the uploaded track is bigger than the limit {maxSize} MB.',
  },

  infoPoint: {
    modify: 'Change label',
    edit: {
      title: 'Change pin label',
      label: 'Pin description:',
      example: 'We will meet here.',
      hint: 'For pin without a label leave its description empty.',
    },
  },

  settings: {
    tab: {
      map: 'Map',
      account: 'Account',
      general: 'General',
      expert: 'Expert',
    },
    map: {
      imgFormat: {
        label: 'Tile format for car, hiking and bicycle map:',
        hint: 'Map looks better if PNG format is used but it requires to download cca 4x more data than for JPEG. '
          + 'On slow internet connection we recommend to select JPEG.',
      },
      overlayPaneOpacity: 'Map line features opacity:',
      homeLocation: {
        label: 'Home location:',
        select: 'Select on the map',
        undefined: 'undefined',
      },
    },
    account: {
      name: 'Name',
      email: 'E-Mail',
      noAuthInfo: 'Only for logged-in users.',
    },
    general: {
      tips: 'Show tips on page opening',
    },
    expert: {
      switch: 'Expert mode:',
      off: 'Off',
      on: 'On',
      offInfo: 'Expert mode offers features for advanced users.',
      overlayOpacity: 'Layer opacity:',
      trackViewerEleSmoothing: {
        label: 'Smoothing level for computing total climb/descend in Track viewer: {value}',
        info: 'For value 1 all elevations are used separately. Higher values represent floating window width used to smooth elevations.',
      },
    },
    saveSuccess: 'Settings have been saved.',
    savingError: 'Errro saving settings: {err}',
  },

  changesets: {
    allAuthors: 'All authors',
    download: 'Download changes',
    olderThan: 'return `${days} days`',
    olderThanFull: 'return `Changesets older than ${days} days`',
    notFound: 'No changesets found.',
    fetchError: 'Error fetching changesets: {err}',
  },

  mapDetails: {
    road: 'Road info',
    notFound: 'No road found.',
    fetchingError: 'Error fetching road details: {err}',
  },

  objects: {
    type: 'Type',
    lowZoomAlert: 'Object finding is possible only from zoom level 12.',
    fetchingError: 'Error fetching objects (POIs): {err}',
  },

  external: {
    openInExternal: 'Open in external application',
    osm: 'OpenStreetMap',
    oma: 'OMA',
    googleMaps: 'Google Maps',
    hiking_sk: 'Hiking.sk',
    'mapy_cz-aerial': 'Mapy.cz Aerial',
    josm: 'Edit in JOSM',
    id: 'Edit in iD',
    'routing-debug': 'Routing debugger',
  },

  search: {
    inProgress: 'Searching…',
    noResults: 'No results found',
    prompt: 'Enter the place',
    routeFrom: 'Route from here',
    routeTo: 'Route to here',
    fetchingError: 'Searching error: {err}',
  },

  shareMap: {
    label: 'Current map view is available at the following URL:',
  },

  embed: {
    code: 'Put the following code to tour HTML page:',
    example: 'The result will look like this:',
  },

  tips: {
    previous: 'Previous tip',
    next: 'Next tip',
    prevent: "Don't show next time",
  },

  supportUs: {
    explanation: 'Map portal Freemap is created by volunteers for free in their spare time. For the operation it still needs a hardware and services of commercial comapnies which costs us money.',
    account: 'Bank account:',
    paypal: 'Donate with PayPal',
    thanks: "We'll appreciate every donation. Thank you!",
    registration: 'Registered in MV/VVS/1-900/90-34343 at 2th of October 2009',
  },

  gpxExport: {
    export: 'Export',
    what: {
      plannedRoute: 'route found',
      objects: 'objects (POIs)',
      pictures: 'photos (in the visible map area)',
      distanceMeasurement: 'distance measurement',
      areaMeasurement: 'area measutement',
      elevationMeasurement: 'elevation and position measurement',
      infoPoint: 'infopoint',
    },
    disabledAlert: 'Only checkboxes having anything in the map to export are enabled.',
  },

  logIn: {
    with: {
      facebook: 'Log-in with Facebook',
      google: 'Log-in with Google',
      osm: 'Log-in with OpenStreetMap',
    },
    success: 'You have been successfuly logged in.',
    logInError: 'Error logging in: {err}',
    logInError2: 'Error logging in.',
    logOutError: 'Error logging out: {err}',
    verifyError: 'Error verifying authentication: {err}',
  },

  logOut: {
    success: 'You have been successfuly logged out.',
  },

  mapLayers: {
    layers: 'Map layers',
    photoFilterWarning: 'Photo filtering is active',
    minZoomWarning: 'Accessible from zoom {minZoom}',
    base: {
      A: 'Car',
      T: 'Hiking',
      C: 'Bicycle',
      K: 'Ski',
      S: 'Aerial',
      O: 'OpenStreetMap',
      M: 'mtbmap.cz',
      p: 'OpenTopoMap',
      b: 'Humanitarian',
      d: 'Public transport (ÖPNV)',
      i: 'Infomap',
      j: 'Infomap BW',
      h: 'Historic',
    },
    overlay: {
      I: 'Photos',
      n: 'Forest tracks NLC 2016',
      l: 'Forest tracks NLC',
      g: 'OSM GPS traces',
      t: 'Hiking trails',
      c: 'Bicycle trails',
      q: 'OpenSnowMap',
      r: 'Rendering clients',
      s0: 'Strava (all)',
      s1: 'Strava (rides)',
      s2: 'Strava (runs)',
      s3: 'Strava  (water activities)',
      s4: 'Strava (winter activities)',
    },
    type: {
      map: 'map',
      data: 'data',
      photos: 'pictures',
    },
    attr: {
      freemap: '© Freemap Slovakia',
      osmData: '© OpenStreetMap contributors',
      srtm: '© SRTM',
      hot: '© Humanitarian OpenStreetMap Team',
    },
  },

  elevationChart: {
    distance: 'Distance [km]',
    ele: 'Elevation [m.a.s.l.]',
    fetchError: 'Error fetching elevation profile data: {err}',
  },

  errorCatcher: {
    html: `
      <h1>Oops!</h1>
      <p>
        Something bad has happened.
      </p>
      <p>
        Please, <a href="https://github.com/FreemapSlovakia/freemap-v3-react/issues/new" target="_blank" rel="noopener noreferrer">report this problem</a>,
        or email it to <a href="mailto:freemap@freemap.sk?subject=Nahlásenie%20chyby%20na%20www.freemap.sk">freemap@freemap.sk</a>.
        Please don't forget to add a short description about what have you done to get this error and attached debugging data.
      </p>
      <p>
        Thank you.
      </p>
      You can try:
      <ul>
        <li><a href="">reload last page</a></li>
        <li><a href="/">load initial page</a></li>
        <li><a href="/?reset-local-storage">clear local data and load initial page</a></li>
      </ul>
      <h2>Debugging data</h2>
    `,
  },

  osm: {
    fetchingError: 'Error fetching OSM data: {err}',
  },

  roadDetails: {
    roadType: 'Road type:',
    surface: 'Surface:',
    suitableBikeType: 'Recommended bicycle:',
    lastChange: 'Last change:',
    edit: 'Edit in {id} or {josm}.',
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
      grade1: 'kvalitná spevená cesta (1. stupeň)',
      grade2: 'udržiavaná spevená cesta  (2. stupeň)',
      grade3: 'spevená cesta  (3. stupeň)',
      grade4: 'poľná cesta/zvážnica (4. stupeň)',
      grade5: 'ťazko priestupná/zarastená cesta (5. stupeň)',
      path: 'chodník',
      footway: 'chodník',
      pedestrian: 'pešia zóna',
      unknown: 'neznámy',
    },
    bicycleTypes: {
      'road-bike': 'cestný',
      'trekking-bike': 'trekkingový',
      'mtb-bike': 'horský',
      'no-bike': 'vjazd na bicykli zakázaný',
      unknown: 'neznámy',
    },
  },
};
