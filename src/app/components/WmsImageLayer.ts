import { createLayerComponent, type LayerProps } from '@react-leaflet/core';
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
};

/** Coalesces a burst of move/zoom events into one request. */
const SETTLE_DELAY = 250;

/**
 * Where the requested image size starts out — ArcGIS Server's default `GetMap`
 * ceiling. Servers answer an oversized request with a ServiceException rather
 * than an image, so the real ceiling is learned from failures instead.
 */
const MAX_IMAGE_SIZE = 4096;

/** The size below which a failure is no longer read as the server's ceiling. */
const MIN_IMAGE_SIZE = 1024;

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

    this.pending?.remove();

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
      // this endpoint is asked for (MapServer stops at 2048, ArcGIS at 4096).
      if (!this.retried) {
        this.retried = true;
      } else if (this.lastMaxSide > MIN_IMAGE_SIZE) {
        sizeCaps.set(
          this.props.url,
          Math.max(MIN_IMAGE_SIZE, Math.floor(this.lastMaxSide / 2)),
        );
      } else {
        return;
      }

      this.update();
    });

    this.pending = image;

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

    const params = {
      service: 'WMS',
      request: 'GetMap',
      version,
      layers,
      styles: '',
      format,
      transparent,
      [v13 ? 'crs' : 'srs']: crs.code ?? 'EPSG:3857',
      bbox: (flip ? [se.y, nw.x, nw.y, se.x] : [nw.x, se.y, se.x, nw.y]).join(
        ',',
      ),
      width: Math.max(1, Math.round(width * fit)),
      height: Math.max(1, Math.round(height * fit)),
      ...resolutionParams(scale * fit),
    };

    return url + Util.getParamString(params, url);
  }

  private clear() {
    this.pending?.remove();

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
