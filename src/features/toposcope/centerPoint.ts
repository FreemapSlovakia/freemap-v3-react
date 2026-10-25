import type { RootState } from '@app/store/store.js';
import { pointToFeature } from '@features/dataViewer/drawingWire.js';
import {
  dataViewerAddFeatures,
  dataViewerMoveVertex,
} from '@features/dataViewer/model/actions.js';
import { poiSpec } from '@shared/drawingIcons.js';
import { featureDataProps } from '@shared/featureProperties.js';
import type { LatLon } from '@shared/types/common.js';
import type { Feature, FeatureCollection, Point } from 'geojson';
import { createSelector } from 'reselect';

/**
 * The property that makes a point the dial's centre, and the value it takes. A
 * property rather than the icon or the position: both of those are the user's
 * to change, and neither should be able to take the toposcope apart —
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

/** A point of the map's features, where it sits among them. */
export type IndexedPoint = {
  index: number;
  coords: LatLon;
  feature: Feature<Point>;
};

/** The map's points, each with its index; the dial's rays are drawn to them. */
export const pointFeaturesSelector = createSelector(
  (state: RootState) => state.trackViewer.trackGeojson,
  (fc: FeatureCollection | null): IndexedPoint[] =>
    (fc?.features ?? []).flatMap((feature, index) =>
      feature.geometry.type === 'Point'
        ? [
            {
              index,
              coords: {
                lat: feature.geometry.coordinates[1]!,
                lon: feature.geometry.coordinates[0]!,
              },
              feature: feature as Feature<Point>,
            },
          ]
        : [],
    ),
);

export function isToposcopeCenter(feature: Feature): boolean {
  return (
    feature.geometry.type === 'Point' &&
    featureDataProps(feature.properties)[CENTER_PROP]?.trim().toLowerCase() ===
      CENTER_PROP_VALUE
  );
}

/**
 * The point the dial stands on — the first one marked, so a second marked
 * point is simply ignored rather than making the dial ambiguous. Its index is
 * what the rays are told apart by, and is read fresh each time rather than
 * remembered, since every edit renumbers.
 *
 * Removing the property, or the point, ends the toposcope.
 */
export const toposcopeCenterSelector = createSelector(
  pointFeaturesSelector,
  (points): IndexedPoint | undefined =>
    points.find(({ feature }) => isToposcopeCenter(feature)),
);

/** A fresh centre standing at `coords`, marked, styled and labelled as one. */
export function makeToposcopeCenter(state: RootState, coords: LatLon): Feature {
  const { color, markerType } = state.drawingSettings.style;

  return pointToFeature({
    coords,
    color,
    markerType,
    icon: CENTER_ICON,
    label: CENTER_LABEL,
    props: { [CENTER_PROP]: CENTER_PROP_VALUE },
  });
}

/**
 * Puts the dial's centre at `coords` — moving the point where there is one,
 * creating it where there isn't. Returns the action, so the map click and the
 * GPS fix each place it the same way.
 */
export function placeToposcopeCenter(state: RootState, coords: LatLon) {
  const center = toposcopeCenterSelector(state);

  return center
    ? dataViewerMoveVertex({
        index: center.index,
        part: 0,
        vertex: 0,
        position: [coords.lon, coords.lat],
      })
    : dataViewerAddFeatures({
        features: [makeToposcopeCenter(state, coords)],
      });
}
