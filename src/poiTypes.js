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

export const poiTypes = subcategories.map(({ filename, categoryId, name, filter }) => ({
  id: filename, // TODO use id
  group: m.get(categoryId),
  title: name,
  filter,
  overpassFilter: `(${[ 'node', 'way', 'relation' ].map(element => toOverpassFilter(element, filter)).join('')})`
}));

const poiTypesMap = new Map();
poiTypes.forEach(pt => poiTypesMap.set(pt.id, pt));

export function getPoiType(id) {
  return poiTypesMap.get(id);
}

const nf = Intl.NumberFormat('sk', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

function toOverpassFilter(element, filter) {
  return `${element}${filter.map(({ key, value }) => `["${key}"="${value}"]`).join()}({{bbox}});`;
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

export function getPointType(tags) {
  return poiTypes.find(({ filter }) => {
    return filter.every(({ key, value }) => tags[key] === value);
  });
}

export function toHtml(typeId, tags) {
  const pt = getPoiType(typeId);
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
