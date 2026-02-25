import { ChangesetsResult } from '@features/changesets/components/ChangesetsResult.js';
import { DrawingLinesResult } from '@features/drawing/components/DrawingLinesResult.js';
import { DrawingPointsResult } from '@features/drawing/components/DrawingPointsResult.js';
import { useMap } from '@features/map/hooks/useMap.js';
import { ObjectsResult } from '@features/objects/components/ObjectsResult.js';
import { RoutePlannerResult } from '@features/routePlanner/components/RoutePlannerResult.js';
import { SearchResults } from '@features/search/components/SearchResults.js';
import { TrackingResult } from '@features/tracking/components/TrackingResult.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { ReactElement, useEffect } from 'react';
import { AsyncComponent } from './AsyncComponent.js';
import { LocationResult } from './LocationResult.js';

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
          factory={() =>
            import(
              /* webpackChunkName: "track-viewer-result" */
              '@features/trackViewer/components/TrackViewerResult.js'
            )
          }
          trackGeojson={trackGeojson}
        />
      )}

      <ChangesetsResult />

      <TrackingResult />
    </>
  );
}
