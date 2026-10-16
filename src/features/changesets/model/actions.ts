import { createAction } from '@reduxjs/toolkit';
import type { DiffElement } from './changesetDiff.js';

export interface Changeset {
  id: number;
  userName: string;
  description: string;
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

/** Shows the changes of the changeset with this id on the map, or stops. */
export const changesetsInspect = createAction<number | null>(
  'CHANGESETS_INSPECT',
);

export const changesetsSetInspected = createAction<{
  changeset: Changeset;
  diff: DiffElement[];
}>('CHANGESETS_SET_INSPECTED');

export const changesetsSetLastFetchedBBox = createAction<string>(
  'CHANGESETS_SET_LAST_FETCHED_BBOX',
);
