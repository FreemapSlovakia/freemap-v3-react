import { useMessages } from '@features/l10n/l10nInjector.js';
import type { FloatingWindowGripProps } from '@shared/hooks/useFloatingWindow.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import clsx from 'clsx';
import type { ReactElement, ReactNode } from 'react';
import { Button } from 'react-bootstrap';
import { FaArrowsAlt } from 'react-icons/fa';
import { LuMoveDiagonal2 } from 'react-icons/lu';
import { MdFullscreen, MdFullscreenExit } from 'react-icons/md';
import classes from './FloatingWindow.module.css';
import { LongPressTooltip } from './LongPressTooltip.js';

/**
 * A panel's own controls, in one row along its bottom rather than up in the
 * tool toolbar: they belong to a panel that floats, and full screen would put
 * a toolbar up there out of reach entirely.
 *
 * The scroller the top toolbars use — so the row scrolls sideways rather than
 * wrapping into the content's height — but none of their chrome: the window is
 * already the box a toolbar would need.
 */
export function FloatingWindowControls({
  fullscreen,
  children,
}: {
  /** Full screen drops the panel's `p-2`, so the row insets itself instead. */
  fullscreen?: boolean;
  children: ReactNode;
}): ReactElement {
  const sc = useScrollClasses('horizontal');

  return (
    // The wrapper is what the scrolled-end fade anchors to — see
    // `controlsScroller` — so it carries the margins.
    <div className={clsx('position-relative mt-2', fullscreen && 'mx-2')}>
      <div
        className={clsx('fm-ib-scroller', classes.controlsScroller)}
        ref={sc}
      >
        <div />

        <div
          className={clsx(classes.controls, !fullscreen && classes.gripReserve)}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * The two grips every floating panel carries, and the rule that they go while
 * it is full screen — there is nothing left to move it to or resize it
 * against. Spread `gripProps` from `useFloatingWindow`.
 */
export function FloatingWindowGrips({
  fullscreen,
  moveHandleRef,
  resizeHandleProps,
  /** Extra class for a panel whose grips sit on a picture rather than on chrome. */
  gripClassName,
}: FloatingWindowGripProps & { gripClassName?: string }): ReactElement | null {
  return fullscreen ? null : (
    <>
      <div
        className={clsx(classes.moveHandle, gripClassName)}
        ref={moveHandleRef}
      >
        <FaArrowsAlt />
      </div>

      <div
        className={clsx(classes.resizeHandle, gripClassName)}
        {...resizeHandleProps}
      >
        <LuMoveDiagonal2 />
      </div>
    </>
  );
}

/**
 * What the full-screen control says and shows, for a panel that packs its
 * buttons into a menu and so needs the pair as props rather than as a button;
 * see `ResponsiveActions`. Shared with {@link FullscreenButton} so a panel that
 * folds cannot come to name it differently from one that doesn't.
 */
export function useFullscreenAction(fullscreen: boolean): {
  label: string | undefined;
  icon: ReactElement;
} {
  const m = useMessages();

  return {
    label: fullscreen ? m?.general.exitFullscreen : m?.general.fullscreen,
    icon: fullscreen ? <MdFullscreenExit /> : <MdFullscreen />,
  };
}

/** The same button in every panel that floats; see `useFloatingWindow`. */
export function FullscreenButton({
  fullscreen,
  onToggle,
  size,
}: {
  fullscreen: boolean;
  onToggle: () => void;
  size?: 'sm';
}): ReactElement {
  const { label, icon } = useFullscreenAction(fullscreen);

  return (
    <LongPressTooltip label={label}>
      {({ props }) => (
        <Button variant="secondary" size={size} onClick={onToggle} {...props}>
          {icon}
        </Button>
      )}
    </LongPressTooltip>
  );
}
