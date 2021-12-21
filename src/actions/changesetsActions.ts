import { createAction } from 'typesafe-actions';

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

export const changesetsSet = createAction('CHANGESETS_SET')<Changeset[]>();

export const changesetsSetParams = createAction(
  'CHANGESETS_SET_PARAMS',
)<ChangesetParams>();
