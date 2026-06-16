import { LayerSettingsSchema } from '@features/map/model/actions.js';
import {
  CustomLayerDefArrayCompatSchema,
  CustomLayerDefSchema,
  StravaHeatmapColorSchema,
} from '@shared/mapDefinitions.js';
import z from 'zod';
import { IsoDateSchema, LatLonSchema } from '@/shared/types/common.js';

export const AuthProviderSchema = z.enum([
  'facebook',
  'osm',
  'garmin',
  'google',
  'apple',
  'github',
  'strava',
  'microsoft',
]);

export type AuthProvider = z.infer<typeof AuthProviderSchema>;

export const RoleSchema = z.enum([
  'userManager',
  'galleryModerator',
  'mapModerator',
  'trackingManager',
  'layerPreview',
]);

export type Role = z.infer<typeof RoleSchema>;

export const PurchaseSchema = z.discriminatedUnion('type', [
  // `recurring` is only meaningful for the Polar checkout flow (true = yearly
  // auto-renewing subscription, false/undefined = one-time year). It is absent
  // on stored purchase history items.
  z.object({ type: z.literal('premium'), recurring: z.boolean().optional() }),
  z.object({ type: z.literal('credits'), amount: z.number() }),
]);

export type Purchase = z.infer<typeof PurchaseSchema>;

export const PurchaseRecordSchema = z.object({
  createdAt: IsoDateSchema,
  item: PurchaseSchema,
});

export type PurchaseRecord = z.infer<typeof PurchaseRecordSchema>;

export const PurchaseIntentStatusSchema = z.enum([
  'created',
  'awaiting_payment',
  'rejected',
]);

export type PurchaseIntentStatus = z.infer<typeof PurchaseIntentStatusSchema>;

export const PurchaseIntentSchema = z.object({
  item: PurchaseSchema,
  status: PurchaseIntentStatusSchema,
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  expireAt: IsoDateSchema,
  bankIntentStatus: z.string().nullable(),
});

export type PurchaseIntent = z.infer<typeof PurchaseIntentSchema>;

export const PurchasesResponseSchema = z.object({
  purchases: z.array(PurchaseRecordSchema),
  intents: z.array(PurchaseIntentSchema),
});

export type PurchasesResponse = z.infer<typeof PurchasesResponseSchema>;

export const UserSettingsSchema = z.object({
  layersSettings: z.record(z.string(), LayerSettingsSchema).optional(),
  customLayers: z.array(CustomLayerDefSchema).optional(),
  maxZoom: z.number().optional(),
  stravaHeatmapColor: StravaHeatmapColorSchema.optional(),
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;

// Strict UserSettingsSchema with the customLayers field swapped for the
// lenient compat schema (filters out invalid items, upgrades legacy tile
// shapes). Use for parsing settings from persisted/server payloads.
export const UserSettingsCompatSchema = z.object({
  ...UserSettingsSchema.shape,
  customLayers: CustomLayerDefArrayCompatSchema.optional(),
});

export const UserSchema = z.object({
  authProviders: z.array(AuthProviderSchema),
  authToken: z.string(),
  credits: z.number(),
  email: z.string().nullable(),
  description: z.string().nullable(),
  id: z.number(),
  roles: z.array(RoleSchema).default([]),
  language: z.string().nullish(),
  coordinates: LatLonSchema.nullable(),
  name: z.string(),
  premiumExpiration: IsoDateSchema.nullable(),
  sendGalleryEmails: z.boolean(),
  hasPicture: z.boolean(),
  // Whether the new Polar payment flow is enabled for this user (allowlisted on
  // the backend during the Rovas→Polar migration). Defaults false for already
  // persisted/rehydrated users.
  polarEnabled: z.boolean().default(false),
  settings: UserSettingsSchema.optional(),
});

export type User = z.infer<typeof UserSchema>;

/** Whether the (possibly absent) user holds the given role. */
export function hasRole(user: User | null | undefined, role: Role): boolean {
  return Boolean(user?.roles.includes(role));
}

// Wire form for server responses: settings are parsed separately because
// they may need legacy upgrade before validation.
export const RawUserSchema = z.object({
  ...UserSchema.omit({ settings: true }).shape,
  settings: z.unknown().optional(),
});

export const LoginResponseSchema = z.object({
  user: UserSchema,
  connect: z.boolean(),
  clientData: z
    .object({
      successAction: z.looseObject({ type: z.string() }).optional(),
    })
    .optional(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
