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
      Mit dem Mausrad zoomst du das Diagramm, das gezoomte verschiebst du durch
      Ziehen. Um einen Teil der Linie zu vermessen, halte <kbd>Umschalt</kbd>{' '}
      gedrückt und ziehe.
    </>
  ),
  rangeHintTouch:
    'Mit zwei Fingern zoomst du das Diagramm, das gezoomte verschiebst du durch Ziehen. Um einen Teil der Linie zu vermessen, halte den Finger gedrückt und ziehe dann.',
};

export default de;
