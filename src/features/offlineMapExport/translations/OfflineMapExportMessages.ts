import type { JSX, ReactNode } from 'react';

export type OfflineMapExportMessages = {
  format: string;
  map: string;
  unknownMapType: string;
  downloadArea: string;
  name: string;
  zoomRange: string;
  scale: string;
  email: string;
  emailInfo: string;
  /** The account has no confirmed address to send the link to. */
  noVerifiedEmail: string;
  /** Its link to the account's personal information. */
  addVerifiedEmail: string;
  success: string;
  summaryTiles: string;
  summarySize: string;
  summaryPrice: (amount: ReactNode) => JSX.Element;
  usageIntro: string;
  usageDesktop: string;
  usageAndroid: string;
  usageIos: string;
  usageWeb: string;
  usageWebLead: string;
  usageWebMid: string;
  usageWebTrail: string;
  formatMbtiles: string;
  formatSqlitedb: string;
  formatMbtilesTooltip: string;
  formatSqlitedbTooltip: string;
  outsideCoverage: (countries: string) => string;
};
