import { DomEvent, Layer } from 'leaflet';

/**
 * Leaflet 1.9.4: `bindTooltip` puts DOM `focus`/`blur` listeners on the layer's
 * element, and `unbindTooltip` never takes them off — `_initTooltipInteractions`
 * only undoes the layer events it added. The focus handler then fires against a
 * tooltip that is no longer there:
 *
 *     Uncaught TypeError: Cannot set properties of null (setting '_source')
 *
 * Reachable from any marker whose tooltip comes and goes while the marker stays
 * — a drawing point whose label is cleared, the panorama's eye once dragged off
 * the rendered spot. Patched at the one method both of Leaflet's walks funnel
 * through: upstream's body plus the guard it is missing.
 */
type TooltipLayer = Layer & {
  _tooltip?: { _source?: unknown } | null;
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
    'leafletTooltipFocusFix: Layer.prototype._addFocusListenersOnLayer is gone — check whether Leaflet fixed the leak and drop this patch',
  );
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
      if (!this._tooltip) {
        return;
      }

      this._tooltip._source = layer;

      this.openTooltip();
    },
    this,
  );

  DomEvent.on(el, 'blur', this.closeTooltip, this);
};
