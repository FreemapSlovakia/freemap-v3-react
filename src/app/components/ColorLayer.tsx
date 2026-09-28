import { createLayerComponent, type LayerProps } from '@react-leaflet/core';
import { DomUtil, Layer, type Map as LeafletMap } from 'leaflet';

type Props = LayerProps & {
  /** A CSS colour. */
  color: string;
  opacity: number;
  zIndex: number;
  minZoom?: number;
  maxZoom?: number;
};

/** One colour all over: a single element in `tilePane`, stacked like the tile layers. */
class LColorLayer extends Layer {
  private props: Props;

  private el?: HTMLDivElement;

  constructor(props: Props) {
    super();

    this.props = props;
  }

  getEvents() {
    return {
      move: this.reposition,
      zoomend: this.reposition,
      viewreset: this.resize,
      resize: this.resize,
    };
  }

  onAdd(map: LeafletMap) {
    this.el = DomUtil.create('div', 'leaflet-layer', map.getPane('tilePane'));

    this.el.style.pointerEvents = 'none';

    this.restyle();

    this.resize();

    return this;
  }

  onRemove() {
    this.el?.remove();

    this.el = undefined;

    return this;
  }

  setProps(props: Props) {
    this.props = props;

    this.restyle();

    this.reposition();
  }

  private restyle() {
    if (this.el) {
      this.el.style.background = this.props.color;
      this.el.style.opacity = String(this.props.opacity);
      this.el.style.zIndex = String(this.props.zIndex);
    }
  }

  // Three viewports wide and tall, so a pan never shows an edge before `move`.
  private reposition = () => {
    const map = this._map;

    if (!map || !this.el) {
      return;
    }

    const zoom = map.getZoom();

    const { minZoom = 0, maxZoom = Infinity } = this.props;

    this.el.style.display = zoom < minZoom || zoom > maxZoom ? 'none' : '';

    const size = map.getSize();

    DomUtil.setPosition(
      this.el,
      map.containerPointToLayerPoint([-size.x, -size.y]),
    );
  };

  private resize = () => {
    const size = this._map?.getSize();

    if (size && this.el) {
      this.el.style.width = `${size.x * 3}px`;
      this.el.style.height = `${size.y * 3}px`;
    }

    this.reposition();
  };
}

export const ColorLayer = createLayerComponent<LColorLayer, Props>(
  (props, context) => ({ instance: new LColorLayer(props), context }),
  (instance, props) => {
    instance.setProps(props);
  },
);
