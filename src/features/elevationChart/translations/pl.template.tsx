import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ElevationChartMessages } from './ElevationChartMessages.js';

const pl: DeepPartialWithRequiredObjects<ElevationChartMessages> = {
  uphill: 'Całkowite podejście',
  downhill: 'Całkowite zejście',
  downloadAsSvg: 'Pobierz jako SVG',
  showWaypoints: 'Pokaż punkty trasy',
  settings: 'Ustawienia profilu wysokości',
  elevationSource: 'Dane wysokościowe',
  fetchError: 'Nie udało się odczytać wysokości',
};

export default pl;
