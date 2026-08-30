import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ElevationChartMessages } from './ElevationChartMessages.js';

const cs: DeepPartialWithRequiredObjects<ElevationChartMessages> = {
  uphill: 'Celkové stoupání',
  downhill: 'Celkové klesání',
  downloadAsSvg: 'Stáhnout jako SVG',
  showWaypoints: 'Zobrazit trasové body',
  elevationSource: 'Výšková data',
  fetchError: 'Výšku se nepodařilo načíst',
  rangeHint: () => (
    <>
      Kolečkem myši graf přiblížíte, přiblížený graf posunete tažením. Chcete-li
      změřit část linie, podržte <kbd>Shift</kbd> a táhněte.
    </>
  ),
  rangeHintTouch:
    'Stažením prstů graf přiblížíte, přiblížený graf posunete tažením. Chcete-li změřit část linie, podržte prst a poté táhněte.',
};

export default cs;
