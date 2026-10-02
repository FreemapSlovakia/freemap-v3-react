import type { MapBody, MapIndexEntry } from '@shared/mapDefinitions.js';
import type { ReactElement } from 'react';
import { FaFilm, FaLayerGroup, FaRegMap, FaScroll } from 'react-icons/fa';
import { GiMountains } from 'react-icons/gi';
import { IoAirplaneOutline } from 'react-icons/io5';

/** A catalog map's icon, by its Editor Layer Index category. */
export function catalogIcon(category: string | undefined): ReactElement {
  switch (category) {
    case 'photo':
      return <IoAirplaneOutline />;
    case 'historicphoto':
      return <FaFilm />;
    case 'historicmap':
      return <FaScroll />;
    case 'map':
    case 'osmbasedmap':
      return <FaRegMap />;
    case 'elevation':
      return <GiMountains />;
    default:
      return <FaLayerGroup />;
  }
}

/** A catalog map once it is wanted: plain data, so the store can hold it. */
export type CatalogMap = {
  type: string;
  layer: 'base' | 'overlay';
  name: string;
  countries?: string[];
  /** Where it covers, as [west, south, east, north]: what a preview fits to. */
  bbox?: [number, number, number, number];
  category?: string;
} & (
  | { technology?: 'tile'; body: MapBody<'tile'> }
  | { technology: 'wms'; body: MapBody<'wms'> }
);

/** A catalog map as an index row, its body bundled since it came along. */
export const catalogIndexEntry = (map: CatalogMap): MapIndexEntry => {
  const row = {
    type: map.type,
    layer: map.layer,
    name: map.name,
    countries: map.countries,
    bbox: map.bbox,
    category: map.category,
    icon: catalogIcon(map.category),
    defaultInMenu: true,
  };

  return map.technology === 'wms'
    ? {
        ...row,
        technology: 'wms',
        load: () => Promise.resolve(map.body),
        bundled: map.body,
      }
    : {
        ...row,
        technology: 'tile',
        load: () => Promise.resolve(map.body),
        bundled: map.body,
      };
};
