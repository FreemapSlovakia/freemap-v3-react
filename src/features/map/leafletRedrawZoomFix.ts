import { GridLayer } from 'leaflet';

// Leaflet 1.9.4: `GridLayer.redraw` takes an unrounded `map.getZoom()` as the
// tile zoom, so at a fractional zoom it builds a level (15.19) that never loads.
type Internals = {
  _map?: { getZoom(): number };
  _tileZoom?: number;
  _clampZoom(zoom: number): number;
  _removeAllTiles(): void;
  _updateLevels(): void;
  _update(): void;
};

// Upstream's body, with the `Math.round` its `_setView` applies.
GridLayer.prototype.redraw = function (this: GridLayer & Internals) {
  if (this._map) {
    this._removeAllTiles();

    const tileZoom = this._clampZoom(Math.round(this._map.getZoom()));

    if (tileZoom !== this._tileZoom) {
      this._tileZoom = tileZoom;

      this._updateLevels();
    }

    this._update();
  }

  return this;
};
