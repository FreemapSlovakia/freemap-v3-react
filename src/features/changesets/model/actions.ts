import { createAction } from '@reduxjs/toolkit';

export interface Changeset {
  id: number;
  userName: string;
  description: string;
  closedAt: Date;
  centerLat: number;
  centerLon: number;
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

export const changesetsSetLastFetchedBBox = createAction<string>(
  'CHANGESETS_SET_LAST_FETCHED_BBOX',
);
