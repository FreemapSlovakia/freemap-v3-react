import { fetchObjects } from '@features/objects/objectsQuery.js';
import { fetchElevations } from '@shared/elevation.js';
import z from 'zod';
import { assertKnownCategories } from '../categories.js';
import { DeliverSchema, deliverResult } from '../deliver.js';
import { defineTool } from '../tool.js';

/** Points per elevation request; the service answers 20 000 in about 2 s. */
const CHUNK = 10_000;

/** Cells one grid may hold — five requests' worth. */
const MAX_CELLS = 50_000;

/** Metres per degree of latitude; longitude is this times cos(lat). */
const M_PER_DEG = 111_320;

/** Room for a country-wide sweep for something rare, but not a continent. */
const MAX_AREA_KM2 = 200_000;

const BboxSchema = z.object({
  west: z.number().min(-180).max(180),
  south: z.number().min(-90).max(90),
  east: z.number().min(-180).max(180),
  north: z.number().min(-90).max(90),
});

function assertBbox({ west, south, east, north }: z.infer<typeof BboxSchema>) {
  if (east <= west || north <= south) {
    throw new Error(
      'The bounding box must have east > west and north > south.',
    );
  }
}

function areaKm2({ west, south, east, north }: z.infer<typeof BboxSchema>) {
  const midLat = ((south + north) / 2) * (Math.PI / 180);

  return (
    ((north - south) *
      M_PER_DEG *
      ((east - west) * M_PER_DEG * Math.cos(midLat))) /
    1e6
  );
}

/**
 * Slope and aspect of every cell, from its neighbours (one-sided at the edges).
 * Aspect is degrees clockwise from north, pointing downhill; both are `null`
 * where the cell or a neighbour it needs has no elevation.
 */
function terrainDerivatives(
  eles: (number | null)[],
  cols: number,
  rows: number,
  spacing: number,
  xSpacingAt: (row: number) => number,
) {
  const slope: (number | null)[] = [];

  const aspect: (number | null)[] = [];

  const at = (r: number, c: number) =>
    eles[
      Math.min(rows - 1, Math.max(0, r)) * cols +
        Math.min(cols - 1, Math.max(0, c))
    ];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const west = at(r, c - 1);
      const east = at(r, c + 1);
      // Row 0 is the northern edge, so the northern neighbour is the row above.
      const north = at(r - 1, c);
      const south = at(r + 1, c);

      if (west == null || east == null || north == null || south == null) {
        slope.push(null);

        aspect.push(null);

        continue;
      }

      // The span is two cells wide except at an edge, where `at` clamps onto
      // the cell itself and the difference is one-sided.
      const dx =
        (east - west) / ((c === 0 || c === cols - 1 ? 1 : 2) * xSpacingAt(r));

      // Southward, which is what the compass conversion below is written for:
      // ground rising to the north has to come out facing south.
      const dy =
        (south - north) / ((r === 0 || r === rows - 1 ? 1 : 2) * spacing);

      slope.push(
        Math.round(((Math.atan(Math.hypot(dx, dy)) * 180) / Math.PI) * 10) / 10,
      );

      if (dx === 0 && dy === 0) {
        aspect.push(null);
      } else {
        const deg = (Math.atan2(dy, -dx) * 180) / Math.PI;

        const compass = deg < 0 ? 90 - deg : deg > 90 ? 450 - deg : 90 - deg;

        aspect.push(Math.round((compass % 360) * 10) / 10);
      }
    }
  }

  return { slope, aspect };
}

export const terrainTools = [
  defineTool({
    name: 'sample-elevation-grid',
    description:
      "Reads the terrain model over a rectangle on a regular grid — one call instead of one per point. Elevations come back row-major from the north-west corner (row 0 is the northern edge), in metres, `null` where the model has no data. Ask for derivatives to get slope in degrees and aspect as degrees clockwise from north pointing downhill, computed from each cell's neighbours.",
    input: z.object({
      ...BboxSchema.shape,
      spacing: z
        .number()
        .min(1)
        .max(10_000)
        .describe('Distance between grid points, in metres.'),
      derivatives: z
        .boolean()
        .optional()
        .describe('Also return slope and aspect per cell.'),
      deliver: DeliverSchema,
    }),
    async execute(
      { west, south, east, north, spacing, derivatives, deliver },
      { store, signal },
    ) {
      assertBbox({ west, south, east, north });

      const midLat = ((south + north) / 2) * (Math.PI / 180);

      const dLat = spacing / M_PER_DEG;

      const dLon = spacing / (M_PER_DEG * Math.cos(midLat));

      const rows = Math.floor((north - south) / dLat) + 1;

      const cols = Math.floor((east - west) / dLon) + 1;

      if (rows * cols > MAX_CELLS) {
        throw new Error(
          `That is ${rows * cols} points; at most ${MAX_CELLS} fit in one grid. Widen the spacing or shrink the area.`,
        );
      }

      const points: [number, number][] = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          points.push([north - r * dLat, west + c * dLon]);
        }
      }

      const eles: (number | null)[] = [];

      for (let i = 0; i < points.length; i += CHUNK) {
        // Five requests can be in this loop's future; the agent giving up must
        // not buy all of them.
        if (signal?.aborted) {
          throw new DOMException('aborted', 'AbortError');
        }

        const batch = await fetchElevations(
          points.slice(i, i + CHUNK),
          store.getState,
        );

        for (const ele of batch) {
          eles.push(ele === null ? null : Math.round(ele * 10) / 10);
        }
      }

      return deliverResult(
        {
          rows,
          cols,
          spacing,
          // What the grid actually spans, which the rounding down to whole
          // cells leaves inside the box asked for.
          north,
          west,
          south: north - (rows - 1) * dLat,
          east: west + (cols - 1) * dLon,
          elevations: eles,
          ...(derivatives
            ? terrainDerivatives(eles, cols, rows, spacing, (row) => {
                // Constant degree steps, so a row further from the equator is
                // narrower on the ground than the nominal spacing.
                const lat = (north - row * dLat) * (Math.PI / 180);

                return dLon * M_PER_DEG * Math.cos(lat);
              })
            : {}),
        },
        deliver,
        'freemap-elevation-grid',
        { rows, cols, spacing },
      );
    },
  }),

  defineTool({
    name: 'find-objects-in-area',
    description:
      'Finds POIs of the given categories (from list-object-categories) inside a bounding box, wherever it is — unlike show-objects, which is bound to what the map shows and draws what it finds. This one only reports back; it leaves the map alone.',
    input: z.object({
      categories: z.array(z.string()).min(1),
      ...BboxSchema.shape,
      limit: z
        .number()
        .int()
        .min(1)
        .max(1000)
        .optional()
        .describe('How many objects to return at most; 200 by default.'),
      deliver: DeliverSchema,
    }),
    async execute(
      { categories, west, south, east, north, limit = 200, deliver },
      { store },
    ) {
      assertBbox({ west, south, east, north });

      await assertKnownCategories(categories, store.getState().l10n.language);

      const area = areaKm2({ west, south, east, north });

      if (area > MAX_AREA_KM2) {
        throw new Error(
          `That box is about ${Math.round(area)} km²; ${MAX_AREA_KM2} km² is the most one query may cover.`,
        );
      }

      const { objects, truncated } = await fetchObjects(
        {
          active: categories,
          bounds: { south, west, north, east },
          limit,
        },
        { getState: store.getState },
      );

      const complete = !truncated;

      return deliverResult(
        {
          objects: objects.map((object) => ({
            name: object.tags['name'],
            lat: object.coords.lat,
            lon: object.coords.lon,
            tags: object.tags,
          })),
          complete,
        },
        deliver,
        'freemap-objects',
        { count: objects.length, complete },
      );
    },
  }),
];
