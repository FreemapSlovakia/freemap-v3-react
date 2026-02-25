import { createAction } from '@reduxjs/toolkit';

export interface WikiPoint {
  id: string;
  lat: number;
  lon: number;
  name: string;
  wikipedia: string;
}

export interface WikiPreview {
  title: string;
  extract: string;
  thumbnail?: { source: string; width: number; height: number };
  lang: string;
  langTitle: string; // TODO maybe it is same as title
}

export const wikiSetPoints = createAction<WikiPoint[]>('WIKI_SET_POINTS');

export const wikiSetPreview = createAction<WikiPreview | null>(
  'WIKI_SET_PREVIEW',
);

export const wikiLoadPreview = createAction<string>('WIKI_LOAD_PREVIEW');
