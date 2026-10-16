import type { Changeset } from './actions.js';

export type DiffAction = 'create' | 'modify' | 'delete';

/** The order the actions are counted and listed in. */
export const DIFF_ACTIONS: DiffAction[] = ['create', 'modify', 'delete'];

export const DIFF_COLORS: Record<DiffAction, string> = {
  create: '#2e9e3e',
  modify: '#e08a00',
  delete: '#d00000',
};

export type ElementType = 'node' | 'way' | 'relation';

export type LatLon = [lat: number, lon: number];

export interface ElementVersion {
  version: number;
  tags: Record<string, string>;
  /** A node's position or a way's vertices; empty for a relation. */
  coords: LatLon[];
  /** A relation's members as `type/ref:role`. */
  members: string[];
}

export interface DiffElement {
  type: ElementType;
  id: number;
  action: DiffAction;
  old: ElementVersion | null;
  new: ElementVersion | null;
}

/** `node/123`: what selects the element. */
export function elementKey(element: DiffElement): string {
  return `${element.type}/${element.id}`;
}

/** The version the element ends up as, or the deleted one. */
export function currentVersion(element: DiffElement): ElementVersion | null {
  return element.new ?? element.old;
}

/** A modify whose version didn't change: only the way's nodes moved. */
export function isIndirect(element: DiffElement): boolean {
  return element.old?.version === element.new?.version;
}

/** Whether either version has tags: a node stripped of them is no vertex. */
export function isTagged(element: DiffElement): boolean {
  return (
    Object.keys(element.old?.tags ?? {}).length > 0 ||
    Object.keys(element.new?.tags ?? {}).length > 0
  );
}

/** What lists a changeset's elements: all but the untagged nodes of its ways. */
export function listedElements(diff: DiffElement[]): DiffElement[] {
  return diff.filter((element) => element.type !== 'node' || isTagged(element));
}

/** A modify that moved the element or any of its way's nodes. */
export function hasMoved(element: DiffElement): boolean {
  const a = element.old?.coords;

  const b = element.new?.coords;

  return (
    element.action === 'modify' &&
    a !== undefined &&
    b !== undefined &&
    (a.length !== b.length ||
      a.some(([lat, lon], i) => lat !== b[i][0] || lon !== b[i][1]))
  );
}

/** Whether the changeset has a place: an empty one has no bbox. */
export function hasBbox(changeset: Changeset): boolean {
  return changeset.bbox.every(Number.isFinite);
}

export function changesetCenter({ bbox: [w, s, e, n] }: Changeset): {
  lat: number;
  lon: number;
} {
  return { lat: (s + n) / 2, lon: (w + e) / 2 };
}

/** Parses an OSMCha augmented diff (`adiffs.osmcha.org/changesets/<id>.adiff`). */
export function parseAdiff(doc: Document): DiffElement[] {
  const elements: DiffElement[] = [];

  for (const action of doc.documentElement.children) {
    if (action.tagName !== 'action') {
      continue;
    }

    const type = action.getAttribute('type');

    if (type === 'create') {
      const el = action.firstElementChild;

      if (el && isElementType(el.tagName)) {
        elements.push({
          type: el.tagName,
          id: Number(el.getAttribute('id')),
          action: 'create',
          old: null,
          new: parseVersion(el),
        });
      }
    } else if (type === 'modify' || type === 'delete') {
      const oldEl = childNamed(action, 'old')?.firstElementChild;

      const newEl = childNamed(action, 'new')?.firstElementChild;

      if (oldEl && newEl && isElementType(oldEl.tagName)) {
        elements.push({
          type: oldEl.tagName,
          id: Number(oldEl.getAttribute('id')),
          action: type,
          old: parseVersion(oldEl),
          // A deletion's new version is a tombstone.
          new: type === 'delete' ? null : parseVersion(newEl),
        });
      }
    }
  }

  return elements;
}

/** A `<changeset>` element of the OSM API. */
export function parseChangeset(el: Element): Changeset {
  const attr = (name: string) => parseFloat(el.getAttribute(name) ?? '');

  const { comment, ...tags } = parseTags(el);

  return {
    userName: el.getAttribute('user') ?? '???',
    id: Number(el.getAttribute('id') ?? '???'),
    bbox: [attr('min_lon'), attr('min_lat'), attr('max_lon'), attr('max_lat')],
    closedAt: new Date(el.getAttribute('closed_at') ?? '???'),
    description: comment ?? '???',
    tags,
  };
}

function parseVersion(el: Element): ElementVersion {
  const coords: LatLon[] = [];

  const members: string[] = [];

  if (el.tagName === 'node') {
    pushCoords(coords, el);
  }

  // Direct children only: a relation's members nest their own `nd`s.
  for (const child of el.children) {
    if (child.tagName === 'nd') {
      pushCoords(coords, child);
    } else if (child.tagName === 'member') {
      const role = child.getAttribute('role');

      members.push(
        `${child.getAttribute('type')}/${child.getAttribute('ref')}${role ? `:${role}` : ''}`,
      );
    }
  }

  return {
    version: Number(el.getAttribute('version')),
    tags: parseTags(el),
    coords,
    members,
  };
}

/** The element's own `<tag k v>` children. */
function parseTags(el: Element): Record<string, string> {
  return Object.fromEntries(
    Array.from(el.children)
      .filter((child) => child.tagName === 'tag')
      .map((tag) => [tag.getAttribute('k') ?? '', tag.getAttribute('v') ?? '']),
  );
}

function pushCoords(coords: LatLon[], el: Element) {
  const lat = parseFloat(el.getAttribute('lat') ?? '');

  const lon = parseFloat(el.getAttribute('lon') ?? '');

  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    coords.push([lat, lon]);
  }
}

function childNamed(el: Element, name: string) {
  return Array.from(el.children).find((child) => child.tagName === name);
}

function isElementType(name: string): name is ElementType {
  return name === 'node' || name === 'way' || name === 'relation';
}
