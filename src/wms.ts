export async function wms(urlString: string) {
  const url = new URL(urlString);

  url.searchParams.set('request', 'GetCapabilities');

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const text = await res.text();

  const dom = new DOMParser().parseFromString(text, 'text/xml');

  const namespaces: Record<string, string> = {
    wms: 'http://www.opengis.net/wms',
  };

  // Helper to extract text via XPath
  function getText(node: Node, xpath: string): string | null {
    return (
      dom.evaluate(
        xpath,
        node,
        (p) => p && namespaces[p],
        XPathResult.STRING_TYPE,
      ).stringValue || null
    );
  }

  // Get available image formats (global)
  function getGlobalFormats(): string[] {
    const iterator = dom.evaluate(
      '//wms:Capability/wms:Request/wms:GetMap/wms:Format',
      dom,
      (p) => p && namespaces[p],
      XPathResult.ORDERED_NODE_ITERATOR_TYPE,
    );

    const result: string[] = [];

    for (let n = iterator.iterateNext(); n; n = iterator.iterateNext()) {
      if (n.textContent) {
        result.push(n.textContent);
      }
    }

    return result;
  }

  const globalFormats = getGlobalFormats();

  // Collect child layers supporting EPSG:3857
  function getChildren(node: Node): Element[] {
    const iterator = dom.evaluate(
      './wms:Layer[wms:CRS="EPSG:3857" or .//wms:CRS="EPSG:3857"]',
      node,
      (p) => p && namespaces[p],
      XPathResult.ORDERED_NODE_ITERATOR_TYPE,
    );

    const result: Element[] = [];

    for (
      let child = iterator.iterateNext();
      child;
      child = iterator.iterateNext()
    ) {
      if (child instanceof Element) {
        result.push(child);
      }
    }

    return result;
  }

  type Nod = {
    title: string | null;
    name: string | null;
    queryable: boolean;
    transparent: boolean;
    minScale: number | null;
    maxScale: number | null;
    children: Nod[];
  };

  function parseLayer(node: Node): Nod {
    const elem = node as Element;
    const title = getText(node, './wms:Title');
    const name = getText(node, './wms:Name') || null;

    const queryable = elem.getAttribute('queryable') === '1';
    const transparent = elem.getAttribute('opaque') !== '1';

    const minScale =
      parseFloat(getText(node, './wms:MinScaleDenominator') || '') || null;

    const maxScale =
      parseFloat(getText(node, './wms:MaxScaleDenominator') || '') || null;

    const children = getChildren(node).map(parseLayer);

    return {
      title,
      name,
      queryable,
      transparent,
      minScale,
      maxScale,
      children,
    };
  }

  // Root-level layers
  const rootLayers = dom.evaluate(
    '//wms:Capability/wms:Layer/wms:Layer[wms:CRS="EPSG:3857"]',
    dom,
    (p) => p && namespaces[p],
    XPathResult.ORDERED_NODE_ITERATOR_TYPE,
  );

  const layersTree: Nod[] = [];
  for (
    let node = rootLayers.iterateNext();
    node;
    node = rootLayers.iterateNext()
  ) {
    layersTree.push(parseLayer(node));
  }

  return { globalFormats, layersTree };
}
