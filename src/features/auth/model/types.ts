import type { LayerSettings } from '@features/map/model/actions.js';
import { CustomLayerDef } from '@shared/mapDefinitions.js';
import type { Action } from 'redux';

export type AuthProvider = 'facebook' | 'osm' | 'garmin' | 'google';

export type Purchase =
  | { type: 'premium' }
  | { type: 'credits'; amount: number };

export type PurchaseRecord = {
  createdAt: Date;
  item: Purchase;
};

export type PurchaseIntentStatus = 'created' | 'awaiting_payment' | 'rejected';

export type PurchaseIntent = {
  item: Purchase;
  status: PurchaseIntentStatus;
  createdAt: Date;
  updatedAt: Date;
  expireAt: Date;
  bankIntentStatus: string | null;
};

export type PurchasesResponse = {
  purchases: PurchaseRecord[];
  intents: PurchaseIntent[];
};

export interface UserSettings {
  layersSettings?: Record<string, LayerSettings>;
  customLayers?: CustomLayerDef[];
  maxZoom?: number;
}

export interface User {
  authProviders: AuthProvider[];
  authToken: string;
  credits: number;
  email: string | null;
  id: number;
  isAdmin: boolean;
  language?: string | null;
  lat?: number | null;
  lon?: number | null;
  name: string;
  premiumExpiration: Date | null;
  sendGalleryEmails: boolean;
  settings?: UserSettings;
}

export type LoginResponse = {
  user: User;
  connect: boolean;
  clientData?: { successAction?: Action };
};
