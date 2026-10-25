import type { RootState } from '@app/store/store.js';
import type { QueryPart } from '@app/url/mapContentParts.js';
import { positionCount } from '@shared/geoutils.js';
import {
  serializeDrawingLine,
  serializeDrawingPoint,
} from '@shared/urlSerialization.js';
import type { FeatureCollection } from 'geojson';
import { toWire, type WireItem } from '../drawingWire.js';
import { completed } from '../vertexEditing.js';

/**
 * How much of a link the map's features may take, in encoded characters. Past
 * it they go into a snapshot instead: a longer link outgrows what chat apps,
 * mail clients and QR codes pass on intact.
 */
export const URL_FEATURES_BUDGET = 8000;

export function wireParams(items: readonly WireItem[]): QueryPart[] {
  return items.map((item) =>
    item.kind === 'point'
      ? ['point', serializeDrawingPoint(item.point)]
      : [item.line.type, serializeDrawingLine(item.line, item.line.holeOf)],
  );
}

const cache = new WeakMap<object, QueryPart[] | null>();

/**
 * The features as URL params, in their order, or `undefined` when the link
 * can't carry them: one the drawing form can't say, or more than the budget.
 * A line or ring still being drawn is left out, as it would be on its own.
 */
export function urlWire(
  fc: FeatureCollection | null | undefined,
): QueryPart[] | undefined {
  if (!fc) {
    return [];
  }

  let params = cache.get(fc);

  // Each vertex takes at least `0/0,`: past this many, encoding all of a long
  // track on every edit only to find it over budget is wasted.
  if (
    params === undefined &&
    fc.features.reduce(
      (sum, { geometry }) => sum + positionCount(geometry),
      0,
    ) >
      URL_FEATURES_BUDGET / 4
  ) {
    params = null;

    cache.set(fc, params);
  }

  if (params === undefined) {
    const { items, rest } = toWire(completeCollection(fc).features, true);

    params = rest.length === 0 ? wireParams(items) : null;

    if (
      params &&
      params.reduce(
        (sum, [key, value]) =>
          sum +
          encodeURIComponent(key).length +
          encodeURIComponent(String(value)).length +
          2,
        0,
      ) > URL_FEATURES_BUDGET
    ) {
      params = null;
    }

    cache.set(fc, params);
  }

  return params ?? undefined;
}

/** Whether the link carries the map's features, all of them (`getMapContentParts`). */
export function featuresInLink({
  trackGeojson,
}: {
  trackGeojson: FeatureCollection | null;
}): boolean {
  return urlWire(trackGeojson) !== undefined;
}

export function inLinkSelector(state: RootState): boolean {
  return featuresInLink(state.trackViewer);
}

const completeCache = new WeakMap<FeatureCollection, FeatureCollection>();

/**
 * The collection without what is still being drawn — a line of one vertex, a
 * ring short of closing — which is no valid GeoJSON and goes nowhere stored.
 */
export function completeCollection(fc: FeatureCollection): FeatureCollection {
  let out = completeCache.get(fc);

  if (!out) {
    const features = fc.features.flatMap((feature) => completed(feature) ?? []);

    out =
      features.length === fc.features.length &&
      features.every((feature, i) => feature === fc.features[i])
        ? fc
        : { ...fc, features };

    completeCache.set(fc, out);
  }

  return out;
}
