import type { JSX, ReactNode } from 'react';

export type CachedMapsMessages = {
  cacheOfflineMap: string;
  modifyOfflineMap: string;
  toDownload: string;
  addOfflineMap: string;
  emptyMessage: string;
  zoom: string;
  tiles: string;
  size: string;
  ready: string;
  incomplete: (props: { pct: ReactNode }) => JSX.Element;
  resume: string;
  stop: string;
  total: string;
  largeDownload: (props: { tiles: ReactNode; size: ReactNode }) => JSX.Element;
  notEnoughSpace: (props: { size: ReactNode; free: ReactNode }) => JSX.Element;
  estSize: string;
  startCaching: string;
  cachedSuccess: (props: { name: string }) => string;
  activate: string;
  focus: string;
  namePrefix: string;
  premiumZoomHint: string;
  premiumWiden: string;
  offlineWiden: string;
  premiumSkipped: string;
};
