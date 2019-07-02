import { createStandardAction } from 'typesafe-actions';

export interface ObjectsResult {
  id: number;
  lat: number;
  lon: number;
  tags: { [key: string]: string };
  typeId: number;
}

export const objectsSetFilter = createStandardAction('OBJECTS_SET_FILTER')<
  string
>();

export const objectsSetResult = createStandardAction('OBJECTS_SET_RESULT')<
  ObjectsResult[]
>();
