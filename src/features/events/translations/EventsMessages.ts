export type EventsMessages = {
  title: string;
  createNew: string;
  noEvents: string;
  // filter
  filterFrom: string;
  filterTo: string;
  inMapArea: string;
  activityType: string;
  activityTypePlaceholder: string;
  // form
  formTitle: string;
  formDescription: string;
  startAt: string;
  endAt: string;
  startPoint: string;
  takeFromRouteStart: string;
  visibility: string;
  visibilityPublic: string;
  visibilityUnlisted: string;
  source: string;
  sourceExisting: string;
  sourceCurrent: string;
  sourceCurrentName: string;
  pickMap: string;
  noWritableMaps: string;
  // per item
  edit: string;
  delete: string;
  open: string;
  deleteConfirm: (title: string) => string;
  publishAsEvent: string;
  // errors
  fetchListError: (props: { err: unknown }) => string;
  saveError: (props: { err: unknown }) => string;
  deleteError: (props: { err: unknown }) => string;
};
