import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import { TrackViewerDetails } from '../components/TrackViewerDetails.js';
import { TrackViewerMessages } from './TrackViewerMessages.js';

const en: TrackViewerMessages = {
  info: () => <TrackViewerDetails />,
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
  elevationFill: {
    title: 'Add elevation',
    message:
      'This track is missing elevation. Add it from the server? ' +
      '“Override all” gives a smoother, consistent profile; ' +
      '“Fill missing” keeps the recorded values.',
    fillMissing: 'Fill missing',
    overrideAll: 'Override all',
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
