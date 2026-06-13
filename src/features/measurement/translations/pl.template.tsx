import { ElevationInfo } from '@features/elevationChart/components/ElevationInfo.js';
import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { AreaInfo } from '../components/AreaInfo.js';
import { DistanceInfo } from '../components/DistanceInfo.js';
import { MeasurementMessages } from './MeasurementMessages.js';

const pl: DeepPartialWithRequiredObjects<MeasurementMessages> = {
  elevationFetchError: ({ err }) =>
    addError(
      getMessages()!,
      'Wystąpił błąd podczas pobierania wysokości punktu',
      err,
    ),
  elevationInfo: (params) => (
    <ElevationInfo
      {...params}
      lang="pl"
      tileMessage="Kafel"
      maslMessage="Wysokość n.p.m."
    />
  ),
  areaInfo: (props) => (
    <AreaInfo {...props} areaLabel="Powierzchnia" perimeterLabel="Obwód" />
  ),
  distanceInfo: (props) => <DistanceInfo {...props} lengthLabel="Długość" />,
};

export default pl;
