import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import { DataViewerDetails } from '../components/DataViewerDetails.js';
import type { DataViewerMessages } from './DataViewerMessages.js';

const en: DataViewerMessages = {
  info: () => <DataViewerDetails />,
  upload: 'Upload',
  unnamedTrack: ({ n, kind }) =>
    `${kind === 'track' ? 'Recorded track' : kind === 'route' ? 'Planned route' : 'Line'} ${n}`,
  simplifyAll: 'Simplify all',
  moreInfo: 'More info',
  breakApart: 'Break apart',
  saveAsMap: 'Save to my maps',
  unsaved: 'Unsaved',
  unsavedTooltip:
    'This data cannot be put in the page address (URL) and is not in any saved map — it stays only in this browser. Save it to your maps to keep it.',
  loginToSaveMap: 'Log in first to save the track to your maps.',
  snapshotGone:
    'The data shown at this step is no longer kept in this browser.',
  snapshotFailed:
    'This browser could not keep the data, so reloading the page will lose it. Save it to your maps to keep it.',
  vertex: {
    menuItem: 'Point data',
    latitude: 'Latitude',
    longitude: 'Longitude',
    elevation: 'Elevation',
    time: 'Time',
    filled: ({ filled, total }) => `${filled} of ${total} points`,
    emptyHint:
      'An empty field leaves the point without that value. Which values the line has is set in its Properties.',
    notANumber: 'Enter a number.',
    outOfRange: 'Out of range.',
    timeOrder:
      "The time must lie between the previous and the next point's times.",
    channels: {
      heart: 'Heart rate',
      cads: 'Cadence',
      atemps: 'Air temperature',
      wtemps: 'Water temperature',
      depths: 'Depth',
      speeds: 'Speed',
      courses: 'Heading',
      bearings: 'Bearing',
      powers: 'Power',
      accuracies: 'Accuracy',
      battery: 'Battery',
      gsmSignal: 'GSM signal',
    },
  },
  split: {
    action: 'Split',
    pick: 'Click the track where to cut it',
    here: 'Split here',
  },
  join: {
    action: 'Join',
    asLine: 'Join into one line',
    asSegments: 'Join keeping segments',
    pick: 'Click the track to join with',
    pickEnd: 'Select point to join lines',
  },
  osmUpload: {
    menuItem: 'Upload GPS trace to OpenStreetMap',
    title: 'Upload GPS trace to OpenStreetMap',
    help: 'Uploads the loaded tracks to your OpenStreetMap account as a GPS trace, which mappers can trace paths from. Only tracks with recorded times go, as OpenStreetMap keeps nothing else. Upload only tracks you recorded yourself.',
    description: 'Description',
    tags: 'Tags',
    tagsHint: 'Separated by commas.',
    tagsInvalid:
      'OpenStreetMap does not accept . ; / ? % or # in a tag, nor a tag longer than 255 characters.',
    visibility: 'Visibility',
    visibilities: {
      identifiable: 'Identifiable',
      public: 'Public',
      trackable: 'Trackable',
      private: 'Private',
    },
    visibilityHints: {
      identifiable:
        'Shown in the trace list with your name, as ordered points with timestamps.',
      public:
        'Shown in the trace list with your name, as anonymous unordered points.',
      trackable: 'Shared only as anonymous ordered points with timestamps.',
      private: 'Shared only as anonymous unordered points.',
    },
    upload: 'Upload',
    loginPrompt:
      'Uploading needs you to log in with OpenStreetMap and allow Freemap to upload GPS traces. Continue?',
    connectPrompt:
      'Uploading needs your OpenStreetMap account connected to your Freemap account and allowed to receive GPS traces from Freemap. If you already have another Freemap account logged in with that OpenStreetMap account, the two accounts will be merged into one. Continue?',
    authorizePrompt:
      'Uploading needs you to allow Freemap to upload GPS traces to your OpenStreetMap account. Continue?',
    reauthorize:
      'Freemap’s permission to upload GPS traces to your OpenStreetMap account has just been withdrawn. Click Upload again to allow it.',
    success: ({ url }) => (
      <>
        The track has been uploaded. OpenStreetMap processes it within a few
        minutes.{' '}
        <a href={url} target="_blank" rel="noopener noreferrer">
          Show trace on OpenStreetMap
        </a>
      </>
    ),
  },
  match: {
    menuItem: 'Match to paths',
    title: 'Match to paths',
    help: 'Snaps the track onto the mapped path network, which cleans up GPS wander and — the point of it — tells the map what the track is made of, so it can be colorized by surface, road type, track grade and difficulty.',
    transport: 'Travelled by',
    dataLoss:
      'The matched line has its own points, so this track’s timestamps and recorded sensor data (heart rate, cadence, speed) will be lost.',
    run: 'Match',
    tooLong: 'This track has too many points to match.',
    tooShort: 'The track is too short to match.',
    brokenSequence:
      'The track leaves the mapped path network somewhere, so it cannot be matched. Try a different transport, or leave the track as it is.',
    offNetwork:
      'The matched route came out much longer than the track, which means the track did not follow mapped paths — across a meadow, say. Matching can only answer with paths that exist, so the result would not be where you went. The track is left as it is.',
    partial:
      'Some parts of the track could not be matched — they are left as they were recorded. A track that changes transport partway (a walk, then the drive home) needs splitting first.',
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
    source: 'Elevation source',
    sourceOriginal: 'recorded',
    sourcePartial: 'recorded, incomplete',
    sourceFilledGaps: 'recorded, gaps filled (terrain model)',
    sourceFilled: 'terrain model',
  },
  uploadModal: {
    title: 'Import file',
    drop: 'Drop GPX, KML, KMZ, TCX or GeoJSON files here, or click here to select them. You can pick several at once.',
    mergeTitle: 'Data already loaded',
    mergeMessage:
      'Some geodata is already shown. Append the imported data to it, or replace it?',
    existingData: 'Existing data',
    append: 'Append',
    replace: 'Replace',
  },
  elevationFill: {
    title: 'Elevation data',
    introNone: 'This track has no elevation data.',
    introPartial: 'This track is missing elevation for some points.',
    introFull:
      'This track already has elevation, but a terrain model is often more ' +
      'precise.',
    premiumHiRes: (premiumLink) => (
      <>
        With {premiumLink('premium access')}, elevation in supported countries
        is sampled from a high-resolution national model — currently Slovakia
        (DMR 5.0: ÚGKK SR), with more to follow.
      </>
    ),
    question: 'What would you like to do?',
    overrideAll: 'Override all',
    overrideAllDesc:
      'replace every point from the terrain model — a smooth, consistent ' +
      'profile',
    fillMissing: 'Fill missing',
    fillMissingDesc:
      'keep the recorded values and fill only the gaps (may step where the ' +
      'two sources meet)',
    keep: 'Leave unchanged',
    keepDesc: 'use the elevation stored in the track',
    add: 'Add elevation',
    clear: 'Clear elevation',
    clearDesc:
      'remove the stored elevation; profiles then read the terrain model',
    update: 'Update elevation',
    updatedToast: ({ mode }) =>
      mode === 'missing'
        ? 'Missing elevation has been filled.'
        : mode === 'clear'
          ? 'Elevation has been cleared.'
          : 'Elevation has been overwritten.',
  },
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Error fetching track data', err),
  matchingError: ({ err }) =>
    addError(getMessages()!, 'Error matching the track', err),
  osmUploadError: ({ err }) =>
    addError(getMessages()!, 'Error uploading to OpenStreetMap', err),
  loadingError: 'Error loading file.',
  onlyOne: 'Only a single file is expected.',
  invalidFormat: 'The file is not in a supported format or is invalid.',
  someFilesFailed: ({ names }) => `Some files could not be loaded: ${names}.`,
};

export default en;
