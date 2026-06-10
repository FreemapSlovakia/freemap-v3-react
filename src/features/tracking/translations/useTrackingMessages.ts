import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import { TrackingMessages } from './TrackingMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "tracking-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useTrackingMessages(): TrackingMessages | undefined {
  return useLocalMessages<TrackingMessages>(factory);
}
