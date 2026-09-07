import { clear, createStore, del, getMany, keys, set } from 'idb-keyval';
import z from 'zod';
import {
  type BlockedReason,
  type MapData,
  type MapMeta,
  MapMetaSchema,
} from './model/actions.js';
import { MapsLoadResponseSchema } from './model/mapDocumentSchema.js';

// Its own database, next to the working copies and the offline copies: this is
// work the user asked to save that hasn't reached the server yet, so purging
// either of the other two must never touch it.
const store = createStore('fm-myMaps-outbox', 'kv');

// The head is read on every mirror refresh, so the (potentially large) document
// lives under its own key and is deserialized only when the save is pushed.
const HEAD_PREFIX = 'head:';

const BODY_PREFIX = 'body:';

const HeadSchema = z.object({
  /**
   * The map as it was when the save was queued. Its `modifiedAt` is the
   * `If-Unmodified-Since` token the replay sends, so it stays the server's
   * value however often the local copy is edited.
   */
  meta: MapMetaSchema,
  name: z.string().optional(),
  writers: z.array(z.number()).optional(),
  /** Also the token that tells one queued save from the one that superseded it. */
  queuedAt: z.number(),
  blocked: z.enum(['conflict', 'forbidden', 'gone', 'unreadable']).optional(),
});

const BodySchema = MapsLoadResponseSchema.shape.data;

export type PendingHead = z.infer<typeof HeadSchema>;

export type PendingSave = PendingHead & { data: MapData };

/**
 * The map as the queued save leaves it: its meta with the rename the save
 * carries applied. `modifiedAt` stays the server's — it is the precondition the
 * replay sends, and the rename has not reached the server either.
 *
 * Everything that answers with a queued save has to go through this, or the map
 * comes back under the name it was saved away from.
 */
export function pendingMeta(head: PendingHead): MapMeta {
  return {
    ...head.meta,
    ...(head.name === undefined ? {} : { name: head.name }),
    ...(head.writers === undefined ? {} : { writers: head.writers }),
  };
}

function idsOf(ks: IDBValidKey[], prefix: string): string[] {
  return ks
    .filter((k): k is string => typeof k === 'string' && k.startsWith(prefix))
    .map((k) => k.slice(prefix.length));
}

/** Ids of maps with a save waiting to be pushed. */
export async function getPendingIds(): Promise<string[]> {
  return idsOf(await keys(store), HEAD_PREFIX);
}

export async function getPendingCount(): Promise<number> {
  return (await getPendingIds()).length;
}

/**
 * Every queued save's head, without its document. Drives the list badges and the
 * replay order, so it must stay cheap — see the key split above.
 */
export async function getPendingHeads(): Promise<
  (PendingHead & { mapId: string })[]
> {
  const ids = await getPendingIds();

  const raws = await getMany(
    ids.map((id) => HEAD_PREFIX + id),
    store,
  );

  const heads: (PendingHead & { mapId: string })[] = [];

  for (const [i, mapId] of ids.entries()) {
    const parsed = HeadSchema.safeParse(raws[i]);

    if (parsed.success) {
      heads.push({ ...parsed.data, mapId });
    } else {
      // The head is what says what the save may be sent against and what to
      // call it, so without one the document can be neither sent nor put in
      // front of the user — there is nothing left to keep, and left in place it
      // would count as queued forever. (An unreadable *document* under a good
      // head is a different case: that one is blocked and shown.)
      console.warn(`Dropping unreadable queued save ${mapId}:`, parsed.error);

      await deletePendingSave(mapId);
    }
  }

  return heads;
}

/**
 * Whether a save is queued for this map, without reading it. Tells a head that
 * was settled elsewhere from one whose document won't parse — which
 * `getPendingSave` answers `undefined` for either way.
 */
export async function hasPendingSave(mapId: string): Promise<boolean> {
  const [rawHead] = await getMany([HEAD_PREFIX + mapId], store);

  return rawHead !== undefined;
}

/** A queued save's head alone — its document is not read. */
export async function getPendingHead(
  mapId: string,
): Promise<PendingHead | undefined> {
  const [rawHead] = await getMany([HEAD_PREFIX + mapId], store);

  const parsed = HeadSchema.safeParse(rawHead);

  return parsed.success ? parsed.data : undefined;
}

export async function getPendingSave(
  mapId: string,
): Promise<PendingSave | undefined> {
  const [rawHead, rawBody] = await getMany(
    [HEAD_PREFIX + mapId, BODY_PREFIX + mapId],
    store,
  );

  if (rawHead === undefined || rawBody === undefined) {
    return undefined;
  }

  const head = HeadSchema.safeParse(rawHead);

  const body = BodySchema.safeParse(rawBody);

  if (!head.success || !body.success) {
    console.warn(
      `Discarding unreadable queued save ${mapId}:`,
      head.success ? body.error : head.error,
    );

    return undefined;
  }

  return { ...head.data, data: body.data };
}

/**
 * Queues a save, superseding whatever was queued for the same map: the request
 * is a whole-document PATCH, so the newer state simply stands for both.
 */
export async function putPendingSave({
  data,
  ...head
}: PendingSave): Promise<void> {
  // Body first, then head: head presence is what makes a save queued, so an
  // interrupted write never leaves one listed but unsendable.
  await set(BODY_PREFIX + head.meta.id, data, store);

  await set(HEAD_PREFIX + head.meta.id, head, store);
}

/**
 * Records that the replay hit something only the user can settle, and says
 * whether it applied. It doesn't when the save it refers to is no longer the one
 * queued — superseded by a save that landed online, or by a newer one queued
 * over it — and then the refusal is stale: it belongs to a document nobody can
 * act on, and would block a save that has never been tried.
 */
export async function blockPendingSave(
  mapId: string,
  queuedAt: number,
  blocked: BlockedReason,
): Promise<boolean> {
  const [rawHead] = await getMany([HEAD_PREFIX + mapId], store);

  const head = HeadSchema.safeParse(rawHead);

  if (!head.success || head.data.queuedAt !== queuedAt) {
    return false;
  }

  await set(HEAD_PREFIX + mapId, { ...head.data, blocked }, store);

  return true;
}

export async function deletePendingSave(mapId: string): Promise<void> {
  // Head first, so the save stops counting as queued immediately.
  await del(HEAD_PREFIX + mapId, store);

  await del(BODY_PREFIX + mapId, store);
}

/**
 * Drops a queued save only if it is still the one identified by `queuedAt`, and
 * says whether it did. A push takes a network round trip, and a save queued over
 * it meanwhile is a newer document still on its way — deleting that as though it
 * had landed would lose it while the UI reported it saved.
 */
export async function deletePendingSaveIfUnchanged(
  mapId: string,
  queuedAt: number,
): Promise<boolean> {
  const [rawHead] = await getMany([HEAD_PREFIX + mapId], store);

  const head = HeadSchema.safeParse(rawHead);

  if (head.success && head.data.queuedAt !== queuedAt) {
    return false;
  }

  await deletePendingSave(mapId);

  return true;
}

/**
 * Moves a queued save's precondition on after an earlier save for the same map
 * reached the server. Two saves in a row leave the second queued against the
 * `modifiedAt` the first was written for, which the server has since moved past
 * — so without this the second is refused as a conflict with the first, which is
 * the same user's own back-to-back save.
 */
export async function advancePendingPrecondition(
  mapId: string,
  modifiedAt: Date,
): Promise<void> {
  const head = await getPendingHead(mapId);

  if (head && head.meta.modifiedAt < modifiedAt) {
    await set(
      HEAD_PREFIX + mapId,
      { ...head, meta: { ...head.meta, modifiedAt } },
      store,
    );
  }
}

/**
 * Drops the whole outbox. Called on logout — the queued saves carry map names
 * and content of the account that is leaving, and a shared browser must not push
 * them under whoever logs in next.
 */
export async function clearOutbox(): Promise<void> {
  await clear(store);
}
