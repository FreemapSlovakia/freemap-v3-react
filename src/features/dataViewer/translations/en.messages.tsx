import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import { DataViewerDetails } from '../components/DataViewerDetails.js';
import type { DataViewerMessages } from './DataViewerMessages.js';

const en: DataViewerMessages = {
  info: () => <DataViewerDetails />,
  upload: 'Upload',
  unnamedTrack: ({ n }) => `Track ${n}`,
  convertLossWarning:
    'Converting to a drawing replaces the track and discards its recorded data (elevation, heart rate, speed, time).',
  convertAllToDrawing: 'Convert all to drawing',
  simplifyAll: 'Simplify all',
  moreInfo: 'More info',
  saveAsMap: 'Save to my maps',
  unsaved: 'Unsaved',
  unsavedTooltip:
    'This track is not in any saved map and is not part of the link — it is kept only in this browser, so sharing the link will not share it. Save it to your maps to keep it.',
  loginToSaveMap: 'Log in first to save the track to your maps.',
  style: {
    title: 'Default style',
  },
  split: {
    action: 'Split',
    pick: 'Click the track where to cut it',
    here: 'Split here',
    segments: 'Split into segments',
  },
  join: {
    action: 'Join',
    asLine: 'Join into one line',
    asSegments: 'Join keeping segments',
    pick: 'Click the track to join with',
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
    update: 'Update elevation',
    updateConfirm: "Replace the track's elevation with the terrain model?",
    updatedToast: ({ mode }) =>
      mode === 'missing'
        ? 'Missing elevation has been filled.'
        : 'Elevation has been overwritten.',
  },
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Error fetching track data', err),
  matchingError: ({ err }) =>
    addError(getMessages()!, 'Error matching the track', err),
  loadingError: 'Error loading file.',
  onlyOne: 'Only a single file is expected.',
  invalidFormat: 'The file is not in a supported format or is invalid.',
  someFilesFailed: ({ names }) => `Some files could not be loaded: ${names}.`,
};

export default en;
