export function osmLoadNode(osmNodeId) {
  return { type: 'OSM_LOAD_NODE', payload: osmNodeId };
}

export function osmLoadWay(osmWayId) {
  return { type: 'OSM_LOAD_WAY', payload: osmWayId };
}

export function osmLoadRelation(osmRelationId) {
  return { type: 'OSM_LOAD_RELATION', payload: osmRelationId };
}

export function osmClear() {
  return { type: 'OSM_CLEAR' };
}
