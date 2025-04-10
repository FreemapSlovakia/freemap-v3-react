import { Map } from 'leaflet';
import { useEffect, useState } from 'react';
import { mapPromise } from '../leafletElementHolder.js';

export function useMap() {
  const [map, setMap] = useState<Map>();

  useEffect(() => {
    mapPromise.then(setMap);
  }, []);

  return map;
}
