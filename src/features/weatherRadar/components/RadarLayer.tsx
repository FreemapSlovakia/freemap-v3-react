import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { TileLayer } from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import transparent1x1 from '@/images/1x1-transparent.png';
import {
  type FeedInfo,
  feedOf,
  type RadarFeed,
  type RadarFrame,
  radarTileUrl,
} from '../api.js';
import { useRadarPlayback } from '../hooks/useRadarPlayback.js';
import { weatherRadarRefresh } from '../model/actions.js';
import {
  radarAllowedSelector,
  radarFramesSelector,
  radarIndexSelector,
} from '../model/selectors.js';

/** Floor between two frame-list re-reads provoked by the list being behind. */
const REFRESH_THROTTLE_MS = 5_000;

/**
 * Everything about a feed that is baked into its layers when they are built.
 * A change invalidates that feed's layers, which is how the anticipated
 * PNG->WebP switch — or a widened zoom band — reaches frames already built.
 *
 * Read per feed, and only while the feed is present: a failed poll drops a feed
 * from the state entirely, and treating that as a change would throw away the
 * *other* feed's layers too, blanking the map and re-fetching every tile for
 * nothing. The frames of a feed that has gone are pruned by the frame-list rule
 * instead.
 */
const buildOf = (feed?: FeedInfo) =>
  feed && `${feed.format}/${feed.minZoom}-${feed.maxZoom}`;

/** A frame's layer, and what it was built from. */
type FrameLayer = {
  layer: TileLayer;
  loaded: boolean;
  /** Whether the frame was extrapolated when this layer was built. */
  forecast: boolean;
};

type Props = {
  opacity: number;
  zIndex: number;
  maxZoom: number;
};

/**
 * The animated radar overlay: one Leaflet tile layer per frame, revealed by
 * opacity so a step never blinks through to the map underneath.
 *
 * A frame's layer is built the first time that frame is needed and then kept,
 * so a second pass through the loop is instant. All but the visible one and the
 * one asked for are dropped again whenever the view moves — every kept frame
 * would otherwise re-fetch its tiles for the new area, turning one pan into a
 * whole animation's worth of traffic.
 *
 * Playback lives here rather than in the toolbar, so the animation is tied to
 * the layer that shows it and not to a menu that can be hidden.
 */
export default function RadarLayer({ opacity, zIndex, maxZoom }: Props) {
  const map = useMap();

  const dispatch = useDispatch();

  const frames = useAppSelector(radarFramesSelector);

  const index = useAppSelector(radarIndexSelector);

  const playing = useAppSelector((state) => state.weatherRadar.playing);

  const { from, to } = useAppSelector(radarAllowedSelector);

  /**
   * Each feed's tile format and zoom band, straight from its status document —
   * the two differ, the forecast being the narrower and the more expensive to
   * compute. `updatedAt` doubles as the feed's cycle: it changes when the feed
   * is regenerated and is stable between requests, so it versions the forecast
   * tiles, whose content is recomputed under a fixed URL.
   */
  const feeds = useAppSelector((state) => state.weatherRadar.feeds);

  /** The frame currently at full opacity. */
  const shownRef = useRef<number>(undefined);

  /**
   * Frames that have finished trying: painted, or answered for with nothing.
   * Playback paces itself off this rather than off a bare timer, so a frame
   * gets its dwell from the moment it is actually on screen. It has to be
   * "finished trying" and not "painted": a frame whose every tile 404s is never
   * painted, its layer stays in the pool so Leaflet never re-fires `load`, and
   * waiting for it would stall every single pass rather than once.
   */
  const [resolved, setResolved] = useState<ReadonlySet<number>>(
    () => new Set(),
  );

  function markResolved(frameTime: number) {
    setResolved((prev) =>
      prev.has(frameTime) ? prev : new Set(prev).add(frameTime),
    );
  }

  const frame = frames[index];

  useRadarPlayback(frame !== undefined && resolved.has(frame.time));

  const layersRef = useRef(new Map<number, FrameLayer>());

  /** The frame asked for last — a load resolving after a newer ask is stale. */
  const wantedRef = useRef<number>(undefined);

  const opacityRef = useRef(opacity);

  opacityRef.current = opacity;

  function reveal(frameTime: number) {
    const layers = layersRef.current;

    if (
      wantedRef.current !== frameTime ||
      !layers.get(frameTime)?.loaded ||
      shownRef.current === frameTime
    ) {
      return;
    }

    if (shownRef.current !== undefined) {
      layers.get(shownRef.current)?.layer.setOpacity(0);
    }

    layers.get(frameTime)?.layer.setOpacity(opacityRef.current);

    shownRef.current = frameTime;
  }

  /** Adds the frame's layer if it isn't there yet, hidden until it has loaded. */
  function ensureLayer(frame: RadarFrame) {
    if (layersRef.current.has(frame.time)) {
      return;
    }

    const feed = feeds[feedOf(frame)];

    if (!feed) {
      return;
    }

    const layer = new TileLayer(
      // Only the forecast is versioned: its frames are recomputed under a fixed
      // URL, while a measured frame never changes.
      radarTileUrl(frame, feed, frame.forecast ? feed.updatedAt : undefined),
      {
        opacity: 0,
        zIndex,
        // The feed's own band, not the layer registry's: the two feeds cover
        // different zooms, and asking outside one is a 404 rather than an
        // upscale. Below and above, Leaflet scales the nearest level it has.
        minNativeZoom: feed.minZoom,
        maxNativeZoom: feed.maxZoom,
        maxZoom,
        errorTileUrl: transparent1x1,
        // The app is served with `Referrer-Policy: no-referrer`, so without
        // this a tile request carries no Referer — and the tile server
        // identifies us by it. Per-request policy overrides the document's;
        // `strict-origin-when-cross-origin` sends the origin and no path.
        referrerPolicy: 'strict-origin-when-cross-origin',
        // A frame is one moment in time: tiles kept from the previous view
        // would be redrawn at a zoom this frame is no longer showing.
        keepBuffer: 0,
      },
    );

    // `load` fires once every tile has settled — and an errored tile counts as
    // settled, because `errorTileUrl` renders in its place. So the outcome has
    // to be counted, or a frame the server no longer has would be revealed as
    // a sheet of nothing over the frame that was working.
    let ok = 0;

    let failed = 0;

    layer.on('tileload', (e) => {
      // A tile that errored is re-pointed at `errorTileUrl`, and that image
      // loading fires `tileload` in its turn — so only a tile still carrying
      // its radar URL counts as one the server answered.
      if (e.tile.getAttribute('src') !== transparent1x1) {
        ok++;
      }
    });

    layer.on('tileerror', () => {
      failed++;
    });

    const entry: FrameLayer = {
      layer,
      loaded: false,
      forecast: frame.forecast,
    };

    layer.on('load', () => {
      if (ok === 0 && failed > 0) {
        // Nothing of this frame exists any more: the window rolls forward
        // every ten minutes and the list in hand can be a poll behind it. Ask
        // for a fresh one rather than leaving a dead frame on the timeline.
        refreshFramesRef.current();

        markResolvedRef.current(frame.time);

        return;
      }

      entry.loaded = true;

      revealRef.current(frame.time);

      markResolvedRef.current(frame.time);
    });

    layersRef.current.set(frame.time, entry);

    layer.addTo(map);
  }

  function dropFrame(frameTime: number) {
    layersRef.current.get(frameTime)?.layer.remove();

    layersRef.current.delete(frameTime);

    // Nothing is on screen any more, and a rebuilt layer for the same frame
    // has to be revealed rather than taken for the one already showing.
    if (shownRef.current === frameTime) {
      shownRef.current = undefined;
    }

    // Its replacement has to earn this again.
    setResolved((prev) => {
      if (!prev.has(frameTime)) {
        return prev;
      }

      const next = new Set(prev);

      next.delete(frameTime);

      return next;
    });
  }

  function dropFrames(...keep: (number | undefined)[]) {
    for (const frameTime of [...layersRef.current.keys()]) {
      if (!keep.includes(frameTime)) {
        dropFrame(frameTime);
      }
    }
  }

  /**
   * Asks for the frame list again when what we hold turns out to be behind the
   * server, at most once every few seconds — every tile of a dead frame brings
   * the same news.
   */
  function refreshFrames() {
    const now = performance.now();

    if (now - lastRefreshRef.current < REFRESH_THROTTLE_MS) {
      return;
    }

    lastRefreshRef.current = now;

    dispatch(weatherRadarRefresh());
  }

  const lastRefreshRef = useRef(-Infinity);

  // Effects and Leaflet callbacks reach the current closures through these, so
  // neither has to list every prop the helpers read among its dependencies.
  const refreshFramesRef = useRef(refreshFrames);

  refreshFramesRef.current = refreshFrames;

  const markResolvedRef = useRef(markResolved);

  markResolvedRef.current = markResolved;

  const revealRef = useRef(reveal);

  revealRef.current = reveal;

  const ensureLayerRef = useRef(ensureLayer);

  ensureLayerRef.current = ensureLayer;

  const dropFramesRef = useRef(dropFrames);

  dropFramesRef.current = dropFrames;

  const dropFrameRef = useRef(dropFrame);

  dropFrameRef.current = dropFrame;

  const buildRef = useRef<Partial<Record<RadarFeed, string>>>({});

  const forecastCycleRef = useRef(feeds.forecast?.updatedAt);

  // Everything the pool has to unlearn when a new frame list lands. Ahead of
  // the effect that shows a frame, so a layer dropped here is rebuilt in the
  // same commit — the other order leaves the wanted frame with no layer at all
  // until the next list arrives, minutes later.
  useEffect(() => {
    const current = new Map(frames.map((f) => [f.time, f]));

    // A cycle the server has published since these layers were built. Only the
    // forecast half is affected: its frames are re-computed each cycle under
    // the same URL, so the layer holding the previous version would never ask
    // for the new one. Observed composites don't change once published, and
    // they are the bulk of the pool.
    const republished = forecastCycleRef.current !== feeds.forecast?.updatedAt;

    forecastCycleRef.current = feeds.forecast?.updatedAt;

    const rebuilt = new Set<RadarFeed>();

    for (const feed of ['radar', 'forecast'] as const) {
      const built = buildOf(feeds[feed]);

      if (built && buildRef.current[feed] && buildRef.current[feed] !== built) {
        rebuilt.add(feed);
      }

      if (built) {
        buildRef.current[feed] = built;
      }
    }

    for (const [frameTime, entry] of layersRef.current) {
      const frame = current.get(frameTime);

      // Built from a feed that has since changed how its URLs are made.
      if (frame && rebuilt.has(frame.forecast ? 'forecast' : 'radar')) {
        dropFrameRef.current(frameTime);

        continue;
      }

      // Gone from the list: it can never be shown again.
      if (!frame) {
        dropFrameRef.current(frameTime);

        continue;
      }

      // A frame that was extrapolated when this layer was built and is now
      // measured. Same timestamp, different picture — and nothing else here
      // would notice, since the pool is keyed on time alone.
      if (entry.forecast && !frame.forecast) {
        dropFrameRef.current(frameTime);

        continue;
      }

      // The visible one is spared, or the map would go blank; it is rebuilt as
      // soon as the animation moves off it.
      if (republished && entry.forecast && frameTime !== shownRef.current) {
        dropFrameRef.current(frameTime);
      }
    }
  }, [frames, feeds]);

  useEffect(() => {
    if (!frame) {
      return;
    }

    wantedRef.current = frame.time;

    ensureLayerRef.current(frame);

    revealRef.current(frame.time);
  }, [frame]);

  // While playing, the next frame loads behind the current one, so a step lands
  // on tiles that are already there instead of stalling on the first pass.
  useEffect(() => {
    // Wraps within the allowed stretch, matching playback — prefetching a
    // locked frame would fetch tiles the user is never shown.
    const next = playing ? frames[index >= to ? from : index + 1] : undefined;

    if (next) {
      ensureLayerRef.current(next);
    }
  }, [playing, frames, index, from, to]);

  // A forecast frame whose moment has passed means the list is behind the
  // server: an observed composite for it very likely exists by now.
  useEffect(() => {
    if (frame?.forecast && frame.time * 1000 <= Date.now()) {
      refreshFramesRef.current();
    }
  }, [frame]);

  useEffect(() => {
    if (shownRef.current !== undefined) {
      layersRef.current.get(shownRef.current)?.layer.setOpacity(opacity);
    }
  }, [opacity]);

  useEffect(() => {
    function onMoveEnd() {
      // The frame asked for is kept alongside the visible one: it may still be
      // loading, and dropping it would leave nothing to reveal it — the frame
      // effect only re-adds a layer when the frame itself changes, so the map
      // would stay on the previous frame until the next refresh.
      dropFramesRef.current(shownRef.current, wantedRef.current);
    }

    map.on('moveend', onMoveEnd);

    return () => {
      map.off('moveend', onMoveEnd);
    };
  }, [map]);

  useEffect(() => {
    return () => {
      dropFramesRef.current();

      shownRef.current = undefined;

      wantedRef.current = undefined;
    };
  }, []);

  return null;
}
