import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import { TrackViewerDetails } from '../components/TrackViewerDetails.js';
import { TrackViewerMessages } from './TrackViewerMessages.js';

const en: TrackViewerMessages = {
  info: () => <TrackViewerDetails />,
  upload: 'Upload',
  trackLabel: 'Track',
  unnamedTrack: ({ n }) => `Track ${n}`,
  convertLossWarning:
    'Converting to a drawing replaces the track and discards its recorded data (elevation, heart rate, speed, time).',
  moreInfo: 'More info',
  saveAsMap: 'Save to my maps',
  loginToSaveMap: 'Log in first to save the track to your maps.',
  style: {
    title: 'Default style',
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
  loadingError: 'Error loading file.',
  onlyOne: 'Only a single file is expected.',
  invalidFormat: 'The file is not in a supported format or is invalid.',
  someFilesFailed: ({ names }) => `Some files could not be loaded: ${names}.`,
};

export default en;
