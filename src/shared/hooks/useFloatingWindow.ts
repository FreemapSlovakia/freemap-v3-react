import windowClasses from '@shared/components/FloatingWindow.module.css';
import { usePersistentState } from '@shared/hooks/usePersistentState.js';
import { clamp } from '@shared/mathUtils.js';
import clsx from 'clsx';
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

// Every open window, so raising one can put the rest back down. Two levels
// rather than an ever-climbing counter, which one long session of panning a
// panorama would have carried past the full-screen z-index.
const windows = new Set<HTMLElement>();

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
  // Through the same parse, so the stored format and the clamping bounds are
  // stated once; only the position it also yields is meaningless now.
  const box = deserializeBox(storage.getItem(legacyKeyOf(storageKey)));

  return box && { width: box.width, height: box.height };
}

const legacyKeyOf = (storageKey: string) =>
  storageKey.replace(/\.window$/, '.box');

/**
 * Where a window opens when nothing is remembered for it: below everything its
 * container holds. **This assumes the container is the app's chrome** — the
 * info bar and the toolbars — which is what it is for all three panels; the
 * windows themselves are positioned and add nothing to its height. Somewhere
 * full-height it would answer "below the screen", and the clamp would drop the
 * window to the bottom edge.
 *
 * Measured once, as it opens. A toolbar arriving afterwards (they are their own
 * lazy chunks) is not moved out of the way of, and neither is a window already
 * open: two windows opened together land on top of each other, and the answer
 * is to drag one. Keeping out of their way meant reimplementing block layout in
 * JavaScript — a registry of open windows, an ordering rule, a sibling walk and
 * an observer over the container — which cost far more than it bought.
 */
function defaultTop(el: HTMLElement): number {
  // The bottom edge, not the height, since the container starts below the top
  // of the viewport as often as not.
  const parent = el.parentElement;

  return parent ? parent.getBoundingClientRect().bottom + EDGE_GAP : EDGE_GAP;
}

/**
 * Half the viewport, never below what the content needs nor past its edges —
 * the same inset the layout clamps to, so a window doesn't open two pixels
 * wider than it is allowed to be and get pulled back on its first fit.
 */
export function halfViewportSize() {
  return {
    width: Math.min(
      Math.max(window.innerWidth / 2, 400),
      Math.max(window.innerWidth - 2 * EDGE_GAP, 40),
    ),
    // Not `EDGE_GAP`: this leaves room for the controls along the bottom of the
    // map, which a window opening full height would cover.
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
  /** The panel's own classes, added to the ones every window carries. */
  boxClassName?: string;
};

/** Spread onto `FloatingWindowGrips`, which owns the markup and the drop rule. */
export type FloatingWindowGripProps = {
  fullscreen: boolean;
  moveHandleRef: RefObject<HTMLDivElement | null>;
  resizeHandleProps: {
    onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerUp: () => void;
    onPointerCancel: () => void;
    onLostPointerCapture: () => void;
  };
};

type FloatingWindow = FloatingWindowGripProps & {
  /** Spread onto the box element; both its geometry and its classes come from here. */
  boxProps: {
    ref: (el: HTMLDivElement | null) => void;
    className: string;
  };
  toggleFullscreen: () => void;
  /**
   * Spread onto the element holding everything below the content — the controls
   * row and the footer. Its height is what the content's is measured against,
   * and the flex column is load-bearing: through a plain block the rows' own
   * margins collapse out of that measurement while still being laid out.
   */
  bottomProps: {
    ref: (el: HTMLDivElement | null) => void;
    className: string;
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
  boxClassName,
}: Options): FloatingWindow {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  // Deliberately not remembered: a panel that reopened covering the map would
  // give no clue what had happened.
  const [fullscreen, setFullscreen] = useState(false);

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

  /**
   * Whether the gesture in progress has moved the box, so a press that went
   * nowhere writes nothing. A ref rather than a local, because the listener
   * effect is rebuilt whenever `persistBox` changes identity — answering the
   * cookie banner mid-drag does that — and a local would reset to `false` under
   * the finger, losing the position on release.
   */
  const draggedRef = useRef(false);

  const posRef = useRef([initialBox?.left ?? 0, initialBox?.top ?? 0]);

  // The geometry the user chose, which is also what gets stored; `null` until
  // the window has been placed. The live box can be smaller and shifted from it
  // to fit a window too small to hold it, and is put back to this much of it as
  // each window afterwards has room for.
  const chosenRef = useRef<Box | null>(initialBox);

  // Stored at the end of a gesture rather than on every move, so a drag writes
  // to storage once.
  const persistBox = useCallback(() => {
    setBox(chosenRef.current);

    // The entry the size came from goes only once the new key actually holds
    // something. `usePersistentState` writes nothing until cookie consent is
    // given, so dropping it unconditionally would delete the size on behalf of
    // a write that never happened — and dropping it as it was read would lose
    // it for any window closed before a first gesture.
    if (storage.getItem(storageKey)) {
      storage.removeItem(legacyKeyOf(storageKey));
    }
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
    // box no longer fits at all. The clamp is never written back over the
    // chosen box: a window pushed in by a narrowed browser has to return to
    // where it was put once the browser is widened again.
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

    ref.style.width = `${width}px`;

    ref.style.height = `${height}px`;

    ref.style.left = `${left}px`;

    ref.style.top = `${top}px`;
  }, [ref, minBoxHeight]);

  const raise = useCallback(() => {
    if (!ref) {
      return;
    }

    // An inline z-index wins whatever its value, so it would undercut the
    // class's own — which is what puts a full-screen panel above the rest.
    if (fullscreen) {
      ref.style.removeProperty('z-index');

      return;
    }

    for (const other of windows) {
      // Never demote a full-screen panel: its z-index comes from a class, which
      // any inline value beats, so this would put a half-viewport window over
      // one covering the screen.
      if (
        other !== ref &&
        !other.classList.contains(windowClasses.fullscreen)
      ) {
        other.style.zIndex = '1';
      }
    }

    ref.style.zIndex = '2';
  }, [ref, fullscreen]);

  // Capture phase, so a control that stops the event still raises its window;
  // `pointerdown`, so a drag or resize raises it as it starts.
  useEffect(() => {
    if (!ref) {
      return;
    }

    windows.add(ref);

    raise();

    ref.addEventListener('pointerdown', raise, true);

    return () => {
      windows.delete(ref);

      ref.removeEventListener('pointerdown', raise, true);
    };
  }, [ref, raise]);

  // Laid out before paint, since the box has no geometry at all until this
  // runs.
  useLayoutEffect(() => {
    if (!ref) {
      return;
    }

    chosenRef.current ??= {
      left: EDGE_GAP,
      top: defaultTop(ref),
      ...defaultSizeOnce(),
    };

    fitIntoView();

    window.addEventListener('resize', fitIntoView);

    return () => window.removeEventListener('resize', fitIntoView);
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

    // Or the gesture drags a text selection along behind it.
    e.preventDefault();

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

      // Only the size: a resize doesn't move the box, and taking the position
      // from `posRef` would take it clamped — a window pushed in by a narrowed
      // browser would then keep the pushed-in coordinate and never return to
      // where it was put once the browser was widened again.
      chosenRef.current = {
        ...(chosenRef.current ?? {
          left: posRef.current[0]!,
          top: posRef.current[1]!,
        }),
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
    const handleWindowPointerDown = (e: PointerEvent) => {
      // Only the grip drags the window: a press anywhere on the content is the
      // content's, which is how a finger does what a mouse does by hovering.
      if (
        e.target instanceof Node &&
        moveHandleRef.current?.contains(e.target)
      ) {
        // Or the drag extends a text selection across everything it crosses.
        e.preventDefault();

        startPosRef.current = [e.clientX, e.clientY];

        draggedRef.current = false;
      }
    };

    const handleWindowPointerUp = () => {
      if (!startPosRef.current) {
        return;
      }

      startPosRef.current = undefined;

      // A pointer that went down and up on the same spot moved nothing.
      if (draggedRef.current) {
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

      draggedRef.current = true;
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
    boxProps: {
      ref: setRef,
      className: clsx(
        windowClasses.window,
        // The column the content/footer split depends on, so it is the hook's
        // to impose rather than each panel's to remember.
        'd-flex flex-column',
        boxClassName,
        // Dropped rather than overridden: Bootstrap's utilities are
        // `!important` and a single class, so a rule undoing them would tie and
        // be settled by stylesheet order. `fm-fullscreen` is what the header
        // watches for (see `Main.module.css`); `pb-2` keeps the bottom row off
        // the edge of the screen while the content above it still runs to it.
        fullscreen
          ? [windowClasses.fullscreen, 'fm-fullscreen', 'pb-2']
          : ['p-2', 'rounded', 'shadow'],
      ),
    },
    fullscreen,
    toggleFullscreen: useCallback(() => setFullscreen((v) => !v), []),
    bottomProps: { ref: setFooterEl, className: 'd-flex flex-column' },
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
