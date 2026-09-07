import {
  Handler,
  type LatLng,
  Map as LeafletMap,
  type Point,
  Util,
} from 'leaflet';

declare module 'leaflet' {
  interface MapOptions {
    /** One-finger zoom: double-tap, hold the second tap, drag down to zoom in. */
    doubleTapDragZoom?: boolean;
  }

  interface Map {
    doubleTapDragZoom: Handler;
  }
}

// Longest gap between the two taps that still reads as a double-tap.
const DOUBLE_TAP_MS = 300;

// And how long the second may stay down and still be a tap rather than a press.
const TAP_HOLD_MS = 500;

// How far apart the two taps may land, as browsers ask of a `dblclick`, and how
// far one may slide and still be a tap rather than a pan.
const TAP_SLOP_PX = 40;

// Vertical travel before the drag takes over the zoom. Under it the gesture is
// still a plain double-tap.
const ENGAGE_PX = 16;

// Vertical pixels per zoom level once it has.
const PX_PER_ZOOM_LEVEL = 100;

// Anything with a gesture of its own. Notably the route planner's line, which
// `touchMouseCompat` lets a drag insert a via point through.
const OPAQUE_TARGETS =
  '.leaflet-control, .leaflet-interactive, .leaflet-marker-draggable';

type MapInternals = {
  _animatingZoom: boolean;
  _stop(): void;
  _moveStart(zoomChanged: boolean, noMoveStart: boolean): void;
  _move(
    center: LatLng,
    zoom: number,
    data: { pinch: boolean; round: boolean },
  ): void;
  _animateZoom(
    center: LatLng,
    zoom: number,
    startAnim: boolean,
    noUpdate: unknown,
  ): void;
  _resetView(center: LatLng, zoom: number): void;
  _limitZoom(zoom: number): number;
  tapHold?: Handler;
};

/**
 * The one-finger zoom of the phone map apps: double-tap, keep the second tap
 * down, then drag — down zooms in, up zooms out, anchored on the tapped place.
 *
 * From there it runs like Leaflet's own pinch: live `_move`s while the finger
 * travels, one settling zoom at the end. A second tap that never drags is zoomed
 * a level here too — holding it prevents the touch's default, and the browser's
 * `dblclick` goes with it.
 */
class DoubleTapDragZoom extends Handler {
  private readonly map: LeafletMap & MapInternals;

  // The fingers currently on the map. A tap only counts as the second of a pair
  // while this is empty: two landing together are a pinch, whose fingers are
  // well within `DOUBLE_TAP_MS` of each other.
  private readonly down = new Set<number>();

  private lastTapAt = 0;

  private lastTapPoint?: Point;

  private pointerId?: number;

  private armed = false;

  private zooming = false;

  private startPoint?: Point;

  private startLatLng?: LatLng;

  private startZoom = 0;

  private dragStartY = 0;

  private armedAt = 0;

  private zoom = 0;

  private center?: LatLng;

  private animRequest = 0;

  // The handlers this gesture took away, to be given back exactly as found.
  private suspended: Handler[] = [];

  constructor(map: LeafletMap) {
    super(map);

    this.map = map as LeafletMap & MapInternals;
  }

  addHooks(): void {
    const container = this.map.getContainer();

    // Permanent rather than per gesture: suspending `dragging` takes Leaflet's
    // own `touch-action` away mid-drag, and the browser latches the property
    // when the finger goes down — too late to add it back by then.
    container.classList.add('fm-double-tap-drag-zoom');

    container.addEventListener('pointerdown', this.onPointerDown);

    container.addEventListener('touchstart', this.onTouchStart, {
      passive: false,
    });

    document.addEventListener('pointerup', this.onPointerRelease);

    document.addEventListener('pointercancel', this.onPointerRelease);

    document.addEventListener('contextmenu', this.onContextMenu, true);
  }

  removeHooks(): void {
    const container = this.map.getContainer();

    container.classList.remove('fm-double-tap-drag-zoom');

    container.removeEventListener('pointerdown', this.onPointerDown);

    container.removeEventListener('touchstart', this.onTouchStart);

    document.removeEventListener('pointerup', this.onPointerRelease);

    document.removeEventListener('pointercancel', this.onPointerRelease);

    document.removeEventListener('contextmenu', this.onContextMenu, true);

    this.down.clear();

    // Dropped rather than settled: this also runs from `map.remove()`, by which
    // point the map pane is gone and a view change would throw.
    this.reset();
  }

  private readonly onPointerDown = (e: PointerEvent) => {
    // Touch alone. A mouse would have this gesture swallow a pan begun right
    // after a double-click, and the wheel already zooms there; a pen may raise
    // no `touchstart`, leaving nothing to hold the browser's `dblclick` back.
    if (e.pointerType !== 'touch') {
      return;
    }

    const alone = this.down.size === 0;

    this.down.add(e.pointerId);

    if (this.armed) {
      // A second finger. Settle where the drag got to — unanimated, so
      // `_animatingZoom` doesn't turn Leaflet's pinch away — and let it take over.
      this.end(false, e.timeStamp);

      return;
    }

    if (
      !alone ||
      (e.target instanceof Element && e.target.closest(OPAQUE_TARGETS))
    ) {
      this.lastTapAt = 0;

      return;
    }

    const point = this.map.mouseEventToContainerPoint(e);

    const doubleTap =
      e.timeStamp - this.lastTapAt <= DOUBLE_TAP_MS &&
      this.lastTapPoint !== undefined &&
      point.distanceTo(this.lastTapPoint) <= TAP_SLOP_PX;

    this.lastTapAt = e.timeStamp;

    this.lastTapPoint = point;

    if (!doubleTap || this.map._animatingZoom) {
      return;
    }

    this.lastTapAt = 0;

    this.armed = true;

    this.pointerId = e.pointerId;

    this.startPoint = point;

    this.startLatLng = this.map.containerPointToLatLng(point);

    this.startZoom = this.map.getZoom();

    this.zoom = this.startZoom;

    this.armedAt = e.timeStamp;

    // A pan would otherwise run beside the zoom, and Leaflet's own long press
    // would fire a contextmenu under the held second tap.
    this.suspend(this.map.dragging);

    this.suspend(this.map.tapHold);

    document.addEventListener('pointermove', this.onPointerMove);
  };

  private readonly onPointerMove = (e: PointerEvent) => {
    if (
      !this.armed ||
      e.pointerId !== this.pointerId ||
      !this.startPoint ||
      !this.startLatLng
    ) {
      return;
    }

    const point = this.map.mouseEventToContainerPoint(e);

    if (!this.zooming) {
      const dy = point.y - this.startPoint.y;

      if (
        Math.abs(dy) < ENGAGE_PX ||
        Math.abs(point.x - this.startPoint.x) > Math.abs(dy)
      ) {
        // Travel that never went vertical is a pan the user is still waiting on,
        // so hand the touch back rather than sitting on it for good.
        if (point.distanceTo(this.startPoint) > TAP_SLOP_PX) {
          this.reset();
        }

        return;
      }

      // Measured from where the drag was taken over rather than from the tap, so
      // the zoom starts from where it stands instead of jumping by the slack.
      this.dragStartY = point.y;

      this.zooming = true;

      this.map._stop();

      this.map._moveStart(true, false);
    }

    const scale = 2 ** ((point.y - this.dragStartY) / PX_PER_ZOOM_LEVEL);

    this.zoom = Math.min(
      Math.max(
        this.map.getScaleZoom(scale, this.startZoom),
        this.map.getMinZoom(),
      ),
      this.map.getMaxZoom(),
    );

    // Keeps the tapped place under the finger as the zoom runs.
    const delta = this.startPoint.subtract(this.map.getSize().divideBy(2));

    this.center = this.map.unproject(
      this.map.project(this.startLatLng, this.zoom).subtract(delta),
      this.zoom,
    );

    Util.cancelAnimFrame(this.animRequest);

    this.animRequest = Util.requestAnimFrame(() => {
      if (this.center) {
        this.map._move(this.center, this.zoom, { pinch: true, round: false });
      }
    });
  };

  // `pointerdown` runs first, so the second tap is already armed by here. The
  // held tap would otherwise reach the browser's own long press, which cancels
  // the pointer mid-gesture and raises a context menu when the finger comes off.
  private readonly onTouchStart = (e: Event) => {
    if (this.armed) {
      e.preventDefault();
    }
  };

  private readonly onPointerRelease = (e: PointerEvent) => {
    this.down.delete(e.pointerId);

    if (e.pointerId === this.pointerId) {
      this.end(e.type === 'pointerup', e.timeStamp);

      return;
    }

    // A touch that travelled was a pan, so the next tap must not pair with it —
    // repeated flick-panning would otherwise arm the gesture and swallow a pan.
    if (
      this.lastTapPoint &&
      this.map.mouseEventToContainerPoint(e).distanceTo(this.lastTapPoint) >
        TAP_SLOP_PX
    ) {
      this.lastTapAt = 0;
    }
  };

  // A long press the prevented touch default did not head off — the app turns
  // the browser's own contextmenu into the map context menu.
  private readonly onContextMenu = (e: Event) => {
    if (this.armed) {
      e.preventDefault();

      e.stopPropagation();
    }
  };

  private suspend(handler: Handler | undefined): void {
    if (handler?.enabled()) {
      handler.disable();

      this.suspended.push(handler);
    }
  }

  /**
   * Ends the gesture and commits the zoom it reached. `lifted` says the finger
   * came off, as against the gesture being handed to pinch or cancelled — only
   * then is a second tap that never dragged worth a zoom of its own.
   */
  private end(lifted: boolean, at: number): void {
    const { armed, zooming, center, zoom, startPoint } = this;

    this.reset();

    if (!armed) {
      return;
    }

    if (!zooming || !center) {
      // The cancellation the browser used to apply before its `dblclick` was
      // prevented: a tap held this long was a press, and means to be one.
      if (
        lifted &&
        at - this.armedAt <= TAP_HOLD_MS &&
        startPoint &&
        this.map.doubleClickZoom.enabled()
      ) {
        this.zoomADoubleTapIn(startPoint);
      }

      return;
    }

    const settled = this.map._limitZoom(zoom);

    // Settles the way Leaflet's own pinch does, down to `zoomSnap` standing in
    // for `noUpdate`: a pinch updates GridLayer levels only when snapping is off.
    if (lifted && this.map.options.zoomAnimation) {
      this.map._animateZoom(center, settled, true, this.map.options.zoomSnap);
    } else {
      this.map._resetView(center, settled);
    }
  }

  /** What Leaflet's `DoubleClickZoom` would have done with the `dblclick`. */
  private zoomADoubleTapIn(at: Point): void {
    const to = this.map.getZoom() + (this.map.options.zoomDelta ?? 1);

    if (this.map.options.doubleClickZoom === 'center') {
      this.map.setZoom(to);
    } else {
      this.map.setZoomAround(at, to);
    }
  }

  /** Drops the gesture, engaged or not, leaving nothing of it behind. */
  private reset(): void {
    if (!this.armed) {
      return;
    }

    this.armed = false;

    this.zooming = false;

    this.pointerId = undefined;

    this.center = undefined;

    document.removeEventListener('pointermove', this.onPointerMove);

    Util.cancelAnimFrame(this.animRequest);

    for (const handler of this.suspended.splice(0)) {
      handler.enable();
    }
  }
}

LeafletMap.mergeOptions({ doubleTapDragZoom: false });

LeafletMap.addInitHook('addHandler', 'doubleTapDragZoom', DoubleTapDragZoom);
