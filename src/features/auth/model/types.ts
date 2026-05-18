import { LayerSettingsSchema } from '@features/map/model/actions.js';
import { CustomLayerDefSchema } from '@shared/mapDefinitions.js';
import z from 'zod';
import { LatLonSchema } from '@/shared/types/common.js';

export const AuthProviderSchema = z.enum([
  'facebook',
  'osm',
  'garmin',
  'google',
  'apple',
]);

export type AuthProvider = z.infer<typeof AuthProviderSchema>;

export type Purchase =
  | { type: 'premium' }
  | { type: 'credits'; amount: number };

export type PurchaseRecord = {
  createdAt: Date;
  item: Purchase;
};

export type PurchaseIntentStatus = 'created' | 'awaiting_payment' | 'rejected';

export type PurchaseIntent = {
  item: Purchase;
  status: PurchaseIntentStatus;
  createdAt: Date;
  updatedAt: Date;
  expireAt: Date;
  bankIntentStatus: string | null;
};

export type PurchasesResponse = {
  purchases: PurchaseRecord[];
  intents: PurchaseIntent[];
};

export const UserSettingsSchema = z.object({
  layersSettings: z.record(z.string(), LayerSettingsSchema).optional(),
  customLayers: z.array(CustomLayerDefSchema).optional(),
  maxZoom: z.number().optional(),
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;

export const UserSchema = z.object({
  authProviders: z.array(AuthProviderSchema),
  authToken: z.string(),
  credits: z.number(),
  email: z.string().nullable(),
  description: z.string().nullable(),
  id: z.number(),
  isAdmin: z.boolean(),
  language: z.string().nullish(),
  coordinates: LatLonSchema.nullable(),
  name: z.string(),
  premiumExpiration: z.date().nullable(),
  sendGalleryEmails: z.boolean(),
  settings: UserSettingsSchema.optional(),
});

export type User = z.infer<typeof UserSchema>;

export const LoginResponseSchema = z.object({
  user: UserSchema,
  connect: z.boolean(),
  clientData: z
    .object({
      successAction: z.object({ type: z.string() }).optional(),
    })
    .optional(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
