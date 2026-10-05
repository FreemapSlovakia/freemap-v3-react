import '@maplibre/maplibre-gl-leaflet';
import { createTileLayerComponent, type LayerProps } from '@react-leaflet/core';
import * as L from 'leaflet';
import { type Map as MaplibreMap, setWorkerUrl } from 'maplibre-gl';
import '../maplibreLanguage.js';

// maplibre-gl ships its worker as a separate file that auto-detects itself from
// `import.meta.url` — which points at the bundle, not the worker, once rspack
// has inlined the library, so the URL has to be handed over explicitly. rspack
// emits the worker and the module it imports as assets; see
// doc/build-and-deploy.md.
setWorkerUrl(
  new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url).href,
);

class MaplibreWithLang extends L.MaplibreGL {
  _language?: string | null;

  _loaded = false;

  _zIndex?: number;

  _opacity?: number;

  constructor(options: MaplibreLayerProps) {
    super(options);

    this._language = options.language;

    this._zIndex = options.zIndex;

    this._opacity = options.opacity;
  }

  setLanguage(lang: string) {
    // this._language = lang; // unnnecessary

    (
      this.getMaplibreMap() as MaplibreMap & {
        setLanguage: (lang: string) => void;
      }
    ).setLanguage(lang);
  }

  setZIndex(zIndex: number | undefined) {
    this._zIndex = zIndex;

    const container = this.getContainer();

    if (container) {
      container.style.zIndex = zIndex === undefined ? '' : String(zIndex);
    }
  }

  /** On the canvas's container, as the GL map has no opacity of its own. */
  setOpacity(opacity: number | undefined) {
    this._opacity = opacity;

    const container = this.getContainer();

    if (container) {
      container.style.opacity = opacity === undefined ? '' : String(opacity);
    }
  }

  onAdd(map: L.Map) {
    L.MaplibreGL.prototype.onAdd.call(this, map);

    this.setZIndex(this._zIndex);

    this.setOpacity(this._opacity);

    if (this._language) {
      this.setLanguage(this._language);
    }

    return this;
  }

  onRemove(map: L.Map) {
    const self = this as unknown as {
      _glMap?: { remove(): void; painter?: unknown } | null;
      _container?: HTMLElement;
    };

    // When GL initialization failed (e.g. no WebGL context on a low-end
    // device), `_glMap` is either missing or a map whose constructor bailed out
    // before assigning `painter`, and either way `remove()` throws. `painter`
    // is only ever set on a successful init, so stub on its absence and let the
    // rest of teardown (detaching the pane container) run.
    if (!self._glMap?.painter) {
      self._glMap = { remove() {} };
    }

    // Upstream detaches the container from its pane before disposing the GL
    // map, and throws if the container was already taken out — put it back so
    // the disposal still runs and the WebGL context isn't leaked.
    const pane = map.getPane(this.getPaneName());

    if (pane && self._container && self._container.parentNode !== pane) {
      pane.appendChild(self._container);
    }

    L.MaplibreGL.prototype.onRemove.call(this, map);

    return this;
  }
}

type MaplibreLayerProps = LayerProps &
  L.LeafletMaplibreGLOptions & {
    language?: string | null;
    zIndex?: number;
    opacity?: number;
  };

export default createTileLayerComponent<MaplibreWithLang, MaplibreLayerProps>(
  (props, context) => ({
    // maplibre-gl-leaflet drives the inner GL map at leafletZoom - 1, so its
    // minZoom must be offset by the same -1 or the map clamps and misaligns at
    // low zoom.
    instance: new MaplibreWithLang({
      ...props,
      minZoom: props.minZoom == null ? props.minZoom : props.minZoom - 1,
    }),
    context,
  }),

  (instance, props, prevProps) => {
    if (props.language !== prevProps.language) {
      instance.setLanguage(props.language ?? 'native');
    }

    if (props.zIndex !== prevProps.zIndex) {
      instance.setZIndex(props.zIndex);
    }

    if (props.opacity !== prevProps.opacity) {
      instance.setOpacity(props.opacity);
    }
  },
);
