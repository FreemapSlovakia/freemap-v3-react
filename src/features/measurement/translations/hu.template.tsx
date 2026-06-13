import { ElevationInfo } from '@features/elevationChart/components/ElevationInfo.js';
import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { AreaInfo } from '../components/AreaInfo.js';
import { DistanceInfo } from '../components/DistanceInfo.js';
import { MeasurementMessages } from './MeasurementMessages.js';

const hu: DeepPartialWithRequiredObjects<MeasurementMessages> = {
  elevationFetchError: ({ err }) =>
    addError(
      getMessages()!,
      'Hiba történt a pont magasságának beolvasásakor',
      err,
    ),
  elevationInfo: (params) => (
    <ElevationInfo
      {...params}
      lang="hu"
      tileMessage="Térképcsempe"
      maslMessage="Magasság"
    />
  ),
  areaInfo: (props) => (
    <AreaInfo {...props} areaLabel="Terület" perimeterLabel="Kerület" />
  ),
  distanceInfo: (props) => <DistanceInfo {...props} lengthLabel="Távolság" />,
};

export default hu;
