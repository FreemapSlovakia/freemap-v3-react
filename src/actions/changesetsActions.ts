import { createStandardAction } from 'typesafe-actions';

export const changesetsSet = createStandardAction('CHANGESETS_SET')<any>();

export const changesetsSetDays = createStandardAction('CHANGESETS_SET_DAYS')<
  number
>();

export const changesetsSetAuthorName = createStandardAction(
  'CHANGESETS_SET_AUTHOR_NAME',
)<string>();
