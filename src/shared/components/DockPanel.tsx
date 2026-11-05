import { pickingModeSelector } from '@app/store/selectors.js';
import { ManualHeaderButton } from '@features/documents/components/ManualHeaderButton.js';
import { panToUncovered } from '@features/map/panToUncovered.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { LatLon } from '@shared/types/common.js';
import {
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

type Props<T> = {
  /** What the panel is about; a new one replaces the content in place. */
  item: T | null;
  /** Whether it is open; `item` alone by default. */
  show?: boolean;
  icon: ReactNode;
  title: (item: T) => ReactNode;
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
      className="fm-dock"
    >
      <Offcanvas.Header closeButton className="gap-2">
        <Offcanvas.Title className="d-flex align-items-center gap-2 fs-6 fw-bold min-w-0">
          <span className="flex-shrink-0">{icon}</span>

          <span>{title(kept)}</span>
        </Offcanvas.Title>

        {/* An embed offers no manual. */}
        {manual && !window.fmEmbedded && (
          <ManualHeaderButton chapter={manual} from="panel" />
        )}
      </Offcanvas.Header>

      <Offcanvas.Body
        className={loading ? 'pt-0 opacity-50' : 'pt-0'}
        inert={loading}
      >
        {children(kept)}
      </Offcanvas.Body>
    </Offcanvas>
  );
}
