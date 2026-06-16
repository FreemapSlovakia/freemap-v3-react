import { ElevationInfo } from '@features/elevationChart/components/ElevationInfo.js';
import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { AreaInfo } from '../components/AreaInfo.js';
import { DistanceInfo } from '../components/DistanceInfo.js';
import { MeasurementMessages } from './MeasurementMessages.js';

const sk: DeepPartialWithRequiredObjects<MeasurementMessages> = {
  elevationFetchError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri získavaní výšky bodu', err),
  elevationInfo: (params) => (
    <ElevationInfo
      {...params}
      lang="sk"
      tileMessage="Dlaždica"
      maslMessage="Nadmorská výška"
    />
  ),
  areaInfo: (props) => (
    <AreaInfo {...props} areaLabel="Plocha" perimeterLabel="Obvod" />
  ),
  distanceInfo: (props) => <DistanceInfo {...props} lengthLabel="Dĺžka" />,
};

export default sk;
