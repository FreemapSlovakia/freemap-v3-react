import categories from './categories.json';
import subcategories from './subcategories.json';

export const poiTypeGroups = categories.map(c => ({
  id: c.id,
  icon: c.filename,
}));

interface IFilter {
  key: string;
  value?: string;
  keyOperation?: string;
  operation?: string;
}

const poiTypeGroupsMap = new Map<number, { id: number; icon: string }>();
poiTypeGroups.forEach(group => poiTypeGroupsMap.set(group.id, group));

export const poiTypes = subcategories.map(
  ({ id, filename, categoryId, filter }) => {
    const group = poiTypeGroupsMap.get(categoryId);
    return {
      id,
      icon: group && `${group.icon}-${filename}`,
      group: categoryId,
      filter,
      overpassFilter: `(${['node', 'way', 'relation']
        .map(element => toOverpassFilter(element, filter))
        .join('')})`,
    };
  },
);

const poiTypesMap = new Map<number, typeof poiTypes[0]>();
poiTypes.forEach(pt => poiTypesMap.set(pt.id, pt));

export function getPoiType(id: number) {
  return poiTypesMap.get(id);
}

function toOverpassFilter(element: string, filter: IFilter[]): string {
  return `${element}${filter
    .map(
      ({ keyOperation, key, operation = '=', value }) =>
        `[${keyOperation || ''}"${key}"${
          value === undefined ? '' : `${operation || '='}"${value}"`
        }]`,
    )
    .join('')}({{bbox}});`;
}
