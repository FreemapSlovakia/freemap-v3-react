import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import type { ElevationReading } from '@features/elevationChart/components/ElevationValue.js';
import { isPremium } from '@features/premium/premium.js';
import {
  resultCoords,
  resultExtentM,
} from '@features/search/model/resultUtils.js';
import { toastsAdd, toastsRemove } from '@features/toasts/model/actions.js';
import {
  creditedAttributions,
  fetchElevations,
  newElevationCredits,
} from '@shared/elevation.js';
import { isAbortError } from '@shared/isAbortError.js';
import { loadTerrainLicenses } from '@shared/tileLicenses.js';
import type { LatLon } from '@shared/types/common.js';
import { OsmFeatureIdSchema } from '@shared/types/featureId.js';
import { loadObjectsMessages } from '../translations/loadObjectsMessages.js';
import {
  objectsRouteClear,
  objectsTerrainMark,
  setDetailsShown,
  type TerrainMarkKind,
} from './actions.js';
import {
  type DetailsTarget,
  detailsTarget,
  wantedKey,
  wantedTarget,
} from './selectors.js';
import {
  fetchTerrainFacts,
  hasTerrainValues,
  isNational,
  type TerrainFacts,
  type TerrainFactsKind,
  terrainCredits,
  terrainFactsKind,
} from './terrainFacts.js';

const TOAST_ID = 'mapDetails.tags';

/**
 * A node's terrain facts (`null` where the service holds none; values may still
 * be missing, see `hasTerrainValues`) and its `ele` as a reading.
 */
type FactsEntry = {
  facts: TerrainFacts | null;
  reading: ElevationReading | null;
};

/**
 * The last node's read, in flight or done: the same node again — a search
 * result upgraded to the full element — takes it over rather than asking anew.
 */
type FactsSlot = {
  id: number;
  kind: TerrainFactsKind;
  /** What the read is cancelled by changing: a slot read under another is dead. */
  selection: string;
  promise: Promise<FactsEntry | null>;
  entry?: FactsEntry;
};

let factsCache: FactsSlot | null = null;

const selectionKey = (state: RootState) => JSON.stringify(state.main.selection);

function factsFor(
  kind: TerrainFactsKind,
  id: number,
  getState: () => RootState,
): FactsSlot {
  const selection = selectionKey(getState());

  if (
    factsCache?.id === id &&
    factsCache.kind === kind &&
    (factsCache.entry || factsCache.selection === selection)
  ) {
    return factsCache;
  }

  const slot: FactsSlot = {
    id,
    kind,
    selection,
    promise: readFacts(kind, id, getState).then((entry) => {
      if (entry) {
        slot.entry = entry;
      } else if (factsCache === slot) {
        factsCache = null;
      }

      return entry;
    }),
  };

  factsCache = slot;

  return slot;
}

/** `null` where the read failed or was cancelled. */
async function readFacts(
  kind: TerrainFactsKind,
  id: number,
  getState: () => RootState,
): Promise<FactsEntry | null> {
  // Alongside the facts, and only to name the credits: missing, codes stand in.
  const licenses = loadTerrainLicenses().catch(() => null);

  let facts;

  try {
    facts = await fetchTerrainFacts(kind, id, getState, {
      // By the selection, which the upgrade leaves alone, unlike the toast key.
      stateChangePredicate: selectionKey,
    });
  } catch (err) {
    // A supplement to the details, which stand without it.
    if (!isAbortError(err)) {
      console.error(err);
    }

    return null;
  }

  return {
    facts,
    reading:
      facts?.ele != null
        ? {
            elevation: facts.ele,
            loading: false,
            sources: facts.eleSources,
            attributions: terrainCredits(facts.eleSources, await licenses),
            national: isNational(facts.eleSources),
          }
        : null,
  };
}

/** The peak or saddle node a target is, if any. */
function factsNode(
  target: DetailsTarget | null,
): { kind: TerrainFactsKind; id: number } | null {
  if (!target) {
    return null;
  }

  const id = OsmFeatureIdSchema.safeParse(target.result.id);

  if (!id.success || id.data.elementType !== 'node') {
    return null;
  }

  const kind = terrainFactsKind(target.result.geojson.properties ?? {});

  return kind && { kind, id: id.data.id };
}

/**
 * How far an object may reach — its bbox diagonal — and still have one
 * elevation. A street, a railway route or a whole forest has none, so past this
 * the readout would name an arbitrary point rather than the object.
 */
const MAX_ELEVATION_EXTENT_M = 200;

/** Bumped by every run, so an older one's late reads can't re-show the toast. */
let runSeq = 0;

/**
 * The route and the marks belong to the selected peak or saddle, whether or not
 * its details are open: closing them to look at the route keeps it, and
 * anything that selects something else takes them off.
 */
export const objectsTerrainOverlayProcessor: Processor = {
  stateChangePredicate: (state) => state.main.selection,
  handle: ({ getState, dispatch }) => {
    const state = getState();

    const ownerId = factsNode(detailsTarget(state))?.id ?? null;

    if (state.objects.route && state.objects.route.osmId !== ownerId) {
      dispatch(objectsRouteClear());
    }

    for (const [kind, mark] of Object.entries(state.objects.marks)) {
      if (mark.osmId !== ownerId) {
        dispatch(
          objectsTerrainMark({ kind: kind as TerrainMarkKind, mark: null }),
        );
      }
    }
  },
};

/**
 * Keeps the details toast a view of the selection, instead of something each
 * place that selects a feature has to push. It therefore follows the selection
 * the way a selection toolbar does, and the toast's × dismisses it for as long
 * as that feature stays selected (through `onClose`).
 */
export const objectDetailsProcessor: Processor = {
  // Edge-triggered: only a changed subject opens the toast. Re-opening it
  // merely because it is gone would make its × a no-op, and re-adding an
  // unchanged one would throw it back to the top of the toast column.
  stateChangePredicate: wantedKey,
  handle: async ({ getState, dispatch }) => {
    const state = getState();

    const target = wantedTarget(state);

    const run = ++runSeq;

    if (!target) {
      if (state.toasts.toasts[TOAST_ID]) {
        dispatch(toastsRemove(TOAST_ID));
      }

      return;
    }

    let elevation: ElevationReading;

    let terrain: TerrainFacts | null = null;

    const show = () =>
      dispatch(
        toastsAdd({
          id: TOAST_ID,
          messageKey: 'detail',
          messageLoader: loadObjectsMessages,
          messageParams: {
            result: target.result,
            elevation,
            terrain,
            atTerrainPoint: serviceWon,
          },
          onClose: setDetailsShown(false),
          style: 'info',
        }),
      );

    // Only once the subject is known to have changed — walking the geometry of
    // every selected feature on every dispatched action would be work for
    // nothing.
    const coords = resultCoords(target.result);

    const readElevation =
      coords !== null &&
      (resultExtentM(target.result) ?? Infinity) <= MAX_ELEVATION_EXTENT_M;

    const node = factsNode(target);

    const slot = node && factsFor(node.kind, node.id, getState);

    // A peak or saddle node is often off its summit or saddle, so the service's
    // reading there wins where it has one; the API's is at the node. Not off
    // GEDTM30 for premium, whose API reading at the node is national.
    const wins = (reading: ElevationReading | null | undefined) =>
      reading && (reading.national || !isPremium(getState().auth.user))
        ? reading
        : null;

    const cachedReading = wins(slot?.entry?.reading);

    let serviceWon = Boolean(cachedReading);

    // The details show at once; the elevation and the terrain facts read
    // separately and land in the same toast, so a slow API doesn't hold the
    // tags back.
    elevation = cachedReading ?? {
      elevation: undefined,
      loading: readElevation,
      sources: [],
      attributions: [],
    };

    terrain = slot?.entry?.facts ?? null;

    show();

    if (cachedReading) {
      return;
    }

    // Not where the subject moved on, a newer run took over or the toast was
    // dismissed since: checked right before re-adding, as anything may have run.
    const update = () => {
      if (
        run === runSeq &&
        wantedKey(getState()) === target.key &&
        getState().toasts.toasts[TOAST_ID]
      ) {
        show();
      }
    };

    // Both at once: the service has no timeout, so the API's value shows
    // meanwhile and gives way to the service's when that lands.
    await Promise.all([
      readElevation &&
        readElevationReading(coords).then((reading) => {
          if (reading && !serviceWon) {
            elevation = reading;

            update();
          }
        }),
      slot &&
        !slot.entry &&
        slot.promise.then((entry) => {
          if (!entry) {
            return;
          }

          terrain = entry.facts;

          const reading = wins(entry.reading);

          if (reading) {
            serviceWon = true;

            elevation = reading;
          }

          if (
            serviceWon ||
            (entry.facts !== null && hasTerrainValues(entry.facts))
          ) {
            update();
          }
        }),
    ]);

    /** `undefined` where the read was aborted. */
    async function readElevationReading(
      coords: LatLon,
    ): Promise<ElevationReading | undefined> {
      const credits = newElevationCredits();

      let value: number | null | undefined;

      let error: unknown;

      try {
        [value] = await fetchElevations(
          [[coords.lat, coords.lon]],
          getState,
          // By the subject, not the actions that change it: a reload restores
          // the same pin twice, and an action-cancelled read would leave the
          // spinner up, this edge-triggered handler starting nothing in its place.
          { stateChangePredicate: wantedKey },
          credits,
        );
      } catch (err) {
        // An abort means something newer is already on its way (or the
        // features were cleared) — leave the toast to whatever caused it.
        if (isAbortError(err)) {
          return undefined;
        }

        // The details themselves stand without it, so the failure is answered
        // in the elevation's own line instead of toasting an error over them.
        error = err;
      }

      return {
        elevation: value,
        loading: false,
        error,
        sources: [...credits.sources],
        attributions: creditedAttributions(credits),
      };
    }
  },
};
