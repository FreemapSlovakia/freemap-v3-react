import { createAction } from '@reduxjs/toolkit';
import z from 'zod';

export const DocumentSchema = z.enum([
  'attribution',
  'dvePercenta',
  'exports',
  'freemap',
  'garmin',
  'geocaching',
  'osm',
  'privacyPolicy',
  'shortcuts',
  'tracking',
]);

export type Document = z.infer<typeof DocumentSchema>;

export const documentShow = createAction<Document | null>('DOCUMENT_SHOW');
