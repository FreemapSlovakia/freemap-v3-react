import { ElevationInfo } from '@features/elevationChart/components/ElevationInfo.js';
import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { AreaInfo } from '../components/AreaInfo.js';
import { DistanceInfo } from '../components/DistanceInfo.js';
import type { MeasurementMessages } from './MeasurementMessages.js';

const fr: DeepPartialWithRequiredObjects<MeasurementMessages> = {
  elevationFetchError: ({ err }) =>
    addError(
      getMessages()!,
      'Erreur lors de la récupération de l’altitude du point',
      err,
    ),
  elevationInfo: (params) => (
    <ElevationInfo
      {...params}
      lang="fr"
      tileMessage="Tuile"
      maslMessage="Altitude"
    />
  ),
  areaInfo: (props) => (
    <AreaInfo {...props} areaLabel="Surface" perimeterLabel="Périmètre" />
  ),
  distanceInfo: (props) => <DistanceInfo {...props} lengthLabel="Longueur" />,
};

export default fr;
