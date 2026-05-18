import { LayerSettingsSchema } from '@features/map/model/actions.js';
import {
  CustomLayerDefSchema,
  upgradeCustomLayerDefs,
} from '@shared/mapDefinitions.js';
import z from 'zod';
import { IsoDateSchema, LatLonSchema } from '@/shared/types/common.js';

export const AuthProviderSchema = z.enum([
  'facebook',
  'osm',
  'garmin',
  'google',
  'apple',
]);

export type AuthProvider = z.infer<typeof AuthProviderSchema>;

export const PurchaseSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('premium') }),
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
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;

// Strict UserSettingsSchema preceded by a legacy customLayers migration step.
// Use this for parsing settings from persisted/server payloads that may
// contain older customLayer shapes.
export const UserSettingsCompatSchema = z.preprocess((s) => {
  if (
    typeof s === 'object' &&
    s !== null &&
    'customLayers' in s &&
    Array.isArray(s.customLayers)
  ) {
    return { ...s, customLayers: upgradeCustomLayerDefs(s.customLayers) };
  }

  return s;
}, UserSettingsSchema);

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
  premiumExpiration: IsoDateSchema.nullable(),
  sendGalleryEmails: z.boolean(),
  settings: UserSettingsSchema.optional(),
});

export type User = z.infer<typeof UserSchema>;

// Wire form for server responses: settings are parsed separately because
// they may need legacy upgrade before validation.
export const RawUserSchema = UserSchema.omit({ settings: true }).extend({
  settings: z.unknown().optional(),
});

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
