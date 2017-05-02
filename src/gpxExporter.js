import FileSaver from 'file-saver';

const GPX_NS = 'http://www.topografix.com/GPX/1/1';

export function exportGpx(nameBase, addContent) {
  const doc = document.implementation.createDocument(GPX_NS, 'gpx');

  addAttribute(doc.documentElement, 'version', '1.1');
  addAttribute(doc.documentElement, 'creator', 'FreemapV3');

  createElement(doc.documentElement, 'metadata');

  addContent(doc, createElement, addAttribute);

  const serializer = new XMLSerializer();

  // eslint-disable-next-line
  //console.log(serializer.serializeToString(doc));

  FileSaver.saveAs(new Blob([serializer.serializeToString(doc)], { type: 'application/json' }), `${nameBase}.gpx`);
}

export function createElement(parent, name, text, attributes = {}) {
  const elem = document.createElementNS(GPX_NS, name);
  if (text !== undefined) {
    elem.textContent = text;
  }

  Object.keys(attributes).forEach(key => addAttribute(elem, key, attributes[key]));

  parent.appendChild(elem);
  return elem;
}

export function addAttribute(elem, name, value) {
  const attr = document.createAttribute(name);
  attr.value = value;
  elem.setAttributeNode(attr);
}
