import { ElevationInfo } from '@features/elevationChart/components/ElevationInfo.js';
import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import { AreaInfo } from '../components/AreaInfo.js';
import { DistanceInfo } from '../components/DistanceInfo.js';
import { MeasurementMessages } from './MeasurementMessages.js';

const en: MeasurementMessages = {
  elevationFetchError: ({ err }) =>
    addError(getMessages()!, 'Error fetching point elevation', err),
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
};

export default en;
