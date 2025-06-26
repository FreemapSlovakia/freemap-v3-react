import { Fragment } from 'react';
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

const en: Messages = {
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
    processorError: ({ err }) => addError(en, 'Application error', err),
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
    savingError: ({ err }) => addError(en, 'Save error', err),
    loadError: ({ err }) => addError(en, 'Loading error', err),
    deleteError: ({ err }) => addError(en, 'Deleting error', err),
    operationError: ({ err }) => addError(en, 'Operation error', err),
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
    tools: 'Tools',
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
      pick: 'Select on the map',
      current: 'Your position',
      home: 'Home position',
    },
    transportType: {
      car: 'Car',
      car4wd: 'Car (4WD)',
      // 'car-free': 'Car (toll free)',
      // bikesharing: 'Bike sharing',
      // imhd: 'Public transport in Bratislava',
      bike: 'Bicycle',
      // bicycle_touring: 'Bicycle touring',
      // 'foot-stroller': 'Stroller / Wheelchair',
      // nordic: 'Nordic skiing',
      // ski: 'Downhill skiing',
      foot: 'Walking',
      hiking: 'Hiking',
      mtb: 'Mountain bike',
      racingbike: 'Racing bike',
      motorcycle: 'Motorcycle',
    },
    // weighting: {
    //   fastest: 'Fastest',
    //   short_fastest: 'Fast, short',
    //   shortest: 'Shortest',
    // },
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
    fetchingError: ({ err }) => addError(en, 'Error finding the route', err),
    maneuverWithName: ({ type, modifier, name }) =>
      `${type} ${modifier} on ${name}`,
    maneuverWithoutName: ({ type, modifier }) => `${type} ${modifier}`,

    maneuver: {
      types: {
        turn: 'turn',
        'new name': 'go',
        depart: 'depart',
        arrive: 'arrive',
        merge: 'continue',
        // 'ramp':
        'on ramp': 'enter driveway',
        'off ramp': 'exit driveway',
        fork: 'choose way',
        'end of road': 'continue',
        // 'use lane':
        continue: 'continue',
        roundabout: 'enter a roundabout',
        rotary: 'enter a circle',
        'roundabout turn': 'at a roundabout, turn',
        // 'notification':
        'exit rotary': 'exit the circle', // undocumented
        'exit roundabout': 'exit the roundabout', // undocumented
        notification: 'notification',
        'use lane': 'use lane',
      },

      modifiers: {
        uturn: 'take a U-turn',
        'sharp right': 'sharply right',
        'slight right': 'slightly right',
        right: 'right',
        'sharp left': 'sharply left',
        'slight left': 'slightly left',
        left: 'left',
        straight: 'straight',
      },
    },
    imhd: {
      total: {
        short: ({ arrival, price, numbers }) => (
          <>
            Arrival: <b>{arrival}</b> | Price: <b>{price} €</b> | Lines:{' '}
            {numbers?.map((n, i) => (
              <Fragment key={n}>
                {i > 0 ? ', ' : ''}
                <b>{n}</b>
              </Fragment>
            ))}
          </>
        ),
        full: ({ arrival, price, numbers, total, home, foot, bus, wait }) => (
          <>
            Arrival: <b>{arrival}</b> | Price: <b>{price} €</b> | Lines:{' '}
            {numbers?.map((n, i) => (
              <Fragment key={n}>
                {i > 0 ? ', ' : ''}
                <b>{n}</b>
              </Fragment>
            ))}{' '}
            | Duration{' '}
            <b>
              {total} {numberize(total, ['minutes', 'minute'])}
            </b>
            <br />
            To leave: <b>{home}</b>, walking: <b>{foot}</b>, pub. trans.:{' '}
            <b>{bus}</b>, waiting:{' '}
            <b>
              {wait} {numberize(wait, ['minutes', 'minute'])}
            </b>
          </>
        ),
      },
      step: {
        foot: ({ departure, duration, destination }) => (
          <>
            at <b>{departure}</b> walk{' '}
            {duration !== undefined && (
              <b>
                {duration} {numberize(duration, ['minutes', 'minute'])}
              </b>
            )}{' '}
            {destination === 'TARGET' ? (
              <b>to destination</b>
            ) : (
              <>
                to <b>{destination}</b>
              </>
            )}
          </>
        ),
        bus: ({ departure, type, number, destination }) => (
          <>
            at <b>{departure}</b> {type} <b>{number}</b> to <b>{destination}</b>
          </>
        ),
      },
      type: {
        bus: 'take bus',
        tram: 'take tram',
        trolleybus: 'take trolleybus',
        foot: 'walk',
      },
    },
    bikesharing: {
      step: {
        foot: ({ duration, destination }) => (
          <>
            walk{' '}
            {duration !== undefined && (
              <b>
                {duration} {numberize(duration, ['minutes', 'minute'])}
              </b>
            )}{' '}
            {destination === 'TARGET' ? (
              <b>to destination</b>
            ) : (
              <>
                to <b>{destination}</b>
              </>
            )}
          </>
        ),
        bicycle: ({ duration, destination }) => (
          <>
            bicycle{' '}
            {duration !== undefined && (
              <b>
                {duration} {numberize(duration, ['minutes', 'minute'])}
              </b>
            )}{' '}
            to <b>{destination}</b>
          </>
        ),
      },
    },
    imhdAttribution: 'public transport routes',
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
    help: 'Help',
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
    recentTags: 'Recent tags to assign:',
    filter: 'Filter',
    showPhotosFrom: 'View photos',
    showLayer: 'Show the layer',
    upload: 'Upload',
    f: {
      firstUploaded: 'from first uploaded',
      lastUploaded: 'from last uploaded',
      firstCaptured: 'from oldest',
      lastCaptured: 'from newest',
      leastRated: 'from least rated',
      mostRated: 'from most rated',
      lastComment: 'from last comment',
    },
    colorizeBy: 'Colorize by',
    c: {
      disable: "don't colorize",
      mine: 'differ mine',
      author: 'author',
      rating: 'rating',
      takenAt: 'taken date',
      createdAt: 'upload date',
      season: 'season',
      premium: 'premium',
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
      showPreview: 'Show previews (uses more CPU load and memory)',
      premium: 'Make available only to users with premium access',
    },
    locationPicking: {
      title: 'Select photo location',
    },
    deletingError: ({ err }) => addError(en, 'Error deleting photo', err),
    tagsFetchingError: ({ err }) => addError(en, 'Error fetching tags', err),
    pictureFetchingError: ({ err }) =>
      addError(en, 'Error fetching photo', err),
    picturesFetchingError: ({ err }) =>
      addError(en, 'Error fetching photos', err),
    savingError: ({ err }) => addError(en, 'Error saving photo', err),
    commentAddingError: ({ err }) => addError(en, 'Error adding comment', err),
    ratingError: ({ err }) => addError(en, 'Error rating photo', err),
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
      addError(en, 'Error fetching point elevation', err),
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
    fetchingError: ({ err }) => addError(en, 'Error fetching track data', err),
    savingError: ({ err }) => addError(en, 'Error saving the track', err),
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
      color: 'Color:',
      label: 'Label:',
      width: 'Width:',
      hint: 'To remove label leave its field empty.',
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
      overlayPaneOpacity: 'Map line features opacity:',
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
    savingError: ({ err }) => addError(en, 'Error saving settings', err),
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
    fetchError: ({ err }) => addError(en, 'Error fetching changesets', err),
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
    fetchingError: ({ err }) => addError(en, 'Error fetching details', err),
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
      addError(en, 'Error fetching objects (POIs)', err),
    icon: {
      pin: 'Pin',
      ring: 'Ring',
      square: 'Square',
    },
    // categories: {
    //   1: 'Nature',
    //   2: 'Services',
    //   3: 'Transportation',
    //   4: 'Monuments',
    //   5: 'Health service',
    //   6: 'Shops',
    //   7: 'Energetics',
    //   8: 'Accommodation and food',
    //   9: 'Tourism',
    //   10: 'Administrative division',
    //   11: 'Others',
    //   12: 'Free time',
    //   13: 'Sport',
    //   14: 'Education',
    //   15: 'Cycling',
    // },
    // subcategories: {
    //   1: 'Cave',
    //   2: 'Peak',
    //   3: 'Gas station',
    //   4: 'Restaurant',
    //   5: 'Hotel',
    //   6: 'Parking',
    //   7: 'Airport',
    //   8: 'Train station',
    //   9: 'Bus station',
    //   10: 'Bus stop',
    //   11: 'Castle',
    //   12: 'Mansion',
    //   13: 'Ruin',
    //   14: 'Museum',
    //   15: 'Monument',
    //   16: 'Memorial',
    //   17: 'Pharmacy',
    //   18: 'Hospital',
    //   19: 'Surgery',
    //   20: 'Police',
    //   21: 'Clinic',
    //   22: 'Border crossing',
    //   23: 'Hospital with emergency',
    //   24: 'Supermarket',
    //   26: 'Nuclear power plant',
    //   27: 'Coal power plant',
    //   28: 'Hydroelectric power plant',
    //   29: 'Wind power plant',
    //   30: 'Grocery',
    //   31: 'Fire station',
    //   32: 'Church',
    //   33: 'Pub',
    //   34: 'Bank',
    //   35: 'ATM',
    //   36: 'Fast food',
    //   39: 'Bank',
    //   40: 'Viewpoint',
    //   41: 'Camping',
    //   42: 'Protected trees',
    //   43: 'Spring',
    //   44: 'Guidepost',
    //   45: 'Orientation map',
    //   46: 'Alpine hut',
    //   47: 'Shelter',
    //   48: 'Post office',
    //   49: 'Memorial, battlefield',
    //   50: 'Hunting stand',
    //   51: 'Communication tower',
    //   52: 'Observation tower',
    //   53: 'Motel',
    //   54: 'Guest house',
    //   55: 'Family pension',
    //   56: 'Regional city',
    //   57: 'District city',
    //   58: 'City',
    //   59: 'Town',
    //   60: 'Village',
    //   61: 'Hamlet',
    //   62: 'Town district',
    //   63: 'Gamekeepers house',
    //   64: 'Dentist',
    //   65: 'Bicycle shop',
    //   66: 'Bicycle rack',
    //   67: 'Bicycle rental',
    //   68: 'Liquor store',
    //   69: 'Art',
    //   70: 'Bakery',
    //   71: 'Beauty care',
    //   72: 'Beds',
    //   73: 'Drinks',
    //   74: 'Book store',
    //   75: 'Boutique',
    //   76: 'Butcher',
    //   77: 'Car sales',
    //   78: 'Car service',
    //   79: 'Charity',
    //   80: 'Drug store',
    //   81: 'Clothes',
    //   82: 'Computers',
    //   83: 'Confectionery',
    //   84: 'Copy shop',
    //   85: 'Courtains',
    //   86: 'Delicatessen',
    //   87: 'Department store',
    //   89: 'Dry cleaners',
    //   90: 'Domestics',
    //   91: 'Electronics',
    //   92: 'Erotics',
    //   93: 'Factory outlet',
    //   94: 'Farm products',
    //   95: 'Flower shop',
    //   96: 'Paintings',
    //   98: 'Funeral directors',
    //   99: 'Furniture',
    //   100: 'Garden centre',
    //   101: 'Convenience',
    //   102: 'Gift shop',
    //   103: 'Glaziery',
    //   104: 'Fruits and vegetables',
    //   105: 'Hairdressers',
    //   106: 'Hardware',
    //   107: 'Hearing aids',
    //   108: 'HI-FI',
    //   109: 'Ice cream',
    //   110: 'Interior decoration',
    //   111: 'Goldsmith',
    //   112: 'Kiosk',
    //   113: 'Houseware',
    //   114: 'Laundry',
    //   115: 'Shopping center',
    //   116: 'Massage',
    //   117: 'Mobile phones',
    //   118: 'Money lender',
    //   119: 'Motorcycle',
    //   120: 'Music store',
    //   121: 'Newspaper',
    //   122: 'Optics',
    //   124: 'Outdoor',
    //   125: 'Paint',
    //   126: 'Pawnbroker',
    //   127: 'Animals',
    //   128: 'Seafood',
    //   129: 'Second hand',
    //   130: 'Shoes',
    //   131: 'Sporting goods',
    //   132: 'Stationery',
    //   133: 'Tattoo',
    //   134: 'Toy store',
    //   135: 'Trade',
    //   136: 'Vacant',
    //   137: 'Vacuum cleaner',
    //   138: 'Variety store',
    //   139: 'Video/DVD',
    //   140: 'ZOO',
    //   141: 'Alpine hut',
    //   142: 'Attraction',
    //   143: 'Toilettes',
    //   144: 'Telephone',
    //   145: 'Civic authorities',
    //   146: 'Prison',
    //   147: 'Marketplace',
    //   148: 'Bar',
    //   149: 'Cafe',
    //   150: 'Public grill',
    //   151: 'Drinking water',
    //   152: 'Taxi',
    //   153: 'Library',
    //   154: 'Car wash',
    //   155: 'Vet',
    //   156: 'Traffic light',
    //   157: 'Railway station',
    //   158: 'Rail crossing',
    //   159: 'Tram station',
    //   160: 'Heliport',
    //   161: 'Water tower',
    //   162: 'Windmill',
    //   163: 'Sauna',
    //   164: 'LPG station',
    //   166: 'Park for dogs',
    //   167: 'Sports center',
    //   168: 'Golf courser',
    //   169: 'Stadium',
    //   170: 'Leisure',
    //   171: 'Water park',
    //   172: 'Boating',
    //   173: 'Fishing',
    //   174: 'Park',
    //   175: 'Playground',
    //   176: 'Garden',
    //   177: 'Public area',
    //   178: 'Ice rink',
    //   179: 'Mini-golf',
    //   180: 'Dance',
    //   181: 'Elementary school',
    //   182: '9pin',
    //   183: 'Bowling',
    //   184: 'American football',
    //   185: 'Archery',
    //   186: 'Athletics',
    //   187: 'Australian football',
    //   188: 'Baseball',
    //   189: 'Basketball',
    //   190: 'Beach volleyball',
    //   191: 'Bmx',
    //   192: 'Boules',
    //   193: 'Bowls',
    //   194: 'Canadian football',
    //   195: 'Kanoe',
    //   196: 'Chess',
    //   197: 'Climbing',
    //   198: 'Cricket',
    //   199: 'Cricket nets',
    //   200: 'Croquet',
    //   201: 'Cycling',
    //   202: 'Scuba diving',
    //   203: 'Dog racing',
    //   204: 'Horse riding',
    //   205: 'Soccer',
    //   206: 'Gaelic football',
    //   207: 'Golf',
    //   208: 'Gymnastics',
    //   209: 'Hockey',
    //   210: 'Horseshoes',
    //   211: 'Horserace',
    //   212: 'Ice stock',
    //   213: 'Korfball',
    //   214: 'Motorcycles',
    //   215: 'Multi',
    //   216: 'Orienteering',
    //   217: 'Paddle tennis',
    //   218: 'Paragliding',
    //   219: 'Pelota',
    //   220: 'Racquet',
    //   221: 'Rowing',
    //   222: 'Rugby league',
    //   223: 'Rugby union',
    //   224: 'Shooting',
    //   225: 'Ice skating',
    //   226: 'Skateboard',
    //   227: 'Skiing',
    //   228: 'Football',
    //   229: 'Swimming',
    //   230: 'Table tennis',
    //   231: 'Handball',
    //   232: 'Tennis',
    //   233: 'Water slide',
    //   234: 'Volleyball',
    //   235: 'Water skiing',
    //   236: 'University',
    //   237: 'Kindergarden',
    //   238: 'High school',
    //   239: 'Driving school',
    //   240: 'Chapel',
    //   241: 'Picnic site',
    //   242: 'Firepit',
    //   243: 'Locality',
    //   244: 'Waterfall',
    //   245: 'Lake',
    //   246: 'Dam',
    //   248: 'Natural reservation',
    //   249: 'Natural monument',
    //   250: 'Protected area',
    //   251: 'Protected landscape area',
    //   252: 'National park',
    //   253: 'Milk vending machine',
    //   254: 'Important wetland (RAMSAR)',
    //   255: 'Address points',
    //   256: 'Mineshaft',
    //   257: 'Adit',
    //   258: 'Well',
    //   259: 'Cross',
    //   260: 'Sanctuary',
    //   261: 'Fitness',
    //   262: 'Steam power plant',
    //   263: 'Manor house',
    //   264: 'Geomorphological classification',
    //   265: 'Military bunker',
    //   266: 'Highway exit',
    //   267: 'Statue',
    //   268: 'Chimney',
    //   269: 'Paragliding',
    //   270: 'Hang gliding',
    //   271: 'Feeding place',
    //   272: 'Fireplace',
    //   273: 'Bedminton/Squash',
    //   274: 'Guidepost',
    //   275: 'Bicycle charging station',
    // },
  },

  external: {
    openInExternal: 'Share / Open in external app.',
    osm: 'OpenStreetMap',
    oma: 'OMA',
    googleMaps: 'Google Maps',
    hiking_sk: 'Hiking.sk',
    zbgis: 'ZBGIS',
    mapy_cz: 'Mapy.cz',
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
    fetchingError: ({ err }) => addError(en, 'Searching error', err),
    buttonTitle: 'Search',
    placeholder: 'Search in the map',
  },

  embed: {
    code: 'Put the following code to your HTML page:',
    example: 'The result will look like this:',
    dimensions: 'Dimensions:',
    height: 'Height:',
    width: 'Width:',
    enableFeatures: 'Enable features:',
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
    exportError: ({ err }) => addError(en, 'Error exporting', err),
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
      logInError: ({ err }) => addError(en, 'Error logging in', err),
      logInError2: 'Error logging in.',
      verifyError: ({ err }) =>
        addError(en, 'Error verifying authentication', err),
    },
    logOut: {
      success: 'You have been successfully logged out.',
      error: ({ err }) => addError(en, 'Error logging out', err),
    },
  },

  mapLayers: {
    showAll: 'Show all maps',
    settings: 'Map settings',
    layers: 'Maps',
    switch: 'Maps',
    photoFilterWarning: 'Photo filtering is active',
    interactiveLayerWarning: 'Interactive layer is hidden',
    minZoomWarning: (minZoom) => `Accessible from zoom ${minZoom}`,
    letters: {
      A: 'Car (legacy)',
      T: 'Hiking (legacy)',
      C: 'Bicycle (legacy)',
      K: 'Crosscountry Ski (legacy)',
      S: 'Aerial',
      Z: 'Ortofoto ČR+SR (Aerial, CZ+SK)',
      J: 'Old Ortofotomozaika SR (Aerial, SK)',
      O: 'OpenStreetMap',
      M: 'mtbmap.cz',
      d: 'Public transport (ÖPNV)',
      X: outdoorMap,
      i: 'Interactive layer',
      I: 'Photos',
      l: 'Forest tracks NLC (SK)',
      t: 'Hiking trails',
      c: 'Bicycle trails',
      s0: 'Strava (all)',
      s1: 'Strava (rides)',
      s2: 'Strava (runs)',
      s3: 'Strava (water activities)',
      s4: 'Strava (winter activities)',
      w: 'Wikipedia',
      '4': 'Light terrain shading (SK)',
      '5': 'Terrain shading (SK)',
      '6': 'Surface shading (SK)',
      '7': 'Detailed surface shading (SK)',
      '8': 'Detailed surface hillshading (CZ)',
      VO: 'OpenStreetMap Vector',
      VS: 'Streets Vector',
      VD: 'Dataviz Vector',
      VT: 'Outdoor Vector',
      h: 'Parametric shading (SK)',
      z: 'Parametric shading (CZ)',
    },
    customBase: 'Custom map',
    customOverlay: 'Custom map overlay',
    type: {
      map: 'map',
      data: 'data',
      photos: 'pictures',
    },
    attr: {
      freemap: '©\xa0Freemap Slovakia',
      osmData: '©\xa0OpenStreetMap contributors',
      srtm: '©\xa0SRTM',
      outdoorShadingAttribution: 'DTM providers…',
      maptiler: (
        <MaptilerAttribution
          tilesFrom="Vector tiles from"
          hostedBy="hosted by"
        />
      ),
    },
  },

  elevationChart: {
    distance: 'Distance [km]',
    ele: `Elevation [${masl}]`,
    fetchError: ({ err }) =>
      addError(en, 'Error fetching elevation profile data', err),
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
    fetchingError: ({ err }) => addError(en, 'Error fetching OSM data', err),
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
    exportError: ({ err }) => addError(en, 'Error exporting map', err),
    exporting: 'Please wait, exporting map…',
    exported: ({ url }) => (
      <>
        Map export has finished.{' '}
        <AlertLink href={url} target="_blank">
          Open.
        </AlertLink>
      </>
    ),
    area: 'Export area:',
    areas: {
      visible: 'Visible area of the map',
      pinned: 'Area containing selected polygon (drawing)',
    },
    format: 'Format:',
    layersTitle: 'Optional layers:',
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
    mapScale: 'Map resolution:',
    alert: () => (
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
            <em>
              map ©{' '}
              <AlertLink
                href="https://www.freemap.sk/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Freemap Slovakia
              </AlertLink>
              , data{' '}
              <AlertLink
                href="https://osm.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
              >
                © OpenStreetMap contributors
              </AlertLink>
              {', SRTM, '}
              <AlertLink
                href="https://www.geoportal.sk/sk/udaje/lls-dmr/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LLS: ÚGKK SR
              </AlertLink>
            </em>
          </li>
        </ul>{' '}
      </>
    ),
  },

  maps: {
    legacyMapWarning:
      'Displayed map is a legacy one. Switch to modern outdoor map?',
    noMapFound: 'No map found',
    save: 'Save',
    delete: 'Delete',
    disconnect: 'Disconnect',
    deleteConfirm: (name) => `Are you sure to delete map ${name}?`,
    fetchError: ({ err }) => addError(en, 'Error loading map', err),
    fetchListError: ({ err }) => addError(en, 'Error loading maps', err),
    deleteError: ({ err }) => addError(en, 'Error deleting map', err),
    renameError: ({ err }) => addError(en, 'Error renaming map', err),
    createError: ({ err }) => addError(en, 'Error saving map', err),
    saveError: ({ err }) => addError(en, 'Error saving map', err),
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
    youHaveCredits(amount) {
      return <>You have {amount} credits.</>;
    },
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

function numberize(n: number, words: [string, string]) {
  return n < 1 ? words[0] : n < 2 ? words[1] : words[0];
}

export default en;
