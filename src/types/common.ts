import { MapStateBase } from 'fm3/actions/mapActions';
import { RoutePlannerState } from 'fm3/reducers/routePlannerReducer';
import { TrackViewerState } from 'fm3/reducers/trackViewerReducer';
import { MainState } from 'fm3/reducers/mainReducer';
import { Translations } from 'fm3/stringUtils';

export interface LatLon {
  lat: number;
  lon: number;
}

export interface User {
  name: string;
  email: string;
  id: number;
  authToken: string;
  isAdmin: boolean;
  settings?: {
    expertMode?: boolean;
    trackViewerEleSmoothingFactor?: number;
    overlayOpacity?: { [type: string]: number };
    overlayPaneOpacity?: number;
  };
  preventTips?: boolean;
  lat?: number | null;
  lon?: number | null;
  notValidated?: boolean;
}

declare global {
  interface Window {
    ga: UniversalAnalytics.ga;
    FB: fb.FacebookStatic;
    fbAsyncInit?: () => void;
    handleGoogleAuthApiLoad?: () => void;
    preventMapClick?: boolean;
    translations?: Translations;
  }
}

export interface AppState {
  main: Pick<MainState, 'homeLocation' | 'expertMode'>;
  map: MapStateBase;
  trackViewer: Pick<TrackViewerState, 'eleSmoothingFactor'>;
  language: string | null;
  routePlanner: Pick<RoutePlannerState, 'transportType'>;
}
