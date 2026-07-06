import { ElevationInfo } from '@features/elevationChart/components/ElevationInfo.js';
import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { AreaInfo } from '../components/AreaInfo.js';
import { DistanceInfo } from '../components/DistanceInfo.js';
import type { MeasurementMessages } from './MeasurementMessages.js';

const sl: DeepPartialWithRequiredObjects<MeasurementMessages> = {
  elevationFetchError: ({ err }) =>
    addError(
      getMessages()!,
      'Napaka pri pridobivanju nadmorske višine točke',
      err,
    ),
  elevationInfo: (params) => (
    <ElevationInfo
      {...params}
      lang="sl"
      tileMessage="Ploščica"
      maslMessage="Nadmorska višina"
    />
  ),
  areaInfo: (props) => (
    <AreaInfo {...props} areaLabel="Površina" perimeterLabel="Obseg" />
  ),
  distanceInfo: (props) => <DistanceInfo {...props} lengthLabel="Dolžina" />,
};

export default sl;
