import type { RootState } from '@app/store/store.js';
import {
  type DrawingPoint,
  drawingPointAdd,
  drawingPointChangePosition,
} from '@features/drawing/model/actions/drawingPointActions.js';
import { poiSpec } from '@shared/drawingIcons.js';
import type { LatLon } from '@shared/types/common.js';

/**
 * The property that makes a drawn point the dial's centre, and the value it
 * takes. A property rather than the icon or the position: both of those are the
 * user's to change, and neither should be able to take the toposcope apart —
 * restyling a marker or drawing another point in front of it now means nothing
 * to the dial.
 *
 * It travels wherever the point does — the URL's `P` style field, a saved map,
 * a GeoJSON export — so a toposcope needs nothing recorded beside its points.
 */
export const CENTER_PROP = 'toposcope';
export const CENTER_PROP_VALUE = 'center';

/**
 * The symbol a fresh centre is given — the map's own for a viewpoint, which is
 * what the middle of a toposcope is, and whose rays radiating from a point are
 * the dial in miniature. Only how it looks: change it and the point is still
 * the centre.
 */
export const CENTER_POI = 'viewpoint';

export const CENTER_ICON = poiSpec(CENTER_POI);

/**
 * What a fresh centre is labelled with: the position it stands at, written the
 * way a toposcope engraves it. An ordinary point label from there on — the user
 * can put a summit's name above it, or replace it outright.
 */
export const CENTER_LABEL = '{location}';

export function isToposcopeCenter(point: DrawingPoint): boolean {
  return point.props?.[CENTER_PROP]?.trim().toLowerCase() === CENTER_PROP_VALUE;
}

/**
 * The drawn point the dial stands on, and where it sits among the others — the
 * first one marked, so a second marked point is simply ignored rather than
 * making the dial ambiguous. Its index is what the rays are told apart by, and
 * is read fresh each time rather than remembered, since every edit renumbers.
 *
 * Removing the property, or the point, ends the toposcope.
 */
export function toposcopeCenterSelector(
  state: RootState,
): { index: number; point: DrawingPoint } | undefined {
  const index = state.drawingPoints.points.findIndex(isToposcopeCenter);

  return index === -1
    ? undefined
    : { index, point: state.drawingPoints.points[index]! };
}

/** A fresh centre standing at `coords`, marked, styled and labelled as one. */
export function makeToposcopeCenter(
  state: RootState,
  coords: LatLon,
): DrawingPoint {
  const { color, markerType } = state.drawingSettings.style;

  return {
    coords,
    color,
    markerType,
    icon: CENTER_ICON,
    label: CENTER_LABEL,
    props: { [CENTER_PROP]: CENTER_PROP_VALUE },
  };
}

/**
 * Puts the dial's centre at `coords` — moving the point where there is one,
 * creating it where there isn't. Returns the action, so the map click and the
 * GPS fix each place it the same way.
 */
export function placeToposcopeCenter(state: RootState, coords: LatLon) {
  const center = toposcopeCenterSelector(state);

  return center
    ? drawingPointChangePosition({ index: center.index, coords })
    : drawingPointAdd({
        ...makeToposcopeCenter(state, coords),
        id: state.drawingPoints.points.length,
      });
}
