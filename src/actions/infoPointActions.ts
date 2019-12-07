import { createAction } from 'typesafe-actions';

export interface InfoPoint {
  lat: number;
  lon: number;
  label?: string;
}

export const infoPointAdd = createAction('INFO_POINT_ADD')<InfoPoint>();

export const infoPointChangePosition = createAction(
  'INFO_POINT_CHANGE_POSITION',
)<{ index: number; lat: number; lon: number }>();

export const infoPointChangeLabel = createAction('INFO_POINT_CHANGE_LABEL')<{
  index: number;
  label: string | undefined;
}>();

export const infoPointSetAll = createAction('INFO_POINT_SET_ALL')<
  InfoPoint[]
>();
