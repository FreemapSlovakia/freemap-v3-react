import type { Bbox } from '@features/mapArea/model/actions.js';
import { useEffect, useState } from 'react';
import { fetchLandcover, type LandcoverLayer } from '../model/landcover.js';
import { DEBOUNCE_MS } from './usePreviewData.js';

type State = { key: string; layers?: LandcoverLayer[]; failed?: boolean };

/**
 * The area's landcover while `bbox` is given, fetched half a second after the
 * area settles; `pending` until the current area's arrives or fails.
 */
export function useLandcover(bbox: Bbox | null | undefined): {
  layers?: LandcoverLayer[];
  pending: boolean;
  failed: boolean;
} {
  const key = bbox?.join() ?? '';

  const [state, setState] = useState<State | null>(null);

  // By `key`: `bbox` may be a new array of the same area. Toggled off and on,
  // it is fetched again, which is also how a failure is retried.
  useEffect(() => {
    if (!key) {
      return;
    }

    const ac = new AbortController();

    const timer = setTimeout(() => {
      // A retry is pending, not still failed.
      setState((s) => (s?.key === key && s.failed ? null : s));

      fetchLandcover(key.split(',').map(Number) as Bbox, ac.signal).then(
        (layers) => setState({ key, layers }),
        (err: unknown) => {
          if (!ac.signal.aborted) {
            console.error(err);

            setState({ key, failed: true });
          }
        },
      );
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);

      ac.abort();
    };
  }, [key]);

  return bbox
    ? {
        layers: state?.key === key ? state.layers : undefined,
        pending: state?.key !== key,
        failed: state?.key === key && state.failed === true,
      }
    : { pending: false, failed: false };
}
