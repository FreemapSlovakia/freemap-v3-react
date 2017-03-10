export function setObjectsFilter(filter) {
  return { type: 'SET_OBJECTS_FILTER', filter };
}

export function setObjects(objects) {
  return { type: 'SET_OBJECTS', objects };
}

export function setCategories(categories) {
  return { type: 'SET_CATEGORIES', categories };
}

export function setSubcategories(subcategories) {
  return { type: 'SET_SUBCATEGORIES', subcategories };
}
