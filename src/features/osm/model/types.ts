import type { LatLon } from '../../../types/common.js';

interface OsmElement {
  id: number;
  tags?: Record<string, string>;
}

export interface OsmNode extends OsmElement, LatLon {
  type: 'node';
}

export interface OsmWay extends OsmElement {
  type: 'way';
  nodes: number[];
}

export interface OsmRelation extends OsmElement {
  type: 'relation';
  members: { type: 'node' | 'way' | 'relation'; ref: number; role?: string }[];
}

export interface OsmResult {
  elements: (OsmNode | OsmWay | OsmRelation)[];
}
