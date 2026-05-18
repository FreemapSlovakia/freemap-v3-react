import z from 'zod';

export const DeviceSchema = z.object({
  name: z.string(),
  maxCount: z.number().nullable(),
  maxAge: z.number().nullable(),
  id: z.number(),
  token: z.string(),
  createdAt: z.date(),
});

export type Device = z.infer<typeof DeviceSchema>;

export type EditedDevice = {
  name: string;
  maxCount: number | null;
  maxAge: number | null;
  token: string | undefined;
};

export interface TrackedDevice {
  token: string;
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
  token: string;
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
