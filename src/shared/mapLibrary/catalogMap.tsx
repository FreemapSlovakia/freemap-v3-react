import type { MapBody, MapIndexEntry } from '@shared/mapDefinitions.js';
import { FaRegMap } from 'react-icons/fa';

/** A catalog map once it is wanted: plain data, so the store can hold it. */
export type CatalogMap = {
  type: string;
  layer: 'base' | 'overlay';
  name: string;
  countries?: string[];
  /** Where it covers, as [west, south, east, north]: what a preview fits to. */
  bbox?: [number, number, number, number];
  category?: string;
  body: MapBody<'tile'>;
};

/** A catalog map as an index row, its body bundled since it came along. */
export const catalogIndexEntry = (map: CatalogMap): MapIndexEntry<'tile'> => ({
  type: map.type,
  layer: map.layer,
  name: map.name,
  countries: map.countries,
  bbox: map.bbox,
  technology: 'tile',
  icon: <FaRegMap />,
  defaultInMenu: true,
  load: () => Promise.resolve(map.body),
  bundled: map.body,
});
