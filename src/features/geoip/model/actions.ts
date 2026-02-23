import { createAction } from '@reduxjs/toolkit';

export const invokeGeoip = createAction('INVOKE_GEOIP');

export type GeoIpResult = {
  country?: string;
  countryCode?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
};

export const processGeoipResult = createAction<GeoIpResult>(
  'PROCESS_GEOIP_RESULT',
);
