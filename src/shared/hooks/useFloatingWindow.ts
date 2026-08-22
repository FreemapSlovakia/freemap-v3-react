import { usePersistentState } from '@shared/hooks/usePersistentState.js';
import storage from 'local-storage-fallback';
import {
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

// Absolute floor the window can be dragged to. The height the grip actually
// stops at is at least this but grows with what the content's chrome takes (see
// `minBoxHeight`), because the footer row and the content's own margins are not
// constant.
const MIN_WIDTH = 260;
const MIN_HEIGHT = 200;

// What's left for the content itself, inside its chrome, at that floor.
const MIN_CONTENT_HEIGHT = 40;

// What the box keeps clear between its edges and the viewport's, and between
// one window and the next.
const EDGE_GAP = 8;

// The `p-2` padding between the box's edges and its contents.
const BOX_PADDING = 8;

/**
 * Every floating window currently on screen, so a new one can be placed clear
 * of them. Module-level because they are separate components that never meet:
 * each pins itself out of the flow, which is exactly what stops the next one
 * from measuring a spot the first one is already sitting in.
 */
const placedBoxes: RefObject<Box | null>[] = [];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

// A mouse held down keeps reporting its position after it leaves the browser
// window, and is released there too. Kept to the viewport, the drag stops at
// the edge instead of parking the window where it can no longer be grabbed.
function pointerInView(e: PointerEvent) {
  return [
    clamp(e.clientX, 0, window.innerWidth),
    clamp(e.clientY, 0, window.innerHeight),
  ] as const;
}

// Where the window sat and how big it was when it was last dragged or resized.
// `left`/`top` are viewport coordinates: the box is taken out of the flow, so
// a toolbar appearing above it, or another window opening beside it, no longer
// carries it along.
type Box = { left: number; top: number; width: number; height: number };

const serializeBox = (box: Box | null) =>
  box ? [box.left, box.top, box.width, box.height].join(',') : '';

// Anything but the four numbers written back — nothing stored yet, an entry
// tampered with — is `null`, which says to place the window where the layout
// would have put it and pin it there. A size remembered from a roomier window
// (a desktop browser since made narrow, a phone since rotated) comes back
// fitting the screen.
function deserializeBox(value: string | null): Box | null {
  const [left, top, width, height] = (value ?? '').split(',').map(Number);

  return [left, top, width, height].every(Number.isFinite)
    ? {
        left: left!,
        top: top!,
        width: clamp(width!, MIN_WIDTH, window.innerWidth - 2 * EDGE_GAP),
        height: clamp(height!, MIN_HEIGHT, window.innerHeight - 2 * EDGE_GAP),
      }
    : null;
}

/**
 * The size a window was left at under the previous key, whose `left`/`top` were
 * an offset from where the box landed in the flow and so mean nothing now. The
 * size still does, and losing it for a panel someone had made big is the sort
 * of thing nobody reports and everybody notices.
 *
 * Through the same `storage` `usePersistentState` writes with, not
 * `localStorage` directly: where that is blocked the fallback keeps the value
 * somewhere else entirely, and reading past it would both miss the size and
 * leave the old entry behind for good. The entry is dropped once the window has
 * been placed and written under the new key, never before.
 */
function adoptLegacySize(
  storageKey: string,
): { width: number; height: number } | null {
  const [, , width, height] = (storage.getItem(legacyKeyOf(storageKey)) ?? '')
    .split(',')
    .map(Number);

  return width !== undefined &&
    height !== undefined &&
    Number.isFinite(width) &&
    Number.isFinite(height)
    ? {
        width: clamp(width, MIN_WIDTH, window.innerWidth - 2 * EDGE_GAP),
        height: clamp(height, MIN_HEIGHT, window.innerHeight - 2 * EDGE_GAP),
      }
    : null;
}

const legacyKeyOf = (storageKey: string) =>
  storageKey.replace(/\.window$/, '.box');

/**
 * Where the flow would have put the box: under everything laid out before it.
 * Computed from the siblings rather than from the box's own rectangle, so it
 * still answers once the box is pinned and out of the flow — which is what lets
 * a window that nobody has moved keep clear of a toolbar that arrives late.
 */
function flowTop(el: HTMLElement): number {
  let top = EDGE_GAP;

  for (
    let sibling = el.previousElementSibling;
    sibling;
    sibling = sibling.previousElementSibling
  ) {
    const rect = sibling.getBoundingClientRect();

    if (rect.height > 0) {
      top = Math.max(top, rect.bottom + EDGE_GAP);
    }
  }

  return top;
}

/** Half the viewport, never below what the content needs nor past its edges. */
export function halfViewportSize() {
  return {
    width: Math.min(
      Math.max(window.innerWidth / 2, 400),
      Math.max(window.innerWidth - 14, 40),
    ),
    height: Math.min(
      Math.max(window.innerHeight / 2, 300),
      Math.max(window.innerHeight - 130, 40),
    ),
  };
}

type Options = {
  /** localStorage key the box's position and size are remembered under. */
  storageKey: string;
  /**
   * Height the content's own chrome takes on top of the footer row and the box
   * padding — axis margins, a title. The resize grip stops before what's left
   * for the content collapses. Re-read as it changes, so a chrome that grows
   * with what's drawn (the chart's waypoint labels) raises the floor with it.
   */
  chromeHeight?: number;
  /** Size the window opens at when nothing is stored yet. */
  defaultSize?: () => { width: number; height: number };
};

type FloatingWindow = {
  /**
   * Goes on the box element, which also wants `classes.window`. Its geometry is
   * written straight onto the element from here, so the caller passes no style.
   */
  boxRef: (el: HTMLDivElement | null) => void;
  /** Goes on the footer row, whose height is taken off the content's. */
  footerRef: (el: HTMLDivElement | null) => void;
  /** Goes on the move grip — the only part of the box that drags it. */
  moveHandleRef: React.RefObject<HTMLDivElement | null>;
  /** Spread onto the resize grip. */
  resizeHandleProps: {
    onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerUp: () => void;
    onPointerCancel: () => void;
    onLostPointerCapture: () => void;
  };
  /** What's left inside the box for the content, the footer already taken off. */
  width: number;
  height: number;
};

/**
 * A panel floating over the map — the elevation chart, the toposcope. It
 * remembers where it was left and how big it was made, keeps itself inside a
 * window that changes under it, and reports the room its content has.
 *
 * The markup stays with the caller (see `FloatingWindow.module.css` for the box
 * and grip styles), so each panel keeps its own content, footer and buttons.
 */
export function useFloatingWindow({
  storageKey,
  chromeHeight = 0,
  defaultSize = halfViewportSize,
}: Options): FloatingWindow {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  const [footerEl, setFooterEl] = useState<HTMLDivElement | null>(null);

  const [width, setWidth] = useState(400);

  const [height, setHeight] = useState(300);

  // Taken once, so a caller passing a fresh closure each render doesn't drag
  // the placing effect along with it; it is only ever read as the window opens.
  // A size carried over from the previous storage key stands in for the
  // default, so only where the window sits is forgotten.
  const [defaultSizeOnce] = useState(
    () => () => adoptLegacySize(storageKey) ?? defaultSize(),
  );

  // Where the window was left the last time it was moved or resized. Read as
  // it opens, and written at the end of each gesture; `chosenRef` carries it
  // in between.
  const [box, setBox] = usePersistentState<Box | null>(
    storageKey,
    serializeBox,
    deserializeBox,
  );

  const [initialBox] = useState(box);

  const moveHandleRef = useRef<HTMLDivElement>(null);

  const startPosRef = useRef<[number, number]>(undefined);

  const posRef = useRef([initialBox?.left ?? 0, initialBox?.top ?? 0]);

  // The geometry the user chose, which is also what gets stored; `null` until
  // the window has been placed. The live box can be smaller and shifted from it
  // to fit a window too small to hold it, and is put back to this much of it as
  // each window afterwards has room for.
  const chosenRef = useRef<Box | null>(initialBox);

  /**
   * Whether where the window sits is the user's answer rather than the
   * layout's. A stored box is one, so a window put somewhere deliberately is
   * not shuffled about by a toolbar arriving afterwards.
   */
  const movedRef = useRef(initialBox !== null);

  // Stored at the end of a gesture rather than on every move, so a drag writes
  // to storage once.
  const persistBox = useCallback(() => {
    movedRef.current = true;

    setBox(chosenRef.current);

    // The size carried over from the old key is now written under the new one,
    // so the entry it came from can go. Only here: dropping it as it was read
    // would have lost the size for good if the window was closed before any
    // gesture ever wrote anything.
    storage.removeItem(legacyKeyOf(storageKey));
  }, [setBox, storageKey]);

  // Neither the chrome nor the footer is constant — the chart's top margin
  // grows with its waypoint labels, the footer rewraps as the box narrows — so
  // the floor the height stops at has to be measured, or the content between
  // them collapses.
  const minBoxHeight = useCallback(
    () =>
      Math.max(
        MIN_HEIGHT,
        chromeHeight +
          MIN_CONTENT_HEIGHT +
          (footerEl?.offsetHeight ?? 0) +
          2 * BOX_PADDING,
      ),
    [chromeHeight, footerEl],
  );

  // Lays the chosen box out in the window there is: shrunk to fit it, then
  // nudged in. Always derived from the chosen one rather than from where the
  // box currently is, so a window that shrinks and grows back — a phone turned
  // twice, an Android URL bar sliding in and out — leaves nothing behind.
  //
  // The box is pinned from here rather than through React state: its geometry
  // has to be right in the same frame the size is written, and a resize gesture
  // writes to the same four properties.
  const fitIntoView = useCallback(() => {
    const chosen = chosenRef.current;

    if (!ref || !chosen) {
      return;
    }

    // A window nobody has moved is still the layout's to place, so its spot is
    // re-derived every time anything moves: the toolbars arrive as their own
    // lazy chunks, and a panel pinned before its tool's menu existed would sit
    // over the very controls it belongs to.
    if (!movedRef.current) {
      chosen.top = placedBoxes.reduce((below, other) => {
        const box = other.current;

        return box &&
          box !== chosen &&
          box.left < chosen.left + chosen.width &&
          chosen.left < box.left + box.width &&
          below < box.top + box.height + EDGE_GAP
          ? box.top + box.height + EDGE_GAP
          : below;
      }, flowTop(ref));
    }

    const width = clamp(
      chosen.width,
      MIN_WIDTH,
      window.innerWidth - 2 * EDGE_GAP,
    );

    const height = clamp(
      chosen.height,
      minBoxHeight(),
      window.innerHeight - 2 * EDGE_GAP,
    );

    // Nudged as little as possible, and towards the top-left corner when the
    // box no longer fits at all.
    const left = clamp(
      chosen.left,
      EDGE_GAP,
      window.innerWidth - width - EDGE_GAP,
    );

    const top = clamp(
      chosen.top,
      EDGE_GAP,
      window.innerHeight - height - EDGE_GAP,
    );

    posRef.current = [left, top];

    // What was actually laid out, so the next window stacks against where this
    // one is rather than where it asked to be.
    chosen.left = left;

    chosen.top = top;

    ref.style.position = 'fixed';

    ref.style.width = `${width}px`;

    ref.style.height = `${height}px`;

    ref.style.left = `${left}px`;

    ref.style.top = `${top}px`;
  }, [ref, minBoxHeight]);

  // A window nobody has moved yet is placed where the layout would have put it
  // — under the toolbars — and pinned there. That keeps the opening position
  // the one the page decides, without leaving the box in the flow afterwards,
  // where a toolbar appearing or another window opening would shove it sideways.
  //
  // Laid out before paint, since the box is on screen unpinned until it runs.
  useLayoutEffect(() => {
    if (!ref) {
      return;
    }

    if (!chosenRef.current) {
      // `left`/`top` are placeholders: `fitIntoView` derives both for as long
      // as nobody has moved the window.
      chosenRef.current = {
        left: EDGE_GAP,
        top: EDGE_GAP,
        ...defaultSizeOnce(),
      };
    }

    // The ref rather than the box, so a window that is since dragged away stops
    // holding the spot it opened in.
    placedBoxes.push(chosenRef);

    fitIntoView();

    window.addEventListener('resize', fitIntoView);

    // What the box shares its container with decides where an unmoved one
    // sits, and the toolbars above it arrive as their own lazy chunks — long
    // after this ran.
    const observer = new ResizeObserver(fitIntoView);

    if (ref.parentElement) {
      for (const sibling of ref.parentElement.children) {
        observer.observe(sibling);
      }
    }

    return () => {
      window.removeEventListener('resize', fitIntoView);

      observer.disconnect();

      const at = placedBoxes.indexOf(chosenRef);

      // `splice(-1, 1)` drops the last entry rather than nothing, which would
      // evict somebody else's window from a registry every window shares.
      if (at >= 0) {
        placedBoxes.splice(at, 1);
      }
    };
  }, [ref, fitIntoView, defaultSizeOnce]);

  // The content fills what the footer row leaves over, so both are watched: the
  // footer grows on its own once whatever it credits resolves, or whenever it
  // rewraps, and the content has to give that space back instead of pushing the
  // row out of the (clipped) window.
  useEffect(() => {
    if (!ref) {
      return;
    }

    const content = { width: 0, height: 0 };

    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        if (e.target === ref) {
          content.width = e.contentRect.width;

          content.height = e.contentRect.height;
        }
      }

      setWidth(content.width);

      setHeight(
        Math.max(content.height - (footerEl ? footerEl.offsetHeight : 0), 0),
      );
    });

    ro.observe(ref);

    if (footerEl) {
      ro.observe(footerEl);
    }

    return () => ro.disconnect();
  }, [ref, footerEl]);

  const resizeStartRef = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
    left: number;
    top: number;
  }>(undefined);

  const handleResizeStart = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!ref) {
      return;
    }

    // Capture so the grip keeps receiving moves even when a fast drag outruns
    // it, and so the map below never sees the gesture.
    e.currentTarget.setPointerCapture(e.pointerId);

    const rect = ref.getBoundingClientRect();

    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: ref.offsetWidth,
      height: ref.offsetHeight,
      left: rect.left,
      top: rect.top,
    };
  };

  const handleResizeMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = resizeStartRef.current;

    if (!start || !ref) {
      return;
    }

    // Room is measured from the box's own top-left corner, since it only grows
    // right and down; against the bare viewport, a pointer taken outside the
    // window would push the footer (this grip included) off the screen.
    ref.style.width = `${clamp(
      start.width + e.clientX - start.x,
      MIN_WIDTH,
      window.innerWidth - start.left - EDGE_GAP,
    )}px`;

    ref.style.height = `${clamp(
      start.height + e.clientY - start.y,
      minBoxHeight(),
      window.innerHeight - start.top - EDGE_GAP,
    )}px`;
  };

  const handleResizeEnd = () => {
    if (resizeStartRef.current && ref) {
      resizeStartRef.current = undefined;

      chosenRef.current = {
        left: posRef.current[0]!,
        top: posRef.current[1]!,
        width: ref.offsetWidth,
        height: ref.offsetHeight,
      };

      persistBox();
    }
  };

  useEffect(() => {
    // Only a move ever moves the window, so `posRef` always holds where it is
    // now and a release is merely the end of the gesture. Reading the position
    // off the release instead would jump the window by however far the button
    // travelled unseen — a mouse leaving the window keeps reporting itself,
    // and comes up out there.
    let moved = false;

    const handleWindowPointerDown = (e: PointerEvent) => {
      // Only the grip drags the window: a press anywhere on the content is the
      // content's, which is how a finger does what a mouse does by hovering.
      if (
        e.target instanceof Node &&
        moveHandleRef.current?.contains(e.target)
      ) {
        startPosRef.current = [e.clientX, e.clientY];

        moved = false;
      }
    };

    const handleWindowPointerUp = () => {
      if (!startPosRef.current) {
        return;
      }

      startPosRef.current = undefined;

      // A pointer that went down and up on the same spot moved nothing.
      if (moved) {
        persistBox();
      }
    };

    const handleWindowPointerMove = (e: PointerEvent) => {
      const start = startPosRef.current;

      const chosen = chosenRef.current;

      if (!start || !chosen || !ref) {
        return;
      }

      const [x, y] = pointerInView(e);

      // Measured from the last point seen — the clamped one — so a pointer
      // that left the window carries the box no further, and picks it up
      // again from the edge it stopped at.
      posRef.current = [
        posRef.current[0] + x - start[0],
        posRef.current[1] + y - start[1],
      ];

      startPosRef.current = [x, y];

      chosenRef.current = {
        ...chosen,
        left: posRef.current[0]!,
        top: posRef.current[1]!,
      };

      ref.style.left = `${posRef.current[0]}px`;

      ref.style.top = `${posRef.current[1]}px`;

      moved = true;
    };

    window.addEventListener('pointerdown', handleWindowPointerDown);

    window.addEventListener('pointerup', handleWindowPointerUp);

    window.addEventListener('pointermove', handleWindowPointerMove);

    return () => {
      window.removeEventListener('pointerdown', handleWindowPointerDown);

      window.removeEventListener('pointerup', handleWindowPointerUp);

      window.removeEventListener('pointermove', handleWindowPointerMove);
    };
  }, [persistBox, ref]);

  return {
    boxRef: setRef,
    footerRef: setFooterEl,
    moveHandleRef,
    resizeHandleProps: {
      onPointerDown: handleResizeStart,
      onPointerMove: handleResizeMove,
      onPointerUp: handleResizeEnd,
      onPointerCancel: handleResizeEnd,
      onLostPointerCapture: handleResizeEnd,
    },
    width,
    height,
  };
}
