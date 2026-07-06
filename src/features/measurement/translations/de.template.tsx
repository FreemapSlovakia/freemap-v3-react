import { ElevationInfo } from '@features/elevationChart/components/ElevationInfo.js';
import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { AreaInfo } from '../components/AreaInfo.js';
import { DistanceInfo } from '../components/DistanceInfo.js';
import type { MeasurementMessages } from './MeasurementMessages.js';

const de: DeepPartialWithRequiredObjects<MeasurementMessages> = {
  elevationFetchError: ({ err }) =>
    addError(
      getMessages()!,
      'Fehler beim Abrufen der Höheninformation des Punktes',
      err,
    ),

  elevationInfo: (params) => (
    <ElevationInfo
      {...params}
      lang="de"
      tileMessage="Kachel"
      maslMessage="Höhe"
    />
  ),
  areaInfo: (props) => (
    <AreaInfo {...props} areaLabel="Fläche" perimeterLabel="Umfang" />
  ),
  distanceInfo: (props) => <DistanceInfo {...props} lengthLabel="Länge" />,
};

export default de;
