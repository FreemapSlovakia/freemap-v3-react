import type { ObjectsSelection, SearchSelection } from '@app/store/actions.js';
import { createAction } from '@reduxjs/toolkit';
import type { OsmFeatureId } from '@shared/types/featureId.js';
import z from 'zod';
import type { DiffElement } from './changesetDiff.js';

export interface Changeset {
  id: number;
  userName: string;
  description: string;
  /** Or when it was opened, while it is still open. */
  closedAt: Date;
  /** [west, south, east, north]; see `changesetCenter`. */
  bbox: [number, number, number, number];
  /** Its tags but `comment`, which is the description. */
  tags: Record<string, string>;
}

export type ChangesetParams = {
  days?: number | null;
  authorName?: string | null;
};

export const changesetsSet = createAction<Changeset[]>('CHANGESETS_SET');

export const changesetsSetParams = createAction<ChangesetParams>(
  'CHANGESETS_SET_PARAMS',
);

export const changesetsRefresh = createAction('CHANGESETS_REFRESH');

/** The changeset pointed at, its marker or its row, outlined on the map. */
export const changesetsHover = createAction<number | null>('CHANGESETS_HOVER');

/**
 * Shows the changes of the changeset with this id on the map, or stops;
 * `fromHistory` where it is one of the shown history's versions, kept under it.
 */
export const changesetsInspect = createAction(
  'CHANGESETS_INSPECT',
  (id: number | null, opts?: { fromHistory?: boolean }) => ({
    payload: id,
    meta: { fromHistory: opts?.fromHistory ?? false },
  }),
);

/** The element a history is of, and how to get back to its details. */
export interface HistoryOf {
  id: OsmFeatureId;
  /** As its details head it, for the inspector's breadcrumb. */
  name: string;
  /** The selection its details are of, restored to go back to them. */
  selection: ObjectsSelection | SearchSelection;
}

/** An element's versions, the inspector's top level; `null` closes them. */
export const changesetsShowHistory = createAction<HistoryOf | null>(
  'CHANGESETS_SHOW_HISTORY',
);

/**
 * What `changesetsInspect(null)` becomes under a history: the inspection ended
 * and the history's element selected in one step, so nothing between sees the
 * history selected away from.
 */
export const changesetsReturnToHistory = createAction<{
  selection: HistoryOf['selection'];
}>('CHANGESETS_RETURN_TO_HISTORY');

/** One version of an element, as its history lists it. */
export const HistoryVersionSchema = z.object({
  version: z.number(),
  changeset: z.number(),
  /** Missing for a deleted account. */
  user: z.string().optional(),
  timestamp: z.string(),
});

export type HistoryVersion = z.infer<typeof HistoryVersionSchema> & {
  /** The changeset's, read after the versions. */
  comment?: string;
};

/** The versions read for the shown history, or why they couldn't be. */
export const changesetsSetHistoryVersions = createAction<
  { id: OsmFeatureId } & ({ versions: HistoryVersion[] } | { error: string })
>('CHANGESETS_SET_HISTORY_VERSIONS');

/**
 * OSMCha's augmented diff; one rebuilt from the OSM API (see `fetchOsmApiDiff`
 * for what it lacks); or none, the changeset too big to rebuild or the rebuild
 * failed.
 */
export type DiffSource = 'osmcha' | 'osmApi' | 'tooBig' | 'failed';

export const changesetsSetInspected = createAction<{
  changeset: Changeset;
  /** `null` while it loads, or with none to be had. */
  diff: DiffElement[] | null;
  /** `null` while it loads. */
  source: DiffSource | null;
  /** Why it `failed`. */
  error?: string;
}>('CHANGESETS_SET_INSPECTED');

export const changesetsSetLastFetchedBBox = createAction<string>(
  'CHANGESETS_SET_LAST_FETCHED_BBOX',
);
