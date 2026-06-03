import type { JSX } from 'react';

export type LegendMessages = {
  body: (props: { name: string }) => JSX.Element;
  outdoorMap: {
    'natural-poi': string;
    'roads-and-paths': string;
    accommodation: string;
    borders: string;
    'gastro-poi': string;
    institution: string;
    landcover: string;
    other: string;
    poi: string;
    railway: string;
    sport: string;
    terrain: string;
    water: string;
  };
};
