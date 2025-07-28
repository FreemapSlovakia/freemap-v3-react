import { ReactElement, useEffect } from 'react';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useMap } from '../hooks/useMap.js';
import { AsyncComponent } from './AsyncComponent.js';
import { ChangesetsResult } from './ChangesetsResult.js';
import { DrawingLinesResult } from './DrawingLinesResult.js';
import { DrawingPointsResult } from './DrawingPointsResult.js';
import { LocationResult } from './LocationResult.js';
import { ObjectsResult } from './ObjectsResult.js';
import { RoutePlannerResult } from './RoutePlannerResult.js';
import { SearchResults } from './SearchResults.js';
import { TrackingResult } from './tracking/TrackingResult.js';

export function Results(): ReactElement {
  const trackGeojson = useAppSelector(
    (state) => state.trackViewer.trackGeojson,
  );

  const hasObjects = useAppSelector(
    (state) => state.objects.objects.length > 0,
  );

  const opacity = useAppSelector(
    (state) => state.map.layersSettings['i']?.opacity ?? 1,
  );

  const map = useMap();

  useEffect(() => {
    if (!map) {
      return;
    }

    for (const name of ['shadowPane', 'markerPane', 'overlayPane']) {
      const pane = map.getPane(name);

      if (pane) {
        pane.style.opacity = String(opacity ?? 1);
      }
    }
  }, [map, opacity]);

  return (
    <>
      <SearchResults />

      {hasObjects && <ObjectsResult />}

      <RoutePlannerResult />

      <DrawingLinesResult />

      <DrawingPointsResult />

      <LocationResult />

      {trackGeojson && (
        <AsyncComponent
          factory={() => import('./TrackViewerResult.js')}
          trackGeojson={trackGeojson}
        />
      )}

      <ChangesetsResult />

      <TrackingResult />
    </>
  );
}
