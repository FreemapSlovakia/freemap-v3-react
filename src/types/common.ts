import { IMapStateBase } from 'fm3/actions/mapActions';
import { IRoutePlannerState } from 'fm3/reducers/routePlannerReducer';
import { ITrackViewerState } from 'fm3/reducers/trackViewerReducer';
import { IMainState } from 'fm3/reducers/mainReducer';
import { ITranslations } from 'fm3/stringUtils';

export interface LatLon {
  lat: number;
  lon: number;
}

export interface IUser {
  name: string;
  email: string;
  id: number;
  authToken: string;
  isAdmin: boolean;
  settings?: any;
  preventTips?: boolean;
  lat?: number | null;
  lon?: number | null;
}

declare global {
  interface Window {
    ga: UniversalAnalytics.ga;
    FB: fb.FacebookStatic;
    fbAsyncInit?: () => void;
    handleGoogleAuthApiLoad?: () => void;
    preventMapClick?: boolean;
    translations?: ITranslations;
  }
}

export interface IAppState {
  main: Pick<IMainState, 'homeLocation' | 'expertMode'>;
  map: IMapStateBase;
  trackViewer: Pick<ITrackViewerState, 'eleSmoothingFactor'>;
  language: string | null;
  routePlanner: Pick<IRoutePlannerState, 'transportType'>;
}
