import {
  type Layer,
  wmsLayers,
  wmsLayersKey,
  wmsProxyOf,
} from '@shared/wms.js';
import { useEffect, useMemo, useState } from 'react';

type Loaded = { key: string; layers?: Layer[]; error?: string };

/** A WMS map's layer tree; neither field set while loading. */
export function useWmsLayers(def: {
  type: string;
  source?: string;
  url: string;
  proxy?: boolean;
}): { layers?: Layer[]; error?: string } {
  const { type, source, url, proxy } = def;

  const wmsProxy = useMemo(
    () => wmsProxyOf({ type, source, proxy }),
    [type, source, proxy],
  );

  const key = wmsLayersKey(url, wmsProxy);

  const [loaded, setLoaded] = useState<Loaded>();

  useEffect(() => {
    let current = true;

    wmsLayers(url, wmsProxy).then(
      (layers) => current && setLoaded({ key, layers }),
      (err) => current && setLoaded({ key, error: String(err) }),
    );

    return () => {
      current = false;
    };
  }, [key, url, wmsProxy]);

  // Another service's or another route's answer is never shown for this one.
  return loaded?.key === key ? loaded : {};
}
