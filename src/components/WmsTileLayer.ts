import { createTileLayerComponent } from '@react-leaflet/core';
import { Coords, DoneCallback, TileLayer, WMSOptions } from 'leaflet';
import { WMSTileLayerProps } from 'react-leaflet';

type Props = WMSTileLayerProps & {
  onPremiumClick?: () => void;
  premiumFromZoom?: number;
  premiumOnlyText?: string;
};

class LWmsTileLayer extends TileLayer.WMS {
  private premiumFromZoom;
  private premiumOnlyText;
  private onPremiumClick;

  constructor(
    url: string,
    options: WMSOptions,
    premiumFromZoom?: number,
    premiumOnlyText?: string,
    onPremiumClick?: () => void,
  ) {
    super(url, options);

    this.premiumFromZoom = premiumFromZoom;

    this.premiumOnlyText = premiumOnlyText;

    this.onPremiumClick = onPremiumClick;

    this.handlePremiumClick = this.handlePremiumClick.bind(this);
  }

  handlePremiumClick(e: MouseEvent) {
    e.preventDefault();

    this.onPremiumClick?.();
  }

  createTile(coords: Coords, done: DoneCallback) {
    const isOnPremiumZoom =
      this.premiumFromZoom !== undefined && coords.z >= this.premiumFromZoom;

    if (isOnPremiumZoom && (coords.x + coords.y * 2) % 4) {
      const div = document.createElement('div');

      div.className = 'fm-nonpremium-tile';

      if (this.premiumOnlyText) {
        const a = document.createElement('a');

        a.href = '#show=premium';
        a.target = '_blank';
        a.innerText = this.premiumOnlyText;
        a.onclick = this.handlePremiumClick;

        div.appendChild(a);
      }

      setTimeout(() => done(undefined, div));

      return div;
    }

    return super.createTile(coords, done);
  }
}

export const WmsTileLayer = createTileLayerComponent<TileLayer, Props>(
  (props, context) => {
    const { url, premiumFromZoom, premiumOnlyText, onPremiumClick, ...rest } =
      props;

    return {
      instance: new LWmsTileLayer(
        url,
        rest,
        premiumFromZoom,
        premiumOnlyText,
        onPremiumClick,
      ),
      context,
    };
  },

  (instance, props, prevProps) => {
    if (
      (['url', 'premiumFromZoom', 'premiumOnlyText'] as const).some(
        (p) => JSON.stringify(props[p]) !== JSON.stringify(prevProps[p]),
      )
    ) {
      instance.redraw();
    }
  },
);
