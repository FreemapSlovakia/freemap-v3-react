import { createLayerComponent, type LayerProps } from '@react-leaflet/core';
import { wmsBaseUrl } from '@shared/wms.js';
import {
  ImageOverlay,
  type LatLngBounds,
  Layer,
  type Map as LeafletMap,
  type Point,
  Util,
} from 'leaflet';

export type WmsImageLayerProps = LayerProps & {
  url: string;
  layers: string;
  version: string;
  format: string;
  transparent: boolean;
  opacity: number;
  zIndex?: number;
  minZoom?: number;
  /**
   * Zoom the source stops gaining detail at. Above it the image is requested
   * smaller than the viewport and stretched, so the server is never asked for
   * detail it doesn't have.
   */
  maxNativeZoom?: number;
  /** Pixel-size multiplier of the requested image, for hi-DPI displays. */
  dpiScale?: number;
  /** Called once a view has been given up on, retries included. */
  onError?: () => void;
};

/** Coalesces a burst of move/zoom events into one request. */
const SETTLE_DELAY = 250;

/** A 1×1 transparent GIF, for pointing an image away from a request. */
const BLANK_IMAGE =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/**
 * How long a view is fetched for before the wait is worth showing. Long enough
 * that a server answering promptly never flashes anything at all.
 */
const PULSE_DELAY = 3000;

/** Must match the animation period of `.fm-wms-pulse` in `leaflet.css`. */
const PULSE_PERIOD = 1000;

/**
 * The image-size ceilings to try, largest first: ArcGIS Server defaults to
 * 4096 and MapServer to 2048. Servers answer an oversized request with a
 * ServiceException rather than an image, so which one applies is learned from
 * failures — stepping to the next of these rather than merely halving, which
 * would settle below a ceiling the server would have granted.
 */
const SIZE_STEPS = [4096, 2048, 1024];

const MAX_IMAGE_SIZE = SIZE_STEPS[0];

/**
 * The largest image each endpoint has been seen to serve, lowered whenever one
 * refuses. Kept per URL rather than per layer so that remounting a layer, or a
 * second layer of the same server, doesn't probe the same size again.
 */
const sizeCaps = new Map<string, number>();

/** The resolution a WMS renders symbology for when not told otherwise. */
const BASE_DPI = 96;

/**
 * WMS sizes symbology in pixels, so asking for a larger image alone draws
 * labels and hatching at half size. Each engine takes the resolution through a
 * parameter of its own and ignores the others, so all three are sent rather
 * than the server being guessed at: `dpi` for ArcGIS and QGIS Server,
 * `map_resolution` for MapServer, `format_options` for GeoServer.
 */
function resolutionParams(scale: number) {
  if (scale === 1) {
    return undefined;
  }

  const dpi = Math.round(BASE_DPI * scale);

  return { dpi, map_resolution: dpi, format_options: `dpi:${dpi}` };
}

/**
 * A WMS layer that asks for a single image covering the viewport instead of a
 * grid of tiles — one `GetMap` per settled view, for servers whose rate limit
 * the tile burst trips.
 */
class LWmsImageLayer extends Layer {
  private props: WmsImageLayerProps;

  /** The image on screen, and the one being fetched to replace it. */
  private current?: ImageOverlay;
  private pending?: ImageOverlay;

  private timer?: ReturnType<typeof setTimeout>;

  private lastUrl?: string;

  /** Longest side actually asked for, which a failure is measured against. */
  private lastMaxSide = 0;

  /** Whether the URL that just failed has already been tried a second time. */
  private retried = false;

  /** Marks the view being waited for, once the wait is long enough to show. */
  private pulse?: ImageOverlay;
  private pulseTimer?: ReturnType<typeof setTimeout>;
  private pulseBounds?: LatLngBounds;

  constructor(props: WmsImageLayerProps) {
    super();

    this.props = props;
  }

  getEvents() {
    return {
      moveend: this.scheduleUpdate,
      zoomend: this.scheduleUpdate,
      resize: this.scheduleUpdate,
    };
  }

  onAdd(_map: LeafletMap) {
    this.update();

    return this;
  }

  onRemove(_map: LeafletMap) {
    clearTimeout(this.timer);

    this.clear();

    return this;
  }

  setProps(props: WmsImageLayerProps) {
    const prev = this.props;

    this.props = props;

    if (props.opacity !== prev.opacity) {
      this.current?.setOpacity(props.opacity);
    }

    if (props.zIndex !== prev.zIndex) {
      this.current?.setZIndex(props.zIndex ?? 1);
      this.pending?.setZIndex(props.zIndex ?? 1);
    }

    if (
      props.url !== prev.url ||
      props.layers !== prev.layers ||
      props.version !== prev.version ||
      props.format !== prev.format ||
      props.transparent !== prev.transparent ||
      props.minZoom !== prev.minZoom ||
      props.maxNativeZoom !== prev.maxNativeZoom ||
      props.dpiScale !== prev.dpiScale
    ) {
      this.lastUrl = undefined;

      this.update();
    }
  }

  /**
   * Gives up on a request in flight. Detaching the element does not stop the
   * download; pointing it elsewhere does — at a data URI rather than at an
   * empty string, which some browsers resolve against the page and fetch. Its
   * handlers go first, since the swap reads as an error to them.
   *
   * Only those two: Leaflet keeps its own `remove` listener on a layer, which
   * is what takes the layer's handlers back off the map, and a blanket `off()`
   * would drop it — leaving a removed overlay to answer the map's `zoom` with
   * no map of its own.
   */
  private abort(overlay: ImageOverlay) {
    overlay.off('load error');

    const image = overlay.getElement();

    overlay.remove();

    if (image) {
      image.src = BLANK_IMAGE;
    }
  }

  /**
   * A blank image stretched over the view being fetched, coloured and animated
   * by its class. Leaflet then keeps it in place through pans and zooms exactly
   * as it would the real one.
   */
  private startPulse(bounds: LatLngBounds) {
    // A wait already under way carries on — a retry asks for the same view
    // again, and restarting the clock would only postpone the sign of it — but
    // it follows the view, which a failure during a pan can move out from
    // under it.
    this.pulseBounds = bounds;

    if (this.pulse) {
      this.pulse.setBounds(bounds);

      return;
    }

    if (this.pulseTimer) {
      return;
    }

    // Held back to the next turn of a clock every layer shares, so the
    // animation begins at its first frame — appearing already darkened is what
    // starting it mid-cycle would look like — and so two layers waiting at once
    // breathe together rather than each on its own beat.
    const wait =
      PULSE_DELAY +
      (((-(Date.now() + PULSE_DELAY) % PULSE_PERIOD) + PULSE_PERIOD) %
        PULSE_PERIOD);

    this.pulseTimer = setTimeout(() => {
      const map = this._map;

      if (!map || !this.pulseBounds) {
        return;
      }

      this.pulse = new ImageOverlay(BLANK_IMAGE, this.pulseBounds, {
        pane: 'tilePane',
        zIndex: this.props.zIndex ?? 1,
        className: 'fm-wms-pulse',
        interactive: false,
      }).addTo(map);
    }, wait);
  }

  private stopPulse() {
    clearTimeout(this.pulseTimer);

    this.pulseTimer = undefined;

    this.pulse?.remove();

    this.pulse = undefined;

    this.pulseBounds = undefined;
  }

  private scheduleUpdate = () => {
    // A different view is a fresh attempt, not a repeat of the failed one.
    this.retried = false;

    clearTimeout(this.timer);

    this.timer = setTimeout(() => this.update(), SETTLE_DELAY);
  };

  private update() {
    const map = this._map;

    if (!map) {
      return;
    }

    const { minZoom, zIndex } = this.props;

    if (minZoom !== undefined && map.getZoom() < minZoom) {
      this.clear();

      return;
    }

    const bounds = map.getBounds();

    const url = this.buildUrl(map, bounds, map.getSize());

    if (url === this.lastUrl) {
      return;
    }

    this.lastUrl = url;

    // Panning away from a view the server is still drawing leaves a request
    // nobody is waiting for, and a slow WMS is exactly where those pile up.
    if (this.pending) {
      this.abort(this.pending);

      this.stopPulse();
    }

    // Starts invisible and replaces the previous image only once it has loaded,
    // so panning doesn't blank the map while the request is in flight.
    const image = new ImageOverlay(url, bounds, {
      // The map layers stack in `tilePane`; the default `overlayPane` would put
      // this one above vectors and markers.
      pane: 'tilePane',
      // Passing `undefined` would shadow Leaflet's own default of 1 and leave
      // the image at `z-index: auto`, below every tile layer.
      zIndex: zIndex ?? 1,
      opacity: 0,
      interactive: false,
    });

    image.once('load', () => {
      // A superseded or already removed image can still fire `load`; promoting
      // it would drop the one actually on screen.
      if (this.pending !== image) {
        return;
      }

      image.setOpacity(this.props.opacity);

      this.retried = false;

      this.current?.remove();

      this.current = image;

      this.pending = undefined;

      this.stopPulse();
    });

    image.once('error', () => {
      image.remove();

      if (this.pending !== image) {
        return;
      }

      this.pending = undefined;

      // Let a retry rebuild the URL instead of treating the failed view as drawn.
      this.lastUrl = undefined;

      // An `<img>` error carries no status, so the two causes are told apart by
      // whether they repeat: a size refusal fails again at the same size, while
      // a dropped request usually doesn't. Only the second failure lowers what
      // this endpoint is asked for.
      const smaller = SIZE_STEPS.find((size) => size < this.lastMaxSide);

      if (!this.retried) {
        this.retried = true;
      } else if (smaller !== undefined) {
        sizeCaps.set(this.props.url, smaller);
      } else {
        // Nothing left to try at this size. What is already drawn stays: it
        // keeps the bounds it was fetched for, so it is still in the right
        // place, and the next move asks again.
        this.stopPulse();

        this.props.onError?.();

        return;
      }

      this.update();
    });

    this.pending = image;

    this.startPulse(bounds);

    image.addTo(map);
  }

  private buildUrl(map: LeafletMap, bounds: LatLngBounds, size: Point) {
    const {
      url,
      version,
      layers,
      format,
      transparent,
      maxNativeZoom,
      dpiScale,
    } = this.props;

    const crs = map.options.crs!;

    const nw = crs.project(bounds.getNorthWest());

    const se = crs.project(bounds.getSouthEast());

    const v13 = parseFloat(version) >= 1.3;

    // WMS 1.3.0 takes EPSG:4326 in lat/lon order; projected CRSs stay x/y.
    const flip = v13 && crs.code === 'EPSG:4326';

    // One image pixel per CSS pixel, times the display density — but never
    // finer than the source: at `maxNativeZoom` the density gain is dropped,
    // and above it the image shrinks by the same factor the view is overzoomed.
    const scale =
      maxNativeZoom === undefined
        ? (dpiScale ?? 1)
        : Math.min(dpiScale ?? 1, 2 ** (maxNativeZoom - map.getZoom()));

    const width = size.x * scale;

    const height = size.y * scale;

    // Both sides shrink by the same factor, so the image still stretches over
    // the bbox it was rendered for.
    const fit = Math.min(
      1,
      (sizeCaps.get(url) ?? MAX_IMAGE_SIZE) / Math.max(width, height),
    );

    this.lastMaxSide = Math.round(Math.max(width, height) * fit);

    const resolution = resolutionParams(scale * fit);

    const params = {
      service: 'WMS',
      request: 'GetMap',
      version,
      // Omitted when empty so that a `LAYERS` on the URL is not overridden.
      ...(layers ? { layers } : {}),
      styles: '',
      format,
      transparent,
      [v13 ? 'crs' : 'srs']: crs.code ?? 'EPSG:3857',
      bbox: (flip ? [se.y, nw.x, nw.y, se.x] : [nw.x, se.y, se.x, nw.y]).join(
        ',',
      ),
      width: Math.max(1, Math.round(width * fit)),
      height: Math.max(1, Math.round(height * fit)),
      ...resolution,
    };

    // Only what this request sets is taken off the URL, so that a URL tuned by
    // hand keeps the rest — its `LAYERS` above all, which is what names the
    // layers to draw when none were picked from the capabilities.
    const base = wmsBaseUrl(url, [
      ...(layers ? ['layers'] : []),
      ...(resolution ? ['dpi', 'map_resolution', 'format_options'] : []),
    ]);

    return base + Util.getParamString(params, base);
  }

  private clear() {
    this.stopPulse();

    if (this.pending) {
      this.abort(this.pending);
    }

    this.current?.remove();

    this.pending = undefined;

    this.current = undefined;

    this.lastUrl = undefined;
  }
}

export const WmsImageLayer = createLayerComponent<
  LWmsImageLayer,
  WmsImageLayerProps
>(
  (props, context) => ({ instance: new LWmsImageLayer(props), context }),

  (instance, props) => {
    instance.setProps(props);
  },
);
