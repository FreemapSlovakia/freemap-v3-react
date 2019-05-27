export function toNodes(data) {
  const nodes = {};
  const nodeRes = data.evaluate(
    '/osm/node',
    data,
    null,
    XPathResult.UNORDERED_NODE_ITERATOR_TYPE,
    null,
  );
  for (let x = nodeRes.iterateNext(); x; x = nodeRes.iterateNext()) {
    nodes[x.getAttribute('id')] = ['lon', 'lat'].map(c =>
      parseFloat(x.getAttribute(c)),
    );
  }
  return nodes;
}

export function toWays(data, nodes) {
  const ways = {};
  const wayRes = data.evaluate(
    '/osm/way',
    data,
    null,
    XPathResult.ORDERED_NODE_ITERATOR_TYPE,
    null,
  );
  for (let x = wayRes.iterateNext(); x; x = wayRes.iterateNext()) {
    const coordinates = [];

    const ndRefRes = data.evaluate(
      'nd/@ref',
      x,
      null,
      XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null,
    );
    for (let y = ndRefRes.iterateNext(); y; y = ndRefRes.iterateNext()) {
      coordinates.push(nodes[y.value]);
    }

    ways[x.getAttribute('id')] = coordinates;
  }
  return ways;
}
