import type { JSX } from 'react';

export type LegendMessages = {
  body: (props: { name: string }) => JSX.Element;
  filter: string;
  outdoorMap: {
    'roads-and-paths': string;
    railway: string;
    transport: string;
    water: string;
    terrain: string;
    'natural-poi': string;
    landcover: string;
    borders: string;
    accommodation: string;
    'gastro-poi': string;
    shop: string;
    sport: string;
    tourism: string;
    culture: string;
    historic: string;
    religion: string;
    institution: string;
    finance: string;
    health: string;
    'man-made': string;
    barrier: string;
    facility: string;
    other: string;
  };
};
