import { LayerSettingsSchema } from '@features/map/model/actions.js';
import {
  CustomLayerDefArrayCompatSchema,
  CustomLayerDefSchema,
} from '@shared/mapDefinitions.js';
import { IsoDateSchema, LatLonSchema } from '@shared/types/common.js';
import z from 'zod';

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

// `via` selects the payment provider for the purchase action (Polar by default
// for allowlisted users, or Rovas/chrons when the user picks it). `recurring`
// is only meaningful for the Polar premium flow. Both are absent on stored
// purchase history items.
export const PurchaseSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('premium'),
    recurring: z.boolean().optional(),
    via: z.enum(['polar', 'rovas']).optional(),
  }),
  z.object({
    type: z.literal('credits'),
    amount: z.number(),
    via: z.enum(['polar', 'rovas']).optional(),
  }),
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
  // Whether there is a Polar customer portal to link to. Defaulted for
  // responses from an API that predates the field.
  polarCustomer: z.boolean().default(false),
});

export type PurchasesResponse = z.infer<typeof PurchasesResponseSchema>;

export const UserSettingsSchema = z.object({
  layersSettings: z.record(z.string(), LayerSettingsSchema).optional(),
  customLayers: z.array(CustomLayerDefSchema).optional(),
  maxZoom: z.number().optional(),
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
  // Whether premium comes from a Polar subscription (which keeps the price it
  // was created with) rather than a one-time purchase, and if so, whether it's
  // still set to auto-renew ('active') or already set to end at
  // `premiumExpiration` ('canceled'). 'none' covers both a one-time purchase
  // and no premium at all. Defaulted for user data persisted before the field
  // existed; `authInit` refreshes it.
  premiumSubscriptionStatus: z
    .enum(['none', 'active', 'canceled'])
    .default('none'),
  sendGalleryEmails: z.boolean(),
  hasPicture: z.boolean(),
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
