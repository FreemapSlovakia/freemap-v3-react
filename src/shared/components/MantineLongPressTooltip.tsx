import { Kbd, Tooltip } from '@mantine/core';
import {
  Fragment,
  MouseEvent,
  PointerEvent,
  ReactElement,
  ReactNode,
  Ref,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

type Props = {
  label?: ReactNode;
  delay?: number;
  breakpoint?: Breakpoint;
  kbd?: string;
  ref?: Ref<HTMLElement>;
  children: (props: {
    props: { ref?: Ref<any> } & Record<string, any>;
    label: ReactNode;
    labelClassName: string;
    labelHidden: boolean;
    kbdEl: ReactNode;
  }) => ReactElement;
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

export function MantineLongPressTooltip({
  label = '…',
  kbd,
  delay = 500,
  breakpoint,
  ref: forwardedRef,
  children,
  ...rest
}: Props) {
  const preventClickRef = useRef(false);

  const [show, setShow] = useState(false);

  const [labelHidden, setLabelHidden] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!breakpoint) {
      setLabelHidden(true);
      return;
    }

    const bp = breakpoint;

    function checkVisibility() {
      setLabelHidden(window.innerWidth < getMinWidthForBreakpoint(bp));
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

  const kbdParts = kbd?.split(' ') ?? [];

  const kbdEl = kbdParts.length
    ? kbdParts.map((k, i) => (
        <Fragment key={k}>
          {i > 0 && ' '}
          <Kbd>{k}</Kbd>
        </Fragment>
      ))
    : null;

  const tooltipKbdEl = kbdParts.map((k) => (
    <Fragment key={k}>
      {' '}
      <Kbd>{k}</Kbd>
    </Fragment>
  ));

  const trigger = children({
    props: {
      ...rest,
      ref: forwardedRef,
      onPointerEnter: handleStart,
      onPointerLeave: handleClear,
      onClickCapture: handleClickCapture,
      onContextMenuCapture: handleContextMenuCapture,
    },
    label,
    labelClassName: breakpoint ? `d-none d-${breakpoint}-inline` : 'd-none',
    labelHidden,
    kbdEl,
  });

  return (
    <Tooltip
      label={
        <>
          {label}
          {tooltipKbdEl}
        </>
      }
      opened={labelHidden && show}
      disabled={!labelHidden}
      position="top"
    >
      {trigger}
    </Tooltip>
  );
}
