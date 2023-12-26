import { mapPromise } from 'fm3/leafletElementHolder';
import { Map } from 'leaflet';
import { useEffect, useState } from 'react';

export function useMap() {
  const [map, setMap] = useState<Map>();

  useEffect(() => {
    mapPromise.then(setMap);
  }, []);

  return map;
}
