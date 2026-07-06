import { ElevationInfo } from '@features/elevationChart/components/ElevationInfo.js';
import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { AreaInfo } from '../components/AreaInfo.js';
import { DistanceInfo } from '../components/DistanceInfo.js';
import type { MeasurementMessages } from './MeasurementMessages.js';

const cs: DeepPartialWithRequiredObjects<MeasurementMessages> = {
  elevationFetchError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při získávání výšky bodu', err),
  elevationInfo: (params) => (
    <ElevationInfo
      {...params}
      lang="cs"
      tileMessage="Dlaždice"
      maslMessage="Nadmořská výška"
    />
  ),
  areaInfo: (props) => (
    <AreaInfo {...props} areaLabel="Plocha" perimeterLabel="Obvod" />
  ),
  distanceInfo: (props) => <DistanceInfo {...props} lengthLabel="Délka" />,
};

export default cs;
