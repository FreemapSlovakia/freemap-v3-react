import categories from './categories.json';
import subcategories from './subcategories.json';

export const poiTypeGroups = categories.map(c => ({
  id: c.id, icon: c.filename, description: c.description,
}));

const poiTypeGroupsMap = new Map();
poiTypeGroups.forEach(group => poiTypeGroupsMap.set(group.id, group));

export const poiTypes = subcategories.map(({ id, filename, categoryId, filter }) => ({
  id,
  icon: `${poiTypeGroupsMap.get(categoryId).icon}-${filename}`,
  group: categoryId,
  filter,
  overpassFilter: `(${['node', 'way', 'relation'].map(element => toOverpassFilter(element, filter)).join('')})`,
}));

const poiTypesMap = new Map();
poiTypes.forEach(pt => poiTypesMap.set(pt.id, pt));

export function getPoiType(id) {
  return poiTypesMap.get(id);
}

function toOverpassFilter(element, filter) {
  return `${element}${filter.map(({
    keyOperation, key, operation = '=', value,
  }) => `[${keyOperation || ''}"${key}"${value === undefined ? '' : `${operation || '='}"${value}"`}]`).join('')}({{bbox}});`;
}
