import type { Action } from 'redux';
import type { LayerSettings } from '../actions/mapActions.js';
import { CustomLayerDef } from '../mapDefinitions.js';

export type AuthProvider = 'facebook' | 'osm' | 'garmin' | 'google';

export interface Purchase {
  createdAt: Date;
  article: string;
  expireAt: Date;
}

export interface User {
  name: string;
  email: string | null;
  sendGalleryEmails: boolean;
  id: number;
  authToken: string;
  isAdmin: boolean;
  settings?: {
    layersSettings?: Record<string, LayerSettings>;
    overlayPaneOpacity?: number;
    customLayers?: CustomLayerDef[];
  };
  lat?: number | null;
  lon?: number | null;
  language?: string | null;
  isPremium: boolean;
  authProviders: AuthProvider[];
}

export type LoginResponse = {
  user: User;
  connect: boolean;
  clientData?: { successAction?: Action };
};
