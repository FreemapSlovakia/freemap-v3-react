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

    // TODO attempts for HDPI print, see https://github.com/FreemapSlovakia/freemap-v3-react/issues/458

    // const picture = DomUtil.create('picture') as HTMLPictureElement;
    // const printSource = DomUtil.create(
    //   'source',
    //   undefined,
    //   picture,
    // ) as HTMLSourceElement;

    // const screenSource = DomUtil.create(
    //   'source',
    //   undefined,
    //   picture,
    // ) as HTMLSourceElement;

    // picture.style.width = '256px';
    // picture.style.height = '256px';

    // const img = DomUtil.create('img', undefined, picture) as HTMLImageElement;

    // printSource.srcset = `https://outdoor.tiles.freemap.sk/${coords.z}/${coords.x}/${coords.y}@3x`;
    // printSource.media = 'print';

    // screenSource.srcset = `https://outdoor.tiles.freemap.sk/${coords.z}/${coords.x}/${coords.y}`;
    // screenSource.media = 'screen';

    // img.srcset = `https://outdoor.tiles.freemap.sk/${coords.z}/${coords.x}/${coords.y}, https://outdoor.tiles.freemap.sk/${coords.z}/${coords.x}/${coords.y}@2x 2x, https://outdoor.tiles.freemap.sk/${coords.z}/${coords.x}/${coords.y}@3x 3x`;
    // img.src = `https://outdoor.tiles.freemap.sk/${coords.z}/${coords.x}/${coords.y}`;

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
    if (props.url !== prevProps.url) {
      instance.setUrl(props.url);
    }
  },
);
