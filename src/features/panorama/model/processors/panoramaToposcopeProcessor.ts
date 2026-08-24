import { openTool, selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  type DrawingPoint,
  drawingPointSetAll,
} from '@features/drawing/model/actions/drawingPointActions.js';
import {
  makeToposcopeCenter,
  toposcopeCenterSelector,
} from '@features/toposcope/centerPoint.js';
import { poiSpec } from '@shared/drawingIcons.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { LatLon } from '@shared/types/common.js';
import { candidateLabels } from '../../labels/fromPeaks.js';
import { thinLabels } from '../../labels/layout.js';
import { panoramaToToposcope } from '../actions.js';
import { labelLayoutLimits } from '../settingsReducer.js';

/** The symbol a converted summit wears; only how it looks. */
const PEAK_ICON = poiSpec('peak');

/**
 * Degrees of horizon a pixel of the picture stands for at its natural framing.
 * The dial reads the density setting at this fixed magnification rather than at
 * the one on screen: zooming in names more of the skyline, and what the dial
 * says must not depend on how the picture happened to be turned or magnified
 * when the button was pressed.
 */
const REFERENCE_DEG_PER_PX = 90 / 1000;

/** Closest two rays may stand, which caps the dial at 72 of them. */
const DIAL_MIN_PITCH_DEG = 5;

/** Near enough to be the same summit, and so already on the map. */
function placeKey({ lat, lon }: LatLon): string {
  return `${lat.toFixed(5)},${lon.toFixed(5)}`;
}

export const panoramaToposcopeProcessor: Processor<typeof panoramaToToposcope> =
  {
    actionCreator: panoramaToToposcope,
    id: 'panoramaToToposcope',
    transform: ({ getState, dispatch, action }) => {
      const state = getState();

      const { render } = state.panorama;

      if (!render) {
        return;
      }

      const { replace } = action.payload;

      trackMatomo([
        'trackEvent',
        'Panorama',
        'toToposcope',
        replace ? 'replace' : 'append',
      ]);

      const settings = state.panoramaSettings;

      // What the picture names, worked out from the render rather than read off
      // the screen — the same summits whatever the view is doing. Neither end of
      // the density slider sets a pitch: the busiest asks for all the picture
      // holds, and "none" turns names off in the picture, which is not an answer
      // to a button pressed for a dial of them. Both land on the floor below.
      const pitch = Math.max(
        DIAL_MIN_PITCH_DEG,
        (labelLayoutLimits(settings.labelDensity)?.pitchPx ?? 0) *
          REFERENCE_DEG_PER_PX,
      );

      const labels = thinLabels(
        candidateLabels(
          render.labels,
          {
            hazeKm: settings.labelHazeKm,
            distanceWeight: settings.labelDistanceWeight,
          },
          {
            minDominance: settings.minDominance,
            showRevealed: settings.showRevealedLabels,
          },
        ),
        pitch,
      );

      const points: DrawingPoint[] = replace
        ? []
        : [...state.drawingPoints.points];

      const center = replace ? undefined : toposcopeCenterSelector(state);

      // Where the picture was taken from, not where the marker now stands.
      if (center) {
        points[center.index] = { ...center.point, coords: render.viewpoint };
      } else {
        points.push(makeToposcopeCenter(state, render.viewpoint));
      }

      // A summit already drawn is left as it is, so appending twice from the
      // same picture doesn't double every ray.
      const taken = new Set(points.map(({ coords }) => placeKey(coords)));

      for (const label of labels) {
        const key = placeKey(label);

        if (taken.has(key)) {
          continue;
        }

        taken.add(key);

        points.push({
          ...state.drawingSettings.style,
          coords: { lat: label.lat, lon: label.lon },
          // Referenced rather than copied, so editing the property moves the
          // label with it — and the ray's `{label}` reads the same name.
          label: '{p:name}',
          props: {
            name: label.name,
            ...(label.ele === null
              ? {}
              : { ele: String(Math.round(label.ele)) }),
          },
          icon: PEAK_ICON,
        });
      }

      // One action for the lot: adding them one by one would push a history
      // entry per summit, which WebKit refuses past a hundred in ten seconds.
      dispatch(drawingPointSetAll(points));

      // The points a `draw-points` selection named are gone with them.
      if (replace && state.main.selection?.type === 'draw-points') {
        dispatch(selectFeature(null));
      }

      dispatch(openTool('toposcope'));
    },
  };
