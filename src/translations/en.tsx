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
import { AlertLink } from 'react-bootstrap';
import { CookiesConsentText } from '@/features/auth/components/CookiesConsentText.js';
import shared from './en-shared.js';
import { addError, Messages } from './messagesInterface.js';

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
    noCookies: () => (
      <>
        This functionality requires accepting the{' '}
        <CookiesConsentText>cookies consent</CookiesConsentText>.
      </>
    ),
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
    confirmation: 'Confirmation',
    export: 'Export',
    success: 'Success!',
    expiration: 'Expiration',
    privacyPolicy: 'Privacy policy',
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
    trackViewer: 'File import',
    changesets: 'Map changes',
    mapDetails: 'Map details',
    tracking: 'Live tracking',
    myMaps: 'My maps',
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
        prompt="Some features may require cookies."
        local="Cookies of local settings and login via social networks"
        analytics="Analytics cookies"
      />
    ),
    infoBars: {
      ua: () => (
        <>
          <Emoji>🇺🇦</Emoji> We stand with Ukraine.{' '}
          <AlertLink href="https://u24.gov.ua/" target="_blank" rel="noopener">
            Support Ukraine ›
          </AlertLink>{' '}
          <Emoji>🇺🇦</Emoji>
        </>
      ),
    },
  },

  ad: {
    self: (email) => (
      <>
        Interested in placing your own ad here? Don’t hesitate to contact us at{' '}
        {email}.
      </>
    ),
    rovas: () => (
      <RovasAd rovasDesc="economic program for volunteers">
        <b>Freemap is created by volunteers.</b>{' '}
        <span className="text-danger">Reward them for their work</span>, with
        your own volunteer work or with money.
      </RovasAd>
    ),
  },

  gallery: {
    stats: {
      leaderboard: 'Leaderboard',
      country: 'Country',
      perUserPerCountry: 'Photos per Author per Country',
      perUser: 'Photos per Author',
      more: 'More',
      less: 'Less',
      user: 'Author',
      photos: 'Photos',
      numberOfPhotos: 'Number of Photos',
      timePeriod: 'Time Period',
      allTime: 'All Time',
      last3months: 'Last 3 Months',
      last30days: 'Last 30 Days',
    },
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
      deletePrompt: (title) =>
        title ? (
          <>
            Do you really want to delete picture <i>{title}</i>?
          </>
        ) : (
          <>Do you really want to delete this picture?</>
        ),
      deleteTitle: 'Picture deletion',
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
      title: 'Access change',
      premium: 'Include all my photos in premium content',
      free: 'Make all my photos accessible to everyone',
      confirmPremium:
        'Include all your photos in premium content? Only users with premium access will be able to see them.',
      confirmFree: 'Make all your photos accessible to everyone?',
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
    areaInfo: (props) => (
      <AreaInfo {...props} areaLabel="Area" perimeterLabel="Perimeter" />
    ),
    distanceInfo: (props) => <DistanceInfo {...props} lengthLabel="Length" />,
  },

  trackViewer: {
    upload: 'Upload',
    moreInfo: 'More info',
    share: 'Save on server',
    colorizingMode: {
      none: 'Inactive',
      elevation: 'Elevation',
      steepness: 'Steepness',
      speed: 'Speed',
      heartRate: 'Heart rate',
      cadence: 'Cadence',
      power: 'Power',
      temperature: 'Temperature',
      time: 'Time',
      heading: 'Heading',
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
      title: 'Import file',
      drop: 'Drop a GPX or GeoJSON file here, or click here to select it.',
    },
    shareToast:
      'The track has been saved to the server and can be shared by copying page URL.',
    fetchingError: ({ err }) =>
      addError(messages, 'Error fetching track data', err),
    savingError: ({ err }) => addError(messages, 'Error saving the track', err),
    loadingError: 'Error loading file.',
    onlyOne: 'Only a single file is expected.',
    invalidFormat: 'The file is not in a supported format or is invalid.',
    info: () => <TrackViewerDetails />,
    tooBigError: 'The file is too big.',
  },

  drawing: {
    modify: 'Properties',
    edit: {
      title: 'Properties',
      color: 'Color',
      fillColor: 'Fill color',
      label: 'Label',
      width: 'Width',
      hint: 'To remove label leave this field empty.',
      shape: 'Shape',
      icon: 'Icon',
      iconChoose: 'Choose icon…',
      iconNone: 'No icon',
      iconSearch: 'Search icons',
      text: 'Text',
      textHint: 'Icon or up to 2 characters shown inside the marker.',
      type: 'Geometry type',
      dashArray: 'Dash style',
      lineCap: 'Line cap',
      lineCapRound: 'Round',
      lineCapButt: 'Butt',
      lineCapSquare: 'Square',
      lineJoin: 'Line join',
      lineJoinRound: 'Round',
      lineJoinMiter: 'Miter',
      lineJoinBevel: 'Bevel',
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
    reverse: 'Reverse direction',
    simplify: 'Simplify',
  },

  purchases: {
    purchases: 'Purchases',
    premiumExpired: (at) => <>Your premium access expired at {at}</>,
    date: 'Date',
    item: 'Item',
    notPremiumYet: 'You are not premium yet.',
    awaitingBankPayment:
      'We are awaiting confirmation of the bank transfer. Premium will activate once the payment is received.',
    bankPaymentFailed:
      'Some bank transfers were rejected or expired. If you believe this is a mistake, please contact support.',
    bankIntentStatus: {
      pending_settlement:
        'Bank transfer was placed and is awaiting settlement.',
      manual_review:
        'Bank transfer requires manual review (for example amount mismatch).',
      paid: 'Bank transfer has been confirmed as paid.',
      expired: 'Bank transfer expired before confirmation.',
      failed: 'Bank transfer failed.',
      rejected: 'Bank transfer was rejected.',
      created: 'Bank transfer intent was created and is not yet settled.',
      unknown: 'Bank transfer status reported by provider: {}.',
    },
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
      description: 'About me',
      sendGalleryEmails: 'Notify photos comments via email',
      delete: 'Delete account',
      deleteWarning:
        'Are you sure to delete your account? It will remove all your photos, photo comments and ratings, your maps, and tracked devices.',
      personalInfo: 'Personal information',
      authProviders: 'Login providers',
      picture: 'Profile picture',
      choosePicture: 'Choose picture',
      pictureTooLarge: 'Picture is too large. Maximum size is 5 MB.',
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
    refresh: 'Download changesets for current map view',
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
        <>
          More details on {osmLink} or {achaviLink}.
        </>
      ),
    },
  },

  mapDetails: {
    sources: 'Sources',
    source: 'Source',
    notFound: 'Nothing found here.',
    fetchingError: ({ err }) =>
      addError(messages, 'Error fetching details', err),
    detail: ({ result }) => (
      <ObjectDetails
        result={result}
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
    convertAsPoint: 'As point',
    convertWithGeometry: 'With full geometry',
    showAsLookup: 'Show as Lookup',
    convertAll: 'Convert all visible objects to drawing',
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
    url: 'Share location',
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
    result: 'Lookup',
    sources: {
      bbox: 'Bounding Box',
      geojson: 'GeoJSON',
      tile: 'Tile',
      coords: 'Coordinates',
      'overpass-nearby': 'Nearby ',
      'overpass-surrounding': 'Containing features',
      'nominatim-forward': 'Forward geocoding',
      'nominatim-reverse': 'Reverse geocoding',
      osm: 'OpenStreetMap',
      'wms:': 'WMS',
    },
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
      import: 'imported file',
      search: 'lookup',
    },
    disabledAlert:
      'Only items that have something on the map to export are enabled.',
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
    filterMaps: 'Filter maps',
    noMapsFound: 'No maps found',
    settings: 'Map settings',
    layers: 'Maps',
    switch: 'Maps',
    photoFilterWarning: 'Photo filtering is active',
    interactiveLayerWarning: 'Map items layer is hidden',
    minZoomWarning: (minZoom) => `Accessible from zoom ${minZoom}`,
    countryWarning: (countries) =>
      `Covers only following countries: ${countries.join(', ')}`,
    letters: {
      S: 'Aerial',
      Z: 'Aerial',
      J1: 'Aerial (2017-2019)',
      J2: 'Aerial (2020-2022)',
      O: 'OpenStreetMap',
      d: 'Public transport (ÖPNV)',
      X: outdoorMap,
      i: 'Data layer',
      I: 'Photos',
      l1: 'Forest tracks NLC (2017)',
      l2: 'Forest tracks NLC',
      s0: 'Strava (all)',
      s1: 'Strava (rides)',
      s2: 'Strava (runs)',
      s3: 'Strava (water activities)',
      s4: 'Strava (winter activities)',
      w: 'Wikipedia',
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
    configureLayers: 'Configure map layers',
    customMaps: 'Custom maps',
    addCustomMap: 'Add custom map',
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
    layer: {
      layer: 'Layer',
      base: 'Base',
      overlay: 'Overlay',
    },
    zIndex: 'Z-Index',
    preferences: 'Preferences',
    maxZoom: 'Max zoom',
    forcedScale: 'Forced scale',
    resolutionScale: 'Resolution scale',
    resolutionScaleAuto: 'Auto (device default)',
    resolutionScaleHelp:
      "Simulates display pixel density. Affects which tile variant is fetched. If a layer doesn't offer the requested variant, the highest available one is used instead.",
    featureScale: 'Feature size',
    featureScaleHelp:
      'Enlarges rendered labels and lines. Has no effect on satellite, shading, WMS, or vector (MapLibre) layers.',
    stravaHeatmapColor: 'Strava heatmap color',
    stravaHeatmapColors: {
      hot: 'Hot',
      blue: 'Blue',
      purple: 'Purple',
      gray: 'Gray',
      bluered: 'Blue–red',
    },
    loadWmsLayers: 'Load layers',
    offlineMaps: 'Offline maps',
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

  premium: {
    title: 'Get premium access',
    commonHeader: (
      <>
        <p>
          <strong>Support the volunteers who create this map!</strong>
        </p>
        <p className="mb-1">
          For <b>8 hours</b> of your{' '}
          <a
            href="https://rovas.app/freemap-web"
            target="_blank"
            rel="noopener noreferrer"
          >
            volunteer work
          </a>{' '}
          or <b>8 €</b> you will have a year of access with:
        </p>
        <ul>
          <li>removed ad banner</li>
          <li
            className="text-decoration-underline"
            title="Strava Heatmap, hi-res detailed shading of Slovakia and Czechia, highest zoom levels of Outdoor Map, highest zoom levels of ortophoto maps of Slovakia and Czechia, various WMS-based maps"
          >
            premium map layers
          </li>
          <li>premium photos</li>
          <li>multimodal routing</li>
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
    premiumUser: 'User with premium access',
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
    youHaveCredits: (amount, explainCredits) => (
      <>
        You have {amount}{' '}
        {explainCredits ? (
          <CreditsText
            credits="credits"
            help="You can use credits to [offline maps export]."
          />
        ) : (
          'credits'
        )}
        .
      </>
    ),
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
