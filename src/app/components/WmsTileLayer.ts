import { createTileLayerComponent, updateGridLayer } from '@react-leaflet/core';
import { TileLayer } from 'leaflet';
import type { WMSTileLayerProps } from 'react-leaflet';

export const WmsTileLayer = createTileLayerComponent<
  TileLayer,
  WMSTileLayerProps
>(
  (props, context) => {
    const { url, ...rest } = props;

    return {
      instance: new TileLayer.WMS(url, rest),
      context,
    };
  },

  (instance, props, prevProps) => {
    // The stack order moves a mounted layer's z-index.
    updateGridLayer(instance, props, prevProps);

    if (props.url !== prevProps.url) {
      instance.redraw();
    }
  },
);
