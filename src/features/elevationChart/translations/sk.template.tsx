import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { ElevationSourcesList } from '../components/ElevationSources.js';
import type { ElevationChartMessages } from './ElevationChartMessages.js';

const sk: DeepPartialWithRequiredObjects<ElevationChartMessages> = {
  uphill: 'Celkové stúpanie',
  downhill: 'Celkové klesanie',
  downloadAsSvg: 'Stiahnuť ako SVG',
  showWaypoints: 'Zobraziť trasové body',
  elevationSource: 'Výškové dáta',
  showAllSources: 'Zobraziť všetky',
  elevationSourceList: (props) => <ElevationSourcesList {...props} />,
  fetchError: 'Výšku sa nepodarilo načítať',
  rangeHint: () => (
    <>
      Kolieskom myši graf priblížite, priblížený graf posuniete ťahaním. Ak
      chcete zmerať časť línie, podržte <kbd>Shift</kbd> a potiahnite.
    </>
  ),
  rangeHintTouch:
    'Stiahnutím prstov graf priblížite, priblížený graf posuniete ťahaním. Ak chcete zmerať časť línie, podržte prst a potom potiahnite.',
};

export default sk;
