import { createAction } from '@reduxjs/toolkit';
import z from 'zod';

export const invokeGeoip = createAction('INVOKE_GEOIP');

export const GeoIpResultSchema = z.object({
  country: z.string().optional(),
  countryCode: z.string().optional(),
  city: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type GeoIpResult = z.infer<typeof GeoIpResultSchema>;

export const processGeoipResult = createAction<GeoIpResult>(
  'PROCESS_GEOIP_RESULT',
);
