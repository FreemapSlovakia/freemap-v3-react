import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { ElevationSourcesList } from '../components/ElevationSources.js';
import type { ElevationChartMessages } from './ElevationChartMessages.js';

const it: DeepPartialWithRequiredObjects<ElevationChartMessages> = {
  uphill: 'Ascesa totale',
  downhill: 'Discesa totale',
  downloadAsSvg: 'Scarica come SVG',
  showWaypoints: 'Mostra i waypoint',
  elevationSource: 'Dati altimetrici',
  showAllSources: 'Mostra tutte',
  elevationSourceList: (props) => <ElevationSourcesList {...props} />,
  fetchError: "Non è stato possibile leggere l'altitudine",
  rangeHint: () => (
    <>
      Con la rotellina si ingrandisce il grafico, quello ingrandito si sposta
      trascinandolo. Per misurare una parte della linea, tenga premuto{' '}
      <kbd>Maiusc</kbd> e trascini.
    </>
  ),
  rangeHintTouch:
    'Avvicini le dita per ingrandire il grafico, quello ingrandito si sposta trascinandolo. Per misurare una parte della linea, tenga premuto il dito e poi trascini.',
};

export default it;
