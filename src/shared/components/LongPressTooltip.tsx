import {
  type Breakpoint,
  getMinWidthForBreakpoint,
} from '@shared/breakpoints.js';
import {
  createContext,
  Fragment,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Overlay, Tooltip } from 'react-bootstrap';

const InTooltip = createContext(false);

/**
 * Whether this is a tooltip's own body. A mark rendered there is already being
 * explained, so it drops to its glyph rather than offering a tooltip of its own
 * — see `GlyphMarker`.
 */
export function useInTooltip(): boolean {
  return useContext(InTooltip);
}

type Props = {
  label?: ReactNode;
  /**
   * Name of the control. When set, the tooltip shows on hover/long-press even
   * while the inline label is visible: expanded it reads as `name`, collapsed as
   * `name: label` (so the hidden value stays discoverable).
   */
  name?: ReactNode;
  delay?: number;
  breakpoint?: Breakpoint;
  kbd?: string;
  children: (props: {
    props: {
      ref: (el: HTMLElement | null) => void;
      onPointerEnter: (e: PointerEvent) => void;
      onPointerLeave: (e: PointerEvent) => void;
      onClickCapture: (e: MouseEvent) => void;
      onContextMenuCapture: (e: MouseEvent) => void;
    };
    label: ReactNode;
    labelClassName: string;
  }) => ReactNode;
};

export function LongPressTooltip({
  label = '…',
  name,
  kbd,
  delay = 500,
  breakpoint,
  children,
}: Props) {
  const preventClickRef = useRef(false);

  const [show, setShow] = useState(false);

  const [target, setTarget] = useState<HTMLElement | null>(null);

  const [labelHidden, setLabelHidden] = useState(false);

  // Whether the pointer that opened the tooltip was a finger or a stylus, which
  // covers the control it points at and so needs the tooltip pushed clear of it.
  const [coarse, setCoarse] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!breakpoint) {
      setLabelHidden(true);
      return;
    }

    const breakpoint1 = breakpoint;

    function checkVisibility() {
      setLabelHidden(window.innerWidth < getMinWidthForBreakpoint(breakpoint1));
    }

    checkVisibility();

    window.addEventListener('resize', checkVisibility);

    return () => window.removeEventListener('resize', checkVisibility);
  }, [breakpoint]);

  const handleStart = useCallback(
    (e: PointerEvent) => {
      setCoarse(e.pointerType === 'touch' || e.pointerType === 'pen');

      if ((!labelHidden && name == null) || timeoutRef.current) {
        return;
      }

      const type = e.type;

      timeoutRef.current = setTimeout(() => {
        preventClickRef.current = type !== 'pointerenter';

        setShow(true);
      }, delay);
    },
    [delay, labelHidden, name],
  );

  const handleClear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = null;

    setTimeout(() => {
      preventClickRef.current = false;
    });

    setShow(false);
  }, []);

  const handleClickCapture = useCallback((e: MouseEvent) => {
    if (preventClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
    } else {
      setShow(false);
    }
  }, []);

  const handleContextMenuCapture = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const kbdEl = (kbd?.split(' ') ?? []).map((kbd) => (
    <Fragment key={kbd}>
      {' '}
      <kbd>{kbd}</kbd>
    </Fragment>
  ));

  const tooltipBody =
    name == null ? (
      label
    ) : labelHidden ? (
      <>
        {name}: {label}
      </>
    ) : (
      name
    );

  // Undefined for a mouse, so the tooltip keeps Bootstrap's own offset.
  const offset = useMemo(
    () => (coarse ? ([0, 30] as [number, number]) : undefined),
    [coarse],
  );

  // Near the top edge the preferred `top` placement flips, and for a finger
  // `bottom` would land right under the fingertip; sidestep to a side first.
  const popperConfig = useMemo(
    () =>
      coarse
        ? {
            modifiers: [
              {
                name: 'flip',
                options: { fallbackPlacements: ['right', 'left', 'bottom'] },
              },
            ],
          }
        : undefined,
    [coarse],
  );

  return (
    <>
      {children({
        props: {
          ref: (el) => {
            setTarget(el);
          },
          onPointerEnter: handleStart,
          onPointerLeave: handleClear,
          onClickCapture: handleClickCapture,
          onContextMenuCapture: handleContextMenuCapture,
        },
        label: kbd ? (
          <>
            {label} {kbdEl}
          </>
        ) : (
          label
        ),
        labelClassName: `d-none d-${breakpoint}-inline`,
      })}

      {target && (labelHidden || name != null) && (
        <Overlay
          target={target}
          show={show}
          placement="top"
          flip
          offset={offset}
          popperConfig={popperConfig}
        >
          {(props) => (
            <Tooltip {...props}>
              <InTooltip value>
                {tooltipBody}
                {kbdEl}
              </InTooltip>
            </Tooltip>
          )}
        </Overlay>
      )}
    </>
  );
}
