import type { JSX, ReactNode } from 'react';
import type { Changeset } from '../model/actions.js';

export type ChangesetsMessages = {
  detail: ({ changeset }: { changeset: Changeset }) => JSX.Element;
  allAuthors: string;
  refresh: string;
  tooBig: string;
  timeWindow: string;
  olderThan: (props: { days: number }) => string;
  notFound: string;
  fetchError: (props: { err: unknown }) => string;
  details: {
    author: string;
    description: string;
    noDescription: string;
    closedAt: string;
    moreDetailsOn: (props: {
      osmLink: ReactNode;
      achaviLink: ReactNode;
    }) => JSX.Element;
  };
};
