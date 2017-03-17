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

export const poiTypes = subcategories.map(s => ({ id: s.filename, group: m.get(s.category_id), title: s.name, description: s.description,
  filter: `node["${s.key1}"="${s.value1}"]${s.key2 ? `["${s.key2}"="${s.value2}"]` : ''}({{bbox}})` }));

// const nf = Intl.NumberFormat('sk', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
//
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

const keys = new Set(poiTypes.map(pt => pt.key));

export function toHtml(tags) {
  for (let key of keys) {
    if (tags[key]) {
      const pt = poiTypes.find(pt => pt.key === key && pt.value === tags[key]);
      if (pt) {
        return pt.template ? pt.template(tags) : ({ name }) => `${pt.title}${name ? `<br/>${escapeHtml(name)}` : ''}`;
      }
    }
  }

  return tags.name && escapeHtml(tags.name);
}

function escapeHtml(unsafe) {
  return unsafe
     .replace(/&/g, '&amp;')
     .replace(/</g, '&lt;')
     .replace(/>/g, '&gt;')
     .replace(/"/g, '&quot;')
     .replace(/'/g, '&#039;');
 }
