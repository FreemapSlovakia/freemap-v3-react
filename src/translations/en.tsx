/* eslint-disable */

import { ChangesetDetails } from 'fm3/components/ChangesetDetails';
import { RoadDetails } from 'fm3/components/RoadDetails';
import { TrackViewerDetails } from 'fm3/components/TrackViewerDetails';
import { latLonToString } from 'fm3/geoutils';
import { Fragment } from 'react';
import Alert from 'react-bootstrap/Alert';
import { FaFlask, FaKey } from 'react-icons/fa';
import { Messages } from './messagesInterface';

const nf01 = Intl.NumberFormat('en', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const nf33 = Intl.NumberFormat('en', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
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
    processorError: ({ err }) => `Application error: ${err}`,
    seconds: 'seconds',
    minutes: 'minutes',
    meters: 'meters',
    createdAt: 'Created At',
    actions: 'Actions',
    add: 'Add new',
    clear: 'Clear',
    convertToDrawing: 'Convert to drawing',
    simplifyPrompt:
      'Please enter simplification factor. Set to zero for no simplification.',
    copyUrl: 'Copy URL',
    savingError: ({ err }) => `Save error: ${err}`,
    loadError: ({ err }) => `Loading error: ${err}`,
    deleteError: ({ err }) => `Deleting error: ${err}`,
    deleted: 'Deleted.',
    saved: 'Saved.',
    visual: 'Display',
  },

  selections: {
    objects: 'Object (POI)',
    drawPoints: 'Point',
    drawLines: 'Line',
    drawPolygons: 'Polygon',
    tracking: 'Tracking',
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
    maps: (
      <>
        My maps <FaFlask className="text-warning" />
      </>
    ),
  },

  routePlanner: {
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
      'car-free': 'Car (toll free)',
      bikesharing: 'Bike sharing',
      imhd: 'Public transport in Bratislava',
      'bike-osm': 'Bicycle',
      bike: 'Bicycle touring',
      'foot-stroller': 'Stroller / Wheelchair',
      nordic: 'Nordic skiing',
      ski: 'Downhill skiing',
      'foot-osm': 'Foot',
      foot: 'Hiking',
    },
    development: 'in development',
    mode: {
      route: 'Ordered',
      trip: 'Visiting places',
      roundtrip: 'Visiting places (roundtrip)',
    },
    alternative: 'Alternative',
    // eslint-disable-next-line
    distance: ({ value, diff }) => (
      <>
        Distance:{' '}
        <b>
          {value} km{diff ? ` (+ ${diff} km)` : ''}
        </b>
      </>
    ),
    // eslint-disable-next-line
    duration: ({ h, m, diff }) => (
      <>
        Duration:{' '}
        <b>
          {h} h {m} m{diff && ` (+ ${diff.h} h ${diff.m} m)`}
        </b>
      </>
    ),
    // eslint-disable-next-line
    summary: ({ distance, h, m }) => (
      <>
        Distance: <b>{distance} km</b> | Duration:{' '}
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
    fetchingError: ({ err }) => `Error finding the route: ${err}`,
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
        // eslint-disable-next-line
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
        // eslint-disable-next-line
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
        // eslint-disable-next-line
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
        // eslint-disable-next-line
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
        // eslint-disable-next-line
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
        // eslint-disable-next-line
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

  more: {
    more: 'More',
    logOut: (name) => `Log out ${name}`,
    logIn: 'Log in',
    settings: 'Settings',
    gpxExport: 'Export to GPX',
    mapExports: 'Map for GPS devices',
    embedMap: 'Embed map',
    supportUs: 'Support Freemap',
    help: 'Help',
    back: 'Back',
    mapLegend: 'Map legend',
    contacts: 'Contacts',
    tips: 'Tips',
    facebook: 'Freemap on Facebook',
    twitter: 'Freemap on Twitter',
    youtube: 'Freemap on YouTube',
    github: 'Freemap on GitHub',
    automaticLanguage: 'Automatic',
    pdfExport: 'Export map',
  },

  main: {
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
  },

  gallery: {
    filter: 'Filter',
    showPhotosFrom: 'View photos',
    showLayer: 'Zobrazit vrstvu',
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
          <li>By uploading the photos, you agree they will be distributed under the terms of CC-BY-SA 2.0 license.</li>
          <li>The operator (Freemap.sk) hereby disclaims all liability and is not liable for direct or indirect damages resulting from publication of a photo in the gallery. The person who has uploaded the picture on the server is fully responsible for the photo.</li>
          <li>The operator reserves the right to edit the description, name, position and tags of photo, or to delete the photo if the content is inappropriate (violate these rules).</li>
          <li>The operator reserves the right to delete the account in case that the user repeatedly violates the gallery policy by publishing inappropriate content.</li>
        </ul>
      `,
      success: 'Pictures have been successfully uploaded.',
      showPreview: 'Show previews (uses more CPU load and memory)',
    },
    locationPicking: {
      title: 'Select photo location',
    },
    deletingError: ({ err }) => `Error deleting photo: ${err}`,
    tagsFetchingError: ({ err }) => `Error fetching tags: ${err}`,
    pictureFetchingError: ({ err }) => `Error fetching photo: ${err}`,
    picturesFetchingError: ({ err }) => `Error fetching photos: ${err}`,
    savingError: ({ err }) => `Error saving photo: ${err}`,
    commentAddingError: ({ err }) => `Error adding comment: ${err}`,
    ratingError: ({ err }) => `Error rating photo: ${err}`,
    unauthenticatedError: 'Please log-in to upload the photos to the gallery.',
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
    },
  },

  measurement: {
    distance: 'Line',
    elevation: 'Point',
    area: 'Polygon',
    elevationFetchError: ({ err }) => `Error fetching point elevation: ${err}`,
    elevationInfo: ({ elevation, point }) => (
      <>
        {(['D', 'DM', 'DMS'] as const).map((format) => (
          <div key={format}>{latLonToString(point, 'en', format)}</div>
        ))}
        {elevation != null && (
          <div>
            Elevation: {nf01.format(elevation)}&nbsp;{masl}
          </div>
        )}
      </>
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
    shareToast: 'The track has been saved to the server and can be shared.',
    fetchingError: ({ err }) => `Error fetching track data: ${err}`,
    savingError: ({ err }) => `Error saving the track: ${err}`,
    loadingError: 'Error loading file.',
    onlyOne: 'Only single GPX file expected.',
    wrongFormat: 'The file must have .gpx extension.',
    info: () => <TrackViewerDetails />,
    tooBigError: 'The file is too big.',
  },

  drawing: {
    modify: 'Change label',
    edit: {
      title: 'Change label',
      label: 'Label:',
      hint: 'To remove label leave its field empty.',
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
      noAuthInfo: 'Only for logged-in users.',
    },
    general: {
      tips:
        'Show tips on page opening (only if Slovak or Czech language is selected)',
    },
    expertInfo: `
      <div style="text-align: left">
        Expert mode offers features for advanced users, for example:
        <ul>
          <li>extended settings</li>
          <li>extra map layers</li>
          <li>extra route finder profiles</li>
        </ul>
      </div>
    `,
    expert: {
      switch: 'Expert mode',
      overlayOpacity: 'Layer opacity:',
      trackViewerEleSmoothing: {
        label: (value) =>
          `Smoothing level for computing total climb/descend in Track viewer: ${value}`,
        info:
          'For value 1 all elevations are used separately. Higher values represent floating window width used to smooth elevations.',
      },
    },
    saveSuccess: 'Settings have been saved.',
    savingError: ({ err }) => `Error saving settings: ${err}`,
  },

  changesets: {
    allAuthors: 'All authors',
    download: 'Download changes',
    olderThan: ({ days }) => `${days} days`,
    olderThanFull: ({ days }) => `Changesets from last ${days} days`,
    notFound: 'No changesets found.',
    fetchError: ({ err }) => `Error fetching changesets: ${err}`,
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
    road: 'Road info',
    notFound: 'No road found.',
    fetchingError: ({ err }) => `Error fetching road details: ${err}`,
    detail: ({ element }) => <RoadDetails way={element} />,
  },

  objects: {
    type: 'Type',
    lowZoomAlert: {
      message:
        'To see objects by their type, you need to zoom in to at least level 12.',
      zoom: 'Zoom-in',
    },
    fetchingError: ({ err }) => `Error fetching objects (POIs): ${err}`,
    categories: {
      1: 'Nature',
      2: 'Services',
      3: 'Transportation',
      4: 'Monuments',
      5: 'Health service',
      6: 'Shops',
      7: 'Energetics',
      8: 'Accommodation and food',
      9: 'Tourism',
      10: 'Administrative division',
      11: 'Others',
      12: 'Free time',
      13: 'Sport',
      14: 'Education',
      15: 'Cycling',
    },
    subcategories: {
      1: 'Cave',
      2: 'Peak',
      3: 'Gas station',
      4: 'Restaurant',
      5: 'Hotel',
      6: 'Parking',
      7: 'Airport',
      8: 'Train station',
      9: 'Bus station',
      10: 'Bus stop',
      11: 'Castle',
      12: 'Mansion',
      13: 'Ruin',
      14: 'Museum',
      15: 'Monument',
      16: 'Memorial',
      17: 'Pharmacy',
      18: 'Hospital',
      19: 'Surgery',
      20: 'Police',
      21: 'Clinic',
      22: 'Border crossing',
      23: 'Hospital with emergency',
      24: 'Supermarket',
      26: 'Nuclear power plant',
      27: 'Coal power plant',
      28: 'Hydroelectric power plant',
      29: 'Wind power plant',
      30: 'Grocery',
      31: 'Fire station',
      32: 'Church',
      33: 'Pub',
      34: 'Bank',
      35: 'ATM',
      36: 'Fast food',
      39: 'Bank',
      40: 'Viewpoint',
      41: 'Camping',
      42: 'Protected trees',
      43: 'Spring',
      44: 'Guidepost',
      45: 'Orientation map',
      46: 'Alpine hut',
      47: 'Shelter',
      48: 'Post office',
      49: 'Memorial, battlefield',
      50: 'Hunting stand',
      51: 'Communication tower',
      52: 'Observation tower',
      53: 'Motel',
      54: 'Guest house',
      55: 'Family pension',
      56: 'Regional city',
      57: 'District city',
      58: 'City',
      59: 'Town',
      60: 'Village',
      61: 'Hamlet',
      62: 'Town district',
      63: 'Gamekeepers house',
      64: 'Dentist',
      65: 'Bicycle shop',
      66: 'Bicycle rack',
      67: 'Bicycle rental',
      68: 'Liquor store',
      69: 'Art',
      70: 'Bakery',
      71: 'Beauty care',
      72: 'Beds',
      73: 'Drinks',
      74: 'Book store',
      75: 'Boutique',
      76: 'Butcher',
      77: 'Car sales',
      78: 'Car service',
      79: 'Charity',
      80: 'Drug store',
      81: 'Clothes',
      82: 'Computers',
      83: 'Confectionery',
      84: 'Copy shop',
      85: 'Courtains',
      86: 'Delicatessen',
      87: 'Department store',
      89: 'Dry cleaners',
      90: 'Domestics',
      91: 'Electronics',
      92: 'Erotics',
      93: 'Factory outlet',
      94: 'Farm products',
      95: 'Flower shop',
      96: 'Paintings',
      98: 'Funeral directors',
      99: 'Furniture',
      100: 'Garden centre',
      101: 'Convenience',
      102: 'Gift shop',
      103: 'Glaziery',
      104: 'Fruits and vegetables',
      105: 'Hairdressers',
      106: 'Hardware',
      107: 'Hearing aids',
      108: 'HI-FI',
      109: 'Ice cream',
      110: 'Interior decoration',
      111: 'Goldsmith',
      112: 'Kiosk',
      113: 'Houseware',
      114: 'Laundry',
      115: 'Shopping center',
      116: 'Massage',
      117: 'Mobile phones',
      118: 'Money lender',
      119: 'Motorcycle',
      120: 'Music store',
      121: 'Newspaper',
      122: 'Optics',
      124: 'Outdoor',
      125: 'Paint',
      126: 'Pawnbroker',
      127: 'Animals',
      128: 'Seafood',
      129: 'Second hand',
      130: 'Shoes',
      131: 'Sporting goods',
      132: 'Stationery',
      133: 'Tattoo',
      134: 'Toy store',
      135: 'Trade',
      136: 'Vacant',
      137: 'Vacuum cleaner',
      138: 'Variety store',
      139: 'Video/DVD',
      140: 'ZOO',
      141: 'Alpine hut',
      142: 'Attraction',
      143: 'Toilettes',
      144: 'Telephone',
      145: 'Civic authorities',
      146: 'Prison',
      147: 'Marketplace',
      148: 'Bar',
      149: 'Cafe',
      150: 'Public grill',
      151: 'Drinking water',
      152: 'Taxi',
      153: 'Library',
      154: 'Car wash',
      155: 'Vet',
      156: 'Traffic light',
      157: 'Railway station',
      158: 'Rail crossing',
      159: 'Tram station',
      160: 'Heliport',
      161: 'Water tower',
      162: 'Windmill',
      163: 'Sauna',
      164: 'LPG station',
      166: 'Park for dogs',
      167: 'Sports center',
      168: 'Golf courser',
      169: 'Stadium',
      170: 'Leisure',
      171: 'Water park',
      172: 'Boating',
      173: 'Fishing',
      174: 'Park',
      175: 'Playground',
      176: 'Garden',
      177: 'Public area',
      178: 'Ice rink',
      179: 'Mini-golf',
      180: 'Dance',
      181: 'Elementary school',
      182: '9pin',
      183: 'Bowling',
      184: 'American football',
      185: 'Archery',
      186: 'Athletics',
      187: 'Australian football',
      188: 'Baseball',
      189: 'Basketball',
      190: 'Beach volleyball',
      191: 'Bmx',
      192: 'Boules',
      193: 'Bowls',
      194: 'Canadian football',
      195: 'Kanoe',
      196: 'Chess',
      197: 'Climbing',
      198: 'Cricket',
      199: 'Cricket nets',
      200: 'Croquet',
      201: 'Cycling',
      202: 'Scuba diving',
      203: 'Dog racing',
      204: 'Horse riding',
      205: 'Soccer',
      206: 'Gaelic football',
      207: 'Golf',
      208: 'Gymnastics',
      209: 'Hockey',
      210: 'Horseshoes',
      211: 'Horserace',
      212: 'Ice stock',
      213: 'Korfball',
      214: 'Motorcycles',
      215: 'Multi',
      216: 'Orienteering',
      217: 'Paddle tennis',
      218: 'Paragliding',
      219: 'Pelota',
      220: 'Racquet',
      221: 'Rowing',
      222: 'Rugby league',
      223: 'Rugby union',
      224: 'Shooting',
      225: 'Ice skating',
      226: 'Skateboard',
      227: 'Skiing',
      228: 'Football',
      229: 'Swimming',
      230: 'Table tennis',
      231: 'Handball',
      232: 'Tennis',
      233: 'Water slide',
      234: 'Volleyball',
      235: 'Water skiing',
      236: 'University',
      237: 'Kindergarden',
      238: 'High school',
      239: 'Driving school',
      240: 'Chapel',
      241: 'Picnic site',
      242: 'Firepit',
      243: 'Locality',
      244: 'Waterfall',
      245: 'Lake',
      246: 'Dam',
      248: 'Natural reservation',
      249: 'Natural monument',
      250: 'Protected area',
      251: 'Protected landscape area',
      252: 'National park',
      253: 'Milk vending machine',
      254: 'Important wetland (RAMSAR)',
      255: 'Address points',
      256: 'Mineshaft',
      257: 'Adit',
      258: 'Well',
      259: 'Cross',
      260: 'Sanctuary',
      261: 'Fitness',
      262: 'Steam power plant',
      263: 'Manor house',
      264: 'Geomorphological classification',
      265: 'Military bunker',
      266: 'Highway exit',
      267: 'Statue',
      268: 'Chimney',
      269: 'Paragliding',
      270: 'Hang gliding',
      271: 'Feeding place',
      272: 'Fireplace',
      273: 'Bedminton/Squash',
      274: 'Guidepost',
      275: 'Bicycle charging station',
    },
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
    fetchingError: ({ err }) => `Searching error: ${err}`,
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

  tips: {
    previous: 'Previous tip',
    next: 'Next tip',
    prevent: "Don't show next time",
    errorLoading: 'Error loading tip.',
  },

  supportUs: {
    explanation:
      'Map portal Freemap is created by volunteers for free in their spare time. For the operation it still needs a hardware and services of commercial companies which costs us money.',
    account: 'Bank account:',
    paypal: 'Donate with PayPal',
    thanks: "We'll appreciate every donation. Thank you!",
    registration: 'Registered in MV/VVS/1-900/90-34343 at 2nd of October 2009',
  },

  gpxExport: {
    export: 'Download',
    exportToDrive: 'Save to Google Drive',
    exportToDropbox: 'Save to Dropbox',
    exportError: ({ err }) => `Error exporting GPX: ${err}`,
    what: {
      plannedRoute: 'found route',
      plannedRouteWithStops: 'found route including stops',
      objects: 'objects (POIs)',
      pictures: 'photos (in the visible map area)',
      drawingLines: 'drawing - lines',
      areaMeasurement: 'drawing - polygons',
      drawingPoints: 'drawing - points',
      tracking: 'live tracking',
      gpx: 'GPX track',
    },
    disabledAlert:
      'Only checkboxes having anything in the map to export are enabled.',
    blockedPopup: 'Browser blocked pop-up window.',
    exportedToDropbox: 'GPX file has been saved to Dropboxu.',
    exportedToGdrive: 'GPX file has been saved to Google Drive.',
  },

  logIn: {
    with: {
      facebook: 'Log in with Facebook',
      google: 'Log in with Google',
      osm: 'Log in with OpenStreetMap',
    },
    enablePopup: 'Please enable pop-up windows for this site in you browser.',
    success: 'You have been successfully logged in.',
    logInError: ({ err }) => `Error logging in: ${err}`,
    logInError2: 'Error logging in.',
    logOutError: ({ err }) => `Error logging out: ${err}`,
    verifyError: ({ err }) => `Error verifying authentication: ${err}`,
  },

  logOut: {
    success: 'You have been successfully logged out.',
  },

  mapLayers: {
    layers: 'Map layers',
    photoFilterWarning: 'Photo filtering is active',
    minZoomWarning: (minZoom) => `Accessible from zoom ${minZoom}`,
    letters: {
      A: 'Car',
      T: 'Hiking',
      C: 'Bicycle',
      K: 'Crosscountry Ski',
      S: 'Aerial',
      Z: 'Ortofotomozaika SR (Aerial, SK)',
      O: 'OpenStreetMap',
      M: 'mtbmap.cz',
      p: 'OpenTopoMap',
      d: 'Public transport (ÖPNV)',
      h: 'Historic',
      X: 'Hiking + Bicycle + Ski',
      i: 'Interactive layer',
      I: 'Photos',
      l: 'Forest tracks NLC (SK)',
      n1: 'Names (car)',
      n2: 'Names (hiking)',
      n3: 'Names (bicycle)',
      g: 'OSM GPS traces',
      t: 'Hiking trails',
      c: 'Bicycle trails',
      q: 'OpenSnowMap',
      r: 'Rendering clients',
      s0: 'Strava (all)',
      s1: 'Strava (rides)',
      s2: 'Strava (runs)',
      s3: 'Strava (water activities)',
      s4: 'Strava (winter activities)',
      w: 'Wikipedia',
    },
    type: {
      map: 'map',
      data: 'data',
      photos: 'pictures',
    },
    attr: {
      freemap: '©\xa0Freemap Slovakia',
      osmData: '©\xa0OpenStreetMap contributors',
      srtm: '©\xa0SRTM',
      hot: '©\xa0Humanitarian OpenStreetMap Team',
    },
  },

  elevationChart: {
    distance: 'Distance [km]',
    ele: `Elevation [${masl}]`,
    fetchError: ({ err }) => `Error fetching elevation profile data: ${err}`,
  },

  errorCatcher: {
    html: (ticketId) => `${getErrorMarkup(ticketId)}
      <p>
        You can try:
      </p>
      <ul>
        <li><a href="">reload last page</a></li>
        <li><a href="/">load initial page</a></li>
        <li><a href="/?reset-local-storage">clear local data and load initial page</a></li>
      </ul>
    `,
  },

  osm: {
    fetchingError: ({ err }) => `Error fetching OSM data: ${err}`,
  },

  roadDetails: {
    roadType: 'Road type:',
    surface: 'Surface:',
    suitableBikeType: 'Recommended bicycle:',
    lastChange: 'Last change:',
    showDetails: 'Show details in osm.org',
    surfaces: {
      asphalt: 'asphalt',
      gravel: 'gravel',
      fine_gravel: 'fine gravel',
      dirt: 'dirt',
      ground: 'ground',
      cobblestone: 'cobblestone',
      compacted: 'compacted',
      paved: 'paved',
      unknown: 'unknown',
      unpaved: 'unpaved',
      'concrete:plates': 'concrete plates',
      concrete: 'concrete',
      grass: 'grass',
    },
    trackClasses: {
      motorway: 'motorway',
      trunk: 'trunk',
      primary: 'primary',
      secondary: 'secondary',
      tertiary: 'tertiary',
      service: 'service',
      unclassified: 'unclassified',
      residential: 'residential',
      grade1: 'paved or heavily compacted hardcore surface, 1st grade',
      grade2:
        'unpaved track with surface of gravel mixed with a varying amount of sand, silt, and clay, 2nd grade',
      grade3: 'almost always an unpaved track, 3rd grade',
      grade4:
        'almost always an unpaved track prominently with soil/sand/grass, 4th grade',
      grade5:
        'almost always an unpaved track lacking hard materials, 5th grade',
      path: 'path',
      footway: 'footway',
      pedestrian: 'pedestrian',
      unknown: 'unknown',
      living_street: 'Living street',
      construction: 'In construction',
    },
    bicycleTypes: {
      'road-bike': 'road bike',
      'trekking-bike': 'trekking bike',
      'mtb-bike': 'mountain bike',
      'no-bike': 'bicycle forbidden',
      unknown: 'unknown',
    },
  },

  tracking: {
    unauthenticatedError: 'Please log-in to manage your devices.',
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
        <p>
          Define watch tokens to share position of your device{' '}
          <i>{deviceName}</i> with your friends.
        </p>
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
  pdfExport: {
    export: 'Export',
    exportError: ({ err }) => `Error exporting map: ${err}`,
    exporting: 'Please wait, exporting map…',
    exported: ({ url }) => (
      <>
        Map export has finished.{' '}
        <Alert.Link href={url} target="_blank">
          Open.
        </Alert.Link>
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
          <li>Exported will be new outdoor map.</li>
          <li>Export of the map may last tens of seconds.</li>
          <li>
            Before sharing exported map accompain it with the following
            attribution:
            <br />
            <em>
              map ©{' '}
              <Alert.Link
                href="https://www.freemap.sk/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Freemap Slovakia
              </Alert.Link>
              , data{' '}
              <Alert.Link
                href="https://osm.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
              >
                © OpenStreetMap contributors
              </Alert.Link>
              {', SRTM, '}
              <Alert.Link
                href="https://www.geoportal.sk/sk/udaje/lls-dmr/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LLS: ÚGKK SR
              </Alert.Link>
            </em>
          </li>
        </ul>{' '}
      </>
    ),
  },

  maps: {
    noMap: 'No map',
    create: 'Save as…',
    save: 'Save',
    rename: 'Rename',
    delete: 'Delete',
    namePrompt: 'Map name:',
    deleteConfirm: 'Are you sure to delete this map?',
    fetchError: ({ err }) => `Error loading map: ${err}`,
    fetchListError: ({ err }) => `Error loading maps: ${err}`,
    deleteError: ({ err }) => `Error deleting map: ${err}`,
    renameError: ({ err }) => `Error renaming map: ${err}`,
    createError: ({ err }) => `Error saving map: ${err}`,
    saveError: ({ err }) => `Error saving map: ${err}`,
  },

  legend: {
    body: () => (
      <>
        Map legend for <i>Hiking + Bicycle + Ski</i>:
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
};

function numberize(n: number, words: [string, string]) {
  return n < 1 ? words[0] : n < 2 ? words[1] : words[0];
}

export default en;
