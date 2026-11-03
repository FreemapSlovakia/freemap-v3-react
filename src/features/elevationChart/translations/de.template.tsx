import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { ElevationSourcesList } from '../components/ElevationSources.js';
import type { ElevationChartMessages } from './ElevationChartMessages.js';

const de: DeepPartialWithRequiredObjects<ElevationChartMessages> = {
  uphill: 'Gesamtanstieg',
  downhill: 'Gesamtabstieg',
  downloadAsSvg: 'Als SVG herunterladen',
  showWaypoints: 'Wegpunkte anzeigen',
  elevationSource: 'Höhendaten',
  showAllSources: 'Alle anzeigen',
  elevationSourceList: (props) => <ElevationSourcesList {...props} />,
  fetchError: 'Die Höhe konnte nicht gelesen werden',
  rangeHint: () => (
    <>
      Mit dem Mausrad zoomen Sie das Diagramm, das gezoomte verschieben Sie
      durch Ziehen. Um einen Teil der Linie zu vermessen, halten Sie{' '}
      <kbd>Umschalt</kbd> gedrückt und ziehen.
    </>
  ),
  rangeHintTouch:
    'Mit zwei Fingern zoomen Sie das Diagramm, das gezoomte verschieben Sie durch Ziehen. Um einen Teil der Linie zu vermessen, halten Sie den Finger gedrückt und ziehen dann.',
};

export default de;
