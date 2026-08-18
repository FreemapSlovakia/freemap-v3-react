import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ElevationChartMessages } from './ElevationChartMessages.js';

const cs: DeepPartialWithRequiredObjects<ElevationChartMessages> = {
  uphill: 'Celkové stoupání',
  downhill: 'Celkové klesání',
  downloadAsSvg: 'Stáhnout jako SVG',
  showWaypoints: 'Zobrazit trasové body',
  settings: 'Nastavení výškového profilu',
  elevationSource: 'Výšková data',
  fetchError: 'Výšku se nepodařilo načíst',
};

export default cs;
