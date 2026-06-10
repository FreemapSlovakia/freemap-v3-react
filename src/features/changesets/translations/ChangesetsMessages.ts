import type { JSX, ReactNode } from 'react';

export type ChangesetsMessages = {
  allAuthors: string;
  refresh: string;
  tooBig: string;
  olderThan: (props: { days: number }) => string;
  olderThanFull: (props: { days: number }) => string;
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
