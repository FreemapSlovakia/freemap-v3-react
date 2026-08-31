import { colorizeGeometrySource } from '@shared/colorizers/colorize.js';
import { ColorizeLegend } from '@shared/colorizers/components/ColorizeLegend.js';
import { colorizers } from '@shared/colorizers/index.js';
import { useUnlockedColorizingMode } from '@shared/colorizers/premiumColorize.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { Feature, LineString } from 'geojson';
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { routePlannerSetColorizeLegend } from '../model/actions.js';
import { routeColorizeFeatures } from '../model/pathDetails.js';
import { RoutePlannerToggleButton } from './RoutePlannerToggleButton.js';

/**
 * The planned route's colorize legend, mounted beside the toolbars rather than
 * inside the route planner's own: the colored line stays on the map when that
 * tool is closed, and a key belongs with what it explains.
 */
export default function RoutePlannerColorizeLegend() {
  const dispatch = useDispatch();

  const colorizeBy = useUnlockedColorizingMode(
    useAppSelector((state) => state.routePlannerSettings.colorizeBy),
  );

  const colorizeLegend = useAppSelector(
    (state) => state.routePlannerSettings.colorizeLegend,
  );

  const renderGeojson = useAppSelector(
    (state) => state.routePlanner.renderGeojson,
  );

  const alternatives = useAppSelector(
    (state) => state.routePlanner.alternatives,
  );

  const activeAlternativeIndex = useAppSelector(
    (state) => state.routePlanner.activeAlternativeIndex,
  );

  const colorizeFeatures = useMemo<Feature<LineString>[]>(
    () =>
      routeColorizeFeatures(
        alternatives[activeAlternativeIndex],
        colorizeGeometrySource(
          colorizeBy && colorizers[colorizeBy],
          renderGeojson,
        ),
      ),
    [renderGeojson, colorizeBy, alternatives, activeAlternativeIndex],
  );

  if (!colorizeLegend || !colorizeBy || !alternatives.length) {
    return null;
  }

  return (
    <ColorizeLegend
      mode={colorizeBy}
      control={<RoutePlannerToggleButton />}
      features={colorizeFeatures}
      onClose={() => dispatch(routePlannerSetColorizeLegend(false))}
    />
  );
}
