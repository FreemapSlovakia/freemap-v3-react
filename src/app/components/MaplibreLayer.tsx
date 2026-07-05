import '@maplibre/maplibre-gl-leaflet';
import { createTileLayerComponent, LayerProps } from '@react-leaflet/core';
import * as L from 'leaflet';
import { Map as MaplibreMap } from 'maplibre-gl';
import '../maplibreLanguage.js';

class MaplibreWithLang extends L.MaplibreGL {
  _language?: string | null;

  _loaded = false;

  constructor(options: MaplibreLayerProps) {
    super(options);

    this._language = options.language;
  }

  setLanguage(lang: string) {
    // this._language = lang; // unnnecessary

    (
      this.getMaplibreMap() as MaplibreMap & {
        setLanguage: (lang: string) => void;
      }
    ).setLanguage(lang);
  }

  onAdd(map: L.Map) {
    L.MaplibreGL.prototype.onAdd.call(this, map);

    if (this._language) {
      this.setLanguage(this._language);
    }

    return this;
  }

  onRemove(map: L.Map) {
    const self = this as unknown as { _glMap?: { remove(): void } | null };

    // When GL initialization failed (e.g. no WebGL context on a low-end
    // device), `_glMap` is never assigned and the upstream onRemove throws
    // dereferencing it. Stub it so the rest of teardown (detaching the pane
    // container) still runs.
    if (!self._glMap) {
      self._glMap = { remove() {} };
    }

    L.MaplibreGL.prototype.onRemove.call(this, map);

    return this;
  }
}

type MaplibreLayerProps = LayerProps &
  L.LeafletMaplibreGLOptions & {
    language?: string | null;
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
  },
);
