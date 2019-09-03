import { createStandardAction } from 'typesafe-actions';

export interface Changeset {
  id: number;
  userName: string;
  description: string;
  closedAt: Date;
  centerLat: number;
  centerLon: number;
}

export const changesetsSet = createStandardAction('CHANGESETS_SET')<
  Changeset[]
>();

export const changesetsSetDays = createStandardAction('CHANGESETS_SET_DAYS')<
  number | null
>();

export const changesetsSetAuthorName = createStandardAction(
  'CHANGESETS_SET_AUTHOR_NAME',
)<string | null>();
