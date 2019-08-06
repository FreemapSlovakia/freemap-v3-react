interface INodes {
  [id: string]: [number, number];
}

export function toNodes(data: Document) {
  const nodes: INodes = {};
  const nodeRes = data.evaluate(
    '/osm/node',
    data,
    null,
    XPathResult.UNORDERED_NODE_ITERATOR_TYPE,
    null,
  );

  let node: Element | null;

  while ((node = ensureElement(nodeRes.iterateNext()))) {
    if (!(node instanceof Element)) {
      throw Error('unexpected node');
    }

    nodes[req(node.getAttribute('id'))] = [
      parseFloat(req(node.getAttribute('lon'))),
      parseFloat(req(node.getAttribute('lat'))),
    ];
  }

  return nodes;
}

export function toWays(data: Document, nodes: INodes) {
  const ways = {};

  const wayRes = data.evaluate(
    '/osm/way',
    data,
    null,
    XPathResult.ORDERED_NODE_ITERATOR_TYPE,
    null,
  );

  let x: Element | null;

  while ((x = ensureElement(wayRes.iterateNext()))) {
    const coordinates: [number, number][] = [];

    const ndRefRes = data.evaluate(
      'nd/@ref',
      x,
      null,
      XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null,
    );

    let y: Attr | null;
    while ((y = ensureAttr(ndRefRes.iterateNext()))) {
      coordinates.push(nodes[y.value]);
    }

    ways[req(x.getAttribute('id'))] = coordinates;
  }

  return ways;
}

function req<T>(value: T | null): T {
  if (value) {
    return value;
  }

  throw new Error('null');
}

function ensureElement(node: Node | null): Element | null {
  if (node && !(node instanceof Element)) {
    throw Error('unexpected node');
  }
  return node;
}

function ensureAttr(node: Node | null): Attr | null {
  if (node && !(node instanceof Attr)) {
    throw Error('unexpected node');
  }
  return node;
}
