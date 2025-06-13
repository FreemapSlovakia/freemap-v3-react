import type { Action } from 'redux';
import type { CustomLayer, LayerSettings } from '../actions/mapActions.js';

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
    customLayers?: CustomLayer[];
  };
  lat?: number | null;
  lon?: number | null;
  language?: string | null;
  premiumExpiration: Date | null;
  authProviders: AuthProvider[];
}

export type LoginResponse = {
  user: User;
  connect: boolean;
  clientData?: { successAction?: Action };
};
