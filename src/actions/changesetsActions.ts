import { createAction } from 'typesafe-actions';

export interface Changeset {
  id: number;
  userName: string;
  description: string;
  closedAt: Date;
  centerLat: number;
  centerLon: number;
}

export const changesetsSet = createAction('CHANGESETS_SET')<Changeset[]>();

export const changesetsSetDays = createAction('CHANGESETS_SET_DAYS')<
  number | null
>();

export const changesetsSetAuthorName = createAction(
  'CHANGESETS_SET_AUTHOR_NAME',
)<string | null>();
