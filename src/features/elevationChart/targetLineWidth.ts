import type { RootState } from '@app/store/store.js';
import { resolveActiveTrack } from '@features/dataViewer/trackSelection.js';
import {
  DEFAULT_TRACK_WIDTH,
  resolveTrack,
} from '@features/tracking/tracks.js';
import { lineStyleFromProperties } from '@shared/styleFromProperties.js';

/** Fallback, and what the GPS recorder draws a line at. */
const DEFAULT_WIDTH = 4;

/**
 * How wide the charted line is drawn, so the range band can be sized to the
 * halo that line wears. Each feature owns its width, hence the per-target
 * lookup; `closed` doesn't affect the width a track's properties name.
 */
export function targetLineWidth(state: RootState): number {
  const { target } = state.elevationChart;

  switch (target?.type) {
    case 'route-planner':
      return state.routePlannerSettings.lineWidth;

    case 'track-viewer': {
      const active = resolveActiveTrack(
        state.trackViewer.trackGeojson,
        state.trackViewer.activeTrackIndex,
      );

      return (
        lineStyleFromProperties(active?.feature.properties, false).width ??
        state.trackViewerSettings.style.width
      );
    }

    case 'tracking':
      return (
        resolveTrack(
          state.tracking.tracks,
          state.tracking.trackedDevices,
          target.token,
        )?.width || DEFAULT_TRACK_WIDTH
      );

    default:
      return DEFAULT_WIDTH;
  }
}
