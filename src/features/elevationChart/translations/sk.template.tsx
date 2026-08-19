import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ElevationChartMessages } from './ElevationChartMessages.js';

const sk: DeepPartialWithRequiredObjects<ElevationChartMessages> = {
  uphill: 'Celkové stúpanie',
  downhill: 'Celkové klesanie',
  downloadAsSvg: 'Stiahnuť ako SVG',
  showWaypoints: 'Zobraziť trasové body',
  elevationSource: 'Výškové dáta',
  fetchError: 'Výšku sa nepodarilo načítať',
};

export default sk;
