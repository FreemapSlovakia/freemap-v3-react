import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { ElevationSourcesList } from '../components/ElevationSources.js';
import type { ElevationChartMessages } from './ElevationChartMessages.js';

const sl: DeepPartialWithRequiredObjects<ElevationChartMessages> = {
  uphill: 'Skupni vzpon',
  downhill: 'Skupni spust',
  downloadAsSvg: 'Prenesi kot SVG',
  showWaypoints: 'Prikaži točke poti',
  elevationSource: 'Podatki o višini',
  showAllSources: 'Prikaži vse',
  elevationSourceList: (props) => <ElevationSourcesList {...props} />,
  fetchError: 'Nadmorske višine ni bilo mogoče prebrati',
  rangeHint: () => (
    <>
      S kolescem miške približate graf, približanega premikate z vlečenjem. Za
      merjenje dela linije držite tipko <kbd>Shift</kbd> in povlecite.
    </>
  ),
  rangeHintTouch:
    'S približevanjem prstov povečate graf, približanega premikate z vlečenjem. Za merjenje dela linije pridržite prst in nato povlecite.',
};

export default sl;
