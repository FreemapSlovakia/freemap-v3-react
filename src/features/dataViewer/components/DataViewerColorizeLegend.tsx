import { ColorizeLegend } from '@shared/colorizers/components/ColorizeLegend.js';
import { useUnlockedColorizingMode } from '@shared/colorizers/premiumColorize.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { Feature, LineString } from 'geojson';
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { dataViewerSetColorizeLegend } from '../model/actions.js';
import { trackLineParts } from '../trackLineParts.js';
import { DataViewerToggleButton } from './DataViewerToggleButton.js';

/**
 * The loaded track's colorize legend. Mounted beside the toolbars for the same
 * reason as the route planner's — see {@link RoutePlannerColorizeLegend}.
 */
export default function DataViewerColorizeLegend() {
  const dispatch = useDispatch();

  const colorizeTrackBy = useUnlockedColorizingMode(
    useAppSelector((state) => state.trackViewerSettings.colorizeTrackBy),
  );

  const colorizeLegend = useAppSelector(
    (state) => state.trackViewerSettings.colorizeLegend,
  );

  const trackGeojson = useAppSelector(
    (state) => state.trackViewer.trackGeojson,
  );

  const lineFeatures = useMemo<Feature<LineString>[]>(
    () => trackLineParts(trackGeojson),
    [trackGeojson],
  );

  if (!colorizeLegend || !colorizeTrackBy || !lineFeatures.length) {
    return null;
  }

  return (
    <ColorizeLegend
      mode={colorizeTrackBy}
      control={<DataViewerToggleButton />}
      features={lineFeatures}
      onClose={() => dispatch(dataViewerSetColorizeLegend(false))}
    />
  );
}
