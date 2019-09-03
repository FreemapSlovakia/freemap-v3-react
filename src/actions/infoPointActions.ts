import { createStandardAction, createAction } from 'typesafe-actions';

export interface InfoPoint {
  lat: number;
  lon: number;
  label?: string;
}

export const infoPointAdd = createStandardAction('INFO_POINT_ADD')<InfoPoint>();

export const infoPointDelete = createAction('INFO_POINT_DELETE');

export const infoPointChangePosition = createStandardAction(
  'INFO_POINT_CHANGE_POSITION',
)<{ lat: number; lon: number }>();

export const infoPointChangeLabel = createStandardAction(
  'INFO_POINT_CHANGE_LABEL',
)<string | undefined>();

export const infoPointSetActiveIndex = createStandardAction(
  'INFO_POINT_SET_ACTIVE_INDEX',
)<number>();

export const infoPointSetAll = createStandardAction('INFO_POINT_SET_ALL')<
  InfoPoint[]
>();
