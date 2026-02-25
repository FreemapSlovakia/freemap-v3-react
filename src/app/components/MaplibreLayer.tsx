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
}

type MaplibreLayerProps = LayerProps &
  L.LeafletMaplibreGLOptions & {
    language?: string | null;
  };

export const MaplibreLayer = createTileLayerComponent<
  MaplibreWithLang,
  MaplibreLayerProps
>(
  (props, context) => ({
    instance: new MaplibreWithLang(props),
    context,
  }),

  (instance, props, prevProps) => {
    if (props.language !== prevProps.language) {
      instance.setLanguage(props.language ?? 'native');
    }
  },
);

export default MaplibreLayer;
