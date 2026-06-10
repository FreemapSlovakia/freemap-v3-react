import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import { TrackingMessages } from './TrackingMessages.js';

const factory = (language: string) =>
  import(
    /* webpackExclude: /\.template\./ */
    /* webpackChunkName: "tracking-translation-[request]" */
    `./${language}.tsx`
  );

export function useTrackingMessages(): TrackingMessages | undefined {
  return useLocalMessages<TrackingMessages>(factory);
}
