import { GridLayer, TileLayerProps, withLeaflet } from 'react-leaflet';

import {
  TileLayer as LTileLayer,
  Coords,
  DoneCallback,
  TileLayerOptions,
} from 'leaflet';

class LScaledTileLayer extends LTileLayer {
  extraScales?: number[];

  constructor(
    urlTemplate: string,
    extraScales?: number[],
    options?: TileLayerOptions,
  ) {
    super(urlTemplate, options);
    this.extraScales = extraScales;
  }

  createTile(coords: Coords, done: DoneCallback) {
    const img = super.createTile(coords, done) as HTMLImageElement;

    if (this.extraScales && this.extraScales.length) {
      img.srcset = `${img.src}, ${this.extraScales
        .map(es => `${img.src}@${es}x ${es}x`) // TODO add tupport for extensions
        .join(', ')}`;
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

type Props = TileLayerProps & { extraScales?: number[] };

class ScaledTileLayer extends GridLayer<Props, LScaledTileLayer> {
  createLeafletElement(props: Props): LScaledTileLayer {
    return new LScaledTileLayer(
      props.url,
      props.extraScales,
      this.getOptions(props),
    );
  }

  updateLeafletElement(fromProps: Props, toProps: Props) {
    super.updateLeafletElement(fromProps, toProps);
    if (toProps.url !== fromProps.url) {
      this.leafletElement.setUrl(toProps.url);
    }
  }
}

export default withLeaflet(ScaledTileLayer);
