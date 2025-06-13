import type { Action } from 'redux';
import type { CustomLayer, LayerSettings } from '../actions/mapActions.js';

export type AuthProvider = 'facebook' | 'osm' | 'garmin' | 'google';

export interface Purchase {
  createdAt: Date;
  item: { type: 'premium' } | { type: 'credits'; amount: number };
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
  settings?: {
    layersSettings?: Record<string, LayerSettings>;
    overlayPaneOpacity?: number;
    customLayers?: CustomLayer[];
  };
}

export type LoginResponse = {
  user: User;
  connect: boolean;
  clientData?: { successAction?: Action };
};
