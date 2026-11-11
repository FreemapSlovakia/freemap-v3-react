import { DomEvent, Layer } from 'leaflet';

/**
 * Three Leaflet 1.9.4 tooltip patches; each goes on its own when Leaflet has
 * its fix, so check them one by one on a bump:
 *
 * 1. The focus listener's leak, fixed in 2.0: `bindTooltip` puts DOM
 *    `focus`/`blur` listeners on the layer's element and `unbindTooltip` never
 *    takes them off, so the handler fires against a tooltip no longer there
 *    ("Cannot set properties of null (setting '_source')"), as on a drawing
 *    point whose label is cleared, and the blur closes a permanent tooltip
 *    bound in its place (a mouse pan focuses the map). Guarded below.
 * 2. Focus opening the tooltip, unfixed even in 2.0 (Leaflet#9150): a clicked
 *    marker keeps focus, and the page regaining it reopens its tooltip with no
 *    hover. Opened here for keyboard focus only.
 * 3. A tooltip hovered during a drag opening at `moveend` wherever the pointer
 *    is (Leaflet#9059), fixed in 2.0 by #9154, whose logic `_openTooltip` takes.
 */
type TooltipLayer = Layer & {
  _tooltip?: { _source?: unknown; options: { permanent?: boolean } } | null;
  getElement?: () => HTMLElement | undefined;
  openTooltip: () => unknown;
  closeTooltip: () => unknown;
};

const patched = Layer.prototype as unknown as {
  _addFocusListenersOnLayer?: (layer: TooltipLayer) => void;
};

// A tripwire, since this replaces a private method by name: a Leaflet bump that
// renames, inlines or fixes it would otherwise leave a patch that silently does
// nothing, and the crash back with it.
if (typeof patched._addFocusListenersOnLayer !== 'function') {
  throw new Error(
    'leafletTooltipFixes: Layer.prototype._addFocusListenersOnLayer is gone — check patches 1 and 2 against the new Leaflet',
  );
}

/** By Tab, not a click; any focus where `:focus-visible` is unknown (Safari < 15.4). */
function keyboardFocused(el: HTMLElement): boolean {
  try {
    return el.matches(':focus-visible');
  } catch {
    return true;
  }
}

patched._addFocusListenersOnLayer = function (this: TooltipLayer, layer) {
  const el = typeof layer.getElement === 'function' && layer.getElement();

  if (!el) {
    return;
  }

  DomEvent.on(
    el,
    'focus',
    function (this: TooltipLayer) {
      if (!this._tooltip || !keyboardFocused(el)) {
        return;
      }

      this._tooltip._source = layer;

      this.openTooltip();
    },
    this,
  );

  // Shared, so DomEvent dedupes it across rebinds.
  DomEvent.on(el, 'blur', closeUnlessPermanent, this);
};

function closeUnlessPermanent(this: TooltipLayer) {
  if (this._tooltip && !this._tooltip.options.permanent) {
    this.closeTooltip();
  }
}

type OpeningLayer = TooltipLayer & {
  _map?: {
    dragging?: { moving(): boolean };
    once(type: string, fn: () => void): void;
  };
  _moveEndOpensTooltip?: boolean;
  _tooltip?: { _source?: unknown; options: { sticky?: boolean } } | null;
  openTooltip: (latlng?: unknown) => unknown;
};

const opening = Layer.prototype as unknown as {
  _openTooltip?: (e: {
    type: string;
    layer?: unknown;
    target?: unknown;
    latlng?: unknown;
  }) => void;
};

if (typeof opening._openTooltip !== 'function') {
  throw new Error(
    'leafletTooltipFixes: Layer.prototype._openTooltip is gone — check whether Leaflet took the #9154 fix and drop patch 3',
  );
}

// Patch 3, upstream's #9154: mid-drag, only a layer just added opens at moveend.
opening._openTooltip = function (this: OpeningLayer, e) {
  if (!this._tooltip || !this._map) {
    return;
  }

  if (this._map.dragging?.moving()) {
    if (e.type === 'add' && !this._moveEndOpensTooltip) {
      this._moveEndOpensTooltip = true;

      this._map.once('moveend', () => {
        this._moveEndOpensTooltip = false;

        opening._openTooltip!.call(this, e);
      });
    }

    return;
  }

  this._tooltip._source = e.layer || e.target;

  this.openTooltip(this._tooltip.options.sticky ? e.latlng : undefined);
};
