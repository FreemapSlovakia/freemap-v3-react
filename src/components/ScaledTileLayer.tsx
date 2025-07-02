import { createTileLayerComponent } from '@react-leaflet/core';
import { Coords, DoneCallback, TileLayer, TileLayerOptions } from 'leaflet';
import { TileLayerProps } from 'react-leaflet';

type Props = TileLayerProps & {
  extraScales?: number[];
  cors?: boolean;
  premiumFromZoom?: number;
  premiumOnlyText?: string;
};

class LScaledTileLayer extends TileLayer {
  private extraScales;
  private cors;
  private premiumFromZoom;
  private premiumOnlyText;

  constructor(
    urlTemplate: string,
    extraScales?: number[],
    cors = true,
    premiumFromZoom?: number,
    premiumOnlyText?: string,
    options?: TileLayerOptions,
  ) {
    super(urlTemplate, options);

    this.extraScales = extraScales;

    this.cors = cors;

    this.premiumFromZoom = premiumFromZoom;

    this.premiumOnlyText = premiumOnlyText;
  }

  createTile(coords: Coords, done: DoneCallback) {
    const isOnPremiumZoom =
      this.premiumFromZoom !== undefined && coords.z >= this.premiumFromZoom;

    if (isOnPremiumZoom && (coords.x + coords.y * 2) % 4) {
      const div = document.createElement('div');

      div.className = 'fm-nonpremium-tile';

      if (this.premiumOnlyText) {
        div.innerHTML = '<div>' + this.premiumOnlyText + '</div>';
      }

      setTimeout(() => done(undefined, div));

      return div;
    }

    const img = super.createTile(coords, done) as HTMLImageElement;

    img.classList.toggle('fm-demo-tile', isOnPremiumZoom);

    if (this.cors) {
      img.crossOrigin = 'anonymous';
    }

    if (this.extraScales?.length) {
      img.srcset = `${img.src}, ${this.extraScales
        .map((es) => `${img.src}@${es}x ${es}x`) // TODO add support for extensions
        .join(', ')}`;

      img.onerror = () => {
        img.removeAttribute('srcset');

        img.onerror = null;
      };
    }

    return img;
  }
}

export const ScaledTileLayer = createTileLayerComponent<TileLayer, Props>(
  (props, context) => {
    const {
      url,
      extraScales,
      cors = true,
      premiumFromZoom,
      premiumOnlyText,
      ...rest
    } = props;

    return {
      instance: new LScaledTileLayer(
        url,
        extraScales,
        cors,
        premiumFromZoom,
        premiumOnlyText,
        rest,
      ),
      context,
    };
  },

  (instance, props, prevProps) => {
    if (
      (
        [
          'url',
          'extraScales',
          'cors',
          'premiumFromZoom',
          'premiumOnlyText',
        ] as const
      ).some((p) => JSON.stringify(props[p]) !== JSON.stringify(prevProps[p]))
    ) {
      instance.redraw();
    }
  },
);
