import { useSyncExternalStore } from 'react';
import type z from 'zod';
import { whenOnline } from './whenOnline.js';

const RETRY_MS = 30_000;

/**
 * A server's JSON answer, fetched once per session and kept in `localStorage`,
 * so what it says is still known offline.
 */
export function rememberedJson<T>(
  url: string,
  storageKey: string,
  schema: z.ZodType<T>,
) {
  function remembered(): T | null {
    try {
      const stored = localStorage.getItem(storageKey);

      if (!stored) {
        return null;
      }

      const parsed = schema.safeParse(JSON.parse(stored));

      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  }

  let value: T | null = remembered();

  let loading: Promise<T | null> | null = null;

  /** Not before this: a tile draw asks, so a failure must not ask once per tile. */
  let retryAt = 0;

  const listeners = new Set<() => void>();

  function load(): Promise<T | null> {
    if (!loading && Date.now() < retryAt) {
      return Promise.resolve(value);
    }

    loading ??= fetch(url, { headers: { Accept: 'application/json' } })
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        const parsed = schema.safeParse(body);

        // a refusal or a malformed answer is no more final than a dropped
        // connection
        if (!parsed.success) {
          throw new Error(`unexpected answer from ${url}`);
        }

        value = parsed.data;

        try {
          localStorage.setItem(storageKey, JSON.stringify(value));
        } catch {
          // private window, or no room; the fetch answers this session anyway
        }

        // outside this chain, so a listener's throw is not taken for a failed fetch
        queueMicrotask(() => {
          for (const listener of listeners) {
            listener();
          }
        });

        return value;
      })
      .catch(() => {
        // Not cached as the answer: a later call asks again, once the wait is up.
        loading = null;

        retryAt = Date.now() + RETRY_MS;

        // and anything still showing it would otherwise wait to be reopened
        whenOnline(() => {
          if (listeners.size) {
            retryAt = 0;

            void load();
          }
        }, RETRY_MS);

        return value;
      });

    return loading;
  }

  function subscribe(listener: () => void): () => void {
    void load();

    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  function useValue(): T | null {
    return useSyncExternalStore(
      subscribe,
      () => value,
      () => null,
    );
  }

  return { load, useValue };
}
