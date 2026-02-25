import type { Map as LeafletMap } from 'leaflet';
import { useEffect, useState } from 'react';
import { mapPromise } from './leafletElementHolder.js';

export function useMap() {
  const [map, setMap] = useState<LeafletMap>();

  useEffect(() => {
    mapPromise.then(setMap);
  }, []);

  return map;
}
