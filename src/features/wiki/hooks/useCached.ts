import { useEffect, useState } from 'react';

const cache = new Map<string, Promise<unknown>>();

const MAX_ENTRIES = 100;

function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key) as Promise<T> | undefined;

  if (hit) {
    return hit;
  }

  const promise = load();

  // A failure is not kept: opening the object again retries.
  promise.catch(() => {
    // Not a newer one, should this have been evicted meanwhile.
    if (cache.get(key) === promise) {
      cache.delete(key);
    }
  });

  cache.set(key, promise);

  if (cache.size > MAX_ENTRIES) {
    cache.delete(cache.keys().next().value!);
  }

  return promise;
}

export type Loaded<T> =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'done'; data: T }
  | { state: 'error' };

/**
 * `load`'s result, shared by every caller of the same key unless `shared` is
 * off (for large results not worth keeping); idle while `key` is null.
 */
export function useCached<T>(
  key: string | null,
  load: () => Promise<T>,
  shared = true,
): Loaded<T> {
  const [result, setResult] = useState<{ key: string; loaded: Loaded<T> }>();

  // biome-ignore lint/correctness/useExhaustiveDependencies: the key names what `load` loads
  useEffect(() => {
    if (key === null) {
      return;
    }

    let live = true;

    (shared ? cached(key, load) : load()).then(
      (data) => live && setResult({ key, loaded: { state: 'done', data } }),
      () => live && setResult({ key, loaded: { state: 'error' } }),
    );

    return () => {
      live = false;
    };
  }, [key]);

  if (key === null) {
    return { state: 'idle' };
  }

  return result?.key === key ? result.loaded : { state: 'loading' };
}
