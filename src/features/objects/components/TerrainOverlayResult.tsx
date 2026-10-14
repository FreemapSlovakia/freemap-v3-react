import { RichMarker } from '@shared/components/RichMarker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Polyline } from 'react-leaflet';

const ROUTE_STYLE = {
  color: 'var(--bs-danger)',
  weight: 3,
  dashArray: '6 6',
} as const;

/** The marks and the route the details toast was asked to show. */
export function TerrainOverlayResult(): ReactElement {
  const coordinates = useAppSelector(
    (state) => state.objects.route?.coordinates,
  );

  const marks = useAppSelector((state) => state.objects.marks);

  return (
    <>
      {coordinates && (
        <Polyline
          positions={coordinates}
          pathOptions={ROUTE_STYLE}
          interactive={false}
        />
      )}

      {Object.entries(marks).map(([kind, mark]) => (
        <RichMarker
          key={kind}
          position={{ lat: mark.lat, lng: mark.lon }}
          poi={mark.poi}
          interactive={false}
        />
      ))}
    </>
  );
}
