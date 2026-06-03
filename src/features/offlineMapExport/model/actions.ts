import { createAction } from '@reduxjs/toolkit';
import type { Feature, MultiPolygon, Polygon } from 'geojson';

export const downloadMap = createAction<{
  name: string;
  email: string;
  map: string;
  format: string;
  maxZoom: number;
  minZoom: number;
  scale: number;
  boundary: Feature<Polygon | MultiPolygon>;
}>('DOWNLOAD_MAP');
