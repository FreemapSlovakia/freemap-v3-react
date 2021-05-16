import { createAction } from 'typesafe-actions';

export interface ObjectsResult {
  id: number;
  lat: number;
  lon: number;
  tags: { [key: string]: string };
  typeId: number;
}

export const objectsSetFilter = createAction('OBJECTS_SET_FILTER')<number>();

export const objectsSetResult =
  createAction('OBJECTS_SET_RESULT')<ObjectsResult[]>();
