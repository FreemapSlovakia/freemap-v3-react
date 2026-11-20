import clsx from 'clsx';
import { type ReactElement, type ReactNode, useEffect, useRef } from 'react';
import classes from './ClickableRow.module.css';

/** A table row acting on a click and telling `onHover` of a mouse over it, also on unmounting. */
export function ClickableRow({
  active,
  className,
  onClick,
  onHover,
  children,
}: {
  active?: boolean;
  className?: string;
  onClick?: () => void;
  onHover?: (hovered: boolean) => void;
  children: ReactNode;
}): ReactElement {
  const hovered = useRef(false);

  const latest = useRef(onHover);

  useEffect(() => {
    latest.current = onHover;
  });

  useEffect(
    () => () => {
      if (hovered.current) {
        latest.current?.(false);
      }
    },
    [],
  );

  const hover = (on: boolean) => {
    hovered.current = on;

    onHover?.(on);
  };

  return (
    <tr
      className={clsx(className, active && classes.selected)}
      style={onClick && { cursor: 'pointer' }}
      onClick={onClick}
      // A mouse's only: a tap enters without ever leaving.
      onPointerEnter={
        onHover && ((e) => e.pointerType === 'mouse' && hover(true))
      }
      onPointerLeave={
        onHover && ((e) => e.pointerType === 'mouse' && hover(false))
      }
    >
      {children}
    </tr>
  );
}
