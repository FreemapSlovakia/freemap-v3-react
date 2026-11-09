import {
  DomEvent,
  Layer,
  type Map as LeafletMap,
  type LeafletMouseEvent,
  Marker,
} from 'leaflet';

// A finger held on a feature with a hover label opens it until the lift, as
// `LongPressTooltip` does; the hold is the browser's `contextmenu`.
type PeekLayer = Layer & {
  _map?: LeafletMap;
  _tooltip?: { _source?: unknown };
  getTooltip(): { options: { permanent?: boolean } } | undefined;
  openTooltip(latlng?: unknown): unknown;
  closeTooltip(): unknown;
  options: { bubblingMouseEvents?: boolean };
};

// Not the cancels, which a browser may send for the long press itself; the next
// touch closes it should the lift go unreported.
const RELEASE_EVENTS = ['pointerup', 'touchend', 'pointerdown'];

// Chrome's `contextmenu` is a PointerEvent; iOS's synthesized one is not.
const isFinger = (e: MouseEvent) =>
  'pointerType' in e && typeof e.pointerType === 'string'
    ? e.pointerType !== 'mouse'
    : window.matchMedia('(hover: none)').matches;

function peek(this: PeekLayer, e: LeafletMouseEvent) {
  const map = this._map;

  const tooltip = this.getTooltip();

  // The feature pressed, where the tooltip is its group's.
  const pressed = (e.sourceTarget ?? this) as PeekLayer;

  if (!map) {
    return;
  }

  if (!tooltip || tooltip.options.permanent || !isFinger(e.originalEvent)) {
    // Listening takes the event from the map: hand it on where it wouldn't
    // bubble there, at the pointer rather than the marker.
    if (pressed.options.bubblingMouseEvents === false) {
      map.fire('contextmenu', {
        ...e,
        latlng: map.mouseEventToLatLng(e.originalEvent),
        containerPoint: map.mouseEventToContainerPoint(e.originalEvent),
      });
    }

    return;
  }

  // Neither the native menu nor the map's.
  DomEvent.preventDefault(e.originalEvent);

  DomEvent.stopPropagation(e.originalEvent);

  if (this._tooltip) {
    this._tooltip._source = pressed;
  }

  this.openTooltip(pressed instanceof Marker ? undefined : e.latlng);

  const release = () => {
    for (const type of RELEASE_EVENTS) {
      document.removeEventListener(type, release, true);
    }

    this.closeTooltip();
  };

  for (const type of RELEASE_EVENTS) {
    document.addEventListener(type, release, true);
  }
}

type Binding = {
  bindTooltip(this: PeekLayer, ...args: unknown[]): PeekLayer;
  unbindTooltip(this: PeekLayer): PeekLayer;
};

const proto = Layer.prototype as unknown as Binding;

const { bindTooltip, unbindTooltip } = proto;

// Only on layers with a label, so a long press elsewhere still opens the map's
// menu. After binding: a rebind unbinds first, which takes the listener off.
proto.bindTooltip = function (...args) {
  const layer = bindTooltip.apply(this, args);

  this.off('contextmenu', peek, this);

  this.on('contextmenu', peek, this);

  return layer;
};

proto.unbindTooltip = function () {
  this.off('contextmenu', peek, this);

  return unbindTooltip.call(this);
};
