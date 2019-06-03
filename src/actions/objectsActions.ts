import { createStandardAction } from 'typesafe-actions';

interface ObjectsResult {
  id: string;
  lat: number;
  lon: number;
  tags: string[];
  typeId: string;
}

export const objectsSetFilter = createStandardAction('OBJECTS_SET_FILTER')<
  string
>();

export const objectsSetResult = createStandardAction('OBJECTS_SET_RESULT')<
  ObjectsResult
>();
