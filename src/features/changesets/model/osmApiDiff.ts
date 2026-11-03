import { HttpError, httpRequest } from '@app/httpRequest.js';
import type { RootState } from '@app/store/store.js';
import type { CancelTriggers } from '@shared/cancelRegister.js';
import { chunks } from '@shared/chunks.js';
import { createLimit, type Limit } from '@shared/limit.js';
import { osmElementTypes } from '@shared/types/featureId.js';
import {
  type DiffAction,
  type DiffElement,
  type ElementType,
  type ElementVersion,
  elementKey,
  isElementType,
  type LatLon,
  OSM_API,
  parseVersion,
} from './changesetDiff.js';

/** What cancels the rebuild's requests, and the one queue they all share. */
type Cancel = CancelTriggers & { getState: () => RootState; limit: Limit };

/**
 * Elements to fetch past which a changeset isn't rebuilt, about 100 requests:
 * a big import would flood the OSM API. Its own cap, 10,000 changes, is no
 * guard, as each changed way brings its untouched nodes along.
 */
const MAX_FETCHED = 25_000;

/** A changeset that would take more than `MAX_FETCHED` elements to rebuild. */
export class DiffTooBigError extends Error {
  constructor() {
    super('Changeset too big to rebuild from the OSM API');

    this.name = 'DiffTooBigError';
  }
}

const nodeRefs = (el: Element) =>
  Array.from(el.children).flatMap((child) =>
    child.tagName === 'nd' ? [child.getAttribute('ref') ?? ''] : [],
  );

const PLURAL: Record<ElementType, string> = {
  node: 'nodes',
  way: 'ways',
  relation: 'relations',
};

/** Ids per multi-fetch, keeping its URL well within server limits. */
const CHUNK = 250;

/** Requests in flight at once over the whole rebuild, sparing the API's rate limit. */
const PARALLEL = 4;

function fetchXml(
  url: string,
  { limit, ...cancel }: Cancel,
): Promise<Document> {
  return limit(
    async () => {
      const res = await httpRequest({ ...cancel, url });

      return new DOMParser().parseFromString(await res.text(), 'text/xml');
    },
    () => cancel.statePredicate?.(cancel.getState()) ?? false,
  );
}

/**
 * `null` where the API refuses it: a redacted version (403), or an element
 * missing (404) or deleted since (410).
 */
async function fetchUnlessRefused(
  url: string,
  cancel: Cancel,
): Promise<Document | null> {
  try {
    return await fetchXml(url, cancel);
  } catch (err) {
    if (err instanceof HttpError && [403, 404, 410].includes(err.status)) {
      return null;
    }

    throw err;
  }
}

const elementsOf = (doc: Document | null, type: ElementType) =>
  doc
    ? Array.from(doc.documentElement.children).filter(
        (el) => el.tagName === type,
      )
    : [];

/**
 * By `id` or `idvN`. A missing one is left out by the API; a run it refuses
 * whole is halved until the refused ones alone are left out, a few requests
 * each rather than one per element of the run.
 */
async function fetchRun(
  type: ElementType,
  refs: string[],
  cancel: Cancel,
): Promise<Element[]> {
  // A multi-fetch even for one: it returns a deleted element, as invisible,
  // where `/node/<id>` answers 410.
  const doc = await fetchUnlessRefused(
    `${OSM_API}/${PLURAL[type]}?${PLURAL[type]}=${refs.join(',')}`,
    cancel,
  );

  if (doc || refs.length === 1) {
    return elementsOf(doc, type);
  }

  const half = Math.ceil(refs.length / 2);

  return (
    await Promise.all([
      fetchRun(type, refs.slice(0, half), cancel),
      fetchRun(type, refs.slice(half), cancel),
    ])
  ).flat();
}

async function fetchElements(
  type: ElementType,
  refs: string[],
  cancel: Cancel,
): Promise<Element[]> {
  return (
    await Promise.all(
      chunks(refs, CHUNK).map((chunk) => fetchRun(type, chunk, cancel)),
    )
  ).flat();
}

type Change = {
  type: ElementType;
  id: number;
  action: DiffAction;
  /** Its version before the changeset, for what existed. */
  previous: number | null;
  last: Element;
};

const key = (type: ElementType, id: number | string) =>
  elementKey({ type, id });

/**
 * The changeset's diff rebuilt from the OSM API, where OSMCha has none. Ways'
 * nodes the changeset didn't touch are where they are now, and ways changed
 * only by their nodes moving are left out.
 */
export async function fetchOsmApiDiff(
  changesetId: number,
  triggers: Omit<Cancel, 'limit'>,
): Promise<DiffElement[]> {
  const cancel: Cancel = { ...triggers, limit: createLimit(PARALLEL) };

  const download = await fetchXml(
    `${OSM_API}/changeset/${changesetId}/download`,
    cancel,
  );

  // One element may change several times within a changeset.
  const changes = new Map<string, Change>();

  for (const block of download.documentElement.children) {
    const action = block.tagName;

    if (action !== 'create' && action !== 'modify' && action !== 'delete') {
      continue;
    }

    for (const el of block.children) {
      if (!isElementType(el.tagName)) {
        continue;
      }

      const id = Number(el.getAttribute('id'));

      const change = changes.get(key(el.tagName, id));

      const version = Number(el.getAttribute('version'));

      if (change) {
        // By version, not by the order the download lists them in: deleted if
        // its last one is, else created if any one is.
        if (version >= Number(change.last.getAttribute('version'))) {
          change.last = el;

          if (action === 'delete' || change.action !== 'create') {
            change.action = action;
          }
        }

        if (action === 'create') {
          change.previous = null;

          if (change.action !== 'delete') {
            change.action = 'create';
          }
        } else if (change.previous !== null) {
          change.previous = Math.min(change.previous, version - 1);
        }
      } else {
        changes.set(key(el.tagName, id), {
          type: el.tagName,
          id,
          action,
          previous: action === 'create' ? null : version - 1,
          last: el,
        });
      }
    }
  }

  const list = [...changes.values()].filter(
    // Created and deleted again: nothing to show.
    (change) => change.previous !== null || change.action !== 'delete',
  );

  // What it would fetch: the previous versions, and the untouched nodes of the
  // ways as they end up (their previous versions add a few more).
  const toFetch =
    list.filter((change) => change.previous !== null).length +
    new Set(
      list
        .filter((change) => change.type === 'way')
        .flatMap((change) => nodeRefs(change.last))
        .filter((ref) => !changes.has(key('node', ref))),
    ).size;

  if (toFetch > MAX_FETCHED) {
    throw new DiffTooBigError();
  }

  const previous = new Map<string, Element>();

  await Promise.all(
    osmElementTypes.map(async (type) => {
      const refs = list.flatMap((change) =>
        change.type === type && change.previous !== null
          ? [`${change.id}v${change.previous}`]
          : [],
      );

      for (const el of await fetchElements(type, refs, cancel)) {
        previous.set(key(type, el.getAttribute('id') ?? ''), el);
      }
    }),
  );

  const position = (el: Element | undefined): LatLon | undefined => {
    const lat = parseFloat(el?.getAttribute('lat') ?? '');

    const lon = parseFloat(el?.getAttribute('lon') ?? '');

    return Number.isFinite(lat) && Number.isFinite(lon)
      ? [lat, lon]
      : undefined;
  };

  const changedNode = (ref: string) => {
    const change = changes.get(key('node', ref));

    return change?.action === 'delete' ? undefined : change?.last;
  };

  // The ways' other nodes, as they are now.
  const wayEls = list
    .filter((change) => change.type === 'way')
    .flatMap((change) => {
      const before = previous.get(key('way', change.id));

      return before ? [change.last, before] : [change.last];
    });

  const untouched = [
    ...new Set(
      wayEls.flatMap(nodeRefs).filter((ref) => !changes.has(key('node', ref))),
    ),
  ];

  const current = new Map(
    (await fetchElements('node', untouched, cancel)).map((el) => [
      el.getAttribute('id') ?? '',
      el,
    ]),
  );

  // Deleted since, a node has no position; its last visible version stands in.
  const deleted = [...current.values()].flatMap((el) =>
    el.getAttribute('visible') === 'false'
      ? [`${el.getAttribute('id')}v${Number(el.getAttribute('version')) - 1}`]
      : [],
  );

  for (const el of await fetchElements('node', deleted, cancel)) {
    current.set(el.getAttribute('id') ?? '', el);
  }

  const version = (
    el: Element,
    nodeAt: (ref: string) => Element | undefined,
  ): ElementVersion => {
    const parsed = parseVersion(el);

    return el.tagName === 'way'
      ? {
          ...parsed,
          coords: nodeRefs(el).flatMap((ref) => {
            const pos = position(nodeAt(ref));

            return pos ? [pos] : [];
          }),
        }
      : parsed;
  };

  return list.map((change): DiffElement => {
    const before = previous.get(key(change.type, change.id));

    return {
      type: change.type,
      id: change.id,
      action: change.action,
      old: before
        ? version(
            before,
            (ref) => previous.get(key('node', ref)) ?? current.get(ref),
          )
        : null,
      new:
        change.action === 'delete'
          ? null
          : version(change.last, (ref) => changedNode(ref) ?? current.get(ref)),
    };
  });
}
