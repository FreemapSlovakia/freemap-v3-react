import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import { TrackViewerDetails } from '../components/TrackViewerDetails.js';
import { TrackViewerMessages } from './TrackViewerMessages.js';

const en: TrackViewerMessages = {
  info: () => <TrackViewerDetails />,
  upload: 'Upload',
  moreInfo: 'More info',
  share: 'Save on server',
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
    sourceFilledGaps: 'recorded, gaps filled (NASA SRTM)',
    sourceFilled: 'NASA SRTM terrain model',
  },
  uploadModal: {
    title: 'Import file',
    drop: 'Drop a GPX or GeoJSON file here, or click here to select it.',
  },
  elevationFill: {
    title: 'Elevation data',
    introNone: 'This track has no elevation data.',
    introPartial: 'This track is missing elevation for some points.',
    introFull:
      'This track already has elevation, but the NASA SRTM model (~30 m) is ' +
      'often more precise.',
    question: 'What would you like to do?',
    overrideAll: 'Override all',
    overrideAllDesc:
      'replace every point from the SRTM terrain model — a smooth, ' +
      'consistent profile',
    fillMissing: 'Fill missing',
    fillMissingDesc:
      'keep the recorded values and fill only the gaps (may step where the ' +
      'two sources meet)',
    keep: 'Leave unchanged',
    keepDesc: 'use the elevation stored in the track',
    add: 'Add elevation',
    update: 'Update elevation',
    updateConfirm:
      "Replace the track's elevation with the NASA SRTM terrain model (~30 m)?",
    updatedToast: ({ mode }) =>
      mode === 'missing'
        ? 'Missing elevation has been filled.'
        : 'Elevation has been overwritten.',
  },
  shareToast:
    'The track has been saved to the server and can be shared by copying page URL.',
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Error fetching track data', err),
  savingError: ({ err }) =>
    addError(getMessages()!, 'Error saving the track', err),
  loadingError: 'Error loading file.',
  onlyOne: 'Only a single file is expected.',
  invalidFormat: 'The file is not in a supported format or is invalid.',
  tooBigError: 'The file is too big.',
};

export default en;
