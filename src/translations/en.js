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
    objects: 'Objects (POI)',
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
  },

  measurement: {
    distance: 'Distance',
    elevation: 'Elevation and position',
    area: 'Area',
    elevationLine: 'Elevation:',
    removePoint: 'Remove point?',
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
  },

  changesets: {
    allAuthors: 'All authors',
    download: 'Download changes',
    olderThan: 'return `${days} days`',
    olderThanFull: 'return `Changesets older than ${days} days`',
    notFound: 'No changesets found.',
  },

  mapDetails: {
    road: 'Road info',
    notFound: 'No road found.',
  },

  objects: {
    type: 'Type',
    lowZoomAlert: 'Object finding is possible only from zoom level 12.',
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
  },

  logIn: {
    with: {
      facebook: 'Log-in with Facebook',
      google: 'Log-in with Google',
      osm: 'Log-in with OpenStreetMap',
    },
    success: 'You have been successfuly logged in.',
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
      bing: '© Bing, Earthstar Geographics SIO, © 2017 Microsoft Corporation',
      hot: '© Humanitarian OpenStreetMap Team',
    },
  },

  elevationChart: {
    distance: 'Distance [km]',
    ele: 'Elevation [m.a.s.l.]',
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
};
