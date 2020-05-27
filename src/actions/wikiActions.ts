import { createAction } from 'typesafe-actions';

export type WikiPoint = {
  id: number;
  lat: number;
  lon: number;
  name: string;
  wikipedia: string;
};

export type WikiPreview = {
  title: string;
  extract: string;
  thumbnail: { source: string; width: number; height: number };
};

export const wikiSetPoints = createAction('WIKI_SET_POINTS')<WikiPoint[]>();

export const wikiSetPreview = createAction('WIKI_SET_PREVIEW')<WikiPreview>();

export const wikiLoadPreview = createAction('WIKI_LOAD_PREVIEW')<string>();
