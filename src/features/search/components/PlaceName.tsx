import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import type { LatLon } from '@shared/types/common.js';
import {
  PhotonResponseSchema,
  photonDisplayName,
  photonReverseUrl,
} from '@shared/types/photonResult.js';
import clsx from 'clsx';
import { type ReactElement, useEffect, useState } from 'react';

type Props = {
  position: LatLon | null | undefined;
  className?: string;
};

/** Answers by URL, so reopening a form or stepping between photos asks once. */
const names = new Map<string, string | null>();

const MAX_NAMES = 100;

/**
 * What lies at a picked position, beside coordinates nobody can picture. Shows
 * nothing until the geocoder answers, and nothing at all offline.
 */
export function PlaceName({ position, className }: Props): ReactElement | null {
  const online = useOnline();

  const language = useAppSelector((state) => state.l10n.language);

  // ~10 m: finer only splits the geocoder's cache. Also keeps the effect from
  // re-running for a new object naming the same place.
  const url =
    position &&
    photonReverseUrl(
      {
        lat: Math.round(position.lat * 1e4) / 1e4,
        lon: Math.round(position.lon * 1e4) / 1e4,
      },
      language,
    );

  const [name, setName] = useState<{ url: string; name: string | null }>();

  useEffect(() => {
    if (!url || !online) {
      return;
    }

    // Read here, not in render: the compiler would freeze a module read.
    if (names.has(url)) {
      setName({ url, name: names.get(url) ?? null });

      return;
    }

    const ac = new AbortController();

    // Typing a coordinate would otherwise ask once per digit.
    const timer = window.setTimeout(() => {
      fetch(url, { signal: ac.signal })
        .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
        .then((json) => {
          const feature = PhotonResponseSchema.parse(json).features[0];

          const found = feature ? photonDisplayName(feature.properties) : null;

          names.set(url, found);

          // Oldest first, as a Map iterates.
          if (names.size > MAX_NAMES) {
            names.delete(names.keys().next().value!);
          }

          setName({ url, name: found });
        })
        .catch(() => {
          // Only a hint; coordinates stay shown either way.
        });
    }, 300);

    return () => {
      window.clearTimeout(timer);

      ac.abort();
    };
  }, [url, online]);

  const shown = url && name?.url === url ? name.name : null;

  return shown && online ? (
    <small className={clsx('d-block text-muted', className)}>{shown}</small>
  ) : null;
}
