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
  success: string;
  summaryTiles: string;
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
};
