export interface DeviceBase {
  name: string;
  maxCount: number | null;
  maxAge: number | null;
}

export interface Device extends DeviceBase {
  id: number;
  token: string;
  createdAt: Date;
}

export interface EditedDevice extends DeviceBase {
  regenerateToken?: boolean;
}

export interface TrackedDevice {
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

export interface AccessTokenBase {
  listingLabel: string | null;
  timeFrom: Date | null;
  timeTo: Date | null;
  note: string | null;
}

export interface AccessToken extends AccessTokenBase {
  id: number;
  token: string;
  createdAt: Date;
}

export interface Track {
  id: string | number;
  label?: string | null;
  color?: string | null;
  width?: number | null;
  splitDistance?: number | null;
  splitDuration?: number | null;
  trackPoints: TrackPoint[];
}

export interface TrackPoint {
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
