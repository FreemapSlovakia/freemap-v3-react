export const GPX_NS = 'http://www.topografix.com/GPX/1/1';

export function createElement(
  parent: Element | null,
  name: string,
  text?: string | null,
  attributes: { [key: string]: string } = {},
): Element {
  const elem = document.createElementNS(GPX_NS, name);
  if (text !== undefined) {
    elem.textContent = text;
  }

  Object.keys(attributes).forEach((key) =>
    addAttribute(elem, key, attributes[key]),
  );

  if (parent) {
    parent.appendChild(elem);
  }
  return elem;
}

export function addAttribute(elem: Element, name: string, value: string): void {
  const attr = document.createAttribute(name);
  attr.value = value;
  elem.setAttributeNode(attr);
}
