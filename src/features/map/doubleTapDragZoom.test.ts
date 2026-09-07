import { Map as LeafletMap } from 'leaflet';
import { afterEach, describe, expect, it } from 'vitest';
import './doubleTapDragZoom.js';

/**
 * Drives the handler against a real Leaflet map in jsdom: the gesture is all
 * pointer events and Leaflet's own zoom math, so a stand-in map would test the
 * stand-in. jsdom gives the container no layout, hence the stubbed size.
 */
let map: LeafletMap | undefined;

function makeMap(): LeafletMap {
  const container = document.createElement('div');

  Object.defineProperty(container, 'clientWidth', { value: 400 });

  Object.defineProperty(container, 'clientHeight', { value: 300 });

  // Leaflet scales a mouse position by `rect.width / offsetWidth`, which jsdom
  // would make `Infinity` and collapse every point to the origin.
  Object.defineProperty(container, 'offsetWidth', { value: 400 });

  Object.defineProperty(container, 'offsetHeight', { value: 300 });

  container.getBoundingClientRect = () =>
    ({
      left: 0,
      top: 0,
      right: 400,
      bottom: 300,
      width: 400,
      height: 300,
    }) as DOMRect;

  document.body.append(container);

  map = new LeafletMap(container, {
    center: [48, 19],
    zoom: 10,
    doubleTapDragZoom: true,
    // The settling zoom would otherwise wait on a transitionend jsdom never fires.
    zoomAnimation: false,
    fadeAnimation: false,
  });

  return map;
}

// jsdom has no PointerEvent; the handler only reads what a MouseEvent carries
// plus these two fields.
function pointer(
  type: string,
  y: number,
  pointerId = 1,
  x = 100,
  timeStamp?: number,
): MouseEvent {
  const event = new MouseEvent(type, {
    clientX: x,
    clientY: y,
    bubbles: true,
    cancelable: true,
  });

  Object.assign(event, { pointerId, pointerType: 'touch' });

  if (timeStamp !== undefined) {
    Object.defineProperty(event, 'timeStamp', { value: timeStamp });
  }

  return event;
}

/** Two taps in the same place, the second left down for the drag to follow. */
function doubleTap(target: LeafletMap, y: number, x = 100): void {
  target.getContainer().dispatchEvent(pointer('pointerdown', y, 1, x));

  document.dispatchEvent(pointer('pointerup', y, 1, x));

  target.getContainer().dispatchEvent(pointer('pointerdown', y, 1, x));
}

afterEach(() => {
  map?.remove();

  map = undefined;

  document.body.replaceChildren();
});

describe('doubleTapDragZoom', () => {
  it('registers itself as an enabled map handler', () => {
    expect(makeMap().doubleTapDragZoom.enabled()).toBe(true);
  });

  it('zooms in on a drag down and out on a drag up', () => {
    const target = makeMap();

    doubleTap(target, 200);

    // The first 16 px only engage the drag; the next 100 are worth a level.
    document.dispatchEvent(pointer('pointermove', 180));

    document.dispatchEvent(pointer('pointermove', 280));

    document.dispatchEvent(pointer('pointerup', 280));

    expect(target.getZoom()).toBe(11);

    doubleTap(target, 200);

    document.dispatchEvent(pointer('pointermove', 180));

    document.dispatchEvent(pointer('pointermove', 80));

    document.dispatchEvent(pointer('pointerup', 80));

    expect(target.getZoom()).toBe(10);
  });

  it('holds the tapped place still while zooming', () => {
    const target = makeMap();

    const before = target.containerPointToLatLng([100, 200]);

    doubleTap(target, 200);

    document.dispatchEvent(pointer('pointermove', 180));

    document.dispatchEvent(pointer('pointermove', 280));

    document.dispatchEvent(pointer('pointerup', 280));

    const after = target.containerPointToLatLng([100, 200]);

    expect(after.lat).toBeCloseTo(before.lat, 4);

    expect(after.lng).toBeCloseTo(before.lng, 4);
  });

  it('zooms a level on a double-tap that never drags', () => {
    const target = makeMap();

    doubleTap(target, 200);

    document.dispatchEvent(pointer('pointerup', 200));

    expect(target.getZoom()).toBe(11);

    expect(target.dragging.enabled()).toBe(true);
  });

  it('prevents the held tap default, so no long press starts', () => {
    const target = makeMap();

    const container = target.getContainer();

    const firstTap = new Event('touchstart', {
      bubbles: true,
      cancelable: true,
    });

    container.dispatchEvent(pointer('pointerdown', 200));

    container.dispatchEvent(firstTap);

    // Only the tap that is held has to be taken off the browser.
    expect(firstTap.defaultPrevented).toBe(false);

    document.dispatchEvent(pointer('pointerup', 200));

    const heldTap = new Event('touchstart', {
      bubbles: true,
      cancelable: true,
    });

    container.dispatchEvent(pointer('pointerdown', 200));

    container.dispatchEvent(heldTap);

    expect(heldTap.defaultPrevented).toBe(true);
  });

  it('leaves a tap that was held rather than tapped unzoomed', () => {
    const target = makeMap();

    const container = target.getContainer();

    // Timed by hand: the two taps 200 ms apart, then the second held 800 ms,
    // which is longer than the browser would have called a tap.
    container.dispatchEvent(pointer('pointerdown', 200, 1, 100, 1000));

    document.dispatchEvent(pointer('pointerup', 200, 1, 100, 1100));

    container.dispatchEvent(pointer('pointerdown', 200, 1, 100, 1200));

    document.dispatchEvent(pointer('pointerup', 200, 1, 100, 2000));

    expect(target.getZoom()).toBe(10);

    expect(target.dragging.enabled()).toBe(true);
  });

  it('hands the touch back when the drag turns out to be a pan', () => {
    const target = makeMap();

    doubleTap(target, 200);

    expect(target.dragging.enabled()).toBe(false);

    // Sideways past the slop, never vertical.
    document.dispatchEvent(pointer('pointermove', 205, 1, 180));

    expect(target.dragging.enabled()).toBe(true);

    document.dispatchEvent(pointer('pointerup', 205, 1, 180));

    expect(target.getZoom()).toBe(10);
  });

  it('leaves a cancelled tap unzoomed', () => {
    const target = makeMap();

    doubleTap(target, 200);

    document.dispatchEvent(pointer('pointercancel', 200));

    expect(target.getZoom()).toBe(10);

    expect(target.dragging.enabled()).toBe(true);
  });

  it('leaves a pinch alone, whose fingers also land together', () => {
    const target = makeMap();

    const container = target.getContainer();

    container.dispatchEvent(pointer('pointerdown', 200, 1));

    container.dispatchEvent(pointer('pointerdown', 210, 2, 140));

    expect(target.dragging.enabled()).toBe(true);

    document.dispatchEvent(pointer('pointermove', 290, 2, 140));

    document.dispatchEvent(pointer('pointerup', 290, 2, 140));

    expect(target.getZoom()).toBe(10);
  });

  it('ignores a second tap that lands away from the first', () => {
    const target = makeMap();

    target.getContainer().dispatchEvent(pointer('pointerdown', 200));

    document.dispatchEvent(pointer('pointerup', 200));

    target.getContainer().dispatchEvent(pointer('pointerdown', 200, 1, 200));

    expect(target.dragging.enabled()).toBe(true);

    document.dispatchEvent(pointer('pointermove', 290, 1, 200));

    expect(target.getZoom()).toBe(10);
  });

  it('settles the zoom when a second finger takes the gesture over', () => {
    const target = makeMap();

    let zoomEnds = 0;

    target.on('zoomend', () => {
      zoomEnds += 1;
    });

    doubleTap(target, 200);

    document.dispatchEvent(pointer('pointermove', 180));

    document.dispatchEvent(pointer('pointermove', 280));

    target.getContainer().dispatchEvent(pointer('pointerdown', 150, 2));

    // Left neither at a fractional zoom nor without the event the store reads.
    expect(target.getZoom()).toBe(11);

    expect(zoomEnds).toBe(1);

    expect(target.dragging.enabled()).toBe(true);
  });

  it('gives dragging back however the gesture ends', () => {
    const target = makeMap();

    doubleTap(target, 200);

    expect(target.dragging.enabled()).toBe(false);

    // Engaged, then cancelled rather than lifted.
    document.dispatchEvent(pointer('pointermove', 280));

    document.dispatchEvent(pointer('pointercancel', 280));

    expect(target.dragging.enabled()).toBe(true);

    // A drag that never engaged, ended by a second finger.
    doubleTap(target, 200);

    document.dispatchEvent(pointer('pointermove', 205));

    target.getContainer().dispatchEvent(pointer('pointerdown', 150, 2));

    expect(target.dragging.enabled()).toBe(true);

    expect(target.getZoom()).toBe(10);
  });

  it('leaves a feature that owns its own gesture alone', () => {
    const target = makeMap();

    // The route planner's line inserts a via point on a drag of its own.
    const line = document.createElement('div');

    line.className = 'leaflet-interactive';

    target.getContainer().append(line);

    line.dispatchEvent(pointer('pointerdown', 200));

    document.dispatchEvent(pointer('pointerup', 200));

    line.dispatchEvent(pointer('pointerdown', 200));

    expect(target.dragging.enabled()).toBe(true);

    document.dispatchEvent(pointer('pointermove', 290));

    expect(target.getZoom()).toBe(10);
  });

  it('does not pair a tap with the pan that came before it', () => {
    const target = makeMap();

    target.getContainer().dispatchEvent(pointer('pointerdown', 200));

    // Lifted far from where it landed, so that touch was a flick-pan.
    document.dispatchEvent(pointer('pointerup', 90));

    target.getContainer().dispatchEvent(pointer('pointerdown', 200));

    expect(target.dragging.enabled()).toBe(true);

    document.dispatchEvent(pointer('pointermove', 290));

    expect(target.getZoom()).toBe(10);
  });

  it('swallows the long-press context menu while armed', () => {
    const target = makeMap();

    let menus = 0;

    target.on('contextmenu', () => {
      menus += 1;
    });

    function longPress() {
      target
        .getContainer()
        .dispatchEvent(
          new MouseEvent('contextmenu', { bubbles: true, cancelable: true }),
        );
    }

    doubleTap(target, 200);

    longPress();

    expect(menus).toBe(0);

    document.dispatchEvent(pointer('pointerup', 200));

    // Once the gesture is over, a long press is the app's again.
    longPress();

    expect(menus).toBe(1);
  });

  it('ignores pointers other than the one that started the gesture', () => {
    const target = makeMap();

    doubleTap(target, 200);

    document.dispatchEvent(pointer('pointermove', 280, 2));

    document.dispatchEvent(pointer('pointerup', 280, 2));

    expect(target.getZoom()).toBe(10);

    // The gesture is still live, and the right pointer still drives it.
    document.dispatchEvent(pointer('pointermove', 180));

    document.dispatchEvent(pointer('pointermove', 280));

    document.dispatchEvent(pointer('pointerup', 280));

    expect(target.getZoom()).toBe(11);
  });
});
