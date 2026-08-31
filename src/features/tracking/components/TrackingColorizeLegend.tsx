import { ColorizeLegend } from '@shared/colorizers/components/ColorizeLegend.js';
import { useUnlockedColorizingMode } from '@shared/colorizers/premiumColorize.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { Feature, LineString } from 'geojson';
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { trackingActions } from '../model/actions.js';
import { trackPointsToFeature } from '../trackGeojson.js';
import { TrackingToggleButton } from './TrackingToggleButton.js';

/**
 * The tracked devices' colorize legend. Mounted beside the toolbars for the same
 * reason as the route planner's — see {@link RoutePlannerColorizeLegend}.
 */
export default function TrackingColorizeLegend() {
  const dispatch = useDispatch();

  const colorizeBy = useUnlockedColorizingMode(
    useAppSelector((state) => state.trackingSettings.colorizeBy),
  );

  const colorizeLegend = useAppSelector(
    (state) => state.trackingSettings.colorizeLegend,
  );

  const tracks = useAppSelector((state) => state.tracking.tracks);

  const lineFeatures = useMemo<Feature<LineString>[]>(
    () => tracks.map((t) => trackPointsToFeature(t.trackPoints)),
    [tracks],
  );

  if (!colorizeLegend || !colorizeBy || !tracks.length) {
    return null;
  }

  return (
    <ColorizeLegend
      mode={colorizeBy}
      control={<TrackingToggleButton />}
      features={lineFeatures}
      onClose={() => dispatch(trackingActions.setColorizeLegend(false))}
    />
  );
}
