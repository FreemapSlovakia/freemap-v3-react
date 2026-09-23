import type { AttributionDef } from '@shared/mapDefinitions.js';
import { expandCode, splitAttributionHeader } from '@shared/tileAttribution.js';
import { loadTileLicenses } from '@shared/tileLicenses.js';

export type ExportCredits = {
  /** The datasets the render drew from. The caller puts its own around these. */
  datasets: AttributionDef[];
  /** Codes the dictionary had no entry for; shown rather than dropped. */
  unresolved: string[];
  /**
   * Whether the render named its datasets at all. A renderer too old to report
   * them, or a header CORS keeps from us, is not the same as a render that drew
   * from nothing — and the difference has to be said rather than shown as a
   * confident short list.
   */
  reported: boolean;
};

/** Key a code names a global fallback dataset by, rather than a region's own. */
const FALLBACK_KEY = '_';

/**
 * Where a dataset sits in the list: the ones that answered for somewhere, then
 * the global models that filled what those did not cover. The renderer orders
 * the burnt-in line the same way — see its `decorations::rank`.
 */
function rank(code: string): number {
  return code.endsWith(`:${FALLBACK_KEY}`) ? 1 : 0;
}

/**
 * The datasets a render reports having drawn from, in the order the renderer
 * draws them: the ones that answered for somewhere, then the global models that
 * filled the rest. OpenStreetMap is not among them — the caller credits it in
 * the app's own words, as it does this map's own credit.
 *
 * A dictionary that cannot be fetched leaves every code unresolved rather than
 * failing: the file is already rendered, and naming the codes still tells the
 * user something.
 */
export async function resolveExportCredits(
  header: string | null,
): Promise<ExportCredits> {
  const reported = header !== null;

  const codes = splitAttributionHeader(header ?? '')
    .map((code) => expandCode(code) ?? code)
    // Credited by the caller instead, in the app's own words.
    .filter((code) => code !== 'osm');

  if (codes.length === 0) {
    return { datasets: [], unresolved: [], reported };
  }

  const licenses = await withinTimeout(loadTileLicenses());

  if (!licenses) {
    return { datasets: [], unresolved: codes, reported };
  }

  const unresolved: string[] = [];

  const named: { def: AttributionDef; rank: number }[] = [];

  for (const code of codes) {
    const entries = licenses[code];

    if (!entries) {
      unresolved.push(code);

      continue;
    }

    for (const { title, url } of entries) {
      // One dataset can be credited under several codes — shading and contours
      // off the same DEM — and must be named once, under its strongest claim.
      const held = named.find(({ def }) => def.name === title);

      if (held) {
        held.rank = Math.min(held.rank, rank(code));
      } else {
        named.push({
          def: { type: 'data', name: title, url },
          rank: rank(code),
        });
      }
    }
  }

  named.sort(
    (a, b) =>
      a.rank - b.rank ||
      // Fixed locale, and accents and case folded away: the renderer sorts the
      // same titles with its own fold, and a list read beside the line burnt
      // into the image has to come out in the same order.
      (a.def.name ?? '').localeCompare(b.def.name ?? '', 'en', {
        sensitivity: 'base',
      }),
  );

  return { datasets: named.map(({ def }) => def), unresolved, reported };
}

/**
 * The dictionary is worth waiting for, but not indefinitely: the file is
 * already rendered and in hand by the time this runs, and `loadTileLicenses`
 * takes no signal — a stalled fetch would otherwise leave a finished export on
 * its spinner with nothing left to cancel.
 */
function withinTimeout<T>(pending: Promise<T | null>): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout>;

  return Promise.race([
    pending,
    new Promise<null>((resolve) => {
      timer = setTimeout(() => resolve(null), 10_000);
    }),
  ]).finally(() => clearTimeout(timer));
}
