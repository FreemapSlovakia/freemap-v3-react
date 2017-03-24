import categories from './categories.json';
import subcategories from './subcategories.json';

// export const poiTypeGroups = [
//   { id: 'nature', title: 'Príroda' },
//   { id: 'shop', title: 'Obchody' }
// ];

export const poiTypeGroups = categories.map(c => ({ id: c.filename, title: c.name, description: c.description }));

const m = new Map();
categories.forEach(function (c) {
  m.set(c.id, c.filename);
});

export const poiTypes = subcategories.map(s => ({
  id: s.filename,
  group: m.get(s.category_id),
  title: s.name,
  description: s.description,
  filter: `(${[ 'node', 'way', 'relation' ].map(element => toQuery(element, s)).join('')})`,
  key1: s.key1,
  value1: s.value1
}));

const nf = Intl.NumberFormat('sk', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

function toQuery(element, s) {
  return `${element}["${s.key1}"="${s.value1}"]${s.key2 ? `["${s.key2}"="${s.value2}"]` : ''}({{bbox}});`;
}

// export const poiTypes = [
//   { group: 'nature', title: 'Vrchol', key: 'natural', value: 'peak',
//     template: ({ name, ele }) => `Vrchol${name ? `<br/>${escapeHtml(name)}` : ''}${ele ? `${name ? ' ' : '<br/>'} (${nf.format(ele)} m)` : '' }`
//   },
//   { group: 'nature', title: 'Prameň', key: 'natural', value: 'spring',
//     template: ({ name }) => `Prameň${name ? `<br/>${escapeHtml(name)}` : ''}`
//   },
//   { group: 'shop', title: 'Potraviny', key: 'shop', value: 'convenience',
//     template: ({ name }) => `Potraviny${name ? `<br/>${escapeHtml(name)}` : ''}`
//   }
// ];

const keyPairs = new Set(poiTypes.map(pt => [ pt.key1, pt.key2 ]));

// TODO improve, currently it is O(n^2)
export function getPointType(tags) {
  for (let [ key1, key2 ] of keyPairs) {
    if (tags[key1] && (!key2 || tags[key2])) {
      const pt = poiTypes.find(
        pt => pt.key1 === key1 && pt.value1 === tags[key1]
          && (!key2 || pt.key2 === key2 && pt.value2 === tags[key2])
      );
      if (pt) {
        return pt;
      }
    }
  }
  return null;
}

export function toHtml(tags) {
  const pt = getPointType(tags);
  const { name, ele } = tags;
  if (pt) {
    const img = require(`./images/mapIcons/${pt.group}-${pt.id}.png`);
    return pt.template ? pt.template(tags) : `<img src="${img}"/> ${pt.title}${name ? `<br/>${escapeHtml(name)}` : ''}${ele ? `<br/>${nf.format(ele)} m n. m.` : ''}`;
  } else {
    return name && escapeHtml(name);
  }
}

function escapeHtml(unsafe) {
  return unsafe
     .replace(/&/g, '&amp;')
     .replace(/</g, '&lt;')
     .replace(/>/g, '&gt;')
     .replace(/"/g, '&quot;')
     .replace(/'/g, '&#039;');
 }
