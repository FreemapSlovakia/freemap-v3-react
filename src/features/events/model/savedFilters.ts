import z from 'zod';
import { type EventsFilter, type Range, WITHIN } from './filter.js';

const ApiRangeSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
});

/** A saved filter as the API keeps it: meters and seconds, no fixed dates. */
const ApiFilterSchema = z.object({
  within: z.enum(WITHIN).optional(),
  near: z
    .object({ lat: z.number(), lon: z.number(), radius: z.number() })
    .optional(),
  transport: z.string().array().optional(),
  distance: ApiRangeSchema.optional(),
  duration: ApiRangeSchema.optional(),
  ascent: ApiRangeSchema.optional(),
  difficulty: z.string().array().optional(),
  dogs: z.boolean().optional(),
  children: z.boolean().optional(),
  imported: z.boolean().optional(),
  unsaid: z.boolean().optional(),
});

type ApiFilter = z.infer<typeof ApiFilterSchema>;

export const SavedEventFilterSchema = z.object({
  id: z.number(),
  name: z.string(),
  filter: ApiFilterSchema,
  notify: z.boolean(),
});

export type SavedEventFilter = z.infer<typeof SavedEventFilterSchema>;

/** Saved filters one user may have; the API's limit. */
export const MAX_SAVED_FILTERS = 20;

const defined = <T extends object>(o: T): T =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;

/** A range's ends mapped; none when neither end is set. */
function mapRange(
  range: Range | undefined,
  map: (n: number) => number,
): Range | undefined {
  const scaled = defined({
    min: range?.min === undefined ? undefined : map(range.min),
    max: range?.max === undefined ? undefined : map(range.max),
  });

  return scaled.min === undefined && scaled.max === undefined
    ? undefined
    : scaled;
}

// TODO a finer value typed than whole meters or seconds no longer equals its saved filter.
const toUnits = (factor: number) => (n: number) => Math.round(n * factor);

// Divided, not times the reciprocal: 2300 × 0.001 is 2.3000000000000003.
const fromUnits = (divisor: number) => (n: number) => n / divisor;

/** What the API takes as a transport; a link may carry anything. */
const TRANSPORT_RE = /^[a-z0-9-]{1,20}$/;

/** The filter to save; fixed dates are dropped. */
export function toSavedFilter(f: EventsFilter): ApiFilter {
  const transport = f.transport?.filter((t) => TRANSPORT_RE.test(t));

  return defined({
    within: f.within,
    near: f.near,
    transport: transport?.length ? transport : undefined,
    distance: mapRange(f.distance, toUnits(1000)),
    duration: mapRange(f.duration, toUnits(3600)),
    ascent: mapRange(f.ascent, toUnits(1)),
    difficulty: f.difficulty?.length ? f.difficulty : undefined,
    dogs: f.dogs,
    children: f.children,
    imported: f.imported,
    unsaid: f.unsaid || undefined,
  });
}

/** A saved filter as the layer applies it. */
export function fromSavedFilter(s: ApiFilter): EventsFilter {
  return defined({
    within: s.within,
    near: s.near,
    transport: s.transport?.length ? s.transport : undefined,
    distance: mapRange(s.distance, fromUnits(1000)),
    duration: mapRange(s.duration, fromUnits(3600)),
    ascent: mapRange(s.ascent, fromUnits(1)),
    difficulty: s.difficulty?.length ? s.difficulty : undefined,
    dogs: s.dogs,
    children: s.children,
    imported: s.imported,
    unsaid: s.unsaid || undefined,
  });
}
