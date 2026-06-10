import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import { TrackViewerMessages } from './TrackViewerMessages.js';

const factory = (language: string) =>
  import(
    /* webpackExclude: /\.template\./ */
    /* webpackChunkName: "track-viewer-translation-[request]" */
    `./${language}.tsx`
  );

export function useTrackViewerMessages(): TrackViewerMessages | undefined {
  return useLocalMessages<TrackViewerMessages>(factory);
}
