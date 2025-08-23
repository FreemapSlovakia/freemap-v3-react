import type { LatLon } from './common.js';

type Kind = 'center' | 'bounds';

interface OverpassElementBase {
  id: number;
  tags?: Record<string, string>; // probably bug in overpass, but it returned node without tags
}

interface OverpassNodeElement extends OverpassElementBase, LatLon {
  type: 'node';
}

type OverpassWayOrRelationElement<T extends Kind> = OverpassElementBase & {
  type: 'way' | 'relation';
} & (T extends 'center' ? { center: LatLon } : { bounds: OverpassBounds });

export type OverpassElement<T extends Kind> =
  | OverpassNodeElement
  | OverpassWayOrRelationElement<T>;

export interface OverpassResult<T extends Kind> {
  elements: OverpassElement<T>[];
}

export type OverpassBounds = {
  minlat: number;
  minlon: number;
  maxlat: number;
  maxlon: number;
};
