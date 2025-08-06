import { ExportableLayer } from 'actions/mainActions.js';
import { JSX, ReactElement, ReactNode } from 'react';
import { Changeset } from '../actions/changesetsActions.js';
import {
  GalleryColorizeBy,
  GalleryListOrder,
} from '../actions/galleryActions.js';
import { RoutingMode } from '../actions/routePlannerActions.js';
import { ElevationInfoBaseProps } from '../components/ElevationInfo.js';
import { DeepPartialWithRequiredObjects } from '../deepPartial.js';
import { HttpError } from '../httpRequest.js';
import type { TransportTypeMsgKey } from '../transportTypeDefs.js';

type Err = { err: string };

export type Messages = {
  general: {
    iso: string;
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
    internalError: ({ ticketId }: { ticketId?: string }) => string;
    processorError: ({ err }: Err) => string;
    seconds: string;
    minutes: string;
    meters: string;
    createdAt: string;
    modifiedAt: string;
    actions: string;
    add: string;
    clear: string;
    convertToDrawing: string;
    simplifyPrompt: string;
    copyUrl: string;
    copyPageUrl: string;
    savingError: ({ err }: Err) => string;
    loadError: ({ err }: Err) => string;
    deleteError: ({ err }: Err) => string;
    operationError: ({ err }: Err) => string;
    saved: string;
    deleted: string;
    visual: string;
    copyOk: string;
    noCookies: string;
    name: string;
    load: string;
    unnamed: string;
    enablePopup: string;
    componentLoadingError: string;
    offline: string;
    connectionError: string;
    experimentalFunction: string;
    attribution: () => JSX.Element;
    unauthenticatedError: string;
    areYouSure: string;
    export: string;
    success: string;
    expiration: string;
    privacyPolicy: string;
    newOptionText: string;
    deleteButtonText: string;
  };
  selections: {
    objects: string;
    drawPoints: string;
    drawLines: string;
    drawPolygons: string;
    tracking: string;
    linePoint: string;
    polygonPoint: string;
  };
  tools: {
    none: string;
    routePlanner: string;
    objects: string;
    photos: string;
    measurement: string;
    drawPoints: string;
    drawLines: string;
    drawPolygons: string;
    trackViewer: string;
    changesets: string;
    mapDetails: string;
    tracking: string;
    maps: string;
  };
  routePlanner: {
    manual: string;
    manualTooltip: string;
    ghParams: {
      tripParameters: string;
      seed: string;
      distance: string;
      isochroneParameters: string;
      buckets: string;
      timeLimit: string;
      distanceLimit: string;
    };
    milestones: string;
    start: string;
    finish: string;
    swap: string;
    point: {
      point: string;
      pick: string;
      current: string;
      home: string;
    };
    transportType: Record<TransportTypeMsgKey, string>;
    development: string;
    mode: Record<RoutingMode | 'routndtrip-gh', string>;
    alternative: string;
    distance: ({
      value,
      diff,
    }: {
      value: string;
      diff?: string;
    }) => JSX.Element;
    duration: ({
      h,
      m,
      diff,
    }: {
      h: number;
      m: number;
      diff?: {
        h: number;
        m: number;
      };
    }) => JSX.Element;
    summary: ({
      distance,
      h,
      m,
    }: {
      distance: ReactNode;
      h: ReactNode;
      m: ReactNode;
    }) => JSX.Element;
    noHomeAlert: {
      msg: string;
      setHome: string;
    };
    showMidpointHint: string;
    gpsError: string;
    routeNotFound: string;
    fetchingError: ({ err }: Err) => string;
  };
  mainMenu: {
    title: string;
    logOut: string;
    logIn: string;
    account: string;
    mapFeaturesExport: string;
    mapExports: string;
    embedMap: string;
    supportUs: string;
    help: string;
    back: string;
    mapLegend: string;
    contacts: string;
    facebook: string;
    twitter: string;
    youtube: string;
    github: string;
    automaticLanguage: string;
    mapExport: string;
    osmWiki: string;
    wikiLink: string;
  };
  main: {
    title: string;
    description: string;
    clearMap: string;
    close: string;
    closeTool: string;
    locateMe: string;
    locationError: string;
    zoomIn: string;
    zoomOut: string;
    devInfo: () => JSX.Element;
    copyright: string;
    infoBars: Record<string, () => JSX.Element>;
    cookieConsent: () => JSX.Element;
    ad: (email: ReactNode) => JSX.Element;
  };
  gallery: {
    legend: string;
    recentTags: string;
    filter: string;
    showPhotosFrom: string;
    showLayer: string;
    upload: string;
    f: Record<GalleryListOrder, string>;
    colorizeBy: string;
    showDirection: string;
    showLegend: string;
    c: Record<GalleryColorizeBy | 'disable', string>;
    viewer: {
      title: string;
      comments: string;
      newComment: string;
      addComment: string;
      yourRating: string;
      showOnTheMap: string;
      openInNewWindow: string;
      uploaded: ({
        username,
        createdAt,
      }: {
        username: ReactNode;
        createdAt: ReactNode;
      }) => JSX.Element;
      captured: (takenAt: JSX.Element) => JSX.Element;
      deletePrompt: string;
      modify: string;
      premiumOnly: string;
      noComments: string;
    };
    editForm: {
      name: string;
      description: string;
      azimuth: string;
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
      uploading: (n: number) => string;
      upload: string;
      rules: string;
      success: string;
      showPreview: string;
      loadPreview: string;
      premium: string;
    };
    locationPicking: {
      title: string;
    };
    deletingError: ({ err }: Err) => string;
    tagsFetchingError: ({ err }: Err) => string;
    pictureFetchingError: ({ err }: Err) => string;
    picturesFetchingError: ({ err }: Err) => string;
    savingError: ({ err }: Err) => string;
    commentAddingError: ({ err }: Err) => string;
    ratingError: ({ err }: Err) => string;
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
      pano: string;
      premium: string;
    };
    noPicturesFound: string;
    linkToWww: string;
    linkToImage: string;
    allMyPhotos: {
      premium: string;
      free: string;
    };
  };
  measurement: {
    distance: string;
    elevation: string;
    area: string;
    elevationFetchError: ({ err }: Err) => string;
    elevationInfo: (params: ElevationInfoBaseProps) => JSX.Element;
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
      durationValue: ({ h, m }: { h: number; m: number }) => string;
    };
    uploadModal: {
      title: string;
      drop: string;
    };
    shareToast: string;
    fetchingError: ({ err }: Err) => string;
    savingError: ({ err }: Err) => string;
    loadingError: string;
    onlyOne: string;
    wrongFormat: string;
    info: () => JSX.Element;
    tooBigError: string;
  };
  drawing: {
    modify: string;
    edit: {
      title: string;
      color: string;
      label: string;
      width: string;
      hint: string;
      type: string;
    };
    split: string;
    join: string;
    continue: string;
    stopDrawing: string;
    selectPointToJoin: string;
    defProps: {
      menuItem: string;
      title: string;
      applyToAll: string;
    };
    projection: {
      projectPoint: string;
      distance: string;
      azimuth: string;
    };
  };
  purchases: {
    purchases: string;
    premiumExpired: (at: ReactNode) => JSX.Element;
    date: string;
    item: string;
    notPremiumYet: string;
    noPurchases: string;
    premium: string;
    credits: (amount: ReactNode) => JSX.Element;
  };
  settings: {
    map: {
      homeLocation: {
        label: string;
        select: string;
        undefined: string;
      };
    };
    account: {
      name: string;
      email: string;
      sendGalleryEmails: string;
      delete: string;
      deleteWarning: string;
      personalInfo: string;
      authProviders: string;
    };
    general: {
      tips: string;
    };
    layer: string;
    overlayOpacity: string;
    showInMenu: string;
    showInToolbar: string;
    saveSuccess: string;
    savingError: ({ err }: Err) => string;
    customLayersDef: string;
    customLayersDefError: string;
  };
  changesets: {
    allAuthors: string;
    tooBig: string;
    olderThan: ({ days }: { days: number }) => string;
    olderThanFull: ({ days }: { days: number }) => string;
    notFound: string;
    fetchError: ({ err }: Err) => string;
    detail: ({ changeset }: { changeset: Changeset }) => JSX.Element;
    details: {
      author: string;
      description: string;
      noDescription: string;
      closedAt: string;
      moreDetailsOn: ({
        osmLink,
        achaviLink,
      }: {
        osmLink: JSX.Element;
        achaviLink: JSX.Element;
      }) => JSX.Element;
    };
  };
  mapDetails: {
    notFound: string;
    fetchingError: ({ err }: Err) => string;
    detail: ({
      id,
      type,
      tags,
    }: {
      id: number;
      type: 'node' | 'way' | 'relation';
      tags: Record<string, string>;
    }) => JSX.Element;
  };
  objects: {
    type: string;
    lowZoomAlert: {
      message: ({ minZoom }: { minZoom: number }) => string;
      zoom: string;
    };
    tooManyPoints: ({ limit }: { limit: number }) => string;
    fetchingError: ({ err }: Err) => string;
    // categories: Record<number, string>;
    // subcategories: Record<number, string>;
    icon: {
      pin: string;
      ring: string;
      square: string;
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
  };
  search: {
    inProgress: string;
    noResults: string;
    prompt: string;
    routeFrom: string;
    routeTo: string;
    fetchingError: ({ err }: Err) => string;
    buttonTitle: string;
    placeholder: string;
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
  documents: {
    errorLoading: string;
  };
  exportMapFeatures: {
    download: string;
    format: string;
    target: string;
    exportError: ({ err }: Err) => string;
    what: {
      plannedRoute: string;
      plannedRouteWithStops: string;
      objects: string;
      pictures: string;
      drawingLines: string;
      drawingAreas: string;
      drawingPoints: string;
      tracking: string;
      gpx: string;
      search: string;
    };
    disabledAlert: string;
    licenseAlert: string;
    exportedToDropbox: string;
    exportedToGdrive: string;
    garmin: {
      courseName: string;
      description: string;
      activityType: string;
      at: {
        running: string;
        hiking: string;
        other: string;
        mountain_biking: string;
        trailRunning: string;
        roadCycling: string;
        gravelCycling: string;
      };
      revoked: string;
      connectPrompt: string;
      authPrompt: string;
    };
  };
  auth: {
    connect: {
      label: string;
      success: string;
    };
    disconnect: {
      label: string;
      success: string;
    };
    provider: {
      facebook: string;
      google: string;
      osm: string;
      garmin: string;
    };
    logIn: {
      with: string;
      success: string;
      logInError: ({ err }: Err) => string;
      logInError2: string;
      verifyError: ({ err }: Err) => string;
    };
    logOut: {
      success: string;
      error: ({ err }: Err) => string;
    };
  };
  mapLayers: {
    showMore: string;
    showAll: string;
    settings: string;
    layers: string;
    switch: string;
    photoFilterWarning: string;
    interactiveLayerWarning: string;
    minZoomWarning: (minZoom: number) => string;
    countryWarning: (countries: string[]) => string;
    letters: Record<string, string>;
    customBase: string;
    type: {
      map: string;
      data: string;
      photos: string;
    };
    attr: Record<string, ReactNode>;
    layerSettings: string;
    customMaps: string;
    base: string;
    overlay: string;
    technology: string;
    url: string;
    minZoom: string;
    maxNativeZoom: string;
    extraScales: string;
    scaleWithDpi: string;
    layer: {
      layer: string;
      base: string;
      overlay: string;
    };
    zIndex: string;
    generalSettings: string;
    maxZoom: string;
  };
  elevationChart: {
    distance: string;
    ele: string;
    fetchError: ({ err }: Err) => string;
  };
  errorCatcher: {
    html: (ticketId?: string) => string;
  };
  osm: {
    fetchingError: ({ err }: Err) => string;
  };
  tracking: {
    trackedDevices: {
      button: string;
      modalTitle: string;
      desc: string;
      modifyTitle: (name: ReactNode) => JSX.Element;
      createTitle: (name: ReactNode) => JSX.Element;
      storageWarning: string;
    };
    accessToken: {
      token: string;
      timeFrom: string; // TODO move to general
      timeTo: string; // TODO move to general
      listingLabel: string;
      note: string; // TODO move to general
      delete: string;
    };
    accessTokens: {
      modalTitle: (deviceName: string) => JSX.Element;
      desc: (deviceName: string) => JSX.Element;
      createTitle: (deviceName: string) => JSX.Element;
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
  mapExport: {
    exportError: ({ err }: Err) => string;
    exporting: string;
    exported: ({ url }: { url: string }) => JSX.Element;
    area: string;
    areas: {
      visible: string;
      pinned: string;
    };
    format: string;
    layersTitle: string;
    layers: Record<ExportableLayer, string>;
    mapScale: string;
    alert: (licence?: ReactElement[]) => JSX.Element;
    advancedSettings: string;
    styles: string;
  };
  maps: {
    legacy: string;
    legacyMapWarning: ({
      from,
      to,
    }: {
      from: string;
      to: string;
    }) => JSX.Element;
    noMapFound: string;
    save: string;
    delete: string;
    disconnect: string;
    deleteConfirm: (name: string) => string;
    fetchError: ({ err }: Err) => string;
    fetchListError: ({ err }: Err) => string;
    deleteError: ({ err }: Err) => string;
    renameError: ({ err }: Err) => string;
    createError: ({ err }: Err) => string;
    saveError: ({ err }: Err) => string;
    loadToEmpty: string;
    loadInclMapAndPosition: string;
    savedMaps: string;
    newMap: string;
    SomeMap: (props: { name: string }) => JSX.Element;
    writers: string;
    addWriter: string;
    conflictError: string;
  };
  legend: {
    body: JSX.Element;
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
  mapCtxMenu: {
    centerMap: string;
    measurePosition: string;
    addPoint: string;
    startLine: string;
    queryFeatures: string;
    startRoute: string;
    finishRoute: string;
    showPhotos: string;
  };
  premium: {
    title: string;
    commonHeader: ReactNode;
    stepsForAnonymous: ReactNode;
    commonFooter: ReactNode;
    continue: string;
    success: string;
    becomePremium: string;
    youArePremium: (date: string) => JSX.Element;
    premiumOnly: string;
    alreadyPremium: string;
  };
  credits: {
    buyCredits: string;
    amount: string;
    credits: string;
    buy: string;
    purchase: {
      success: ({ amount }: { amount: number }) => JSX.Element;
    };
    youHaveCredits: (amount: ReactNode) => JSX.Element;
  };
  offline: {
    offlineMode: string;
    cachingActive: string;
    clearCache: string;
    dataSource: string;
    networkOnly: string;
    networkFirst: string;
    cacheFirst: string;
    cacheOnly: string;
  };
  errorStatus: Record<number, string>;
  gpu: {
    notSupported: string;
    noAdapter: string;
    lost: string;
    errorRequestingDevice: string;
    other: string;
  };
  downloadMap: {
    downloadMap: string;
    format: string;
    map: string;
    downloadArea: string;
    area: { visible: string; byPolygon: string };
    name: string;
    zoomRange: string;
    scale: string;
    email: string;
    emailInfo: string;
    download: string;
    success: string;
    summaryTiles: string;
    summaryPrice: (amount: ReactNode) => JSX.Element;
  };
};

export function addError(
  dpMessages: DeepPartialWithRequiredObjects<Messages>,
  message: string,
  err: unknown,
): string {
  const messages = dpMessages as Messages; // our message compiler will make it non-partial

  return (
    message +
    ': ' +
    (err instanceof HttpError
      ? (messages.errorStatus[err.status] ?? err.status) +
        (err.body ? ': ' + err.body : '')
      : !(err instanceof Error)
        ? String(err)
        : (err as Error & { _fm_fetchError: boolean })._fm_fetchError
          ? ((window.navigator.onLine === false
              ? messages.general.offline
              : messages.general.connectionError) ?? err.message)
          : err.message)
  );
}
