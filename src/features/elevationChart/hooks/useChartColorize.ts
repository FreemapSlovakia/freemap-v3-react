import { lineParts } from '@features/dataViewer/trackLineParts.js';
import {
  isTrackLine,
  resolveActiveTrack,
} from '@features/dataViewer/trackSelection.js';
import { isPremium } from '@features/premium/premium.js';
import {
  readLineStart,
  routeColorizeFeatures,
} from '@features/routePlanner/model/pathDetails.js';
import { routePremiumUnlockedSelector } from '@features/routePlanner/model/reducer.js';
import { trackPointsToFeature } from '@features/tracking/trackGeojson.js';
import { resolveTrack, splitTrackSegments } from '@features/tracking/tracks.js';
import {
  availableColorizer,
  type ColorizedPoint,
  type Colorizer,
  colorizeGeometrySource,
} from '@shared/colorizers/colorize.js';
import { colorizers } from '@shared/colorizers/index.js';
import { unlockedColorizingMode } from '@shared/colorizers/premiumColorize.js';
import { cumulativeDistances, distanceTo } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { Feature, LineString } from 'geojson';
import { useMemo } from 'react';

/** A colorized vertex placed on the profile's own distance axis. */
export interface ColorizedAtDistance {
  distance: number;
  /** Palette position, as {@link ColorizedPoint.color}. */
  color: number;
  /** The mode has no value here; the chart paints it neutral. */
  gap: boolean;
}

/**
 * A line to colorize, and where it starts on the profile's distance axis when
 * that is not simply where the previous one ended — a route's runs have the
 * unrouted stretches between them cut out, a tracked device's segments have the
 * pause the split was made at.
 */
type ColorizeSource = { feature: Feature<LineString>; start?: number };

// A source starting no further than this past the last one is taken to carry on
// from it: the colorized line and the profile's own can be measured off slightly
// different geometry, and nothing worth marking as cut out is this short.
const CUT_SLACK_METERS = 5;

const EMPTY_SOURCES: ColorizeSource[] = [];

const EMPTY_STOPS: ColorizedAtDistance[] = [];

/**
 * The colorize the chart paints its fill with: the mode belongs to the feature
 * the chart is aimed at, so the two views of one line never disagree about what
 * they are showing. A target whose feature has no colorize setting (a drawn
 * line, a recording) gets none.
 *
 * The values are placed on a distance axis walked from the colorized vertices
 * themselves rather than paired with the profile's points by index: the profile
 * may be resampled, and a span-based mode reads the plain line where everything
 * else reads the densified one, so the two are not the same series of points.
 */
export function useChartColorize(
  metersPerPixel: number,
  /** How long the profile is, so a cut-out tail is left uncolored too. */
  profileMeters: number,
): {
  colorizer: Colorizer | null;
  stops: ColorizedAtDistance[];
} {
  const target = useAppSelector((state) => state.elevationChart.target);

  const routeMode = useAppSelector(
    (state) => state.routePlannerSettings.colorizeBy,
  );

  const trackMode = useAppSelector(
    (state) => state.trackViewerSettings.colorizeTrackBy,
  );

  const trackingMode = useAppSelector(
    (state) => state.trackingSettings.colorizeBy,
  );

  // The route planner grants its premium modes to a shared route, so the chart
  // aimed at one has to ask it rather than premium status alone — otherwise the
  // line would be coloured and the profile under it plain.
  const routeUnlocked = useAppSelector(routePremiumUnlockedSelector);

  const premium = useAppSelector((state) => isPremium(state.auth.user));

  const mode =
    target?.type === 'route-planner'
      ? unlockedColorizingMode(routeMode, routeUnlocked)
      : unlockedColorizingMode(
          target?.type === 'track-viewer'
            ? trackMode
            : target?.type === 'tracking'
              ? trackingMode
              : null,
          premium,
        );

  const picked = mode ? colorizers[mode] : null;

  // Only what the charted target is drawn from: a live device reporting a fix
  // would otherwise rebuild the sources — and re-colorize the whole line — for a
  // chart aimed at a route.
  const routing = target?.type === 'route-planner';

  const viewing = target?.type === 'track-viewer';

  const tracking = target?.type === 'tracking';

  const alternatives = useAppSelector((state) =>
    routing ? state.routePlanner.alternatives : null,
  );

  const activeAlternativeIndex = useAppSelector((state) =>
    routing ? state.routePlanner.activeAlternativeIndex : 0,
  );

  const renderGeojson = useAppSelector((state) =>
    routing ? state.routePlanner.renderGeojson : null,
  );

  const trackGeojson = useAppSelector((state) =>
    viewing ? state.trackViewer.trackGeojson : null,
  );

  const renderTrackGeojson = useAppSelector((state) =>
    viewing ? state.trackViewer.renderTrackGeojson : null,
  );

  const activeTrackIndex = useAppSelector((state) =>
    viewing ? state.trackViewer.activeTrackIndex : null,
  );

  const tracks = useAppSelector((state) =>
    tracking ? state.tracking.tracks : null,
  );

  const trackedDevices = useAppSelector((state) =>
    tracking ? state.tracking.trackedDevices : null,
  );

  // What each host colorizes on the map, narrowed to the one line the chart
  // draws — same geometry, same cuts, so the colors mean the same in both.
  const sources = useMemo((): ColorizeSource[] => {
    if (!picked || !target) {
      return EMPTY_SOURCES;
    }

    switch (target.type) {
      case 'route-planner':
        return routeColorizeFeatures(
          alternatives?.[activeAlternativeIndex],
          colorizeGeometrySource(picked, renderGeojson),
        ).map((feature) => ({ feature, start: readLineStart(feature) }));

      case 'track-viewer': {
        const active = resolveActiveTrack(trackGeojson, activeTrackIndex);

        if (!active) {
          return EMPTY_SOURCES;
        }

        // The densified line where there is one, which is what the map
        // colorizes and what the profile itself is drawn from.
        const rendered = renderTrackGeojson?.features[active.index];

        const drawn =
          rendered && isTrackLine(rendered) ? rendered : active.feature;

        // The profile adds no distance across the break between two segments,
        // so neither does the axis: each starts where the last ended.
        return lineParts(drawn).map((feature) => ({ feature }));
      }

      case 'tracking': {
        // Split the way the map splits it — the device's own settings included
        // — so a mode normalized per feature is normalized over the same points.
        // The profile is the whole track as one line, though, so its axis runs
        // through the pauses and each segment has to say where it starts.
        const track = resolveTrack(
          tracks ?? [],
          trackedDevices ?? [],
          target.token,
        );

        if (!track) {
          return EMPTY_SOURCES;
        }

        let cumulative = 0;

        let previous: { lat: number; lon: number } | undefined;

        return splitTrackSegments(track).map((segment) => {
          if (previous && segment[0]) {
            cumulative += distanceTo(previous, segment[0]);
          }

          const start = cumulative;

          for (let i = 1; i < segment.length; i++) {
            cumulative += distanceTo(segment[i - 1]!, segment[i]!);
          }

          previous = segment.at(-1);

          return { feature: trackPointsToFeature(segment), start };
        });
      }

      default:
        return EMPTY_SOURCES;
    }
  }, [
    picked,
    target,
    alternatives,
    activeAlternativeIndex,
    renderGeojson,
    trackGeojson,
    renderTrackGeojson,
    activeTrackIndex,
    tracks,
    trackedDevices,
  ]);

  const features = useMemo(
    () => sources.map(({ feature }) => feature),
    [sources],
  );

  // Memoized because `isAvailable` reads every point of every feature, and this
  // runs on every hover, pan and pinch frame.
  const colorizer = useMemo(
    () => availableColorizer(picked, features),
    [picked, features],
  );

  const steepnessScale = useAppSelector(
    (state) => state.elevationSettings.steepnessScale,
  );

  // One recompute per doubling of the chart's scale rather than one per frame
  // of a pinch; smoothing at the nearest step is indistinguishable. A span-based
  // mode reads no smoothing window at all, so its level never changes.
  const level =
    !colorizer || colorizer.spanBased || !Number.isFinite(metersPerPixel)
      ? 0
      : Math.round(Math.log2(Math.max(metersPerPixel, Number.MIN_VALUE)));

  return useMemo(() => {
    if (!colorizer || sources.length === 0) {
      return { colorizer: null, stops: EMPTY_STOPS };
    }

    const stops: ColorizedAtDistance[] = [];

    // Where the profile has been colored up to. A source starting past it was
    // cut out of the line the chart still draws — an unrouted leg, the pause a
    // tracked track was split at — and is marked as having no value rather than
    // left to the gradient, which would blend the two sides into it.
    let covered = 0;

    const skipTo = (distance: number) => {
      if (distance > covered + CUT_SLACK_METERS) {
        stops.push({ distance: covered, color: 0, gap: true });

        stops.push({ distance, color: 0, gap: true });
      }
    };

    for (const { feature, start } of sources) {
      const base = start ?? covered;

      skipTo(base);

      // One feature at a time: `compute` may return fewer arrays than it was
      // given (a span-based mode drops a run it can't paint), and a source
      // paired with another's colors would place them at the wrong distance.
      const [points] = colorizer.compute([feature], {
        metersPerPixel: 2 ** level,
        steepnessScale,
      });

      let walked = 0;

      let previous: ColorizedPoint | undefined;

      for (const point of points ?? []) {
        if (previous) {
          walked += distanceTo(previous, point);
        }

        stops.push({
          distance: base + walked,
          color: point.color,
          gap: Boolean(point.gap),
        });

        previous = point;
      }

      // The feature's own length, not how far its colors reached: a mode that
      // painted none of it still moves the axis on to the next source.
      covered =
        base +
        (cumulativeDistances(feature.geometry.coordinates).at(-1) ?? walked);
    }

    skipTo(profileMeters);

    return { colorizer, stops };
  }, [colorizer, sources, level, steepnessScale, profileMeters]);
}
