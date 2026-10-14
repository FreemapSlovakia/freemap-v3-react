import { RichMarker } from '@shared/components/RichMarker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Polyline } from 'react-leaflet';

const ROUTE_STYLE = {
  color: 'var(--bs-danger)',
  weight: 3,
  dashArray: '6 6',
} as const;

/** The key col mark and the route the details toast's peak was asked to show. */
export function TerrainOverlayResult(): ReactElement {
  const coordinates = useAppSelector(
    (state) => state.objects.route?.coordinates,
  );

  const keyCol = useAppSelector((state) => state.objects.keyCol);

  return (
    <>
      {coordinates && (
        <Polyline
          positions={coordinates}
          pathOptions={ROUTE_STYLE}
          interactive={false}
        />
      )}

      {keyCol && (
        <RichMarker
          position={{ lat: keyCol.lat, lng: keyCol.lon }}
          poi="saddle"
          interactive={false}
        />
      )}
    </>
  );
}
