import { createAction } from 'typesafe-actions';

export interface InfoPoint {
  lat: number;
  lon: number;
  label?: string;
}

export const infoPointAdd = createAction('INFO_POINT_ADD')<InfoPoint>();

export const infoPointDelete = createAction('INFO_POINT_DELETE')();

export const infoPointChangePosition = createAction(
  'INFO_POINT_CHANGE_POSITION',
)<{ lat: number; lon: number }>();

export const infoPointChangeLabel = createAction('INFO_POINT_CHANGE_LABEL')<
  string | undefined
>();

export const infoPointSetActiveIndex = createAction(
  'INFO_POINT_SET_ACTIVE_INDEX',
)<number>();

export const infoPointSetAll = createAction('INFO_POINT_SET_ALL')<
  InfoPoint[]
>();
