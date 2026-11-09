import { pickingModeSelector } from '@app/store/selectors.js';
import { ManualHeaderButton } from '@features/documents/components/ManualHeaderButton.js';
import { panToUncovered } from '@features/map/panToUncovered.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { LatLon } from '@shared/types/common.js';
import clsx from 'clsx';
import {
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { Offcanvas } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

// Below Bootstrap's `md` the panel docks at the bottom.
const narrowQuery = window.matchMedia('(max-width: 767.98px)');

function useNarrow(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      narrowQuery.addEventListener('change', onChange);

      return () => narrowQuery.removeEventListener('change', onChange);
    },
    () => narrowQuery.matches,
  );
}

// One panel docks at a time.
let docked: { node: HTMLElement; observer: ResizeObserver } | undefined;

/** How much of a phone's height the bottom panel takes. */
type Size = 'min' | 'half' | 'full';

// One size for all panels, for the session: they stay mounted once used, so a
// size of each one's own would reopen as it was left, not as last chosen.
let sharedSize: Size = 'half';

const sizeListeners = new Set<() => void>();

/** The user's choice, by a drag or a tap on a minimized panel. */
function setSize(next: Size) {
  trackMatomo(['trackEvent', 'Panel', 'size', next]);

  sharedSize = next;

  resizing(true);

  resizing(false);

  for (const listener of sizeListeners) {
    listener();
  }
}

function useSize(): Size {
  return useSyncExternalStore(
    (onChange) => {
      sizeListeners.add(onChange);

      return () => sizeListeners.delete(onChange);
    },
    () => sharedSize,
  );
}

/**
 * Has the app's controls make room for the panel: its size goes to
 * `--fm-dock-size` and `body` names its side. The map stays under it.
 */
function dock(node: HTMLElement, side: 'end' | 'bottom') {
  release();

  const observer = new ResizeObserver(() => {
    document.body.style.setProperty(
      '--fm-dock-size',
      `${side === 'end' ? node.offsetWidth : node.offsetHeight}px`,
    );
  });

  observer.observe(node);

  docked = { node, observer };

  document.body.classList.add(`fm-docked-${side}`);
}

/** Only the panel docked: one leaving mustn't undock another coming in. */
function undock(node: HTMLElement | null) {
  if (docked && docked.node === node) {
    release();
  }
}

let settling: ReturnType<typeof setTimeout> | undefined;

/**
 * While the panel is dragged or changes size, the controls making room follow
 * it frame by frame, so their own transition must be off.
 */
function resizing(on: boolean) {
  clearTimeout(settling);

  if (on) {
    document.body.classList.add('fm-dock-resizing');
  } else {
    // `.fm-dock`'s height transition.
    settling = setTimeout(
      () => document.body.classList.remove('fm-dock-resizing'),
      350,
    );
  }
}

function release() {
  clearTimeout(settling);

  document.body.classList.remove('fm-dock-resizing');

  docked?.observer.disconnect();

  docked = undefined;

  document.body.classList.remove('fm-docked-end', 'fm-docked-bottom');

  document.body.style.removeProperty('--fm-dock-size');
}

/** How far a pointer moves before a press on the header becomes a drag. */
const DRAG_SLOP = 6;

/** Screen heights per millisecond: faster, a drag throws to the next size. */
const FLICK = 0.0006;

type Drag = {
  startY: number;
  startHeight: number;
  /** The header's height, which minimized is. */
  minHeight: number;
  /** The last move, for the speed at release. */
  y: number;
  t: number;
  /** Upwards, in px/ms. */
  v: number;
  moving: boolean;
};

/** The size a drag let go at `h` (of the screen's height) settles to. */
function snap(h: number, v: number, min: number): Size {
  const heights: [Size, number][] = [
    ['min', min],
    ['half', 0.5],
    ['full', 1],
  ];

  const vs = v / window.innerHeight;

  if (vs > FLICK) {
    return heights.find(([, x]) => x > h)?.[0] ?? 'full';
  }

  if (vs < -FLICK) {
    return heights.findLast(([, x]) => x < h)?.[0] ?? 'min';
  }

  return heights.reduce((a, b) =>
    Math.abs(b[1] - h) < Math.abs(a[1] - h) ? b : a,
  )[0];
}

type Props<T> = {
  /** What the panel is about; a new one replaces the content in place. */
  item: T | null;
  /** Whether it is open; `item` alone by default. */
  show?: boolean;
  icon: ReactNode;
  /** The header: what kind of thing it is, as the body names the item. */
  label: ReactNode;
  /** The header while minimized, the body hidden: the item's name. */
  title: (item: T) => ReactNode;
  /** A line under the title while the panel is minimized to its header. */
  summary?: (item: T) => ReactNode;
  /** Marks beside the title while minimized, clipped once the title is short. */
  marks?: (item: T) => ReactNode;
  /** The manual chapter its header's book button opens, as a modal's does. */
  manual?: string;
  /** A place on the map to keep clear of the panel, panned to when hidden. */
  keepVisible?: (item: T) => LatLon | undefined;
  onClose: () => void;
  children: (item: T) => ReactNode;
};

/**
 * A panel over the map: on the right, or at the bottom of a phone. The app's
 * controls make room; the map runs under it.
 * Escape is the app's, as for any selection.
 */
export function DockPanel<T>({
  item,
  show = item !== null,
  icon,
  label,
  title,
  summary,
  marks,
  manual,
  keepVisible,
  onClose,
  children,
}: Props<T>): ReactElement | null {
  const dispatch = useDispatch();

  // Kept past closing, for the panel to slide out with its content.
  const [kept, setKept] = useState(item);

  const picking = useAppSelector(pickingModeSelector);

  if (item !== null && item !== kept) {
    setKept(item);
  } else if (!show && picking && kept !== null) {
    // Closed while a picking mode had it out of sight: no slide-out to wait for.
    setKept(null);
  }

  // Open but with no item yet: the next one is loading, and what shows is the
  // previous one's, which must not be acted on.
  const loading = show && item === null;

  const narrow = useNarrow();

  const side = narrow ? 'bottom' : 'end';

  const size = useSize();

  // Only at the bottom: on the side the map keeps its width beside it.
  const sized = side === 'bottom' ? size : 'half';

  // The side it has slid in on, so what it covers can be measured.
  const [enteredSide, setEnteredSide] = useState<'end' | 'bottom' | null>(null);

  const entered = enteredSide === side;

  const at = kept !== null ? keepVisible?.(kept) : undefined;

  // By value: a refreshed copy of the same item mustn't pan the map back.
  const lat = at?.lat;

  const lon = at?.lon;

  useEffect(() => {
    if (entered && lat !== undefined && lon !== undefined) {
      void panToUncovered(dispatch, { lat, lon }, { ifHidden: true });
    }
  }, [entered, lat, lon, dispatch]);

  const nodeRef = useRef<HTMLElement | null>(null);

  const drag = useRef<Drag | null>(null);

  // Set by a drag till the next press, so the click ending it is no tap.
  const dragged = useRef(false);

  // Come to half, the panel pans the place out from under it, once laid out:
  // from minimized it covered less, from full screen there was no map to pan
  // into. A header-high one doesn't animate, but one let go of a drag does.
  const shownSize = useRef(sized);

  useEffect(() => {
    const was = shownSize.current;

    shownSize.current = sized;

    if (
      was === sized ||
      sized !== 'half' ||
      !entered ||
      lat === undefined ||
      lon === undefined
    ) {
      return;
    }

    const pan = () =>
      void panToUncovered(dispatch, { lat, lon }, { ifHidden: true });

    if (was === 'min' && !dragged.current) {
      const frame = requestAnimationFrame(pan);

      return () => cancelAnimationFrame(frame);
    }

    // `.fm-dock`'s height transition, and a frame.
    const timer = setTimeout(pan, 350);

    return () => clearTimeout(timer);
  }, [sized, entered, lat, lon, dispatch]);

  // Unhides the body while dragged up from minimized.
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (e: PointerEvent) => {
    dragged.current = false;

    const node = nodeRef.current;

    // Not while sliding in: the drag's `transition: none` would end the slide.
    if (
      side !== 'bottom' ||
      !entered ||
      !node ||
      !e.isPrimary ||
      e.button !== 0 ||
      (e.target instanceof Element && e.target.closest('button, a'))
    ) {
      return;
    }

    // A mouse is captured only when asked, and would select text on the way.
    e.currentTarget.setPointerCapture(e.pointerId);

    e.preventDefault();

    drag.current = {
      startY: e.clientY,
      startHeight: node.offsetHeight,
      // Minimized, the summary is part of it.
      minHeight:
        sized === 'min'
          ? node.offsetHeight
          : e.currentTarget.getBoundingClientRect().bottom -
            node.getBoundingClientRect().top,
      y: e.clientY,
      t: e.timeStamp,
      v: 0,
      moving: false,
    };
  };

  const onPointerMove = (e: PointerEvent) => {
    const d = drag.current;

    const node = nodeRef.current;

    if (!d || !node) {
      return;
    }

    if (!d.moving) {
      if (Math.abs(e.clientY - d.startY) < DRAG_SLOP) {
        return;
      }

      d.moving = true;

      dragged.current = true;

      node.style.transition = 'none';

      resizing(true);

      setDragging(true);
    }

    if (e.timeStamp > d.t) {
      d.v = (d.y - e.clientY) / (e.timeStamp - d.t);
    }

    d.y = e.clientY;

    d.t = e.timeStamp;

    node.style.height = `${Math.min(
      window.innerHeight,
      Math.max(d.minHeight, d.startHeight + d.startY - e.clientY),
    )}px`;
  };

  const endDrag = (e: PointerEvent) => {
    const d = drag.current;

    drag.current = null;

    const node = nodeRef.current;

    if (!d?.moving || !node) {
      return;
    }

    const vh = window.innerHeight;

    // Held still before letting go, it was no flick.
    const v = e.timeStamp - d.t > 100 ? 0 : d.v;

    const next =
      e.type === 'pointercancel'
        ? sized
        : snap(node.offsetHeight / vh, v, d.minHeight / vh);

    // Cleared in one go, so the height transitions from where it was let go.
    node.style.removeProperty('transition');

    node.style.removeProperty('height');

    resizing(false);

    setDragging(false);

    if (next !== sized) {
      setSize(next);
    }
  };

  // A tap on a minimized panel, but on its buttons, brings it back up.
  const restore = (e: MouseEvent) => {
    if (
      !dragged.current &&
      sized === 'min' &&
      !(e.target instanceof Element && e.target.closest('button, a'))
    ) {
      setSize('half');
    }
  };

  const dragProps =
    side === 'bottom'
      ? {
          onPointerDown,
          onPointerMove,
          onPointerUp: endDrag,
          onPointerCancel: endDrag,
          onLostPointerCapture: endDrag,
        }
      : {};

  useEffect(() => () => undock(nodeRef.current), []);

  if (kept === null) {
    return null;
  }

  return (
    <Offcanvas
      // Remounted on a new side, so it slides in from there.
      key={side}
      // A picking mode takes the map, the panel's side included.
      show={show && !picking}
      onEntering={(node: HTMLElement) => {
        nodeRef.current = node;

        dock(node, side);
      }}
      onEntered={() => setEnteredSide(side)}
      // The controls come back as the panel leaves, not after.
      onExit={(node: HTMLElement) => {
        undock(node);

        setEnteredSide(null);
      }}
      onExited={() => {
        if (!show) {
          setKept(null);
        }
      }}
      onHide={onClose}
      placement={side}
      backdrop={false}
      scroll
      enforceFocus={false}
      autoFocus={false}
      restoreFocus={false}
      keyboard={false}
      className={`fm-dock fm-dock-${sized}`}
    >
      <Offcanvas.Header
        closeButton
        className={clsx(
          'gap-2',
          side === 'bottom' && 'fm-dock-grab',
          sized === 'min' && 'fm-cursor-pointer',
          // The summary line follows close under it.
          sized === 'min' && summary && 'pb-1',
        )}
        onClick={restore}
        {...dragProps}
      >
        <Offcanvas.Title className="d-flex align-items-center gap-2 fs-6 fw-bold min-w-0">
          <span className="flex-shrink-0">{icon}</span>

          {/* One line, so a minimized panel stays a header. */}
          {/* Gives way first, to a few letters; then the marks are clipped. */}
          <span
            className="text-truncate"
            style={{ flexShrink: 100, minWidth: '4em' }}
          >
            {sized === 'min' ? title(kept) : label}
          </span>

          {sized === 'min' && marks && (
            <span className="d-flex overflow-hidden text-nowrap fw-normal">
              {marks(kept)}
            </span>
          )}
        </Offcanvas.Title>

        <div className="fm-dock-actions">
          {/* An embed offers no manual. */}
          {manual && !window.fmEmbedded && (
            <ManualHeaderButton chapter={manual} from="panel" />
          )}
        </div>
      </Offcanvas.Header>

      {sized === 'min' && summary && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: a phone's touch control
        <div
          className="px-3 pb-2 fm-cursor-pointer fm-dock-grab"
          onClick={restore}
          {...dragProps}
        >
          {summary(kept)}
        </div>
      )}

      <Offcanvas.Body
        className={loading ? 'pt-0 opacity-50' : 'pt-0'}
        // Hidden, not unmounted, so its state outlasts a minimize.
        hidden={sized === 'min' && !dragging}
        inert={loading}
      >
        {children(kept)}
      </Offcanvas.Body>
    </Offcanvas>
  );
}
