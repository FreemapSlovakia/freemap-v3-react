import { createAction } from '@reduxjs/toolkit';
import z from 'zod';

export const DocumentSchema = z.enum([
  'advertise',
  'dvePercenta',
  'exports',
  'privacyPolicy',
  'termsOfService',
  'refundPolicy',
]);

export type Document = z.infer<typeof DocumentSchema>;

export const documentShow = createAction<Document | null>('DOCUMENT_SHOW');

export const locusInstall = createAction('LOCUS_INSTALL');

export const oruxMapsDownload = createAction('ORUX_MAPS_DOWNLOAD');
