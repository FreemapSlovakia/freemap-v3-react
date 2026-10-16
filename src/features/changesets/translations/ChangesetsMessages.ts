import type { JSX } from 'react';
import type { DiffAction } from '../model/changesetDiff.js';

export type ChangesetsMessages = {
  inspector: () => JSX.Element;
  history: {
    title: string;
    error: (props: { err: unknown }) => string;
  };
  /** Names the inspected one where nothing above it in the breadcrumb does. */
  changeset: string;
  allAuthors: string;
  refresh: string;
  tooBig: string;
  timeWindow: string;
  olderThan: (props: { days: number }) => string;
  notFound: string;
  fetchError: (props: { err: unknown }) => string;
  inspectError: (props: { err: unknown }) => string;
  actions: Record<DiffAction, string>;
  element: {
    onlyNodesMoved: string;
    geometryChanged: string;
    tagsUnchanged: string;
    key: string;
    before: string;
    after: string;
    value: string;
    members: (props: { added: number; removed: number }) => string;
    history: string;
  };
  details: {
    author: string;
    description: string;
    noDescription: string;
    closedAt: string;
    openOnOsm: string;
    /** The diff is rebuilt from the OSM API, so is approximate. */
    rebuilt: string;
    /** Why no changes are drawn for a changeset too big to rebuild. */
    tooBig: string;
  };
};
