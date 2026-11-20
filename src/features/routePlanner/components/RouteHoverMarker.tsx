import { RichMarker } from '@shared/components/RichMarker.js';
import type { ReactElement } from 'react';
import { FaCloudSun } from 'react-icons/fa';
import { useHoverSpot } from '../hoverSpot.js';
import { maneuverIcon } from './maneuverIcon.js';

/** Where the row hovered in the route panel is, as the chart marks its point. */
export function RouteHoverMarker(): ReactElement | null {
  const hovered = useHoverSpot();

  return (
    hovered && (
      <RichMarker
        faIcon={
          hovered.kind === 'maneuver' ? (
            maneuverIcon(hovered.maneuver, hovered.left)
          ) : (
            <FaCloudSun />
          )
        }
        color="grey"
        interactive={false}
        position={{ lat: hovered.lat, lng: hovered.lon }}
      />
    )
  );
}
