import categories from './categories.json';
import subcategories from './subcategories.json';

export const poiTypeGroups = categories.map(c => ({
  id: c.id, icon: c.filename, title: c.name, description: c.description,
}));

const poiTypeGroupsMap = new Map();
poiTypeGroups.forEach(group => poiTypeGroupsMap.set(group.id, group));

export const poiTypes = subcategories.map(({ id, filename, categoryId, name, filter }) => ({
  id,
  icon: `${poiTypeGroupsMap.get(categoryId).icon}-${filename}`,
  group: categoryId,
  title: name,
  filter,
  overpassFilter: `(${['node', 'way', 'relation'].map(element => toOverpassFilter(element, filter)).join('')})`,
}));

const poiTypesMap = new Map();
poiTypes.forEach(pt => poiTypesMap.set(pt.id, pt));

export function getPoiType(id) {
  return poiTypesMap.get(id);
}

const nf = Intl.NumberFormat('sk', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

function toOverpassFilter(element, filter) {
  return `${element}${filter.map(({ keyOperation, key, operation = '=', value }) =>
    `[${keyOperation || ''}"${key}"${value === undefined ? '' : `${operation || '='}"${value}"`}]`).join('')}({{bbox}});`;
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

// TODO use this to find pointType by tags - useful once overpass will return muitiple POI types in single result
// TODO not much tested, little buggy

// export function getPointType(tags) {
//   return poiTypes.find(({ filter }) => {
//     return filter.every(({ keyOperation, key: filterKey, operation = '=', value: filterValue }) => {
//       // see https://wiki.openstreetmap.org/wiki/Overpass_API/Language_Guide#Tag_request_clauses_.28or_.22tag_filters.22.29
//
//       if (!keyOperation) {
//         return testPair(filterKey, filterValue, operation);
//       } else if (keyOperation === '!') {
//         return filterValue === undefined ? !(filterKey in tags) : false;
//       } else if (keyOperation === '~') {
//         // all matching
//         const re = new RegExp(filterKey);
//         return Object.keys(tags).filter(t => re.test(t)).some(key => testPair(key, filterValue, operation)); // (all or) at least one? find in overpass specs.
//       } else if (keyOperation === '!~') {
//         if (filterValue !== undefined) {
//           return false;
//         }
//         const re = new RegExp(filterKey);
//         return !Object.keys(tags).some(t => re.test(t));
//       } else {
//         throw new Error('unsupported keyOperation');
//       }
//     });
//   });
//
//   function testPair(key, filterValue, operation) {
//     return filterValue === undefined ? true
//       : operation === '=' ? tags[key] === filterValue
//       : operation === '!=' ? tags[key] !== filterValue
//       : operation === '~' ? new RegExp(filterValue).test(tags[key])
//       : operation === '!~' ? !new RegExp(filterValue).test(tags[key])
//       : false;
//   }
// }

export function toHtml(typeId, tags) {
  const pt = getPoiType(typeId);
  const { name, ele } = tags;
  if (pt) {
    const img = require(`./images/mapIcons/${pt.icon}.png`);
    return pt.template ? pt.template(tags) : `<img src="${img}"/> ${pt.title}${name ? `<br/>${escapeHtml(name)}` : ''}${ele ? `<br/>${nf.format(ele)} m n. m.` : ''}`;
  }
  return name && escapeHtml(name);
}

function escapeHtml(unsafe) {
  return unsafe
     .replace(/&/g, '&amp;')
     .replace(/</g, '&lt;')
     .replace(/>/g, '&gt;')
     .replace(/"/g, '&quot;')
     .replace(/'/g, '&#039;');
}
