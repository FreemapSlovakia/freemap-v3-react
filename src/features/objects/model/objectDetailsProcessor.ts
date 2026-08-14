import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import type { ElevationReading } from '@features/elevationChart/components/ElevationValue.js';
import type { SearchResult } from '@features/search/model/actions.js';
import { activeSearchResultSelector } from '@features/search/model/selectors.js';
import { toastsAdd, toastsRemove } from '@features/toasts/model/actions.js';
import { fetchElevations } from '@shared/elevation.js';
import { lineSegments } from '@shared/geoutils.js';
import { isAbortError } from '@shared/isAbortError.js';
import type { LatLon } from '@shared/types/common.js';
import {
  featureIdsEqual,
  stringifyFeatureId,
} from '@shared/types/featureId.js';
import { along } from '@turf/along';
import { center } from '@turf/center';
import { lineString, point } from '@turf/helpers';
import { length } from '@turf/length';
import type { Feature, Point } from 'geojson';
import { loadObjectsMessages } from '../translations/loadObjectsMessages.js';
import { objectsSetShowDetails } from './actions.js';

const TOAST_ID = 'mapDetails.tags';

type DetailsTarget = {
  /**
   * Identifies the subject across re-runs. A key rather than the result's
   * identity: an objects refresh (every pan and zoom re-queries Overpass)
   * rebuilds the whole list, so identity would report a new subject —  and a
   * re-added toast — for an object the user is still looking at.
   */
  key: string;
  result: SearchResult;
};

/**
 * Where a result's elevation is read: the midpoint of its longest segment for a
 * line, whose bbox centre can sit well off it (a bend, a horseshoe), and the
 * centre of the geometry otherwise. `null` for a result carrying no geometry to
 * read at — a Nominatim hit without one, an empty collection — which turf
 * answers with a throw rather than a value.
 */
function resultCoords(result: SearchResult): LatLon | null {
  const geometry =
    result.geojson.type === 'Feature' ? result.geojson.geometry : null;

  let p: Feature<Point>;

  try {
    if (
      geometry?.type === 'LineString' ||
      geometry?.type === 'MultiLineString'
    ) {
      const line = lineSegments(geometry)
        .filter((coords) => coords.length > 1)
        .map((coords) => lineString(coords))
        .reduce((longest, candidate) =>
          length(candidate) > length(longest) ? candidate : longest,
        );

      p = along(line, length(line) / 2);
    } else {
      p = center(result.geojson);
    }
  } catch {
    return null;
  }

  const [lon, lat] = p.geometry.coordinates;

  return Number.isFinite(lon) && Number.isFinite(lat)
    ? { lat: lat!, lon: lon! }
    : null;
}

/** What the details toast is about, or `null` if the selection has no details. */
function detailsTarget(state: RootState): DetailsTarget | null {
  const { selection } = state.main;

  if (selection?.type === 'search') {
    const result = activeSearchResultSelector(state);

    // The `incomplete` flag is part of the key, so the toast follows one and the
    // same result through its upgrade to the fully loaded element. An element
    // whose fetch is in flight has nothing to describe yet.
    return result && !result.loading
      ? {
          key: `search:${stringifyFeatureId(result.id)}:${result.incomplete ? 'incomplete' : 'complete'}`,
          result,
        }
      : null;
  }

  if (selection?.type === 'objects') {
    const object = state.objects.objects.find((o) =>
      featureIdsEqual(o.id, selection.id),
    );

    return object
      ? {
          key: `objects:${stringifyFeatureId(object.id)}`,
          result: {
            source: 'osm',
            id: object.id,
            geojson: point([object.coords.lon, object.coords.lat], object.tags),
          },
        }
      : null;
  }

  return null;
}

/** The subject the toast should be showing, `null` for none. */
export function wantedTarget(state: RootState): DetailsTarget | null {
  return state.objectsSettings.showDetails ? detailsTarget(state) : null;
}

/**
 * Keeps the details toast a view of the selection and the `showDetails`
 * preference, instead of something each place that selects a feature has to
 * push. It therefore follows the selection the way a selection toolbar does,
 * and the toast's × turns the preference off (through `onClose`) rather than
 * dropping a panel nothing can bring back.
 */
export const objectDetailsProcessor: Processor = {
  handle: async ({ getState, prevState, dispatch }) => {
    const state = getState();

    const target = wantedTarget(state);

    // Edge-triggered: only a changed subject opens the toast. Re-opening it
    // merely because it is gone would make its × a no-op, and re-adding an
    // unchanged one would throw it back to the top of the toast column.
    if (target?.key === wantedTarget(prevState)?.key) {
      return;
    }

    if (!target) {
      if (state.toasts.toasts[TOAST_ID]) {
        dispatch(toastsRemove(TOAST_ID));
      }

      return;
    }

    const show = (elevation: ElevationReading) =>
      dispatch(
        toastsAdd({
          id: TOAST_ID,
          messageKey: 'detail',
          messageLoader: loadObjectsMessages,
          messageParams: { result: target.result, elevation },
          // An embed has no selection toolbar, so nothing there could switch the
          // preference back on — its × dismisses the toast and no more.
          onClose: window.fmEmbedded ? undefined : objectsSetShowDetails(false),
          style: 'info',
        }),
      );

    // Only once the subject is known to have changed — walking the geometry of
    // every selected feature on every dispatched action would be work for
    // nothing.
    const coords = resultCoords(target.result);

    // The details show at once; the elevation reads separately and lands in the
    // same toast, so a slow API doesn't hold the tags back.
    show({ elevation: undefined, loading: coords !== null, sources: [] });

    if (!coords) {
      return;
    }

    const sources = new Set<string>();

    let elevation: number | null | undefined;

    let error: unknown;

    try {
      [elevation] = await fetchElevations(
        [[coords.lat, coords.lon]],
        getState,
        // Invalidated by the subject changing, not by the actions that can
        // change it: a reload restores the same pin twice (the URL's element
        // load and the map document), and the second one announces a subject
        // identical to the first. Cancelling on the action would abort the read
        // while this handler, edge-triggered on that same subject, starts
        // nothing in its place — leaving the spinner up for good.
        { stateChangePredicate: (state) => wantedTarget(state)?.key },
        sources,
      );
    } catch (err) {
      // An abort means something newer is already on its way (or the features
      // were cleared) — leave the toast to whatever caused it.
      if (isAbortError(err)) {
        return;
      }

      // The details themselves stand without it, so the failure is answered in
      // the elevation's own line instead of toasting an error over them.
      error = err;
    }

    // The subject can have moved on — or the toast be dismissed — while the read
    // was in flight; re-adding it then would describe something else, or bring
    // back what the user just closed.
    if (
      wantedTarget(getState())?.key !== target.key ||
      !getState().toasts.toasts[TOAST_ID]
    ) {
      return;
    }

    show({ elevation, loading: false, error, sources: [...sources] });
  },
};
