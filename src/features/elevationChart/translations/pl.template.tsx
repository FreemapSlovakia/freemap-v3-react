import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { ElevationSourcesList } from '../components/ElevationSources.js';
import type { ElevationChartMessages } from './ElevationChartMessages.js';

const pl: DeepPartialWithRequiredObjects<ElevationChartMessages> = {
  uphill: 'Całkowite podejście',
  downhill: 'Całkowite zejście',
  downloadAsSvg: 'Pobierz jako SVG',
  showWaypoints: 'Pokaż punkty trasy',
  elevationSource: 'Dane wysokościowe',
  showAllSources: 'Pokaż wszystkie',
  elevationSourceList: (props) => <ElevationSourcesList {...props} />,
  fetchError: 'Nie udało się odczytać wysokości',
  rangeHint: () => (
    <>
      Kółkiem myszy można przybliżyć wykres, a przybliżony wykres przesunąć
      przeciągnięciem. Aby zmierzyć fragment linii, przytrzymaj <kbd>Shift</kbd>{' '}
      i przeciągnij.
    </>
  ),
  rangeHintTouch:
    'Zsunięciem palców można przybliżyć wykres, a przybliżony wykres przesunąć przeciągnięciem. Aby zmierzyć fragment linii, przytrzymaj palec, a następnie przeciągnij.',
};

export default pl;
