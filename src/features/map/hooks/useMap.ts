import type { Map as LeafletMap } from 'leaflet';
import { useEffect, useState } from 'react';
import { onMap } from './leafletElementHolder.js';

export function useMap() {
  const [map, setMap] = useState<LeafletMap>();

  useEffect(() => onMap(setMap), []);

  return map;
}
