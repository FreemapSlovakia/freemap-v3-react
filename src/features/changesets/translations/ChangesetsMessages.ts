import type { JSX } from 'react';
import type { Changeset } from '../model/actions.js';
import type {
  DiffAction,
  DiffElement,
  ElementType,
} from '../model/changesetDiff.js';

export type ChangesetsMessages = {
  detail: ({ changeset }: { changeset: Changeset }) => JSX.Element;
  allAuthors: string;
  refresh: string;
  tooBig: string;
  timeWindow: string;
  olderThan: (props: { days: number }) => string;
  notFound: string;
  fetchError: (props: { err: unknown }) => string;
  diffNotReady: string;
  inspectError: (props: { err: unknown }) => string;
  elementDetail: ({ element }: { element: DiffElement }) => JSX.Element;
  actions: Record<DiffAction, string>;
  element: {
    types: Record<ElementType, string>;
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
  };
};
