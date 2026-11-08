import { pickingModeSelector } from '@app/store/selectors.js';
import { ManualHeaderButton } from '@features/documents/components/ManualHeaderButton.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { panToUncovered } from '@features/map/panToUncovered.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { LatLon } from '@shared/types/common.js';
import clsx from 'clsx';
import {
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { Button, Offcanvas } from 'react-bootstrap';
import {
  BsChevronDoubleDown,
  BsChevronDoubleUp,
  BsChevronDown,
  BsChevronUp,
} from 'react-icons/bs';
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

type SizeButtonDef = {
  to: Size;
  label: 'minimize' | 'collapse' | 'expand' | 'maximize';
  icon: ReactElement;
};

// Bootstrap Icons, as the × is, enlarged and thickened to its larger, heavier x-lg.
const CHEVRON = { size: '1.2em', stroke: 'currentColor', strokeWidth: 0.6 };

// Per size, a step each way it can go and, from either end, a jump to the other.
const SIZE_BUTTONS: Record<Size, SizeButtonDef[]> = {
  min: [
    { to: 'half', label: 'expand', icon: <BsChevronUp {...CHEVRON} /> },
    { to: 'full', label: 'maximize', icon: <BsChevronDoubleUp {...CHEVRON} /> },
  ],
  half: [
    { to: 'min', label: 'collapse', icon: <BsChevronDown {...CHEVRON} /> },
    { to: 'full', label: 'expand', icon: <BsChevronUp {...CHEVRON} /> },
  ],
  full: [
    {
      to: 'min',
      label: 'minimize',
      icon: <BsChevronDoubleDown {...CHEVRON} />,
    },
    { to: 'half', label: 'collapse', icon: <BsChevronDown {...CHEVRON} /> },
  ],
};

// One size for all panels, for the session: they stay mounted once used, so a
// size of each one's own would reopen as it was left, not as last chosen.
let sharedSize: Size = 'half';

const sizeListeners = new Set<() => void>();

/** The user's choice, by ▼, ▲ or a tap on a minimized panel. */
function setSize(next: Size) {
  trackMatomo(['trackEvent', 'Panel', 'size', next]);

  sharedSize = next;

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

function release() {
  docked?.observer.disconnect();

  docked = undefined;

  document.body.classList.remove('fm-docked-end', 'fm-docked-bottom');

  document.body.style.removeProperty('--fm-dock-size');
}

function SizeButton({
  label,
  icon,
  onClick,
}: {
  label: ReactNode;
  icon: ReactNode;
  onClick: () => void;
}): ReactElement {
  return (
    <LongPressTooltip label={label}>
      {({ props }) => (
        <Button
          variant="link"
          className="fm-header-glyph"
          onClick={onClick}
          {...props}
        >
          {icon}
        </Button>
      )}
    </LongPressTooltip>
  );
}

type Props<T> = {
  /** What the panel is about; a new one replaces the content in place. */
  item: T | null;
  /** Whether it is open; `item` alone by default. */
  show?: boolean;
  icon: ReactNode;
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

  const m = useMessages();

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

  // Come to half, the panel pans the place out from under it, once laid out:
  // from minimized it covered less, from full screen there was no map to pan
  // into. A header-high one doesn't animate, so from it a frame is enough.
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

    if (was === 'min') {
      const frame = requestAnimationFrame(pan);

      return () => cancelAnimationFrame(frame);
    }

    // `.fm-dock`'s height transition, and a frame.
    const timer = setTimeout(pan, 350);

    return () => clearTimeout(timer);
  }, [sized, entered, lat, lon, dispatch]);

  // A tap on a minimized panel, but on its buttons, brings it back up; ▲ is
  // the keyboard's way.
  const restore = (e: MouseEvent) => {
    if (
      sized === 'min' &&
      !(e.target instanceof Element && e.target.closest('button, a'))
    ) {
      setSize('half');
    }
  };

  const nodeRef = useRef<HTMLElement | null>(null);

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
          sized === 'min' && 'fm-cursor-pointer',
          // The summary line follows close under it.
          sized === 'min' && summary && 'pb-1',
        )}
        onClick={restore}
      >
        <Offcanvas.Title className="d-flex align-items-center gap-2 fs-6 fw-bold min-w-0">
          <span className="flex-shrink-0">{icon}</span>

          {/* One line, so a minimized panel stays a header. */}
          {/* Gives way first, to a few letters; then the marks are clipped. */}
          <span
            className="text-truncate"
            style={{ flexShrink: 100, minWidth: '4em' }}
          >
            {title(kept)}
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

          {side === 'bottom' &&
            SIZE_BUTTONS[sized].map(({ to, label, icon }) => (
              <SizeButton
                key={to}
                label={m?.general[label]}
                icon={icon}
                onClick={() => setSize(to)}
              />
            ))}
        </div>
      </Offcanvas.Header>

      {sized === 'min' && summary && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: ▲ is the keyboard's way
        <div className="px-3 pb-2 fm-cursor-pointer" onClick={restore}>
          {summary(kept)}
        </div>
      )}

      <Offcanvas.Body
        className={loading ? 'pt-0 opacity-50' : 'pt-0'}
        // Hidden, not unmounted, so its state outlasts a minimize.
        hidden={sized === 'min'}
        inert={loading}
      >
        {children(kept)}
      </Offcanvas.Body>
    </Offcanvas>
  );
}
