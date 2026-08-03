import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { TileLayer } from 'leaflet';
import { useEffect, useMemo, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import transparent1x1 from '@/images/1x1-transparent.png';
import { type RadarFrame, radarTileUrl } from '../api.js';
import { useRadarPlayback } from '../hooks/useRadarPlayback.js';
import { weatherRadarRefresh } from '../model/actions.js';
import { radarFramesSelector, radarIndexSelector } from '../model/selectors.js';

/** Floor between two frame-list re-reads provoked by a vanished frame. */
const DEAD_FRAME_REFRESH_MS = 5_000;

type Props = {
  opacity: number;
  zIndex: number;
  maxZoom: number;
  maxNativeZoom?: number;
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
export default function RadarLayer({
  opacity,
  zIndex,
  maxZoom,
  maxNativeZoom,
}: Props) {
  const map = useMap();

  const dispatch = useDispatch();

  const frames = useAppSelector(radarFramesSelector);

  const index = useAppSelector(radarIndexSelector);

  const playing = useAppSelector((state) => state.weatherRadar.playing);

  const colorScheme = useAppSelector(
    (state) => state.weatherRadarSettings.colorScheme,
  );

  const smooth = useAppSelector((state) => state.weatherRadarSettings.smooth);

  const snow = useAppSelector((state) => state.weatherRadarSettings.snow);

  const resolutionScale = useAppSelector((state) => state.map.resolutionScale);

  // The server renders at 256 or 512 for the same tile, so the @2x version is
  // a URL away. `resolutionScale` is the user's override of the screen's own
  // ratio, the same input the other layers scale from.
  const size =
    (resolutionScale ?? window.devicePixelRatio ?? 1) > 1.4
      ? (512 as const)
      : (256 as const);

  useRadarPlayback();

  // Every frame's URL carries these, so a change invalidates the whole pool.
  const tileOptions = useMemo(
    () => ({ colorScheme, smooth, snow, size }),
    [colorScheme, smooth, snow, size],
  );

  const layersRef = useRef(new Map<number, TileLayer>());

  const loadedRef = useRef(new Set<number>());

  /** The frame currently at full opacity. */
  const shownRef = useRef<number>(undefined);

  /** The frame asked for last — a load resolving after a newer ask is stale. */
  const wantedRef = useRef<number>(undefined);

  const opacityRef = useRef(opacity);

  opacityRef.current = opacity;

  function reveal(frameTime: number) {
    const layers = layersRef.current;

    if (
      wantedRef.current !== frameTime ||
      !loadedRef.current.has(frameTime) ||
      shownRef.current === frameTime
    ) {
      return;
    }

    if (shownRef.current !== undefined) {
      layers.get(shownRef.current)?.setOpacity(0);
    }

    layers.get(frameTime)?.setOpacity(opacityRef.current);

    shownRef.current = frameTime;
  }

  /** Adds the frame's layer if it isn't there yet, hidden until it has loaded. */
  function ensureLayer(frame: RadarFrame) {
    if (layersRef.current.has(frame.time)) {
      return;
    }

    const layer = new TileLayer(radarTileUrl(frame.path, tileOptions), {
      opacity: 0,
      zIndex,
      maxZoom,
      maxNativeZoom,
      errorTileUrl: transparent1x1,
      // A frame is one moment in time: tiles kept from the previous view would
      // be redrawn at a zoom this frame is no longer showing.
      keepBuffer: 0,
    });

    // `load` fires once every tile has settled — and an errored tile counts as
    // settled, because `errorTileUrl` renders in its place. So the outcome has
    // to be counted, or a frame the server no longer has would be revealed as
    // a sheet of nothing over the frame that was working.
    let ok = 0;

    let failed = 0;

    layer.on('tileload', () => {
      ok++;
    });

    layer.on('tileerror', () => {
      failed++;
    });

    layer.on('load', () => {
      if (ok === 0 && failed > 0) {
        // Nothing of this frame exists any more: the window rolls forward
        // every ten minutes and the list in hand can be a poll behind it. Ask
        // for a fresh one rather than leaving a dead frame on the timeline.
        onDeadFrameRef.current();

        return;
      }

      loadedRef.current.add(frame.time);

      revealRef.current(frame.time);
    });

    layersRef.current.set(frame.time, layer);

    layer.addTo(map);
  }

  function dropFrames(...keep: (number | undefined)[]) {
    for (const [frameTime, layer] of layersRef.current) {
      if (!keep.includes(frameTime)) {
        layer.remove();

        layersRef.current.delete(frameTime);

        loadedRef.current.delete(frameTime);
      }
    }
  }

  /**
   * Re-reads the frame list after a frame turns out to be gone, at most once
   * every few seconds — every tile of a dead frame reports the same news.
   */
  function onDeadFrame() {
    const now = performance.now();

    if (now - lastDeadFrameRef.current < DEAD_FRAME_REFRESH_MS) {
      return;
    }

    lastDeadFrameRef.current = now;

    dispatch(weatherRadarRefresh());
  }

  const lastDeadFrameRef = useRef(-Infinity);

  // Effects and Leaflet callbacks reach the current closures through these, so
  // neither has to list every prop the helpers read among its dependencies.
  const onDeadFrameRef = useRef(onDeadFrame);

  onDeadFrameRef.current = onDeadFrame;

  const revealRef = useRef(reveal);

  revealRef.current = reveal;

  const ensureLayerRef = useRef(ensureLayer);

  ensureLayerRef.current = ensureLayer;

  const dropFramesRef = useRef(dropFrames);

  dropFramesRef.current = dropFrames;

  const frame = frames[index];

  const optionsRef = useRef(tileOptions);

  useEffect(() => {
    // The tile options are baked into every URL, so a change starts a new pool.
    if (optionsRef.current !== tileOptions) {
      optionsRef.current = tileOptions;

      dropFramesRef.current();

      shownRef.current = undefined;
    }

    if (!frame) {
      return;
    }

    wantedRef.current = frame.time;

    ensureLayerRef.current(frame);

    revealRef.current(frame.time);
  }, [frame, tileOptions]);

  // While playing, the next frame loads behind the current one, so a step lands
  // on tiles that are already there instead of stalling on the first pass.
  useEffect(() => {
    const next = playing ? frames[(index + 1) % frames.length] : undefined;

    if (next) {
      ensureLayerRef.current(next);
    }
  }, [playing, frames, index]);

  // Frames the server has dropped can never be shown again.
  useEffect(() => {
    const times = new Set(frames.map((f) => f.time));

    for (const [frameTime, layer] of layersRef.current) {
      if (!times.has(frameTime)) {
        layer.remove();

        layersRef.current.delete(frameTime);

        loadedRef.current.delete(frameTime);
      }
    }
  }, [frames]);

  useEffect(() => {
    if (shownRef.current !== undefined) {
      layersRef.current.get(shownRef.current)?.setOpacity(opacity);
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
