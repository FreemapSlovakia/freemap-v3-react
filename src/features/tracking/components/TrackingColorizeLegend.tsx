import { availableColorizer } from '@shared/colorizers/colorize.js';
import { ColorizeLegend } from '@shared/colorizers/components/ColorizeLegend.js';
import {
  colorizerNeedsElevation,
  colorizers,
} from '@shared/colorizers/index.js';
import { useUnlockedColorizingMode } from '@shared/colorizers/premiumColorize.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { Feature, LineString } from 'geojson';
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { hasElevation } from '../chartTrack.js';
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

  // Nothing is colorized where no watched track carries the mode's data, so the
  // legend has nothing to name either.
  if (
    !colorizeLegend ||
    !colorizeBy ||
    !tracks.length ||
    !availableColorizer(colorizers[colorizeBy], lineFeatures) ||
    (colorizerNeedsElevation(colorizeBy) &&
      !tracks.some((track) => hasElevation(track.trackPoints)))
  ) {
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
