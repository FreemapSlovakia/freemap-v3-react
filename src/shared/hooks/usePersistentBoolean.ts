import { usePersistentState } from './usePersistentState.js';

const serialize = String;

const deserialize = (value: string | null) => value === 'true';

/**
 * A boolean variant of {@link usePersistentState} (e.g. for toolbar collapse
 * state), persisted as the string `"true"`/`"false"` under `key`.
 */
export function usePersistentBoolean(key: string) {
  return usePersistentState<boolean>(key, serialize, deserialize);
}
