import type { LatLon } from './common.js';

interface OverpassElementBase {
  id: number;
  tags?: Record<string, string>; // probably bug in overpass, but it returned node without tags
}

interface OverpassNodeElement extends OverpassElementBase, LatLon {
  type: 'node';
}

interface OverpassWayOrRelationElement extends OverpassElementBase {
  type: 'way' | 'relation';
  center: LatLon;
}

export type OverpassElement =
  | OverpassNodeElement
  | OverpassWayOrRelationElement;

export interface OverpassResult {
  elements: OverpassElement[];
}

export type OverpassBounds = {
  minlat: number;
  minlon: number;
  maxlat: number;
  maxlon: number;
};
