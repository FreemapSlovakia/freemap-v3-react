import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import storage from 'local-storage-fallback';
import { useCallback, useState } from 'react';
import z from 'zod';
import {
  CustomLayerOrderSchema,
  EXPORTABLE_LAYERS,
  ExportableLayerSchema,
  FormatSchema,
} from './types.js';

const STORAGE_KEY = 'fm.exportMap.settings';

// Numeric fields are kept as strings so a half-typed/invalid value survives in
// the input (validation happens at export time).
export const ExportSettingsSchema = z.object({
  scale: z.string().catch('100'),
  format: FormatSchema.catch('jpeg'),
  customLayerOrder: CustomLayerOrderSchema.catch('natural'),
  scaleBar: z.boolean().catch(true),
  northArrow: z.boolean().catch(true),
  attribution: z.boolean().catch(true),
  glow: z.boolean().catch(true),
  glowColor: z.string().catch('#ffffff80'),
  glowWidth: z.string().catch('2'),
  labelColor: z.string().catch('#8000ff'),
  labelWeight: z.string().catch('700'),
  labelSize: z.string().catch('15'),
  layers: z.array(ExportableLayerSchema).catch([...EXPORTABLE_LAYERS]),
});

export type ExportSettings = z.infer<typeof ExportSettingsSchema>;

function load(): ExportSettings {
  const raw = storage.getItem(STORAGE_KEY);

  try {
    return ExportSettingsSchema.parse(raw ? JSON.parse(raw) : {});
  } catch {
    return ExportSettingsSchema.parse({});
  }
}

/**
 * Single source of truth for the persisted map-to-document export options.
 * Replaces a dozen individual `usePersistentState` calls with one settings
 * object plus an `update(patch)` setter; persistence is gated on cookie
 * consent, exactly like `usePersistentState`.
 */
export function useExportSettings() {
  const [settings, setSettings] = useState(load);

  const cookiesEnabled = useAppSelector(
    (state) => state.cookieConsent.cookieConsentResult !== null,
  );

  const update = useCallback(
    (patch: Partial<ExportSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };

        if (cookiesEnabled) {
          storage.setItem(STORAGE_KEY, JSON.stringify(next));
        }

        return next;
      });
    },
    [cookiesEnabled],
  );

  return [settings, update] as const;
}
