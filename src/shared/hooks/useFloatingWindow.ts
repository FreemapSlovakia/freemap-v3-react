import { usePersistentState } from '@shared/hooks/usePersistentState.js';
import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
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

// The `m-2` margin the box keeps between its far edge and the viewport's.
const EDGE_GAP = 8;

// The `p-2` padding between the box's edges and its contents.
const BOX_PADDING = 8;

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
// `left`/`top` are the offset from where it opens, which is what the drag keeps.
type Box = { left: number; top: number; width: number; height: number };

const serializeBox = ({ left, top, width, height }: Box) =>
  [left, top, width, height].join(',');

// Anything but the four numbers written back — nothing stored yet, an entry
// tampered with — opens at the default size. A size remembered from a roomier
// window (a desktop browser since made narrow, a phone since rotated) comes
// back fitting the screen.
function makeDeserializeBox(
  defaultSize: () => { width: number; height: number },
) {
  return (value: string | null): Box => {
    const [left, top, width, height] = (value ?? '').split(',').map(Number);

    return [left, top, width, height].every(Number.isFinite)
      ? {
          left: left!,
          top: top!,
          width: clamp(width!, MIN_WIDTH, window.innerWidth - 2 * EDGE_GAP),
          height: clamp(height!, MIN_HEIGHT, window.innerHeight - 2 * EDGE_GAP),
        }
      : { left: 0, top: 0, ...defaultSize() };
  };
}

/** Half the viewport, never below what the content needs nor past its edges. */
function halfViewportSize() {
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
  /** Goes on the box element, which also wants `classes.window` and `pos`. */
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
  /** The box's offset from where it lands on its own; goes in its `style`. */
  pos: { left: number; top: number };
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

  // Stable, so `usePersistentState`'s setter — and everything keyed off it —
  // stays stable too.
  const [deserializeBox] = useState(() => makeDeserializeBox(defaultSize));

  // Where the window was left the last time it was moved or resized. Read as
  // it opens, and written at the end of each gesture; `chosenRef` carries it
  // in between.
  const [box, setBox] = usePersistentState<Box>(
    storageKey,
    serializeBox,
    deserializeBox,
  );

  const [initialBox] = useState(box);

  const moveHandleRef = useRef<HTMLDivElement>(null);

  const startPosRef = useRef<[number, number]>(undefined);

  const posRef = useRef([initialBox.left, initialBox.top]);

  const [pos, setPos] = useState({
    top: initialBox.top,
    left: initialBox.left,
  });

  // The geometry the user chose, which is also what gets stored. The live box
  // can be smaller and shifted from it to fit a window too small to hold it,
  // and is put back to this much of it as each window afterwards has room for.
  const chosenRef = useRef<Box>(initialBox);

  // Stored at the end of a gesture rather than on every move, so a drag writes
  // to storage once.
  const persistBox = useCallback(() => {
    setBox(chosenRef.current);
  }, [setBox]);

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
  const fitIntoView = useCallback(() => {
    if (!ref) {
      return;
    }

    const chosen = chosenRef.current;

    ref.style.width = `${clamp(
      chosen.width,
      MIN_WIDTH,
      window.innerWidth - 2 * EDGE_GAP,
    )}px`;

    ref.style.height = `${clamp(
      chosen.height,
      minBoxHeight(),
      window.innerHeight - 2 * EDGE_GAP,
    )}px`;

    // Where that size would sit at the chosen offset: the box is positioned
    // relative to where it lands on its own, which the current offset backs out
    // of the freshly laid out rectangle.
    const rect = ref.getBoundingClientRect();

    const left = rect.left - posRef.current[0]! + chosen.left;

    const top = rect.top - posRef.current[1]! + chosen.top;

    // Nudged as little as possible, and towards the top-left corner when the
    // box no longer fits at all.
    const dx = clamp(0, -left, window.innerWidth - (left + rect.width));

    const dy = clamp(0, -top, window.innerHeight - (top + rect.height));

    if (
      chosen.left + dx !== posRef.current[0] ||
      chosen.top + dy !== posRef.current[1]
    ) {
      posRef.current = [chosen.left + dx, chosen.top + dy];

      setPos({ left: posRef.current[0]!, top: posRef.current[1]! });
    }
  }, [ref, minBoxHeight]);

  // The geometry it opens with was measured against a window that may since
  // have changed, and the window keeps changing under it afterwards — rotate
  // the phone, drag the browser narrower — so it's refitted on both.
  useEffect(() => {
    if (!ref) {
      return;
    }

    fitIntoView();

    window.addEventListener('resize', fitIntoView);

    return () => window.removeEventListener('resize', fitIntoView);
  }, [ref, fitIntoView]);

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

      if (!start) {
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
        ...chosenRef.current,
        left: posRef.current[0]!,
        top: posRef.current[1]!,
      };

      setPos({ left: posRef.current[0], top: posRef.current[1] });

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
  }, [persistBox]);

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
    pos,
    width,
    height,
  };
}
