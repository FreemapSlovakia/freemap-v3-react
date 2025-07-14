import {
  MouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Overlay, Tooltip } from 'react-bootstrap';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'never' | 'always';

type Props = {
  label?: ReactNode;
  delay?: number;
  breakpoint: Breakpoint;
  title?: string;
  kbd?: string;
  children: (props: {
    ref: (el: HTMLElement | null) => void;
    onMouseDown: () => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
    onTouchStart: () => void;
    onTouchEnd: () => void;
    onTouchCancel: () => void;
    onClickCapture: (e: MouseEvent) => void;
    onContextMenuCapture: (e: MouseEvent) => void;
    title?: string;
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
    case 'never':
      return -Infinity;
    case 'always':
      return Infinity;
  }
}

export function LongPressTooltip({
  label = '…',
  kbd,
  title,
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
    if (breakpoint === 'never') {
      setLabelHidden(true);
      return;
    }

    if (breakpoint === 'always') {
      setLabelHidden(true);
      return;
    }

    function checkVisibility() {
      setLabelHidden(window.innerWidth < getMinWidthForBreakpoint(breakpoint));
    }

    checkVisibility();

    window.addEventListener('resize', checkVisibility);

    return () => window.removeEventListener('resize', checkVisibility);
  }, [breakpoint]);

  const handleStart = useCallback(() => {
    if (labelHidden) {
      timeoutRef.current = setTimeout(() => {
        preventClickRef.current = true;

        setShow(true);
      }, delay);
    }
  }, [delay, labelHidden]);

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
    }
  }, []);

  const handleContextMenuCapture = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <>
      {children({
        ref: (el) => {
          setTarget(el);
        },
        onMouseDown: handleStart,
        onMouseUp: handleClear,
        onMouseLeave: handleClear,
        onTouchStart: handleStart,
        onTouchEnd: handleClear,
        onTouchCancel: handleClear,
        onClickCapture: handleClickCapture,
        onContextMenuCapture: handleContextMenuCapture,
        title: !labelHidden
          ? undefined
          : (title ?? (typeof label === 'string' ? label : undefined)),
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
