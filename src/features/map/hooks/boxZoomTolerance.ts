import { Map as LeafletMap, type Point } from 'leaflet';

// Leaflet starts a box zoom on the first pixel of a Shift+drag, which swallows a
// Shift+click that jitters (the route planner's direct-line click).
const TOLERANCE = 10;

type BoxZoomInternals = {
  _map: LeafletMap;
  _moved: boolean;
  _startPoint: Point;
  _onMouseMove(e: MouseEvent): void;
};

type BoxZoomClass = typeof LeafletMap & {
  BoxZoom: { prototype: BoxZoomInternals };
  _boxZoomToleranceInstalled?: boolean;
};

const MapClass = LeafletMap as BoxZoomClass;

if (!MapClass._boxZoomToleranceInstalled) {
  MapClass._boxZoomToleranceInstalled = true;

  const proto = MapClass.BoxZoom.prototype;

  const onMouseMove = proto._onMouseMove;

  proto._onMouseMove = function (this: BoxZoomInternals, e: MouseEvent) {
    if (
      this._moved ||
      this._map.mouseEventToContainerPoint(e).distanceTo(this._startPoint) >=
        TOLERANCE
    ) {
      onMouseMove.call(this, e);
    }
  };
}
