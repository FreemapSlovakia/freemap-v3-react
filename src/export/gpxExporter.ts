export const GPX_NS = 'http://www.topografix.com/GPX/1/1';

export const GARMIN_NS = 'http://www.garmin.com/xmlschemas/GpxExtensions/v3';

export const GPX_STYLE_NS = 'http://www.topografix.com/GPX/gpx_style/0/2"';

export function createElement(
  parent: Element,
  name: string | [string, string],
  text: { cdata: string } | string | null = null,
  attributes: { [key: string]: string } = {},
  ns = GPX_NS,
): Element {
  const doc = parent.ownerDocument;

  const elem = Array.isArray(name)
    ? doc.createElementNS(name[0], name[1])
    : doc.createElementNS(ns, name);

  if (text == null) {
    // nothing
  } else if (typeof text === 'string') {
    elem.textContent = text;
  } else {
    elem.appendChild(doc.createCDATASection(text.cdata));
  }

  for (const key of Object.keys(attributes)) {
    addAttribute(elem, key, attributes[key]);
  }

  parent.appendChild(elem);

  return elem;
}

export function addAttribute(elem: Element, name: string, value: string): void {
  const attr = elem.ownerDocument.createAttribute(name);

  attr.value = value;

  elem.setAttributeNode(attr);
}
