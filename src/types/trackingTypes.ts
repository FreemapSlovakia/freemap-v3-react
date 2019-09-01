export interface IDeviceBase {
  name: string;
  maxCount: number | null;
  maxAge: number | null;
}

export interface IDevice extends IDeviceBase {
  id: number;
  token: string;
  createdAt: Date;
}

export interface IEditedDevice extends IDeviceBase {
  regenerateToken?: boolean;
}

export interface ITrackedDevice {
  id: number | string;
  color?: string | null;
  width?: number | null;
  label?: string | null;
  maxCount?: number | null;
  maxAge?: number | null;
  fromTime?: Date | null;
  splitDistance?: number | null;
  splitDuration?: number | null;
}

export interface IAccessTokenBase {
  listingLabel: string | null;
  timeFrom: Date | null;
  timeTo: Date | null;
  note: string | null;
}

export interface IAccessToken extends IAccessTokenBase {
  id: number;
  token: string;
  createdAt: Date;
}

export interface ITrack {
  id: string | number;
  label?: string | null;
  color?: string | null;
  width?: number | null;
  splitDistance?: number | null;
  splitDuration?: number | null;
  trackPoints: ITrackPoint[];
}

export interface ITrackPoint {
  id: number;
  lat: number;
  lon: number;
  ts: Date;
  accuracy?: number | null;
  battery?: number | null;
  gsmSignal?: number | null;
  speed?: number | null;
  message?: string | null;
  altitude?: number | null;
  bearing?: number | null;
}
