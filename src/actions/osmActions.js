import * as at from 'fm3/actionTypes';

export function osmLoadNode(osmNodeId) {
  return { type: at.OSM_LOAD_NODE, payload: osmNodeId };
}

export function osmLoadWay(osmWayId) {
  return { type: at.OSM_LOAD_WAY, payload: osmWayId };
}

export function osmLoadRelation(osmRelationId) {
  return { type: at.OSM_LOAD_RELATION, payload: osmRelationId };
}

export function osmClear() {
  return { type: at.OSM_CLEAR };
}
