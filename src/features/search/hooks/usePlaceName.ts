import { useMessages } from '@features/l10n/l10nInjector.js';
import { distanceTo } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import type { LatLon } from '@shared/types/common.js';
import {
  PhotonResponseSchema,
  photonDisplayName,
  photonReverseUrl,
  photonShortName,
} from '@shared/types/photonResult.js';
import { useEffect, useState } from 'react';

type Found = { name: string; short: string; distance: number | null } | null;

/** Answers by URL, so reopening a form or stepping between photos asks once. */
const names = new Map<string, Found>();

const MAX_NAMES = 100;

/** Farther than this from a place with no area, it is named with its distance. */
const NEAR_M = 1000;

/**
 * What lies at `position`, by the geocoder: the name, or the nearest place with
 * its distance when the position lies outside it; `short`, only the name and
 * the town. Null until the geocoder answers, when it knows nothing, and offline.
 */
export function usePlaceName(
  position: LatLon | null | undefined,
  short = false,
): string | null {
  const online = useOnline();

  const language = useAppSelector((state) => state.l10n.language);

  const m = useMessages();

  const kmFormat = useNumberFormat({ maximumFractionDigits: 1 });

  // ~10 m: finer only splits the geocoder's cache. Also keeps the effect from
  // re-running for a new object naming the same place.
  const at = position && {
    lat: Math.round(position.lat * 1e4) / 1e4,
    lon: Math.round(position.lon * 1e4) / 1e4,
  };

  const url = at && photonReverseUrl(at, language);

  const [found, setFound] = useState<{ url: string; found: Found }>();

  // biome-ignore lint/correctness/useExhaustiveDependencies: `url` says where `at` is
  useEffect(() => {
    if (!url || !at || !online) {
      return;
    }

    // Read here, not in render: the compiler would freeze a module read.
    if (names.has(url)) {
      setFound({ url, found: names.get(url) ?? null });

      return;
    }

    const ac = new AbortController();

    // Typing a coordinate would otherwise ask once per digit.
    const timer = window.setTimeout(() => {
      fetch(url, { signal: ac.signal })
        .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
        .then((json) => {
          const feature = PhotonResponseSchema.parse(json).features[0];

          let result: Found = null;

          if (feature) {
            const [lon = 0, lat = 0] = feature.geometry.coordinates;

            // west, north, east, south
            const extent = feature.properties.extent;

            const clamp = (v: number, a: number, b: number) =>
              Math.min(Math.max(v, Math.min(a, b)), Math.max(a, b));

            // To a place's area where it has one, not to its centre.
            const distance = distanceTo(
              at,
              extent
                ? {
                    lat: clamp(at.lat, extent[3], extent[1]),
                    lon: clamp(at.lon, extent[0], extent[2]),
                  }
                : { lat, lon },
            );

            result = {
              name: photonDisplayName(feature.properties),
              short: photonShortName(feature.properties),
              distance: distance < NEAR_M ? null : distance,
            };
          }

          names.set(url, result);

          // Oldest first, as a Map iterates.
          if (names.size > MAX_NAMES) {
            names.delete(names.keys().next().value!);
          }

          setFound({ url, found: result });
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

  const shown = url && online && found?.url === url ? found.found : null;

  if (!shown) {
    return null;
  }

  const name = short ? shown.short : shown.name;

  return shown.distance === null
    ? name
    : (m?.general.placeAway({
        name,
        distance: `${kmFormat.format(shown.distance / 1000)} km`,
      }) ?? name);
}
