import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { ElevationSourcesList } from '../components/ElevationSources.js';
import type { ElevationChartMessages } from './ElevationChartMessages.js';

const hu: DeepPartialWithRequiredObjects<ElevationChartMessages> = {
  uphill: 'Összes emelkedés',
  downhill: 'Összes lejtés',
  downloadAsSvg: 'Letöltés SVG-ként',
  showWaypoints: 'Útpontok megjelenítése',
  elevationSource: 'Magassági adatok',
  showAllSources: 'Összes megjelenítése',
  elevationSourceList: (props) => <ElevationSourcesList {...props} />,
  fetchError: 'A magasságot nem sikerült beolvasni',
  rangeHint: () => (
    <>
      Az egérgörgővel nagyíthatja a diagramot, a nagyítottat húzással
      mozgathatja. A vonal egy szakaszának méréséhez tartsa lenyomva a{' '}
      <kbd>Shift</kbd> billentyűt, és húzza.
    </>
  ),
  rangeHintTouch:
    'Két ujjal nagyíthatja a diagramot, a nagyítottat húzással mozgathatja. A vonal egy szakaszának méréséhez tartsa nyomva az ujját, majd húzza.',
};

export default hu;
