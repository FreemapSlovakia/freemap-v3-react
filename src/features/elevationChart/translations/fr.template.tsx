import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { ElevationSourcesList } from '../components/ElevationSources.js';
import type { ElevationChartMessages } from './ElevationChartMessages.js';

const fr: DeepPartialWithRequiredObjects<ElevationChartMessages> = {
  uphill: 'Dénivelé positif total',
  downhill: 'Dénivelé négatif total',
  downloadAsSvg: 'Télécharger en SVG',
  showWaypoints: 'Afficher les points de cheminement',
  elevationSource: 'Données altimétriques',
  showAllSources: 'Tout afficher',
  elevationSourceList: (props) => <ElevationSourcesList {...props} />,
  fetchError: "L'altitude n'a pas pu être lue",
  rangeHint: () => (
    <>
      La molette zoome le graphique&nbsp;; une fois zoomé, faites-le glisser
      pour vous y déplacer. Pour mesurer une partie de la ligne, maintenez{' '}
      <kbd>Maj</kbd> et faites glisser.
    </>
  ),
  rangeHintTouch:
    'Pincez pour zoomer le graphique ; une fois zoomé, faites-le glisser pour vous y déplacer. Pour mesurer une partie de la ligne, appuyez longuement, puis faites glisser.',
};

export default fr;
