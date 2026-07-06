import {
  type Breakpoint,
  getMinWidthForBreakpoint,
} from '@shared/breakpoints.js';
import {
  Fragment,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Overlay, Tooltip } from 'react-bootstrap';

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
        <Overlay target={target} show={show} placement="top" flip>
          {(props) => (
            <Tooltip {...props}>
              {tooltipBody}
              {kbdEl}
            </Tooltip>
          )}
        </Overlay>
      )}
    </>
  );
}
