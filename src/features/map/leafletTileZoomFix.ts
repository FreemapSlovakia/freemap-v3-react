import { type Coords, GridLayer, type GridLayerOptions } from 'leaflet';

// Upstream 1.9.4 bodies plus the `Math.round` `_setView` applies: unrounded,
// `redraw` builds a level 15.19 that never loads, and `_pruneTiles` drops all
// tiles at 20.19 when `maxZoom` is 20.
type Internals = {
  _map?: { getZoom(): number };
  _tileZoom?: number;
  _tiles: Record<
    string,
    { coords: Coords; current: boolean; active?: boolean; retain?: boolean }
  >;
  _clampZoom(zoom: number): number;
  _removeAllTiles(): void;
  _removeTile(key: string): void;
  _retainParent(x: number, y: number, z: number, minZoom: number): boolean;
  _retainChildren(x: number, y: number, z: number, maxZoom: number): void;
  _updateLevels(): void;
  _update(): void;
};

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

(GridLayer.prototype as unknown as { _pruneTiles(): void })._pruneTiles =
  function (this: GridLayer & Internals) {
    if (!this._map) {
      return;
    }

    const zoom = Math.round(this._map.getZoom());

    const { maxZoom = Infinity, minZoom = -Infinity } = this
      .options as GridLayerOptions;

    if (zoom > maxZoom || zoom < minZoom) {
      this._removeAllTiles();

      return;
    }

    const tiles = Object.values(this._tiles);

    for (const tile of tiles) {
      tile.retain = tile.current;
    }

    for (const tile of tiles) {
      if (tile.current && !tile.active) {
        const { x, y, z } = tile.coords;

        if (!this._retainParent(x, y, z, z - 5)) {
          this._retainChildren(x, y, z, z + 2);
        }
      }
    }

    for (const [key, tile] of Object.entries(this._tiles)) {
      if (!tile.retain) {
        this._removeTile(key);
      }
    }
  };
