import {
  MouseEvent,
  PointerEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Overlay, Tooltip } from 'react-bootstrap';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

type Props = {
  label?: ReactNode;
  delay?: number;
  breakpoint?: Breakpoint;
  title?: string;
  kbd?: string;
  children: (props: {
    props: {
      ref: (el: HTMLElement | null) => void;
      onPointerEnter: (e: PointerEvent) => void;
      onPointerLeave: (e: PointerEvent) => void;
      onClickCapture: (e: MouseEvent) => void;
      onContextMenuCapture: (e: MouseEvent) => void;
      title?: string;
    };
    label: ReactNode;
    labelClassName: string;
  }) => ReactNode;
};

function getMinWidthForBreakpoint(breakpoint: Breakpoint): number {
  switch (breakpoint) {
    case 'xs':
      return 0;
    case 'sm':
      return 576;
    case 'md':
      return 768;
    case 'lg':
      return 992;
    case 'xl':
      return 1200;
    case 'xxl':
      return 1400;
  }
}

export function LongPressTooltip({
  label = '…',
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
      if (!labelHidden || timeoutRef.current) {
        return;
      }

      const type = e.type;

      timeoutRef.current = setTimeout(() => {
        preventClickRef.current = type !== 'pointerenter';

        setShow(true);
      }, delay);
    },
    [delay, labelHidden],
  );

  const handleClear = useCallback((e: PointerEvent) => {
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
            {label} <kbd>{kbd}</kbd>
          </>
        ) : (
          label
        ),
        labelClassName: `d-none d-${breakpoint}-inline`,
      })}

      {target && labelHidden && (
        <Overlay target={target} show={show} placement="top" flip>
          {(props) => <Tooltip {...props}>{label}</Tooltip>}
        </Overlay>
      )}
    </>
  );
}
