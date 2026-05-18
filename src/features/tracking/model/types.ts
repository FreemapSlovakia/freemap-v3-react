import { IsoDateSchema } from '@shared/types/common.js';
import z from 'zod';

export const DeviceSchema = z.object({
  name: z.string(),
  maxCount: z.number().nullable(),
  maxAge: z.number().nullable(),
  id: z.number(),
  token: z.string(),
  createdAt: IsoDateSchema,
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

export const AccessTokenBaseSchema = z.object({
  listingLabel: z.string().nullable(),
  timeFrom: IsoDateSchema.nullable(),
  timeTo: IsoDateSchema.nullable(),
  note: z.string().nullable(),
});

export type AccessTokenBase = z.infer<typeof AccessTokenBaseSchema>;

export const AccessTokenSchema = AccessTokenBaseSchema.extend({
  id: z.number(),
  token: z.string(),
  createdAt: IsoDateSchema,
});

export type AccessToken = z.infer<typeof AccessTokenSchema>;

export interface Track {
  token: string;
  label?: string | null;
  color?: string | null;
  width?: number | null;
  splitDistance?: number | null;
  splitDuration?: number | null;
  trackPoints: TrackPoint[];
}

export const TrackPointSchema = z.object({
  id: z.number(),
  lat: z.number(),
  lon: z.number(),
  ts: IsoDateSchema,
  accuracy: z.number().nullish(),
  battery: z.number().nullish(),
  gsmSignal: z.number().nullish(),
  speed: z.number().nullish(),
  message: z.string().nullish(),
  altitude: z.number().nullish(),
  bearing: z.number().nullish(),
});

export type TrackPoint = z.infer<typeof TrackPointSchema>;
