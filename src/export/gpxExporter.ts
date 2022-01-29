export const GPX_NS = 'http://www.topografix.com/GPX/1/1';

export function createElement(
  parent: Element,
  name: string,
  text?: { cdata: string } | string | null,
  attributes: { [key: string]: string } = {},
): Element {
  const doc = parent.ownerDocument;

  const elem = doc.createElementNS(GPX_NS, name);

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
