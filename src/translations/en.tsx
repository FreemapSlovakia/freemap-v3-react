import { AlertLink } from 'react-bootstrap';
import { FaGem, FaKey } from 'react-icons/fa';
import { Attribution } from '../components/Attribution.js';
import { ChangesetDetails } from '../components/ChangesetDetails.js';
import { CookieConsent } from '../components/CookieConsent.js';
import { ElevationInfo } from '../components/ElevationInfo.js';
import { Emoji } from '../components/Emoji.js';
import { MaptilerAttribution } from '../components/MaptilerAttribution.js';
import {
  ObjectDetailBasicProps,
  ObjectDetails,
} from '../components/ObjectDetails.js';
import { TrackViewerDetails } from '../components/TrackViewerDetails.js';
import shared from './en-shared.js';
import { Messages, addError } from './messagesInterface.js';

const nf33 = new Intl.NumberFormat('en', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

const nf00 = new Intl.NumberFormat('en', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

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
    back: 'Back',
    internalError: ({ ticketId }) => `!HTML!${getErrorMarkup(ticketId)}`,
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
    copyOk: 'Copied to clipboard.',
    noCookies: 'This functionality requires accepting the cookies consent.',
    name: 'Name',
    load: 'Load',
    unnamed: 'No name',
    enablePopup: 'Please enable pop-up windows for this site in you browser.',
    componentLoadingError:
      'Component loading error. Please check your internet connection.',
    offline: 'You are not connected to the internet.',
    connectionError: 'Error connecting the server.',
    experimentalFunction: 'Experimental function',
    attribution: () => <Attribution unknown="Map licence is not specified" />,
    unauthenticatedError: 'Please log-in to access this feature.',
    areYouSure: 'Are you sure?',
    export: 'Export',
    success: 'Success!',
    expiration: 'Expiration',
    privacyPolicy: 'Privacy policy',
    newOptionText: 'Add %value%',
    deleteButtonText: 'Remove %value% from the list',
  },

  selections: {
    objects: 'Object (POI)',
    drawPoints: 'Point',
    drawLines: 'Line',
    drawPolygons: 'Polygon',
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
    trackViewer: 'Track viewer (GPX)',
    changesets: 'Map changes',
    mapDetails: 'Map details',
    tracking: 'Live tracking',
    maps: 'My maps',
  },

  routePlanner: {
    manual: 'Manual',
    manualTooltip: 'Connect following segment with direct line',
    ghParams: {
      tripParameters: 'Trip parameters',
      seed: 'Random seed',
      distance: 'Approximate distance',
      isochroneParameters: 'Isochrone parameters',
      buckets: 'Buckets',
      timeLimit: 'Time limit',
      distanceLimit: 'Distance limit',
    },
    milestones: 'Milestones',
    start: 'Start',
    finish: 'Finish',
    swap: 'Swap start and finish',
    point: {
      point: 'Route point',
      pick: 'Select on the map',
      current: 'Your position',
      home: 'Home position',
    },
    transportType: {
      car: 'Car',
      car4wd: 'Car (4WD)',
      bike: 'Bicycle',
      foot: 'Walking',
      hiking: 'Hiking',
      mtb: 'Mountain bike',
      racingbike: 'Racing bike',
      motorcycle: 'Motorcycle',
    },
    development: 'in development',
    mode: {
      route: 'Ordered',
      trip: 'Visiting places',
      roundtrip: 'Visiting places (roundtrip)',
      'routndtrip-gh': 'Roundtrip',
      isochrone: 'Isochrones',
    },
    alternative: 'Alternative',
    distance: ({ value, diff }) => (
      <>
        Distance:{' '}
        <b>
          {value}
          {diff ? ` (+ ${diff})` : ''}
        </b>
      </>
    ),
    duration: ({ h, m, diff }) => (
      <>
        Duration:{' '}
        <b>
          {h} h {m} m{diff && ` (+ ${diff.h} h ${diff.m} m)`}
        </b>
      </>
    ),
    summary: ({ distance, h, m }) => (
      <>
        Distance: <b>{distance}</b> | Duration:{' '}
        <b>
          {h} h {m} m
        </b>
      </>
    ),
    noHomeAlert: {
      msg: 'You need to set your home position in settings first.',
      setHome: 'Set',
    },
    showMidpointHint: 'To add a midpoint, drag a route segment.',
    gpsError: 'Error getting your current location.',
    routeNotFound:
      'No route found. Try to change parameters or move the route points.',
    fetchingError: ({ err }) =>
      addError(messages, 'Error finding the route', err),
  },

  mainMenu: {
    title: 'Main menu',
    logOut: 'Log out',
    logIn: 'Log in',
    account: 'Account',
    mapFeaturesExport: 'Export map features',
    mapExports: 'Map for GPS devices',
    embedMap: 'Embed map',
    supportUs: 'Support Freemap',
    help: 'Info & help',
    back: 'Back',
    mapLegend: 'Map legend',
    contacts: 'Contacts',
    facebook: 'Freemap on Facebook',
    twitter: 'Freemap on Twitter',
    youtube: 'Freemap on YouTube',
    github: 'Freemap on GitHub',
    automaticLanguage: 'Automatic',
    mapExport: 'Export map',
    osmWiki: 'OpenStreetMap documentation',
    wikiLink: 'https://wiki.openstreetmap.org/wiki/Main_Page',
  },

  main: {
    title: shared.title,
    description: shared.description,
    clearMap: 'Clear map elements',
    close: 'Close',
    closeTool: 'Close tool',
    locateMe: 'Locate me',
    locationError: 'Error getting location.',
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
        prompt="Some features may require cookies. Accept:"
        local="Cookies of local settings and login via social networks"
        analytics="Analytics cookies"
      />
    ),
    infoBars: {
      ua: () => (
        <>
          <Emoji>🇺🇦</Emoji> We stand with Ukraine.{' '}
          <AlertLink
            href="https://bank.gov.ua/en/about/support-the-armed-forces"
            target="_blank"
            rel="noopener"
          >
            Donate to the Ukrainian Army ›
          </AlertLink>{' '}
          <Emoji>🇺🇦</Emoji>
        </>
      ),
    },
    ad: (email) => (
      <>
        Interested in placing your own ad here? Don’t hesitate to contact us at{' '}
        {email}.
      </>
    ),
  },

  gallery: {
    legend: 'Legend',
    recentTags: 'Recent tags to assign:',
    filter: 'Filter',
    showPhotosFrom: 'View photos',
    showLayer: 'Show the layer',
    upload: 'Upload',
    f: {
      '-createdAt': 'from last uploaded',
      '-takenAt': 'from newest',
      '-rating': 'from most rated',
      '-lastCommentedAt': 'from last comment',
    },
    colorizeBy: 'Colorize by',
    showDirection: 'Show shooting direction',
    showLegend: 'Show colorizing legend',
    c: {
      disable: "Don't colorize",
      mine: 'Differ mine',
      userId: 'Author',
      rating: 'Rating',
      takenAt: 'Taken date',
      createdAt: 'Upload date',
      season: 'Season',
      premium: 'Premium',
    },
    viewer: {
      title: 'Photo',
      comments: 'Comments',
      newComment: 'New comment',
      addComment: 'Add',
      yourRating: 'Your rating:',
      showOnTheMap: 'Show on the map',
      openInNewWindow: 'Open in…',
      uploaded: ({ username, createdAt }) => (
        <>
          Uploaded by {username} on {createdAt}
        </>
      ),
      captured: (takenAt) => <>Captured on {takenAt}</>,
      deletePrompt: 'Delete this picture?',
      modify: 'Modify',
      premiumOnly:
        'This photo has been made available by its author only to users with premium access.',
      noComments: 'No comments',
    },
    editForm: {
      name: 'Name',
      description: 'Description',
      takenAt: {
        datetime: 'Capture date and time',
        date: 'Capture date',
        time: 'Capture time',
      },
      location: 'Location',
      azimuth: 'Azimuth',
      tags: 'Tags',
      setLocation: 'Set the location',
    },
    uploadModal: {
      title: 'Upload photos',
      uploading: (n) => `Uploading (${n})`,
      upload: 'Upload',
      rules: `
        <p>Drop your photos here or click here to select them.</p>
        <ul>
          <li>Do not upload too small photos (thumbnails). Maximum dimensions are not limited. The maximum file size is limited to 10MB. Bigger files will be rejected.</li>
          <li>Upload only photos of landscapes or documentation pictures. Portraits and macro photos are undesirable and will be deleted without warning.</li>
          <li>Please upload only your own photos.</li>
          <li>Captions or comments that do not directly relate to the content of the uploaded photos, or contradict generally accepted principles of civilized coexistence will be removed. Violators of this rule will be warned, and in case of repeated violations, their account in the application may be canceled.</li>
          <li>By uploading the photos, you agree they will be distributed under the terms of CC BY-SA 4.0 license.</li>
          <li>The operator (Freemap.sk) hereby disclaims all liability and is not liable for direct or indirect damages resulting from publication of a photo in the gallery. The person who has uploaded the picture on the server is fully responsible for the photo.</li>
          <li>The operator reserves the right to edit the description, name, position and tags of photo, or to delete the photo if the content is inappropriate (violate these rules).</li>
          <li>The operator reserves the right to delete the account in case that the user repeatedly violates the gallery policy by publishing inappropriate content.</li>
        </ul>
      `,
      success: 'Pictures have been successfully uploaded.',
      showPreview:
        'Automatically show previews (uses more CPU load and memory)',
      loadPreview: 'Load preview',
      premium: 'Make available only to users with premium access',
    },
    locationPicking: {
      title: 'Select photo location',
    },
    deletingError: ({ err }) => addError(messages, 'Error deleting photo', err),
    tagsFetchingError: ({ err }) =>
      addError(messages, 'Error fetching tags', err),
    pictureFetchingError: ({ err }) =>
      addError(messages, 'Error fetching photo', err),
    picturesFetchingError: ({ err }) =>
      addError(messages, 'Error fetching photos', err),
    savingError: ({ err }) => addError(messages, 'Error saving photo', err),
    commentAddingError: ({ err }) =>
      addError(messages, 'Error adding comment', err),
    ratingError: ({ err }) => addError(messages, 'Error rating photo', err),
    missingPositionError: 'Missing location.',
    invalidPositionError: 'Invalid location coordinates format.',
    invalidTakenAt: 'Invalid capture date and time.',
    filterModal: {
      title: 'Photo filtering',
      tag: 'Tag',
      createdAt: 'Upload date',
      takenAt: 'Capture date',
      author: 'Author',
      rating: 'Rating',
      noTags: 'no tags',
      pano: 'Panorama',
      premium: 'Premium',
    },
    noPicturesFound: 'There were no photos found on this place.',
    linkToWww: 'photo at www.freemap.sk',
    linkToImage: 'photo image file',
    allMyPhotos: {
      premium: 'Include all my photos in premium content',
      free: 'Make all my photos accessible to everyone',
    },
  },

  measurement: {
    distance: 'Line',
    elevation: 'Point',
    area: 'Polygon',
    elevationFetchError: ({ err }) =>
      addError(messages, 'Error fetching point elevation', err),
    elevationInfo: (params) => (
      <ElevationInfo
        {...params}
        lang="cs"
        tileMessage="Tile"
        maslMessage="Elevation"
      />
    ),
    areaInfo: ({ area }) => (
      <>
        Area:
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
        Length:
        <div>{nf33.format(length * 1000)}&nbsp;m</div>
        <div>{nf33.format(length)}&nbsp;km</div>
      </>
    ),
  },

  trackViewer: {
    upload: 'Upload',
    moreInfo: 'More info',
    share: 'Save on server',
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
      durationValue: ({ h, m }) => `${h} hours ${m} minutes`,
    },
    uploadModal: {
      title: 'Upload the track',
      drop: 'Drop your .gpx file here or click here to select it.',
    },
    shareToast:
      'The track has been saved to the server and can be shared by copying page URL.',
    fetchingError: ({ err }) =>
      addError(messages, 'Error fetching track data', err),
    savingError: ({ err }) => addError(messages, 'Error saving the track', err),
    loadingError: 'Error loading file.',
    onlyOne: 'Only single GPX file expected.',
    wrongFormat: 'The file must have .gpx extension.',
    info: () => <TrackViewerDetails />,
    tooBigError: 'The file is too big.',
  },

  drawing: {
    modify: 'Properties',
    edit: {
      title: 'Properties',
      color: 'Color',
      label: 'Label',
      width: 'Width',
      hint: 'To remove label leave this field empty.',
      type: 'Geometry type',
    },
    continue: 'Continue',
    join: 'Join',
    split: 'Split',
    stopDrawing: 'Stop drawing',
    selectPointToJoin: 'Select point to join lines',
    defProps: {
      menuItem: 'Style settings',
      title: 'Default drawing style settings',
      applyToAll: 'Save and apply to all',
    },
    projection: {
      projectPoint: 'Project point',
      azimuth: 'Azimuth',
      distance: 'Distance',
    },
  },

  purchases: {
    purchases: 'Purchases',
    premiumExpired: (at) => <>Your premium access expired at {at}</>,
    date: 'Date',
    item: 'Item',
    notPremiumYet: 'You are not premium yet.',
    noPurchases: 'No purchases',
    premium: 'Premium',
    credits: (amount) => <>Credits (${amount})</>,
  },

  settings: {
    map: {
      homeLocation: {
        label: 'Home location:',
        select: 'Select on the map',
        undefined: 'undefined',
      },
    },
    account: {
      name: 'Name',
      email: 'Email',
      sendGalleryEmails: 'Notify photos comments via email',
      delete: 'Delete account',
      deleteWarning:
        'Are you sure to delete your account? It will remove all your photos, photo comments and ratings, your maps, and tracked devices.',
      personalInfo: 'Personal information',
      authProviders: 'Login providers',
    },
    general: {
      tips: 'Show tips on page opening (only if Slovak or Czech language is selected)',
    },
    layer: 'Map',
    overlayOpacity: 'Opacity',
    showInMenu: 'Show in menu',
    showInToolbar: 'Show in toolbar',
    saveSuccess: 'Settings have been saved.',
    savingError: ({ err }) => addError(messages, 'Error saving settings', err),
    customLayersDef: 'Custom map layers definition',
    customLayersDefError: 'Invalid definition of custom map layers.',
  },

  changesets: {
    allAuthors: 'All authors',
    tooBig:
      'Changesets request may return too many items. Please try zoom in, choose fewer days or enter the specific author.',
    olderThan: ({ days }) => `${days} days`,
    olderThanFull: ({ days }) => `Changesets from last ${days} days`,
    notFound: 'No changesets found.',
    fetchError: ({ err }) =>
      addError(messages, 'Error fetching changesets', err),
    detail: ({ changeset }) => <ChangesetDetails changeset={changeset} />,
    details: {
      author: 'Author:',
      description: 'Description:',
      noDescription: 'without description',
      closedAt: 'Time:',
      moreDetailsOn: ({ osmLink, achaviLink }) => (
        <p>
          More details on {osmLink} or {achaviLink}.
        </p>
      ),
    },
  },

  mapDetails: {
    notFound: 'Nothing found here.',
    fetchingError: ({ err }) =>
      addError(messages, 'Error fetching details', err),
    detail: (props: ObjectDetailBasicProps) => (
      <ObjectDetails
        {...props}
        openText="Open at OpenStreetMap.org"
        historyText="history"
        editInJosmText="Edit in JOSM"
      />
    ),
  },

  objects: {
    type: 'Type',
    lowZoomAlert: {
      message: ({ minZoom }) =>
        `To see objects by their type, you need to zoom in to at least level ${minZoom}.`,
      zoom: 'Zoom-in',
    },
    tooManyPoints: ({ limit }) => `Result was limited to ${limit} objects.`,
    fetchingError: ({ err }) =>
      addError(messages, 'Error fetching objects (POIs)', err),
    icon: {
      pin: 'Pin',
      ring: 'Ring',
      square: 'Square',
    },
  },

  external: {
    openInExternal: 'Share / Open in external app.',
    osm: 'OpenStreetMap',
    oma: 'OMA',
    googleMaps: 'Google Maps',
    hiking_sk: 'Hiking.sk',
    zbgis: 'ZBGIS',
    mapy_cz: 'Mapy.com',
    josm: 'Edit in JOSM',
    id: 'Edit in iD',
    window: 'New window',
    url: 'Share URL',
    image: 'Share photo',
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
  },

  embed: {
    code: 'Put the following code to your HTML page:',
    example: 'The result will look like this:',
    dimensions: 'Dimensions',
    height: 'Height',
    width: 'Width',
    enableFeatures: 'Enable features',
    enableSearch: 'search',
    enableMapSwitch: 'map layer switch',
    enableLocateMe: 'find me',
  },

  documents: {
    errorLoading: 'Error loading document.',
  },

  exportMapFeatures: {
    download: 'Download',
    format: 'Format',
    target: 'Target',
    exportError: ({ err }) => addError(messages, 'Error exporting', err),
    what: {
      plannedRoute: 'found route',
      plannedRouteWithStops: 'include stops',
      objects: 'objects (POIs)',
      pictures: 'photos (in the visible map area)',
      drawingLines: 'drawing - lines',
      drawingAreas: 'drawing - polygons',
      drawingPoints: 'drawing - points',
      tracking: 'live tracking',
      gpx: 'GPX track',
      search: 'highlighted map feature',
    },
    disabledAlert:
      'Only checkboxes having anything in the map to export are enabled.',
    licenseAlert:
      'Various licenses may apply - like OpenStreetMap. Please add missing attributions upon sharing exported file.',
    exportedToDropbox: 'File has been saved to Dropboxu.',
    exportedToGdrive: 'File has been saved to Google Drive.',
    garmin: {
      courseName: 'Course name',
      description: 'Description',
      activityType: 'Activity type',
      at: {
        running: 'Running',
        hiking: 'Hiking',
        other: 'Other',
        mountain_biking: 'Mountain biking',
        trailRunning: 'Trail running',
        roadCycling: 'Road cycling',
        gravelCycling: 'Gravel cycling',
      },
      revoked: 'Exporting course to Garmin has been revoked.',
      connectPrompt:
        "You don't have your Garmin account connected yet. Do you wish to do it now?",
      authPrompt:
        'You are not authenticated with Garmin yet. Do you wish to do it now?',
    },
  },

  auth: {
    provider: {
      facebook: 'Facebook',
      google: 'Google',
      osm: 'OpenStreetMap',
      garmin: 'Garmin',
    },
    connect: {
      label: 'Connect',
      success: 'Connected',
    },
    disconnect: {
      label: 'Disconnect',
      success: 'Disconnected',
    },
    logIn: {
      with: 'Choose a login provider',
      success: 'You have been successfully logged in.',
      logInError: ({ err }) => addError(messages, 'Error logging in', err),
      logInError2: 'Error logging in.',
      verifyError: ({ err }) =>
        addError(messages, 'Error verifying authentication', err),
    },
    logOut: {
      success: 'You have been successfully logged out.',
      error: ({ err }) => addError(messages, 'Error logging out', err),
    },
  },

  mapLayers: {
    showMore: 'Show more maps',
    showAll: 'Show all maps',
    settings: 'Map settings',
    layers: 'Maps',
    switch: 'Maps',
    photoFilterWarning: 'Photo filtering is active',
    interactiveLayerWarning: 'Interactive layer is hidden',
    minZoomWarning: (minZoom) => `Accessible from zoom ${minZoom}`,
    countryWarning: (countries) =>
      `Covers only following countries: ${countries.join(', ')}`,
    letters: {
      A: 'Car',
      T: 'Hiking',
      C: 'Bicycle',
      K: 'Crosscountry Ski',
      S: 'Aerial',
      Z: 'Aerial',
      J1: 'Ortofotomozaika SR (1st cycle)',
      J2: 'Ortofotomozaika SR (2nd cycle)',
      O: 'OpenStreetMap',
      d: 'Public transport (ÖPNV)',
      X: outdoorMap,
      i: 'Interactive layer',
      I: 'Photos',
      l: 'Forest tracks NLC',
      t: 'Hiking trails',
      c: 'Bicycle trails',
      s0: 'Strava (all)',
      s1: 'Strava (rides)',
      s2: 'Strava (runs)',
      s3: 'Strava (water activities)',
      s4: 'Strava (winter activities)',
      w: 'Wikipedia',
      '4': 'Light terrain shading',
      '5': 'Terrain shading',
      '6': 'Surface shading',
      '7': 'Detailed surface shading',
      '8': 'Detailed surface hillshading',
      VO: 'OpenStreetMap Vector',
      VS: 'Streets Vector',
      VD: 'Dataviz Vector',
      VT: 'Outdoor Vector',
      h: 'Parametric shading',
      z: 'Parametric shading',
    },
    customBase: 'Custom map',
    type: {
      map: 'map',
      data: 'data',
      photos: 'pictures',
    },
    attr: {
      osmData: '©\xa0OpenStreetMap contributors',
      maptiler: (
        <MaptilerAttribution
          tilesFrom="Vector tiles from"
          hostedBy="hosted by"
        />
      ),
    },
    layerSettings: 'Map layers',
    customMaps: 'Custom maps',
    base: 'Base layers',
    overlay: 'Overlay layers',
    urlTemplate: 'URL Template',
    minZoom: 'Min Zoom',
    maxNativeZoom: 'Max Native Zoom',
    extraScales: 'Extra resolutions',
    scaleWithDpi: 'Scale with DPI',
    layer: 'Layer',
    zIndex: 'Z-Index',
    generalSettings: 'General settings',
    maxZoom: 'Max zoom',
  },

  elevationChart: {
    distance: 'Distance [km]',
    ele: `Elevation [${masl}]`,
    fetchError: ({ err }) =>
      addError(messages, 'Error fetching elevation profile data', err),
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

  osm: {
    fetchingError: ({ err }) =>
      addError(messages, 'Error fetching OSM data', err),
  },

  tracking: {
    trackedDevices: {
      button: 'Watched',
      modalTitle: 'Watched Devices',
      desc: 'Manage watched devices to see the position of your friends.',
      modifyTitle: (name) => (
        <>
          Modify Watched Device <i>{name}</i>
        </>
      ),
      createTitle: (name) => (
        <>
          Watch Device <i>{name}</i>
        </>
      ),
      storageWarning:
        'Please note that the list of devices is only reflected in the page URL. If you want to save it, use the "My Maps" function.',
    },
    accessToken: {
      token: 'Watch Token',
      timeFrom: 'From',
      timeTo: 'To',
      listingLabel: 'Listing Label',
      note: 'Note',
      delete: 'Delete access token?',
    },
    accessTokens: {
      modalTitle: (deviceName) => (
        <>
          Watch Tokens for <i>{deviceName}</i>
        </>
      ),
      desc: (deviceName) => (
        <>
          Define watch tokens to share position of your device{' '}
          <i>{deviceName}</i> with your friends.
        </>
      ),
      createTitle: (deviceName) => (
        <>
          Add Watch Token for <i>{deviceName}</i>
        </>
      ),
      modifyTitle: ({ token, deviceName }) => (
        <>
          Modify Watch Token <i>{token}</i> for <i>{deviceName}</i>
        </>
      ),
    },
    trackedDevice: {
      token: 'Watch Token',
      label: 'Label',
      fromTime: 'Since',
      maxAge: 'Max Age',
      maxCount: 'Max Count',
      splitDistance: 'Split Distance',
      splitDuration: 'Split Duration',
      color: 'Color',
      width: 'Width',
    },
    devices: {
      button: 'My Devices',
      modalTitle: 'My tracked devices',
      createTitle: 'Create Tracking Device',
      watchTokens: 'Watch tokens',
      watchPrivately: 'Watch privately',
      watch: 'Watch',
      delete: 'Delete device?',
      modifyTitle: ({ name }) => (
        <>
          Modify Tracking Device <i>{name}</i>
        </>
      ),
      desc: () => (
        <>
          <p>
            Manage your devices so that others can watch your position if you
            give them watch token (you can create it through <FaKey /> icon).
          </p>
          <hr />
          <p>
            Enter following URL to your tracker (eg.{' '}
            <a href="https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking">
              Locus
            </a>{' '}
            or OsmAnd):{' '}
            <code>
              {process.env['API_URL']}/tracking/track/<i>token</i>
            </code>{' '}
            where <i>token</i> is listed in the table below.
          </p>
          <p>
            Endpoint supports HTTP <code>GET</code> or <code>POST</code> with
            URL-encoded parameters:
          </p>
          <ul>
            <li>
              <code>lat</code> - latitude in degrees (mandatory)
            </li>
            <li>
              <code>lon</code> - longitude in degrees (mandatory)
            </li>
            <li>
              <code>time</code>, <code>timestamp</code> - JavaScript parsable
              datetime or Unix time in s or ms
            </li>
            <li>
              <code>alt</code>, <code>altitude</code> - altitude in meters
            </li>
            <li>
              <code>speed</code> - speed in m/s
            </li>
            <li>
              <code>speedKmh</code> - speed in km/h
            </li>
            <li>
              <code>acc</code> - accuracy in meters
            </li>
            <li>
              <code>hdop</code> - horizontal DOP
            </li>
            <li>
              <code>bearing</code> - bearing in degrees
            </li>
            <li>
              <code>battery</code> - battery in percents
            </li>
            <li>
              <code>gsm_signal</code> - GSM signal in percents
            </li>
            <li>
              <code>message</code> - message (note)
            </li>
          </ul>
          <hr />
          <p>
            In the case of tracker TK102B, configure it's address to{' '}
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
      token: 'Track Token',
      name: 'Name',
      maxAge: 'Max Age',
      maxCount: 'Max Count',
      regenerateToken: 'Regenerate',
      generatedToken: 'will be generated on save',
    },
    visual: {
      line: 'Line',
      points: 'Points',
      'line+points': 'Line + Points',
    },
    subscribeNotFound: ({ id }) => (
      <>
        Watch token <i>{id}</i> doesn't exist.
      </>
    ),
    subscribeError: ({ id }) => (
      <>
        Error watching using token <i>{id}</i>.
      </>
    ),
  },
  mapExport: {
    advancedSettings: 'Advanced options',
    styles: 'Interactive layer styles',
    exportError: ({ err }) => addError(messages, 'Error exporting map', err),
    exporting: 'Please wait, exporting map…',
    exported: ({ url }) => (
      <>
        Map export has finished.{' '}
        <AlertLink href={url} target="_blank">
          Open.
        </AlertLink>
      </>
    ),
    area: 'Export area',
    areas: {
      visible: 'Visible area of the map',
      pinned: 'Area containing selected polygon (drawing)',
    },
    format: 'Format',
    layersTitle: 'Optional layers',
    layers: {
      contours: 'Contours',
      shading: 'Shaded relief',
      hikingTrails: 'Hiking trails',
      bicycleTrails: 'Bicycle trails',
      skiTrails: 'Ski trails',
      horseTrails: 'Horse trails',
      drawing: 'Drawing',
      plannedRoute: 'Found route',
      track: 'GPX track',
    },
    mapScale: 'Map resolution',
    alert: (licence) => (
      <>
        Notes:
        <ul>
          <li>
            Exported will be <i>{outdoorMap}</i> map.
          </li>
          <li>Export of the map may last tens of seconds.</li>
          <li>
            Before sharing exported map accompain it with the following
            attribution:
            <br />
            <em>{licence}</em>
          </li>
        </ul>{' '}
      </>
    ),
  },

  maps: {
    legacy: 'legacy',
    legacyMapWarning: ({ from, to }) => (
      <>
        Displayed map <b>{messages.mapLayers.letters[from]}</b> is a legacy one.
        Switch to modern <b>{messages.mapLayers.letters[to]}</b>?
      </>
    ),
    noMapFound: 'No map found',
    save: 'Save',
    delete: 'Delete',
    disconnect: 'Disconnect',
    deleteConfirm: (name) => `Are you sure to delete map ${name}?`,
    fetchError: ({ err }) => addError(messages, 'Error loading map', err),
    fetchListError: ({ err }) => addError(messages, 'Error loading maps', err),
    deleteError: ({ err }) => addError(messages, 'Error deleting map', err),
    renameError: ({ err }) => addError(messages, 'Error renaming map', err),
    createError: ({ err }) => addError(messages, 'Error saving map', err),
    saveError: ({ err }) => addError(messages, 'Error saving map', err),
    loadToEmpty: 'Load to empty map',
    loadInclMapAndPosition:
      'Load including saved background map and its position',
    savedMaps: 'Saved maps',
    newMap: 'New map',
    SomeMap: ({ name }) => (
      <>
        Map <i>{name}</i>
      </>
    ),
    writers: 'Editors',
    addWriter: 'Add an editor',
    conflictError: 'The map has been modified in the meantime.',
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

  legend: {
    body: (
      <>
        Map legend for <i>{outdoorMap}</i>:
      </>
    ),
  },

  contacts: {
    ngo: 'Voluntary association',
    registered: 'Registered at MV/VVS/1-900/90-34343 on 2009-10-02',
    bankAccount: 'Bank account',
    generalContact: 'General contacts',
    board: 'Board',
    boardMemebers: 'Board members',
    president: 'President',
    vicepresident: 'Vice-President',
    secretary: 'Secretary',
  },

  premium: {
    title: 'Get premium access',
    commonHeader: (
      <>
        <p>
          <strong>Support the volunteers who create this map!</strong>
        </p>
        <p className="mb-1">
          For <b>8 hours</b> of your volunteer* work or <b>8 €</b> you will have
          a year of access with:
        </p>
        <ul>
          <li>removed ad banner</li>
          <li>
            access to <FaGem /> premium map layers
          </li>
          <li>
            access to <FaGem /> premium photos
          </li>
        </ul>
      </>
    ),
    stepsForAnonymous: (
      <>
        <div className="fw-bold">Procedure</div>
        <div className="mb-3">
          <p className="mb-1 ms-3">
            <span className="fw-semibold">Step 1</span> - create an account here
            in Freemap (below)
          </p>
          <p className="mb-1 ms-3">
            <span className="fw-semibold">Step 2</span> - in the Rovas
            application, where we'll direct you after registration, send us the
            payment.
          </p>
        </div>
      </>
    ),
    commonFooter: (
      <p className="small">
        * You can prove your volunteer work by creating work reports in the{' '}
        <a href="https://rovas.app/">Rovas</a> application. If you are a
        volunteer in the OSM project and are using the JOSM application, we
        recommend enabling the{' '}
        <a href="https://josm.openstreetmap.de/wiki/Help/Plugin/RovasConnector">
          Rovas Connector plugin
        </a>
        , which can create reports for you. After a report is verified by two
        users, you will receive the community currency <i>Chron</i>, which you
        can use to obtain premium access to www.freemap.sk or purchase credits.
      </p>
    ),
    continue: 'Continue',
    success: 'Congratulations, you have gained premium access!',
    becomePremium: 'Get premium access',
    youArePremium: (date) => (
      <>
        You have premium access until <b>{date}</b>.
      </>
    ),
    premiumOnly: 'Only available with premium access.',
    alreadyPremium: 'You already have premium access.',
  },

  credits: {
    buyCredits: 'Buy credits',
    amount: 'Credits',
    credits: 'credits',
    buy: 'Buy',
    purchase: {
      success: ({ amount }) => (
        <>Your credit has been increased by {nf00.format(amount)}.</>
      ),
    },
    youHaveCredits: (amount) => <>You have {amount} credits.</>,
  },

  offline: {
    offlineMode: 'Offline mode',
    cachingActive: 'Caching active',
    clearCache: 'Clear cache',
    dataSource: 'Data source',
    networkOnly: 'Network only',
    networkFirst: 'Network first',
    cacheFirst: 'Cache first',
    cacheOnly: 'Cache only',
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
  downloadMap: {
    downloadMap: 'Download map',
    format: 'Format',
    map: 'Map',
    downloadArea: 'Download',
    area: {
      visible: 'Visible area',
      byPolygon: 'Area covered by selected polygon',
    },
    name: 'Name',
    zoomRange: 'Zoom range',
    scale: 'Scale',
    email: 'Your email address',
    emailInfo: 'We will use your email to send you the download link.',
    download: 'Download',
    success:
      'The map is being prepared. Once ready, a download link will be sent to your email.',
    summaryTiles: 'Tiles',
    summaryPrice: (amount) => <>Total price: {amount} credits</>,
  },
};

export default messages;
