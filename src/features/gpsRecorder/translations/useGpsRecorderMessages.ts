import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import type { GpsRecorderMessages } from './GpsRecorderMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "gps-recorder-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useGpsRecorderMessages(): GpsRecorderMessages | undefined {
  return useLocalMessages<GpsRecorderMessages>(factory);
}
