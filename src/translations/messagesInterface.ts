import { LatLon } from 'fm3/types/common';

export interface Messages {
  general: {
    elevationProfile: string;
    save: string;
    cancel: string;
    modify: string;
    delete: string;
    remove: string;
    close: string;
    apply: string;
    exitFullscreen: string;
    fullscreen: string;
    yes: string;
    no: string;
    masl: string;
    copyCode: string;
    loading: string;
    ok: string;
    preventShowingAgain: string;
    closeWithoutSaving: string;
    back: string;
    internalError: string;
    processorError: string;
    seconds: string;
    minutes: string;
    meters: string;
    createdAt: string;
    actions: string;
    add: string;
    clear: string;
    convertToDrawing: string;
    simplifyPrompt: string;
  };
  tools: {
    none: string;
    tools: string;
    routePlanner: string;
    objects: string;
    photos: string;
    measurement: string;
    trackViewer: string;
    changesets: string;
    mapDetails: string;
    tracking: string;
    maps: () => JSX.Element;
  };
  routePlanner: {
    milestones: string;
    start: string;
    finish: string;
    swap: string;
    point: {
      pick: string;
      current: string;
      home: string;
    };
    transportType: {
      car: string;
      'car-free': string;
      bikesharing: string;
      imhd: string;
      'bike-osm': string;
      bike: string;
      'foot-stroller': string;
      nordic: string;
      ski: string;
      'foot-osm': string;
      foot: string;
    };
    development: string;
    mode: {
      route: string;
      trip: string;
      roundtrip: string;
    };
    alternative: string;
    distance: ({ value, diff }: { value: number; diff: number }) => JSX.Element;
    duration: ({
      h,
      m,
      diff,
    }: {
      h: number;
      m: number;
      diff: {
        h: number;
        m: number;
      };
    }) => JSX.Element;
    summary: ({
      distance,
      h,
      m,
    }: {
      distance: number;
      h: number;
      m: number;
    }) => JSX.Element;
    noHomeAlert: {
      msg: string;
      setHome: string;
    };
    showMidpointHint: string;
    gpsError: string;
    routeNotFound: string;
    fetchingError: string;
    maneuverWithName: string;
    maneuverWithoutName: string;
    maneuver: {
      types: {
        turn: string;
        'new name': string;
        depart: string;
        arrive: string;
        merge: string;
        'on ramp': string;
        'off ramp': string;
        fork: string;
        'end of road': string;
        continue: string;
        roundabout: string;
        rotary: string;
        'roundabout turn': string;
        'exit rotary': string;
        'exit roundabout': string;
      };
      modifiers: {
        uturn: string;
        'sharp right': string;
        'slight right': string;
        right: string;
        'sharp left': string;
        'slight left': string;
        left: string;
        straight: string;
      };
    };
    imhd: {
      total: {
        short: ({
          arrival,
          price,
          numbers,
        }: {
          arrival: string;
          price: string;
          numbers: number[];
        }) => JSX.Element;
        full: ({
          arrival,
          price,
          numbers,
          total,
          home,
          foot,
          bus,
          wait,
        }: {
          arrival: string;
          price: string;
          numbers: number[];
          total: number;
          home: number;
          foot: number;
          bus: number;
          wait: number;
        }) => JSX.Element;
      };
      step: {
        foot: ({
          departure,
          duration,
          destination,
        }: {
          departure: string | undefined;
          duration: number;
          destination: string;
        }) => JSX.Element;
        bus: ({
          departure,
          type,
          number,
          destination,
        }: {
          departure: string | undefined;
          type: string;
          number: number | undefined;
          destination: string;
        }) => JSX.Element;
      };
      type: {
        bus: string;
        tram: string;
        trolleybus: string;
        foot: string;
      };
    };
    bikesharing: {
      step: {
        foot: ({
          duration,
          destination,
        }: {
          duration: number;
          destination: string;
        }) => JSX.Element;
        bicycle: ({
          duration,
          destination,
        }: {
          duration: number;
          destination: string;
        }) => JSX.Element;
      };
    };
    imhdAttribution: string;
  };
  more: {
    more: string;
    logOut: string;
    logIn: string;
    settings: string;
    gpxExport: string;
    mapExports: string;
    embedMap: string;
    reportMapError: string;
    reportAppError: string;
    supportUs: string;
    help: string;
    back: string;
    mapLegend: string;
    contacts: string;
    tips: string;
    facebook: string;
    twitter: string;
    youtube: string;
    github: string;
    automaticLanguage: string;
    pdfExport: string;
  };
  main: {
    clearMap: string;
    close: string;
    closeTool: string;
    locateMe: string;
    locationError: string;
    zoomIn: string;
    zoomOut: string;
    devInfo: () => JSX.Element;
    copyright: string;
    p2?: () => JSX.Element;
  };
  gallery: {
    filter: string;
    allPhotos: string;
    upload: string;
    f: {
      firstUploaded: string;
      lastUploaded: string;
      firstCaptured: string;
      lastCaptured: string;
      leastRated: string;
      mostRated: string;
    };
    viewer: {
      title: string;
      comments: string;
      newComment: string;
      addComment: string;
      yourRating: string;
      showOnTheMap: string;
      openInNewWindow: string;
      uploaded: string;
      captured: string;
      deletePrompt: string;
      modify: string;
    };
    editForm: {
      name: string;
      description: string;
      takenAt: {
        datetime: string;
        date: string;
        time: string;
      };
      location: string;
      tags: string;
      setLocation: string;
    };
    uploadModal: {
      title: string;
      uploading: string;
      upload: string;
      rules: string;
      success: string;
      showPreview: string;
    };
    locationPicking: {
      title: string;
    };
    layerHint: string;
    deletingError: string;
    tagsFetchingError: string;
    pictureFetchingError: string;
    picturesFetchingError: string;
    savingError: string;
    commentAddingError: string;
    ratingError: string;
    unauthenticatedError: string;
    missingPositionError: string;
    invalidPositionError: string;
    invalidTakenAt: string;
    filterModal: {
      title: string;
      tag: string;
      createdAt: string;
      takenAt: string;
      author: string;
      rating: string;
      noTags: string;
    };
  };
  measurement: {
    distance: string;
    elevation: string;
    area: string;
    elevationFetchError: string;
    elevationInfo: ({
      elevation,
      point,
    }: {
      elevation: number;
      point: LatLon;
    }) => JSX.Element;
    areaInfo: ({ area }: { area: number }) => JSX.Element;
    distanceInfo: ({ length }: { length: number }) => JSX.Element;
  };
  trackViewer: {
    upload: string;
    moreInfo: string;
    share: string;
    colorizingMode: {
      none: string;
      elevation: string;
      steepness: string;
    };
    details: {
      startTime: string;
      finishTime: string;
      duration: string;
      distance: string;
      avgSpeed: string;
      minEle: string;
      maxEle: string;
      uphill: string;
      downhill: string;
      durationValue: string;
    };
    uploadModal: {
      title: string;
      drop: string;
    };
    shareToast: string;
    fetchingError: string;
    savingError: string;
    tooBigError: string;
    loadingError: string;
    onlyOne: string;
    wrongFormat: string;
    info: () => JSX.Element;
  };
  drawing: {
    modify: string;
    edit: {
      title: string;
      label: string;
      hint: string;
    };
  };
  settings: {
    tab: {
      map: string;
      account: string;
      general: string;
      expert: string;
    };
    map: {
      overlayPaneOpacity: string;
      homeLocation: {
        label: string;
        select: string;
        undefined: string;
      };
    };
    account: {
      name: string;
      email: string;
      noAuthInfo: string;
    };
    general: {
      tips: string;
    };
    expertInfo: string;
    expert: {
      switch: string;
      overlayOpacity: string;
      trackViewerEleSmoothing: {
        label: string;
        info: string;
      };
    };
    saveSuccess: string;
    savingError: string;
  };
  changesets: {
    allAuthors: string;
    download: string;
    olderThan: ({ days }: { days: number }) => string;
    olderThanFull: ({ days }: { days: number }) => string;
    notFound: string;
    fetchError: string;
    detail: ({ changeset }: { changeset: any }) => JSX.Element;
    details: {
      author: string;
      description: string;
      noDescription: string;
      closedAt: string;
      moreDetailsOn: ({
        osmLink,
        achaviLink,
      }: {
        osmLink: string;
        achaviLink: string;
      }) => JSX.Element;
    };
  };
  mapDetails: {
    road: string;
    notFound: string;
    fetchingError: string;
    detail: ({ element }: { element: any }) => JSX.Element;
  };
  objects: {
    type: string;
    lowZoomAlert: {
      message: string;
      zoom: string;
    };
    fetchingError: string;
    categories: {
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
      6: string;
      7: string;
      8: string;
      9: string;
      10: string;
      11: string;
      12: string;
      13: string;
      14: string;
      15: string;
    };
    subcategories: {
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
      6: string;
      7: string;
      8: string;
      9: string;
      10: string;
      11: string;
      12: string;
      13: string;
      14: string;
      15: string;
      16: string;
      17: string;
      18: string;
      19: string;
      20: string;
      21: string;
      22: string;
      23: string;
      24: string;
      26: string;
      27: string;
      28: string;
      29: string;
      30: string;
      31: string;
      32: string;
      33: string;
      34: string;
      35: string;
      36: string;
      39: string;
      40: string;
      41: string;
      42: string;
      43: string;
      44: string;
      45: string;
      46: string;
      47: string;
      48: string;
      49: string;
      50: string;
      51: string;
      52: string;
      53: string;
      54: string;
      55: string;
      56: string;
      57: string;
      58: string;
      59: string;
      60: string;
      61: string;
      62: string;
      63: string;
      64: string;
      65: string;
      66: string;
      67: string;
      68: string;
      69: string;
      70: string;
      71: string;
      72: string;
      73: string;
      74: string;
      75: string;
      76: string;
      77: string;
      78: string;
      79: string;
      80: string;
      81: string;
      82: string;
      83: string;
      84: string;
      85: string;
      86: string;
      87: string;
      89: string;
      90: string;
      91: string;
      92: string;
      93: string;
      94: string;
      95: string;
      96: string;
      98: string;
      99: string;
      100: string;
      101: string;
      102: string;
      103: string;
      104: string;
      105: string;
      106: string;
      107: string;
      108: string;
      109: string;
      110: string;
      111: string;
      112: string;
      113: string;
      114: string;
      115: string;
      116: string;
      117: string;
      118: string;
      119: string;
      120: string;
      121: string;
      122: string;
      124: string;
      125: string;
      126: string;
      127: string;
      128: string;
      129: string;
      130: string;
      131: string;
      132: string;
      133: string;
      134: string;
      135: string;
      136: string;
      137: string;
      138: string;
      139: string;
      140: string;
      141: string;
      142: string;
      143: string;
      144: string;
      145: string;
      146: string;
      147: string;
      148: string;
      149: string;
      150: string;
      151: string;
      152: string;
      153: string;
      154: string;
      155: string;
      156: string;
      157: string;
      158: string;
      159: string;
      160: string;
      161: string;
      162: string;
      163: string;
      164: string;
      166: string;
      167: string;
      168: string;
      169: string;
      170: string;
      171: string;
      172: string;
      173: string;
      174: string;
      175: string;
      176: string;
      177: string;
      178: string;
      179: string;
      180: string;
      181: string;
      182: string;
      183: string;
      184: string;
      185: string;
      186: string;
      187: string;
      188: string;
      189: string;
      190: string;
      191: string;
      192: string;
      193: string;
      194: string;
      195: string;
      196: string;
      197: string;
      198: string;
      199: string;
      200: string;
      201: string;
      202: string;
      203: string;
      204: string;
      205: string;
      206: string;
      207: string;
      208: string;
      209: string;
      210: string;
      211: string;
      212: string;
      213: string;
      214: string;
      215: string;
      216: string;
      217: string;
      218: string;
      219: string;
      220: string;
      221: string;
      222: string;
      223: string;
      224: string;
      225: string;
      226: string;
      227: string;
      228: string;
      229: string;
      230: string;
      231: string;
      232: string;
      233: string;
      234: string;
      235: string;
      236: string;
      237: string;
      238: string;
      239: string;
      240: string;
      241: string;
      242: string;
      243: string;
      244: string;
      245: string;
      246: string;
      248: string;
      249: string;
      250: string;
      251: string;
      252: string;
      253: string;
      254: string;
      255: string;
      256: string;
      257: string;
      258: string;
      259: string;
      260: string;
      261: string;
      262: string;
      263: string;
      264: string;
      265: string;
      266: string;
      267: string;
      268: string;
      269: string;
      270: string;
      271: string;
      272: string;
      273: string;
      274: string;
      275: string;
    };
  };
  external: {
    openInExternal: string;
    osm: string;
    oma: string;
    googleMaps: string;
    hiking_sk: string;
    zbgis: string;
    mapy_cz: string;
    josm: string;
    id: string;
    window: string;
    url: string;
    image: string;
    copy: string;
  };
  search: {
    inProgress: string;
    noResults: string;
    prompt: string;
    routeFrom: string;
    routeTo: string;
    fetchingError: string;
    buttonTitle: string;
  };
  embed: {
    code: string;
    example: string;
    dimensions: string;
    height: string;
    width: string;
    enableFeatures: string;
    enableSearch: string;
    enableMapSwitch: string;
    enableLocateMe: string;
  };
  tips: {
    previous: string;
    next: string;
    prevent: string;
    errorLoading: string;
  };
  supportUs: {
    explanation: string;
    account: string;
    paypal: string;
    thanks: string;
    registration: string;
  };
  gpxExport: {
    export: string;
    exportToDrive: string;
    exportToDropbox: string;
    exportError: string;
    what: {
      plannedRoute: string;
      plannedRouteWithStops: string;
      objects: string;
      pictures: string;
      drawingLines: string;
      areaMeasurement: string;
      drawingPoints: string;
      tracking: string;
      gpx: string;
    };
    disabledAlert: string;
    blockedPopup: string;
    exportedToDropbox: string;
    exportedToGdrive: string;
  };
  logIn: {
    with: {
      facebook: string;
      google: string;
      osm: string;
    };
    success: string;
    logInError: string;
    logInError2: string;
    logOutError: string;
    verifyError: string;
  };
  logOut: {
    success: string;
  };
  mapLayers: {
    layers: string;
    photoFilterWarning: string;
    minZoomWarning: string;
    base: {
      A: string;
      T: string;
      C: string;
      K: string;
      S: string;
      Z: string;
      O: string;
      M: string;
      p: string;
      d: string;
      h: string;
      X: string;
      Y: string;
    };
    overlay: {
      i: string;
      I: string;
      l: string;
      n1: string;
      n2: string;
      n3: string;
      g: string;
      t: string;
      c: string;
      q: string;
      r: string;
      s0: string;
      s1: string;
      s2: string;
      s3: string;
      s4: string;
      w: string;
    };
    type: {
      map: string;
      data: string;
      photos: string;
    };
    attr: {
      freemap: string;
      osmData: string;
      srtm: string;
      hot: string;
    };
  };
  elevationChart: {
    distance: string;
    ele: string;
    fetchError: string;
  };
  errorCatcher: {
    html: string;
  };
  osm: {
    fetchingError: string;
  };
  roadDetails: {
    roadType: string;
    surface: string;
    suitableBikeType: string;
    lastChange: string;
    showDetails: string;
    surfaces: {
      asphalt: string;
      gravel: string;
      fine_gravel: string;
      dirt: string;
      ground: string;
      cobblestone: string;
      compacted: string;
      paved: string;
      unknown: string;
      unpaved: string;
      'concrete:plates': string;
      concrete: string;
      grass: string;
    };
    trackClasses: {
      motorway: string;
      trunk: string;
      primary: string;
      secondary: string;
      tertiary: string;
      service: string;
      unclassified: string;
      residential: string;
      grade1: string;
      grade2: string;
      grade3: string;
      grade4: string;
      grade5: string;
      path: string;
      footway: string;
      pedestrian: string;
      unknown: string;
      living_street: string;
      construction: string;
    };
    bicycleTypes: {
      'road-bike': string;
      'trekking-bike': string;
      'mtb-bike': string;
      'no-bike': string;
      unknown: string;
    };
  };
  tracking: {
    savingError: string;
    loadError: string;
    deleteError: string;
    unauthenticatedError: string;
    trackedDevices: {
      button: string;
      modalTitle: string;
      desc: string;
      modifyTitle: string;
      createTitle: ({ name }: { name: string }) => JSX.Element;
    };
    accessToken: {
      token: string;
      timeFrom: string;
      timeTo: string;
      listingLabel: string;
      note: string;
      delete: string;
    };
    accessTokens: {
      modalTitle: ({ deviceName }: { deviceName: string }) => JSX.Element;
      desc: ({ deviceName }: { deviceName: string }) => JSX.Element;
      createTitle: ({ deviceName }: { deviceName: string }) => JSX.Element;
      modifyTitle: ({
        token,
        deviceName,
      }: {
        token: string;
        deviceName: string;
      }) => JSX.Element;
    };
    trackedDevice: {
      token: string;
      label: string;
      fromTime: string;
      maxAge: string;
      maxCount: string;
      splitDistance: string;
      splitDuration: string;
      color: string;
      width: string;
    };
    devices: {
      button: string;
      modalTitle: string;
      createTitle: string;
      watchTokens: string;
      watchPrivately: string;
      watch: string;
      delete: string;
      modifyTitle: ({ name }: { name: string }) => JSX.Element;
      desc: () => JSX.Element;
    };
    device: {
      token: string;
      name: string;
      maxAge: string;
      maxCount: string;
      regenerateToken: string;
      generatedToken: string;
    };
    visual: {
      line: string;
      points: string;
      'line+points': string;
    };
    subscribeNotFound: ({ id }: { id: string | number }) => JSX.Element;
    subscribeError: ({ id }: { id: string | number }) => JSX.Element;
  };
  pdfExport: {
    export: string;
    exportError: string;
    exporting: string;
    exported: ({ url }: { url: string }) => JSX.Element;
    area: string;
    areas: {
      visible: string;
      pinned: string;
    };
    format: string;
    layersTitle: string;
    layers: {
      contours: string;
      shading: string;
      hikingTrails: string;
      bicycleTrails: string;
      skiTrails: string;
      horseTrails: string;
      drawing: string;
      plannedRoute: string;
      track: string;
    };
    mapScale: string;
    alert: () => JSX.Element;
  };
  maps: {
    noMap: string;
    create: string;
    save: string;
    rename: string;
    delete: string;
    namePrompt: string;
    deleteConfirm: string;
    fetchError: string;
    fetchListError: string;
    deleteError: string;
    renameError: string;
    createError: string;
    saveError: string;
  };
  legend: {
    body: () => JSX.Element;
  };
  contacts: {
    ngo: string;
    registered: string;
    bankAccount: string;
    generalContact: string;
    board: string;
    boardMemebers: string;
    president: string;
    vicepresident: string;
    secretary: string;
  };
}
