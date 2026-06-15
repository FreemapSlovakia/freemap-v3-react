import { ElevationInfo } from '@features/elevationChart/components/ElevationInfo.js';
import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { AreaInfo } from '../components/AreaInfo.js';
import { DistanceInfo } from '../components/DistanceInfo.js';
import { MeasurementMessages } from './MeasurementMessages.js';

const it: DeepPartialWithRequiredObjects<MeasurementMessages> = {
  elevationFetchError: ({ err }) =>
    addError(getMessages()!, 'Error fetching point elevation:', err),
  elevationInfo: (params) => (
    <ElevationInfo
      {...params}
      lang="cs"
      tileMessage="Tile"
      maslMessage="Elevazione"
    />
  ),
  areaInfo: (props) => (
    <AreaInfo {...props} areaLabel="Area" perimeterLabel="Perimetro" />
  ),
  distanceInfo: (props) => <DistanceInfo {...props} lengthLabel="Lunghezza" />,
};

export default it;
