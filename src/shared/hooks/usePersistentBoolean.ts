import { usePersistentState } from './usePersistentState.js';

const serialize = String;

/**
 * A boolean variant of {@link usePersistentState} (e.g. for toolbar collapse
 * state), persisted as the string `"true"`/`"false"` under `key`.
 *
 * `defaultValue` is returned when nothing is stored yet.
 */
export function usePersistentBoolean(key: string, defaultValue = false) {
  return usePersistentState<boolean>(key, serialize, (value) =>
    value === null ? defaultValue : value === 'true',
  );
}
