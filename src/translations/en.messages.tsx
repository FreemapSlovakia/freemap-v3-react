import { MaptilerAttribution } from '@app/components/MaptilerAttribution.js';
import { CookiesConsentText } from '@features/auth/components/CookiesConsentText.js';
import { CookieConsent } from '@features/cookieConsent/components/CookieConsent.js';
import { Attribution } from '@shared/components/Attribution.js';
import shared from './en-shared.js';
import { addError, type Messages } from './messagesInterface.js';

const masl = 'm\xa0a.s.l.';

const getErrorMarkup = (ticketId?: string) => `
<h1>Application error!</h1>
<p>
  ${
    ticketId
      ? `The error has been automatically reported under Ticket ID <b>${ticketId}</b>.`
      : ''
  }
  You can report the problem at <a href="https://github.com/FreemapSlovakia/freemap-v3-react/issues/new" target="_blank" rel="noopener noreferrer">GitHub</a>,
  or eventually email us the details at <a href="mailto:freemap@freemap.sk?subject=Nahlásenie%20chyby%20na%20www.freemap.sk">freemap@freemap.sk</a>.
</p>
<p>
  Thank you.
</p>`;

const outdoorMap = 'Hiking, Bicycle, Ski, Riding';

const messages: Messages = {
  general: {
    iso: 'en_US',
    elevationProfile: 'Elevation profile',
    save: 'Save',
    cancel: 'Cancel',
    modify: 'Modify',
    delete: 'Delete',
    remove: 'Remove',
    close: 'Close',
    cancelAutoClose: 'Cancel auto-close',
    collapse: 'Collapse',
    expand: 'Expand',
    apply: 'Apply',
    exitFullscreen: 'Exit fullscreen mode',
    fullscreen: 'Fullscreen',
    yes: 'Yes',
    no: 'No',
    masl,
    copyCode: 'Copy code',
    loading: 'Loading…',
    ok: 'OK',
    preventShowingAgain: "Don't show next time",
    closeWithoutSaving: 'Close the window with unsaved changes?',
    resetToDefaults: 'Reset to default',
    back: 'Back',
    internalError: ({ ticketId }) => (
      <span dangerouslySetInnerHTML={{ __html: getErrorMarkup(ticketId) }} />
    ),
    processorError: ({ err }) => addError(messages, 'Application error', err),
    seconds: 'seconds',
    minutes: 'minutes',
    meters: 'meters',
    createdAt: 'Created At',
    modifiedAt: 'Modified At',
    actions: 'Actions',
    add: 'Add new',
    clear: 'Clear',
    convertToDrawing: 'Convert to drawing',
    copyToDrawing: 'Copy to drawing',
    copyTo: ({ tool }) => <>Copy to {tool}</>,
    simplifyPrompt:
      'Please enter simplification factor. Set to zero for no simplification.',
    copyUrl: 'Copy URL',
    copyPageUrl: 'Copy page URL',
    savingError: ({ err }) => addError(messages, 'Save error', err),
    loadError: ({ err }) => addError(messages, 'Loading error', err),
    deleteError: ({ err }) => addError(messages, 'Deleting error', err),
    operationError: ({ err }) => addError(messages, 'Operation error', err),
    deleted: 'Deleted.',
    saved: 'Saved.',
    visual: 'Display',
    drawingTool: 'Drawing tool',
    copyOk: 'Copied to clipboard.',
    noCookies: () => (
      <>
        This functionality requires accepting the{' '}
        <CookiesConsentText>cookies consent</CookiesConsentText>.
      </>
    ),
    name: 'Name',
    icon: 'Icon',
    iconChoose: 'Choose icon…',
    iconNone: 'No icon',
    iconSearch: 'Search icons',
    load: 'Load',
    unknown: 'Unknown',
    enablePopup: 'Please enable pop-up windows for this site in you browser.',
    broadcastChannelUnsupported:
      'This action isn’t supported in your browser (BroadcastChannel is unavailable, e.g. in private mode or an in-app browser). Please use a standard window in a modern browser.',
    componentLoadingError:
      'Component loading error. Please check your internet connection.',
    offline: 'You are not connected to the internet.',
    offlineUnavailable: 'Unavailable without an internet connection.',
    offlineToolUnavailable:
      'This tool can’t load anything without an internet connection.',
    offlineNotice:
      'You are not connected to the internet, so nothing here can be loaded or sent.',
    connectionError: 'Error connecting the server.',
    experimentalFunction: 'Experimental function',
    attribution: () => <Attribution unknown="Map licence is not specified" />,
    unauthenticatedError: 'Please log-in to access this feature.',
    confirmation: 'Confirmation',
    export: 'Export',
    success: 'Success!',
    expiration: 'Expiration',
    privacyPolicy: 'Privacy policy',
    termsOfService: 'Terms of service',
    refundPolicy: 'Refund policy',
    infoAndLegal: 'Map information and legal',
    newOptionText: 'Add %value%',
    deleteButtonText: 'Remove %value% from the list',
    accept: 'Accept',
  },

  generic: {
    color: 'Color',
    size: 'Size',
    weight: 'Weight',
    width: 'Width',
  },

  theme: {
    light: 'Light mode',
    dark: 'Dark mode',
    auto: 'Automatic mode',
  },

  cardinals: {
    n: 'N',
    ne: 'NE',
    e: 'E',
    se: 'SE',
    s: 'S',
    sw: 'SW',
    w: 'W',
    nw: 'NW',
  },

  selections: {
    objects: 'Object (POI)',
    drawPoints: 'Point',
    drawLines: 'Line',
    drawPolygons: 'Polygon',
    drawPolygonHole: 'Hole in polygon',
    tracking: 'Tracking',
    linePoint: 'Line point',
    polygonPoint: 'Polygon point',
  },

  tools: {
    none: 'Close tool',
    routePlanner: 'Route finder',
    objects: 'Objects (POIs)',
    photos: 'Photos',
    measurement: 'Drawing and measurement',
    drawPoints: 'Point drawing',
    drawLines: 'Line drawing',
    drawPolygons: 'Polygon drawing',
    dataViewer: 'Tracks and data',
    changesets: 'Map changes',
    mapDetails: 'Map details',
    tracking: 'Live tracking',
    gpsRecorder: 'GPS recorder',
    toposcope: 'Toposcope',
    panorama: 'Panorama',
    myMaps: 'My maps',
    myMap: 'My map',
  },

  mainMenu: {
    title: 'Main menu',
    logOut: 'Log out',
    logIn: 'Log in',
    account: 'Account',
    mapFeaturesExport: 'Map data export',
    gpsDevicesMapExports: 'Maps for GPS devices',
    embedMap: 'Embed map',
    offlineMapExport: 'Offline maps export',
    supportUs: 'Support Freemap',
    help: 'Info & help',
    back: 'Back',
    mapLegend: 'Map legend',
    contacts: 'Contacts',
    facebook: 'Freemap on Facebook',
    twitter: 'Freemap on Twitter',
    youtube: 'Freemap on YouTube',
    github: 'Freemap on GitHub',
    mastodon: 'Freemap on Mastodon',
    googlePlay: 'Freemap on Google Play',
    appStore: 'Freemap on App Store',
    automaticLanguage: 'Automatic',
    mapToDocumentExport: 'Map export to image/document',
    osmWiki: 'OpenStreetMap documentation',
    wikiLink: 'https://wiki.openstreetmap.org/wiki/Main_Page',
    status: 'Services status',
    language: 'Language',
  },

  main: {
    title: shared.title,
    description: shared.description,
    clearMap: 'Clear map elements',
    close: 'Close',
    closeTool: 'Close tool',
    locateMe: 'Locate me',
    locationError: 'Error getting location.',
    locationNoSignal: 'No GPS signal yet.',
    headingSource: 'Direction indicator',
    headingSources: {
      none: 'Hidden',
      gps: 'Direction of travel',
      compass: 'Device compass',
    },
    headingSourceHelp:
      'Direction of travel comes from the GPS and only shows while you are moving. The device compass works while standing still too, but needs permission and can be inaccurate.',
    bearingLine: 'Distance and bearing',
    bearingLineHelp:
      'While locating, draws a line between your position and a crosshair in the middle of the map, labelled with the distance and the bearing from your position to the crosshair. Appears once you pan the map away from your position.',
    compassPermissionDenied: 'Access to the compass was denied.',
    compassUnavailable:
      'No compass data. Your device may have no compass, or access to it is blocked.',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    devInfo: () => (
      <div>
        This is a testing version of Freemap Slovakia. For production version
        navigate to <a href="https://www.freemap.sk/">www.freemap.sk</a>.
      </div>
    ),
    copyright: 'Copyright',
    cookieConsent: () => (
      <CookieConsent
        prompt="Some features may require cookies."
        local="Cookies of local settings and login via social networks"
        analytics="Analytics cookies"
      />
    ),
    infoBars: {},
  },

  search: {
    inProgress: 'Searching…',
    noResults: 'No results found',
    prompt: 'Enter the place',
    routeFrom: 'Route from here',
    routeTo: 'Route to here',
    fetchingError: ({ err }) => addError(messages, 'Searching error', err),
    buttonTitle: 'Search',
    placeholder: 'Search in the map',
    result: 'Lookup',
    showMore: 'Show more…',
    keepOnMap: 'Keep on the map',
    offlineHint:
      'Without an internet connection only coordinates, a bounding box, tile numbers (z/x/y) or pasted GeoJSON can be found.',
    sources: {
      bbox: 'Bounding Box',
      geojson: 'GeoJSON',
      tile: 'Tile',
      coords: 'Coordinates',
      'overpass-nearby': 'Nearby',
      'overpass-surrounding': 'Containing features',
      'nominatim-forward': 'Forward geocoding',
      'nominatim-reverse': 'Reverse geocoding',
      osm: 'OpenStreetMap',
      'wms:': 'WMS',
    },
  },

  mapLayers: {
    showMore: 'Show more maps',
    showAll: 'Show all maps',
    filterMaps: 'Filter maps',
    noMapsFound: 'No maps found',
    settings: 'Manage maps',
    layers: 'Maps',
    switch: 'Maps',
    photoFilterWarning: 'Photo filtering is active',
    interactiveLayerWarning: 'Map items layer is hidden',
    minZoomWarning: (minZoom) => `Accessible from zoom ${minZoom}`,
    outsideViewWarning: 'The current view is outside this map',
    offlineWarning: 'This map is not saved for offline use',
    letters: {
      S: 'Aerial',
      Z: 'Aerial',
      J1: 'Aerial (2017-2019)',
      J2: 'Aerial (2020-2022)',
      O: 'OpenStreetMap',
      d: 'Public transport (ÖPNV)',
      X: outdoorMap,
      XK: 'KST Hiking Trails',
      i: 'Data layer',
      I: 'Photos',
      l1: 'Forest tracks NLC (2017)',
      l2: 'Forest tracks NLC',
      w: 'Wikipedia',
      R: 'Weather radar',
      M: 'Wikimedia Commons photos',
      '5': 'Terrain shading',
      '6': 'Surface shading',
      '7': 'Detailed terrain shading',
      '8': 'Detailed terrain shading',
      VO: 'OpenStreetMap Vector',
      VS: 'Streets Vector',
      VD: 'Dataviz Vector',
      VT: 'Outdoor Vector',
      h: 'Parametric shading',
      z: 'Parametric shading',
      y: 'Parametric shading',
      WDZ: 'Tree Composition',
      WLT: 'Forest Types',
      WGE: 'Geological',
      WKA: 'Cadastre',
      wka: 'Cadastre',
      WHC: 'Hydrochemic',
    },
    customBase: 'Custom map',
    type: {
      map: 'map',
      data: 'data',
      photos: 'pictures',
      routing: 'routing',
    },
    attr: {
      osmData: '©\xa0OpenStreetMap contributors',
      maptiler: (
        <MaptilerAttribution
          tilesFrom="Vector tiles from"
          hostedBy="hosted by"
        />
      ),
      photosCc: 'various Creative Commons licenses',
    },
    layersConfiguration: 'Layers configuration',
    customMaps: 'Custom maps',
    addCustomMap: 'Add custom map',
    activate: 'Activate',
    customMapsEmptyMessage:
      'No custom maps defined yet. Add one to display your own map source.',
    base: 'Base layers',
    overlay: 'Overlay layers',
    technology: 'Type',
    technologies: {
      tile: 'Image tiles (TMS, XYZ)',
      maplibre: 'Vector (MapLibre)',
      wms: 'WMS',
      parametricShading: 'Parametric shading',
    },
    url: 'URL',
    minZoom: 'Min Zoom',
    maxNativeZoom: 'Max Native Zoom',
    extraScales: 'Extra resolutions',
    scaleWithDpi: 'Scale with DPI',
    tiled: 'Load in tiles',
    tiledHelp:
      'A WMS is asked for a single image of the whole view by default: one request instead of dozens, and labels placed without being cut at tile edges. Switch to tiles for a server that limits the image size or that caches tiles, at the cost of a burst of requests per view.',
    layer: {
      layer: 'Layer',
      base: 'Base',
      overlay: 'Overlay',
    },
    zIndex: 'Z-Index',
    preferences: 'Map preferences',
    maxZoom: 'Max zoom',
    zoomSnap: 'Zoom step',
    zoomSnapFree: 'Free',
    zoomSnapHelp:
      'The smallest zoom change scroll-wheel, pinch and box zoom can settle on. 1 keeps the map on whole zoom levels; a fraction lets it stop between them, and Free lets it stop anywhere. The + and – buttons and keys always go to the next whole level.',
    forcedScale: 'Forced scale',
    resolutionScale: 'Resolution scale',
    resolutionScaleAuto: 'Auto (device default)',
    resolutionScaleHelp:
      "Simulates display pixel density. Affects which tile variant is fetched. If a layer doesn't offer the requested variant, the highest available one is used instead.",
    featureScale: 'Feature size',
    featureScaleHelp:
      'Enlarges rendered labels and lines. Has no effect on satellite, shading, WMS, or vector (MapLibre) layers.',
    lookupStyle: 'Lookup style',
    resetApp: 'Reset application',
    resetAppConfirm:
      'Reset all application settings to their defaults and reload the page? You will be signed out.',
    loadWmsLayers: 'Load layers',
    serverNotResponding: ({ name }) => (
      <>
        No answer from the server of the map <b>{name}</b>.
      </>
    ),
    offlineMaps: 'Offline maps',
    browseCache: 'Cache while browsing',
    legacy: 'legacy',
    legacyMapWarning: ({ from, to }) => (
      <>
        Displayed map <b>{messages.mapLayers.letters[from]}</b> is a legacy one.
        Switch to modern <b>{messages.mapLayers.letters[to]}</b>?
      </>
    ),
  },

  elevationChart: {
    distance: 'Distance [km]',
    ele: `Elevation [${masl}]`,
    fetchError: ({ err }) =>
      addError(messages, 'Error fetching elevation profile data', err),
    settings: 'Elevation preferences',
    settingsHelp:
      'The first two correct a terrain model, so they apply wherever elevation is read from one: planned routes, drawn lines and measurements, and imported tracks whose elevation you replaced from the server. Recorded altitude — live tracking, or a track you kept as recorded — is left untouched. Exported files always keep their own elevation.',
    windowOff: 'off',
    windowWholeLine: 'whole line',
    despike: 'Remove spikes',
    despikeHelp:
      'Where a way is drawn a few metres off the road it describes, the terrain model answers with the bank or rock face beside it. Spikes narrower than half of this are dropped and the profile is lightly rounded; anything wider is kept, being real terrain. Zero switches it off.',
    ditchFill: 'Fill terrain-model ditches',
    ditchFillHelp:
      'The detailed national terrain models, available in some countries, are usually adjusted for hydrology: they dig a ditch through the road at every culvert. Dips narrower than this are filled; wider ones are kept, being real terrain. Zero switches it off, and it changes nothing where the global model is used.',
    gradeWindow: 'Steepness window',
    gradeWindowHelp:
      'Pointing at the elevation profile marks the spot on the map and reports how steep it is there. The steepness is averaged over a stretch this long around that point, so that a couple of metres of GPS noise don’t read as a wall. Zero measures it across just the segment that point stands on; the far end of the scale measures across the whole line at once, reporting its rise over its whole length — on a straight measuring line, the angle one end is seen at from the other.',
  },

  errorCatcher: {
    html: (ticketId) => `${getErrorMarkup(ticketId)}
      <p>
        You can try:
      </p>
      <ul>
        <li><a href="">reload last page</a></li>
        <li><a href="/">load initial page</a></li>
        <li><a href="/#reset-local-storage">clear local data and load initial page</a></li>
      </ul>
    `,
  },

  mapCtxMenu: {
    centerMap: 'Center a map here',
    measurePosition: 'Find coordinates and elevation',
    addPoint: 'Add here a point',
    startLine: 'Start here drawing a line or measurement',
    queryFeatures: 'Query nearby features',
    startRoute: 'Plan a route from here',
    finishRoute: 'Plan a route to here',
    showPhotos: 'Show nearby photos',
  },

  errorStatus: {
    100: 'Continue',
    101: 'Switching Protocols',
    102: 'Processing',
    103: 'Early Hints',
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    203: 'Non-Authoritative Information',
    204: 'No Content',
    205: 'Reset Content',
    206: 'Partial Content',
    207: 'Multi-Status',
    208: 'Already Reported',
    226: 'IM Used',
    300: 'Multiple Choices',
    301: 'Moved Permanently',
    302: 'Found',
    303: 'See Other',
    304: 'Not Modified',
    305: 'Use Proxy',
    306: 'Switch Proxy',
    307: 'Temporary Redirect',
    308: 'Permanent Redirect',
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Payload Too Large',
    414: 'URI Too Long',
    415: 'Unsupported Media Type',
    416: 'Range Not Satisfiable',
    417: 'Expectation Failed',
    418: "I'm a teapot",
    421: 'Misdirected Request',
    422: 'Unprocessable Entity',
    423: 'Locked',
    424: 'Failed Dependency',
    425: 'Too Early',
    426: 'Upgrade Required',
    428: 'Precondition Required',
    429: 'Too Many Requests',
    431: 'Request Header Fields Too Large',
    451: 'Unavailable For Legal Reasons',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
    505: 'HTTP Version Not Supported',
    506: 'Variant Also Negotiates',
    507: 'Insufficient Storage',
    508: 'Loop Detected',
    510: 'Not Extended',
    511: 'Network Authentication Required',
  },
  gpu: {
    lost: 'The GPU device was lost: ',
    noAdapter: 'WebGPU adapter is not available in this browser.',
    notSupported: 'WebGPU is not supported in this browser.',
    errorRequestingDevice: 'Failed to create GPU device: ',
    other: 'Error rendering: ',
  },
};

export default messages;
