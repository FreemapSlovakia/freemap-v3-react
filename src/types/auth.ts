import type { Action } from 'redux';
import type { LayerSettings } from '../actions/mapActions.js';
import { CustomLayerDef } from '../mapDefinitions.js';

export type AuthProvider = 'facebook' | 'osm' | 'garmin' | 'google';

export type Purchase =
  | { type: 'premium' }
  | { type: 'credits'; amount: number };

export type PurchaseRecord = {
  createdAt: Date;
  item: Purchase;
};

export interface UserSettings {
  layersSettings?: Record<string, LayerSettings>;
  customLayers?: CustomLayerDef[];
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
