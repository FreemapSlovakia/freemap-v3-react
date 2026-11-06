import {
  isElementType,
  osmIdKey,
  osmIdOf,
} from '@features/changesets/model/changesetDiff.js';
import type { OsmFeatureId } from '@shared/types/featureId.js';

/**
 * The `panel=` parameter: what has a panel of its own, one at a time. An
 * inspection counts as one, with the element of it selected after it. A tool's
 * own selection (a tracked device's `follow=`) stays out: it runs beside an
 * inspection, while any of these, being the selection, takes its place.
 */
export type PanelParam =
  | { type: 'event'; id: string }
  | { type: 'osm-note'; id: number }
  | { type: 'changeset'; id: number; element?: string }
  /** An OSM element as a search result, kept or only looked at. */
  | { type: 'osm'; id: OsmFeatureId }
  /** A POI of the objects layer, selected once the layer has it. */
  | { type: 'object'; id: OsmFeatureId }
  /** A Wikipedia article, `<lang>:<title>`; the title may hold a `/`. */
  | { type: 'wiki'; id: string };

/** As `encodePanel` writes one, so a link reads back exactly as written. */
const positive = (s: string | undefined) =>
  s !== undefined && /^[1-9]\d*$/.test(s) ? Number(s) : undefined;

export function encodePanel(panel: PanelParam): string {
  switch (panel.type) {
    case 'event':
      return `event/${panel.id}`;

    case 'osm-note':
      return `osm-note/${panel.id}`;

    case 'changeset':
      return panel.element
        ? `changeset/${panel.id}/${panel.element}`
        : `changeset/${panel.id}`;

    case 'osm':
      return `osm-${panel.id.elementType}/${panel.id.id}`;

    case 'object':
      return `object/${panel.id.elementType}/${panel.id.id}`;

    case 'wiki':
      return `wiki/${panel.id}`;
  }
}

/** `<lang>:<title>`, as a marker names its article — the tag's, any case. */
const wikiId = (raw: string) => (/^[^:/]+:.+/.test(raw) ? raw : undefined);

const osmId = (
  elementType: string | undefined,
  id: string | undefined,
): OsmFeatureId | undefined => {
  const n = positive(id);

  return elementType !== undefined && isElementType(elementType) && n
    ? osmIdOf({ type: elementType, id: n })
    : undefined;
};

/** `null` for anything malformed, which then selects nothing. */
export function decodePanel(raw: string): PanelParam | null {
  // A title is the rest, slashes and all.
  if (raw.startsWith('wiki/')) {
    const id = wikiId(raw.slice('wiki/'.length));

    return id ? { type: 'wiki', id } : null;
  }

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

      const element = osmId(b, c);

      return element
        ? { type: 'changeset', id, element: osmIdKey(element) }
        : null;
    }

    case 'object': {
      const id = c === undefined ? osmId(a, b) : undefined;

      return id ? { type: 'object', id } : null;
    }

    default: {
      // `osm-node/<id>`, as the `osm-node=` of a kept one reads.
      const id =
        type?.startsWith('osm-') && b === undefined
          ? osmId(type.slice(4), a)
          : undefined;

      return id ? { type: 'osm', id } : null;
    }
  }
}

/**
 * The parameter a query asks for: `panel=`, else the older forms links still
 * carry, their ids read by `Number()`. Of those a note or an event wins over
 * `changeset=`: selecting one ends an inspection.
 */
export function panelFromQuery(
  query: Record<string, string | string[]>,
): PanelParam | null {
  const one = (key: string) => {
    const value = query[key];

    return Array.isArray(value) ? value[0] : value;
  };

  const legacyId = (key: string) => {
    const n = Number(one(key));

    return Number.isInteger(n) && n > 0 ? n : undefined;
  };

  const panel = one('panel');

  if (panel !== undefined) {
    return decodePanel(panel);
  }

  const note = legacyId('osm-note');

  if (note !== undefined) {
    return { type: 'osm-note', id: note };
  }

  const event = one('event');

  if (event !== undefined) {
    return decodePanel(`event/${event}`);
  }

  // `show=wiki/<lang>:<title>` is read as `panel=wiki/…`, after a note or an
  // event in the same link.
  const show = one('show');

  if (show?.startsWith('wiki/')) {
    return decodePanel(show);
  }

  const changeset = legacyId('changeset');

  return changeset !== undefined ? { type: 'changeset', id: changeset } : null;
}
