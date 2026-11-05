import type { OsmFeatureId } from '@shared/types/featureId.js';

/**
 * The `select=` parameter: what has a panel of its own, one at a time. An
 * inspection counts as one, with the element of it selected after it. A tool's
 * own selection (a tracked device's `follow=`) stays out, running beside it.
 */
export type SelectParam =
  | { type: 'event'; id: string }
  | { type: 'osm-note'; id: number }
  | { type: 'changeset'; id: number; element?: string };

const ELEMENT_TYPES = new Set<string>([
  'node',
  'way',
  'relation',
] satisfies OsmFeatureId['elementType'][]);

/** As `encodeSelect` writes one, so a link reads back exactly as written. */
const positive = (s: string | undefined) =>
  s !== undefined && /^[1-9]\d*$/.test(s) ? Number(s) : undefined;

export function encodeSelect(select: SelectParam): string {
  switch (select.type) {
    case 'event':
      return `event/${select.id}`;

    case 'osm-note':
      return `osm-note/${select.id}`;

    case 'changeset':
      return select.element
        ? `changeset/${select.id}/${select.element}`
        : `changeset/${select.id}`;
  }
}

/** `null` for anything malformed, which then selects nothing. */
export function decodeSelect(raw: string): SelectParam | null {
  // A trailing slash, as a pasted link may carry, is no part of it.
  const [type, a, b, c, ...rest] = raw.replace(/\/+$/, '').split('/');

  if (rest.length) {
    return null;
  }

  switch (type) {
    case 'event':
      return a && /^[\w-]{1,16}$/.test(a) && b === undefined
        ? { type: 'event', id: a }
        : null;

    case 'osm-note': {
      const id = positive(a);

      return id && b === undefined ? { type: 'osm-note', id } : null;
    }

    case 'changeset': {
      const id = positive(a);

      if (!id) {
        return null;
      }

      if (b === undefined) {
        return { type: 'changeset', id };
      }

      const elementId = positive(c);

      return ELEMENT_TYPES.has(b) && elementId
        ? { type: 'changeset', id, element: `${b}/${elementId}` }
        : null;
    }

    default:
      return null;
  }
}

/**
 * The parameter a query asks for: `select=`, else the forms before it, which
 * old links still carry, their ids read as leniently as they were. Of those a
 * note or an event wins over `changeset=`: selecting one ends an inspection.
 */
export function selectFromQuery(
  query: Record<string, string | string[]>,
): SelectParam | null {
  const one = (key: string) => {
    const value = query[key];

    return Array.isArray(value) ? value[0] : value;
  };

  const legacyId = (key: string) => {
    const n = Number(one(key));

    return Number.isInteger(n) && n > 0 ? n : undefined;
  };

  const select = one('select');

  if (select !== undefined) {
    return decodeSelect(select);
  }

  const note = legacyId('osm-note');

  if (note !== undefined) {
    return { type: 'osm-note', id: note };
  }

  const event = one('event');

  if (event !== undefined) {
    return decodeSelect(`event/${event}`);
  }

  const changeset = legacyId('changeset');

  return changeset !== undefined ? { type: 'changeset', id: changeset } : null;
}
